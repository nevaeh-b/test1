import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { RewardsService } from '../rewards/rewards.service';

@Injectable()
export class PlaceVisitService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly rewardsService: RewardsService,
  ) {}

  async verify(
    userId: number,
    placeId: number,
    verified: boolean,
    coursePlaceId?: number,
  ) {
    const client = this.supabaseService.getClient();

    const { data: place, error: placeError } = await client
      .from('place')
      .select('id, name')
      .eq('id', placeId)
      .maybeSingle();

    if (placeError) {
      throw new Error(placeError.message);
    }

    if (!place) {
      throw new BadRequestException('존재하지 않는 장소입니다.');
    }

    // 방문 인증 로그 기록
    const { data: log, error: logError } = await client
      .from('stamp_tour_log')
      .insert({
        user_id: userId,
        course_place_id: coursePlaceId ?? null,
        place_id: placeId,
        photo_url: null,
        completed: verified === true,
        created_at: new Date().toISOString(),
      })
      .select('id, place_id, completed, created_at')
      .single();

    if (logError) {
      throw new Error(logError.message);
    }

    if (verified !== true) {
      return {
        success: false,
        place: { id: place.id, name: place.name },
        log,
        message: '위치 인증에 실패했습니다. 장소 근처에서 다시 시도해주세요.',
      };
    }

    // 리워드 적립 처리
    let reward: { amount: number; balance: number } | null = null;

    try {
      reward = await this.rewardsService.verifyPlace(userId, placeId);
    } catch (error) {
      reward = null;
    }

    return {
      success: true,
      place: { id: place.id, name: place.name },
      log,
      reward,
      message: reward
        ? '장소 방문 인증에 성공하여 리워드가 지급되었습니다.'
        : '장소 방문 인증에 성공했습니다. (이번 리워드는 이미 지급된 적이 있어 생략되었습니다)',
    };
  }
}