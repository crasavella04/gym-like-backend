import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Dish } from './dish.entity';
import { Ingredient } from '../../ingredients/entities/ingredient.entity'; // Assuming Ingredient entity exists
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class DishIngredient {
  @ApiProperty({
    example: 'a0b1c2d3-e4f5-6789-0123-456789abcdef',
    description: 'Unique identifier for the dish ingredient',
    format: 'uuid',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'a0b1c2d3-e4f5-6789-0123-456789abcdef' })
  @Column()
  dishId: string;

  @ApiProperty({ example: 'a0b1c2d3-e4f5-6789-0123-456789abcdef' })
  @Column()
  ingredientId: string;

  @ApiProperty({ example: 100.5, description: 'Quantity of the ingredient in the dish' })
  @Column({ type: 'float' })
  quantity: number;

  @ApiProperty({
    example: '2023-01-01T12:00:00Z',
    description: 'Timestamp when the dish ingredient was created',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2023-01-01T13:00:00Z',
    description: 'Timestamp when the dish ingredient was last updated',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Dish, (dish) => dish.ingredients, { onDelete: 'CASCADE' })
  dish: Dish;

  @ManyToOne(() => Ingredient, { onDelete: 'CASCADE' })
  ingredient: Ingredient;
}
