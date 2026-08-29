import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Patch,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { UsersService } from './users.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

import { SocialLoginDto } from './dto/social-login.dto';
import { SocialProvider } from './users.service';

import { UpdateProfileDto } from './dto/update-profile.dto';

type TravelerDocumentType =
  | 'TRANSPORT_TICKET'
  | 'TOLL_RECEIPT'
  | 'HOTEL_RESERVATION';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 회원가입 (프로필 이미지 선택 업로드 가능)
  @Post('signup')
  @UseInterceptors(FileInterceptor('profileImage'))
  signup(
    @Body() dto: SignupDto,
    @UploadedFile() profileImage?: Express.Multer.File,
  ) {
    return this.usersService.signup(dto, profileImage);
  }

  // 로그인
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.usersService.login(dto);
  }

  // 내 정보 조회
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: any) {
    return this.usersService.findById(req.user.userId);
  }

  // 여행객 증빙서류 업로드
  @UseGuards(JwtAuthGuard)
  @Post('traveler/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadTravelerDocument(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body('documentType') documentType: TravelerDocumentType,
  ) {
    // 1. 파일 존재 여부 확인
    if (!file) {
      throw new BadRequestException('증빙 파일을 업로드해주세요.');
    }

    // 2. 증빙 종류 확인
    const allowedTypes: TravelerDocumentType[] = [
      'TRANSPORT_TICKET',
      'TOLL_RECEIPT',
      'HOTEL_RESERVATION',
    ];

    if (!allowedTypes.includes(documentType)) {
      throw new BadRequestException('올바른 증빙서류 종류가 아닙니다.');
    }

    // 3. UsersService로 전달
    return this.usersService.uploadTravelerDocument(
      req.user.userId,
      file,
      documentType,
    );
  }

  // 여행객 인증 요청 확인
  @UseGuards(JwtAuthGuard)
  @Get('traveler/verify/:requestId')
  verifyTravelerDocument(
    @Req() req: any,
    @Param('requestId') requestId: string,
  ) {
    return this.usersService.verifyTravelerDocument(
      req.user.userId,
      Number(requestId),
    );
  }

  // 여행객 인증 승인 + 리워드 지급
  @UseGuards(JwtAuthGuard)
  @Post('traveler/approve/:requestId')
  approveTravelerDocument(
    @Req() req: any,
    @Param('requestId') requestId: string,
  ) {
    return this.usersService.approveTravelerDocument(
      req.user.userId,
      Number(requestId),
    );
  }

    // 소셜 로그인
  @Post('social/:provider')
  socialLogin(
    @Param('provider') provider: string,
    @Body() dto: SocialLoginDto,
  ) {
    const map: Record<string, SocialProvider> = {
      kakao: 'KAKAO',
      google: 'GOOGLE',
      naver: 'NAVER',
    };

    const mapped = map[provider.toLowerCase()];

    if (!mapped) {
      throw new BadRequestException('지원하지 않는 로그인 제공자입니다.');
    }

    return this.usersService.socialLogin(mapped, dto.accessToken);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @UseInterceptors(FileInterceptor('profileImage'))
  updateMe(
    @Req() req: any,
    @Body() dto: UpdateProfileDto,
    @UploadedFile() profileImage?: Express.Multer.File,
  ) {
    return this.usersService.updateProfile(
      req.user.userId,
      dto,
      profileImage,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  deleteAccount(@Req() req: any) {
  return this.usersService.deleteAccount(req.user.userId);
  }

  @Post('social-signup/complete')
  completeSocialSignup(
  @Body() body: { pendingToken: string; phoneNumber: string },
) {
  return this.usersService.completeSocialSignup(
    body.pendingToken,
    body.phoneNumber,
  );
}
}
