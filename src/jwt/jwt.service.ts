import { Injectable } from '@nestjs/common';
import { IPayload } from './types/IPayload';
import { JwtService as JWT } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtService {
  constructor(
    private jwt: JWT,
    private readonly configService: ConfigService,
  ) {}

  createAccessToken(payload: IPayload) {
    const ACCESS_SECRET = this.configService.get('ACCESS_TOKEN_SECRET');
    return this.jwt.sign(payload, {
      expiresIn: '30m',
      secret: ACCESS_SECRET,
    });
  }
  createRefreshToken(payload: IPayload) {
    const REFRESH_SECRET = this.configService.get('REFRESH_TOKEN_SECRET');

    return this.jwt.sign(payload, {
      expiresIn: '5d',
      secret: REFRESH_SECRET,
    });
  }
  decodeAccessToken(token: string) {
    const ACCESS_SECRET = this.configService.get('ACCESS_TOKEN_SECRET');

    return this.jwt.verify<IPayload>(token, {
      secret: ACCESS_SECRET,
    });
  }
  decodeRefreshToken(token: string) {
    const REFRESH_SECRET = this.configService.get('REFRESH_TOKEN_SECRET');

    return this.jwt.verify<IPayload>(token, {
      secret: REFRESH_SECRET,
    });
  }
}
