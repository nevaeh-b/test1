import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class RecommendDto {
  // 선택한 숙소의 place.place_code
  @IsInt()
  @IsNotEmpty()
  accommodationPlaceCode: number;

  // 이동수단 ("WALK" | "BICYCLE" | "PUBLIC_TRANSPORT" | "CAR")
  @IsString()
  @IsNotEmpty()
  transportation: string;

  // 테마 칩 코드: "HISTORY_CULTURE" | "NATURE" | "FOOD" | "SCIENCE_EXPERIENCE" | "NIGHT"
  // 최소 1개 이상 선택
  @IsArray()
  @IsString({ each: true })
  themes: string[];

  // 무장애 칩 코드: "INFANT" | "BLIND" | "DEAF" | "WHEELCHAIR"
  // 선택 안 하면 무장애 여부와 무관하게 전체 장소 대상
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  barrierFreeTypes?: string[];

  // 여행 기간: "당일치기" | "1박 2일" | "2박 3일" | "3박 4일" | "4박 5일 이상"
  @IsOptional()
  @IsString()
  period?: string;
}
