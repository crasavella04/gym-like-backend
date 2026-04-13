import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { MealsService } from './meals.service';
import { Meal } from './entities/meal.entity';
import { Dish } from '../dishes/entities/dish.entity';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';

describe('MealsService', () => {
  let service: MealsService;
  let mealsRepository: jest.Mocked<Repository<Meal>>;
  let dishesRepository: jest.Mocked<Repository<Dish>>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    firstname: 'John',
    lastname: 'Doe',
  };

  const mockDish: Dish = {
    id: 'dish-123',
    title: 'Test Dish',
    description: 'Test description',
    ingredients: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMeal: Meal = {
    id: 'meal-123',
    timestamp: new Date(),
    mealNumber: 1,
    dishId: 'dish-123',
    userId: 'user-123',
    user: mockUser as any,
    dish: mockDish,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMealsRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockDishesRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MealsService,
        {
          provide: getRepositoryToken(Meal),
          useValue: mockMealsRepository,
        },
        {
          provide: getRepositoryToken(Dish),
          useValue: mockDishesRepository,
        },
      ],
    }).compile();

    service = module.get<MealsService>(MealsService);
    mealsRepository = module.get(getRepositoryToken(Meal));
    dishesRepository = module.get(getRepositoryToken(Dish));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of meals for a user', async () => {
      mockMealsRepository.find.mockResolvedValue([mockMeal]);

      const result = await service.findAll('user-123');

      expect(result).toEqual([mockMeal]);
      expect(mockMealsRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        relations: ['dish'],
      });
    });

    it('should return empty array if user has no meals', async () => {
      mockMealsRepository.find.mockResolvedValue([]);

      const result = await service.findAll('user-123');

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single meal by id', async () => {
      mockMealsRepository.findOne.mockResolvedValue(mockMeal);

      const result = await service.findOne('meal-123', 'user-123');

      expect(result).toEqual(mockMeal);
      expect(mockMealsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'meal-123' },
        relations: ['dish'],
      });
    });

    it('should throw NotFoundException if meal does not exist', async () => {
      mockMealsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('meal-123', 'user-123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if userId does not match', async () => {
      const otherUserMeal = { ...mockMeal, userId: 'other-user-123' };
      mockMealsRepository.findOne.mockResolvedValue(otherUserMeal);

      await expect(service.findOne('meal-123', 'user-123')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('create', () => {
    it('should create a new meal successfully', async () => {
      const createDto: CreateMealDto = {
        mealNumber: 1,
        timestamp: new Date(),
        dishId: 'dish-123',
      };

      mockDishesRepository.findOne.mockResolvedValue(mockDish);
      mockMealsRepository.create.mockReturnValue(mockMeal);
      mockMealsRepository.save.mockResolvedValue(mockMeal);

      const result = await service.create('user-123', createDto);

      expect(result).toEqual(mockMeal);
      expect(mockDishesRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'dish-123' },
      });
      expect(mockMealsRepository.create).toHaveBeenCalledWith({
        ...createDto,
        userId: 'user-123',
      });
    });

    it('should throw NotFoundException if dish does not exist', async () => {
      const createDto: CreateMealDto = {
        mealNumber: 1,
        timestamp: new Date(),
        dishId: 'non-existent-dish',
      };

      mockDishesRepository.findOne.mockResolvedValue(null);

      await expect(service.create('user-123', createDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a meal successfully', async () => {
      const updateDto: UpdateMealDto = {
        mealNumber: 2,
      };

      const updatedMeal = { ...mockMeal, mealNumber: 2 };
      mockMealsRepository.findOne.mockResolvedValue(mockMeal);
      mockMealsRepository.save.mockResolvedValue(updatedMeal);

      const result = await service.update('meal-123', 'user-123', updateDto);

      expect(result).toEqual(updatedMeal);
      expect(mockMealsRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if meal does not exist', async () => {
      const updateDto: UpdateMealDto = { mealNumber: 2 };

      mockMealsRepository.findOne.mockResolvedValue(null);

      await expect(service.update('meal-123', 'user-123', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if userId does not match', async () => {
      const updateDto: UpdateMealDto = { mealNumber: 2 };
      const otherUserMeal = { ...mockMeal, userId: 'other-user-123' };

      mockMealsRepository.findOne.mockResolvedValue(otherUserMeal);

      await expect(service.update('meal-123', 'user-123', updateDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException if new dishId does not exist', async () => {
      const updateDto: UpdateMealDto = { dishId: 'non-existent-dish' };

      mockMealsRepository.findOne.mockResolvedValue(mockMeal);
      mockDishesRepository.findOne.mockResolvedValue(null);

      await expect(service.update('meal-123', 'user-123', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a meal successfully', async () => {
      mockMealsRepository.findOne.mockResolvedValue(mockMeal);
      mockMealsRepository.remove.mockResolvedValue(undefined);

      await service.remove('meal-123', 'user-123');

      expect(mockMealsRepository.remove).toHaveBeenCalledWith(mockMeal);
    });

    it('should throw NotFoundException if meal does not exist', async () => {
      mockMealsRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('meal-123', 'user-123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if userId does not match', async () => {
      const otherUserMeal = { ...mockMeal, userId: 'other-user-123' };
      mockMealsRepository.findOne.mockResolvedValue(otherUserMeal);

      await expect(service.remove('meal-123', 'user-123')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
