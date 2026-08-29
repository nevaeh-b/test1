import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { TestController } from './test/test.controller';
import { PlacesModule } from './places/places.module';
import { CoursesModule } from './courses/courses.module';
import { CongestionModule } from './congestion/congestion.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { RewardsModule } from './rewards/rewards.module';
import { ChallengesModule } from './challenges/challenges.module';
import { UsersModule } from './users/users.module';
import { StayModule } from './stay/stay.module';
import { PlaceVisitModule } from './place-visit/place-visit.module';
import { StampsModule } from './stamps/stamps.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule,
    PlacesModule,
    CoursesModule,
    CongestionModule,
    RecommendationModule,
    RewardsModule,
    ChallengesModule,
    UsersModule,
    StayModule,
    PlaceVisitModule,
    StampsModule,
  ],
  controllers: [AppController, TestController],
  providers: [AppService],
})
export class AppModule {}