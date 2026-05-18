import {
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateDishIngredientDto } from './create-dish-ingredient.dto';

export class UpdateDishDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, type: [CreateDishIngredientDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateDishIngredientDto)
  ingredients?: CreateDishIngredientDto[];
}
