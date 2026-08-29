// 관련 controller와 service를 하나로 묶음 -> 다른 application과 연결

import { Module } from '@nestjs/common';
import { ChallengesService } from './challenges.service';
import { ChallengesController } from './challenges.controller';

@Module({
  providers: [ChallengesService],
  controllers: [ChallengesController]
})
export class ChallengesModule {}
