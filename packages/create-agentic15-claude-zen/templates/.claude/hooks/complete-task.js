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
 * Complete Task Hook with GitHub Issues Integration
 *
 * This hook runs when a task is completed. It:
 * 1. Updates task status to 'completed'
 * 2. Updates GitHub issue (if configured)
 * 3. Updates task tracker
 */

import fs from 'fs';
import path from 'path';

// Import GitHub integration utility
let updateTaskGitHubStatus;
try {
  const statusModule = await import('@agentic15.com/agentic15-claude-zen/src/utils/updateTaskGitHubStatus.js');
  updateTaskGitHubStatus = statusModule.updateTaskGitHubStatus;
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
    console.error('Usage: Internal - called by npx agentic15 commit\n');
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
    console.log(`\nℹ  Task ${taskId} is already completed`);
    process.exit(0);
  }

  // Check if this is the active task
  if (tracker.activeTask !== taskId) {
    console.warn(`\n⚠️  Warning: ${taskId} is not the active task`);
    console.warn(`   Active task: ${tracker.activeTask || 'none'}`);
    console.warn('   Completing anyway...\n');
  }

  // Update task status
  const previousStatus = taskData.status;
  taskData.status = 'completed';
  taskData.completedAt = new Date().toISOString();

  // Calculate actual hours if started time exists
  if (taskData.startedAt) {
    const startTime = new Date(taskData.startedAt);
    const endTime = new Date(taskData.completedAt);
    const hoursWorked = (endTime - startTime) / (1000 * 60 * 60);
    taskData.actualHours = parseFloat(hoursWorked.toFixed(2));
  }

  // GitHub Issues Integration
  if (updateTaskGitHubStatus) {
    try {
      // Prepare completion comment
      let comment = `Task completed! ✅\n\n`;
      comment += `**Status:** ${previousStatus} → completed\n`;

      if (taskData.actualHours) {
        comment += `**Time Taken:** ${taskData.actualHours}h`;
        if (taskData.estimatedHours) {
          const variance = taskData.actualHours - taskData.estimatedHours;
          const variancePercent = ((variance / taskData.estimatedHours) * 100).toFixed(1);
          comment += ` (estimated: ${taskData.estimatedHours}h, ${variance > 0 ? '+' : ''}${variancePercent}%)\n`;
        } else {
          comment += `\n`;
        }
      }

      if (taskData.completionCriteria && taskData.completionCriteria.length > 0) {
        comment += `\n**Completion Criteria:**\n`;
        taskData.completionCriteria.forEach(criteria => {
          comment += `- ✓ ${criteria}\n`;
        });
      }

      // Update GitHub issue
      await updateTaskGitHubStatus(
        taskData,
        process.cwd(),
        'completed',
        { comment }
      );
    } catch (error) {
      console.warn('⚠ GitHub integration failed:', error.message);
      // Continue anyway - task completion should not fail due to GitHub issues
    }
  }

  // Save updated task
  fs.writeFileSync(taskFile, JSON.stringify(taskData, null, 2));

  // Update tracker
  if (tracker.activeTask === taskId) {
    tracker.activeTask = null;
  }
  tracker.lastUpdated = new Date().toISOString();

  const trackerTask = tracker.taskFiles.find(t => t.id === taskId);
  if (trackerTask) {
    trackerTask.status = 'completed';
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

  // Display completion message
  console.log(`\n✅ Completed task: ${taskId}`);
  console.log(`📋 Plan: ${activePlan}\n`);
  console.log(`📌 ${taskData.title}`);

  if (taskData.actualHours) {
    console.log(`⏱️  Time: ${taskData.actualHours}h`);
    if (taskData.estimatedHours) {
      const variance = taskData.actualHours - taskData.estimatedHours;
      if (Math.abs(variance) > 0.1) {
        const symbol = variance > 0 ? '⚠️' : '✓';
        console.log(`   ${symbol} ${variance > 0 ? 'Over' : 'Under'} by ${Math.abs(variance).toFixed(2)}h`);
      }
    }
  }

  if (taskData.githubIssue) {
    console.log(`🔗 GitHub Issue: Updated #${taskData.githubIssue}`);
  }

  console.log('');
  console.log('📊 Progress:');
  console.log(`   Completed: ${tracker.statistics.completed}/${tracker.statistics.totalTasks}`);
  console.log(`   Remaining: ${tracker.statistics.pending + tracker.statistics.inProgress}`);

  // Suggest next task
  const nextPendingTask = tracker.taskFiles.find(t => t.status === 'pending');
  if (nextPendingTask) {
    console.log('');
    console.log('📝 Next task:');
    console.log(`   ${nextPendingTask.id}: ${nextPendingTask.title}`);
    console.log(`   Run: npx agentic15 task next`);
  } else {
    console.log('');
    console.log('🎉 All tasks completed!');
  }

  console.log('');
  process.exit(0);
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
