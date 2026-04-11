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
  @ApiOperation({ summary: 'Get all ingredients with pagination and search' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by title' })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Skip records' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Take records' })
  @ApiResponse({
    status: 200,
    description: 'List of ingredients with total count',
    schema: {
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/Ingredient' } },
        total: { type: 'number' },
      },
    },
  })
  findAll(
    @Query('search') search?: string,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 10,
  ): Promise<{ data: Ingredient[]; total: number }> {
    return this.ingredientsService.findAll(search, skip, take);
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
  @ApiResponse({ status: 204, description: 'Ingredient deleted' })
  @ApiResponse({ status: 404, description: 'Ingredient not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.ingredientsService.remove(id);
  }
}
