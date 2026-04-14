import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Dish } from './dish.entity';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';

@Entity('dish_ingredients')
export class DishIngredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  dishId: string;

  @Column({ type: 'uuid' })
  ingredientId: string;

  @Column({ type: 'float' })
  quantity: number;

  @ManyToOne(() => Dish, (dish) => dish.ingredients, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dishId' })
  dish: Dish;

  @ManyToOne(() => Ingredient)
  @JoinColumn({ name: 'ingredientId' })
  ingredient: Ingredient;
}
