import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { DishesService } from './dishes.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { Dish } from './entities/dish.entity';

@ApiTags('dishes')
@Controller('dishes')
export class DishesController {
  constructor(private readonly dishesService: DishesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new dish' })
  @ApiResponse({
    status: 201,
    description: 'The dish has been successfully created.',
    type: Dish,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  create(@Body() createDishDto: CreateDishDto): Promise<Dish> {
    return this.dishesService.create(createDishDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve all dishes with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved dishes.',
    type: [Dish],
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'ingredientIds', required: false, type: [String] })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  async findAll(
    @Query('search') search?: string,
    @Query('ingredientIds') ingredientIds?: string | string[],
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ): Promise<{ dishes: Dish[]; total: number }> {
    const parsedIngredientIds = Array.isArray(ingredientIds)
      ? ingredientIds
      : ingredientIds === undefined
        ? undefined
        : [ingredientIds];

    return this.dishesService.findAll(
      search,
      parsedIngredientIds,
      +skip,
      +take,
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a single dish by ID' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved dish.', type: Dish })
  @ApiResponse({ status: 404, description: 'Dish not found' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the dish to retrieve',
    format: 'uuid',
  })
  findOne(@Param('id') id: string): Promise<Dish> {
    return this.dishesService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an existing dish' })
  @ApiResponse({ status: 200, description: 'Dish successfully updated.', type: Dish })
  @ApiResponse({ status: 404, description: 'Dish not found' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the dish to update',
    format: 'uuid',
  })
  update(@Param('id') id: string, @Body() updateDishDto: UpdateDishDto): Promise<Dish> {
    return this.dishesService.update(id, updateDishDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a dish by ID' })
  @ApiResponse({
    status: 204,
    description: 'Dish successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Dish not found' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the dish to delete',
    format: 'uuid',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.dishesService.remove(id);
  }
}
