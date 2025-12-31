import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { GitHubClient } from '../core/GitHubClient.js';
import { GitHubConfig } from '../core/GitHubConfig.js';
import { AzureDevOpsClient } from '../core/AzureDevOpsClient.js';
import { AzureDevOpsConfig } from '../core/AzureDevOpsConfig.js';
import { TaskIssueMapper } from '../core/TaskIssueMapper.js';

export class TaskCommand {
  static async handle(action, taskId, options = {}) {
    switch (action) {
      case 'start':
        return this.startTask(taskId);
      case 'next':
        return this.startNext();
      case 'status':
        return this.showStatus();
      case 'reset':
        return this.resetTask(taskId, options.force);
      default:
        console.log(`\n❌ Unknown action: ${action}`);
        console.log('   Valid actions: start, next, status, reset\n');
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

    // Get main branch name
    const mainBranch = this.getMainBranch();
    console.log(`\n📥 Syncing with remote ${mainBranch}...\n`);

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

    // Create feature branch from updated main
    const branchName = `feature/${taskId.toLowerCase()}`;
    console.log(`🌿 Creating branch: ${branchName}\n`);

    try {
      execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });
      console.log(`\n✓ Created and switched to ${branchName}\n`);
    } catch (error) {
      // Branch might already exist
      try {
        execSync(`git checkout ${branchName}`, { stdio: 'inherit' });
        console.log(`\n✓ Switched to existing branch ${branchName}\n`);
      } catch (e) {
        console.log(`\n❌ Failed to create/checkout branch: ${branchName}\n`);
        process.exit(1);
      }
    }

    // Update task status
    task.status = 'in_progress';
    task.startedAt = new Date().toISOString();

    // Update tracker metadata
    tracker.activeTask = task.id;
    this.updateStatistics(tracker);
    this.saveTracker(tracker);

    // Create GitHub issue if enabled
    let githubIssue = null;
    const githubConfig = new GitHubConfig(process.cwd());
    if (githubConfig.isAutoCreateEnabled()) {
      githubIssue = await this.createGitHubIssue(task, githubConfig);
    }

    // Create Azure DevOps work item if enabled
    let azureWorkItem = null;
    const azureConfig = new AzureDevOpsConfig(process.cwd());

    // Always attempt Azure work item creation - let the method decide
    if (azureConfig.config.enabled) {
      azureWorkItem = await this.createAzureWorkItem(task, azureConfig);
    }

    // Display task details
    this.displayTaskDetails(task, githubIssue, azureWorkItem, tracker);
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

  static async resetTask(taskId, force = false) {
    const tracker = this.loadTracker();

    // Find task to reset
    let task;
    if (taskId) {
      task = tracker.taskFiles.find(t => t.id === taskId);
      if (!task) {
        console.log(`\n❌ Task not found: ${taskId}\n`);
        process.exit(1);
      }
    } else {
      // Reset current active task
      task = tracker.taskFiles.find(t => t.status === 'in_progress');
      if (!task) {
        console.log('\n❌ No task is currently in progress\n');
        console.log('   Specify a task ID: agentic15 task reset TASK-001\n');
        console.log('   To reset a completed task: agentic15 task reset TASK-001 --force\n');
        process.exit(1);
      }
    }

    if (task.status !== 'in_progress' && !force) {
      console.log(`\n⚠️  Task ${task.id} is not in progress (status: ${task.status})\n`);
      console.log('   To reset this task anyway, use --force:\n');
      console.log(`   agentic15 task reset ${task.id} --force\n`);
      process.exit(1);
    }

    if (force && task.status !== 'in_progress') {
      console.log(`\n⚠️  Forcing reset of ${task.status} task: ${task.id}\n`);
    }

    console.log(`\n🔄 Resetting task: ${task.id}`);
    console.log(`📌 ${task.title}\n`);

    // Reset task status
    task.status = 'pending';
    delete task.startedAt;
    delete task.completedAt;

    // Clear active task
    tracker.activeTask = null;

    // Update statistics
    this.updateStatistics(tracker);

    // Save tracker
    this.saveTracker(tracker);

    console.log('✓ Task status reset to pending\n');

    // Get current branch
    let currentBranch;
    try {
      currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
    } catch (e) {
      currentBranch = null;
    }

    const featureBranch = `feature/${task.id.toLowerCase()}`;

    // Check if branch was pushed to remote
    let remoteBranchExists = false;
    try {
      const remoteBranches = execSync('git branch -r', { encoding: 'utf-8' });
      remoteBranchExists = remoteBranches.includes(`origin/${featureBranch}`);
    } catch (e) {
      // Ignore
    }

    console.log('═'.repeat(70));
    console.log('🧹 CLEANUP INSTRUCTIONS');
    console.log('═'.repeat(70) + '\n');

    console.log('📋 Step 1: Clean up git branches\n');

    // If on feature branch, offer to clean up
    if (currentBranch === featureBranch) {
      console.log(`   Current branch: ${featureBranch}`);
      console.log(`   1. Switch to main: git checkout main`);
      console.log(`      (If you have uncommitted changes: git checkout -f main)`);
      console.log(`   2. Delete local branch: git branch -D ${featureBranch}`);
      if (remoteBranchExists) {
        console.log(`   3. Delete remote branch: git push origin --delete ${featureBranch}`);
      }
    } else {
      // Check if feature branch exists locally
      try {
        const branches = execSync('git branch', { encoding: 'utf-8' });
        if (branches.includes(featureBranch)) {
          console.log(`   Delete local branch: git branch -D ${featureBranch}`);
        }
      } catch (e) {
        // Ignore
      }

      if (remoteBranchExists) {
        console.log(`   Delete remote branch: git push origin --delete ${featureBranch}`);
      }
    }

    console.log('\n📋 Step 2: Clean up any unwanted files\n');
    console.log('   Preview files to be deleted:');
    console.log('   git clean -fd --dry-run');
    console.log('');
    console.log('   If files look correct to delete:');
    console.log('   git clean -fd');
    console.log('');
    console.log('   Or reset to clean main state:');
    console.log('   git checkout main');
    console.log('   git reset --hard origin/main');
    console.log('   git clean -fd');

    console.log('\n📋 Step 3: Verify clean state\n');
    console.log('   git status');
    console.log('   # Should show "nothing to commit, working tree clean"');

    console.log('\n' + '═'.repeat(70));
    console.log('✅ Task reset complete!');
    console.log('═'.repeat(70) + '\n');

    console.log('Next steps:');
    console.log('   1. Follow cleanup instructions above');
    console.log('   2. Run: agentic15 task next\n');
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

  static async createAzureWorkItem(task, config) {
    try {
      console.log('\n🔍 Azure DevOps Configuration Check:');
      console.log(`   enabled: ${config.config.enabled}`);
      console.log(`   autoCreate: ${config.config.autoCreate}`);
      console.log(`   organization: ${config.config.organization || 'NOT SET'}`);
      console.log(`   project: ${config.config.project || 'NOT SET'}`);
      console.log(`   token: ${config.config.token ? '✓ SET' : '❌ NOT SET (AZURE_DEVOPS_PAT env var)'}`);

      const client = new AzureDevOpsClient(config);

      if (!config.config.autoCreate) {
        console.log('\n⚠️  Azure DevOps autoCreate is disabled. Skipping work item creation.');
        console.log('   Set "autoCreate": true in .claude/settings.local.json\n');
        return null;
      }

      if (!client.isConfigured()) {
        console.log('\n⚠️  Azure DevOps not fully configured. Missing required settings.');
        console.log('   Required: token, organization, project');
        console.log('   See: Agent/docs/AZURE-SETUP.md\n');
        return null;
      }

      console.log('\n✓ Azure DevOps configured. Creating work item...\n');

      // Load full task details
      const taskPath = this.getTaskPath(task.id);
      const taskData = JSON.parse(readFileSync(taskPath, 'utf-8'));

      const title = TaskIssueMapper.taskToIssueTitle(taskData);
      const body = TaskIssueMapper.taskToIssueBody(taskData);
      const tags = TaskIssueMapper.taskStatusToLabels(taskData.status || 'pending', taskData.phase);

      const workItem = await client.createWorkItem(title, body, tags);

      if (workItem) {
        // Save work item ID to task
        taskData.azureWorkItem = workItem.id;
        writeFileSync(taskPath, JSON.stringify(taskData, null, 2));

        console.log(`✓ Created Azure DevOps work item #${workItem.id}`);
        console.log(`  ${workItem.url}\n`);

        return workItem;
      }
    } catch (error) {
      console.log(`\n⚠️  Failed to create Azure DevOps work item: ${error.message}\n`);
    }

    return null;
  }

  static displayTaskDetails(task, githubIssue, azureWorkItem, tracker) {
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

    if (azureWorkItem) {
      console.log(`🔗 Azure Work Item: ${azureWorkItem.url}`);
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

  static updateStatistics(tracker) {
    const completed = tracker.taskFiles.filter(t => t.status === 'completed').length;
    const inProgress = tracker.taskFiles.filter(t => t.status === 'in_progress').length;
    const pending = tracker.taskFiles.filter(t => t.status === 'pending').length;
    const totalTasks = tracker.taskFiles.length;

    tracker.statistics = {
      totalTasks,
      completed,
      inProgress,
      pending
    };
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

      // Detect platform
      const isGitHub = remote.includes('github.com');
      const isAzureDevOps = remote.includes('dev.azure.com');

      if (!isGitHub && !isAzureDevOps) {
        console.log('\n⚠️  Warning: Remote is not a supported platform');
        console.log(`   Remote URL: ${remote}`);
        console.log('   Supported platforms: GitHub, Azure DevOps\n');
      }
    } catch (error) {
      console.log('\n❌ Git remote "origin" is not configured');
      console.log('\n   Before starting tasks, you must link your project to a repository:');
      console.log('\n   GitHub:');
      console.log('      1. Create: gh repo create OWNER/REPO --public');
      console.log('      2. Link: git remote add origin https://github.com/OWNER/REPO.git');
      console.log('\n   Azure DevOps:');
      console.log('      1. Create repo in Azure DevOps');
      console.log('      2. Link: git remote add origin https://dev.azure.com/ORG/PROJECT/_git/REPO');
      console.log('\n   Then:');
      console.log('      git branch -M main');
      console.log('      git add .');
      console.log('      git commit -m "Initial commit"');
      console.log('      git push -u origin main');
      console.log('      npx agentic15 task next\n');
      process.exit(1);
    }
  }

  static getMainBranch() {
    try {
      // Try to detect main branch
      const branches = execSync('git branch -r', { encoding: 'utf-8' });

      if (branches.includes('origin/main')) {
        return 'main';
      } else if (branches.includes('origin/master')) {
        return 'master';
      }

      return 'main'; // Default
    } catch (e) {
      return 'main';
    }
  }
}
