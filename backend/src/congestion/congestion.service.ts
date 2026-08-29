import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class CongestionService {
  constructor(private supabaseService: SupabaseService) {}

  // 지역의 현재 혼잡도 조회 (실시간 리뷰 우선, 없으면 과거 이력)
  async getByRegion(regionCode: number) {
    // 1. 최근 실시간 리뷰 확인 (최근 20건)
    const { data: reviews, error: reviewError } = await this.supabaseService
      .getClient()
      .from('congestion_review')
      .select('congestion_level, submitted_at, place:place_id(region_code)')
      .order('submitted_at', { ascending: false })
      .limit(20);

    if (reviewError) throw new Error(reviewError.message);

    const regionReviews = (reviews ?? []).filter(
      (r: any) => r.place?.region_code === regionCode,
    );

    if (regionReviews.length > 0) {
      const avg =
        regionReviews.reduce((sum: number, r: any) => sum + r.congestion_level, 0) /
        regionReviews.length;

      return {
        regionCode,
        source: 'realtime_review',
        congestionLevel: Number(avg.toFixed(2)),
        sampleCount: regionReviews.length,
      };
    }

    // 2. 리뷰 없으면 과거 이력의 최신 값으로 대체
    const { data: history, error: historyError } = await this.supabaseService
      .getClient()
      .from('congestion_history')
      .select('*')
      .eq('region_code', regionCode)
      .order('recorded_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (historyError) throw new Error(historyError.message);

    if (!history) {
      return {
        regionCode,
        source: 'no_data',
        congestionLevel: null,
      };
    }

    return {
      regionCode,
      source: 'historical_average',
      congestionLevel: history.avg_congestion,
      recordedDate: history.recorded_date,
    };
  }

  // 사용자 실시간 평가 제출
  async submitReview(userId: number, placeId: number, congestionLevel: number) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('congestion_review')
      .insert({
        user_id: userId,
        place_id: placeId,
        congestion_level: congestionLevel,
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}