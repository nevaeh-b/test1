import { Module } from '@nestjs/common';
import { CongestionController } from './congestion.controller';
import { CongestionService } from './congestion.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [CongestionController],
  providers: [CongestionService],
  exports: [CongestionService],
})
export class CongestionModule {}