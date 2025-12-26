import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import readline from 'readline';

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
      // No description provided - enter interactive mode
      console.log('\n📝 Interactive Requirements Mode');
      console.log('━'.repeat(70));
      console.log('Enter your project requirements below.');
      console.log('You can paste multiple lines, URLs, or write detailed specs.');
      console.log('Press Ctrl+D (Mac/Linux) or Ctrl+Z then Enter (Windows) when done.\n');

      description = await this.promptMultilineInput();

      if (!description || description.trim().length === 0) {
        console.log('\n❌ No requirements provided\n');
        process.exit(1);
      }
    }

    return this.generatePlan(description);
  }

  static async promptMultilineInput() {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      let lines = [];

      rl.on('line', (line) => {
        lines.push(line);
      });

      rl.on('close', () => {
        resolve(lines.join('\n'));
      });
    });
  }

  static generatePlan(description) {
    console.log('\n📋 Generating new plan...\n');

    try {
      // Create plan ID
      const planId = this.getNextPlanId();
      const planPath = join(process.cwd(), '.claude', 'plans', planId);

      // Create plan directory
      mkdirSync(planPath, { recursive: true });

      // Create PROJECT-REQUIREMENTS.txt
      const requirementsPath = join(planPath, 'PROJECT-REQUIREMENTS.txt');
      const requirementsContent = `PROJECT REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${description}

Generated: ${new Date().toISOString()}
PLAN ID: ${planId}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSTRUCTIONS FOR CLAUDE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please analyze the requirements above and create a comprehensive project plan.

1. Read the PLAN-SCHEMA.json to understand the plan structure
2. Read the PROJECT-PLAN-TEMPLATE.json for the format
3. Create a PROJECT-PLAN.json file in this directory with:
   - Clear project/subproject/milestone hierarchy
   - Detailed tasks with IDs (TASK-001, TASK-002, etc.)
   - Proper dependencies between tasks
   - Realistic time estimates
   - Phases: design, implementation, testing, deployment
   - Completion criteria for each task

4. Structure the plan to follow these phases:
   - DESIGN: Architecture, UI/UX, database schema
   - IMPLEMENTATION: Core features, API, frontend
   - TESTING: Unit tests, integration tests, E2E tests
   - DEPLOYMENT: Build, CI/CD, documentation

5. Ensure tasks are:
   - Granular (2-8 hours each)
   - Clearly defined with specific deliverables
   - Properly sequenced with dependencies
   - Grouped logically by feature/component

6. After creating the plan, tell the user to run:
   npx agentic15 plan

This will lock the plan and generate the task tracker.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GENERATED: ${new Date().toISOString()}
`;

      writeFileSync(requirementsPath, requirementsContent);

      // Set as active plan
      const claudeDir = join(process.cwd(), '.claude');
      if (!existsSync(claudeDir)) {
        mkdirSync(claudeDir, { recursive: true });
      }
      const activePlanPath = join(claudeDir, 'ACTIVE-PLAN');
      writeFileSync(activePlanPath, planId);

      console.log(`✅ Plan requirements created: ${planId}`);
      console.log(`   Location: .claude/plans/${planId}/PROJECT-REQUIREMENTS.txt\n`);
      console.log('💡 Next steps:');
      console.log(`   1. Tell Claude: "Create the project plan"`);
      console.log(`   2. When Claude is done, run: npx agentic15 plan\n`);
    } catch (error) {
      console.log(`\n❌ Failed to generate plan: ${error.message}\n`);
      process.exit(1);
    }
  }

  static lockPlan(planId) {
    console.log(`📋 Locking plan: ${planId}\n`);

    try {
      const planPath = join(process.cwd(), '.claude', 'plans', planId);
      const projectPlanPath = join(planPath, 'PROJECT-PLAN.json');

      // Verify PROJECT-PLAN.json exists
      if (!existsSync(projectPlanPath)) {
        console.log('\n❌ PROJECT-PLAN.json not found');
        console.log('   Tell Claude to create the plan first\n');
        process.exit(1);
      }

      // Read the plan
      const plan = JSON.parse(readFileSync(projectPlanPath, 'utf-8'));

      // Extract tasks from plan
      const tasks = [];
      this.extractTasks(plan, tasks);

      // Create task files
      const tasksDir = join(planPath, 'tasks');
      if (!existsSync(tasksDir)) {
        mkdirSync(tasksDir, { recursive: true });
      }

      // Write individual task files
      tasks.forEach(task => {
        const taskPath = join(tasksDir, `${task.id}.json`);
        writeFileSync(taskPath, JSON.stringify(task, null, 2));
      });

      // Create task tracker
      const tracker = {
        planId,
        lockedAt: new Date().toISOString(),
        taskFiles: tasks.map(task => ({
          id: task.id,
          title: task.title,
          phase: task.phase || 'implementation',
          status: 'pending',
          description: task.description
        }))
      };

      const trackerPath = join(planPath, 'TASK-TRACKER.json');
      writeFileSync(trackerPath, JSON.stringify(tracker, null, 2));

      // Mark as locked
      const lockedPath = join(planPath, '.plan-locked');
      writeFileSync(lockedPath, new Date().toISOString());

      console.log('✅ Plan locked successfully\n');
      this.showPlanStatus(planId);
      console.log('💡 Next step: npx agentic15 task next\n');
    } catch (error) {
      console.log(`\n❌ Failed to lock plan: ${error.message}\n`);
      process.exit(1);
    }
  }

  static extractTasks(obj, tasks) {
    // Recursively extract all tasks from the plan structure
    if (obj.tasks && Array.isArray(obj.tasks)) {
      tasks.push(...obj.tasks);
    }

    // Check nested structures
    if (obj.milestones && Array.isArray(obj.milestones)) {
      obj.milestones.forEach(milestone => this.extractTasks(milestone, tasks));
    }

    if (obj.subprojects && Array.isArray(obj.subprojects)) {
      obj.subprojects.forEach(subproject => this.extractTasks(subproject, tasks));
    }

    if (obj.projects && Array.isArray(obj.projects)) {
      obj.projects.forEach(project => this.extractTasks(project, tasks));
    }

    // Handle singular 'project' at root level (v2.0 schema)
    if (obj.project && typeof obj.project === 'object') {
      this.extractTasks(obj.project, tasks);
    }
  }

  static getNextPlanId() {
    const plansDir = join(process.cwd(), '.claude', 'plans');

    if (!existsSync(plansDir)) {
      mkdirSync(plansDir, { recursive: true });
    }

    const existingPlans = readdirSync(plansDir)
      .filter(name => name.match(/^plan-\d{3}-/i))
      .map(name => parseInt(name.match(/^plan-(\d{3})-/i)[1]))
      .filter(num => !isNaN(num));

    const nextNum = existingPlans.length > 0 ? Math.max(...existingPlans) + 1 : 1;

    return `plan-${String(nextNum).padStart(3, '0')}-generated`;
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
