import { Test, TestingModule } from '@nestjs/testing';
import { CongestionService } from './congestion.service';

describe('CongestionService', () => {
  let service: CongestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CongestionService],
    }).compile();

    service = module.get<CongestionService>(CongestionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
