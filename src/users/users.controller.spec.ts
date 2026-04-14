import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

const mockUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  passwordHash: 'hashed',
  name: 'Test User',
  createdAt: new Date(),
  updatedAt: new Date(),
} as User;

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return array of users', async () => {
      mockUsersService.findAll.mockResolvedValue([mockUser]);
      const result = await controller.findAll();
      expect(result).toEqual([mockUser]);
      expect(mockUsersService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return single user', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);
      const result = await controller.findOne('user-123');
      expect(result).toEqual(mockUser);
      expect(mockUsersService.findOne).toHaveBeenCalledWith('user-123');
    });
  });

  describe('update', () => {
    it('should update user using id from req.user.id', async () => {
      const updateDto: UpdateUserDto = { name: 'Updated Name' };
      const req = { user: { id: 'user-123' } } as any;
      mockUsersService.update.mockResolvedValue({ ...mockUser, ...updateDto });

      const result = await controller.update(req, updateDto);

      expect(mockUsersService.update).toHaveBeenCalledWith('user-123', updateDto);
      expect(result.name).toBe('Updated Name');
    });

    it('should NOT accept id from @Param - uses req.user.id only', async () => {
      const updateDto: UpdateUserDto = { email: 'new@example.com' };
      const req = { user: { id: 'user-999' } } as any;
      mockUsersService.update.mockResolvedValue({ ...mockUser, ...updateDto });

      await controller.update(req, updateDto);

      // Key assertion: service was called with req.user.id, not any @Param
      expect(mockUsersService.update).toHaveBeenCalledWith('user-999', updateDto);
      expect(mockUsersService.update).not.toHaveBeenCalledWith('user-123', expect.any(Object));
    });
  });
});
