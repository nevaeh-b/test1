import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CongestionService } from '../congestion/congestion.service';
import { RecommendDto } from './dto/recommend.dto';
import { GeminiService } from '../gemini/gemini.service';
import {
  THEME_TAG_IDS,
  NIGHT_THEME_CODE,
  BARRIER_FREE_TYPE_COLUMN,
  BARRIER_FREE_DETAIL_COLUMNS,
  COMMON_BARRIER_FREE_COLUMNS,
} from './constants/theme.constant';

@Injectable()
export class RecommendationService {
  constructor(
    private supabaseService: SupabaseService,
    private congestionService: CongestionService,
    private geminiService: GeminiService,
  ) {}

  async recommend(userId: number, dto: RecommendDto) {
    const supabase = this.supabaseService.getClient();

    if (!dto.themes || dto.themes.length === 0) {
      throw new BadRequestException('테마를 1개 이상 선택해주세요.');
    }

    // 숙소 정보 조회
    const { data: accommodation, error: accommodationError } = await supabase
      .from('place')
      .select(`
        id,
        place_code,
        name,
        region_code,
        latitude,
        longitude,
        addr1,
        addr2,
        firstimage
      `)
      .eq('place_code', dto.accommodationPlaceCode)
      .single();

    if (accommodationError) {
      throw new Error(accommodationError.message);
    }

    if (!accommodation) {
      return {
        recommended: null,
        message: '선택한 숙소를 찾을 수 없습니다.',
      };
    }

    // 테마 코드 및 카테고리 매핑
    const regularThemes = dto.themes.filter(
      (theme) => theme !== NIGHT_THEME_CODE,
    );
    const nightSelected = dto.themes.includes(NIGHT_THEME_CODE);

    const unknownThemes = regularThemes.filter(
      (theme) => !THEME_TAG_IDS[theme],
    );

    if (unknownThemes.length > 0) {
      throw new BadRequestException(
        `알 수 없는 테마입니다: ${unknownThemes.join(', ')}`,
      );
    }

    const tagIds = [
      ...new Set(
        regularThemes.flatMap((theme) => THEME_TAG_IDS[theme] ?? []),
      ),
    ];

    let categoryCodes: string[] = [];

    if (tagIds.length > 0) {
      const { data: tags, error: tagError } = await supabase
        .from('tag')
        .select('id, new_category_code')
        .in('id', tagIds);

      if (tagError) {
        throw new Error(tagError.message);
      }

      categoryCodes = (tags ?? [])
        .map((tag: any) => tag.new_category_code)
        .filter(Boolean);
    }

    // 무장애 필터링 및 상세 안내 데이터 구성
    let accessiblePlaceCodes: Set<number> | null = null;
    const barrierFreeDetailByCode = new Map<number, Record<string, string>>();

    if (dto.barrierFreeTypes && dto.barrierFreeTypes.length > 0) {
      const unknownTypes = dto.barrierFreeTypes.filter(
        (type) => !BARRIER_FREE_TYPE_COLUMN[type],
      );

      if (unknownTypes.length > 0) {
        throw new BadRequestException(
          `알 수 없는 무장애 유형입니다: ${unknownTypes.join(', ')}`,
        );
      }

      const flagColumns = dto.barrierFreeTypes.map(
        (type) => BARRIER_FREE_TYPE_COLUMN[type],
      );

      const detailColumns = [
        ...new Set([
          ...dto.barrierFreeTypes.flatMap(
            (type) => BARRIER_FREE_DETAIL_COLUMNS[type] ?? [],
          ),
          ...COMMON_BARRIER_FREE_COLUMNS,
        ]),
      ];

      const selectFields = [
        'place_code',
        ...flagColumns,
        ...detailColumns,
      ].join(', ');

      const { data: bftRows, error: bftError } = await supabase
        .from('barrier_free_type')
        .select(selectFields);

      if (bftError) {
        throw new Error(bftError.message);
      }

      accessiblePlaceCodes = new Set<number>();

      for (const row of bftRows ?? []) {
        const passesAllTypes = flagColumns.every(
          (column) => (row as any)[column] > 0,
        );

        if (!passesAllTypes) {
          continue;
        }

        accessiblePlaceCodes.add((row as any).place_code);

        const detail: Record<string, string> = {};

        for (const column of detailColumns) {
          const value = (row as any)[column];

          if (value) {
            detail[column] = value;
          }
        }

        barrierFreeDetailByCode.set((row as any).place_code, detail);
      }

      if (accessiblePlaceCodes.size === 0) {
        return {
          recommended: null,
          message: '선택한 무장애 조건을 모두 만족하는 장소가 없습니다.',
        };
      }
    }

    // 후보 장소 목록 조회 (일반/야간 테마 통합)
    const candidateMap = new Map<number, any>();

    // 1) 일반 테마 장소 조회
    if (categoryCodes.length > 0) {
      const { data, error } = await supabase
        .from('place')
        .select(`
          id,
          place_code,
          name,
          region_code,
          legal_dong_code,
          new_category_code,
          latitude,
          longitude,
          firstimage,
          addr1,
          addr2
        `)
        .in('new_category_code', categoryCodes);

      if (error) {
        throw new Error(error.message);
      }

      for (const place of data ?? []) {
        if (
          accessiblePlaceCodes &&
          !accessiblePlaceCodes.has(place.place_code)
        ) {
          continue;
        }

        candidateMap.set(place.id, {
          ...place,
          hasNightEvent: false,
          barrierFreeInfo:
            barrierFreeDetailByCode.get(place.place_code) ?? null,
        });
      }
    }

    // 2) 야간 테마 장소 조회
    if (nightSelected) {
      const { data: nightRows, error: nightError } = await supabase
        .from('night_event')
        .select('place_id');

      if (nightError) {
        throw new Error(nightError.message);
      }

      const nightPlaceIds = [
        ...new Set((nightRows ?? []).map((row: any) => row.place_id)),
      ];

      if (nightPlaceIds.length > 0) {
        const { data: nightPlaces, error: nightPlaceError } = await supabase
          .from('place')
          .select(`
            id,
            place_code,
            name,
            region_code,
            legal_dong_code,
            new_category_code,
            latitude,
            longitude,
            firstimage,
            addr1,
            addr2
          `)
          .in('id', nightPlaceIds);

        if (nightPlaceError) {
          throw new Error(nightPlaceError.message);
        }

        for (const place of nightPlaces ?? []) {
          if (
            accessiblePlaceCodes &&
            !accessiblePlaceCodes.has(place.place_code)
          ) {
            continue;
          }

          const existing = candidateMap.get(place.id);

          candidateMap.set(place.id, {
            ...(existing ?? place),
            hasNightEvent: true,
            barrierFreeInfo:
              existing?.barrierFreeInfo ??
              barrierFreeDetailByCode.get(place.place_code) ??
              null,
          });
        }
      }
    }

    // 숙소 제외
    let places = Array.from(candidateMap.values()).filter(
      (place: any) => place.place_code !== accommodation.place_code,
    );

    if (places.length === 0) {
      return {
        recommended: null,
        message: '선택한 조건에 맞는 장소가 없습니다.',
      };
    }

    // 숙소 기준 거리 계산
    const placesWithDistance = places.map((place: any) => {
      let distance: number | null = null;

      if (
        accommodation.latitude !== null &&
        accommodation.longitude !== null &&
        place.latitude !== null &&
        place.longitude !== null
      ) {
        distance = this.calculateDistance(
          accommodation.latitude,
          accommodation.longitude,
          place.latitude,
          place.longitude,
        );
      }

      return {
        ...place,
        distanceFromAccommodation: distance,
      };
    });

    // 지역별 혼잡도 조회
    const regionCodes = [
      ...new Set(
        placesWithDistance
          .map((place: any) => place.region_code)
          .filter((code: any) => code !== null && code !== undefined),
      ),
    ];

    const congestionMap = new Map<number, number>();

    await Promise.all(
      regionCodes.map(async (regionCode) => {
        const result = await this.congestionService.getByRegion(regionCode);

        if (result.congestionLevel !== null) {
          congestionMap.set(regionCode, result.congestionLevel);
        }
      }),
    );

    const placesWithCongestion = placesWithDistance.map((place: any) => ({
      ...place,
      congestionLevel: congestionMap.get(place.region_code) ?? 3,
    }));

    const userCondition = {
      transportation: dto.transportation,
      themes: dto.themes,
      barrierFreeTypes: dto.barrierFreeTypes ?? [],
    };

    // 코스 추천 생성
    const recommendedCourse = await this.geminiService.recommendCourse(
      accommodation,
      placesWithCongestion,
      userCondition,
    );

    // 추천 이력 저장
    await supabase.from('recommendation_log').insert({
      user_id: userId,
      selected_tags: dto.themes.join(','),
      recommended_course_id: null,
      reason: '코스 추천 생성',
    });

    return {
      accommodation,
      conditions: userCondition,
      recommended: recommendedCourse,
    };
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const earthRadius = 6371;
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Number((earthRadius * c).toFixed(2));
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}