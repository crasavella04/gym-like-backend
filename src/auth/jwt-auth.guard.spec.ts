import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtService } from 'src/jwt/jwt.service';
import { ExecutionContext } from '@nestjs/common';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: jest.Mocked<JwtService>;

  const mockPayload = {
    id: 'user-123',
    email: 'test@example.com',
    firstname: 'John',
    lastname: 'Doe',
  };

  const mockExecutionContext = (authHeader?: string): ExecutionContext => {
    const request = {
      headers: authHeader ? { authorization: authHeader } : {},
      user: undefined,
    };

    return {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(request),
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    const mockJwtService = {
      decodeAccessToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    jwtService = module.get(JwtService);
  });

  describe('canActivate', () => {
    it('should allow access with valid Bearer token', async () => {
      const token = 'valid-jwt-token';
      jwtService.decodeAccessToken.mockReturnValue(mockPayload);

      const context = mockExecutionContext(`Bearer ${token}`);
      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(jwtService.decodeAccessToken).toHaveBeenCalledWith(token);
      const request = context.switchToHttp().getRequest();
      expect(request.user).toEqual({
        id: mockPayload.id,
        email: mockPayload.email,
        firstname: mockPayload.firstname || '',
        lastname: mockPayload.lastname || '',
      });
    });

    it('should throw UnauthorizedException when Authorization header is missing', async () => {
      const context = mockExecutionContext();

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Authorization header is missing',
      );
    });

    it('should throw UnauthorizedException when Authorization header has invalid format', async () => {
      const context = mockExecutionContext('InvalidFormat token');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Invalid authorization header format. Expected: Bearer <token>',
      );
    });

    it('should throw UnauthorizedException when token is missing after "Bearer"', async () => {
      const context = mockExecutionContext('Bearer');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when token is invalid (JsonWebTokenError)', async () => {
      const token = 'invalid-token';
      jwtService.decodeAccessToken.mockImplementation(() => {
        const error = new Error('Invalid token');
        error.name = 'JsonWebTokenError';
        throw error;
      });

      const context = mockExecutionContext(`Bearer ${token}`);

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow('Invalid token');
    });

    it('should throw UnauthorizedException when token has expired (TokenExpiredError)', async () => {
      const token = 'expired-token';
      jwtService.decodeAccessToken.mockImplementation(() => {
        const error = new Error('Token expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      const context = mockExecutionContext(`Bearer ${token}`);

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Token has expired',
      );
    });

    it('should throw UnauthorizedException when token validation fails with unknown error', async () => {
      const token = 'bad-token';
      jwtService.decodeAccessToken.mockImplementation(() => {
        throw new Error('Unknown error');
      });

      const context = mockExecutionContext(`Bearer ${token}`);

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Token validation failed',
      );
    });

    it('should handle missing optional fields in payload', async () => {
      const token = 'valid-token';
      const payloadWithOptionalFields = {
        id: 'user-456',
        email: 'test2@example.com',
      };
      jwtService.decodeAccessToken.mockReturnValue(payloadWithOptionalFields);

      const context = mockExecutionContext(`Bearer ${token}`);
      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      const request = context.switchToHttp().getRequest();
      expect(request.user).toEqual({
        id: payloadWithOptionalFields.id,
        email: payloadWithOptionalFields.email,
        firstname: '',
        lastname: '',
      });
    });
  });
});
