import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class FilterDishDto {
  @ApiProperty({ description: 'Поиск по названию блюда', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Фильтр по ID ингредиентов (через запятую)', required: false, example: 'uuid1,uuid2' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value ? value.split(',') : undefined))
  ingredientIds?: string[];
}
