import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ingredients')
export class Ingredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'float' })
  calories: number;

  @Column({ type: 'varchar', length: 10 })
  unit: string; // 'g', 'l', 'pcs'
}
