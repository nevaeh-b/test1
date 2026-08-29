import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { CongestionService } from './congestion.service';
import { SubmitReviewDto } from './dto/submit-review.dto';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';

@Controller('congestion')
export class CongestionController {
  constructor(private congestionService: CongestionService) {}

  @Get('region/:regionCode')
  getByRegion(@Param('regionCode', ParseIntPipe) regionCode: number) {
    return this.congestionService.getByRegion(regionCode);
  }

  @UseGuards(JwtAuthGuard)
  @Post('review')
  submitReview(@Req() req: any, @Body() dto: SubmitReviewDto) {
    return this.congestionService.submitReview(
      req.user.userId,
      dto.placeId,
      dto.congestionLevel,
    );
  }
}