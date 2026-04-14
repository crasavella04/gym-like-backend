import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meal } from './entities/meal.entity';
import { DishesService } from '../dishes/dishes.service';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';

@Injectable()
export class MealsService {
  constructor(
    @InjectRepository(Meal)
    private mealsRepository: Repository<Meal>,
    private dishesService: DishesService,
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
    const dish = await this.dishesService.findOne(createMealDto.dishId);

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
      await this.dishesService.findOne(updateMealDto.dishId);
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
