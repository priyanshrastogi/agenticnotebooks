import { ChatAnthropic } from '@langchain/anthropic';
import { ChatOpenAI } from '@langchain/openai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { nanoid } from 'nanoid';

import {
  AgentType,
  ExecutionPlan,
  Step,
  StepStatus,
  StepType,
  TaskContext,
  TaskType,
} from '../types';
import { DependencyResolver } from '../utils/dependency-resolver';

interface PlanningResponse {
  taskType: TaskType;
  steps: Array<{
    id: string;
    type: StepType;
    description: string;
    agent: AgentType;
    dependsOn: string[];
    reasoning: string;
  }>;
  reasoning: string;
}

@Injectable()
export class ExecutionPlanBuilder {
  private readonly logger = new Logger(ExecutionPlanBuilder.name);
  private readonly dependencyResolver = new DependencyResolver();
  private openAIModel: ChatOpenAI;
  private anthropicModel: ChatAnthropic;

  constructor(private configService: ConfigService) {
    this.initialize();
  }

  private initialize() {
    this.openAIModel = new ChatOpenAI({
      modelName: this.configService.get<string>('agent.openaiModel'),
      openAIApiKey: this.configService.getOrThrow<string>('agent.openaiApiKey'),
      temperature: 0.1,
    });

    this.anthropicModel = new ChatAnthropic({
      modelName: this.configService.get<string>('agent.anthropicModel'),
      anthropicApiKey: this.configService.getOrThrow<string>('agent.anthropicApiKey'),
      temperature: 0.1,
    });
  }

  async buildPlan(
    query: string,
    context: TaskContext,
    preferredLLM?: string
  ): Promise<ExecutionPlan> {
    const planId = `plan_${Date.now()}_${nanoid(6)}`;

    this.logger.log(`Building intelligent execution plan for query: ${query}`);

    // Use LLM to analyze the task and generate execution plan
    const planningResponse = await this.generatePlanWithLLM(query, context, preferredLLM);

    // Convert LLM response to execution steps
    const steps: Step[] = planningResponse.steps.map((stepDef) => ({
      id: stepDef.id,
      type: stepDef.type,
      description: stepDef.description,
      agent: stepDef.agent,
      dependsOn: stepDef.dependsOn,
      status: stepDef.dependsOn.length === 0 ? StepStatus.READY : StepStatus.PENDING,
    }));

    // Build dependency map
    const dependencies = this.dependencyResolver.buildDependencyMap(steps);

    const plan: ExecutionPlan = {
      id: planId,
      steps,
      dependencies,
      createdAt: new Date(),
    };

    // Validate the plan
    if (!this.dependencyResolver.validatePlan(plan)) {
      throw new Error('Invalid execution plan - circular dependencies detected');
    }

    this.logger.log(
      `Created intelligent execution plan with ${steps.length} steps: ${planningResponse.reasoning}`
    );
    return plan;
  }

  private async generatePlanWithLLM(
    query: string,
    context: TaskContext,
    preferredLLM?: string
  ): Promise<PlanningResponse> {
    const model = this.getLLM(preferredLLM);

    const systemPrompt = {
      role: 'system',
      content: `You are an intelligent execution planner for a multi-agent data processing system.

Your job is to analyze user queries and create execution plans that coordinate between database and spreadsheet agents.

AVAILABLE AGENTS:
- DATABASE: Can fetch data from databases using SQL queries
- SHEETS: Can process, analyze, compare, and transform any data using JavaScript

AVAILABLE STEP TYPES:
- FETCH_DATABASE: Query database for data (returns SQL to execute)
- PROCESS_SHEETS: Process/analyze data using JavaScript (can handle spreadsheets, CSV data from database, comparisons, transformations)
- EXECUTE_TRANSFER: Transfer data between systems

TASK TYPES:
- SINGLE_DATABASE: Only database operations needed
- SINGLE_SHEETS: Only spreadsheet operations needed  
- COMPARE_DATA: Compare data between database and spreadsheets
- TRANSFER_DATA: Transfer data from spreadsheets to database or vice versa

SIMPLIFIED LOGIC:
1. For sheet-only analysis/comparison → Use PROCESS_SHEETS only
2. For database-only analysis → Use FETCH_DATABASE only  
3. For complex database analysis that needs JavaScript → FETCH_DATABASE then PROCESS_SHEETS (database result as CSV)
4. For database vs sheet comparison → FETCH_DATABASE then PROCESS_SHEETS (treat DB result as CSV, compare with sheets)
5. For data transfer → Use both agents as needed

KEY INSIGHT: Database results can be treated as CSV data and processed by the SHEETS agent for any complex analysis, comparison, or transformation.

RULES:
1. Analyze the user's intent carefully
2. Use the minimum necessary steps (often just 1 or 2 steps)
3. For hybrid operations, chain DB → SHEETS (database result becomes CSV input for sheets agent)
4. Set up proper dependencies between steps
5. Each step should have a unique ID and clear description

RESPONSE FORMAT (JSON only):
{
  "taskType": "COMPARE_DATA",
  "steps": [
    {
      "id": "unique_step_id",
      "type": "FETCH_DATABASE", 
      "description": "Clear description of what this step does",
      "agent": "DATABASE",
      "dependsOn": [],
      "reasoning": "Why this step is needed"
    }
  ],
  "reasoning": "Overall explanation of the execution plan"
}`,
    };

    const contextInfo = this.buildContextInfo(context);

    const userPrompt = {
      role: 'user',
      content: `USER QUERY: "${query}"

AVAILABLE CONTEXT:
${contextInfo}

Please analyze this query and create an intelligent execution plan. Consider:
1. What is the user actually trying to accomplish?
2. What data sources are involved?
3. What operations are needed?
4. What is the optimal sequence of steps?

Respond with ONLY the JSON execution plan, no other text.`,
    };

    const result = await model.invoke([systemPrompt, userPrompt]);

    // Safely extract content from LLM response
    let responseText: string;
    if (typeof result.content === 'string') {
      responseText = result.content.trim();
    } else if (result.content && typeof result.content === 'object' && 'text' in result.content) {
      responseText = (result.content as { text: string }).text.trim();
    } else {
      throw new Error('Unable to extract text content from LLM response');
    }

    // Remove markdown code blocks if present
    const cleanedResponse = responseText.replace(/```json\s*|\s*```/g, '').trim();

    try {
      const planningResponse = JSON.parse(cleanedResponse) as PlanningResponse;

      // Validate the response structure
      this.validatePlanningResponse(planningResponse);

      return planningResponse;
    } catch (error) {
      this.logger.error(
        `Failed to parse LLM planning response: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      this.logger.error(`Raw response: ${cleanedResponse}`);
      throw new Error(`Invalid execution plan generated by LLM. Please try again.`);
    }
  }

  private buildContextInfo(context: TaskContext): string {
    const parts: string[] = [];

    if (context.databases) {
      parts.push(`- DATABASE AVAILABLE: ${JSON.stringify(context.databases, null, 2)}`);
    }

    if (context.spreadsheets?.length) {
      parts.push(`- SPREADSHEETS AVAILABLE: ${context.spreadsheets.length} files`);
      context.spreadsheets.forEach((file, idx) => {
        parts.push(`  File ${idx + 1}: ${JSON.stringify(file, null, 2)}`);
      });
    }

    if (context.preferredLLM) {
      parts.push(`- PREFERRED LLM: ${context.preferredLLM}`);
    }

    return parts.join('\n');
  }

  private validatePlanningResponse(response: PlanningResponse): void {
    if (!response.taskType || !response.steps || !Array.isArray(response.steps)) {
      throw new Error('Invalid planning response structure');
    }

    if (!Object.values(TaskType).includes(response.taskType)) {
      throw new Error(`Invalid task type: ${response.taskType}`);
    }

    for (const step of response.steps) {
      if (!step.id || !step.type || !step.description || !step.agent) {
        throw new Error('Invalid step structure in planning response');
      }

      if (!Object.values(StepType).includes(step.type)) {
        throw new Error(`Invalid step type: ${step.type}`);
      }

      if (!Object.values(AgentType).includes(step.agent)) {
        throw new Error(`Invalid agent type: ${step.agent}`);
      }
    }
  }

  private getLLM(provider?: string): ChatOpenAI | ChatAnthropic {
    return provider === 'anthropic' ? this.anthropicModel : this.openAIModel;
  }
}
