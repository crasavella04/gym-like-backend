import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { MealsService } from './meals.service';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';

@ApiTags('meals')
@Controller('meals')
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Get all meals for a user' })
  @ApiResponse({ status: 200, description: 'Returns all meals for the user' })
  findAll(@Param('userId') userId: string) {
    return this.mealsService.findAll(userId);
  }

  @Get(':userId/:id')
  @ApiOperation({ summary: 'Get a specific meal by ID' })
  @ApiResponse({ status: 200, description: 'Returns the meal' })
  @ApiResponse({ status: 404, description: 'Meal not found' })
  findOne(@Param('userId') userId: string, @Param('id') id: string) {
    return this.mealsService.findOne(id, userId);
  }

  @Post(':userId')
  @ApiOperation({ summary: 'Create a new meal' })
  @ApiResponse({ status: 201, description: 'Meal created successfully' })
  @ApiResponse({ status: 404, description: 'Dish not found' })
  create(@Param('userId') userId: string, @Body() createMealDto: CreateMealDto) {
    return this.mealsService.create(userId, createMealDto);
  }

  @Patch(':userId/:id')
  @ApiOperation({ summary: 'Update a meal' })
  @ApiResponse({ status: 200, description: 'Meal updated successfully' })
  @ApiResponse({ status: 404, description: 'Meal not found' })
  update(
    @Param('userId') userId: string,
    @Param('id') id: string,
    @Body() updateMealDto: UpdateMealDto,
  ) {
    return this.mealsService.update(id, userId, updateMealDto);
  }

  @Delete(':userId/:id')
  @ApiOperation({ summary: 'Delete a meal' })
  @ApiResponse({ status: 200, description: 'Meal deleted successfully' })
  @ApiResponse({ status: 404, description: 'Meal not found' })
  remove(@Param('userId') userId: string, @Param('id') id: string) {
    return this.mealsService.remove(id, userId);
  }
}
