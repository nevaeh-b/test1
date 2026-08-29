import { IsInt } from 'class-validator';

export class StayRewardDto {

  @IsInt()
  userId: number;

  @IsInt()
  stayId: number;

}