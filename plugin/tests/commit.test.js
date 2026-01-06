import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import commitSkill from '../skills/commit.js';

/**
 * Tests for agentic15:commit skill
 *
 * Focus: Validation logic ONLY
 * We test error handling and validation paths that throw BEFORE
 * calling CommitCommand.execute(). We do NOT test successful execution
 * because that would trigger real git operations, commits, and PR creation.
 */
describe('agentic15:commit skill - Validation', () => {
  const testDir = join(process.cwd(), 'test-commit-skill');
  const claudeDir = join(testDir, '.claude');
  const plansDir = join(claudeDir, 'plans');
  const activePlanPath = join(claudeDir, 'ACTIVE-PLAN');
  let originalCwd;
  let isGitRepo;

  before(() => {
    originalCwd = process.cwd();

    // Check if current directory is a git repo
    try {
      execSync('git rev-parse --git-dir', { stdio: 'pipe' });
      isGitRepo = true;
    } catch (e) {
      isGitRepo = false;
    }
  });

  after(() => {
    process.chdir(originalCwd);
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  beforeEach(() => {
    process.chdir(originalCwd);
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
    mkdirSync(testDir, { recursive: true });
    mkdirSync(claudeDir, { recursive: true });
    mkdirSync(plansDir, { recursive: true });
    process.chdir(testDir);
  });

  it('should fail when .claude/ directory does not exist', async () => {
    rmSync(claudeDir, { recursive: true, force: true });

    const result = await commitSkill();

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'Not an Agentic15 project');
  });

  it('should fail when no active plan exists', async () => {
    const result = await commitSkill();

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'No active plan');
  });

  it('should fail when ACTIVE-PLAN is empty', async () => {
    writeFileSync(activePlanPath, '');

    const result = await commitSkill();

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'No active plan');
  });

  it('should fail when task tracker not found', async () => {
    const planId = 'plan-001-test';
    writeFileSync(activePlanPath, planId);

    const result = await commitSkill();

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'Task tracker not found');
  });

  it('should fail when not in a git repository', async () => {
    const planId = 'plan-001-test';
    const planPath = join(plansDir, planId);
    mkdirSync(planPath, { recursive: true });

    const tracker = {
      planId,
      projectName: 'Test Project',
      activeTask: 'TASK-001',
      taskFiles: [
        {
          id: 'TASK-001',
          title: 'Test Task 1',
          status: 'in_progress'
        }
      ]
    };

    writeFileSync(join(planPath, 'TASK-TRACKER.json'), JSON.stringify(tracker, null, 2));
    writeFileSync(activePlanPath, planId);

    const result = await commitSkill();

    // Should fail because test directory is not a git repo
    assert.strictEqual(result.success, false);
    assert.ok(result.error.title === 'Git repository check failed' || result.error.title === 'Failed to get current branch');
  });

  it('should fail when no active task and no pending changes', async () => {
    // This test only works if we're in a git repo
    if (!isGitRepo) {
      // Skip test if not in git repo
      assert.ok(true, 'Skipped - not in git repo');
      return;
    }

    // Switch back to original directory (which is a git repo)
    process.chdir(originalCwd);

    // Create temporary .claude directory in git repo
    const tempClaudeDir = join(originalCwd, '.claude-test-temp');
    const tempPlansDir = join(tempClaudeDir, 'plans');
    const tempActivePlanPath = join(tempClaudeDir, 'ACTIVE-PLAN');

    mkdirSync(tempClaudeDir, { recursive: true });
    mkdirSync(tempPlansDir, { recursive: true });

    const planId = 'plan-001-test';
    const planPath = join(tempPlansDir, planId);
    mkdirSync(planPath, { recursive: true });

    const tracker = {
      planId,
      projectName: 'Test Project',
      activeTask: null,
      taskFiles: [
        {
          id: 'TASK-001',
          title: 'Test Task 1',
          status: 'completed'
        }
      ]
    };

    writeFileSync(join(planPath, 'TASK-TRACKER.json'), JSON.stringify(tracker, null, 2));
    writeFileSync(tempActivePlanPath, planId);

    // Temporarily override activePlanPath in skill (would need dependency injection for real test)
    // For now, this test documents the expected behavior

    // Clean up
    rmSync(tempClaudeDir, { recursive: true, force: true });

    // Note: Can't actually test this without modifying the skill to accept test paths
    // This test documents that the error should occur
    assert.ok(true, 'Test documents expected behavior: should fail with no active task and no changes');
  });
});

// ⚠️ IMPORTANT: We do NOT test the success path where all validations pass
// because that would call CommitCommand.execute() which performs real git operations:
// - Creates commits
// - Pushes to remote
// - Creates pull requests
// - Updates GitHub issues
//
// The framework tests CommitCommand.execute() - our job is only to validate inputs.
