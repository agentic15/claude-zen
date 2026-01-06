import { SkillWrapper } from '../utils/skill-wrapper.js';
import { SyncCommand } from '@agentic15.com/agentic15-claude-zen/src/cli/SyncCommand.js';
import { execSync } from 'child_process';

/**
 * agentic15:sync skill
 *
 * Purpose: Sync with main branch after PR merge
 *
 * Usage:
 *   /agentic15:sync  → Syncs with main and deletes feature branch
 *
 * Workflow:
 *   1. Validates current branch (must be feature/plan/admin or main)
 *   2. Checks for uncommitted changes
 *   3. Verifies PR is merged (if applicable)
 *   4. Switches to main branch
 *   5. Pulls latest changes
 *   6. Deletes feature/plan/admin branch
 */

async function executeSync() {
  // Validate we're in a git repository
  let currentBranch;
  try {
    currentBranch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
  } catch (error) {
    const err = new Error('Not a git repository');
    err.details = 'Unable to determine current git branch';
    err.suggestion = 'Run this command from within a git repository';
    throw err;
  }

  if (!currentBranch) {
    const err = new Error('Detached HEAD state');
    err.details = 'You are in detached HEAD state';
    err.suggestion = 'Checkout a branch first: git checkout <branch-name>';
    throw err;
  }

  // Validate current branch is appropriate for sync
  const isFeatureBranch = currentBranch.startsWith('feature/');
  const isPlanBranch = currentBranch.startsWith('plan/');
  const isAdminBranch = currentBranch.startsWith('admin/');
  const isMain = currentBranch === 'main' || currentBranch === 'master';

  if (!isFeatureBranch && !isPlanBranch && !isAdminBranch && !isMain) {
    const error = new Error('Invalid branch for sync');
    error.details = `Branch '${currentBranch}' is not a feature/plan/admin branch`;
    error.suggestion = 'This command syncs feature/plan/admin branches with main';
    throw error;
  }

  // Check for uncommitted changes
  let hasUncommittedChanges = false;
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf-8' });
    hasUncommittedChanges = status.trim().length > 0;
  } catch (error) {
    const err = new Error('Failed to check git status');
    err.details = 'Unable to check for uncommitted changes';
    err.suggestion = 'Ensure git is working correctly';
    throw err;
  }

  if (hasUncommittedChanges) {
    const error = new Error('Uncommitted changes detected');
    error.details = 'You have uncommitted changes in your working directory';
    error.suggestion = 'Commit or stash your changes first';
    throw error;
  }

  // All validations passed - execute sync command
  console.log('\n🔄 Starting sync workflow...\n');
  SyncCommand.execute();

  return SkillWrapper.formatSuccess(
    'agentic15:sync',
    'Successfully synced with main branch',
    'Start next task: /agentic15:task-next'
  );
}

// Export wrapped skill
export default SkillWrapper.wrap({
  name: 'agentic15:sync',
  description: 'Sync with main branch after PR merge',
  execute: executeSync,
  requiresClaude: true
});
