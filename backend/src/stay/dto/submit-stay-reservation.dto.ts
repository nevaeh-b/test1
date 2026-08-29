import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class SubmitStayReservationDto {
  @Type(() => Number)
  @IsInt()
  placeId: number;
}
