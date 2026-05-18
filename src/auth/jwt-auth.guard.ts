import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from 'src/jwt/jwt.service';
import { Request } from 'express';

/**
 * JWT Authentication Guard
 *
 * Validates JWT tokens in Authorization header and attaches decoded payload to request.user.
 * Requires 'Bearer <token>' format and validates required payload fields (id, email).
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Validates request by checking JWT token in Authorization header
   * @param context - ExecutionContext containing HTTP request
   * @returns true if authentication succeeds
   * @throws UnauthorizedException if token is missing, invalid, expired, or payload is invalid
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException(
        'Invalid authorization header format. Expected: Bearer <token>',
      );
    }

    try {
      const payload = this.jwtService.decodeAccessToken(token);

      // Validate required fields in payload
      if (!payload.id || !payload.email) {
        throw new UnauthorizedException('Invalid token payload');
      }

      // Check if token is active (if token revocation is implemented)
      // if (await this.jwtService.isTokenActive(token)) {
      //   throw new UnauthorizedException('Token has been revoked');
      // }

      // Attach the payload to request.user
      request.user = {
        id: payload.id,
        email: payload.email,
        firstname: payload.firstname || '',
        lastname: payload.lastname || '',
      };

      return true;
    } catch (error) {
      // Re-throw UnauthorizedException (including payload validation errors)
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // Handle JWT library errors
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
      throw new UnauthorizedException('Token validation failed');
    }
  }
}
