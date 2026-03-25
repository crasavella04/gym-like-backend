import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { IAuthService } from './implementations/auth-service.interface';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { JwtService } from 'src/jwt/jwt.service';
import { LoginRequest } from './dto/LoginRequest';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login({
    email,
    password,
  }: LoginRequest): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new HttpException(
        'Email or Password is incorrect',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await this.usersService.hashPassword(password);

    if (user.password !== hashedPassword) {
      throw new HttpException(
        'Email or Password is incorrect',
        HttpStatus.BAD_REQUEST,
      );
    }

    const payload = {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      avatar: user.avatar,
      email: user.email,
    };

    // создание токена и отправка на клиент
    const access_token = this.jwtService.createAccessToken(payload);
    const refresh_token = this.jwtService.createRefreshToken(payload);

    return { access_token, refresh_token };
  }

  async register(
    dto: CreateUserDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const candidate = await this.usersService.findByEmail(dto.email);

    if (candidate) {
      throw new HttpException('User already exist', HttpStatus.BAD_REQUEST);
    }

    const user = await this.usersService.create(dto);

    const payload = {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      avatar: user.avatar,
      email: user.email,
    };

    // создание токена и отправка на клиент
    const access_token = this.jwtService.createAccessToken(payload);
    const refresh_token = this.jwtService.createRefreshToken(payload);

    return { access_token, refresh_token };
  }

  async refresh(
    refresh_token?: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    if (!refresh_token)
      throw new HttpException(
        'Refresh token was expired',
        HttpStatus.UNAUTHORIZED,
      );

    const payload = this.jwtService.decodeRefreshToken(refresh_token);

    const access_token = this.jwtService.createAccessToken(payload);
    const new_refresh_token = this.jwtService.createRefreshToken(payload);

    return { access_token, refresh_token: new_refresh_token };
  }
}
