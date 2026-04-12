import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dish } from './entities/dish.entity';
import { DishIngredient } from './entities/dish-ingredient.entity';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { FilterDishDto } from './dto/filter-dish.dto';

@Injectable()
export class DishesService {
  constructor(
    @InjectRepository(Dish)
    private dishRepo: Repository<Dish>,
    @InjectRepository(DishIngredient)
    private dishIngredientRepo: Repository<DishIngredient>,
  ) {}

  async create(dto: CreateDishDto): Promise<Dish> {
    const dish = this.dishRepo.create({
      title: dto.title,
      description: dto.description,
      ingredients: dto.ingredients.map((i) =>
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
      qb.andWhere('ingredient.id IN (:...ingredientIds)', {
        ingredientIds: filter.ingredientIds,
      });
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
    const dish = await this.findOne(id);

    if (dto.title !== undefined) dish.title = dto.title;
    if (dto.description !== undefined) dish.description = dto.description;

    if (dto.ingredients !== undefined) {
      await this.dishIngredientRepo.delete({ dishId: id });
      dish.ingredients = dto.ingredients.map((i) =>
        this.dishIngredientRepo.create({
          ingredientId: i.ingredientId,
          quantity: i.quantity,
          dishId: id,
        }),
      );
    }

    return this.dishRepo.save(dish);
  }

  async remove(id: string): Promise<void> {
    const dish = await this.findOne(id);
    await this.dishRepo.remove(dish);
  }
}
