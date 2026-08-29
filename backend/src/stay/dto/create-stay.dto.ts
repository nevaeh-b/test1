import { IsDateString, IsInt } from 'class-validator';

export class CreateStayDto {
  @IsInt()
  placeId: number;

  @IsDateString()
  checkIn: string;

  @IsDateString()
  checkOut: string;
}
