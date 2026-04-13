import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DishesService } from './dishes.service';
import { DishesController } from './dishes.controller';
import { Dish } from './entities/dish.entity';
import { DishIngredient } from './entities/dish-ingredient.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dish, DishIngredient])],
  controllers: [DishesController],
  providers: [DishesService],
  exports: [DishesService],
})
export class DishesModule {}
