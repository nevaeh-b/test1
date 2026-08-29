export class FindPlacesDto {
  region?: number;        // region_code
  tag?: string;            // new_category_code
  barrierFree?: boolean;   // place_barrier_free 존재 여부
}