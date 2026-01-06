import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import taskStartSkill from '../skills/task-start.js';

/**
 * Tests for agentic15:task-start skill
 *
 * Focus: Validation logic ONLY
 * We test error handling and validation paths that throw BEFORE
 * calling TaskCommand.startTask(). We do NOT test successful execution
 * because that would trigger real git operations.
 */
describe('agentic15:task-start skill - Validation', () => {
  const testDir = join(process.cwd(), 'test-task-start-skill');
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

    const result = await taskStartSkill('TASK-001');

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'Not an Agentic15 project');
  });

  it('should fail when no task ID provided', async () => {
    const result = await taskStartSkill();

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'Task ID required');
  });

  it('should fail when empty task ID provided', async () => {
    const result = await taskStartSkill('   ');

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'Task ID required');
  });

  it('should fail when task ID format is invalid - lowercase', async () => {
    const result = await taskStartSkill('task-001');

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'Invalid task ID format');
  });

  it('should fail when task ID format is invalid - wrong prefix', async () => {
    const result = await taskStartSkill('TSK-001');

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'Invalid task ID format');
  });

  it('should fail when task ID format is invalid - too few digits', async () => {
    const result = await taskStartSkill('TASK-1');

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'Invalid task ID format');
  });

  it('should fail when task ID format is invalid - too many digits', async () => {
    const result = await taskStartSkill('TASK-1234');

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'Invalid task ID format');
  });

  it('should fail when no active plan exists', async () => {
    const result = await taskStartSkill('TASK-001');

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'No active plan');
  });

  it('should fail when ACTIVE-PLAN is empty', async () => {
    writeFileSync(activePlanPath, '');

    const result = await taskStartSkill('TASK-001');

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'No active plan');
  });

  it('should fail when task tracker not found', async () => {
    const planId = 'plan-001-test';
    writeFileSync(activePlanPath, planId);

    const result = await taskStartSkill('TASK-001');

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'Task tracker not found');
  });

  it('should fail when task not found in tracker', async () => {
    const planId = 'plan-001-test';
    const planPath = join(plansDir, planId);
    mkdirSync(planPath, { recursive: true });

    const tracker = {
      planId,
      projectName: 'Test Project',
      activeTask: null,
      taskFiles: [
        {
          id: 'TASK-001',
          title: 'Test Task 1',
          status: 'pending'
        }
      ]
    };

    writeFileSync(join(planPath, 'TASK-TRACKER.json'), JSON.stringify(tracker, null, 2));
    writeFileSync(activePlanPath, planId);

    const result = await taskStartSkill('TASK-999');

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'Task not found');
  });

  it('should fail when task is already completed', async () => {
    const planId = 'plan-001-test';
    const planPath = join(plansDir, planId);
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
    writeFileSync(activePlanPath, planId);

    const result = await taskStartSkill('TASK-001');

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'Task already completed');
  });

  it('should fail when another task is already in progress', async () => {
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
        },
        {
          id: 'TASK-002',
          title: 'Test Task 2',
          status: 'pending'
        }
      ]
    };

    writeFileSync(join(planPath, 'TASK-TRACKER.json'), JSON.stringify(tracker, null, 2));
    writeFileSync(activePlanPath, planId);

    const result = await taskStartSkill('TASK-002');

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'Task already in progress');
    assert.ok(result.error.details.includes('TASK-001'));
  });
});

// ⚠️ IMPORTANT: We do NOT test the success path where all validations pass
// because that would call TaskCommand.startTask() which performs real git operations.
// The framework tests TaskCommand.startTask() - our job is only to validate inputs.
