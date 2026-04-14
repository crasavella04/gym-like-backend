import { Global, Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { JwtModule as JWT } from '@nestjs/jwt';

@Global()
@Module({
  imports: [JWT.register({ global: true })],
  providers: [JwtService],
  exports: [JwtService],
})
export class JwtModule {}
