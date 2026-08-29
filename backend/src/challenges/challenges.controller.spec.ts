// clinet의 http 요청 (GET, POST 등)을 받아 응답 return

import { Test, TestingModule } from '@nestjs/testing';
import { ChallengesController } from './challenges.controller';

describe('ChallengesController', () => {
  let controller: ChallengesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChallengesController],
    }).compile();

    controller = module.get<ChallengesController>(ChallengesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
