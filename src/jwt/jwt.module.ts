import { Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { JwtModule as JWT } from '@nestjs/jwt';

@Module({
  imports: [JWT.register({})],
  providers: [JwtService],
  exports: [JwtService],
})
export class JwtModule {}
