import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Metric } from './entities/metrics.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMetricDto } from './dto/CreateMetricDto';
import { UpdateMetricDto } from './dto/UpdateMetricDto';

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(Metric)
    private readonly metricsRepository: Repository<Metric>,
  ) {}

  async findAllByUserId(userId: string): Promise<Metric[]> {
    return await this.metricsRepository.find({ where: { userId } });
  }

  async findOne(id: string): Promise<Metric | null> {
    return await this.metricsRepository.findOne({ where: { id } });
  }

  async create(dto: CreateMetricDto): Promise<Metric> {
    return await this.metricsRepository.save(dto);
  }

  async updateMetricFromUser(userId: string, id: string, dto: UpdateMetricDto) {
    const metric = await this.findOne(id);

    if (!metric) {
      throw new HttpException('Metric not found', HttpStatus.NOT_FOUND);
    }

    if (metric.userId !== userId) {
      throw new HttpException('Metric not found', HttpStatus.NOT_FOUND);
    }

    await this.metricsRepository.update(id, dto);
    return { ...metric, ...dto };
  }

  async update(id: string, dto: UpdateMetricDto): Promise<Metric> {
    const metric = await this.findOne(id);

    if (!metric) {
      throw new HttpException('Metric not found', HttpStatus.NOT_FOUND);
    }

    await this.metricsRepository.update(id, dto);
    return { ...metric, ...dto };
  }

  async remove(id: string): Promise<void> {
    await this.metricsRepository.delete(id);
  }
}
