import { SkillWrapper } from '../utils/skill-wrapper.js';
import { TaskCommand } from '@agentic15.com/agentic15-claude-zen/src/cli/TaskCommand.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * agentic15:status skill
 *
 * Purpose: Show current project and task status
 *
 * Usage:
 *   /agentic15:status  → Shows plan progress and current task
 *
 * Workflow:
 *   1. Validates active plan and tracker exist
 *   2. Shows plan ID and progress statistics
 *   3. Shows current task if in progress
 *   4. Lists changed files if applicable
 */

async function executeStatus() {
  // Validate active plan exists
  const activePlanPath = join(process.cwd(), '.claude', 'ACTIVE-PLAN');

  if (!existsSync(activePlanPath)) {
    const error = new Error('No active plan');
    error.details = 'No plan is currently active';
    error.suggestion = 'Create a plan first: /agentic15:plan "Your requirements"';
    throw error;
  }

  const planId = readFileSync(activePlanPath, 'utf-8').trim();

  if (!planId) {
    const error = new Error('No active plan');
    error.details = 'ACTIVE-PLAN file is empty';
    error.suggestion = 'Create a plan first: /agentic15:plan "Your requirements"';
    throw error;
  }

  // Validate task tracker exists
  const trackerPath = join(process.cwd(), '.claude', 'plans', planId, 'TASK-TRACKER.json');

  if (!existsSync(trackerPath)) {
    const error = new Error('Task tracker not found');
    error.details = 'The plan has not been locked yet';
    error.suggestion = 'Lock the plan first: /agentic15:plan';
    throw error;
  }

  // All validations passed - show status
  console.log('\n📊 Showing project status...\n');
  TaskCommand.showStatus();

  return SkillWrapper.formatSuccess(
    'agentic15:status',
    'Status displayed successfully',
    'Continue working on tasks'
  );
}

// Export wrapped skill
export default SkillWrapper.wrap({
  name: 'agentic15:status',
  description: 'Show current project and task status',
  execute: executeStatus,
  requiresClaude: true
});
