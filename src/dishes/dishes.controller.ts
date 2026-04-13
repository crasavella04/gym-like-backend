import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { DishesService } from './dishes.service';
import { Dish } from './entities/dish.entity';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { FilterDishDto } from './dto/filter-dish.dto';

@ApiTags('dishes')
@Controller('dishes')
export class DishesController {
  constructor(private readonly service: DishesService) {}

  @Post()
  @ApiOperation({ summary: 'Создать блюдо' })
  @ApiResponse({ status: 201, type: Dish })
  create(@Body() dto: CreateDishDto): Promise<Dish> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все блюда' })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'ingredientIds', required: false })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  findAll(
    @Query() filter: FilterDishDto,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 10,
  ) {
    return this.service.findAll(filter, skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить блюдо по ID' })
  @ApiResponse({ status: 200, type: Dish })
  findOne(@Param('id') id: string): Promise<Dish> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить блюдо' })
  @ApiResponse({ status: 200, type: Dish })
  update(@Param('id') id: string, @Body() dto: UpdateDishDto): Promise<Dish> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить блюдо' })
  @ApiResponse({ status: 204 })
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
