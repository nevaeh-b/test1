import { IsInt } from 'class-validator';

export class TravelerRewardDto {

  @IsInt()
  userId: number;

}