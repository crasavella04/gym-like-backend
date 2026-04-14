import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealsService } from './meals.service';
import { MealsController } from './meals.controller';
import { Meal } from './entities/meal.entity';
import { DishesModule } from '../dishes/dishes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Meal]),
    DishesModule,
  ],
  providers: [MealsService],
  controllers: [MealsController],
  exports: [MealsService],
})
export class MealsModule {}
