import { ChatAnthropic } from '@langchain/anthropic';
import { ChatOpenAI } from '@langchain/openai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { nanoid } from 'nanoid';

import { DatabaseMetadataDto } from '@/modules/agent/dto/database-request.dto';
import { FileMetadataDto } from '@/modules/agent/dto/sheets-request.dto';

import {
  ExecutionPlan,
  Step,
  StepResult,
  StepStatus,
  StepType,
  TaskContext,
  TaskState,
  TaskStatus,
  TaskType,
} from '../types';
import { DependencyResolver } from '../utils/dependency-resolver';
import { DatabaseAgent } from './database-agent.service';
import { ExecutionPlanBuilder } from './execution-plan-builder.service';
import { SheetsAgent } from './sheets-agent.service';

@Injectable()
export class CoordinatorAgent {
  private readonly logger = new Logger(CoordinatorAgent.name);
  private readonly dependencyResolver = new DependencyResolver();
  private openAIModel: ChatOpenAI;
  private anthropicModel: ChatAnthropic;

  constructor(
    private readonly planBuilder: ExecutionPlanBuilder,
    private readonly databaseAgent: DatabaseAgent,
    private readonly sheetsAgent: SheetsAgent,
    private readonly configService: ConfigService,
  ) {
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
      anthropicApiKey: this.configService.getOrThrow<string>(
        'agent.anthropicApiKey',
      ),
      temperature: 0.1,
    });
  }

  /**
   * Process a task and create an execution plan
   */
  async processTask(
    query: string,
    context: TaskContext,
    conversationId: string,
    userId: string,
  ): Promise<TaskState> {
    const taskId = `task_${Date.now()}_${nanoid(6)}`;

    try {
      this.logger.log(`Processing task ${taskId} for user ${userId}`);

      // 1. Build intelligent execution plan using LLMs (this also determines task type)
      const plan = await this.planBuilder.buildPlan(
        query,
        context,
        context.preferredLLM,
      );

      // 2. Extract task type from the plan
      const taskType = this.determineTaskType(plan);

      this.logger.log(`Task type identified: ${taskType}`);

      // 3. Initialize task state
      const state: TaskState = {
        taskId,
        conversationId,
        userId,
        query,
        taskType,
        context,
        plan,
        status: TaskStatus.EXECUTING,
        completedSteps: new Set(),
        stepResults: new Map(),
        startTime: new Date(),
      };

      // 4. Execute plan
      return await this.executePlan(state);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Task processing error: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Continue execution of an existing task
   */
  async continueExecution(state: TaskState): Promise<TaskState> {
    return this.executePlan(state);
  }

  /**
   * Complete a step with client results
   */
  completeStep(
    state: TaskState,
    stepId: string,
    result: unknown,
    executionTime: number,
  ): void {
    const step = state.plan.steps.find((s) => s.id === stepId);
    if (!step) {
      throw new Error(`Step ${stepId} not found`);
    }

    // Mark step as completed
    step.status = StepStatus.COMPLETED;
    step.result = {
      success: true,
      data: result,
    };
    step.endTime = new Date();

    state.completedSteps.add(step.id);
    state.stepResults.set(step.id, result);

    // Update dependent steps
    this.dependencyResolver.updateDependentSteps(
      step.id,
      state.plan,
      state.completedSteps,
    );

    this.logger.log(`Step ${stepId} completed in ${executionTime}ms`);
  }

  /**
   * Handle step error
   */
  handleStepError(state: TaskState, stepId: string, error: string): void {
    const step = state.plan.steps.find((s) => s.id === stepId);
    if (!step) {
      throw new Error(`Step ${stepId} not found`);
    }

    step.status = StepStatus.ERROR;
    step.result = {
      success: false,
      error,
    };
    step.endTime = new Date();

    state.status = TaskStatus.ERROR;
    state.error = {
      message: error,
      stepId,
      recoverable: false,
      timestamp: new Date(),
    };

    this.logger.error(`Step ${stepId} failed: ${error}`);
  }

  private async executePlan(state: TaskState): Promise<TaskState> {
    try {
      while (state.completedSteps.size < state.plan.steps.length) {
        // Get next executable steps
        const executableSteps = this.dependencyResolver.getExecutableSteps(
          state.plan,
          state.completedSteps,
        );

        if (executableSteps.length === 0) {
          // Check if waiting for client
          const executingSteps = state.plan.steps.filter(
            (s) => s.status === StepStatus.EXECUTING,
          );

          if (executingSteps.length > 0) {
            state.status = TaskStatus.WAITING_FOR_CLIENT;
            return state;
          }

          // No progress possible
          throw new Error(
            'No executable steps found - possible circular dependency',
          );
        }

        // Execute steps sequentially (can be parallel in future)
        for (const step of executableSteps) {
          await this.executeStep(step, state);

          // Check if we need client execution
          if (step.result?.artifact && step.status === StepStatus.EXECUTING) {
            state.currentStepId = step.id;
            state.status = TaskStatus.WAITING_FOR_CLIENT;
            return state;
          }
        }
      }

      // All steps completed
      state.status = TaskStatus.COMPLETED;
      state.finalResponse = this.generateFinalResponse(state);
      state.endTime = new Date();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      state.status = TaskStatus.ERROR;
      state.error = {
        message: errorMessage,
        recoverable: false,
        timestamp: new Date(),
      };
    }

    return state;
  }

  private async executeStep(step: Step, state: TaskState): Promise<void> {
    step.status = StepStatus.EXECUTING;
    step.startTime = new Date();

    try {
      // Execute based on step type
      let result: StepResult;

      switch (step.type) {
        case StepType.FETCH_DATABASE:
          result = await this.executeDatabaseFetch(
            state.query,
            state.context.databases,
            state.conversationId,
            state.context.preferredLLM,
          );
          break;

        case StepType.PROCESS_SHEETS:
          result = await this.executeSheetsProcess(
            state.query,
            state.context.spreadsheets || [],
            state.conversationId,
            state.context.preferredLLM,
            state,
          );
          break;

        case StepType.EXECUTE_TRANSFER:
          result = await this.executeTransfer();
          break;

        default:
          // This should never happen due to TypeScript's exhaustive checking
          throw new Error(`Unknown step type: ${step.type as string}`);
      }

      step.result = result;

      // If artifact needs client execution, keep status as executing
      if (result.artifact) {
        // Status remains EXECUTING, will be updated when client completes
        return;
      }

      // Otherwise, mark as completed
      this.completeStepInternal(step, state);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      step.status = StepStatus.ERROR;
      step.result = {
        success: false,
        error: errorMessage,
      };
      step.endTime = new Date();
      throw error;
    }
  }

  private completeStepInternal(step: Step, state: TaskState): void {
    step.status = StepStatus.COMPLETED;
    step.endTime = new Date();
    state.completedSteps.add(step.id);

    if (step.result?.data) {
      state.stepResults.set(step.id, step.result.data);
    }

    // Update dependent steps
    this.dependencyResolver.updateDependentSteps(
      step.id,
      state.plan,
      state.completedSteps,
    );
  }

  private determineTaskType(plan: ExecutionPlan): TaskType {
    if (plan.steps.length === 1) {
      return plan.steps[0].type === StepType.FETCH_DATABASE
        ? TaskType.SINGLE_DATABASE
        : TaskType.SINGLE_SHEETS;
    }

    // For multiple steps, check if it's a transfer operation or comparison
    const hasTransfer = plan.steps.some(
      (s) => s.type === StepType.EXECUTE_TRANSFER,
    );
    return hasTransfer ? TaskType.TRANSFER_DATA : TaskType.COMPARE_DATA;
  }

  private gatherInputs(step: Step, state: TaskState): Record<string, unknown> {
    const inputs: Record<string, unknown> = {};

    step.dependsOn.forEach((depId: string) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const depResult = state.stepResults.get(depId);
      if (depResult !== undefined) {
        inputs[depId] = depResult;
      }
    });

    return inputs;
  }

  // Step execution methods (basic implementations for Phase 1)
  private async executeDatabaseFetch(
    query: string,
    metadata: unknown,
    conversationId: string,
    preferredLLM?: string,
  ): Promise<StepResult> {
    if (!metadata) {
      throw new Error('Database metadata is required');
    }

    // Use dedicated database agent with proper typing
    const result = await this.databaseAgent.chatWithDatabase(
      query,
      metadata as DatabaseMetadataDto,
      conversationId,
      [],
      preferredLLM,
    );

    return {
      success: true,
      artifact: {
        type: 'sql',
        content: result.sql || 'SELECT 1;',
        metadata: {
          explanation: result.response,
        },
      },
    };
  }

  private async executeSheetsProcess(
    query: string,
    spreadsheets: unknown[],
    conversationId: string,
    preferredLLM?: string,
    state?: TaskState,
  ): Promise<StepResult> {
    // For hybrid operations, check if we have database results to include
    let enhancedQuery = query;
    let databaseResult: unknown;

    if (state) {
      // Check if there's a database step in the completed steps
      const dbStepId = Array.from(state.completedSteps).find((stepId) => {
        const step = state.plan.steps.find((s) => s.id === stepId);
        return step?.type === StepType.FETCH_DATABASE;
      });

      if (dbStepId) {
        databaseResult = state.stepResults.get(dbStepId);
        enhancedQuery = `${query}

CONTEXT: You also have access to database results that were queried previously. Use the 'databaseResult' variable to access this data for comparison or analysis.`;
      }
    }

    // Spreadsheets are optional now - can work with database results only
    if (!spreadsheets.length && !databaseResult) {
      throw new Error(
        'Either spreadsheet files or database results are required',
      );
    }

    // Use dedicated sheets agent with proper typing
    const result = await this.sheetsAgent.chatWithSheets(
      enhancedQuery,
      (spreadsheets as FileMetadataDto[]) || [],
      conversationId,
      [],
      preferredLLM,
    );

    return {
      success: true,
      artifact: {
        type: 'code',
        content: result.code || 'function processData() { return []; }',
        metadata: {
          newFileName: result.newFileName,
          explanation: result.response,
          hasDatabaseContext: !!databaseResult,
        },
      },
    };
  }

  private executeTransfer(): Promise<StepResult> {
    // TODO: Implement transfer logic in Phase 2
    return Promise.resolve({
      success: true,
      artifact: {
        type: 'sql',
        content: 'INSERT INTO table_name VALUES (...); -- TODO',
        metadata: {
          transferType: 'data_transfer',
        },
      },
    });
  }

  private generateFinalResponse(state: TaskState): string {
    const successfulSteps = state.plan.steps.filter(
      (s) => s.status === StepStatus.COMPLETED,
    ).length;

    const responses: string[] = [];

    switch (state.taskType) {
      case TaskType.COMPARE_DATA:
        responses.push(
          "I've completed the data comparison between your database and spreadsheet.",
          `Successfully executed ${successfulSteps} steps to analyze the data.`,
          'The comparison results show the matches, mismatches, and unique records from each source.',
        );
        break;

      case TaskType.TRANSFER_DATA:
        responses.push(
          "I've prepared the data transfer from your spreadsheet to the database.",
          `The process involved ${successfulSteps} steps including extraction, transformation, and loading.`,
          'Review the results to see how many records were processed.',
        );
        break;

      default:
        responses.push(
          `Task completed successfully with ${successfulSteps} steps executed.`,
        );
    }

    return responses.join(' ');
  }

  private getLLM(provider?: string): ChatOpenAI | ChatAnthropic {
    return provider === 'anthropic' ? this.anthropicModel : this.openAIModel;
  }

  private safeExtractContent(content: unknown): string {
    if (typeof content === 'string') {
      return content.trim();
    }
    if (content && typeof content === 'object' && 'text' in content) {
      return (content as { text: string }).text.trim();
    }
    throw new Error('Unable to extract text content from LLM response');
  }

  private extractCode(content: string): string {
    // Remove markdown code blocks if present
    let code = content.trim();

    if (code.includes('```')) {
      const codeMatch = code.match(/```(?:javascript|js)?\s*([\s\S]*?)```/);
      if (codeMatch && codeMatch[1]) {
        code = codeMatch[1].trim();
      }
    }

    return code;
  }
}
