import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { FilesService } from 'src/files/files.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private filesService: FilesService,
  ) {}

  async findAll() {
    return await this.usersRepository.find();
  }

  async findOne(id: string) {
    return await this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string) {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async create(dto: CreateUserDto) {
    const passwordValidation = this.validatePassword(dto.password);

    if (passwordValidation !== true) {
      throw new HttpException(passwordValidation, HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await this.hashPassword(dto.password);

    return await this.usersRepository.save({
      ...dto,
      password: hashedPassword,
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    let avatarUrl: string | undefined = undefined;

    if (dto.avatar) {
      avatarUrl = await this.filesService.save(dto.avatar);
    }

    await this.usersRepository.update({ id }, { ...dto, avatar: avatarUrl });
    const updatedUser = await this.usersRepository.findOneBy({ id });

    if (!updatedUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete({ id });
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async comparePassword(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }

  private validatePassword(password: string): true | string {
    const minLength = 8;
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /\d/.test(password);

    if (password.length < minLength) {
      return `Password must be at least ${minLength} characters long`;
    }

    if (!hasLetters) {
      return `Password must contain Latin letters (a-z, A-Z)`;
    }

    if (!hasNumbers) {
      return `Password must contain numbers (0-9)`;
    }

    return true;
  }
}
