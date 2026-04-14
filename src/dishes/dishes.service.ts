import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dish } from './entities/dish.entity';
import { DishIngredient } from './entities/dish-ingredient.entity';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { FilterDishDto } from './dto/filter-dish.dto';
import { IngredientsService } from '../ingredients/ingredients.service';
import { Ingredient } from '../ingredients/ingredient.entity';

@Injectable()
export class DishesService {
  constructor(
    @InjectRepository(Dish)
    private dishRepo: Repository<Dish>,
    @InjectRepository(DishIngredient)
    private dishIngredientRepo: Repository<DishIngredient>,
    private ingredientsService: IngredientsService,
  ) {}

  async create(dto: CreateDishDto): Promise<Dish> {
    // Validate ingredient IDs exist
    for (const ingredient of dto.ingredients || []) {
      const exists = await this.ingredientsService.findOne(ingredient.ingredientId);
      if (!exists) {
        throw new NotFoundException(
          `Ingredient with ID "${ingredient.ingredientId}" not found`,
        );
      }
    }

    const dish = this.dishRepo.create({
      title: dto.title,
      description: dto.description,
      ingredients: dto.ingredients?.map((i) =>
        this.dishIngredientRepo.create({
          ingredientId: i.ingredientId,
          quantity: i.quantity,
        }),
      ),
    });
    return this.dishRepo.save(dish);
  }

  async findAll(filter?: FilterDishDto, skip = 0, take = 10) {
    const qb = this.dishRepo
      .createQueryBuilder('dish')
      .leftJoinAndSelect('dish.ingredients', 'di')
      .leftJoinAndSelect('di.ingredient', 'ingredient')
      .orderBy('dish.createdAt', 'DESC')
      .skip(skip)
      .take(take);

    if (filter?.title) {
      qb.andWhere('dish.title ILIKE :title', {
        title: `%${filter.title}%`,
      });
    }

    if (filter?.ingredientIds && filter.ingredientIds.length > 0) {
      qb.andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('di.dishId')
          .from(DishIngredient, 'di')
          .where('di.ingredientId IN (:...ingredientIds)')
          .getQuery();
        return 'dish.id IN ' + subQuery;
      }, { ingredientIds: filter.ingredientIds });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string): Promise<Dish> {
    const dish = await this.dishRepo.findOne({
      where: { id },
      relations: ['ingredients', 'ingredients.ingredient'],
    });
    if (!dish) throw new NotFoundException(`Dish with ID "${id}" not found`);
    return dish;
  }

  async update(id: string, dto: UpdateDishDto): Promise<Dish> {
    return this.dishRepo.manager.transaction(
      async (transactionalEntityManager) => {
        const dish = await transactionalEntityManager.findOne(Dish, {
          where: { id },
          relations: ['ingredients', 'ingredients.ingredient'],
        });
        if (!dish)
          throw new NotFoundException(`Dish with ID "${id}" not found`);

        if (dto.title !== undefined) dish.title = dto.title;
        if (dto.description !== undefined) dish.description = dto.description;

        if (dto.ingredients !== undefined) {
          // Validate ingredient IDs exist
          for (const ingredient of dto.ingredients) {
            const exists = await transactionalEntityManager.findOne(
              Ingredient,
              {
                where: { id: ingredient.ingredientId },
              },
            );
            if (!exists) {
              throw new NotFoundException(
                `Ingredient with ID "${ingredient.ingredientId}" not found`,
              );
            }
          }

          await transactionalEntityManager.delete(DishIngredient, { dishId: id });
          dish.ingredients = dto.ingredients.map((i) =>
            transactionalEntityManager.create(DishIngredient, {
              ingredientId: i.ingredientId,
              quantity: i.quantity,
              dishId: id,
            }),
          );
        }

        return transactionalEntityManager.save(dish);
      },
    );
  }

  async remove(id: string): Promise<void> {
    const dish = await this.findOne(id);
    await this.dishRepo.remove(dish);
  }
}
