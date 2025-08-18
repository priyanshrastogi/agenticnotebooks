import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ConversationsModule } from '@/modules/conversations/conversations.module';
import { CreditsUsageModule } from '@/modules/credits/credits-usage.module';
import { UsersModule } from '@/modules/users/users.module';

import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';

@Module({
  imports: [ConfigModule, ConversationsModule, CreditsUsageModule, UsersModule],
  controllers: [AgentController],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
