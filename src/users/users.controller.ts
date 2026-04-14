import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from 'src/auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @Get()
  // @ApiOperation({ summary: 'Получить список пользователей' })
  // @ApiOkResponse({ type: [CreateUserDto] })
  // async findAll(): Promise<User[]> {
  //   return await this.usersService.findAll();
  // }

  @Get('me')
  @ApiOperation({ summary: 'Получить текущего пользователя' })
  @ApiOkResponse({ type: CreateUserDto })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async findOne(@Req() req: AuthenticatedRequest): Promise<User> {
    const user = await this.usersService.findOne(req.user.id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить пользователя по id' })
  @ApiOkResponse({ type: CreateUserDto })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto): Promise<User> {
    return await this.usersService.update(id, dto);
  }

  // @Delete(':id')
  // @ApiOperation({ summary: 'Удалить пользователя' })
  // async remove(@Param('id') id: string): Promise<void> {
  //   return await this.usersService.remove(id);
  // }
}
