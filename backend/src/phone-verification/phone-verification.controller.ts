import { Body, Controller, Post } from '@nestjs/common';
import { PhoneVerificationService } from './phone-verification.service';
import { SendCodeDto } from './dto/send-code.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';

@Controller('phone-verification')
export class PhoneVerificationController {
  constructor(private readonly service: PhoneVerificationService) {}

  @Post('send-code')
  sendCode(@Body() dto: SendCodeDto) {
    return this.service.sendCode(dto.phoneNumber);
  }

  @Post('verify-code')
  verifyCode(@Body() dto: VerifyCodeDto) {
    return this.service.verifyCode(dto.phoneNumber, dto.code);
  }
}
