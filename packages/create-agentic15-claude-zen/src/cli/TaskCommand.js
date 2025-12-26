import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { GitHubClient } from '../core/GitHubClient.js';
import { GitHubConfig } from '../core/GitHubConfig.js';
import { TaskIssueMapper } from '../core/TaskIssueMapper.js';

export class TaskCommand {
  static async handle(action, taskId) {
    switch (action) {
      case 'start':
        return this.startTask(taskId);
      case 'next':
        return this.startNext();
      case 'status':
        return this.showStatus();
      default:
        console.log(`\n❌ Unknown action: ${action}`);
        console.log('   Valid actions: start, next, status\n');
        process.exit(1);
    }
  }

  static async startTask(taskId) {
    if (!taskId) {
      console.log('\n❌ Task ID required for "start" action');
      console.log('   Usage: agentic15 task start TASK-001\n');
      process.exit(1);
    }

    // Verify git remote is configured
    this.validateGitRemote();

    // Load task tracker
    const tracker = this.loadTracker();
    const task = tracker.taskFiles.find(t => t.id === taskId);

    if (!task) {
      console.log(`\n❌ Task not found: ${taskId}\n`);
      process.exit(1);
    }

    if (task.status === 'completed') {
      console.log(`\n⚠️  Task ${taskId} is already completed\n`);
      process.exit(1);
    }

    // Check if another task is in progress
    const inProgress = tracker.taskFiles.find(t => t.status === 'in_progress');
    if (inProgress && inProgress.id !== taskId) {
      console.log(`\n⚠️  Task ${inProgress.id} is already in progress`);
      console.log(`   Complete it first with: agentic15 commit\n`);
      process.exit(1);
    }

    // Create feature branch
    const branchName = `feature/${taskId.toLowerCase()}`;
    try {
      execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });
    } catch (error) {
      // Branch might already exist
      try {
        execSync(`git checkout ${branchName}`, { stdio: 'inherit' });
      } catch (e) {
        console.log(`\n❌ Failed to create/checkout branch: ${branchName}\n`);
        process.exit(1);
      }
    }

    // Update task status
    task.status = 'in_progress';
    task.startedAt = new Date().toISOString();
    this.saveTracker(tracker);

    // Create GitHub issue if enabled
    let githubIssue = null;
    const config = new GitHubConfig(process.cwd());
    if (config.isAutoCreateEnabled()) {
      githubIssue = await this.createGitHubIssue(task, config);
    }

    // Display task details
    this.displayTaskDetails(task, githubIssue, tracker);
  }

  static async startNext() {
    const tracker = this.loadTracker();

    // Find next pending task
    const nextTask = tracker.taskFiles.find(t => t.status === 'pending');

    if (!nextTask) {
      console.log('\n✅ No more pending tasks!\n');
      const completed = tracker.taskFiles.filter(t => t.status === 'completed').length;
      const total = tracker.taskFiles.length;
      console.log(`   Progress: ${completed}/${total} tasks completed\n`);
      process.exit(0);
    }

    console.log(`\n▶️  Auto-starting next task: ${nextTask.id}\n`);
    return this.startTask(nextTask.id);
  }

  static showStatus() {
    const tracker = this.loadTracker();

    const inProgress = tracker.taskFiles.find(t => t.status === 'in_progress');
    const completed = tracker.taskFiles.filter(t => t.status === 'completed').length;
    const pending = tracker.taskFiles.filter(t => t.status === 'pending').length;
    const total = tracker.taskFiles.length;

    console.log('\n📊 Task Status\n');
    console.log(`   Plan: ${tracker.planId}`);
    console.log(`   Progress: ${completed}/${total} completed (${pending} pending)\n`);

    if (inProgress) {
      console.log(`   🔄 Currently working on: ${inProgress.id}`);
      console.log(`   📌 ${inProgress.title}`);

      // Show changed files
      try {
        const diff = execSync('git diff --name-only', { encoding: 'utf-8' });
        if (diff.trim()) {
          console.log(`\n   📝 Changed files:`);
          diff.trim().split('\n').forEach(file => {
            console.log(`      - ${file}`);
          });
        }
      } catch (e) {
        // Ignore
      }
    } else {
      console.log('   ℹ️  No task currently in progress');
      console.log(`   Run: agentic15 task next\n`);
    }

    console.log('');
  }

  static async createGitHubIssue(task, config) {
    try {
      const client = new GitHubClient(
        config.getToken(),
        config.getRepoInfo().owner,
        config.getRepoInfo().repo
      );

      if (!client.isConfigured()) {
        console.log('\n⚠️  GitHub not configured. Skipping issue creation.');
        console.log('   Run: agentic15 auth setup\n');
        return null;
      }

      // Load full task details
      const taskPath = this.getTaskPath(task.id);
      const taskData = JSON.parse(readFileSync(taskPath, 'utf-8'));

      const title = TaskIssueMapper.taskToIssueTitle(taskData);
      const body = TaskIssueMapper.taskToIssueBody(taskData);
      const labels = TaskIssueMapper.taskStatusToLabels(taskData.status || 'pending', taskData.phase);
      const issueNumber = await client.createIssue(title, body, labels);

      if (issueNumber) {
        // Save issue number to task
        taskData.githubIssue = issueNumber;
        writeFileSync(taskPath, JSON.stringify(taskData, null, 2));

        console.log(`\n✓ Created GitHub issue #${issueNumber}`);
        const repoInfo = config.getRepoInfo();
        console.log(`  https://github.com/${repoInfo.owner}/${repoInfo.repo}/issues/${issueNumber}\n`);

        return issueNumber;
      }
    } catch (error) {
      console.log(`\n⚠️  Failed to create GitHub issue: ${error.message}\n`);
    }

    return null;
  }

  static displayTaskDetails(task, githubIssue, tracker) {
    console.log(`\n✅ Started task: ${task.id}`);
    console.log(`📋 Plan: ${tracker.planId}\n`);
    console.log(`📌 ${task.title}`);

    if (task.description) {
      console.log(`📝 ${task.description}\n`);
    }

    if (task.phase) {
      console.log(`🔧 Phase: ${task.phase}`);
    }

    if (githubIssue) {
      const config = new GitHubConfig(process.cwd());
      const repoInfo = config.getRepoInfo();
      console.log(`🔗 GitHub Issue: https://github.com/${repoInfo.owner}/${repoInfo.repo}/issues/${githubIssue}`);
    }

    // Load full task for completion criteria
    try {
      const taskPath = this.getTaskPath(task.id);
      const taskData = JSON.parse(readFileSync(taskPath, 'utf-8'));

      if (taskData.completionCriteria && taskData.completionCriteria.length > 0) {
        console.log(`\n✓ Completion criteria:`);
        taskData.completionCriteria.forEach((criteria, idx) => {
          console.log(`  ${idx + 1}. ${criteria}`);
        });
      }
    } catch (e) {
      // Ignore
    }

    console.log(`\n💡 Next steps:`);
    console.log(`   1. Tell Claude: "Write code for ${task.id}"`);
    console.log(`   2. When done: agentic15 commit\n`);
  }

  static loadTracker() {
    const activePlanPath = join(process.cwd(), '.claude', 'ACTIVE-PLAN');

    if (!existsSync(activePlanPath)) {
      console.log('\n❌ No active plan found');
      console.log('   Run: agentic15 plan "project description"\n');
      process.exit(1);
    }

    const planId = readFileSync(activePlanPath, 'utf-8').trim();
    const trackerPath = join(process.cwd(), '.claude', 'plans', planId, 'TASK-TRACKER.json');

    if (!existsSync(trackerPath)) {
      console.log('\n❌ Task tracker not found');
      console.log('   Run: agentic15 plan\n');
      process.exit(1);
    }

    return JSON.parse(readFileSync(trackerPath, 'utf-8'));
  }

  static saveTracker(tracker) {
    const activePlanPath = join(process.cwd(), '.claude', 'ACTIVE-PLAN');
    const planId = readFileSync(activePlanPath, 'utf-8').trim();
    const trackerPath = join(process.cwd(), '.claude', 'plans', planId, 'TASK-TRACKER.json');

    writeFileSync(trackerPath, JSON.stringify(tracker, null, 2));
  }

  static getTaskPath(taskId) {
    const activePlanPath = join(process.cwd(), '.claude', 'ACTIVE-PLAN');
    const planId = readFileSync(activePlanPath, 'utf-8').trim();
    return join(process.cwd(), '.claude', 'plans', planId, 'tasks', `${taskId}.json`);
  }

  static validateGitRemote() {
    try {
      // Check if git remote origin exists
      const remote = execSync('git remote get-url origin', { encoding: 'utf-8', stdio: 'pipe' }).trim();

      if (!remote || remote.length === 0) {
        throw new Error('No remote URL');
      }

      // Validate it's a GitHub URL
      if (!remote.includes('github.com')) {
        console.log('\n⚠️  Warning: Remote is not a GitHub repository');
        console.log(`   Remote URL: ${remote}`);
        console.log('   GitHub integration features may not work.\n');
      }
    } catch (error) {
      console.log('\n❌ Git remote "origin" is not configured');
      console.log('\n   Before starting tasks, you must link your project to a GitHub repository:');
      console.log('\n   1. Create a GitHub repository:');
      console.log('      gh repo create OWNER/REPO --public (or --private)');
      console.log('\n   2. Link it to your local project:');
      console.log('      git remote add origin https://github.com/OWNER/REPO.git');
      console.log('\n   3. Push your initial code:');
      console.log('      git add .');
      console.log('      git commit -m "Initial commit"');
      console.log('      git push -u origin main');
      console.log('\n   4. Then start your task:');
      console.log('      npx agentic15 task next\n');
      process.exit(1);
    }
  }
}
