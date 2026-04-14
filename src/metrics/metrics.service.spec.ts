import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { Metric } from './entities/metrics.entity';
import { CreateMetricDto } from './dto/CreateMetricDto';
import { UpdateMetricDto } from './dto/UpdateMetricDto';

describe('MetricsService', () => {
  let service: MetricsService;
  let metricsRepository: jest.Mocked<Repository<Metric>>;

  const mockUserId = 'user-123';

  const mockMetric: Metric = {
    id: 'metric-1',
    userId: mockUserId,
    height: 180,
    weight: 75.5,
    waistCircumference: 80,
    chestCircumference: 100,
    hipCircumference: 95,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: null,
  };

  const mockMetricsRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricsService,
        {
          provide: getRepositoryToken(Metric),
          useValue: mockMetricsRepository,
        },
      ],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
    metricsRepository = module.get(getRepositoryToken(Metric));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllByUserId', () => {
    it('should return an array of metrics for a user', async () => {
      mockMetricsRepository.find.mockResolvedValue([mockMetric]);

      const result = await service.findAllByUserId(mockUserId);

      expect(result).toEqual([mockMetric]);
      expect(mockMetricsRepository.find).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
    });

    it('should return empty array if user has no metrics', async () => {
      mockMetricsRepository.find.mockResolvedValue([]);

      const result = await service.findAllByUserId(mockUserId);

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create a new metric successfully', async () => {
      const createDto: CreateMetricDto = {
        height: 180,
        weight: 75.5,
      };

      mockMetricsRepository.save.mockResolvedValue(mockMetric);

      const result = await service.create(mockUserId, createDto);

      expect(result).toEqual(mockMetric);
      expect(mockMetricsRepository.save).toHaveBeenCalledWith({
        ...createDto,
        userId: mockUserId,
      });
    });
  });

  describe('updateMetricFromUser', () => {
    it('should update a metric successfully', async () => {
      const updateDto: UpdateMetricDto = {
        weight: 80,
      };

      const updatedMetric = { ...mockMetric, weight: 80 };
      mockMetricsRepository.findOne.mockResolvedValue(mockMetric);
      mockMetricsRepository.update.mockResolvedValue(undefined);

      const result = await service.updateMetricFromUser(
        mockUserId,
        mockMetric.id,
        updateDto,
      );

      expect(result).toEqual(updatedMetric);
      expect(mockMetricsRepository.update).toHaveBeenCalledWith(
        mockMetric.id,
        updateDto,
      );
    });

    it('should throw HttpException if metric does not exist', async () => {
      mockMetricsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateMetricFromUser(mockUserId, 'non-existent-id', {}),
      ).rejects.toThrow(HttpException);
    });

    it('should throw HttpException if userId does not match', async () => {
      const otherUserMetric = { ...mockMetric, userId: 'other-user-123' };
      mockMetricsRepository.findOne.mockResolvedValue(otherUserMetric);

      await expect(
        service.updateMetricFromUser(mockUserId, mockMetric.id, {}),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('findOne', () => {
    it('should return a single metric by id', async () => {
      mockMetricsRepository.findOne.mockResolvedValue(mockMetric);

      const result = await service.findOne(mockMetric.id);

      expect(result).toEqual(mockMetric);
      expect(mockMetricsRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockMetric.id },
      });
    });

    it('should return null if metric does not exist', async () => {
      mockMetricsRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete a metric successfully', async () => {
      mockMetricsRepository.delete.mockResolvedValue(undefined);

      await service.remove(mockMetric.id);

      expect(mockMetricsRepository.delete).toHaveBeenCalledWith(mockMetric.id);
    });
  });
});
