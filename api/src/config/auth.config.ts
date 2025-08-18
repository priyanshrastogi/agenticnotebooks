import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-key-please-change',
    accessTokenExpiration: process.env.JWT_ACCESS_TOKEN_EXPIRATION || '1d',
    refreshTokenExpiration: process.env.JWT_REFRESH_TOKEN_EXPIRATION || '30d',
  },
  email: {
    verificationExpiration: parseInt(
      process.env.EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS || '24',
      10,
    ),
    passwordResetExpiration: parseInt(
      process.env.PASSWORD_RESET_TOKEN_EXPIRE_HOURS || '1',
      10,
    ),
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUrl: '/callback/oauth/google',
  },
}));
