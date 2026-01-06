import { SkillWrapper } from '../utils/skill-wrapper.js';
import { TaskCommand } from '@agentic15.com/agentic15-claude-zen/src/cli/TaskCommand.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * agentic15:task-next skill
 *
 * Purpose: Start the next pending task in the active plan
 *
 * Usage:
 *   /agentic15:task-next  → Starts the next pending task
 *
 * Workflow:
 *   1. Validates active plan and tracker exist
 *   2. Finds the next pending task
 *   3. Creates feature branch and starts the task
 *   4. Creates GitHub issue/Azure work item if configured
 */

async function executeTaskNext() {
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

  // Load tracker and check for pending tasks
  const tracker = JSON.parse(readFileSync(trackerPath, 'utf-8'));
  const nextTask = tracker.taskFiles.find(t => t.status === 'pending');

  if (!nextTask) {
    SkillWrapper.throwCommonError('task', 'noPendingTasks');
  }

  // Check if another task is already in progress
  const inProgress = tracker.taskFiles.find(t => t.status === 'in_progress');
  if (inProgress) {
    const error = new Error('Task already in progress');
    error.details = `Task ${inProgress.id} is currently in progress`;
    error.suggestion = 'Complete the current task first with: /agentic15:commit';
    throw error;
  }

  // All validations passed - start the next task
  console.log(`\n▶️  Starting next task: ${nextTask.id}\n`);
  await TaskCommand.startNext();

  return SkillWrapper.formatSuccess(
    'agentic15:task-next',
    `Task ${nextTask.id} started successfully`,
    'Tell Claude: "Write code for this task"'
  );
}

// Export wrapped skill
export default SkillWrapper.wrap({
  name: 'agentic15:task-next',
  description: 'Start the next pending task in the active plan',
  execute: executeTaskNext,
  requiresClaude: true
});
