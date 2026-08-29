import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';
import { PlaceVisitService } from './place-visit.service';
import { VerifyPlaceVisitDto } from './dto/verify-place-visit.dto';

@UseGuards(JwtAuthGuard)
@Controller('place-visit')
export class PlaceVisitController {
  constructor(private readonly placeVisitService: PlaceVisitService) {}

  @Post('verify')
  verify(@Req() req: any, @Body() dto: VerifyPlaceVisitDto) {
    return this.placeVisitService.verify(
      req.user.userId,
      Number(dto.placeId),
      dto.verified === true,
      dto.coursePlaceId ? Number(dto.coursePlaceId) : undefined,
    );
  }
}