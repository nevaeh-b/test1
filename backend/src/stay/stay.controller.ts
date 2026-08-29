import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';
import { StayService } from './stay.service';
import { SubmitStayReservationDto } from './dto/submit-stay-reservation.dto';

@UseGuards(JwtAuthGuard)
@Controller('stays')
export class StayController {
  constructor(private readonly stayService: StayService) {}

  // 숙박 예약 증빙 제출 (여행객 인증 필요, 이미지에서 체크인/체크아웃 추출)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  submitStayReservation(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: SubmitStayReservationDto,
  ) {
    return this.stayService.submitStayReservation(
      req.user.userId,
      dto.placeId,
      file,
    );
  }

  // 관리자 수동 승인
  @Post(':id/approve')
  approveStayVerification(@Param('id', ParseIntPipe) id: number) {
    return this.stayService.approveStayVerification(id);
  }

  // 관리자 반려
  @Post(':id/reject')
  rejectStayVerification(@Param('id', ParseIntPipe) id: number) {
    return this.stayService.rejectStayVerification(id);
  }
}