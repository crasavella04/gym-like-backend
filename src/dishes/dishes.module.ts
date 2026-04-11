import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DishesService } from './dishes.service';
import { DishesController } from './dishes.controller';
import { Dish } from './entities/dish.entity';
import { DishIngredient } from './entities/dish-ingredient.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dish, DishIngredient, Ingredient])],
  controllers: [DishesController],
  providers: [DishesService],
  exports: [DishesService], // Export if other modules need to use DishesService
})
export class DishesModule {}
