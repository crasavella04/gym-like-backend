import { IsNumber, IsPositive, IsInt, IsDate, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';

export class UpdateMealDto {
  @IsNumber()
  @IsPositive()
  @IsInt()
  @IsOptional()
  mealNumber?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  timestamp?: Date;

  @IsString()
  @IsOptional()
  dishId?: string;
}
