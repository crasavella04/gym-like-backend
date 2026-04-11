import { IsString, IsNumber, IsEnum, IsNotEmpty, Min } from 'class-validator';

export enum IngredientUnitEnum {
  GRAM = 'g',
  LITER = 'l',
  PIECE = 'pcs',
}

export class CreateIngredientDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0, { message: 'Calories must be greater than or equal to 0' })
  calories: number;

  @IsEnum(IngredientUnitEnum, {
    message: 'Unit must be one of: g, l, pcs',
  })
  @IsNotEmpty()
  unit: IngredientUnitEnum;
}
