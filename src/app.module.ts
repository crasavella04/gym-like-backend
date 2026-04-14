import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from './jwt/jwt.module';
import { MetricsModule } from './metrics/metrics.module';
import { Metric } from './metrics/entities/metrics.entity';
import { ExercisesModule } from './exercises/exercises.module';
import { Exercise } from './exercises/entities/exercises.entity';
import { TrainingModule } from './training/training.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { Ingredient } from './ingredients/entities/ingredient.entity';
import { DishesModule } from './dishes/dishes.module';
import { Dish } from './dishes/entities/dish.entity';
import { DishIngredient } from './dishes/entities/dish-ingredient.entity';
import { MealsModule } from './meals/meals.module';
import { Meal } from './meals/entities/meal.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: Number(process.env.DATABASE_PORT) || 5431,
      username: process.env.DATABASE_USERNAME || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE || 'postgres',
      entities: [User, Metric, Exercise, Ingredient, Dish, DishIngredient, Meal],
      synchronize: true,
    }),
    UsersModule,
    FilesModule,
    AuthModule,
    JwtModule,
    MetricsModule,
    ExercisesModule,
    TrainingModule,
    IngredientsModule,
    DishesModule,
    MealsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
