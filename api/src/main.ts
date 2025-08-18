import helmet from '@fastify/helmet';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import * as morgan from 'morgan';

import { setupSwagger } from '@/config/swagger.config';

import { AppModule } from './app.module';
import { appIdentifierMiddleware } from './middlewares/app-identifier.middleware';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  const configService = app.get(ConfigService);

  // Global prefix
  const apiPrefix = configService.getOrThrow<string>('app.apiPrefix');
  app.setGlobalPrefix(apiPrefix);

  // Register app identifier middleware
  const fastifyInstance = app.getHttpAdapter().getInstance();
  fastifyInstance.addHook('preHandler', appIdentifierMiddleware);

  await app.register(helmet);

  // CORS
  app.enableCors({
    origin: configService.getOrThrow<string[]>('app.corsOrigins'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.use(morgan('dev'));

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Setup Swagger documentation
  setupSwagger(app, apiPrefix);

  // Start server
  const port = configService.getOrThrow<number>('app.port');
  await app.listen(port, '0.0.0.0');

  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(
    `Swagger documentation available at: ${await app.getUrl()}${apiPrefix}docs`,
  );
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
