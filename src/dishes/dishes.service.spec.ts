import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { DishesService } from './dishes.service';
import { Dish } from './entities/dish.entity';
import { DishIngredient } from './entities/dish-ingredient.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';

describe('DishesService', () => {
  let service: DishesService;
  let dishRepository: Repository<Dish>;
  let dishIngredientRepository: Repository<DishIngredient>;
  let ingredientRepository: Repository<Ingredient>;

  const mockDishRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(() => [[], 0]),
    })),
  };

  const mockDishIngredientRepository = {
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockIngredientRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DishesService,
        {
          provide: getRepositoryToken(Dish),
          useValue: mockDishRepository,
        },
        {
          provide: getRepositoryToken(DishIngredient),
          useValue: mockDishIngredientRepository,
        },
        {
          provide: getRepositoryToken(Ingredient),
          useValue: mockIngredientRepository,
        },
      ],
    }).compile();

    service = module.get<DishesService>(DishesService);
    dishRepository = module.get<Repository<Dish>>(getRepositoryToken(Dish));
    dishIngredientRepository = module.get<Repository<DishIngredient>>(
      getRepositoryToken(DishIngredient),
    );
    ingredientRepository = module.get<Repository<Ingredient>>(
      getRepositoryToken(Ingredient),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new dish', async () => {
      const createDishDto: CreateDishDto = {
        name: 'Test Dish',
        description: 'A test dish',
        ingredients: [{ ingredientId: 'ingredient1', quantity: 100 }],
      };

      const mockDish = { id: 'dish1', name: 'Test Dish' };
      const mockIngredient = {
        id: 'ingredient1',
        name: 'Test Ingredient',
        caloriesPerUnit: 1,
      };

      jest.spyOn(mockDishRepository, 'create').mockReturnValue(mockDish);
      jest.spyOn(mockDishRepository, 'save').mockResolvedValue(mockDish);
      jest
        .spyOn(mockIngredientRepository, 'findOne')
        .mockResolvedValue(mockIngredient);
      jest
        .spyOn(mockDishRepository, 'findOne')
        .mockResolvedValue({ ...mockDish, ingredients: [] }); // For calculateTotalCalories

      const result = await service.create(createDishDto);
      expect(result).toHaveProperty('id', 'dish1');
      expect(mockDishRepository.save).toHaveBeenCalledTimes(2); // dish + dishIngredient
    });

    it('should throw NotFoundException if ingredient not found', async () => {
      const createDishDto: CreateDishDto = {
        name: 'Test Dish',
        description: 'A test dish',
        ingredients: [{ ingredientId: 'nonexistent', quantity: 100 }],
      };

      const mockDish = { id: 'dish1', name: 'Test Dish' };

      jest.spyOn(mockDishRepository, 'create').mockReturnValue(mockDish);
      jest.spyOn(mockDishRepository, 'save').mockResolvedValue(mockDish);
      jest
        .spyOn(mockIngredientRepository, 'findOne')
        .mockResolvedValue(undefined);

      await expect(service.create(createDishDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all dishes', async () => {
      const mockDish = { id: 'dish1', name: 'Dish 1', ingredients: [] };
      jest
        .spyOn(mockDishRepository.createQueryBuilder(), 'getManyAndCount')
        .mockResolvedValueOnce([[mockDish], 1]);
      jest
        .spyOn(mockDishRepository, 'findOne')
        .mockResolvedValue(mockDish); // for calculateTotalCalories
      const { dishes, total } = await service.findAll();
      expect(dishes).toEqual([mockDish]);
      expect(total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a dish by id', async () => {
      const mockDish = { id: 'dish1', name: 'Dish 1', ingredients: [] };
      jest.spyOn(mockDishRepository, 'findOne').mockResolvedValue(mockDish);
      const result = await service.findOne('dish1');
      expect(result).toEqual(mockDish);
    });

    it('should throw NotFoundException if dish not found', async () => {
      jest.spyOn(mockDishRepository, 'findOne').mockResolvedValue(undefined);
      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update an existing dish', async () => {
      const updateDishDto: UpdateDishDto = {
        name: 'Updated Dish',
        ingredients: [{ ingredientId: 'ingredient1', quantity: 50 }],
      };
      const mockDish = { id: 'dish1', name: 'Old Dish', description: '...' };
      const mockIngredient = {
        id: 'ingredient1',
        name: 'Test Ingredient',
        caloriesPerUnit: 1,
      };

      jest.spyOn(mockDishRepository, 'findOne').mockResolvedValue(mockDish);
      jest.spyOn(mockDishRepository, 'save').mockResolvedValue({ ...mockDish, name: 'Updated Dish' });
      jest.spyOn(mockDishIngredientRepository, 'delete').mockResolvedValue({ affected: 1 });
      jest
        .spyOn(mockIngredientRepository, 'findOne')
        .mockResolvedValue(mockIngredient);

      const result = await service.update('dish1', updateDishDto);
      expect(result).toHaveProperty('name', 'Updated Dish');
      expect(mockDishRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if dish to update not found', async () => {
      jest.spyOn(mockDishRepository, 'findOne').mockResolvedValue(undefined);
      await expect(service.update('nonexistent', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a dish', async () => {
      jest
        .spyOn(mockDishRepository, 'delete')
        .mockResolvedValue({ affected: 1 });
      await expect(service.remove('dish1')).resolves.toBeUndefined();
    });

    it('should throw NotFoundException if dish to remove not found', async () => {
      jest
        .spyOn(mockDishRepository, 'delete')
        .mockResolvedValue({ affected: 0 });
      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
