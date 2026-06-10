import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Training } from './entities/training.entity';
import { TrainingExercises } from './entities/training-exercises.entity';
import { ExerciseSets } from './entities/exercise_sets.entity';
import { CreateTrainingDto } from './dto/CreateTrainingDto';
import { UpdateTrainingDto } from './dto/UpdateTrainingDto';
import { UpdateSetRealValuesDto } from './dto/UpdateSetRealValuesDto';

@Injectable()
export class TrainingService {
  constructor(
    @InjectRepository(Training)
    private trainingRepository: Repository<Training>,
    @InjectRepository(TrainingExercises)
    private trainingExercisesRepository: Repository<TrainingExercises>,
    @InjectRepository(ExerciseSets)
    private exerciseSetsRepository: Repository<ExerciseSets>,
  ) {}

  async create(userId: string, dto: CreateTrainingDto): Promise<Training> {
    const training = await this.trainingRepository.save(
      this.trainingRepository.create({
        date: dto.date,
        title: dto.title,
        userId,
        author: { id: userId },
      }),
    );

    for (let i = 0; i < dto.exercises.length; i++) {
      const exerciseDto = dto.exercises[i];

      const trainingExercise = await this.trainingExercisesRepository.save({
        training: { id: training.id },
        exercise: { id: exerciseDto.id },
        orderNumber: i,
      });

      if (exerciseDto.type === 'weight') {
        for (let j = 0; j < exerciseDto.sets.length; j++) {
          const set = exerciseDto.sets[j];
          await this.exerciseSetsRepository.save({
            exercise: { id: trainingExercise.id },
            orderNumber: j,
            plannedWeight: set.weight,
            plannedReps: set.reps,
          });
        }
      } else if (exerciseDto.type === 'reps') {
        for (let j = 0; j < exerciseDto.sets.length; j++) {
          const set = exerciseDto.sets[j];
          await this.exerciseSetsRepository.save({
            exercise: { id: trainingExercise.id },
            orderNumber: j,
            plannedReps: set.reps,
          });
        }
      } else if (exerciseDto.type === 'time') {
        for (let j = 0; j < exerciseDto.sets.length; j++) {
          const set = exerciseDto.sets[j];
          await this.exerciseSetsRepository.save({
            exercise: { id: trainingExercise.id },
            orderNumber: j,
            plannedTime: set.time,
          });
        }
      } else {
        for (let j = 0; j < exerciseDto.sets.length; j++) {
          const set = exerciseDto.sets[j];
          await this.exerciseSetsRepository.save({
            exercise: { id: trainingExercise.id },
            orderNumber: j,
            plannedDistance: set.distance,
          });
        }
      }
    }

    return this.findOne(userId, training.id);
  }

  async findAll(userId: string): Promise<Training[]> {
    return this.trainingRepository.find({
      where: { userId },
      relations: ['exercises', 'exercises.exercise', 'exercises.sets'],
    });
  }

  async findOne(userId: string, id: string): Promise<Training> {
    const training = await this.trainingRepository.findOne({
      where: { id },
      relations: ['exercises', 'exercises.exercise', 'exercises.sets'],
    });

    if (!training) {
      throw new NotFoundException(`Training with ID ${id} not found`);
    }

    if (training.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this training',
      );
    }

    return training;
  }

  async update(
    userId: string,
    id: string,
    { date, title }: UpdateTrainingDto,
  ): Promise<Training> {
    const training = await this.trainingRepository.findOne({
      where: { id },
    });

    if (!training) {
      throw new NotFoundException(`Training with ID ${id} not found`);
    }

    if (training.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this training',
      );
    }

    if (date !== undefined) training.date = date;
    if (title !== undefined) training.title = title;

    return this.trainingRepository.save(training);
  }

  async updateSetRealValues(
    trainingId: string,
    setId: string,
    dto: UpdateSetRealValuesDto,
  ): Promise<ExerciseSets> {
    const set = await this.exerciseSetsRepository.findOne({
      where: { id: setId },
      relations: ['exercise', 'exercise.training'],
    });

    if (!set || set.exercise.training.id !== trainingId) {
      throw new NotFoundException(`Set with ID ${setId} not found`);
    }

    await this.exerciseSetsRepository.update(setId, dto);

    return this.exerciseSetsRepository.findOne({ where: { id: setId } }) as Promise<ExerciseSets>;
  }

  async remove(userId: string, id: string): Promise<void> {
    console.log(2, id);
    const training = await this.trainingRepository.findOne({
      where: { id },
    });
    console.log(2, training);

    if (!training) {
      throw new NotFoundException(`Training with ID ${id} not found`);
    }

    if (training.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this training',
      );
    }

    await this.trainingRepository.remove(training);
  }
}
