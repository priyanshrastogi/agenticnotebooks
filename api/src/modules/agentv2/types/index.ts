// Core enums for the multi-agent system
export enum AgentType {
  COORDINATOR = 'coordinator',
  DATABASE = 'database',
  SHEETS = 'sheets',
}

export enum TaskType {
  SINGLE_DATABASE = 'single_database',
  SINGLE_SHEETS = 'single_sheets',
  COMPARE_DATA = 'compare_data',
  TRANSFER_DATA = 'transfer_data',
}

export enum StepType {
  FETCH_DATABASE = 'fetch_database',
  PROCESS_SHEETS = 'process_sheets',
  EXECUTE_TRANSFER = 'execute_transfer',
}

export enum StepStatus {
  PENDING = 'pending',
  READY = 'ready',
  EXECUTING = 'executing',
  COMPLETED = 'completed',
  ERROR = 'error',
}

export enum TaskStatus {
  PLANNING = 'planning',
  EXECUTING = 'executing',
  WAITING_FOR_CLIENT = 'waiting_for_client',
  COMPLETED = 'completed',
  ERROR = 'error',
}

// Core interfaces for execution steps
export interface StepResult {
  success: boolean;
  artifact?: {
    type: 'sql' | 'code';
    content: string;
    metadata?: Record<string, any>;
  };
  data?: any;
  error?: string;
}

export interface Step {
  id: string;
  type: StepType;
  description: string;
  agent: AgentType;

  // Dependencies
  dependsOn: string[];

  // Execution state
  status: StepStatus;
  inputs?: Record<string, any>;

  // Results
  result?: StepResult;
  startTime?: Date;
  endTime?: Date;
}

export interface ExecutionPlan {
  id: string;
  steps: Step[];
  dependencies: Map<string, string[]>; // stepId -> [dependentStepIds]
  createdAt: Date;
}

// Task context from existing DTOs
export interface TaskContext {
  databases?: any; // Will use existing DatabaseMetadataDto
  spreadsheets?: any[]; // Will use existing FileMetadataDto[]
  preferredLLM?: 'openai' | 'anthropic';
}

// Task state management
export interface TaskState {
  // Identification
  taskId: string;
  conversationId: string;
  userId: string;

  // Task details
  query: string;
  taskType: TaskType;
  context: TaskContext;

  // Execution
  plan: ExecutionPlan;
  status: TaskStatus;

  // Progress tracking
  completedSteps: Set<string>;
  stepResults: Map<string, any>;
  currentStepId?: string;

  // Results
  finalResponse?: string;
  artifacts?: ResponseArtifact[];
  error?: TaskError;

  // Timing
  startTime: Date;
  endTime?: Date;
}

export interface ResponseArtifact {
  stepId: string;
  type: string;
  content: string;
  metadata?: Record<string, any>;
}

export interface TaskError {
  message: string;
  stepId?: string;
  recoverable: boolean;
  timestamp: Date;
}

// WebSocket message types
export interface PlanMessage {
  taskId: string;
  plan: {
    steps: Array<{
      id: string;
      description: string;
      dependsOn: string[];
      status: StepStatus;
    }>;
  };
}

export interface ExecuteArtifactsMessage {
  taskId: string;
  artifacts: Array<{
    stepId: string;
    type: string;
    content: string;
    dependsOn: string[];
    metadata?: Record<string, any>;
  }>;
}

export interface ProgressMessage {
  taskId: string;
  stepId: string;
  status: StepStatus;
  progress?: number;
  message?: string;
}

export interface CompleteMessage {
  taskId: string;
  conversationId: string;
  response: string;
  artifacts?: ResponseArtifact[];
  executionTime?: number;
}

export interface StepCompletedMessage {
  taskId: string;
  stepId: string;
  result: any;
  executionTime: number;
}

export interface StepErrorMessage {
  taskId: string;
  stepId: string;
  error: string;
}
