import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import taskNextSkill from '../skills/task-next.js';

/**
 * Tests for agentic15:task-next skill
 *
 * Focus: Validation logic only
 * We test error handling and validation paths, not the actual
 * TaskCommand integration (that's the framework's responsibility)
 */
describe('agentic15:task-next skill - Validation', () => {
  const testDir = join(process.cwd(), 'test-task-next-skill');
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

    const result = await taskNextSkill();

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'Not an Agentic15 project');
  });

  it('should fail when no active plan exists', async () => {
    // No ACTIVE-PLAN file
    const result = await taskNextSkill();

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'No active plan');
  });

  it('should fail when ACTIVE-PLAN is empty', async () => {
    writeFileSync(activePlanPath, '');

    const result = await taskNextSkill();

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'No active plan');
  });

  it('should fail when task tracker not found', async () => {
    const planId = 'plan-001-test';
    writeFileSync(activePlanPath, planId);
    // No TASK-TRACKER.json file

    const result = await taskNextSkill();

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'Task tracker not found');
  });

  it('should fail when no pending tasks exist', async () => {
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
        },
        {
          id: 'TASK-002',
          title: 'Test Task 2',
          status: 'completed'
        }
      ]
    };

    writeFileSync(join(planPath, 'TASK-TRACKER.json'), JSON.stringify(tracker, null, 2));
    writeFileSync(activePlanPath, planId);

    const result = await taskNextSkill();

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'No pending tasks');
  });

  it('should fail when a task is already in progress', async () => {
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

    const result = await taskNextSkill();

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'Task already in progress');
    assert.ok(result.error.details.includes('TASK-001'));
  });

  it('should fail when task tracker is invalid JSON', async () => {
    const planId = 'plan-001-test';
    const planPath = join(plansDir, planId);
    mkdirSync(planPath, { recursive: true });

    writeFileSync(join(planPath, 'TASK-TRACKER.json'), 'invalid json{');
    writeFileSync(activePlanPath, planId);

    try {
      await taskNextSkill();
      assert.fail('Should have thrown an error');
    } catch (error) {
      // Expected to throw due to invalid JSON
      assert.ok(error);
    }
  });
});

// Note: We intentionally do NOT test the actual TaskCommand.startNext() call
// That involves real git operations and is tested by the framework.
// Our job is to validate inputs before calling the framework method.
