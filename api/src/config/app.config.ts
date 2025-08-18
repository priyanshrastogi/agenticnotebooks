import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  name: 'Intellicharts API',
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || '/',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000')
    .split('|')
    .map((origin) => origin.trim()),
}));
