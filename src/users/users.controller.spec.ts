import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IPayload } from '../jwt/types/IPayload';
import { NotFoundException } from '@nestjs/common';
import type { Request } from 'express';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUserId = 'user-123';
  const mockUser: IPayload = {
    id: mockUserId,
    email: 'test@example.com',
    firstname: 'John',
    lastname: 'Doe',
  };

  const mockRequest = {
    user: mockUser,
  } as Request;

  const mockUserEntity: User = {
    id: mockUserId,
    email: 'test@example.com',
    password: 'hashed-password',
    firstname: 'John',
    lastname: 'Doe',
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should return the current user', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUserEntity);

      const result = await controller.findOne(mockRequest);

      expect(service.findOne).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(mockUserEntity);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUsersService.findOne.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(controller.findOne(mockRequest)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update the current user', async () => {
      const updateDto = { firstname: 'Jane' };
      const updatedUser = { ...mockUserEntity, firstname: 'Jane' };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(mockUserId, updateDto);

      expect(service.update).toHaveBeenCalledWith(mockUserId, updateDto);
      expect(result).toEqual(updatedUser);
    });
  });
});
