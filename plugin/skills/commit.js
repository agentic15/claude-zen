import { SkillWrapper } from '../utils/skill-wrapper.js';
import { CommitCommand } from '@agentic15.com/agentic15-claude-zen/src/cli/CommitCommand.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

/**
 * agentic15:commit skill
 *
 * Purpose: Commit completed task and create pull request
 *
 * Usage:
 *   /agentic15:commit  → Commits current task and creates PR
 *
 * Workflow:
 *   1. Validates active plan and task exist
 *   2. Checks for uncommitted changes
 *   3. Marks task as completed
 *   4. Creates commit and pushes to remote
 *   5. Creates pull request
 *   6. Updates GitHub issue if configured
 */

async function executeCommit() {
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

  // Load tracker and check for active task
  const tracker = JSON.parse(readFileSync(trackerPath, 'utf-8'));
  const activeTask = tracker.taskFiles.find(t => t.status === 'in_progress');

  // Check for pending changes (git diff/status)
  let hasPendingChanges = false;
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf-8' });
    hasPendingChanges = status.trim().length > 0;
  } catch (error) {
    // Git command failed - not in a git repo?
    const err = new Error('Git repository check failed');
    err.details = 'Unable to check git status';
    err.suggestion = 'Ensure you are in a git repository';
    throw err;
  }

  // If no active task and no pending changes, error
  if (!activeTask && !hasPendingChanges) {
    SkillWrapper.throwCommonError('commit', 'noActiveTask');
  }

  // If no active task but has pending changes, that's OK (fallback mode)
  // If active task but no pending changes, warn but allow (user might want to create empty commit)

  if (!activeTask && hasPendingChanges) {
    console.log('\n⚠️  No active task, but found uncommitted changes');
    console.log('   Proceeding in fallback mode...\n');
  }

  if (activeTask && !hasPendingChanges) {
    console.log('\n⚠️  No uncommitted changes detected');
    console.log('   Proceeding anyway (might create empty commit)...\n');
  }

  // Check current branch is not main/master
  let currentBranch;
  try {
    currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
  } catch (error) {
    const err = new Error('Failed to get current branch');
    err.details = 'Unable to determine current git branch';
    err.suggestion = 'Ensure you are in a git repository';
    throw err;
  }

  if (currentBranch === 'main' || currentBranch === 'master') {
    SkillWrapper.throwCommonError('commit', 'branchProtected');
  }

  // All validations passed - execute commit command
  console.log('\n🚀 Starting commit workflow...\n');
  await CommitCommand.execute();

  return SkillWrapper.formatSuccess(
    'agentic15:commit',
    activeTask ? `Task ${activeTask.id} committed and PR created` : 'Changes committed and PR updated',
    'Review the PR and merge when ready'
  );
}

// Export wrapped skill
export default SkillWrapper.wrap({
  name: 'agentic15:commit',
  description: 'Commit completed task and create pull request',
  execute: executeCommit,
  requiresClaude: true
});
