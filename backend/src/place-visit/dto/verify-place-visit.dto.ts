export class VerifyPlaceVisitDto {
  placeId: number;

  // 단말기 자체 GPS 비교 결과
  verified: boolean;

  coursePlaceId?: number;
}