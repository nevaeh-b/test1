import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { RewardType } from './enums/reward-type.enum';
import { RewardTable } from './constants/reward.constants';

@Injectable()
export class RewardsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  // 기본 조회

  async getBalance(userId: number) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('web_user')
      .select('reward_balance')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return {
      balance: data?.reward_balance ?? 0,
    };
  }

  async getHistory(userId: number) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('reward_transaction')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  // 기존 리워드 적립

  async earn(userId: number, amount: number, reason?: string) {
    if (amount <= 0) {
      throw new BadRequestException('적립 금액은 0보다 커야 합니다.');
    }

    const { balance } = await this.getBalance(userId);
    const newBalance = balance + amount;
    const client = this.supabaseService.getClient();

    const { error: updateError } = await client
      .from('web_user')
      .update({ reward_balance: newBalance })
      .eq('id', userId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    const { error: insertError } = await client
      .from('reward_transaction')
      .insert({
        user_id: userId,
        type: 'EARN',
        amount,
      });

    if (insertError) {
      throw new Error(insertError.message);
    }

    return {
      earned: amount,
      balance: newBalance,
      reason,
    };
  }

  // 리워드 전환

  async convert(userId: number, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('전환 금액은 0보다 커야 합니다.');
    }

    const { balance } = await this.getBalance(userId);

    if (balance < amount) {
      throw new BadRequestException('리워드 잔액이 부족합니다.');
    }

    const newBalance = balance - amount;
    const client = this.supabaseService.getClient();

    const { error: updateError } = await client
      .from('web_user')
      .update({ reward_balance: newBalance })
      .eq('id', userId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    const { error: insertError } = await client
      .from('reward_transaction')
      .insert({
        user_id: userId,
        type: 'CONVERT',
        amount,
      });

    if (insertError) {
      throw new Error(insertError.message);
    }

    return {
      converted: amount,
      balance: newBalance,
    };
  }

  // 관광객 인증 여부

  private async isVerifiedTourist(userId: number): Promise<boolean> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('traveler_verification')
      .select('id')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .limit(1);

    if (error) {
      throw new Error(error.message);
    }

    return data.length > 0;
  }

  // 다른 모듈(예: 숙박 예약)에서 여행객 인증 여부만 확인할 때 사용하는 공개 메서드

  async isVerifiedTraveler(userId: number): Promise<boolean> {
    return this.isVerifiedTourist(userId);
  }

  // 최근 30일 지급 여부 (PLACE_VERIFY 등 롤링 윈도우 기준이 필요한 타입에 사용)

  private async alreadyRewardedWithinMonth(
    userId: number,
    type: RewardType,
    referenceId?: number,
  ): Promise<boolean> {
    let query = this.supabaseService
      .getClient()
      .from('reward_transaction')
      .select('id')
      .eq('user_id', userId)
      .eq('type', type)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (referenceId !== undefined) {
      query = query.eq('reference_id', referenceId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data.length > 0;
  }

  // 특정 reference(예: traveler_verification_request 건)에 대해
  // 이미 리워드가 지급됐는지 정확히 1:1로 확인 (달력상 월 길이 오차 없음)

  private async alreadyRewardedForReference(
    userId: number,
    type: RewardType,
    referenceId?: number,
  ): Promise<boolean> {
    if (referenceId === undefined) {
      return false;
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('reward_transaction')
      .select('id')
      .eq('user_id', userId)
      .eq('type', type)
      .eq('reference_id', referenceId)
      .limit(1);

    if (error) {
      throw new Error(error.message);
    }

    return data.length > 0;
  }

  // 코스 완주 리워드

  private calculateCourseReward(verified: boolean, placeCount: number) {
    if (!verified) {
      return 500;
    }

    if (placeCount >= 12) {
      return 2500;
    }

    if (placeCount >= 8) {
      return 1800;
    }

    if (placeCount >= 5) {
      return 1300;
    }

    return 1000;
  }

  // 리워드 계산

  private calculateStayReward(nights: number) {
    // grantReward에서 이미 미인증 사용자를 차단하기 때문에
    // 이 지점까지 오면 항상 인증된 사용자입니다.
    return RewardTable[RewardType.STAY].verified * Math.max(nights, 1);
  }

  private calculateReward(
    type: RewardType,
    verified: boolean,
    quantity?: number,
  ) {
    if (type === RewardType.COURSE_COMPLETE) {
      return this.calculateCourseReward(verified, quantity ?? 0);
    }

    if (type === RewardType.STAY) {
      return this.calculateStayReward(quantity ?? 1);
    }

    const reward = RewardTable[type];

    if (verified) {
      return reward.verified;
    }

    if (reward.unverified === null) {
      throw new BadRequestException('관광객 인증이 필요합니다.');
    }

    return reward.unverified;
  }

  // 리워드 지급

  private async grantReward(
    userId: number,
    type: RewardType,
    referenceId?: number,
    quantity?: number,
  ) {
    const verified = await this.isVerifiedTourist(userId);

    // 관광객 인증 미션만 예외
    if (
      type !== RewardType.TRAVELER_VERIFY &&
      !verified &&
      RewardTable[type].unverified === null
    ) {
      throw new BadRequestException('관광객 인증이 필요합니다.');
    }

    // 중복 지급 방지
    // - TRAVELER_VERIFY: 이번 신청 건(traveler_verification_request.id)에 대해 이미 지급됐는지 정확히 확인
    // - PLACE_VERIFY: 30일 롤링 윈도우 기준 (기존 로직 유지)
    if (type === RewardType.TRAVELER_VERIFY) {
      const already = await this.alreadyRewardedForReference(
        userId,
        type,
        referenceId,
      );

      if (already) {
        throw new BadRequestException(
          '이미 이번 인증 건에 대한 리워드를 지급받았습니다.',
        );
      }
    } else if (type === RewardType.PLACE_VERIFY ||
      type === RewardType.CONGESTION) {
      const already = await this.alreadyRewardedWithinMonth(
        userId,
        type,
        referenceId,
      );

      if (already) {
        throw new BadRequestException(
          '이미 최근 30일 내 리워드를 지급받았습니다.',
        );
      }
    }

    const amount = this.calculateReward(type, verified, quantity);
    const { balance } = await this.getBalance(userId);
    const newBalance = balance + amount;
    const client = this.supabaseService.getClient();

    const { error: updateError } = await client
      .from('web_user')
      .update({ reward_balance: newBalance })
      .eq('id', userId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    const { error: insertError } = await client
      .from('reward_transaction')
      .insert({
        user_id: userId,
        type,
        amount,
        reference_id: referenceId,
        is_verified_tourist: verified,
      });

    if (insertError) {
      throw new Error(insertError.message);
    }

    return {
      amount,
      balance: newBalance,
    };
  }

  // 여행객 인증 승인 + 리워드 지급
  //
  // 자동 승인(UsersService.uploadTravelerDocument에서 confidence 임계값 통과 시)과
  // 수동/재검증 승인(UsersService.verifyTravelerDocument, approveTravelerDocument) 양쪽에서
  // 공통으로 호출되는 단일 진입점입니다.
  //
  // - 이미 유효한 traveler_verification이 있으면 새로 만들지 않고 재사용
  //   (예: 재인증 이전에 이미 다른 경로로 인증된 경우를 대비).
  // - reference_id = requestId(traveler_verification_request.id) 기준으로
  //   같은 신청 건에 대한 중복 지급을 막는다

  async approveTravelerVerification(userId: number, requestId: number) {
    const client = this.supabaseService.getClient();

    const { data: current, error: currentError } = await client
      .from('traveler_verification')
      .select('id, verified_at, expires_at')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (currentError) {
      throw new Error(currentError.message);
    }

    let travelerVerification = current;

    if (!travelerVerification) {
      const now = new Date();
      const expires = new Date(now);
      expires.setMonth(expires.getMonth() + 1);

      const { data: inserted, error: insertError } = await client
        .from('traveler_verification')
        .insert({
          user_id: userId,
          verified_at: now.toISOString(),
          expires_at: expires.toISOString(),
        })
        .select('id, verified_at, expires_at')
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      travelerVerification = inserted;
    }

    const reward = await this.grantReward(
      userId,
      RewardType.TRAVELER_VERIFY,
      requestId,
    );

    return {
      travelerVerification,
      ...reward,
    };
  }

  // 장소 인증

  async verifyPlace(userId: number, placeId: number) {
    const client = this.supabaseService.getClient();

    // 최근 30일 인증 여부 확인
    const already = await this.alreadyRewardedWithinMonth(
      userId,
      RewardType.PLACE_VERIFY,
      placeId,
    );

    if (already) {
      throw new BadRequestException('이미 최근 30일 내 인증한 장소입니다.');
    }

    // 장소 존재 확인
    const { data: place, error } = await client
      .from('place')
      .select('id')
      .eq('id', placeId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!place) {
      throw new BadRequestException('존재하지 않는 장소입니다.');
    }

    return this.grantReward(userId, RewardType.PLACE_VERIFY, placeId);
  }

  // 숙박 인증 완료 (1박당 리워드 지급)

  async verifyStay(userId: number, stayLogId: number) {
    const client = this.supabaseService.getClient();

    const { data: stay, error } = await client
      .from('stay_log')
      .select('id, user_id, check_in, check_out')
      .eq('id', stayLogId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!stay) {
      throw new BadRequestException('존재하지 않는 숙박 예약입니다.');
    }

    const nights = this.calculateNights(stay.check_in, stay.check_out);

    return this.grantReward(userId, RewardType.STAY, stayLogId, nights);
  }

  // 체크인/체크아웃 날짜로 박수 계산 (최소 1박)

  private calculateNights(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffMs = end.getTime() - start.getTime();
    const nights = Math.round(diffMs / (24 * 60 * 60 * 1000));

    return Math.max(nights, 1);
  }

  // 코스 완주

  async completeCourse(userId: number, courseRunId: number) {
    const client = this.supabaseService.getClient();

    const { count, error } = await client
      .from('course_run_place')
      .select('*', {
        count: 'exact',
        head: true,
      })
      .eq('course_run_id', courseRunId);

    if (error) {
      throw new Error(error.message);
    }

    return this.grantReward(
      userId,
      RewardType.COURSE_COMPLETE,
      courseRunId,
      count ?? 0,
    );
  }

  // 혼잡도 평가

    // 혼잡도 평가
  // 실제로 congestion_review에 평가를 남긴 적이 있어야만 리워드 지급 (30일 간격 dedup은 grantReward에서 처리)

  async submitCongestionReview(userId: number, placeId: number) {
    const client = this.supabaseService.getClient();

    const { data: review, error: reviewError } = await client
      .from('congestion_review')
      .select('id')
      .eq('user_id', userId)
      .eq('place_id', placeId)
      .limit(1)
      .maybeSingle();

    if (reviewError) {
      throw new Error(reviewError.message);
    }

    if (!review) {
      throw new BadRequestException(
        '먼저 해당 장소의 혼잡도 평가를 제출해주세요.',
      );
    }

    return this.grantReward(userId, RewardType.CONGESTION, placeId);
  }
}