import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CHARACTER_CODE_MAP } from './constants/character-map.constant';

const TOTAL_STAMP_SLOTS = 9;

@Injectable()
export class StampsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  // 설문조사 결과 캐릭터 배정/저장 (재설문 시 덮어씀)
  async assignCharacter(userId: number, code: string) {
    const character = CHARACTER_CODE_MAP[code];

    if (!character) {
      throw new BadRequestException('알 수 없는 캐릭터 코드입니다.');
    }

    const client = this.supabaseService.getClient();

    const { error } = await client
      .from('user_character')
      .upsert(
        {
          user_id: userId,
          character,
          assigned_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      );

    if (error) {
      throw new Error(error.message);
    }

    return { character };
  }

  // 내 캐릭터 + 스탬프 진행 상황 조회
  async getMyStamps(userId: number) {
    const client = this.supabaseService.getClient();

    const { data: userCharacter, error: characterError } = await client
      .from('user_character')
      .select('character')
      .eq('user_id', userId)
      .maybeSingle();

    if (characterError) {
      throw new Error(characterError.message);
    }

    if (!userCharacter) {
      throw new BadRequestException(
        '아직 설문조사를 통해 캐릭터가 배정되지 않았습니다.',
      );
    }

    const [
      travelerCount,
      stayCount,
      congestionCount,
      courseCompleteCount,
      nightCount,
      placeVerifyCount,
    ] = await Promise.all([
      this.countRewardType(client, userId, 'TRAVELER_VERIFY'),
      this.countRewardType(client, userId, 'STAY'),
      this.countRewardType(client, userId, 'CONGESTION'),
      this.countRewardType(client, userId, 'COURSE_COMPLETE'),
      this.countNightEventVerification(client, userId),
      this.countDistinctPlaceVisits(client, userId),
    ]);

    const progress = {
      TRAVELER_VERIFY: Math.min(travelerCount, 1),
      STAY: Math.min(stayCount, 1),
      CONGESTION: Math.min(congestionCount, 1),
      COURSE_COMPLETE: Math.min(courseCompleteCount, 1),
      NIGHT_EVENT: Math.min(nightCount, 1),
      PLACE_VERIFY: placeVerifyCount,
    };

    const rawTotal = Object.values(progress).reduce((sum, v) => sum + v, 0);
    const totalStamps = Math.min(rawTotal, TOTAL_STAMP_SLOTS);

    return {
      character: userCharacter.character,
      totalStamps,
      totalSlots: TOTAL_STAMP_SLOTS,
      openStamps: Array.from({ length: totalStamps }, (_, i) => i + 1),
      progress,
    };
  }

  private async countRewardType(
    client: any,
    userId: number,
    type: string,
  ): Promise<number> {
    const { count, error } = await client
      .from('reward_transaction')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('type', type);

    if (error) {
      throw new Error(error.message);
    }

    return count ?? 0;
  }

  private async countNightEventVerification(
    client: any,
    userId: number,
  ): Promise<number> {
    const { count, error } = await client
      .from('night_event_verification')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }

    return count ?? 0;
  }

  private async countDistinctPlaceVisits(
    client: any,
    userId: number,
  ): Promise<number> {
    const { data, error } = await client
      .from('stamp_tour_log')
      .select('place_id')
      .eq('user_id', userId)
      .eq('completed', true);

    if (error) {
      throw new Error(error.message);
    }

    const distinctPlaceIds = new Set(
      (data ?? []).map((row: any) => row.place_id),
    );

    return distinctPlaceIds.size;
  }
}
