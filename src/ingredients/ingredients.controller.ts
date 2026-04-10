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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IngredientsService } from './ingredients.service';
import { Ingredient } from './ingredient.entity';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';

@ApiTags('ingredients')
@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new ingredient' })
  @ApiResponse({ status: 201, description: 'Ingredient created', type: Ingredient })
  create(@Body() createIngredientDto: CreateIngredientDto): Promise<Ingredient> {
    return this.ingredientsService.create(createIngredientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all ingredients (with optional search)' })
  @ApiResponse({ status: 200, description: 'List of ingredients', type: [Ingredient] })
  findAll(@Query('search') search?: string): Promise<Ingredient[]> {
    return this.ingredientsService.findAll(search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ingredient by ID' })
  @ApiResponse({ status: 200, description: 'Ingredient found', type: Ingredient })
  @ApiResponse({ status: 404, description: 'Ingredient not found' })
  findOne(@Param('id') id: string): Promise<Ingredient> {
    return this.ingredientsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update ingredient' })
  @ApiResponse({ status: 200, description: 'Ingredient updated', type: Ingredient })
  @ApiResponse({ status: 404, description: 'Ingredient not found' })
  update(
    @Param('id') id: string,
    @Body() updateIngredientDto: UpdateIngredientDto,
  ): Promise<Ingredient> {
    return this.ingredientsService.update(id, updateIngredientDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete ingredient' })
  @ApiResponse({ status: 200, description: 'Ingredient deleted' })
  @ApiResponse({ status: 404, description: 'Ingredient not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.ingredientsService.remove(id);
  }
}
