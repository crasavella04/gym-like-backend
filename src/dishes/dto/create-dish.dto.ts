import { IsNotEmpty, IsString, IsOptional, MaxLength, ValidateNested, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateDishIngredientDto } from './create-dish-ingredient.dto';

export class CreateDishDto {
  @ApiProperty({ description: 'Название блюда', example: 'Овсянка с ягодами' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ description: 'Описание блюда', example: 'Полезный завтрак', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Ингредиенты блюда', type: [CreateDishIngredientDto], required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateDishIngredientDto)
  ingredients?: CreateDishIngredientDto[];
}
