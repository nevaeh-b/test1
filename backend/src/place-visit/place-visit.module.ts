import { Module } from '@nestjs/common';
import { PlaceVisitController } from './place-visit.controller';
import { PlaceVisitService } from './place-visit.service';
import { RewardsModule } from '../rewards/rewards.module';

@Module({
  imports: [RewardsModule],
  controllers: [PlaceVisitController],
  providers: [PlaceVisitService],
  exports: [PlaceVisitService],
})
export class PlaceVisitModule {}