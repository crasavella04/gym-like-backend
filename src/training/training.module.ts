import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingService } from './training.service';
import { TrainingController } from './training.controller';
import { Training } from './entities/training.entity';
import { TrainingExercises } from './entities/training-exercises.entity';
import { ExerciseSets } from './entities/exercise_sets.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Training, TrainingExercises, ExerciseSets]),
  ],
  controllers: [TrainingController],
  providers: [TrainingService],
  exports: [TrainingService],
})
export class TrainingModule {}
