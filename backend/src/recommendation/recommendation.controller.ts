import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { RecommendDto } from './dto/recommend.dto';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';

@Controller('recommendation')
export class RecommendationController {
  constructor(private recommendationService: RecommendationService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  recommend(@Req() req: any, @Body() dto: RecommendDto) {
    return this.recommendationService.recommend(req.user.userId, dto);
  }
}