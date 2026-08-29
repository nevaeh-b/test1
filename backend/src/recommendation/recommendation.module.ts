import { Module } from '@nestjs/common';
import { RecommendationController } from './recommendation.controller';
import { RecommendationService } from './recommendation.service';
import { CongestionModule } from '../congestion/congestion.module';
import { UsersModule } from '../users/users.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { GeminiModule } from 'src/gemini/gemini.module';

@Module({
  imports: [CongestionModule, UsersModule, SupabaseModule, GeminiModule,],
  controllers: [RecommendationController],
  providers: [RecommendationService],
})
export class RecommendationModule {}