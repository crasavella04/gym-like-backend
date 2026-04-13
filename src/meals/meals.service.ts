import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meal } from './entities/meal.entity';
import { Dish } from '../dishes/entities/dish.entity';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';

@Injectable()
export class MealsService {
  constructor(
    @InjectRepository(Meal)
    private mealsRepository: Repository<Meal>,
    @InjectRepository(Dish)
    private dishesRepository: Repository<Dish>,
  ) {}

  async findAll(userId: string): Promise<Meal[]> {
    return this.mealsRepository.find({
      where: { userId },
      relations: ['dish'],
    });
  }

  async findOne(id: string, userId: string): Promise<Meal> {
    const meal = await this.mealsRepository.findOne({
      where: { id },
      relations: ['dish'],
    });

    if (!meal) {
      throw new NotFoundException(`Meal with ID ${id} not found`);
    }

    if (meal.userId !== userId) {
      throw new ForbiddenException('You do not have permission to access this meal');
    }

    return meal;
  }

  async create(userId: string, createMealDto: CreateMealDto): Promise<Meal> {
    const dish = await this.dishesRepository.findOne({
      where: { id: createMealDto.dishId },
    });

    if (!dish) {
      throw new NotFoundException(`Dish with ID ${createMealDto.dishId} not found`);
    }

    const meal = this.mealsRepository.create({
      ...createMealDto,
      userId,
    });

    return this.mealsRepository.save(meal);
  }

  async update(id: string, userId: string, updateMealDto: UpdateMealDto): Promise<Meal> {
    const meal = await this.mealsRepository.findOne({
      where: { id },
    });

    if (!meal) {
      throw new NotFoundException(`Meal with ID ${id} not found`);
    }

    if (meal.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this meal');
    }

    if (updateMealDto.dishId) {
      const dish = await this.dishesRepository.findOne({
        where: { id: updateMealDto.dishId },
      });

      if (!dish) {
        throw new NotFoundException(`Dish with ID ${updateMealDto.dishId} not found`);
      }
    }

    Object.assign(meal, updateMealDto);
    return this.mealsRepository.save(meal);
  }

  async remove(id: string, userId: string): Promise<void> {
    const meal = await this.mealsRepository.findOne({
      where: { id },
    });

    if (!meal) {
      throw new NotFoundException(`Meal with ID ${id} not found`);
    }

    if (meal.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this meal');
    }

    await this.mealsRepository.remove(meal);
  }
}
