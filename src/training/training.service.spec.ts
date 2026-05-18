import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TrainingService } from './training.service';
import { Training } from './entities/training.entity';
import { User } from '../users/entities/user.entity';
import { CreateTrainingDto } from './dto/CreateTrainingDto';
import { UpdateTrainingDto } from './dto/UpdateTrainingDto';

describe('TrainingService', () => {
  let service: TrainingService;
  let trainingRepository: jest.Mocked<Repository<Training>>;

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

  const mockTrainingRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrainingService,
        {
          provide: getRepositoryToken(Training),
          useValue: mockTrainingRepository,
        },
      ],
    }).compile();

    service = module.get<TrainingService>(TrainingService);
    trainingRepository = module.get(getRepositoryToken(Training));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of trainings for a user', async () => {
      mockTrainingRepository.find.mockResolvedValue([mockTraining]);

      const result = await service.findAll('user-123');

      expect(result).toEqual([mockTraining]);
      expect(mockTrainingRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });
    });

    it('should return empty array if user has no trainings', async () => {
      mockTrainingRepository.find.mockResolvedValue([]);

      const result = await service.findAll('user-123');

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single training by id', async () => {
      mockTrainingRepository.findOne.mockResolvedValue(mockTraining);

      const result = await service.findOne('user-123', 'training-123');

      expect(result).toEqual(mockTraining);
      expect(mockTrainingRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'training-123' },
      });
    });

    it('should throw NotFoundException if training does not exist', async () => {
      mockTrainingRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('user-123', 'training-123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if userId does not match', async () => {
      const otherUserTraining = { ...mockTraining, userId: 'other-user-123' };
      mockTrainingRepository.findOne.mockResolvedValue(otherUserTraining);

      await expect(service.findOne('user-123', 'training-123')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('create', () => {
    it('should create a new training successfully', async () => {
      const createDto: CreateTrainingDto = {
        date: Date.now(),
      };

      mockTrainingRepository.create.mockReturnValue(mockTraining);
      mockTrainingRepository.save.mockResolvedValue(mockTraining);

      const result = await service.create('user-123', createDto);

      expect(result).toEqual(mockTraining);
      expect(mockTrainingRepository.create).toHaveBeenCalledWith({
        ...createDto,
        userId: 'user-123',
      });
    });
  });

  describe('update', () => {
    it('should update a training successfully', async () => {
      const updateDto: UpdateTrainingDto = {
        date: Date.now() + 1000,
      };

      const updatedTraining = { ...mockTraining, ...updateDto };
      mockTrainingRepository.findOne.mockResolvedValue(mockTraining);
      mockTrainingRepository.save.mockResolvedValue(updatedTraining);

      const result = await service.update(
        'user-123',
        'training-123',
        updateDto,
      );

      expect(result).toEqual(updatedTraining);
    });

    it('should throw NotFoundException if training does not exist', async () => {
      const updateDto: UpdateTrainingDto = { date: Date.now() };

      mockTrainingRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('user-123', 'training-123', updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if userId does not match', async () => {
      const updateDto: UpdateTrainingDto = { date: Date.now() };
      const otherUserTraining = { ...mockTraining, userId: 'other-user-123' };

      mockTrainingRepository.findOne.mockResolvedValue(otherUserTraining);

      await expect(
        service.update('user-123', 'training-123', updateDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete a training successfully', async () => {
      mockTrainingRepository.findOne.mockResolvedValue(mockTraining);
      mockTrainingRepository.remove.mockResolvedValue(undefined);

      await service.remove('user-123', 'training-123');

      expect(mockTrainingRepository.remove).toHaveBeenCalledWith(mockTraining);
    });

    it('should throw NotFoundException if training does not exist', async () => {
      mockTrainingRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('user-123', 'training-123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if userId does not match', async () => {
      const otherUserTraining = { ...mockTraining, userId: 'other-user-123' };
      mockTrainingRepository.findOne.mockResolvedValue(otherUserTraining);

      await expect(service.remove('user-123', 'training-123')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
