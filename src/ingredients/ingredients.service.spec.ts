import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IngredientsService } from './ingredients.service';
import { Ingredient, IngredientUnit } from './ingredient.entity';
import { NotFoundException } from '@nestjs/common';

describe('IngredientsService', () => {
  let service: IngredientsService;
  let mockRepository: any;

  const mockIngredient: Ingredient = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Chicken',
    calories: 165,
    unit: IngredientUnit.GRAM,
  };

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngredientsService,
        {
          provide: getRepositoryToken(Ingredient),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<IngredientsService>(IngredientsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an ingredient', async () => {
      const createDto = {
        title: 'Chicken',
        calories: 165,
        unit: IngredientUnit.GRAM,
      };

      mockRepository.create.mockReturnValue(mockIngredient);
      mockRepository.save.mockResolvedValue(mockIngredient);

      const result = await service.create(createDto);

      expect(result).toEqual(mockIngredient);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockIngredient);
    });
  });

  describe('findAll', () => {
    it('should return all ingredients', async () => {
      mockRepository.find.mockResolvedValue([mockIngredient]);

      const result = await service.findAll();

      expect(result).toEqual([mockIngredient]);
      expect(mockRepository.find).toHaveBeenCalledWith();
    });

    it('should search ingredients by title', async () => {
      mockRepository.find.mockResolvedValue([mockIngredient]);

      const result = await service.findAll('Chicken');

      expect(result).toEqual([mockIngredient]);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { title: expect.anything() },
      });
    });
  });

  describe('findOne', () => {
    it('should return an ingredient by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockIngredient);

      const result = await service.findOne(mockIngredient.id);

      expect(result).toEqual(mockIngredient);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockIngredient.id },
      });
    });

    it('should throw NotFoundException if ingredient not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update an ingredient', async () => {
      const updateDto = { title: 'Beef' };
      const updatedIngredient = { ...mockIngredient, ...updateDto };

      mockRepository.findOne.mockResolvedValue(mockIngredient);
      mockRepository.save.mockResolvedValue(updatedIngredient);

      const result = await service.update(mockIngredient.id, updateDto);

      expect(result).toEqual(updatedIngredient);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if ingredient not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('invalid-id', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove an ingredient', async () => {
      mockRepository.findOne.mockResolvedValue(mockIngredient);
      mockRepository.remove.mockResolvedValue(undefined);

      await service.remove(mockIngredient.id);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockIngredient);
    });

    it('should throw NotFoundException if ingredient not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
