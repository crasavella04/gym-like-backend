import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Training } from './entities/training.entity';
import { CreateTrainingDto } from './dto/CreateTrainingDto';
import { UpdateTrainingDto } from './dto/UpdateTrainingDto';

@Injectable()
export class TrainingService {
  constructor(
    @InjectRepository(Training)
    private trainingRepository: Repository<Training>,
  ) {}

  async create(userId: string, createTrainingDto: CreateTrainingDto): Promise<Training> {
    const training = this.trainingRepository.create({
      ...createTrainingDto,
      userId,
    });

    return this.trainingRepository.save(training);
  }

  async findAll(userId: string): Promise<Training[]> {
    return this.trainingRepository.find({
      where: { userId },
    });
  }

  async findOne(userId: string, id: string): Promise<Training> {
    const training = await this.trainingRepository.findOne({
      where: { id },
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
    updateTrainingDto: UpdateTrainingDto,
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

    Object.assign(training, updateTrainingDto);
    return this.trainingRepository.save(training);
  }

  async remove(userId: string, id: string): Promise<void> {
    const training = await this.trainingRepository.findOne({
      where: { id },
    });

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
