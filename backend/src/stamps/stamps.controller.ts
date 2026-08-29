import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';
import { StampsService } from './stamps.service';
import { AssignCharacterDto } from './dto/assign-character.dto';

@UseGuards(JwtAuthGuard)
@Controller('stamps')
export class StampsController {
  constructor(private readonly stampsService: StampsService) {}

  // 설문조사 결과 캐릭터 저장
  @Post('character')
  assignCharacter(@Req() req: any, @Body() dto: AssignCharacterDto) {
    return this.stampsService.assignCharacter(req.user.userId, dto.code);
  }

  // 내 캐릭터 + 스탬프 진행 상황 조회
  @Get('me')
  getMyStamps(@Req() req: any) {
    return this.stampsService.getMyStamps(req.user.userId);
  }
}