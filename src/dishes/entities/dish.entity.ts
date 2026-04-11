import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { DishIngredient } from './dish-ingredient.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Dish {
  @ApiProperty({
    example: 'a0b1c2d3-e4f5-6789-0123-456789abcdef',
    description: 'Unique identifier for the dish',
    format: 'uuid',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Chicken Salad', description: 'Name of the dish' })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({
    example: 'A healthy and delicious chicken salad.',
    description: 'Description of the dish',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({
    example: '2023-01-01T12:00:00Z',
    description: 'Timestamp when the dish was created',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2023-01-01T13:00:00Z',
    description: 'Timestamp when the dish was last updated',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ type: () => [DishIngredient] })
  @OneToMany(() => DishIngredient, (dishIngredient) => dishIngredient.dish)
  ingredients: DishIngredient[];

  // This will not be stored in the DB, but calculated in the service
  totalCalories?: number;
}
