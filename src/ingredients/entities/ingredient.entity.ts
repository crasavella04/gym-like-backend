import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IngredientUnitEnum } from '../dto/create-ingredient.dto';

@Entity('ingredients')
export class Ingredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'float' })
  calories: number;

  @Column({
    type: 'varchar',
    length: 10,
  })
  unit: IngredientUnitEnum;

  @Column({ type: 'float' })
  protein: number; // белок в граммах на единицу ингредиента

  @Column({ type: 'float' })
  fat: number; // жиры в граммах на единицу ингредиента

  @Column({ type: 'float' })
  carbs: number; // углеводы в граммах на единицу ингредиента
}
