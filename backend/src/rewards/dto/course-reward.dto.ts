import { IsInt } from 'class-validator';

export class CourseRewardDto {

  @IsInt()
  userId: number;

  @IsInt()
  courseRunId: number;

}