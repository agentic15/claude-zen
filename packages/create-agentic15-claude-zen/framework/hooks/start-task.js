#!/usr/bin/env node

/**
 * Copyright 2024-2025 agentic15.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Start Task Hook with GitHub Issues Integration
 *
 * This hook runs when a task is started. It:
 * 1. Updates task status to 'in_progress'
 * 2. Creates a GitHub issue (if configured)
 * 3. Updates task tracker
 */

import fs from 'fs';
import path from 'path';

// Import GitHub integration classes
// These classes are bundled with the framework
let GitHubClient, GitHubConfig, TaskIssueMapper;
try {
  // Try to import from node_modules (after framework is installed)
  const { GitHubClient: GHClient } = await import('@agentic15.com/agentic15-claude-zen/src/core/GitHubClient.js');
  const { GitHubConfig: GHConfig } = await import('@agentic15.com/agentic15-claude-zen/src/core/GitHubConfig.js');
  const { TaskIssueMapper: GHMapper } = await import('@agentic15.com/agentic15-claude-zen/src/core/TaskIssueMapper.js');

  GitHubClient = GHClient;
  GitHubConfig = GHConfig;
  TaskIssueMapper = GHMapper;
} catch (error) {
  // GitHub integration not available yet (framework not installed or old version)
  // Continue without GitHub integration
}

/**
 * Main execution
 */
async function main() {
  const taskId = process.argv[2];

  if (!taskId) {
    console.error('\n❌ ERROR: Task ID required');
    console.error('Usage: npx agentic15 task start TASK-001\n');
    process.exit(1);
  }

  // Check for active plan
  const activePlanFile = '.claude/ACTIVE-PLAN';
  if (!fs.existsSync(activePlanFile)) {
    console.error('\n❌ ERROR: No active plan found');
    console.error('Set active plan first: npx agentic15 plan\n');
    process.exit(1);
  }

  const activePlan = fs.readFileSync(activePlanFile, 'utf8').trim();
  const planDir = path.join('.claude/plans', activePlan);
  const trackerFile = path.join(planDir, 'TASK-TRACKER.json');
  const taskFile = path.join(planDir, 'tasks', `${taskId}.json`);

  // Check if tracker exists
  if (!fs.existsSync(trackerFile)) {
    console.error('\n❌ ERROR: Task tracker not found');
    console.error(`Plan: ${activePlan}`);
    console.error('Initialize first: npx agentic15 plan\n');
    process.exit(1);
  }

  // Check if task exists
  if (!fs.existsSync(taskFile)) {
    console.error(`\n❌ ERROR: Task file not found: ${taskFile}`);
    console.error('Available tasks:');

    const tracker = JSON.parse(fs.readFileSync(trackerFile, 'utf8'));
    tracker.taskFiles.forEach(task => {
      console.error(`  ${task.id}: ${task.title} [${task.status}]`);
    });
    console.error('');
    process.exit(1);
  }

  // Load task and tracker
  const tracker = JSON.parse(fs.readFileSync(trackerFile, 'utf8'));
  const taskData = JSON.parse(fs.readFileSync(taskFile, 'utf8'));

  // Check if already completed
  if (taskData.status === 'completed') {
    console.error(`\n❌ ERROR: Task ${taskId} is already completed`);
    console.error('Cannot restart a completed task\n');
    process.exit(1);
  }

  // Pause any currently active task
  if (tracker.activeTask && tracker.activeTask !== taskId) {
    const activeTaskFile = path.join(planDir, 'tasks', `${tracker.activeTask}.json`);
    if (fs.existsSync(activeTaskFile)) {
      const activeTask = JSON.parse(fs.readFileSync(activeTaskFile, 'utf8'));
      console.log(`\n⚠️  Pausing task ${activeTask.id}: ${activeTask.title}`);
      activeTask.status = 'pending';
      fs.writeFileSync(activeTaskFile, JSON.stringify(activeTask, null, 2));

      // Update in tracker
      const trackerTask = tracker.taskFiles.find(t => t.id === tracker.activeTask);
      if (trackerTask) {
        trackerTask.status = 'pending';
      }
    }
  }

  // Update task status
  taskData.status = 'in_progress';
  taskData.startedAt = new Date().toISOString();

  // GitHub Issues Integration
  if (GitHubConfig && GitHubClient && TaskIssueMapper) {
    try {
      const githubConfig = new GitHubConfig(process.cwd());

      if (githubConfig.isAutoCreateEnabled()) {
        const { owner, repo } = githubConfig.getRepoInfo();
        const githubClient = new GitHubClient(
          githubConfig.getToken(),
          owner,
          repo
        );

        // Only create issue if not already created
        if (!taskData.githubIssue) {
          const title = TaskIssueMapper.taskToIssueTitle(taskData);
          const body = TaskIssueMapper.taskToIssueBody(taskData);
          const labels = TaskIssueMapper.taskStatusToLabels(taskData.status, taskData.phase);

          const issueNumber = await githubClient.createIssue(title, body, labels);

          if (issueNumber) {
            taskData.githubIssue = issueNumber;
            console.log(`✓ Created GitHub issue #${issueNumber}`);
          }
        } else {
          console.log(`ℹ  Task already linked to GitHub issue #${taskData.githubIssue}`);
        }
      }
    } catch (error) {
      console.warn('⚠ GitHub integration failed:', error.message);
      // Continue anyway - task creation should not fail due to GitHub issues
    }
  }

  // Save updated task
  fs.writeFileSync(taskFile, JSON.stringify(taskData, null, 2));

  // Update tracker
  tracker.activeTask = taskId;
  tracker.lastUpdated = new Date().toISOString();

  const trackerTask = tracker.taskFiles.find(t => t.id === taskId);
  if (trackerTask) {
    trackerTask.status = 'in_progress';
  }

  // Update statistics
  tracker.statistics = {
    totalTasks: tracker.taskFiles.length,
    pending: tracker.taskFiles.filter(t => t.status === 'pending').length,
    inProgress: tracker.taskFiles.filter(t => t.status === 'in_progress').length,
    completed: tracker.taskFiles.filter(t => t.status === 'completed').length,
    blocked: tracker.taskFiles.filter(t => t.status === 'blocked').length
  };

  fs.writeFileSync(trackerFile, JSON.stringify(tracker, null, 2));

  // Display task info
  console.log(`\n✅ Started task: ${taskId}`);
  console.log(`📋 Plan: ${activePlan}\n`);
  console.log(`📌 ${taskData.title}`);

  if (taskData.description) {
    console.log(`📝 ${taskData.description}`);
  }

  console.log('');

  if (taskData.phase) {
    console.log(`🔧 Phase: ${taskData.phase}`);
  }

  if (taskData.githubIssue) {
    const { owner, repo } = new GitHubConfig(process.cwd()).getRepoInfo();
    const issueUrl = `https://github.com/${owner}/${repo}/issues/${taskData.githubIssue}`;
    console.log(`🔗 GitHub Issue: ${issueUrl}`);
  }

  if (taskData.completionCriteria && taskData.completionCriteria.length > 0) {
    console.log('\n✓ Completion criteria:');
    taskData.completionCriteria.forEach((criteria, index) => {
      console.log(`  ${index + 1}. ${criteria}`);
    });
  }

  if (taskData.testCases && taskData.testCases.length > 0) {
    console.log('\n🧪 Test cases:');
    taskData.testCases.forEach((test, index) => {
      console.log(`  ${index + 1}. ${test}`);
    });
  }

  console.log(`\n📂 Task file: ${taskFile}`);
  console.log('\n📝 WORKFLOW:');
  console.log(' 1. Implement the task requirements');
  console.log(' 2. When finished, commit and create PR:');
  console.log(`     npx agentic15 commit`);

  process.exit(0);
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
