import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AccessTokenPayload, JwtPayload, UserPayload } from 'src/common/types/tokens.types';
import { Repository } from 'typeorm';

import { User } from '@/common/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('auth.jwt.secret'),
    });
  }

  /**
   * Validate JWT token for authentication.
   * This strategy only processes access tokens, not refresh tokens.
   * Refresh tokens should be handled by the auth service directly.
   *
   * @param payload The JWT payload from the token
   * @returns The user payload for request.user
   * @throws UnauthorizedException if token type is not 'access'
   */
  validate(payload: JwtPayload): UserPayload {
    // Check payload type - only access tokens should be used for authentication
    if (payload.tokenType !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    // This becomes the request.user
    const accessPayload = payload as AccessTokenPayload;
    return {
      id: payload.sub,
      email: accessPayload.email,
      roles: accessPayload.roles || [],
      name: accessPayload.name,
      activePlan: accessPayload.activePlan,
    };
  }
}
