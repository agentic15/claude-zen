import { SkillWrapper } from '../utils/skill-wrapper.js';
import { TaskCommand } from '@agentic15.com/agentic15-claude-zen/src/cli/TaskCommand.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * agentic15:task-start skill
 *
 * Purpose: Start a specific task by ID
 *
 * Usage:
 *   /agentic15:task-start TASK-003  → Starts task TASK-003
 *
 * Workflow:
 *   1. Validates task ID format (TASK-XXX)
 *   2. Validates active plan and tracker exist
 *   3. Checks task exists and is not completed
 *   4. Creates feature branch and starts the task
 *   5. Creates GitHub issue/Azure work item if configured
 */

async function executeTaskStart(taskId) {
  // Validate task ID is provided
  if (!taskId || taskId.trim().length === 0) {
    const error = new Error('Task ID required');
    error.details = 'You must specify which task to start';
    error.suggestion = 'Provide a task ID: /agentic15:task-start TASK-003';
    throw error;
  }

  taskId = taskId.trim();

  // Validate task ID format (TASK-XXX) - must be uppercase
  if (!taskId.match(/^TASK-\d{3}$/)) {
    const error = new Error('Invalid task ID format');
    error.details = `Task ID "${taskId}" does not match the required format TASK-XXX`;
    error.suggestion = 'Use format TASK-001, TASK-002, etc. (uppercase)';
    throw error;
  }

  // Validate active plan exists
  const activePlanPath = join(process.cwd(), '.claude', 'ACTIVE-PLAN');

  if (!existsSync(activePlanPath)) {
    SkillWrapper.throwCommonError('task', 'noActivePlan');
  }

  const planId = readFileSync(activePlanPath, 'utf-8').trim();

  if (!planId) {
    SkillWrapper.throwCommonError('task', 'noActivePlan');
  }

  // Validate task tracker exists
  const trackerPath = join(process.cwd(), '.claude', 'plans', planId, 'TASK-TRACKER.json');

  if (!existsSync(trackerPath)) {
    const error = new Error('Task tracker not found');
    error.details = 'The plan has not been locked yet';
    error.suggestion = 'Lock the plan first: /agentic15:plan';
    throw error;
  }

  // Load tracker and validate task
  const tracker = JSON.parse(readFileSync(trackerPath, 'utf-8'));
  const task = tracker.taskFiles.find(t => t.id === taskId);

  if (!task) {
    SkillWrapper.throwCommonError('task', 'taskNotFound');
  }

  if (task.status === 'completed') {
    SkillWrapper.throwCommonError('task', 'taskAlreadyCompleted');
  }

  // Check if another task is already in progress
  const inProgress = tracker.taskFiles.find(t => t.status === 'in_progress');
  if (inProgress && inProgress.id !== taskId) {
    const error = new Error('Task already in progress');
    error.details = `Task ${inProgress.id} is currently in progress`;
    error.suggestion = 'Complete the current task first with: /agentic15:commit';
    throw error;
  }

  // All validations passed - start the specified task
  console.log(`\n▶️  Starting task: ${taskId}\n`);
  await TaskCommand.startTask(taskId);

  return SkillWrapper.formatSuccess(
    'agentic15:task-start',
    `Task ${taskId} started successfully`,
    'Tell Claude: "Write code for this task"'
  );
}

// Export wrapped skill
export default SkillWrapper.wrap({
  name: 'agentic15:task-start',
  description: 'Start a specific task by ID',
  execute: executeTaskStart,
  requiresClaude: true
});
