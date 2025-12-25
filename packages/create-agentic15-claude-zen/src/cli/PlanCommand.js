import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';

export class PlanCommand {
  static async handle(description) {
    // Check if plan already exists
    const activePlanPath = join(process.cwd(), '.claude', 'ACTIVE-PLAN');

    if (existsSync(activePlanPath)) {
      const planId = readFileSync(activePlanPath, 'utf-8').trim();
      const planPath = join(process.cwd(), '.claude', 'plans', planId);
      const projectPlanPath = join(planPath, 'PROJECT-PLAN.json');

      // Check if plan file exists
      if (existsSync(projectPlanPath)) {
        // Plan exists, check if it's locked
        const lockedPath = join(planPath, '.plan-locked');

        if (existsSync(lockedPath)) {
          console.log('\n⚠️  Plan already locked');
          console.log(`   Plan: ${planId}\n`);
          this.showPlanStatus(planId);
          process.exit(0);
        }

        // Plan exists but not locked - lock it
        console.log('\n📋 Found existing plan, locking it...\n');
        return this.lockPlan(planId);
      } else {
        // Requirements exist but plan not created yet
        console.log('\n⚠️  Waiting for PROJECT-PLAN.json');
        console.log(`   Tell Claude: "Create the project plan"\n`);
        process.exit(0);
      }
    }

    // No plan exists - create new one
    if (!description) {
      console.log('\n❌ Project description required');
      console.log('   Usage: agentic15 plan "Build a calculator app"\n');
      process.exit(1);
    }

    return this.generatePlan(description);
  }

  static generatePlan(description) {
    console.log('\n📋 Generating new plan...\n');

    try {
      // Run plan:generate script
      execSync(`npm run plan:generate "${description}"`, { stdio: 'inherit' });

      // Find the generated plan
      const plansDir = join(process.cwd(), '.claude', 'plans');
      const plans = readdirSync(plansDir)
        .filter(name => name.startsWith('plan-') && name.includes('-generated'));

      if (plans.length === 0) {
        console.log('\n❌ Failed to generate plan\n');
        process.exit(1);
      }

      // Use the most recent generated plan
      const planId = plans[plans.length - 1];

      // Set as active plan
      const activePlanPath = join(process.cwd(), '.claude', 'ACTIVE-PLAN');
      writeFileSync(activePlanPath, planId);

      console.log(`\n✅ Plan requirements created: ${planId}`);
      console.log(`   Location: .claude/plans/${planId}/PROJECT-REQUIREMENTS.txt\n`);
      console.log('💡 Next steps:');
      console.log(`   1. Tell Claude: "Create the project plan"`);
      console.log(`   2. When Claude is done, run: agentic15 plan\n`);
    } catch (error) {
      console.log(`\n❌ Failed to generate plan: ${error.message}\n`);
      process.exit(1);
    }
  }

  static lockPlan(planId) {
    console.log(`📋 Locking plan: ${planId}\n`);

    try {
      // Run plan:init script
      execSync('npm run plan:init', { stdio: 'inherit' });

      console.log('\n✅ Plan locked successfully\n');

      this.showPlanStatus(planId);

      console.log('💡 Next step: agentic15 task next\n');
    } catch (error) {
      console.log(`\n❌ Failed to lock plan: ${error.message}\n`);
      process.exit(1);
    }
  }

  static showPlanStatus(planId) {
    const trackerPath = join(process.cwd(), '.claude', 'plans', planId, 'TASK-TRACKER.json');

    if (!existsSync(trackerPath)) {
      return;
    }

    try {
      const tracker = JSON.parse(readFileSync(trackerPath, 'utf-8'));

      const total = tracker.taskFiles.length;
      const completed = tracker.taskFiles.filter(t => t.status === 'completed').length;
      const pending = tracker.taskFiles.filter(t => t.status === 'pending').length;

      console.log('📊 Plan Status:');
      console.log(`   Total Tasks: ${total}`);
      console.log(`   Completed:   ${completed}`);
      console.log(`   Pending:     ${pending}\n`);
    } catch (e) {
      // Ignore errors
    }
  }
}
