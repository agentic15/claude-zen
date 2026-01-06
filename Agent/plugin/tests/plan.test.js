import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import planSkill from '../skills/plan.js';

/**
 * Tests for agentic15:plan skill
 *
 * Focus: Validation logic only
 * We test error handling and validation paths, not the actual
 * PlanCommand integration (that's the framework's responsibility)
 */
describe('agentic15:plan skill - Validation', () => {
  const testDir = join(process.cwd(), 'test-plan-skill');
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

    const result = await planSkill('Build an app');

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'Not an Agentic15 project');
  });

  it('should fail when no requirements provided and no active plan', async () => {
    const result = await planSkill();

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'No requirements provided');
    assert.ok(result.error.suggestion.includes('Provide requirements'));
  });

  it('should fail when plan already locked', async () => {
    const planId = 'plan-001-test';
    const planPath = join(plansDir, planId);
    mkdirSync(planPath, { recursive: true });

    const projectPlan = {
      version: '2.0',
      project: {
        id: 'PROJ-001',
        name: 'Test Project',
        subprojects: [{
          milestones: [{
            tasks: [{
              id: 'TASK-001',
              title: 'Test Task',
              status: 'pending',
              phase: 'implementation'
            }]
          }]
        }]
      }
    };
    writeFileSync(join(planPath, 'PROJECT-PLAN.json'), JSON.stringify(projectPlan, null, 2));
    writeFileSync(join(planPath, '.plan-locked'), new Date().toISOString());
    writeFileSync(activePlanPath, planId);

    const result = await planSkill();

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'Plan already locked');
  });

  it('should fail when PROJECT-PLAN.json does not exist', async () => {
    const planId = 'plan-001-test';
    const planPath = join(plansDir, planId);
    mkdirSync(planPath, { recursive: true });
    writeFileSync(activePlanPath, planId);

    const result = await planSkill();

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'PROJECT-PLAN.json not found');
  });

  it('should fail when trying to create new plan with existing active plan', async () => {
    const planId = 'plan-001-test';
    const planPath = join(plansDir, planId);
    mkdirSync(planPath, { recursive: true });

    const projectPlan = {
      version: '2.0',
      project: {
        id: 'PROJ-001',
        name: 'Test Project',
        subprojects: [{
          milestones: [{
            tasks: [{
              id: 'TASK-001',
              title: 'Test Task',
              status: 'pending',
              phase: 'implementation'
            }]
          }]
        }]
      }
    };
    writeFileSync(join(planPath, 'PROJECT-PLAN.json'), JSON.stringify(projectPlan, null, 2));
    writeFileSync(activePlanPath, planId);

    const result = await planSkill('Build a new app');

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'Active plan exists');
    assert.ok(result.error.details.includes('already active'));
  });

  it('should fail on empty requirements string', async () => {
    const result = await planSkill('   ');

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'No requirements provided');
  });

  it('should fail on empty ACTIVE-PLAN file', async () => {
    writeFileSync(activePlanPath, '');

    const result = await planSkill();

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'No requirements provided');
  });
});

// Note: We intentionally do NOT test generatePlan() and lockPlan() integration
// Those are tested by the framework. Our job is to validate inputs and call
// the right methods - which we've verified through the validation tests above.
