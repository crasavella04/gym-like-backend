import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import type { IPayload } from '../jwt/types/IPayload';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MealsService } from './meals.service';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { JwtAuth } from '../auth/decorators/jwt-auth.decorator';

@ApiTags('meals')
@ApiBearerAuth()
@Controller('meals')
@JwtAuth()
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all meals for current user' })
  @ApiResponse({ status: 200, description: 'Returns all meals for the user' })
  findAll(@Req() req: Request) {
    return this.mealsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific meal by ID' })
  @ApiResponse({ status: 200, description: 'Returns the meal' })
  @ApiResponse({ status: 404, description: 'Meal not found' })
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.mealsService.findOne(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new meal' })
  @ApiResponse({ status: 201, description: 'Meal created successfully' })
  @ApiResponse({ status: 404, description: 'Dish not found' })
  create(@Req() req: Request, @Body() createMealDto: CreateMealDto) {
    return this.mealsService.create(req.user.id, createMealDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a meal' })
  @ApiResponse({ status: 200, description: 'Meal updated successfully' })
  @ApiResponse({ status: 404, description: 'Meal not found' })
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateMealDto: UpdateMealDto,
  ) {
    return this.mealsService.update(id, req.user.id, updateMealDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a meal' })
  @ApiResponse({ status: 200, description: 'Meal deleted successfully' })
  @ApiResponse({ status: 404, description: 'Meal not found' })
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.mealsService.remove(id, req.user.id);
  }
}
