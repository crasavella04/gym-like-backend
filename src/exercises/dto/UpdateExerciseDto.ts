import { PartialType } from '@nestjs/swagger';
import { CreateExerciseDto } from './CreateExerciseDto';

export class UpdateExerciseDto extends PartialType(CreateExerciseDto) {}
