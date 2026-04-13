import { Test, TestingModule } from '@nestjs/testing';
import { MealsController } from './meals.controller';
import { MealsService } from './meals.service';
import { Meal } from './entities/meal.entity';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { IPayload } from '../jwt/types/IPayload';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('MealsController', () => {
  let controller: MealsController;
  let service: MealsService;

  const mockUserId = 'user-123';
  const mockUser: IPayload = {
    id: mockUserId,
    email: 'test@example.com',
  };

  const mockRequest = {
    user: mockUser,
  } as Request;

  const mockMeal: Meal = {
    id: 'meal-1',
    userId: mockUserId,
    dishId: 'dish-1',
    mealNumber: 1,
    timestamp: new Date('2024-01-01T12:00:00Z'),
    createdAt: new Date(),
    updatedAt: new Date(),
    dish: null,
    user: null,
  };

  const mockMealsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MealsController],
      providers: [
        {
          provide: MealsService,
          useValue: mockMealsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<MealsController>(MealsController);
    service = module.get<MealsService>(MealsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of meals for the current user', async () => {
      const expected = [mockMeal];
      mockMealsService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll(mockRequest);

      expect(service.findAll).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should return a single meal', async () => {
      mockMealsService.findOne.mockResolvedValue(mockMeal);

      const result = await controller.findOne(mockRequest, mockMeal.id);

      expect(service.findOne).toHaveBeenCalledWith(mockMeal.id, mockUserId);
      expect(result).toEqual(mockMeal);
    });
  });

  describe('create', () => {
    it('should create a new meal', async () => {
      const createMealDto: CreateMealDto = {
        dishId: 'dish-1',
        mealNumber: 1,
        timestamp: new Date('2024-01-01T12:00:00Z'),
      };

      mockMealsService.create.mockResolvedValue(mockMeal);

      const result = await controller.create(mockRequest, createMealDto);

      expect(service.create).toHaveBeenCalledWith(mockUserId, createMealDto);
      expect(result).toEqual(mockMeal);
    });
  });

  describe('update', () => {
    it('should update a meal', async () => {
      const updateMealDto: UpdateMealDto = {
        mealNumber: 2,
      };

      const updatedMeal = { ...mockMeal, mealNumber: 2 };
      mockMealsService.update.mockResolvedValue(updatedMeal);

      const result = await controller.update(
        mockRequest,
        mockMeal.id,
        updateMealDto,
      );

      expect(service.update).toHaveBeenCalledWith(
        mockMeal.id,
        mockUserId,
        updateMealDto,
      );
      expect(result).toEqual(updatedMeal);
    });
  });

  describe('remove', () => {
    it('should delete a meal', async () => {
      mockMealsService.remove.mockResolvedValue(undefined);

      await controller.remove(mockRequest, mockMeal.id);

      expect(service.remove).toHaveBeenCalledWith(mockMeal.id, mockUserId);
    });
  });
});
