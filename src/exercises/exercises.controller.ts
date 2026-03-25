import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto } from './dto/CreateExerciseDto';
import { UpdateExerciseDto } from './dto/UpdateExerciseDto';

@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Get()
  getAllExercises(@Query('text') text?: string) {
    return this.exercisesService.findAllExercises(text);
  }

  @Get(':id')
  getExercise(@Param('id') id: string) {
    return this.exercisesService.findOneExercises(id);
  }

  @Post()
  createExercise(@Body() body: CreateExerciseDto) {
    return this.exercisesService.createExercise(body);
  }

  @Patch(':id')
  updateExercise(@Param('id') id: string, @Body() body: UpdateExerciseDto) {
    return this.exercisesService.updateExercise(id, body);
  }

  @Delete(':id')
  removeExercise(@Param('id') id: string) {
    return this.exercisesService.removeExercise(id);
  }
}
