import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthorizationToken } from '@/common/entities/authorization-token.entity';
import { Session } from '@/common/entities/session.entity';
import { User } from '@/common/entities/user.entity';
import { UserOAuth } from '@/common/entities/user-oauth.entity';
import { UserRole } from '@/common/entities/user-role.entity';
import { VerificationToken } from '@/common/entities/verification-token.entity';

import { EmailModule } from '../email/email.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Session,
      VerificationToken,
      UserRole,
      UserOAuth,
      AuthorizationToken,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('auth.jwt.secret'),
        signOptions: {
          expiresIn: configService.getOrThrow<string>(
            'auth.jwt.accessTokenExpiration',
          ),
        },
      }),
    }),
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}
