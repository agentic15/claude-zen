import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import statusSkill from '../skills/status.js';

/**
 * Tests for agentic15:status skill
 *
 * Focus: Validation logic only
 * We test error handling and validation paths that throw BEFORE
 * calling TaskCommand.showStatus(). Unlike other commands, showStatus
 * is read-only so it's safer, but we still only test validation errors.
 */
describe('agentic15:status skill - Validation', () => {
  const testDir = join(process.cwd(), 'test-status-skill');
  const claudeDir = join(testDir, '.claude');
  const plansDir = join(claudeDir, 'plans');
  const activePlanPath = join(claudeDir, 'ACTIVE-PLAN');
  let originalCwd;

  before(() => {
    originalCwd = process.cwd();
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

    const result = await statusSkill();

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'Not an Agentic15 project');
  });

  it('should fail when no active plan exists', async () => {
    const result = await statusSkill();

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'No active plan');
    assert.ok(result.error.suggestion.includes('Create a plan first'));
  });

  it('should fail when ACTIVE-PLAN is empty', async () => {
    writeFileSync(activePlanPath, '');

    const result = await statusSkill();

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'No active plan');
  });

  it('should fail when task tracker not found', async () => {
    const planId = 'plan-001-test';
    writeFileSync(activePlanPath, planId);

    const result = await statusSkill();

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'Task tracker not found');
    assert.ok(result.error.suggestion.includes('Lock the plan first'));
  });

  it('should fail when ACTIVE-PLAN contains whitespace only', async () => {
    writeFileSync(activePlanPath, '   \n  \t  ');

    const result = await statusSkill();

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'No active plan');
  });
});

// NOTE: We do NOT test the success path where validations pass and
// TaskCommand.showStatus() is called because:
// 1. It would display status output during test runs (confusing)
// 2. It requires loadTracker() which calls process.exit() on errors
// 3. The framework tests TaskCommand.showStatus() - we only validate inputs
//
// TaskCommand.showStatus() is read-only (doesn't modify git/files) so it's
// safer than other commands, but we still avoid calling it in tests.
