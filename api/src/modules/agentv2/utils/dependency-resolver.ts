import { ExecutionPlan, Step, StepStatus } from '../types';

export class DependencyResolver {
  /**
   * Validates that the execution plan has no circular dependencies
   */
  validatePlan(plan: ExecutionPlan): boolean {
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const hasCycle = (stepId: string): boolean => {
      if (visiting.has(stepId)) return true;
      if (visited.has(stepId)) return false;

      visiting.add(stepId);

      const step = plan.steps.find((s) => s.id === stepId);
      if (!step) return false;

      for (const depId of step.dependsOn) {
        if (hasCycle(depId)) return true;
      }

      visiting.delete(stepId);
      visited.add(stepId);
      return false;
    };

    return !plan.steps.some((step) => hasCycle(step.id));
  }

  /**
   * Groups steps by execution level (steps that can run in parallel)
   */
  getExecutionLevels(plan: ExecutionPlan): Step[][] {
    const levels: Step[][] = [];
    const completed = new Set<string>();
    const remaining = [...plan.steps];

    while (remaining.length > 0) {
      const currentLevel = remaining.filter((step) =>
        step.dependsOn.every((depId) => completed.has(depId)),
      );

      if (currentLevel.length === 0) {
        throw new Error(
          'Invalid execution plan - circular dependency detected',
        );
      }

      levels.push(currentLevel);
      currentLevel.forEach((step) => {
        completed.add(step.id);
        const index = remaining.indexOf(step);
        if (index > -1) remaining.splice(index, 1);
      });
    }

    return levels;
  }

  /**
   * Gets steps that are ready to execute based on completed dependencies
   */
  getExecutableSteps(plan: ExecutionPlan, completedSteps: Set<string>): Step[] {
    return plan.steps.filter((step) => {
      // Skip if not ready or already completed
      if (step.status !== StepStatus.READY || completedSteps.has(step.id)) {
        return false;
      }

      // Check all dependencies are completed
      return step.dependsOn.every((depId) => completedSteps.has(depId));
    });
  }

  /**
   * Updates dependent steps when a step is completed
   */
  updateDependentSteps(
    completedStepId: string,
    plan: ExecutionPlan,
    completedSteps: Set<string>,
  ): void {
    const dependentIds = plan.dependencies.get(completedStepId) || [];

    dependentIds.forEach((stepId) => {
      const step = plan.steps.find((s) => s.id === stepId);
      if (!step) return;

      // Check if all dependencies are met
      const allDependenciesMet = step.dependsOn.every((depId) =>
        completedSteps.has(depId),
      );

      if (allDependenciesMet && step.status === StepStatus.PENDING) {
        step.status = StepStatus.READY;
      }
    });
  }

  /**
   * Builds the dependency map from execution plan
   */
  buildDependencyMap(steps: Step[]): Map<string, string[]> {
    const dependencies = new Map<string, string[]>();

    steps.forEach((step) => {
      step.dependsOn.forEach((depId) => {
        if (!dependencies.has(depId)) {
          dependencies.set(depId, []);
        }
        dependencies.get(depId)!.push(step.id);
      });
    });

    return dependencies;
  }
}
