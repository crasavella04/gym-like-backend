import { IsNotEmpty, IsString, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDishIngredientDto {
  @ApiProperty({ description: 'ID ингредиента', example: 'uuid-string' })
  @IsNotEmpty()
  @IsString()
  ingredientId: string;

  @ApiProperty({ description: 'Количество', example: 150.5 })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  quantity: number;
}
