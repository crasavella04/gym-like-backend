import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuth } from '../auth/decorators/jwt-auth.decorator';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
@JwtAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @Get()
  // @ApiOperation({ summary: 'Получить список пользователей' })
  // @ApiOkResponse({ type: [CreateUserDto] })
  // async findAll(): Promise<User[]> {
  //   return await this.usersService.findAll();
  // }

  @Get()
  @ApiOperation({ summary: 'Получить текущего пользователя' })
  @ApiOkResponse({ type: CreateUserDto })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async findOne(@Req() req: Request) {
    return await this.usersService.findOne(req.user.id);
  }

  @Patch()
  @ApiOperation({ summary: 'Обновить текущего пользователя' })
  @ApiOkResponse({ type: CreateUserDto })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async update(@Req() req: Request, @Body() dto: UpdateUserDto) {
    return await this.usersService.update(req.user.id, dto);
  }

  // @Delete(':id')
  // @ApiOperation({ summary: 'Удалить пользователя' })
  // async remove(@Param('id') id: string): Promise<void> {
  //   return await this.usersService.remove(id);
  // }
}
