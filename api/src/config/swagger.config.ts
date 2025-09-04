import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { FastifyInstance } from 'fastify';

export function setupSwagger(app: INestApplication, apiPrefix: string): void {
  const configService = app.get(ConfigService);
  const environment = configService.get<string>('app.environment');

  // Set up Swagger document
  const options = new DocumentBuilder()
    .setTitle('XLSX Chat API')
    .setDescription('API documentation for the XLSX Chat application')
    .setVersion('0.1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth'
    )
    .build();

  const document = SwaggerModule.createDocument(app, options);

  // Add basic auth protection for Swagger UI in non-development environments
  if (environment !== 'development') {
    const swaggerUser = 'user';
    const swaggerPassword = 'ApiDocs2025';

    // Get the underlying Fastify instance
    const fastifyInstance = app.getHttpAdapter().getInstance() as FastifyInstance;

    // Register basic auth for the Swagger documentation route
    fastifyInstance.addHook('preHandler', (request, reply, done) => {
      const url = request.url;

      // Only apply basic auth to Swagger documentation routes
      if (url.startsWith(`${apiPrefix}docs`)) {
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Basic ')) {
          reply.header('WWW-Authenticate', 'Basic');
          reply.status(401).send('Authentication required');
          return;
        }

        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
        const [username, password] = credentials.split(':');

        if (username !== swaggerUser || password !== swaggerPassword) {
          reply.header('WWW-Authenticate', 'Basic');
          reply.status(401).send('Invalid credentials');
          return;
        }
      }

      done();
    });
  }

  // Set up Swagger UI
  SwaggerModule.setup(`${apiPrefix}docs`, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
}
