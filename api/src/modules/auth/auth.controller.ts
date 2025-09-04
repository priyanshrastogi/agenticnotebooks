import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';

import { RequestWithUser } from '@/common/types/request.types';

import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { TokenRefreshDto } from './dto/token-refresh.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { TokensDto } from './dto/tokens.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example:
            'User registered successfully. Please check your email for the verification code.',
        },
        verificationId: {
          type: 'string',
          example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Req() req: FastifyRequest, @Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto, req.app.name);
  }

  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: TokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials',
  })
  @ApiResponse({
    status: 400,
    description: 'Email not verified',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 400,
        },
        message: {
          type: 'string',
          example: 'Email not verified. Please verify your email.',
        },
        verificationId: {
          type: 'string',
          example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
        },
        error: {
          type: 'string',
          example: 'Bad Request',
        },
      },
    },
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Req() req: FastifyRequest, @Body() loginDto: LoginDto): Promise<TokenResponseDto> {
    return this.authService.login(
      loginDto,
      req.app.name,
      req.ip,
      req.headers['user-agent'] as string
    );
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: TokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid refresh token',
  })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() tokenRefreshDto: TokenRefreshDto): Promise<TokenResponseDto> {
    return this.authService.refreshToken(tokenRefreshDto);
  }

  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Successfully logged out',
        },
      },
    },
  })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() logoutDto: LogoutDto) {
    await this.authService.logout(logoutDto.refreshToken);
    return { message: 'Successfully logged out' };
  }

  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({
    status: 200,
    description: 'Password reset request processed',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'If your email is registered, you will receive a password reset code shortly.',
        },
        verificationId: {
          type: 'string',
          example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
        },
      },
    },
  })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Req() req: FastifyRequest, @Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto, req.app.name);
  }

  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    type: TokenResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid verification code or expired token',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 400,
        },
        message: {
          type: 'string',
          example: 'Invalid code. Please try again.',
        },
        attemptsRemaining: {
          type: 'number',
          example: 4,
        },
        error: {
          type: 'string',
          example: 'Bad Request',
        },
      },
    },
  })
  @ApiParam({
    name: 'id',
    description: 'Verification token ID',
    required: true,
  })
  @ApiParam({
    name: 'code',
    description: 'Email verification code',
    required: true,
  })
  @Get('verify-email/:id/:code')
  async verifyEmail(
    @Param('id') id: string,
    @Param('code') code: string,
    @Req() req: FastifyRequest
  ) {
    if (!code || !id) {
      throw new BadRequestException('Verification ID and code are required');
    }

    return this.authService.verifyEmail(id, code, req.ip, req.headers['user-agent'] as string);
  }

  @ApiOperation({ summary: 'Reset password using token' })
  @ApiResponse({
    status: 200,
    description: 'Password reset successful',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Password reset successful. You can now log in with your new password.',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid code, expired token, or validation error',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 400,
        },
        message: {
          type: 'string',
          example: 'Invalid code. Please try again.',
        },
        attemptsRemaining: {
          type: 'number',
          example: 4,
        },
        error: {
          type: 'string',
          example: 'Bad Request',
        },
      },
    },
  })
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Get('google')
  @ApiOperation({
    summary: 'Initiate Google OAuth flow',
    description: 'Returns the Google authentication URL',
  })
  googleAuth(@Req() req: FastifyRequest) {
    const authUrl = this.authService.getGoogleAuthUrl(req.app.url);
    return authUrl;
  }

  @Post('google/callback')
  @ApiOperation({
    summary: 'Exchange Google auth code for tokens',
    description: 'Exchange auth code from frontend for app tokens',
  })
  @ApiResponse({
    status: 200,
    description: 'Authentication successful',
    type: TokenResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid or missing code',
  })
  @HttpCode(HttpStatus.OK)
  async googleAuthCodeExchange(
    @Body() googleAuthDto: GoogleAuthDto,
    @Req() req: FastifyRequest
  ): Promise<TokenResponseDto> {
    // Exchange the auth code for Google tokens and user profile
    const googleUserData = await this.authService.exchangeGoogleAuthCode(
      googleAuthDto.code,
      req.app.url
    );

    // Validate or create user and return tokens
    return this.authService.validateOrCreateGoogleUser(
      googleUserData,
      req.app.name,
      req.ip,
      req.headers['user-agent'] as string
    );
  }

  @Post('authorize')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a one-time authorization token',
    description:
      'Creates a one-time use token for desktop app authorization. Requires valid JWT token.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['clientId'],
      properties: {
        clientId: {
          type: 'string',
          description: 'Unique identifier for the client application',
          example: 'desktop_app_v1',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Authorization token created successfully',
    schema: {
      type: 'object',
      properties: {
        authorizationToken: {
          type: 'string',
          example: 'auth_token_123',
          description: 'One-time use token for desktop app authorization',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Client ID is missing',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async createAuthorizationToken(@Req() req: RequestWithUser, @Body('clientId') clientId: string) {
    if (!clientId) {
      throw new BadRequestException('Client ID is required');
    }
    const user = req.user;
    const token = await this.authService.createAuthorizationToken(user.id, clientId);
    return { authorizationToken: token };
  }

  @Post('tokens')
  @ApiOperation({
    summary: 'Exchange authorization token for access and refresh tokens',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['authorizationToken', 'clientId'],
      properties: {
        authorizationToken: {
          type: 'string',
          description: 'One-time authorization token received from /authorize endpoint',
          example: 'auth_token_123',
        },
        clientId: {
          type: 'string',
          description: 'Client ID that was used to create the authorization token',
          example: 'desktop_app_v1',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens generated successfully',
    type: TokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired authorization token, or client ID mismatch',
  })
  async exchangeToken(
    @Body() tokensDto: TokensDto,
    @Req() req: FastifyRequest
  ): Promise<TokenResponseDto> {
    return this.authService.exchangeAuthorizationToken(
      tokensDto.authorizationToken,
      tokensDto.clientId,
      req.ip,
      req.headers['user-agent'] as string
    );
  }
}
