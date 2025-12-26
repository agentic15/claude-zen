import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { GitHubClient } from '../core/GitHubClient.js';
import { GitHubConfig } from '../core/GitHubConfig.js';

export class CommitCommand {
  static async execute() {
    console.log('\n🚀 Starting commit workflow...\n');

    // Step 1: Find active task
    const { task, tracker } = this.getActiveTask();

    if (!task) {
      console.log('❌ No task in progress');
      console.log('   Start a task first: agentic15 task start TASK-001\n');
      process.exit(1);
    }

    console.log(`📌 Task: ${task.id} - ${task.title}\n`);

    // Step 2: Run tests
    console.log('🧪 Running tests...\n');
    this.runTests();

    // Step 3: Stage files in Agent/
    console.log('\n📦 Staging changes...\n');
    this.stageFiles();

    // Step 4: Generate commit message
    const commitMessage = this.generateCommitMessage(task);

    // Step 5: Commit
    console.log('💾 Creating commit...\n');
    this.createCommit(commitMessage);

    // Step 6: Push to feature branch
    console.log('⬆️  Pushing to remote...\n');
    this.pushBranch(task.id);

    // Step 7: Create PR
    console.log('🔀 Creating pull request...\n');
    const prUrl = await this.createPullRequest(task, commitMessage);

    // Step 8: Update GitHub issue status
    await this.updateGitHubIssue(task, prUrl);

    // Step 9: Display summary
    this.displaySummary(task, prUrl, tracker);
  }

  static getActiveTask() {
    const activePlanPath = join(process.cwd(), '.claude', 'ACTIVE-PLAN');

    if (!existsSync(activePlanPath)) {
      console.log('\n❌ No active plan found\n');
      process.exit(1);
    }

    const planId = readFileSync(activePlanPath, 'utf-8').trim();
    const trackerPath = join(process.cwd(), '.claude', 'plans', planId, 'TASK-TRACKER.json');

    if (!existsSync(trackerPath)) {
      console.log('\n❌ Task tracker not found\n');
      process.exit(1);
    }

    const tracker = JSON.parse(readFileSync(trackerPath, 'utf-8'));
    const task = tracker.taskFiles.find(t => t.status === 'in_progress');

    return { task, tracker };
  }

  static runTests() {
    try {
      execSync('npm test', { stdio: 'inherit' });
      console.log('\n✅ All tests passed');
    } catch (error) {
      console.log('\n❌ Tests failed. Fix errors before committing.\n');
      process.exit(1);
    }
  }

  static stageFiles() {
    try {
      // Stage all files in Agent/
      execSync('git add Agent/', { stdio: 'inherit' });

      // Also stage scripts/ if exists
      try {
        execSync('git add scripts/', { stdio: 'pipe' });
      } catch (e) {
        // scripts/ might not exist
      }

      // Show what was staged
      const staged = execSync('git diff --cached --name-only', { encoding: 'utf-8' });

      if (!staged.trim()) {
        console.log('⚠️  No changes to commit\n');
        process.exit(0);
      }

      console.log('Staged files:');
      staged.trim().split('\n').forEach(file => {
        console.log(`   ✓ ${file}`);
      });
    } catch (error) {
      console.log(`\n❌ Failed to stage files: ${error.message}\n`);
      process.exit(1);
    }
  }

  static generateCommitMessage(task) {
    // Load full task details
    const activePlanPath = join(process.cwd(), '.claude', 'ACTIVE-PLAN');
    const planId = readFileSync(activePlanPath, 'utf-8').trim();
    const taskPath = join(process.cwd(), '.claude', 'plans', planId, 'tasks', `${task.id}.json`);

    let taskData;
    try {
      taskData = JSON.parse(readFileSync(taskPath, 'utf-8'));
    } catch (e) {
      taskData = task;
    }

    // Format: [TASK-001] Task title
    return `[${task.id}] ${taskData.title || task.title}`;
  }

  static createCommit(message) {
    try {
      // Escape double quotes and backslashes for shell
      const escapedMessage = message.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      execSync(`git commit -m "${escapedMessage}"`, { stdio: 'inherit' });
      console.log('✅ Commit created');
    } catch (error) {
      console.log(`\n❌ Failed to create commit: ${error.message}\n`);
      process.exit(1);
    }
  }

  static pushBranch(taskId) {
    const branchName = `feature/${taskId.toLowerCase()}`;

    try {
      // Check if branch has upstream
      try {
        execSync('git rev-parse --abbrev-ref --symbolic-full-name @{u}', { stdio: 'pipe' });
        // Has upstream, just push
        execSync('git push', { stdio: 'inherit' });
      } catch (e) {
        // No upstream, set it
        execSync(`git push -u origin ${branchName}`, { stdio: 'inherit' });
      }

      console.log('✅ Pushed to remote');
    } catch (error) {
      console.log(`\n❌ Failed to push: ${error.message}\n`);
      process.exit(1);
    }
  }

  static async createPullRequest(task, commitMessage) {
    try {
      // Get main branch name
      const mainBranch = this.getMainBranch();

      // Load task for issue number
      const activePlanPath = join(process.cwd(), '.claude', 'ACTIVE-PLAN');
      const planId = readFileSync(activePlanPath, 'utf-8').trim();
      const taskPath = join(process.cwd(), '.claude', 'plans', planId, 'tasks', `${task.id}.json`);

      let taskData;
      try {
        taskData = JSON.parse(readFileSync(taskPath, 'utf-8'));
      } catch (e) {
        taskData = task;
      }

      // Build PR body following .github/PULL_REQUEST_TEMPLATE.md structure
      let prBody = `## Task\n\n`;

      if (taskData.githubIssue) {
        prBody += `Closes #${taskData.githubIssue}\n\n`;
      } else {
        prBody += `${task.id}\n\n`;
      }

      prBody += `## Description\n\n`;
      prBody += `${taskData.description || task.description || commitMessage}\n\n`;

      prBody += `## Changes\n\n`;
      prBody += `- Implemented ${task.title}\n\n`;

      prBody += `## Testing\n\n`;
      prBody += `- [x] Unit tests pass (\`npm test\`)\n`;
      prBody += `- [ ] Visual tests pass (if applicable) (\`npx playwright test\`)\n`;
      prBody += `- [ ] Code follows project conventions\n\n`;

      prBody += `## Notes\n\n`;
      prBody += `Auto-generated by Agentic15 Claude Zen`;

      // Create PR using gh CLI
      const prCommand = `gh pr create --title "${commitMessage}" --body "${prBody}" --base ${mainBranch}`;
      const prOutput = execSync(prCommand, { encoding: 'utf-8' });

      // Extract PR URL from output
      const prUrl = prOutput.match(/https:\/\/github\.com\/[^\s]+/)?.[0];

      if (prUrl) {
        console.log(`✅ Pull request created: ${prUrl}`);
        return prUrl;
      }

      console.log('✅ Pull request created');
      return null;
    } catch (error) {
      console.log(`\n⚠️  Failed to create PR: ${error.message}`);
      console.log('   You may need to install GitHub CLI: https://cli.github.com/\n');
      return null;
    }
  }

  static async updateGitHubIssue(task, prUrl) {
    const config = new GitHubConfig(process.cwd());

    if (!config.isAutoUpdateEnabled()) {
      return;
    }

    try {
      // Load task data
      const activePlanPath = join(process.cwd(), '.claude', 'ACTIVE-PLAN');
      const planId = readFileSync(activePlanPath, 'utf-8').trim();
      const taskPath = join(process.cwd(), '.claude', 'plans', planId, 'tasks', `${task.id}.json`);

      const taskData = JSON.parse(readFileSync(taskPath, 'utf-8'));

      if (!taskData.githubIssue) {
        return;
      }

      const client = new GitHubClient(
        config.getToken(),
        config.getRepoInfo().owner,
        config.getRepoInfo().repo
      );

      if (!client.isConfigured()) {
        return;
      }

      // Update labels to "in review"
      await client.updateIssueLabels(taskData.githubIssue, ['status: in-review', `phase: ${taskData.phase || 'implementation'}`]);

      // Add comment with PR link
      if (prUrl) {
        const comment = `Pull request created: ${prUrl}\n\nTask is now in code review.`;
        await client.addIssueComment(taskData.githubIssue, comment);
      }

      console.log(`✅ Updated GitHub issue #${taskData.githubIssue}`);
    } catch (error) {
      console.log(`\n⚠️  Failed to update GitHub issue: ${error.message}\n`);
    }
  }

  static displaySummary(task, prUrl, tracker) {
    console.log('\n┌─────────────────────────────────────────┐');
    console.log('│  ✅ Commit Workflow Complete           │');
    console.log('└─────────────────────────────────────────┘\n');

    console.log(`📌 Task: ${task.id} - ${task.title}`);

    if (prUrl) {
      console.log(`🔗 PR: ${prUrl}`);
    }

    const completed = tracker.taskFiles.filter(t => t.status === 'completed').length;
    const total = tracker.taskFiles.length;

    console.log(`\n📊 Progress: ${completed}/${total} completed\n`);

    console.log('💡 Next steps:');
    console.log('   1. Review and merge PR on GitHub');
    console.log('   2. After merge, run: agentic15 task next\n');
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
