import { IsInt } from 'class-validator';

export class CongestionRewardDto {

  @IsInt()
  userId: number;

  @IsInt()
  placeId: number;

}