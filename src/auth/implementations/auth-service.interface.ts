import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginRequest } from '../dto/LoginRequest';

export interface IAuthService {
  login(
    dto: LoginRequest,
  ): Promise<{ access_token: string; refresh_token: string }>;
  register(
    dto: CreateUserDto,
  ): Promise<{ access_token: string; refresh_token: string }>;
}
