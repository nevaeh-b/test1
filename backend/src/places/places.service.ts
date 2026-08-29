import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { FindPlacesDto } from './dto/find-places.dto';

@Injectable()
export class PlacesService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(filters: FindPlacesDto) {
    let query = this.supabaseService
      .getClient()
      .from('place')
      .select('*, region(name), tag:new_category_code(new_category_code_name)');

    if (filters.region) {
      query = query.eq('region_code', filters.region);
    }
    if (filters.tag) {
      query = query.eq('new_category_code', filters.tag);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  }

  async findOne(id: number) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('place')
      .select('*, region(name), tag:new_category_code(new_category_code_name)')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}