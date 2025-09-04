import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { addDays, addHours } from 'date-fns';
import { OAuth2Client } from 'google-auth-library';
import { customAlphabet, nanoid } from 'nanoid';
import { JwtPayload, RefreshTokenPayload } from 'src/common/types/tokens.types';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { AuthorizationToken } from '@/common/entities/authorization-token.entity';
import { Session } from '@/common/entities/session.entity';
import { User } from '@/common/entities/user.entity';
import { OAuthProvider, UserOAuth } from '@/common/entities/user-oauth.entity';
import { UserRole } from '@/common/entities/user-role.entity';
import { VerificationToken } from '@/common/entities/verification-token.entity';

import { EmailService } from '../email/email.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { TokenRefreshDto } from './dto/token-refresh.dto';
import { TokenResponseDto } from './dto/token-response.dto';

enum TokenType {
  EMAIL_VERIFICATION = 'email_verification',
  PASSWORD_RESET = 'password_reset',
}

// Interface for Google OAuth user data
interface GoogleUserData {
  providerId: string;
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    @InjectRepository(VerificationToken)
    private tokenRepository: Repository<VerificationToken>,
    @InjectRepository(UserRole)
    private roleRepository: Repository<UserRole>,
    @InjectRepository(UserOAuth)
    private userOAuthRepository: Repository<UserOAuth>,
    @InjectRepository(AuthorizationToken)
    private authorizationTokenRepository: Repository<AuthorizationToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private dataSource: DataSource,
    private emailService: EmailService
  ) {}

  async register(
    registerDto: RegisterDto,
    appName: string
  ): Promise<{ message: string; verificationId: string }> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Create transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create new user
      const user = new User();
      user.email = registerDto.email;
      user.passwordHash = await this.hashPassword(registerDto.password);
      user.name = registerDto.name || '';
      user.source = appName;
      user.emailVerified = false;
      user.active = true;

      const savedUser = await queryRunner.manager.save(user);

      // Assign default roles
      const userRole = new UserRole();
      userRole.userId = savedUser.id;
      userRole.role = 'user';
      await queryRunner.manager.save(userRole);

      // Assign beta role - TODO: Remove this after beta period
      const betaRole = new UserRole();
      betaRole.userId = savedUser.id;
      betaRole.role = 'beta';
      await queryRunner.manager.save(betaRole);

      // Create verification token
      const verificationToken = await this.createVerificationCode(
        savedUser.id,
        TokenType.EMAIL_VERIFICATION,
        queryRunner.manager
      );

      await queryRunner.commitTransaction();

      // Send verification email
      await this.emailService.sendVerificationEmail(
        appName,
        savedUser.email,
        verificationToken.code
      );

      return {
        message: 'User registered successfully. Please check your email for the verification code.',
        verificationId: verificationToken.id,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async login(
    loginDto: LoginDto,
    appName: string,
    ip?: string,
    userAgent?: string
  ): Promise<TokenResponseDto> {
    // Find user
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    const passwordValid = await this.comparePasswords(loginDto.password, user.passwordHash);

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.active) {
      throw new BadRequestException('User account is inactive');
    }

    // Check if email is verified
    if (!user.emailVerified) {
      // Generate a new verification token
      const verificationToken = await this.createVerificationCode(
        user.id,
        TokenType.EMAIL_VERIFICATION
      );

      // Send verification email
      await this.emailService.sendVerificationEmail(appName, user.email, verificationToken.code);

      throw new BadRequestException({
        message: 'Email not verified. A new verification code has been sent.',
        verificationId: verificationToken.id,
      });
    }

    // Get user roles
    const userRoles = await this.roleRepository.find({
      where: { userId: user.id },
    });

    // Create new session
    const session = await this.createSession(user.id, ip, userAgent);

    // Update last login
    user.lastLogin = new Date();
    await this.userRepository.save(user);

    // Generate tokens
    return this.generateTokens(
      user,
      userRoles.map((role) => role.role),
      session.id
    );
  }

  async refreshToken(tokenRefreshDto: TokenRefreshDto): Promise<TokenResponseDto> {
    try {
      // Decode refresh token
      const decoded = this.jwtService.verify<JwtPayload>(tokenRefreshDto.refreshToken, {
        secret: this.configService.getOrThrow<string>('auth.jwt.secret'),
      });

      // Check token type
      if (decoded.tokenType !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Type assertion for refresh token payload
      const refreshPayload = decoded as RefreshTokenPayload;

      // Find session
      const session = await this.sessionRepository.findOne({
        where: { id: refreshPayload.sid },
        relations: ['user'],
      });

      if (!session) {
        throw new UnauthorizedException('Invalid session');
      }

      // Check if session is expired
      if (new Date() > session.expiresAt) {
        await this.sessionRepository.remove(session);
        throw new UnauthorizedException('Session expired');
      }

      // Get user roles
      const userRoles = await this.roleRepository.find({
        where: { userId: session.userId },
      });

      // Update session expiry instead of creating a new one
      session.expiresAt = addDays(new Date(), 30);
      await this.sessionRepository.save(session);

      // Generate new tokens with the same session
      return this.generateTokens(
        session.user,
        userRoles.map((role) => role.role),
        session.id
      );
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  async logout(refreshToken: string): Promise<boolean> {
    try {
      // Decode refresh token
      const decoded = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.getOrThrow<string>('auth.jwt.secret'),
      });

      // Check token type
      if (decoded.tokenType !== 'refresh') {
        return false;
      }

      // Type assertion for refresh token payload
      const refreshPayload = decoded as RefreshTokenPayload;

      // Find and delete session
      const session = await this.sessionRepository.findOne({
        where: { id: refreshPayload.sid },
      });

      if (session) {
        await this.sessionRepository.remove(session);
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
    appName: string
  ): Promise<{ message: string; verificationId?: string }> {
    // Find user
    const user = await this.userRepository.findOne({
      where: { email: forgotPasswordDto.email },
    });

    // Don't reveal if user exists
    if (!user) {
      return {
        message: 'If your email is registered, you will receive a password reset code shortly.',
      };
    }

    // Create password reset token
    const resetToken = await this.createVerificationCode(user.id, TokenType.PASSWORD_RESET);

    // Send password reset email
    await this.emailService.sendPasswordResetEmail(appName, user.email, resetToken.code);

    return {
      message: 'If your email is registered, you will receive a password reset code shortly.',
      verificationId: resetToken.id,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    // Find token by ID only
    const verificationToken = await this.tokenRepository.findOne({
      where: {
        id: resetPasswordDto.id,
        type: TokenType.PASSWORD_RESET,
        used: false,
      },
      relations: ['user'],
    });

    if (!verificationToken) {
      throw new BadRequestException('Invalid or expired verification');
    }

    // Check if token is expired
    if (new Date() > verificationToken.expiresAt) {
      throw new BadRequestException('Code expired');
    }

    // Check if max attempts reached
    if (verificationToken.attempts >= 5) {
      throw new BadRequestException('Maximum attempts reached. Please request a new code.');
    }

    // Increment attempts
    verificationToken.attempts += 1;
    await this.tokenRepository.save(verificationToken);

    // Compare code manually
    if (verificationToken.code !== resetPasswordDto.code) {
      const attemptsRemaining = 5 - verificationToken.attempts;
      throw new BadRequestException({
        error: 'Invalid code',
        message: 'Invalid code. Please try again.',
        attemptsRemaining,
      });
    }

    // Update user password
    const user = verificationToken.user;
    user.passwordHash = await this.hashPassword(resetPasswordDto.password);
    await this.userRepository.save(user);

    // Mark token as used
    verificationToken.used = true;
    await this.tokenRepository.save(verificationToken);

    // Invalidate all sessions for this user
    await this.sessionRepository.delete({ userId: user.id });

    return {
      message: 'Password reset successful. You can now log in with your new password.',
    };
  }

  async verifyEmail(
    id: string,
    code: string,
    ip?: string,
    userAgent?: string
  ): Promise<TokenResponseDto> {
    // Find token by ID only
    const verificationToken = await this.tokenRepository.findOne({
      where: {
        id: id,
        type: TokenType.EMAIL_VERIFICATION,
        used: false,
      },
      relations: ['user'],
    });

    if (!verificationToken) {
      throw new BadRequestException('Invalid or expired verification');
    }

    // Check if token is expired
    if (new Date() > verificationToken.expiresAt) {
      throw new BadRequestException('Code expired');
    }

    // Check if max attempts reached
    if (verificationToken.attempts >= 5) {
      throw new BadRequestException(
        'Maximum attempts reached. Please request a new verification code.'
      );
    }

    // Increment attempts
    verificationToken.attempts += 1;
    await this.tokenRepository.save(verificationToken);

    // Compare code manually
    if (verificationToken.code !== code) {
      const attemptsRemaining = 5 - verificationToken.attempts;
      throw new BadRequestException({
        error: 'Invalid code',
        message: 'Invalid code. Please try again.',
        attemptsRemaining,
      });
    }

    // Update user
    const user = verificationToken.user;
    user.emailVerified = true;
    await this.userRepository.save(user);

    // Mark token as used
    verificationToken.used = true;
    await this.tokenRepository.save(verificationToken);

    // Get user roles
    const userRoles = await this.roleRepository.find({
      where: { userId: user.id },
    });

    // Create session
    const session = await this.createSession(user.id, ip, userAgent);

    // Update last login
    user.lastLogin = new Date();
    await this.userRepository.save(user);

    // Generate tokens
    return this.generateTokens(
      user,
      userRoles.map((role) => role.role),
      session.id
    );
  }

  /**
   * Validates a Google OAuth user or creates a new user if it doesn't exist
   * @param userData Google user data from OAuth
   * @returns Auth tokens
   */
  async validateOrCreateGoogleUser(
    userData: GoogleUserData,
    appName: string,
    ip?: string,
    userAgent?: string
  ): Promise<TokenResponseDto> {
    // Look for existing OAuth connection
    const existingOAuth = await this.userOAuthRepository.findOne({
      where: {
        provider: OAuthProvider.GOOGLE,
        providerId: userData.providerId,
      },
      relations: ['user'],
    });

    // If OAuth connection exists, login with that user
    if (existingOAuth) {
      // Update OAuth data
      existingOAuth.accessToken = userData.accessToken;
      if (userData.refreshToken) {
        existingOAuth.refreshToken = userData.refreshToken;
      }
      await this.userOAuthRepository.save(existingOAuth);

      const user = existingOAuth.user;

      // Ensure user is active
      if (!user.active) {
        throw new BadRequestException('User account is inactive');
      }

      // Get user roles
      const userRoles = await this.roleRepository.find({
        where: { userId: user.id },
      });

      // Create new session
      const session = await this.createSession(user.id, ip, userAgent);

      // Update last login
      user.lastLogin = new Date();
      await this.userRepository.save(user);

      // Generate tokens
      return this.generateTokens(
        user,
        userRoles.map((role) => role.role),
        session.id
      );
    }

    // Check if user exists with the same email
    const existingUser = await this.userRepository.findOne({
      where: { email: userData.email },
    });

    // Create transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let user: User;

      if (existingUser) {
        // Use existing user
        user = existingUser;
      } else {
        // Create new user
        user = new User();
        user.email = userData.email;
        user.name = `${userData.firstName} ${userData.lastName}`.trim();
        user.emailVerified = true; // Google already verified the email
        user.active = true;
        user.source = appName;

        user = await queryRunner.manager.save(user);

        // Assign default role
        const userRole = new UserRole();
        userRole.userId = user.id;
        userRole.role = 'user';
        await queryRunner.manager.save(userRole);

        // Assign beta role - TODO: Remove this after beta period
        const betaRole = new UserRole();
        betaRole.userId = user.id;
        betaRole.role = 'beta';
        await queryRunner.manager.save(betaRole);
      }

      // Create OAuth connection
      const oauthConnection = new UserOAuth();
      oauthConnection.provider = OAuthProvider.GOOGLE;
      oauthConnection.providerId = userData.providerId;
      oauthConnection.providerEmail = userData.email;
      oauthConnection.accessToken = userData.accessToken;
      oauthConnection.refreshToken = userData.refreshToken;
      oauthConnection.profileData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        picture: userData.picture,
      };
      oauthConnection.userId = user.id;

      await queryRunner.manager.save(oauthConnection);

      // Get user roles
      const userRoles = await this.roleRepository.find({
        where: { userId: user.id },
      });

      // Create new session using the transaction
      const session = await this.createSession(user.id, ip, userAgent, queryRunner.manager);

      // Update last login
      user.lastLogin = new Date();
      await queryRunner.manager.save(user);

      await queryRunner.commitTransaction();

      // Generate tokens
      return this.generateTokens(
        user,
        userRoles.map((role) => role.role),
        session.id
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  public generateTokens(user: User, roles: string[], sessionId: string): TokenResponseDto {
    // Access token configuration
    const accessTokenExpiration = this.configService.getOrThrow<string>(
      'auth.jwt.accessTokenExpiration'
    );

    // Refresh token configuration
    const refreshTokenExpiration = this.configService.getOrThrow<string>(
      'auth.jwt.refreshTokenExpiration'
    );

    // Generate access token
    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        name: user.name,
        email: user.email,
        roles,
        activePlan: user.activePlan,
        tokenType: 'access',
      },
      {
        secret: this.configService.getOrThrow<string>('auth.jwt.secret'),
        expiresIn: accessTokenExpiration,
      }
    );

    // Generate refresh token
    const refreshToken = this.jwtService.sign(
      {
        sub: user.id,
        sid: sessionId,
        tokenType: 'refresh',
      },
      {
        secret: this.configService.getOrThrow<string>('auth.jwt.secret'),
        expiresIn: refreshTokenExpiration,
      }
    );

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      tokenType: 'Bearer',
      expiresIn: this.parseJwtExpiration(accessTokenExpiration),
    };
  }

  private parseJwtExpiration(expiration: string): number {
    const unit = expiration.slice(-1);
    const value = parseInt(expiration.slice(0, -1), 10);

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 900; // Default to 15 minutes
    }
  }

  public async createSession(
    userId: string,
    ip?: string,
    userAgent?: string,
    manager?: EntityManager
  ): Promise<Session> {
    const session = new Session();
    session.userId = userId;
    session.ipAddress = ip || '';
    session.userAgent = userAgent || '';

    // Calculate expiration date (30 days)
    session.expiresAt = addDays(new Date(), 30);

    if (manager) {
      return manager.save(session);
    }

    return this.sessionRepository.save(session);
  }

  private async createVerificationCode(
    userId: string,
    type: TokenType,
    manager?: EntityManager
  ): Promise<VerificationToken> {
    const token = new VerificationToken();
    token.userId = userId;
    token.code = this.generateVerificationCode();
    token.type = type;
    token.attempts = 0;

    // Set expiration based on token type
    const expiresAt =
      type === TokenType.PASSWORD_RESET
        ? this.configService.getOrThrow<number>('auth.email.passwordResetExpiration')
        : this.configService.getOrThrow<number>('auth.email.verificationExpiration');

    token.expiresAt = addHours(new Date(), expiresAt);

    if (manager) {
      return manager.save(token);
    }

    return this.tokenRepository.save(token);
  }

  private generateVerificationCode(): string {
    const nanoid = customAlphabet('012345678901234567890123456789');
    return nanoid(6);
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  private async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Get Google OAuth authorization URL
   * @returns URL to redirect the user to for Google authentication
   */
  getGoogleAuthUrl(appUrl: string): string {
    // Get Google OAuth config
    const clientId = this.configService.getOrThrow<string>('auth.google.clientId');
    const clientSecret = this.configService.getOrThrow<string>('auth.google.clientSecret');
    const redirectUri = this.configService.getOrThrow<string>('auth.google.redirectUrl');

    // Create OAuth client
    const oAuth2Client = new OAuth2Client(clientId, clientSecret, appUrl + redirectUri);

    // Generate auth URL
    const authorizeUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline', // Get a refresh token
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      prompt: 'consent',
    });

    return authorizeUrl;
  }

  /**
   * Exchange a Google OAuth authorization code for tokens and user profile
   * @param code The authorization code from Google redirect
   * @returns Google user data needed for authentication
   */
  async exchangeGoogleAuthCode(code: string, appUrl: string): Promise<GoogleUserData> {
    try {
      // Get Google OAuth config
      const clientId = this.configService.getOrThrow<string>('auth.google.clientId');
      const clientSecret = this.configService.getOrThrow<string>('auth.google.clientSecret');
      const redirectUri = this.configService.getOrThrow<string>('auth.google.redirectUrl');

      // Create OAuth client
      const oAuth2Client = new OAuth2Client(clientId, clientSecret, appUrl + redirectUri);

      // Exchange code for tokens
      const { tokens } = await oAuth2Client.getToken(code);

      if (!tokens || !tokens.access_token) {
        throw new Error('No access token received from Google');
      }

      const accessToken = tokens.access_token;
      const refreshToken = tokens.refresh_token || '';

      // Set credentials for the OAuth client
      oAuth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      // Get user info using the OAuth client with credentials set
      const response = await oAuth2Client.request({
        url: 'https://www.googleapis.com/oauth2/v2/userinfo',
      });

      const profile = response.data as {
        id: string;
        email: string;
        verified_email: boolean;
        name: string;
        given_name?: string;
        family_name?: string;
        picture?: string;
      };

      // Map to our GoogleUserData format
      return {
        providerId: profile.id,
        email: profile.email,
        firstName: profile.given_name || '',
        lastName: profile.family_name || '',
        picture: profile.picture || '',
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(
          `Failed to exchange Google authorization code: ${error.message}`
        );
      }
      throw new BadRequestException('Failed to exchange Google authorization code');
    }
  }

  async createAuthorizationToken(userId: string, clientId: string): Promise<string> {
    // Generate a random token
    const token = nanoid(32);

    // Calculate expiration (1 hour from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Create and save the authorization token
    const authToken = this.authorizationTokenRepository.create({
      userId,
      token,
      clientId,
      expiresAt,
      used: false,
    });

    await this.authorizationTokenRepository.save(authToken);

    return token;
  }

  async validateAuthorizationToken(token: string, clientId: string): Promise<{ userId: string }> {
    // Find the token
    const authToken = await this.authorizationTokenRepository.findOne({
      where: { token, used: false },
    });

    if (!authToken) {
      throw new UnauthorizedException('Invalid or expired authorization token');
    }

    // Check if token is expired
    if (new Date() > authToken.expiresAt) {
      throw new UnauthorizedException('Authorization token has expired');
    }

    // Check if clientId matches
    if (authToken.clientId !== clientId) {
      throw new UnauthorizedException('Invalid client ID');
    }

    // Mark token as used
    authToken.used = true;
    await this.authorizationTokenRepository.save(authToken);

    return { userId: authToken.userId };
  }

  async exchangeAuthorizationToken(
    authorizationToken: string,
    clientId: string,
    ip?: string,
    userAgent?: string
  ): Promise<TokenResponseDto> {
    // Validate the authorization token
    const { userId } = await this.validateAuthorizationToken(authorizationToken, clientId);

    // Get user and roles
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const userRoles = (
      await this.roleRepository.find({
        where: { userId },
      })
    ).map((role) => role.role);

    // Create new session
    const session = await this.createSession(userId, ip, userAgent);

    // Generate tokens
    return this.generateTokens(user, userRoles, session.id);
  }
}
