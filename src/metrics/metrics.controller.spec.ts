import { Test, TestingModule } from '@nestjs/testing';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { Metric } from './entities/metrics.entity';
import { CreateMetricDto } from './dto/CreateMetricDto';
import { UpdateMetricDto } from './dto/UpdateMetricDto';
import { IPayload } from '../jwt/types/IPayload';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

describe('MetricsController', () => {
  let controller: MetricsController;
  let service: MetricsService;

  const mockUserId = 'user-123';
  const mockUser: IPayload = {
    id: mockUserId,
    email: 'test@example.com',
  };

  const mockRequest = {
    user: mockUser,
  } as Request;

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

  const mockMetricsService = {
    findAllByUserId: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    updateMetricFromUser: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricsController],
      providers: [
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<MetricsController>(MetricsController);
    service = module.get<MetricsService>(MetricsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllMetrics', () => {
    it('should return an array of metrics for the current user', async () => {
      const expected = [mockMetric];
      mockMetricsService.findAllByUserId.mockResolvedValue(expected);

      const result = await controller.getAllMetrics(mockRequest);

      expect(service.findAllByUserId).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(expected);
    });
  });

  describe('createMetric', () => {
    it('should create a new metric', async () => {
      const createMetricDto: CreateMetricDto = {
        height: 180,
        weight: 75.5,
      };

      mockMetricsService.create.mockResolvedValue(mockMetric);

      const result = await controller.createMetric(mockRequest, createMetricDto);

      expect(service.create).toHaveBeenCalledWith(mockUserId, createMetricDto);
      expect(result).toEqual(mockMetric);
    });
  });

  describe('updateMetric', () => {
    it('should update a metric', async () => {
      const updateMetricDto: UpdateMetricDto = {
        weight: 80,
      };

      const updatedMetric = { ...mockMetric, weight: 80 };
      mockMetricsService.updateMetricFromUser.mockResolvedValue(updatedMetric);

      const result = await controller.updateMetric(
        mockRequest,
        mockMetric.id,
        updateMetricDto,
      );

      expect(service.updateMetricFromUser).toHaveBeenCalledWith(
        mockUserId,
        mockMetric.id,
        updateMetricDto,
      );
      expect(result).toEqual(updatedMetric);
    });
  });
});
