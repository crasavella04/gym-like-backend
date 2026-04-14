import { Test, TestingModule } from '@nestjs/testing';
import { TrainingController } from './training.controller';
import { TrainingService } from './training.service';
import { Training } from './entities/training.entity';
import { User } from '../users/entities/user.entity';
import { ForbiddenException } from '@nestjs/common';

describe('TrainingController', () => {
  let controller: TrainingController;
  let service: TrainingService;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    firstname: 'John',
    lastname: 'Doe',
    password: 'hashed',
    trainings: [],
    meals: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTraining: Training = {
    id: 'training-123',
    date: Date.now(),
    userId: 'user-123',
    user: mockUser,
    author: null,
    exercises: [],
  };

  const mockRequest = {
    user: { id: 'user-123' },
  } as any;

  const mockTrainingService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrainingController],
      providers: [
        {
          provide: TrainingService,
          useValue: mockTrainingService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard as any)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TrainingController>(TrainingController);
    service = module.get<TrainingService>(TrainingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all trainings for current user', async () => {
      mockTrainingService.findAll.mockResolvedValue([mockTraining]);

      const result = await controller.findAll(mockRequest);

      expect(result).toEqual([mockTraining]);
      expect(mockTrainingService.findAll).toHaveBeenCalledWith('user-123');
    });

    it('should return empty array if user has no trainings', async () => {
      mockTrainingService.findAll.mockResolvedValue([]);

      const result = await controller.findAll(mockRequest);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single training by id', async () => {
      mockTrainingService.findOne.mockResolvedValue(mockTraining);

      const result = await controller.findOne(mockRequest, 'training-123');

      expect(result).toEqual(mockTraining);
      expect(mockTrainingService.findOne).toHaveBeenCalledWith(
        'user-123',
        'training-123',
      );
    });

    it('should throw ForbiddenException if training belongs to another user', async () => {
      mockTrainingService.findOne.mockRejectedValue(
        new ForbiddenException('You do not have permission to access this training'),
      );

      await expect(
        controller.findOne(mockRequest, 'other-training'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('create', () => {
    it('should create a new training', async () => {
      const createDto = { date: Date.now() };
      mockTrainingService.create.mockResolvedValue(mockTraining);

      const result = await controller.create(mockRequest, createDto);

      expect(result).toEqual(mockTraining);
      expect(mockTrainingService.create).toHaveBeenCalledWith(
        'user-123',
        createDto,
      );
    });
  });

  describe('update', () => {
    it('should update a training', async () => {
      const updateDto = { date: Date.now() + 1000 };
      const updatedTraining = { ...mockTraining, ...updateDto };
      mockTrainingService.update.mockResolvedValue(updatedTraining);

      const result = await controller.update(mockRequest, 'training-123', updateDto);

      expect(result).toEqual(updatedTraining);
      expect(mockTrainingService.update).toHaveBeenCalledWith(
        'user-123',
        'training-123',
        updateDto,
      );
    });

    it('should throw ForbiddenException if training belongs to another user', async () => {
      const updateDto = { date: Date.now() };
      mockTrainingService.update.mockRejectedValue(
        new ForbiddenException('You do not have permission to update this training'),
      );

      await expect(
        controller.update(mockRequest, 'other-training', updateDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete a training', async () => {
      mockTrainingService.remove.mockResolvedValue(undefined);

      await controller.remove(mockRequest, 'training-123');

      expect(mockTrainingService.remove).toHaveBeenCalledWith(
        'user-123',
        'training-123',
      );
    });

    it('should throw ForbiddenException if training belongs to another user', async () => {
      mockTrainingService.remove.mockRejectedValue(
        new ForbiddenException('You do not have permission to delete this training'),
      );

      await expect(
        controller.remove(mockRequest, 'other-training'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});

// Import for overrideGuard
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
