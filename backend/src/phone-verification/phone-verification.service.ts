import { BadRequestException, Injectable } from '@nestjs/common';
import { SolapiMessageService } from 'solapi';
import { SupabaseService } from '../supabase/supabase.service';

const CODE_EXPIRY_MINUTES = 3;

@Injectable()
export class PhoneVerificationService {
  private readonly messageService: SolapiMessageService;

  constructor(private readonly supabaseService: SupabaseService) {
    this.messageService = new SolapiMessageService(
      process.env.SOLAPI_API_KEY!,
      process.env.SOLAPI_API_SECRET!,
    );
  }

  async sendCode(phoneNumber: string) {
    if (!phoneNumber || phoneNumber.length < 10) {
      throw new BadRequestException('올바른 휴대폰 번호를 입력해주세요.');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

    const client = this.supabaseService.getClient();

    const { error } = await client.from('phone_verification').insert({
      phone_number: phoneNumber,
      code,
      expires_at: expiresAt.toISOString(),
      verified: false,
    });

    if (error) {
      throw new Error(error.message);
    }

    try {
      await this.messageService.send({
        to: phoneNumber,
        from: process.env.SOLAPI_SENDER_NUMBER!,
        text: `[인증번호] ${code}를 입력해주세요. (${CODE_EXPIRY_MINUTES}분 이내 유효)`,
      });
    } catch (err) {
      throw new BadRequestException('문자 발송에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }

    return { success: true };
  }

  async verifyCode(phoneNumber: string, code: string) {
    const client = this.supabaseService.getClient();

    const { data: record, error } = await client
      .from('phone_verification')
      .select('id, code, expires_at, verified')
      .eq('phone_number', phoneNumber)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!record) {
      throw new BadRequestException('인증 요청 내역이 없습니다. 인증번호를 다시 요청해주세요.');
    }

    if (new Date(record.expires_at) < new Date()) {
      throw new BadRequestException('인증 시간이 만료되었습니다. 재전송 후 다시 시도해주세요.');
    }

    if (record.code !== code) {
      throw new BadRequestException('인증번호가 일치하지 않습니다.');
    }

    const { error: updateError } = await client
      .from('phone_verification')
      .update({ verified: true, verified_at: new Date().toISOString() })
      .eq('id', record.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return { success: true, verified: true };
  }

  async isRecentlyVerified(phoneNumber: string): Promise<boolean> {
    const client = this.supabaseService.getClient();
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    const { data } = await client
      .from('phone_verification')
      .select('id')
      .eq('phone_number', phoneNumber)
      .eq('verified', true)
      .gte('verified_at', thirtyMinutesAgo)
      .order('verified_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return !!data;
  }
}
