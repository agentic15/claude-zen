import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { GitHubClient } from '../core/GitHubClient.js';
import { GitHubConfig } from '../core/GitHubConfig.js';

export class CommitCommand {
  static async execute() {
    console.log('\n🚀 Starting commit workflow...\n');

    // Step 1: Find active task
    const { task, tracker, trackerPath } = this.getActiveTask();

    if (!task) {
      // Fallback mode: Check if there are pending changes to commit
      const hasPendingChanges = this.checkPendingChanges();

      if (hasPendingChanges) {
        console.log('⚠️  No active task, but found uncommitted changes');
        console.log('   This usually means TASK-TRACKER.json was left behind from a previous commit\n');

        // Stage and commit the leftover changes
        console.log('📦 Staging leftover changes...\n');
        this.stageFiles();

        console.log('💾 Creating commit for leftover changes...\n');
        this.createCommit('[TRACKER] Update task completion status');

        // Push to current branch
        const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
        console.log(`⬆️  Pushing to ${currentBranch}...\n`);

        // Check if branch has upstream, set it if not
        try {
          execSync('git rev-parse --abbrev-ref --symbolic-full-name @{u}', { stdio: 'pipe' });
          // Has upstream, just push
          execSync('git push', { stdio: 'inherit' });
        } catch (e) {
          // No upstream, set it
          execSync(`git push -u origin ${currentBranch}`, { stdio: 'inherit' });
        }

        console.log('\n✅ Leftover changes committed and pushed to PR\n');
        return;
      }

      console.log('❌ No task in progress');
      console.log('   Start a task first: agentic15 task start TASK-001\n');
      process.exit(1);
    }

    console.log(`📌 Task: ${task.id} - ${task.title}\n`);

    // Step 2: Mark task as completed BEFORE committing (so TASK-TRACKER.json is included)
    console.log('✓ Marking task as completed...\n');
    this.markTaskCompleted(task, tracker, trackerPath);

    // Step 3: Stage files (including updated TASK-TRACKER.json)
    console.log('📦 Staging changes...\n');
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

    return { task, tracker, trackerPath };
  }

  static checkPendingChanges() {
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf-8' });
      return status.trim().length > 0;
    } catch (e) {
      return false;
    }
  }

  static stageFiles() {
    try {
      // Stage all changes (including deletions, moves, and new files)
      console.log('📦 Staging all changes...\n');
      execSync('git add -A', { stdio: 'inherit' });

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

      // Try to read PR template
      const templatePath = join(process.cwd(), '.github', 'PULL_REQUEST_TEMPLATE.md');
      let prBody = '';

      if (existsSync(templatePath)) {
        // Use the PR template and populate it with task data
        const template = readFileSync(templatePath, 'utf-8');
        prBody = this.populatePRTemplate(template, taskData, task, commitMessage);
      } else {
        // Fallback to custom body if template doesn't exist
        prBody = this.buildCustomPRBody(taskData, task, commitMessage);
      }

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

  static populatePRTemplate(template, taskData, task, commitMessage) {
    let populated = template;

    // Fill in Description
    populated = populated.replace(
      /<!-- Provide a brief description of the changes in this PR -->/,
      `${taskData.description || task.description || commitMessage}`
    );

    // Fill in Type of Change based on phase
    if (taskData.phase === 'testing') {
      populated = populated.replace(/- \[ \] Test update/, '- [x] Test update');
    } else if (taskData.phase === 'implementation') {
      populated = populated.replace(/- \[ \] New feature/, '- [x] New feature');
    } else if (taskData.phase === 'design') {
      populated = populated.replace(/- \[ \] Documentation update/, '- [x] Documentation update');
    }

    // Fill in Related Issues
    if (taskData.githubIssue) {
      populated = populated.replace(/Fixes #\s*\n/, `Fixes #${taskData.githubIssue}\n`);
    } else {
      populated = populated.replace(/Fixes #\s*\n/, `Related to ${task.id}\n`);
    }

    // Fill in Motivation and Context
    populated = populated.replace(
      /<!-- Why is this change required\? What problem does it solve\? -->/,
      `**Task:** ${task.id} - ${task.title}\n\n${taskData.description || task.description || ''}`
    );

    // Add TDD section to "How Has This Been Tested?"
    let testingSection = '';
    if (taskData.phase === 'testing') {
      populated = populated.replace(/- \[ \] Unit tests/, '- [x] Unit tests');
      testingSection = `\n### TDD Compliance (Testing Phase):\n`;
      testingSection += `- [ ] All tests are REAL and EXECUTABLE (no mocks/placeholders)\n`;
      testingSection += `- [ ] Tests verify actual functionality\n`;
      testingSection += `- [ ] Positive and negative test cases included\n`;
      testingSection += `- [ ] Edge cases and error conditions covered\n`;
      testingSection += `- [ ] Tests pass and are ready for implementation phase\n\n`;
    } else if (taskData.phase === 'implementation') {
      populated = populated.replace(/- \[ \] Unit tests/, '- [x] Unit tests');
      populated = populated.replace(/- \[ \] Integration tests/, '- [x] Integration tests');
      testingSection = `\n### TDD Compliance (Implementation Phase):\n`;
      testingSection += `- [ ] Prerequisite testing task is completed\n`;
      testingSection += `- [ ] All tests from prerequisite task pass\n`;
      testingSection += `- [ ] No tests were modified (implementation makes existing tests pass)\n\n`;
    }

    // Insert TDD section after the test checkboxes
    populated = populated.replace(
      /\*\*Test Configuration\*\*:/,
      testingSection + '\n**Test Configuration**:'
    );

    // Add copyright header checkbox automatically
    populated = populated.replace(
      /- \[ \] I have added copyright headers to new files/,
      '- [x] I have added copyright headers to new files'
    );

    // Add test requirement checkbox
    populated = populated.replace(
      /- \[ \] I have added tests that prove my fix is effective or that my feature works/,
      taskData.phase === 'testing' || taskData.phase === 'implementation'
        ? '- [x] I have added tests that prove my fix is effective or that my feature works'
        : '- [ ] I have added tests that prove my fix is effective or that my feature works'
    );

    // Add note about auto-generation
    populated = populated.replace(
      /<!-- Add any additional notes, concerns, or questions for reviewers -->/,
      `**Task ID:** ${task.id}\n**Phase:** ${taskData.phase}\n\nAuto-generated by Agentic15 Claude Zen`
    );

    return populated;
  }

  static buildCustomPRBody(taskData, task, commitMessage) {
    // Original custom body as fallback
    let prBody = `## Task\n\n`;

      if (taskData.githubIssue) {
        prBody += `Closes #${taskData.githubIssue}\n\n`;
      } else {
        prBody += `${task.id}\n\n`;
      }

      // Task Type
      prBody += `## Task Type\n\n`;
      if (taskData.phase === 'testing') {
        prBody += `- [x] Testing Task (TDD - writing tests BEFORE implementation)\n`;
        prBody += `- [ ] Implementation Task (TDD - making tests pass)\n`;
        prBody += `- [ ] Design Task (schemas, architecture, planning)\n\n`;
      } else if (taskData.phase === 'implementation') {
        prBody += `- [ ] Testing Task (TDD - writing tests BEFORE implementation)\n`;
        prBody += `- [x] Implementation Task (TDD - making tests pass)\n`;
        prBody += `- [ ] Design Task (schemas, architecture, planning)\n\n`;
      } else if (taskData.phase === 'design') {
        prBody += `- [ ] Testing Task (TDD - writing tests BEFORE implementation)\n`;
        prBody += `- [ ] Implementation Task (TDD - making tests pass)\n`;
        prBody += `- [x] Design Task (schemas, architecture, planning)\n\n`;
      } else {
        prBody += `- [ ] Testing Task (TDD - writing tests BEFORE implementation)\n`;
        prBody += `- [ ] Implementation Task (TDD - making tests pass)\n`;
        prBody += `- [ ] Design Task (schemas, architecture, planning)\n\n`;
      }

      prBody += `## Description\n\n`;
      prBody += `${taskData.description || task.description || commitMessage}\n\n`;

      prBody += `## Changes\n\n`;
      prBody += `- Implemented ${task.title}\n\n`;

      // TDD Compliance Section
      prBody += `## TDD Compliance (REQUIRED)\n\n`;

      if (taskData.phase === 'testing') {
        prBody += `### For Testing Tasks:\n`;
        prBody += `- [ ] All tests are REAL and EXECUTABLE (no mocks/placeholders)\n`;
        prBody += `- [ ] Tests verify actual functionality\n`;
        prBody += `- [ ] Positive and negative test cases included\n`;
        prBody += `- [ ] Edge cases and error conditions covered\n`;
        prBody += `- [ ] Tests pass and are ready for implementation phase\n`;
        prBody += `- [ ] **Test Output:** (paste screenshot or output showing tests passing)\n\n`;
      }

      if (taskData.phase === 'implementation') {
        prBody += `### For Implementation Tasks:\n`;
        prBody += `- [ ] Prerequisite testing task is completed\n`;
        prBody += `- [ ] All tests from prerequisite task pass\n`;
        prBody += `- [ ] No tests were modified (implementation should make existing tests pass)\n`;
        prBody += `- [ ] **Test Output:** (paste screenshot showing all tests passing)\n\n`;
      }

      // Determine if UI or Backend based on test cases or artifacts
      const hasUIWork = taskData.testCases?.some(tc =>
        tc.toLowerCase().includes('ui') ||
        tc.toLowerCase().includes('component') ||
        tc.toLowerCase().includes('render') ||
        tc.toLowerCase().includes('form')
      ) || taskData.artifacts?.code?.some(file =>
        file.includes('components/') ||
        file.includes('pages/') ||
        file.includes('ui/')
      );

      const hasBackendWork = taskData.testCases?.some(tc =>
        tc.toLowerCase().includes('api') ||
        tc.toLowerCase().includes('endpoint') ||
        tc.toLowerCase().includes('response')
      ) || taskData.artifacts?.code?.some(file =>
        file.includes('controllers/') ||
        file.includes('services/') ||
        file.includes('api/')
      );

      if (hasUIWork) {
        prBody += `### For UI Testing/Implementation:\n`;
        prBody += `- [ ] User interactions verified/implemented\n`;
        prBody += `- [ ] Component rendering tested/implemented\n`;
        prBody += `- [ ] Form validation tested/implemented\n`;
        prBody += `- [ ] Visual feedback verified/implemented\n\n`;
      }

      if (hasBackendWork) {
        prBody += `### For Backend Testing/Implementation:\n`;
        prBody += `- [ ] API responses verified/implemented\n`;
        prBody += `- [ ] Data validation tested/implemented\n`;
        prBody += `- [ ] Error handling verified/implemented\n`;
        prBody += `- [ ] Status codes verified/implemented\n\n`;
      }

      // Test Results Section
      prBody += `## Test Results (REQUIRED for all PRs)\n\n`;
      prBody += `\`\`\`\n`;
      prBody += `Paste test output here showing all tests passing\n`;
      prBody += `Example: npm test output or npx playwright test output\n`;
      prBody += `\`\`\`\n\n`;

      // Code Quality
      prBody += `## Code Quality\n\n`;
      prBody += `- [ ] Code follows project conventions\n`;
      prBody += `- [ ] No commented-out code\n`;
      prBody += `- [ ] No debug statements (console.log, etc.)\n`;
      prBody += `- [ ] Documentation updated (if needed)\n\n`;

      prBody += `## Notes\n\n`;
      prBody += `Auto-generated by Agentic15 Claude Zen`;

      return prBody;
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

  static markTaskCompleted(task, tracker, trackerPath) {
    try {
      // Update tracker
      const taskInTracker = tracker.taskFiles.find(t => t.id === task.id);

      if (taskInTracker) {
        taskInTracker.status = 'completed';
        taskInTracker.completedAt = new Date().toISOString();

        // Clear active task and update statistics
        tracker.activeTask = null;
        this.updateStatistics(tracker);

        writeFileSync(trackerPath, JSON.stringify(tracker, null, 2));
        console.log(`✅ Marked ${task.id} as completed`);
      }
    } catch (error) {
      console.log(`\n⚠️  Failed to mark task as completed: ${error.message}`);
      console.log('   You may need to manually update TASK-TRACKER.json\n');
    }
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
