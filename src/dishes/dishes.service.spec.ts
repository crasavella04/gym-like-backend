import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { DishesService } from './dishes.service';
import { Dish } from './entities/dish.entity';
import { DishIngredient } from './entities/dish-ingredient.entity';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';

describe('DishesService', () => {
  let service: DishesService;
  let dishRepo: any;
  let dishIngredientRepo: any;

  const mockDish = {
    id: 'dish-uuid',
    title: 'Овсянка с ягодами',
    description: 'Полезный завтрак',
    ingredients: [
      { id: 'di-1', dishId: 'dish-uuid', ingredientId: 'ing-1', quantity: 100 },
      { id: 'di-2', dishId: 'dish-uuid', ingredientId: 'ing-2', quantity: 50 },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    dishRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockDish], 1]),
      })),
    };

    dishIngredientRepo = {
      create: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DishesService,
        { provide: getRepositoryToken(Dish), useValue: dishRepo },
        { provide: getRepositoryToken(DishIngredient), useValue: dishIngredientRepo },
      ],
    }).compile();

    service = module.get<DishesService>(DishesService);
  });

  describe('create', () => {
    it('should create a dish with ingredients', async () => {
      const dto: CreateDishDto = {
        title: 'Овсянка с ягодами',
        description: 'Полезный завтрак',
        ingredients: [
          { ingredientId: 'ing-1', quantity: 100 },
          { ingredientId: 'ing-2', quantity: 50 },
        ],
      };

      dishIngredientRepo.create.mockImplementation((i) => i);
      dishRepo.create.mockReturnValue({ ...dto, ingredients: dto.ingredients });
      dishRepo.save.mockResolvedValue(mockDish);

      const result = await service.create(dto);
      expect(result).toEqual(mockDish);
      expect(dishRepo.create).toHaveBeenCalled();
      expect(dishRepo.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated dishes', async () => {
      const result = await service.findAll(undefined, 0, 10);
      expect(result.data).toEqual([mockDish]);
      expect(result.total).toBe(1);
    });

    it('should filter dishes by title', async () => {
      const filter = { title: 'Овсянка' };
      const result = await service.findAll(filter, 0, 10);
      expect(result.data).toBeDefined();
    });

    it('should filter dishes by ingredientIds', async () => {
      const filter = { ingredientIds: ['ing-1', 'ing-2'] };
      const result = await service.findAll(filter, 0, 10);
      expect(result.data).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should return a dish by id', async () => {
      dishRepo.findOne.mockResolvedValue(mockDish);
      const result = await service.findOne('dish-uuid');
      expect(result).toEqual(mockDish);
    });

    it('should throw NotFoundException if dish not found', async () => {
      dishRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update dish title and description', async () => {
      const dto: UpdateDishDto = { title: 'Новое название', description: 'Новое описание' };
      dishRepo.findOne.mockResolvedValue({ ...mockDish });
      dishRepo.save.mockResolvedValue({ ...mockDish, ...dto });

      const result = await service.update('dish-uuid', dto);
      expect(result.title).toBe('Новое название');
    });

    it('should replace ingredients on update', async () => {
      const dto: UpdateDishDto = {
        ingredients: [
          { ingredientId: 'ing-3', quantity: 200 },
        ],
      };
      dishRepo.findOne.mockResolvedValue({ ...mockDish });
      dishIngredientRepo.create.mockImplementation((i) => i);
      dishRepo.save.mockResolvedValue({ ...mockDish, ingredients: dto.ingredients });

      const result = await service.update('dish-uuid', dto);
      expect(dishIngredientRepo.delete).toHaveBeenCalledWith({ dishId: 'dish-uuid' });
    });

    it('should throw NotFoundException if dish not found', async () => {
      dishRepo.findOne.mockResolvedValue(null);
      await expect(service.update('invalid-id', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a dish', async () => {
      dishRepo.findOne.mockResolvedValue(mockDish);
      dishRepo.remove.mockResolvedValue(undefined);
      await service.remove('dish-uuid');
      expect(dishRepo.remove).toHaveBeenCalledWith(mockDish);
    });

    it('should throw NotFoundException if dish not found', async () => {
      dishRepo.findOne.mockResolvedValue(null);
      await expect(service.remove('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });
});
