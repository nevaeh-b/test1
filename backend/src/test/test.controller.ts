import { Controller, Get } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Controller('test')
export class TestController {
  constructor(private supabaseService: SupabaseService) {}

  @Get('ping')
  async ping() {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('test_table')
      .select('*')
      .limit(1);

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  }
}