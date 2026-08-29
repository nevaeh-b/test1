import { Module } from '@nestjs/common';
import { StayController } from './stay.controller';
import { StayService } from './stay.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { RewardsModule } from '../rewards/rewards.module';
import { GeminiModule } from '../gemini/gemini.module'; // 실제 경로에 맞게 조정해주세요

@Module({
  imports: [SupabaseModule, RewardsModule, GeminiModule],
  controllers: [StayController],
  providers: [StayService],
  exports: [StayService],
})
export class StayModule {}