import { SkillWrapper } from '../utils/skill-wrapper.js';
import { PlanCommand } from '@agentic15.com/agentic15-claude-zen/src/cli/PlanCommand.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * agentic15:plan skill
 *
 * Purpose: Manage project plans - generate new plans from requirements or lock existing plans
 *
 * Usage:
 *   /agentic15:plan "Build a task management app"  → Generate new plan
 *   /agentic15:plan                                → Lock existing plan
 *
 * Workflow:
 *   1. Generate: Create PROJECT-REQUIREMENTS.txt from user description
 *   2. Claude creates PROJECT-PLAN.json based on requirements
 *   3. Lock: Validate plan and create TASK-TRACKER.json
 */

async function executePlan(requirements) {
  // Check if there's an active plan
  const activePlanPath = join(process.cwd(), '.claude', 'ACTIVE-PLAN');

  if (existsSync(activePlanPath)) {
    const planId = readFileSync(activePlanPath, 'utf-8').trim();

    // If planId exists and not empty
    if (planId) {
      const planPath = join(process.cwd(), '.claude', 'plans', planId);
      const projectPlanPath = join(planPath, 'PROJECT-PLAN.json');
      const lockedPath = join(planPath, '.plan-locked');

      // Check if plan is already locked
      if (existsSync(lockedPath)) {
        // Plan already locked - show error
        SkillWrapper.throwCommonError('plan', 'alreadyLocked');
      }

      // Check if PROJECT-PLAN.json exists
      if (!existsSync(projectPlanPath)) {
        // Requirements exist but plan not created yet
        SkillWrapper.throwCommonError('plan', 'noPlanFile');
      }

      // If user provided requirements, they're trying to create a new plan
      // but there's already an active plan - show error
      if (requirements) {
        const error = new Error('Active plan exists');
        error.details = `Plan ${planId} is already active. Lock it first or archive it to create a new plan.`;
        error.suggestion = 'Lock the current plan with: /agentic15:plan (no arguments)';
        throw error;
      }

      // Plan exists but not locked - lock it
      console.log(`\n🔒 Locking existing plan: ${planId}\n`);
      await PlanCommand.lockPlan(planId);

      return SkillWrapper.formatSuccess(
        'agentic15:plan',
        `Plan ${planId} locked successfully`,
        'Start working on tasks: /agentic15:task-next'
      );
    }
  }

  // No active plan - create new one
  if (!requirements || requirements.trim().length === 0) {
    const error = new Error('No requirements provided');
    error.details = 'You must provide project requirements to generate a new plan';
    error.suggestion = 'Provide requirements: /agentic15:plan "Your project requirements"';
    throw error;
  }

  // Generate new plan
  console.log(`\n📋 Generating new plan from requirements...\n`);
  await PlanCommand.generatePlan(requirements);

  return SkillWrapper.formatSuccess(
    'agentic15:plan',
    'Plan requirements created successfully',
    'Tell Claude: "Create the project plan", then run /agentic15:plan to lock it'
  );
}

// Export wrapped skill
export default SkillWrapper.wrap({
  name: 'agentic15:plan',
  description: 'Create and lock project plans for Agentic15 workflow',
  execute: executePlan,
  requiresClaude: true
});
