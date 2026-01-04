import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { SkillWrapper } from '../utils/skill-wrapper.js';

describe('SkillWrapper', () => {
  const testDir = join(process.cwd(), 'test-workspace');
  const claudeDir = join(testDir, '.claude');
  let originalCwd;

  before(() => {
    // Save original working directory
    originalCwd = process.cwd();

    // Create test workspace
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
    mkdirSync(testDir, { recursive: true });
  });

  after(() => {
    // Restore original working directory
    process.chdir(originalCwd);

    // Clean up test workspace
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('validateClaudeDirectory', () => {
    it('should return false when .claude/ does not exist', () => {
      process.chdir(testDir);
      const result = SkillWrapper.validateClaudeDirectory();
      assert.strictEqual(result, false, '.claude/ should not exist yet');
    });

    it('should return true when .claude/ exists', () => {
      process.chdir(testDir);
      mkdirSync(claudeDir, { recursive: true });
      const result = SkillWrapper.validateClaudeDirectory();
      assert.strictEqual(result, true, '.claude/ should exist');
    });
  });

  describe('formatError', () => {
    it('should format error with all components', () => {
      const result = SkillWrapper.formatError(
        'agentic15:test',
        'Test Error',
        'Error details here',
        'Try this fix'
      );

      assert.strictEqual(result.success, false);
      assert.strictEqual(result.error.skill, 'agentic15:test');
      assert.strictEqual(result.error.title, 'Test Error');
      assert.strictEqual(result.error.details, 'Error details here');
      assert.strictEqual(result.error.suggestion, 'Try this fix');
    });

    it('should format error without optional suggestion', () => {
      const result = SkillWrapper.formatError(
        'agentic15:test',
        'Test Error',
        'Error details'
      );

      assert.strictEqual(result.success, false);
      assert.strictEqual(result.error.suggestion, undefined);
    });
  });

  describe('formatSuccess', () => {
    it('should format success message with next steps', () => {
      const result = SkillWrapper.formatSuccess(
        'agentic15:test',
        'Operation completed successfully',
        'Run next command'
      );

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.message, 'Operation completed successfully');
      assert.strictEqual(result.nextSteps, 'Run next command');
    });

    it('should format success message without next steps', () => {
      const result = SkillWrapper.formatSuccess(
        'agentic15:test',
        'Operation completed'
      );

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.message, 'Operation completed');
      assert.strictEqual(result.nextSteps, undefined);
    });
  });

  describe('getCommonErrors', () => {
    it('should return plan errors', () => {
      const errors = SkillWrapper.getCommonErrors('plan');

      assert.ok(errors.noActivePlan, 'Should have noActivePlan error');
      assert.ok(errors.alreadyLocked, 'Should have alreadyLocked error');
      assert.ok(errors.noPlanFile, 'Should have noPlanFile error');
      assert.strictEqual(typeof errors.noActivePlan.title, 'string');
      assert.strictEqual(typeof errors.noActivePlan.details, 'string');
      assert.strictEqual(typeof errors.noActivePlan.suggestion, 'string');
    });

    it('should return task errors', () => {
      const errors = SkillWrapper.getCommonErrors('task');

      assert.ok(errors.noActivePlan, 'Should have noActivePlan error');
      assert.ok(errors.noPendingTasks, 'Should have noPendingTasks error');
      assert.ok(errors.taskNotFound, 'Should have taskNotFound error');
      assert.ok(errors.taskAlreadyCompleted, 'Should have taskAlreadyCompleted error');
    });

    it('should return commit errors', () => {
      const errors = SkillWrapper.getCommonErrors('commit');

      assert.ok(errors.noChanges, 'Should have noChanges error');
      assert.ok(errors.noActiveTask, 'Should have noActiveTask error');
      assert.ok(errors.branchProtected, 'Should have branchProtected error');
    });

    it('should return empty object for unknown command type', () => {
      const errors = SkillWrapper.getCommonErrors('unknown');
      assert.deepStrictEqual(errors, {});
    });
  });

  describe('wrap', () => {
    it('should execute command successfully when .claude/ exists', async () => {
      process.chdir(testDir);
      mkdirSync(claudeDir, { recursive: true });

      const mockExecute = async (arg) => {
        return { result: `Executed with ${arg}` };
      };

      const wrappedSkill = SkillWrapper.wrap({
        name: 'agentic15:test',
        description: 'Test skill',
        execute: mockExecute
      });

      const result = await wrappedSkill('test-arg');
      assert.deepStrictEqual(result, { result: 'Executed with test-arg' });
    });

    it('should fail when .claude/ does not exist', async () => {
      process.chdir(testDir);
      if (existsSync(claudeDir)) {
        rmSync(claudeDir, { recursive: true, force: true });
      }

      const mockExecute = async () => {
        return { result: 'Should not execute' };
      };

      const wrappedSkill = SkillWrapper.wrap({
        name: 'agentic15:test',
        description: 'Test skill',
        execute: mockExecute
      });

      const result = await wrappedSkill();
      assert.strictEqual(result.success, false);
      assert.strictEqual(result.error.title, 'Not an Agentic15 project');
    });

    it('should skip .claude/ validation when requiresClaude is false', async () => {
      process.chdir(testDir);
      if (existsSync(claudeDir)) {
        rmSync(claudeDir, { recursive: true, force: true });
      }

      const mockExecute = async () => {
        return { result: 'Executed without .claude/' };
      };

      const wrappedSkill = SkillWrapper.wrap({
        name: 'agentic15:test',
        description: 'Test skill',
        execute: mockExecute,
        requiresClaude: false
      });

      const result = await wrappedSkill();
      assert.deepStrictEqual(result, { result: 'Executed without .claude/' });
    });

    it('should catch and format errors from execute function', async () => {
      process.chdir(testDir);
      mkdirSync(claudeDir, { recursive: true });

      const mockExecute = async () => {
        const error = new Error('Command failed');
        error.details = 'Detailed error info';
        error.suggestion = 'Try this fix';
        throw error;
      };

      const wrappedSkill = SkillWrapper.wrap({
        name: 'agentic15:test',
        description: 'Test skill',
        execute: mockExecute
      });

      const result = await wrappedSkill();
      assert.strictEqual(result.success, false);
      assert.strictEqual(result.error.title, 'Command failed');
      assert.strictEqual(result.error.details, 'Detailed error info');
      assert.strictEqual(result.error.suggestion, 'Try this fix');
    });
  });

  describe('throwCommonError', () => {
    it('should throw error with common error metadata', () => {
      assert.throws(
        () => SkillWrapper.throwCommonError('plan', 'noActivePlan'),
        (err) => {
          assert.strictEqual(err.message, 'No active plan');
          assert.strictEqual(err.details, 'No plan is currently active');
          assert.strictEqual(err.suggestion, 'Create a plan with: /agentic15:plan "Your requirements"');
          return true;
        }
      );
    });

    it('should throw error for unknown error key', () => {
      assert.throws(
        () => SkillWrapper.throwCommonError('plan', 'unknownError'),
        /Unknown error: unknownError/
      );
    });
  });
});

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Running SkillWrapper tests...\n');
}
