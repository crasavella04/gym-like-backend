import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dish } from './entities/dish.entity';
import { DishIngredient } from './entities/dish-ingredient.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { CreateDishDto, CreateDishIngredientDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';

@Injectable()
export class DishesService {
  constructor(
    @InjectRepository(Dish)
    private readonly dishRepository: Repository<Dish>,
    @InjectRepository(DishIngredient)
    private readonly dishIngredientRepository: Repository<DishIngredient>,
    @InjectRepository(Ingredient)
    private readonly ingredientRepository: Repository<Ingredient>,
  ) {}

  async create(createDishDto: CreateDishDto): Promise<Dish> {
    const newDish = this.dishRepository.create({
      name: createDishDto.name,
      description: createDishDto.description,
    });

    const savedDish = await this.dishRepository.save(newDish);

    await Promise.all(
      createDishDto.ingredients.map(async (ingredientDto) => {
        const ingredient = await this.ingredientRepository.findOne({
          where: { id: ingredientDto.ingredientId },
        });
        if (!ingredient) {
          throw new NotFoundException(
            `Ingredient with ID ${ingredientDto.ingredientId} not found`,
          );
        }

        const dishIngredient = this.dishIngredientRepository.create({
          dishId: savedDish.id,
          ingredientId: ingredientDto.ingredientId,
          quantity: ingredientDto.quantity,
        });
        await this.dishIngredientRepository.save(dishIngredient);
      }),
    );

    return this.findOne(savedDish.id);
  }

  async findAll(
    search?: string,
    ingredientIds?: string[],
    skip?: number,
    take?: number,
  ): Promise<{ dishes: Dish[]; total: number }> {
    const queryBuilder = this.dishRepository
      .createQueryBuilder('dish')
      .leftJoinAndSelect('dish.ingredients', 'dishIngredient')
      .leftJoinAndSelect('dishIngredient.ingredient', 'ingredient');

    if (search) {
      queryBuilder.andWhere('LOWER(dish.name) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }

    if (ingredientIds && ingredientIds.length > 0) {
      queryBuilder.andWhere('dishIngredient.ingredientId IN (:...ingredientIds)', {
        ingredientIds,
      });
    }

    if (skip !== undefined) {
      queryBuilder.skip(skip);
    }
    if (take !== undefined) {
      queryBuilder.take(take);
    }

    const [dishes, total] = await queryBuilder.getManyAndCount();

    const dishesWithCalories = await Promise.all(
      dishes.map(async (dish) => this.calculateTotalCalories(dish)),
    );

    return { dishes: dishesWithCalories, total };
  }

  async findOne(id: string): Promise<Dish> {
    const dish = await this.dishRepository.findOne({
      where: { id },
      relations: ['ingredients', 'ingredients.ingredient'],
    });

    if (!dish) {
      throw new NotFoundException(`Dish with ID ${id} not found`);
    }

    return this.calculateTotalCalories(dish);
  }

  async update(id: string, updateDishDto: UpdateDishDto): Promise<Dish> {
    const existingDish = await this.dishRepository.findOne({ where: { id } });
    if (!existingDish) {
      throw new NotFoundException(`Dish with ID ${id} not found`);
    }

    if (updateDishDto.name) {
      existingDish.name = updateDishDto.name;
    }
    if (updateDishDto.description !== undefined) {
      existingDish.description = updateDishDto.description;
    }

    await this.dishRepository.save(existingDish);

    if (updateDishDto.ingredients) {
      // Remove existing ingredients for this dish
      await this.dishIngredientRepository.delete({ dishId: id });

      await Promise.all(
        updateDishDto.ingredients.map(async (ingredientDto) => {
          const ingredient = await this.ingredientRepository.findOne({
            where: { id: ingredientDto.ingredientId },
          });
          if (!ingredient) {
            throw new NotFoundException(
              `Ingredient with ID ${ingredientDto.ingredientId} not found`,
            );
          }
          const dishIngredient = this.dishIngredientRepository.create({
            dishId: id,
            ingredientId: ingredientDto.ingredientId,
            quantity: ingredientDto.quantity,
          });
          await this.dishIngredientRepository.save(dishIngredient);
        }),
      );
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.dishRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Dish with ID ${id} not found`);
    }
  }

  private async calculateTotalCalories(dish: Dish): Promise<Dish> {
    let totalCalories = 0;
    if (dish.ingredients && dish.ingredients.length > 0) {
      for (const dishIngredient of dish.ingredients) {
        // Ensure ingredient is loaded
        if (!dishIngredient.ingredient) {
          dishIngredient.ingredient = await this.ingredientRepository.findOne({
            where: { id: dishIngredient.ingredientId },
          });
        }

        if (
          dishIngredient.ingredient &&
          dishIngredient.ingredient.caloriesPerUnit
        ) {
          totalCalories +=
            dishIngredient.quantity *
            dishIngredient.ingredient.caloriesPerUnit;
        }
      }
    }
    dish.totalCalories = totalCalories;
    return dish;
  }
}
