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
}
