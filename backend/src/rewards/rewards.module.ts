import { Module } from '@nestjs/common';
import { RewardsController } from './rewards.controller';
import { RewardsService } from './rewards.service';
import { SupabaseModule } from 'src/supabase/supabase.module';

@Module({
  imports: [ SupabaseModule],
  controllers: [RewardsController],
  providers: [RewardsService],
  exports:[RewardsService]
})
export class RewardsModule {}