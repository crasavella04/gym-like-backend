import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'John',
    lastName: 'Doe',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockUsersService = {
      findOne: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
    };

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

  describe('findOne (GET /users/me)', () => {
    it('should return the current user', async () => {
      const mockRequest = { user: { id: 'user-123' } };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockUser as any);

      const result = await controller.findOne(mockRequest as any);

      expect(result).toEqual(mockUser);
      expect(service.findOne).toHaveBeenCalledWith('user-123');
    });

    it('should call findOne with correct user id from request', async () => {
      const mockRequest = { user: { id: 'another-user-456' } };
      jest.spyOn(service, 'findOne').mockResolvedValue({ ...mockUser, id: 'another-user-456' } as any);

      await controller.findOne(mockRequest as any);

      expect(service.findOne).toHaveBeenCalledWith('another-user-456');
    });
  });

  describe('update (PATCH /users/:id)', () => {
    it('should update a user by id', async () => {
      const userId = 'user-123';
      const updateDto: UpdateUserDto = { firstName: 'Jane' };
      const updatedUser = { ...mockUser, firstName: 'Jane' };

      jest.spyOn(service, 'update').mockResolvedValue(updatedUser as any);

      const result = await controller.update(userId, updateDto);

      expect(result).toEqual(updatedUser);
      expect(service.update).toHaveBeenCalledWith(userId, updateDto);
    });

    it('should call update with correct user id and dto', async () => {
      const userId = 'another-user-456';
      const updateDto: UpdateUserDto = { email: 'new@example.com' };

      jest.spyOn(service, 'update').mockResolvedValue({ ...mockUser, id: userId, email: 'new@example.com' } as any);

      await controller.update(userId, updateDto);

      expect(service.update).toHaveBeenCalledWith(userId, updateDto);
    });
  });
});
