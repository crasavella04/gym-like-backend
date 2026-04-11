import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateDishDto, CreateDishIngredientDto } from './create-dish.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateDishIngredientDto {
  @ApiProperty({ description: 'UUID of the ingredient', format: 'uuid', required: false })
  @IsOptional()
  @IsUUID()
  ingredientId?: string;

  @ApiProperty({ description: 'Quantity of the ingredient', example: 100.5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  quantity?: number;
}

export class UpdateDishDto extends PartialType(
  OmitType(CreateDishDto, ['ingredients'] as const),
) {
  @ApiProperty({
    description: 'Name of the dish', example: 'Chicken Salad', required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiProperty({
    description: 'Description of the dish',
    example: 'A healthy and delicious chicken salad.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [UpdateDishIngredientDto], required: false })
  @IsOptional()
  @IsArray()
  @Type(() => UpdateDishIngredientDto)
  ingredients?: UpdateDishIngredientDto[];
}
