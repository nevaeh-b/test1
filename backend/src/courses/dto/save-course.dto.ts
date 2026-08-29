// Gemini recommend API의 recommended.course[] 요소와 동일한 모양
export class SaveCoursePlaceDto {
  place_code: number;
  order: number;
  reason?: string; // 저장은 안 하지만, recommend 응답을 그대로 보내도 되게 허용
}

export class SaveCourseDto {
  // 사용자가 이름을 수정했다면 이 값 사용, 안 주면 summary를 이름으로 사용
  name?: string;

  // recommend 응답의 recommended.summary 그대로
  summary?: string;

  // recommend 응답의 recommended.course 배열 그대로
  places: SaveCoursePlaceDto[];

  // recommend 응답의 conditions.themes 그대로 (선택)
  themes?: string[];

  // recommend 응답의 conditions.barrierFreeTypes 그대로 (선택)
  // 값이 하나라도 있으면 course.is_barrier_free가 자동으로 true가 됩니다
  barrierFreeTypes?: string[];
}