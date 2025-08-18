import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import agentConfig from '@/config/agent.config';
import appConfig from '@/config/app.config';
import authConfig from '@/config/auth.config';
import databaseConfig from '@/config/database.config';
import emailConfig from '@/config/email.config';
import { AgentModule } from '@/modules/agent/agent.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { ConversationsModule } from '@/modules/conversations/conversations.module';
import { CreditsUsageModule } from '@/modules/credits/credits-usage.module';
import { EmailModule } from '@/modules/email/email.module';
import { UsersModule } from '@/modules/users/users.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, authConfig, appConfig, emailConfig, agentConfig],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions =>
        configService.getOrThrow<TypeOrmModuleOptions>('database'),
    }),

    // Application modules
    AuthModule,
    UsersModule,
    EmailModule,
    AgentModule,
    ConversationsModule,
    CreditsUsageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
