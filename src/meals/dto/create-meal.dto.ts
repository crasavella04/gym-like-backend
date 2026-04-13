import { IsNumber, IsPositive, IsInt, IsDate, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMealDto {
  @IsNumber()
  @IsPositive()
  @IsInt()
  mealNumber: number;

  @IsDate()
  @Type(() => Date)
  timestamp: Date;

  @IsString()
  dishId: string;
}
