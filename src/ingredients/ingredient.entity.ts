import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum IngredientUnit {
  GRAM = 'g',
  LITER = 'l',
  PIECE = 'pcs',
}

@Entity('ingredients')
export class Ingredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'float' })
  calories: number;

  @Column({
    type: 'enum',
    enum: IngredientUnit,
    default: IngredientUnit.GRAM,
  })
  unit: IngredientUnit;
}
