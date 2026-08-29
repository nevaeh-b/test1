import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { THEME_TAG_IDS, THEME_LABELS } from '../recommendation/constants/theme.constant';
import { SaveCourseDto } from './dto/save-course.dto';

@Injectable()
export class CoursesService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(barrierFree?: boolean) {
    let query = this.supabaseService
      .getClient()
      .from('course')
      .select('*, course_tag(tag(*))');

    if (barrierFree !== undefined) {
      query = query.eq('is_barrier_free', barrierFree);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  }

  async findOne(id: number) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('course')
      .select(`
        *,
        course_tag(tag(*)),
        course_place(
          order_no,
          place(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);

    if (data?.course_place) {
      data.course_place.sort((a: any, b: any) => a.order_no - b.order_no);
    }

    return data;
  }

  async scrap(userId: number, courseId: number) {
    const { data: existing } = await this.supabaseService
      .getClient()
      .from('course_scrap')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (existing) {
      // 스크랩 취소 토글
      await this.supabaseService
        .getClient()
        .from('course_scrap')
        .delete()
        .eq('id', existing.id);
      return { scrapped: false };
    }

    const { error } = await this.supabaseService
      .getClient()
      .from('course_scrap')
      .insert({ user_id: userId, course_id: courseId });

    if (error) throw new Error(error.message);
    return { scrapped: true };
  }

  async saveCourse(userId: number, dto: SaveCourseDto) {
    const client = this.supabaseService.getClient();

    if (!dto.places || dto.places.length === 0) {
      throw new BadRequestException('저장할 장소가 없습니다.');
    }

    // 코스 이름 미지정 시 기본 이름 생성
    let name = dto.name?.trim();

    if (!name) {
      const primaryTheme = dto.themes?.[0];
      const themeLabel = primaryTheme ? THEME_LABELS[primaryTheme] : undefined;
      const prefix = themeLabel ? `${themeLabel} 코스` : '코스';

      const { count, error: countError } = await client
        .from('course')
        .select('id', { count: 'exact', head: true })
        .like('name', `${prefix} %`);

      if (countError) {
        throw new Error(countError.message);
      }

      name = `${prefix} ${(count ?? 0) + 1}`;
    }

    const placeCodes = dto.places.map((p) => p.place_code);

    // place_code 기반 place ID 매핑 조회
    const { data: places, error: placeError } = await client
      .from('place')
      .select('id, place_code')
      .in('place_code', placeCodes);

    if (placeError) {
      throw new Error(placeError.message);
    }

    const placeIdByCode = new Map<number, number>(
      (places ?? []).map((p: any) => [p.place_code, p.id]),
    );

    const missing = placeCodes.filter((code) => !placeIdByCode.has(code));

    if (missing.length > 0) {
      throw new BadRequestException(
        `존재하지 않는 장소가 포함되어 있습니다: ${missing.join(', ')}`,
      );
    }

    // 코스 생성
    const isBarrierFree =
      Array.isArray(dto.barrierFreeTypes) && dto.barrierFreeTypes.length > 0;

    const { data: course, error: courseError } = await client
      .from('course')
      .insert({
        name,
        is_barrier_free: isBarrierFree,
      })
      .select('id')
      .single();

    if (courseError) {
      throw new Error(courseError.message);
    }

    if (!course) {
      throw new Error('코스 생성에 실패했습니다.');
    }

    // 코스 내 장소 순서 매핑 및 일괄 등록
    const coursePlaceRows = dto.places.map((p) => ({
      course_id: course.id,
      place_id: placeIdByCode.get(p.place_code),
      order_no: p.order,
    }));

    const { error: coursePlaceError } = await client
      .from('course_place')
      .insert(coursePlaceRows);

    if (coursePlaceError) {
      await client.from('course').delete().eq('id', course.id);
      throw new Error(coursePlaceError.message);
    }

    // 테마 태그 매핑 및 등록
    if (dto.themes && dto.themes.length > 0) {
      const tagIds = [
        ...new Set(dto.themes.flatMap((theme) => THEME_TAG_IDS[theme] ?? [])),
      ];

      if (tagIds.length > 0) {
        const courseTagRows = tagIds.map((tagId) => ({
          course_id: course.id,
          tag_id: tagId,
        }));

        const { error: courseTagError } = await client
          .from('course_tag')
          .insert(courseTagRows);

        if (courseTagError) {
          throw new Error(courseTagError.message);
        }
      }
    }

    return this.findOne(course.id);
  }
}