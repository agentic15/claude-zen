import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, renameSync } from 'fs';
import { join, basename } from 'path';
import readline from 'readline';
import { execSync } from 'child_process';

export class PlanCommand {
  static async handle(action, description) {
    // Handle help command
    if (action === 'help' || action === '--help' || action === '-h') {
      return this.showHelp();
    }

    // Handle subcommands: archive, new
    if (action === 'archive') {
      return this.archive(description); // description here is the reason
    }

    if (action === 'new') {
      return this.createNew(description); // description here is the plan description
    }

    // If action is not a command, treat it as description (backward compatibility)
    if (action && action !== 'archive' && action !== 'new') {
      description = action;
    }

    // Original logic for generate/lock
    // Check if plan already exists
    const activePlanPath = join(process.cwd(), '.claude', 'ACTIVE-PLAN');

    if (existsSync(activePlanPath)) {
      const planId = readFileSync(activePlanPath, 'utf-8').trim();

      // If planId is empty (e.g., after archive), treat as no active plan
      if (!planId) {
        // No active plan - continue to create new one below
      } else {
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

      // Create branch for plan (like task workflow)
      const mainBranch = this.getMainBranch();
      console.log(`📥 Syncing with remote ${mainBranch}...\n`);

      try {
        // Switch to main branch
        console.log(`   → Switching to ${mainBranch}`);
        execSync(`git checkout ${mainBranch}`, { stdio: 'inherit' });

        // Pull latest changes from remote
        console.log(`   → Pulling latest changes`);
        execSync(`git pull origin ${mainBranch}`, { stdio: 'inherit' });

        console.log(`\n✓ ${mainBranch} is up to date\n`);
      } catch (error) {
        console.log(`\n⚠️  Warning: Could not sync with remote ${mainBranch}`);
        console.log(`   Continuing with local ${mainBranch}...\n`);
      }

      // Create feature branch for plan
      const branchName = `plan/${planId}`;
      console.log(`🌿 Creating branch: ${branchName}\n`);

      try {
        execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });
        console.log(`✓ Created and switched to ${branchName}\n`);
      } catch (error) {
        // Branch might already exist
        try {
          execSync(`git checkout ${branchName}`, { stdio: 'inherit' });
          console.log(`✓ Switched to existing branch ${branchName}\n`);
        } catch (e) {
          console.log(`\n❌ Failed to create/checkout branch: ${branchName}\n`);
          process.exit(1);
        }
      }
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

ROLE DEFINITIONS - CRITICAL TO UNDERSTAND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 HUMAN'S ROLE (Developer/User):
   • RUN all agentic15 CLI commands (plan, task, commit, sync)
   • MANAGE git operations (merge PRs, resolve conflicts, push, pull)
   • REVIEW and approve code changes
   • MAKE decisions about project direction
   • DEPLOY applications

🤖 CLAUDE'S ROLE (AI Assistant):
   • READ files, documentation, and codebase
   • WRITE code in ./Agent/** and ./scripts/**
   • CREATE project plans and task breakdowns
   • EXPLAIN code and architecture decisions
   • SUGGEST improvements and best practices

🚫 WHAT CLAUDE MUST NOT DO:
   ❌ Run agentic15 commands (plan, task, commit, sync, status)
   ❌ Run git commands (commit, push, checkout, merge, branch)
   ❌ Make assumptions about what the human will do
   ❌ Tell the human to "run git commit" or similar git commands

✅ WORKFLOW AFTER CREATING PROJECT PLAN:
   1. Claude creates PROJECT-PLAN.json
   2. Claude tells human: "Run: npx agentic15 plan"
   3. Human runs the command to lock the plan
   4. Human runs: npx agentic15 task next
   5. Claude writes code for the task
   6. Human runs: npx agentic15 commit (this handles git operations)
   7. Human merges the PR
   8. Repeat steps 4-7 for each task

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSTRUCTIONS FOR CLAUDE - CREATE PROJECT PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please analyze the requirements above and create a LEAN, PRACTICAL project plan.

⚠️  CRITICAL: This is a LEAN framework - prioritize NECESSITY over LUXURY.

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
   - TESTING: MINIMAL necessary tests (see testing philosophy below)
   - DEPLOYMENT: Build, CI/CD, minimal documentation

5. Ensure tasks are:
   - Granular (2-8 hours each)
   - Clearly defined with specific deliverables
   - Properly sequenced with dependencies
   - Grouped logically by feature/component

6. CRITICAL: Every task MUST include UI verification checkpoint in completionCriteria:
   Add this as the LAST item in completionCriteria for ALL tasks:

   "UI Verification: If you modified UI code (.jsx, .tsx, .vue, .css, .html), run 'npx agentic15 visual-test <url>' and verify screenshots/logs show no errors"

   This enables Claude to self-check and verify UI changes autonomously.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TESTING PHILOSOPHY - READ CAREFULLY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ DO (Necessity-Level Testing):
• Write 5-10 FOCUSED tests per task (NOT 50-100)
• Test core logic and critical paths ONLY
• For UI tasks: Use VISUAL VERIFICATION (screenshots, console logs)
• For UI tasks: Write Playwright tests for USER FLOWS, not every edge case
• TDD is good, but tests should be ESSENTIAL, not exhaustive

❌ DON'T (Luxury/Over-Engineering):
• Don't test every edge case "just in case"
• Don't test every possible user input combination
• Don't test things visual verification will catch
• Don't create test utilities, helpers, or abstractions for simple tests
• Don't write tests for trivial getters/setters
• Don't aim for 100% code coverage - aim for 80% confidence

🎯 UI TESTING SPECIAL RULES:
Claude CANNOT SEE the UI - you're blind to visual bugs!

• Rely on SCREENSHOTS + CONSOLE LOGS for UI verification
• Write Playwright tests for key USER JOURNEYS only (login, checkout, etc.)
• Don't unit test every React prop, CSS value, or DOM element
• Don't test styling with code - use visual verification
• Focus: Does the FLOW work? Can users complete their task?

Example - Login Form Testing:
  ✅ GOOD (5 tests):
     - Submit with valid credentials → success
     - Submit with invalid credentials → error shown
     - Required fields validation works
     - Form accessible via keyboard
     - Error messages displayed correctly

  ❌ BAD (50+ tests):
     - Test every CSS class applied
     - Test every prop passed to button component
     - Test onChange handler called with exact args
     - Test form state after every keystroke
     - Test every edge case (123 character email, etc.)

Remember: You'll verify UI with SCREENSHOTS after task completion.
Write tests for LOGIC, use VISUAL VERIFICATION for appearance.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DOCUMENTATION PHILOSOPHY - CLAUDE-FACING, NOT HUMAN-FACING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ DO Document (For Claude's Memory):
• Architectural decisions and WHY they were made
• Infrastructure choices (which database, why this framework, etc.)
• Complex business logic that isn't obvious from code
• Gotchas and edge cases discovered during development
• Integration points and external dependencies
• Authentication/authorization strategy
• Deployment configuration and environment setup

Format: Brief markdown files in Agent/docs/ explaining DECISIONS, not tutorials

Example Good Documentation:
  Agent/docs/architecture-decisions.md
  "We chose PostgreSQL over MongoDB because we need ACID transactions
   for payment processing. The schema is normalized to 3NF."

❌ DON'T Create (Human-Facing Fluff):
• Comprehensive API documentation (code comments are enough)
• User guides or tutorials (not Claude's job)
• "Getting Started" guides (developers can read code)
• Detailed README files (keep minimal: what, why, how to run)
• Change logs (git history exists)
• Contribution guidelines
• Code of conduct documents

❌ DON'T Over-Document:
• Don't document obvious code ("this function adds two numbers")
• Don't create documentation tasks unless absolutely necessary
• Don't write documentation for documentation's sake
• If the code is self-explanatory, don't document it

Example - Login Form:
  ❌ BAD: Create "Login Form Documentation" with screenshots, API docs, usage guide
  ✅ GOOD: Add comment in code: "// Uses bcrypt with 12 rounds for password hashing"

Remember: Future Claude sessions need context about DECISIONS,
not tutorials about how to use the code.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

7. After creating the plan, tell the user to run:
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
      console.log(`   Branch: plan/${planId}`);
      console.log(`   Location: .claude/plans/${planId}/PROJECT-REQUIREMENTS.txt\n`);
      console.log('💡 Next steps:');
      console.log(`   1. Tell Claude: "Create the project plan"`);
      console.log(`   2. When Claude is done, run: npx agentic15 plan`);
      console.log(`   3. Then commit and create PR (like task workflow)\n`);
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
      const projectName = basename(process.cwd());
      const tracker = {
        planId,
        projectName,
        activeTask: null,
        lockedAt: new Date().toISOString(),
        statistics: {
          totalTasks: tasks.length,
          completed: 0,
          inProgress: 0,
          pending: tasks.length
        },
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

  static async archive(reason) {
    console.log('\n📦 Archiving current plan...\n');

    try {
      // Get current plan
      const activePlanPath = join(process.cwd(), '.claude', 'ACTIVE-PLAN');

      if (!existsSync(activePlanPath)) {
        console.log('❌ No active plan to archive\n');
        process.exit(1);
      }

      const planId = readFileSync(activePlanPath, 'utf-8').trim();
      const planPath = join(process.cwd(), '.claude', 'plans', planId);

      if (!existsSync(planPath)) {
        console.log(`❌ Plan directory not found: ${planId}\n`);
        process.exit(1);
      }

      // Create branch for archive operation
      const branchName = `admin/archive-plan-${planId}`;
      console.log(`📍 Creating branch: ${branchName}`);

      try {
        execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });
      } catch (error) {
        console.log(`\n❌ Failed to create branch: ${error.message}\n`);
        process.exit(1);
      }

      // Create archived directory
      const archivedDir = join(process.cwd(), '.claude', 'plans', 'archived');
      if (!existsSync(archivedDir)) {
        mkdirSync(archivedDir, { recursive: true});
      }

      // Move plan to archived
      const archivedPlanPath = join(archivedDir, planId);
      console.log(`   Moving plan to: .claude/plans/archived/${planId}`);

      try {
        renameSync(planPath, archivedPlanPath);
      } catch (error) {
        console.log(`\n❌ Failed to move plan: ${error.message}\n`);
        process.exit(1);
      }

      // Add archive metadata
      const metadata = {
        archivedAt: new Date().toISOString(),
        reason: reason || 'Plan completed',
        originalPath: `.claude/plans/${planId}`,
        archivedPath: `.claude/plans/archived/${planId}`
      };

      const metadataPath = join(archivedPlanPath, 'ARCHIVE-META.json');
      writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

      // Clear active plan
      writeFileSync(activePlanPath, '');

      // Commit changes
      console.log(`\n📝 Committing changes...`);

      try {
        execSync(`git add .claude/`, { stdio: 'inherit' });
        execSync(`git commit -m "Archive plan ${planId}: ${reason || 'Plan completed'}"`, { stdio: 'inherit' });
      } catch (error) {
        console.log(`\n❌ Failed to commit: ${error.message}\n`);
        process.exit(1);
      }

      // Push and create PR
      console.log(`\n🚀 Pushing branch and creating PR...`);

      try {
        execSync(`git push origin ${branchName}`, { stdio: 'inherit' });

        const platform = this.detectPlatform();
        const prTitle = `Archive plan ${planId}`;
        const prBody = `Archiving completed plan: ${reason || 'Plan completed'}`;

        if (platform === 'github') {
          execSync(`gh pr create --title "${prTitle}" --body "${prBody}"`, { stdio: 'inherit' });
        } else if (platform === 'azure') {
          const mainBranch = this.getMainBranch();
          execSync(`az repos pr create --source-branch ${branchName} --target-branch ${mainBranch} --title "${prTitle}" --description "${prBody}"`, { stdio: 'inherit' });
        } else {
          console.log(`\n⚠️  Unknown platform - create PR manually`);
        }
      } catch (error) {
        console.log(`\n⚠️  Branch pushed but PR creation failed: ${error.message}`);
        console.log(`   Create PR manually\n`);
      }

      console.log(`\n✅ Plan archived successfully`);
      console.log(`\n💡 Next steps:`);
      console.log(`   1. Review and merge the PR`);
      console.log(`   2. Run: npx agentic15 plan new\n`);

    } catch (error) {
      console.log(`\n❌ Failed to archive plan: ${error.message}\n`);
      process.exit(1);
    }
  }

  static async createNew(description) {
    console.log('\n📋 Creating new plan...\n');

    try {
      // Check if there's an active plan
      const activePlanPath = join(process.cwd(), '.claude', 'ACTIVE-PLAN');

      if (existsSync(activePlanPath)) {
        const currentPlan = readFileSync(activePlanPath, 'utf-8').trim();
        if (currentPlan) {
          console.log(`⚠️  Active plan exists: ${currentPlan}`);
          console.log(`   Archive it first: npx agentic15 plan archive\n`);
          process.exit(1);
        }
      }

      // Create branch for new plan
      const newPlanId = this.getNextPlanId();
      const branchName = `admin/new-plan-${newPlanId}`;

      console.log(`📍 Creating branch: ${branchName}`);

      try {
        execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });
      } catch (error) {
        console.log(`\n❌ Failed to create branch: ${error.message}\n`);
        process.exit(1);
      }

      // Use existing generatePlan logic
      this.generatePlan(description);

      // Commit changes
      console.log(`\n📝 Committing new plan...`);

      try {
        execSync(`git add .claude/`, { stdio: 'inherit' });
        execSync(`git commit -m "Create new plan: ${newPlanId}"`, { stdio: 'inherit' });
      } catch (error) {
        console.log(`\n❌ Failed to commit: ${error.message}\n`);
        process.exit(1);
      }

      // Push and create PR
      console.log(`\n🚀 Pushing branch and creating PR...`);

      try {
        execSync(`git push origin ${branchName}`, { stdio: 'inherit' });

        const platform = this.detectPlatform();
        const prTitle = `Create new plan ${newPlanId}`;
        const prBody = description ? `Create new plan: ${description}` : `Create new plan: ${newPlanId}`;

        if (platform === 'github') {
          execSync(`gh pr create --title "${prTitle}" --body "${prBody}"`, { stdio: 'inherit' });
        } else if (platform === 'azure') {
          const mainBranch = this.getMainBranch();
          execSync(`az repos pr create --source-branch ${branchName} --target-branch ${mainBranch} --title "${prTitle}" --description "${prBody}"`, { stdio: 'inherit' });
        } else {
          console.log(`\n⚠️  Unknown platform - create PR manually`);
        }
      } catch (error) {
        console.log(`\n⚠️  Branch pushed but PR creation failed: ${error.message}`);
        console.log(`   Create PR manually\n`);
      }

      console.log(`\n✅ New plan created successfully`);
      console.log(`\n💡 Next steps:`);
      console.log(`   1. Review and merge the PR`);
      console.log(`   2. Tell Claude: "Create the project plan"`);
      console.log(`   3. Run: npx agentic15 plan`);
      console.log(`   4. Run: npx agentic15 task next\n`);

    } catch (error) {
      console.log(`\n❌ Failed to create new plan: ${error.message}\n`);
      process.exit(1);
    }
  }

  static detectPlatform() {
    try {
      const remote = execSync('git remote get-url origin', { encoding: 'utf-8' }).trim();

      if (remote.includes('github.com')) {
        return 'github';
      } else if (remote.includes('dev.azure.com')) {
        return 'azure';
      }

      return 'unknown';
    } catch (e) {
      return 'unknown';
    }
  }

  static getMainBranch() {
    try {
      // Try to detect main branch from remote
      const remotes = execSync('git branch -r', { encoding: 'utf-8' });

      if (remotes.includes('origin/main')) {
        return 'main';
      } else if (remotes.includes('origin/master')) {
        return 'master';
      }

      // Default to main
      return 'main';
    } catch (error) {
      return 'main';
    }
  }

  static showHelp() {
    console.log('\n📋 Plan Management - Help\n');
    console.log('═'.repeat(70));
    console.log('\nUSAGE:');
    console.log('  npx agentic15 plan [command] [options]\n');

    console.log('COMMANDS:\n');

    console.log('  npx agentic15 plan "description"');
    console.log('    Generate a new project plan from requirements');
    console.log('    Example: npx agentic15 plan "Build a task management app"\n');

    console.log('  npx agentic15 plan');
    console.log('    Interactive mode - enter requirements via multi-line input');
    console.log('    OR lock an existing plan (if PROJECT-PLAN.json exists)\n');

    console.log('  npx agentic15 plan archive [reason]');
    console.log('    Archive the current plan and prepare for a new one');
    console.log('    Creates a branch, moves plan to archived/, commits & creates PR');
    console.log('    Example: npx agentic15 plan archive "Project completed"\n');

    console.log('  npx agentic15 plan new [description]');
    console.log('    Start a new plan (must archive current plan first)');
    console.log('    Creates a branch, generates plan, commits & creates PR');
    console.log('    Example: npx agentic15 plan new "E-commerce website"\n');

    console.log('  npx agentic15 plan help');
    console.log('    Show this help message\n');

    console.log('═'.repeat(70));
    console.log('\nWORKFLOW:\n');

    console.log('  1️⃣  GENERATE PLAN:');
    console.log('     npx agentic15 plan "Your project requirements"');
    console.log('     → Creates .claude/plans/plan-XXX-generated/PROJECT-REQUIREMENTS.txt\n');

    console.log('  2️⃣  CREATE PLAN (via Claude):');
    console.log('     Tell Claude: "Create the project plan"');
    console.log('     → Claude creates PROJECT-PLAN.json following the template\n');

    console.log('  3️⃣  LOCK PLAN:');
    console.log('     npx agentic15 plan');
    console.log('     → Validates plan, creates task tracker, locks plan\n');

    console.log('  4️⃣  START WORKING:');
    console.log('     npx agentic15 task next');
    console.log('     → Starts first task, creates branch, creates GitHub issue\n');

    console.log('  5️⃣  COMPLETE PROJECT:');
    console.log('     When all tasks done, archive the plan:');
    console.log('     npx agentic15 plan archive "Project completed"\n');

    console.log('  6️⃣  START NEW PROJECT:');
    console.log('     After archiving, start fresh:');
    console.log('     npx agentic15 plan new "Next project requirements"\n');

    console.log('═'.repeat(70));
    console.log('\nEXAMPLES:\n');

    console.log('  # Generate a new plan');
    console.log('  npx agentic15 plan "Build a REST API for user management"\n');

    console.log('  # Archive completed plan');
    console.log('  npx agentic15 plan archive "MVP completed and deployed"\n');

    console.log('  # Start a new plan after archiving');
    console.log('  npx agentic15 plan new "Add payment integration"\n');

    console.log('  # Lock an existing plan (after Claude creates PROJECT-PLAN.json)');
    console.log('  npx agentic15 plan\n');

    console.log('═'.repeat(70));
    console.log('\nNOTES:\n');

    console.log('  • Only one active plan allowed at a time');
    console.log('  • Archive current plan before creating a new one');
    console.log('  • Archive and new commands create PRs automatically');
    console.log('  • Plan files are stored in .claude/plans/\n');

    console.log('═'.repeat(70) + '\n');
  }
}
