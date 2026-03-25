import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Exercise } from './entities/exercises.entity';
import { ILike, Repository } from 'typeorm';
import { FilesService } from 'src/files/files.service';
import { CreateExerciseDto } from './dto/CreateExerciseDto';
import { UpdateExerciseDto } from './dto/UpdateExerciseDto';

@Injectable()
export class ExercisesService {
  constructor(
    @InjectRepository(Exercise)
    private readonly exercisesRepository: Repository<Exercise>,
    private filesService: FilesService,
  ) {}

  async findOneExercises(id: string) {
    const exercise = await this.exercisesRepository.findOne({ where: { id } });

    if (!exercise) {
      throw new HttpException('Exercise not found', HttpStatus.NOT_FOUND);
    }

    return exercise;
  }

  async findAllExercises(filterText?: string) {
    return this.exercisesRepository.find({
      where: filterText
        ? {
            title: ILike(`%${filterText}%`),
          }
        : {},
    });
  }

  async createExercise(dto: CreateExerciseDto) {
    let videoLink: string | undefined = undefined;
    const { video, ...body } = dto;

    if (dto.video) {
      videoLink = await this.filesService.save(dto.video);
    }

    return this.exercisesRepository.save({ ...body, videoLink });
  }

  async updateExercise(id: string, dto: UpdateExerciseDto) {
    let videoLink: string | undefined = undefined;
    const { video, ...body } = dto;

    const exercise = await this.findOneExercises(id);

    if (!exercise) {
      throw new HttpException('Exercise not found', HttpStatus.NOT_FOUND);
    }

    if (dto.video) {
      videoLink = await this.filesService.save(dto.video);
    }

    return this.exercisesRepository.update({ id }, { ...body, videoLink });
  }

  async removeExercise(id: string) {
    return this.exercisesRepository.delete({ id });
  }
}
