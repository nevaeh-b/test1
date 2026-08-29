import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { GeminiService } from '../gemini/gemini.service';
import { RewardsService } from '../rewards/rewards.service';

const AUTO_APPROVE_CONFIDENCE = 0.9;

@Injectable()
export class StayService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly geminiService: GeminiService,
    private readonly rewardsService: RewardsService,
  ) {}

  // 숙박 예약 증빙 제출
  // - 여행객 인증(traveler_verification)이 유효한 사용자만 제출 가능
  // - 사진에서 체크인/체크아웃 날짜를 Gemini로 추출
  // - confidence >= 0.9 && valid → 즉시 stay_log 생성 + 리워드 지급
  // - 그 외 → PENDING으로 접수, 관리자 확인 대기 (stay_log는 아직 생성하지 않음)

  async submitStayReservation(
    userId: number,
    placeId: number,
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('예약 증빙 이미지를 업로드해주세요.');
    }

    const verified = await this.rewardsService.isVerifiedTraveler(userId);

    if (!verified) {
      throw new BadRequestException(
        '여행객 인증을 완료한 사용자만 숙박 예약이 가능합니다.',
      );
    }

    const client = this.supabaseService.getClient();

    // 장소 존재 확인
    const { data: place, error: placeError } = await client
      .from('place')
      .select('id')
      .eq('id', placeId)
      .maybeSingle();

    if (placeError) {
      throw new Error(placeError.message);
    }

    if (!place) {
      throw new BadRequestException('존재하지 않는 장소입니다.');
    }

    // Gemini로 예약 확인서 분석 (체크인/체크아웃 추출)
    const result = await this.geminiService.verifyStayReservation(
      file.buffer,
      file.mimetype,
    );

    if (!result.valid) {
      throw new BadRequestException(
        '업로드한 이미지에서 숙소 예약 확인서를 인식하지 못했습니다. 체크인/체크아웃 날짜가 잘 보이는 이미지를 업로드해주세요.',
      );
    }

    // 증빙 이미지 업로드
    const documentUrl = await this.supabaseService.uploadStayVerification(
      userId,
      file,
    );

    const autoApprove = result.confidence >= AUTO_APPROVE_CONFIDENCE;
    const now = new Date();

    const { data: request, error: insertRequestError } = await client
      .from('stay_verification_request')
      .insert({
        user_id: userId,
        place_id: placeId,
        document_url: documentUrl,
        check_in: result.checkIn,
        check_out: result.checkOut,
        status: autoApprove ? 'APPROVED' : 'PENDING',
        ai_result: result,
        reviewed_at: autoApprove ? now.toISOString() : null,
      })
      .select('id, user_id, place_id, check_in, check_out, status')
      .single();

    if (insertRequestError) {
      throw new Error(insertRequestError.message);
    }

    if (!autoApprove) {
      return {
        status: 'PENDING' as const,
        message: '자동 승인 기준을 충족하지 못해 관리자 확인 후 처리됩니다.',
        request,
        reason: result.reason,
      };
    }

    const stay = await this.createStayLogAndReward(userId, request);

    return {
      status: 'APPROVED' as const,
      ...stay,
    };
  }

  // 관리자 수동 승인

  async approveStayVerification(requestId: number) {
    const client = this.supabaseService.getClient();

    const { data: request, error } = await client
      .from('stay_verification_request')
      .select('id, user_id, place_id, check_in, check_out, status')
      .eq('id', requestId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!request) {
      throw new BadRequestException('존재하지 않는 숙박 인증 요청입니다.');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('이미 처리된 인증 요청입니다.');
    }

    if (!request.check_in || !request.check_out) {
      throw new BadRequestException(
        '체크인/체크아웃 날짜가 확인되지 않아 승인할 수 없습니다.',
      );
    }

    const { error: updateError } = await client
      .from('stay_verification_request')
      .update({
        status: 'APPROVED',
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return this.createStayLogAndReward(request.user_id, request);
  }

  // 관리자 반려

  async rejectStayVerification(requestId: number) {
    const client = this.supabaseService.getClient();

    const { data: request, error } = await client
      .from('stay_verification_request')
      .select('id, status')
      .eq('id', requestId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!request) {
      throw new BadRequestException('존재하지 않는 숙박 인증 요청입니다.');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('이미 처리된 인증 요청입니다.');
    }

    const { error: updateError } = await client
      .from('stay_verification_request')
      .update({
        status: 'REJECTED',
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return { status: 'REJECTED' as const };
  }

  // stay_log 생성 + RewardsService를 통한 리워드 지급 (자동승인/수동승인 공통)

  private async createStayLogAndReward(
    userId: number,
    request: {
      id: number;
      place_id: number;
      check_in: string | null;
      check_out: string | null;
    },
  ) {
    const client = this.supabaseService.getClient();

    const { data: stay, error: insertStayError } = await client
      .from('stay_log')
      .insert({
        user_id: userId,
        place_id: request.place_id,
        check_in: request.check_in,
        check_out: request.check_out,
      })
      .select('id, user_id, place_id, check_in, check_out')
      .single();

    if (insertStayError) {
      throw new Error(insertStayError.message);
    }

    const reward = await this.rewardsService.verifyStay(userId, stay.id);

    return {
      stay,
      reward: {
        amount: reward.amount,
        balance: reward.balance,
      },
    };
  }
}