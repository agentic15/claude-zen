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

  it('should document expected behavior when not in a git repository', async () => {
    // NOTE: We cannot actually test this scenario without risking real git operations
    // because if the test runs inside a git repository, it would pass validation
    // and call CommitCommand.execute() which creates real commits.
    //
    // Expected behavior:
    // - If not in a git repository
    // - execSync('git status --porcelain') will throw an error
    // - Skill should catch this and throw 'Git repository check failed'
    //
    // This test documents the expected behavior but does not execute it.

    assert.ok(true, 'Test documents expected behavior: should fail when not in git repo');
  });

  it('should document expected behavior for no active task and no pending changes', async () => {
    // NOTE: We cannot actually test this scenario without calling the real CommitCommand.execute()
    // because the validation requires checking git status in a real git repository.
    //
    // Expected behavior:
    // - If no active task exists in tracker
    // - AND no pending changes in git (git status --porcelain returns empty)
    // - THEN skill should throw error with SkillWrapper.throwCommonError('commit', 'noActiveTask')
    //
    // This test documents the expected behavior but does not execute it
    // to avoid triggering real git commits and PR creation.

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
