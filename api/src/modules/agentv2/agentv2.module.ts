import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CoordinatorAgent } from './services/coordinator-agent.service';
import { DatabaseAgent } from './services/database-agent.service';
import { ExecutionPlanBuilder } from './services/execution-plan-builder.service';
import { SheetsAgent } from './services/sheets-agent.service';

@Module({
  imports: [ConfigModule],
  providers: [DatabaseAgent, SheetsAgent, CoordinatorAgent, ExecutionPlanBuilder],
  exports: [DatabaseAgent, SheetsAgent, CoordinatorAgent, ExecutionPlanBuilder],
})
export class AgentV2Module {}
