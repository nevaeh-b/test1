import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { ConvertDto } from './dto/convert.dto';
import { EarnDto } from './dto/earn.dto';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';
import { PlaceRewardDto } from './dto/place-reward.dto';
import { StayRewardDto } from './dto/stay-reward.dto';
import { CourseRewardDto } from './dto/course-reward.dto';
import { CongestionRewardDto } from './dto/congestion-reward.dto';

@UseGuards(JwtAuthGuard)
@Controller('rewards')
export class RewardsController {
  constructor(
    private readonly rewardsService: RewardsService,
  ) {}

  @Get('balance')
  getBalance(@Req() req: any) {
    return this.rewardsService.getBalance(
      req.user.userId,
    );
  }

  @Get('history')
  getHistory(@Req() req: any) {
    return this.rewardsService.getHistory(
      req.user.userId,
    );
  }

  // 기존 테스트용 적립 API
  @Post('earn')
  earn(
    @Req() req: any,
    @Body() dto: EarnDto,
  ) {
    return this.rewardsService.earn(
      req.user.userId,
      dto.amount,
      dto.reason,
    );
  }

  // 리워드 전환
  @Post('convert')
  convert(
    @Req() req: any,
    @Body() dto: ConvertDto,
  ) {
    return this.rewardsService.convert(
      req.user.userId,
      dto.amount,
    );
  }

  // 여행객 인증은 UsersService의 uploadTravelerDocument / verifyTravelerDocument /
  // approveTravelerDocument 플로우로 대체되었습니다 (이미지 업로드 + Gemini 판별 필요).
  // 이미지 없이 userId만 받던 구 엔드포인트는 제거했습니다.

  // 장소 인증
  @Post('place')
  verifyPlace(
    @Req() req: any,
    @Body() dto: PlaceRewardDto,
  ) {
    return this.rewardsService.verifyPlace(
      req.user.userId,
      dto.placeId,
    );
  }

  // 숙박 인증
  @Post('stay')
  verifyStay(
    @Req() req: any,
    @Body() dto: StayRewardDto,
  ) {
    return this.rewardsService.verifyStay(
      req.user.userId,
      dto.stayId,
    );
  }

  // 코스 완주
  @Post('course')
  completeCourse(
    @Req() req: any,
    @Body() dto: CourseRewardDto,
  ) {
    return this.rewardsService.completeCourse(
      req.user.userId,
      dto.courseRunId,
    );
  }

  // 혼잡도 평가
  @Post('congestion')
  submitCongestionReview(
    @Req() req: any,
    @Body() dto: CongestionRewardDto,
  ) {
    return this.rewardsService.submitCongestionReview(
      req.user.userId,
      dto.placeId,
    );
  }
}