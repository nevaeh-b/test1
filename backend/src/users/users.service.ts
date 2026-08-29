import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SupabaseService } from '../supabase/supabase.service';
import { GeminiService } from '../gemini/gemini.service';
import { RewardsService } from '../rewards/rewards.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PhoneVerificationService } from '../phone-verification/phone-verification.service';

const AUTO_APPROVE_CONFIDENCE = 0.9;

export type SocialProvider = 'KAKAO' | 'GOOGLE' | 'NAVER';

@Injectable()
export class UsersService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly jwtService: JwtService,
    private readonly geminiService: GeminiService,
    private readonly rewardsService: RewardsService,
    private readonly phoneVerificationService: PhoneVerificationService,
  ) {}

  async signup(dto: SignupDto, profileImageFile?: Express.Multer.File) {
    const { data: existing } = await this.supabaseService
      .getClient()
      .from('web_user')
      .select('id')
      .eq('email', dto.email)
      .maybeSingle();

    if (existing) {
      throw new ConflictException('이미 가입된 이메일입니다.');
    }

        if (!dto.phoneNumber) {
      throw new BadRequestException('휴대폰 번호가 필요합니다.');
    }

    const { data: existingPhone } = await this.supabaseService
      .getClient()
      .from('web_user')
      .select('id')
      .eq('phone_number', dto.phoneNumber)
      .maybeSingle();

    if (existingPhone) {
      throw new ConflictException('이미 가입된 휴대폰 번호입니다.');
    }

    const isVerified = await this.phoneVerificationService.isRecentlyVerified(dto.phoneNumber);
    if (!isVerified) {
      throw new BadRequestException('휴대폰 인증을 먼저 완료해주세요.');
    }


    const passwordHash = await bcrypt.hash(dto.password, 10);

    // 기본 계정 생성
    const { data, error } = await this.supabaseService
      .getClient()
      .from('web_user')
      .insert({
        nickname: dto.nickname,
        email: dto.email,
        password_hash: passwordHash,
        phone_number: dto.phoneNumber,
        provider: 'LOCAL',
        reward_balance: 0,
      })
      .select('id, nickname, email')
      .single();
      
    if (error) {
      if (error.code === '23505') {
        throw new ConflictException('이미 가입된 이메일 또는 휴대폰 번호입니다.');
      }
      throw new Error(error.message);
    }

    // 프로필 이미지 업로드 및 업데이트
    if (profileImageFile) {
      const profileImageUrl = await this.supabaseService.uploadProfileImage(
        data.id,
        profileImageFile,
      );

      const { error: updateError } = await this.supabaseService
        .getClient()
        .from('web_user')
        .update({ profile_image: profileImageUrl })
        .eq('id', data.id);

      if (updateError) {
        throw new Error(updateError.message);
      }
    }

    return this.issueToken(data.id, data.email);
  }

  async login(dto: LoginDto) {
    const { data: user, error } = await this.supabaseService
      .getClient()
      .from('web_user')
      .select('id, email, password_hash')
      .eq('email', dto.email)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!user || !user.password_hash) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password_hash);

    if (!isMatch) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    return this.issueToken(user.id, user.email);
  }

  async findById(id: number) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('web_user')
      .select('id, nickname, email, reward_balance, profile_image')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async uploadTravelerDocument(
    userId: number,
    file: Express.Multer.File,
    documentType: 'TRANSPORT_TICKET' | 'TOLL_RECEIPT' | 'HOTEL_RESERVATION',
  ) {
    if (!file) {
      throw new BadRequestException('인증 증빙 파일을 업로드해주세요.');
    }

    // 증빙 문서 진위 및 분류 검증
    const verification = await this.geminiService.verifyTravelerDocument(
      file.buffer,
      documentType,
      file.mimetype,
    );

    if (
      !verification ||
      !verification.valid ||
      verification.documentType !== documentType
    ) {
      throw new BadRequestException(
        `제출한 이미지가 ${documentType} 증빙으로 확인되지 않았습니다.`,
      );
    }

    // 최소 판독 신뢰도 검증
    if (verification.confidence < 0.7) {
      throw new BadRequestException(
        '증빙 이미지를 명확하게 확인할 수 없습니다. 더 선명한 이미지를 업로드해주세요.',
      );
    }

    const filePath = await this.supabaseService.uploadTravelerVerification(
      userId,
      file,
    );

    const autoApprove = verification.confidence >= AUTO_APPROVE_CONFIDENCE;

    // 인증 요청 등록
    const { data, error } = await this.supabaseService
      .getClient()
      .from('traveler_verification_request')
      .insert({
        user_id: userId,
        document_url: filePath,
        document_type: documentType,
        status: autoApprove ? 'APPROVED' : 'PENDING',
        ai_result: verification,
        reviewed_at: autoApprove ? new Date().toISOString() : null,
      })
      .select('id, user_id, document_url, document_type, status')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // 기준 신뢰도 충족 시 자동 승인 및 리워드 지급
    if (autoApprove) {
      const reward = await this.rewardsService.approveTravelerVerification(
        userId,
        data.id,
      );

      return {
        success: true,
        message: '증빙 이미지가 자동 승인되어 리워드가 지급되었습니다.',
        request: data,
        verification: {
          documentType: verification.documentType,
          confidence: verification.confidence,
          reason: verification.reason,
        },
        travelerVerification: reward.travelerVerification,
        reward: {
          amount: reward.amount,
          balance: reward.balance,
        },
      };
    }

    return {
      success: true,
      message: '증빙 이미지 판별에 성공했습니다. 관리자 확인 후 처리됩니다.',
      request: data,
      verification: {
        documentType: verification.documentType,
        confidence: verification.confidence,
        reason: verification.reason,
      },
    };
  }

  async verifyTravelerDocument(userId: number, requestId: number) {
    const client = this.supabaseService.getClient();

    const { data: request, error: requestError } = await client
      .from('traveler_verification_request')
      .select('id, user_id, document_url, document_type, status')
      .eq('id', requestId)
      .eq('user_id', userId)
      .maybeSingle();

    if (requestError) {
      throw new Error(requestError.message);
    }

    if (!request) {
      throw new BadRequestException('인증 요청을 찾을 수 없습니다.');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('이미 처리된 인증 요청입니다.');
    }

    if (!request.document_url) {
      throw new BadRequestException('인증 증빙 파일이 없습니다.');
    }

    const imageBuffer = await this.supabaseService.downloadTravelerVerification(
      request.document_url,
    );

    const extension = request.document_url
      .split('.')
      .pop()
      ?.toLowerCase();

    let mimeType = 'application/octet-stream';

    if (extension === 'jpg' || extension === 'jpeg') {
      mimeType = 'image/jpeg';
    } else if (extension === 'png') {
      mimeType = 'image/png';
    } else if (extension === 'webp') {
      mimeType = 'image/webp';
    }

    // 문서 재검증
    const verification = await this.geminiService.verifyTravelerDocument(
      imageBuffer,
      request.document_type,
      mimeType,
    );

    // 검증 실패 시 반려 처리
    if (
      !verification.valid ||
      verification.documentType !== request.document_type ||
      verification.confidence < 0.7
    ) {
      await client
        .from('traveler_verification_request')
        .update({ status: 'REJECTED' })
        .eq('id', requestId);

      return {
        success: false,
        requestId,
        status: 'REJECTED',
        documentType: request.document_type,
        verification: {
          documentType: verification.documentType,
          confidence: verification.confidence,
          reason: verification.reason,
        },
        message: '제출한 증빙이 인증 조건에 맞지 않습니다.',
      };
    }

    // 검증 완료 처리
    const { error: approveError } = await client
      .from('traveler_verification_request')
      .update({ status: 'APPROVED' })
      .eq('id', requestId);

    if (approveError) {
      throw new Error(approveError.message);
    }

    // 리워드 지급
    const reward = await this.rewardsService.approveTravelerVerification(
      userId,
      requestId,
    );

    return {
      success: true,
      requestId,
      status: 'APPROVED',
      documentType: request.document_type,
      verification: {
        documentType: verification.documentType,
        confidence: verification.confidence,
        reason: verification.reason,
      },
      travelerVerification: reward.travelerVerification,
      reward: {
        amount: reward.amount,
        balance: reward.balance,
      },
      message: '여행객 증빙 인증이 완료되었습니다.',
    };
  }

  async approveTravelerDocument(userId: number, requestId: number) {
    const client = this.supabaseService.getClient();

    const { data: request, error: requestError } = await client
      .from('traveler_verification_request')
      .select(`
        id,
        user_id,
        document_url,
        document_type,
        status
      `)
      .eq('id', requestId)
      .eq('user_id', userId)
      .maybeSingle();

    if (requestError) {
      throw new Error(requestError.message);
    }

    if (!request) {
      throw new BadRequestException('인증 요청을 찾을 수 없습니다.');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException(
        `이미 처리된 인증 요청입니다. 현재 상태: ${request.status}`,
      );
    }

    const reward = await this.rewardsService.approveTravelerVerification(
      userId,
      requestId,
    );

    const { error: updateError } = await client
      .from('traveler_verification_request')
      .update({
        status: 'APPROVED',
      })
      .eq('id', requestId)
      .eq('user_id', userId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return {
      success: true,
      requestId: request.id,
      documentUrl: request.document_url,
      documentType: request.document_type,
      status: 'APPROVED',
      travelerVerification: reward.travelerVerification,
      reward: {
        amount: reward.amount,
        balance: reward.balance,
      },
      message: '여행객 인증이 승인되었으며 리워드가 적립되었습니다.',
    };
  }

  private issueToken(userId: number, email: string) {
    const payload = { sub: userId, email };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async socialLogin(provider: SocialProvider, accessToken: string) {
    if (!accessToken) {
      throw new BadRequestException('accessToken이 필요합니다.');
    }

    const profile = await this.fetchSocialProfile(provider, accessToken);
    const client = this.supabaseService.getClient();

    // 기존 연동 계정 확인
    const { data: existing, error: findError } = await client
      .from('web_user')
      .select('id, email')
      .eq('provider', provider)
      .eq('provider_user_id', profile.providerUserId)
      .maybeSingle();

    if (findError) {
      throw new Error(findError.message);
    }

    if (existing) {
      return this.issueToken(existing.id, existing.email);
    }

    // 신규 소셜 유저 → 바로 계정 생성하지 않고, 휴대폰 인증을 먼저 거치게 함
    const pendingToken = this.jwtService.sign(
      {
        type: 'SOCIAL_SIGNUP_PENDING',
        provider,
        providerUserId: profile.providerUserId,
        email: profile.email,
        nickname: profile.nickname ?? `${provider}_사용자`,
        profileImage: profile.profileImage,
      },
      { expiresIn: '10m' }, // 10분 안에 인증 안 하면 다시 로그인부터
    );

return {
  needsPhoneVerification: true,
  pendingToken,
};
  }

  async completeSocialSignup(pendingToken: string, phoneNumber: string) {
  let payload: any;

  try {
    payload = this.jwtService.verify(pendingToken);
  } catch (err) {
    throw new BadRequestException('인증 정보가 만료되었습니다. 처음부터 다시 시도해주세요.');
  }

  if (payload.type !== 'SOCIAL_SIGNUP_PENDING') {
    throw new BadRequestException('올바르지 않은 요청입니다.');
  }

  if (!phoneNumber) {
    throw new BadRequestException('휴대폰 번호가 필요합니다.');
  }

  const client = this.supabaseService.getClient();

  const { data: existingPhone } = await client
    .from('web_user')
    .select('id')
    .eq('phone_number', phoneNumber)
    .maybeSingle();

  if (existingPhone) {
    throw new ConflictException('이미 가입된 휴대폰 번호입니다.');
  }

  const isVerified = await this.phoneVerificationService.isRecentlyVerified(phoneNumber);
  if (!isVerified) {
    throw new BadRequestException('휴대폰 인증을 먼저 완료해주세요.');
  }

  const { data: created, error: insertError } = await client
    .from('web_user')
    .insert({
      nickname: payload.nickname,
      email: payload.email,
      password_hash: null,
      phone_number: phoneNumber,
      provider: payload.provider,
      provider_user_id: payload.providerUserId,
      profile_image: payload.profileImage,
      reward_balance: 0,
    })
    .select('id, email')
    .single();

  if (insertError) {
    if (insertError.code === '23505') {
      throw new ConflictException('이미 가입된 이메일 또는 휴대폰 번호입니다.');
    }
    throw new Error(insertError.message);
  }

  return this.issueToken(created.id, created.email);
}

  private async fetchSocialProfile(
    provider: SocialProvider,
    accessToken: string,
  ): Promise<{
    providerUserId: string;
    email: string | null;
    nickname: string | null;
    profileImage: string | null;
  }> {
    if (provider === 'KAKAO') {
      const res = await fetch('https://kapi.kakao.com/v2/user/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) {
        throw new UnauthorizedException('유효하지 않은 카카오 토큰입니다.');
      }

      const data = await res.json();

      return {
        providerUserId: String(data.id),
        email: data.kakao_account?.email ?? null,
        nickname: data.kakao_account?.profile?.nickname ?? null,
        profileImage:
          data.kakao_account?.profile?.profile_image_url ?? null,
      };
    }

    if (provider === 'GOOGLE') {
      const res = await fetch(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      if (!res.ok) {
        throw new UnauthorizedException('유효하지 않은 구글 토큰입니다.');
      }

      const data = await res.json();

      return {
        providerUserId: String(data.sub),
        email: data.email ?? null,
        nickname: data.name ?? null,
        profileImage: data.picture ?? null,
      };
    }

    if (provider === 'NAVER') {
      const res = await fetch('https://openapi.naver.com/v1/nid/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) {
        throw new UnauthorizedException('유효하지 않은 네이버 토큰입니다.');
      }

      const data = await res.json();

      if (data.resultcode !== '00' || !data.response) {
        throw new UnauthorizedException('유효하지 않은 네이버 토큰입니다.');
      }

      return {
        providerUserId: String(data.response.id),
        email: data.response.email ?? null,
        nickname: data.response.nickname ?? null,
        profileImage: data.response.profile_image ?? null,
      };
    }

    throw new BadRequestException('지원하지 않는 로그인 제공자입니다.');
  }

  async updateProfile(
    userId: number,
    dto: UpdateProfileDto,
    file?: Express.Multer.File,
  ) {
    const client = this.supabaseService.getClient();

    const { data: current, error: findError } = await client
      .from('web_user')
      .select('id, profile_image')
      .eq('id', userId)
      .maybeSingle();

    if (findError) {
      throw new Error(findError.message);
    }

    if (!current) {
      throw new BadRequestException('존재하지 않는 사용자입니다.');
    }

    const removeRequested = dto.removeProfileImage === 'true';
    const updates: Record<string, any> = {};

    if (file) {
      // 신규 이미지 업로드 및 기존 이미지 파일 삭제
      updates.profile_image = await this.supabaseService.uploadProfileImage(
        userId,
        file,
      );

      if (current.profile_image) {
        const oldPath = this.extractProfileImagePath(current.profile_image);

        if (oldPath) {
          await this.supabaseService
            .removeProfileImage(oldPath)
            .catch(() => undefined);
        }
      }
    } else if (removeRequested) {
      updates.profile_image = null;

      if (current.profile_image) {
        const oldPath = this.extractProfileImagePath(current.profile_image);

        if (oldPath) {
          await this.supabaseService
            .removeProfileImage(oldPath)
            .catch(() => undefined);
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      throw new BadRequestException('변경할 내용이 없습니다.');
    }

    const { data: updated, error: updateError } = await client
      .from('web_user')
      .update(updates)
      .eq('id', userId)
      .select('id, nickname, email, reward_balance, profile_image')
      .single();

    if (updateError) {
      throw new Error(updateError.message);
    }

    return updated;
  }

  private extractProfileImagePath(url: string): string | null {
    const marker = '/profile-images/';
    const index = url.indexOf(marker);

    if (index === -1) {
      return null;
    }

    return url.slice(index + marker.length);
  }

  async deleteAccount(userId: number) {
  const client = this.supabaseService.getClient();

  const { data: user, error: findError } = await client
    .from('web_user')
    .select('id, profile_image')
    .eq('id', userId)
    .maybeSingle();

  if (findError) {
    throw new Error(findError.message);
  }

  if (!user) {
    throw new BadRequestException('존재하지 않는 사용자입니다.');
  }

  // 프로필 이미지 폴더 전체 삭제 (userId 폴더 안 모든 파일)
  const { data: files } = await client.storage
    .from('profile-images')
    .list(String(userId));

  if (files && files.length > 0) {
    const filePaths = files.map((f) => `${userId}/${f.name}`);
    await client.storage.from('profile-images').remove(filePaths);
  }

  // 계정 삭제 (ON DELETE CASCADE로 연관 데이터 자동 삭제됨)
  const { error: deleteError } = await client
    .from('web_user')
    .delete()
    .eq('id', userId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  return { success: true, message: '회원 탈퇴가 완료되었습니다.' };
}
}
