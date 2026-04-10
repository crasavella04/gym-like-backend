import { IsString, IsNumber, IsEnum, IsNotEmpty } from 'class-validator';
import { IngredientUnit } from '../ingredient.entity';

export class CreateIngredientDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @IsNotEmpty()
  calories: number;

  @IsEnum(IngredientUnit)
  @IsNotEmpty()
  unit: IngredientUnit;
}
