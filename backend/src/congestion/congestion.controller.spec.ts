import { Test, TestingModule } from '@nestjs/testing';
import { CongestionController } from './congestion.controller';

describe('CongestionController', () => {
  let controller: CongestionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CongestionController],
    }).compile();

    controller = module.get<CongestionController>(CongestionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
