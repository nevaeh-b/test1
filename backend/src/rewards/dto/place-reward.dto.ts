import { IsInt } from 'class-validator';

export class PlaceRewardDto {

  @IsInt()
  userId: number;

  @IsInt()
  placeId: number;

}