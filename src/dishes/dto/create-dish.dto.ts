import { ArrayNotEmpty, IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateDishIngredientDto {
  @ApiProperty({ description: 'UUID of the ingredient', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  ingredientId: string;

  @ApiProperty({ description: 'Quantity of the ingredient', example: 100.5 })
  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  quantity: number;
}

export class CreateDishDto {
  @ApiProperty({ description: 'Name of the dish', example: 'Chicken Salad' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Description of the dish',
    example: 'A healthy and delicious chicken salad.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [CreateDishIngredientDto] })
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => CreateDishIngredientDto)
  ingredients: CreateDishIngredientDto[];
}
