import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Ingredient } from './ingredient.entity';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';

@Injectable()
export class IngredientsService {
  constructor(
    @InjectRepository(Ingredient)
    private ingredientsRepository: Repository<Ingredient>,
  ) {}

  async create(createIngredientDto: CreateIngredientDto): Promise<Ingredient> {
    const ingredient = this.ingredientsRepository.create(createIngredientDto);
    return this.ingredientsRepository.save(ingredient);
  }

  async findAll(
    search?: string,
    skip: number = 0,
    take: number = 10,
  ): Promise<{ data: Ingredient[]; total: number }> {
    const where = search ? { title: Like(`%${search}%`) } : {};
    
    const [data, total] = await this.ingredientsRepository.findAndCount({
      where,
      skip,
      take,
    });

    return { data, total };
  }

  async findOne(id: string): Promise<Ingredient> {
    const ingredient = await this.ingredientsRepository.findOne({
      where: { id },
    });
    if (!ingredient) {
      throw new NotFoundException(
        `Ingredient with ID "${id}" not found in database`,
      );
    }
    return ingredient;
  }

  async update(
    id: string,
    updateIngredientDto: UpdateIngredientDto,
  ): Promise<Ingredient> {
    const ingredient = await this.findOne(id);
    Object.assign(ingredient, updateIngredientDto);
    return this.ingredientsRepository.save(ingredient);
  }

  async remove(id: string): Promise<void> {
    const ingredient = await this.findOne(id);
    await this.ingredientsRepository.remove(ingredient);
  }
}
