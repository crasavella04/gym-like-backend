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
import { ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список пользователей' })
  @ApiOkResponse({ type: [CreateUserDto] })
  async findAll(): Promise<User[]> {
    return await this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить пользователя по идентификатору' })
  @ApiOkResponse({ type: CreateUserDto })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(id);
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
