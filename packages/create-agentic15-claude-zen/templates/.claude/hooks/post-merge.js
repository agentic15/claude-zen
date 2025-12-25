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
 * Post-Merge Hook - Close GitHub issues when merged to main
 *
 * This git hook runs after: git merge, git pull
 * Detects: Task IDs in commit messages
 * Action: Close associated GitHub issues
 *
 * IMPORTANT: This is a traditional git hook that must be installed in .git/hooks/
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Import GitHub integration classes
let GitHubClient, GitHubConfig;
try {
  const { GitHubClient: GHClient } = await import('@agentic15.com/agentic15-claude-zen/src/core/GitHubClient.js');
  const { GitHubConfig: GHConfig } = await import('@agentic15.com/agentic15-claude-zen/src/core/GitHubConfig.js');

  GitHubClient = GHClient;
  GitHubConfig = GHConfig;
} catch (error) {
  // GitHub integration not available yet (framework not installed or old version)
  // Hook will exit silently
  process.exit(0);
}

/**
 * Main execution
 */
async function main() {
  const projectRoot = process.cwd();

  // Check if we're on main branch
  try {
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf8'
    }).trim();

    if (currentBranch !== 'main' && currentBranch !== 'master') {
      // Not on main, skip
      process.exit(0);
    }
  } catch (error) {
    // Could not detect current branch, skip
    process.exit(0);
  }

  // Load GitHub config
  const githubConfig = new GitHubConfig(projectRoot);

  if (!githubConfig.isAutoCloseEnabled()) {
    // Auto-close not enabled, skip
    process.exit(0);
  }

  // Get commits from the merge
  let mergeCommits;
  try {
    mergeCommits = execSync('git log ORIG_HEAD..HEAD --oneline', {
      encoding: 'utf8'
    }).trim();

    if (!mergeCommits) {
      // No commits in merge, skip
      process.exit(0);
    }
  } catch (error) {
    // Could not get merge commits, skip
    process.exit(0);
  }

  // Extract task IDs from commit messages
  // Matches: [TASK-001], TASK-001, [task-001], task-001
  const taskIds = new Set();
  const taskIdRegex = /\[?(TASK-\d+)\]?/gi;

  for (const match of mergeCommits.matchAll(taskIdRegex)) {
    taskIds.add(match[1].toUpperCase());
  }

  if (taskIds.size === 0) {
    // No task IDs found in merge commits
    process.exit(0);
  }

  // Load active plan to get task-to-issue mappings
  const activePlanPath = path.join(projectRoot, '.claude', 'ACTIVE-PLAN');
  if (!fs.existsSync(activePlanPath)) {
    // No active plan, skip
    process.exit(0);
  }

  const activePlan = fs.readFileSync(activePlanPath, 'utf8').trim();
  const planDir = path.join(projectRoot, '.claude', 'plans', activePlan);

  // Initialize GitHub client
  const { owner, repo } = githubConfig.getRepoInfo();
  const githubClient = new GitHubClient(
    githubConfig.getToken(),
    owner,
    repo
  );

  if (!githubClient.isConfigured()) {
    // GitHub not configured, skip
    process.exit(0);
  }

  // Close issues for each task
  let closedCount = 0;
  for (const taskId of taskIds) {
    const taskFile = path.join(planDir, 'tasks', `${taskId}.json`);

    if (!fs.existsSync(taskFile)) {
      continue;
    }

    const taskData = JSON.parse(fs.readFileSync(taskFile, 'utf8'));

    // Only close issue if task is completed and has associated GitHub issue
    if (taskData.githubIssue && taskData.status === 'completed') {
      const comment = `Merged to main branch! 🎉\n\nTask ${taskId} has been successfully integrated.`;
      const success = await githubClient.closeIssue(taskData.githubIssue, comment);

      if (success) {
        console.log(`✓ Closed GitHub issue #${taskData.githubIssue} for ${taskId}`);
        closedCount++;
      }
    }
  }

  if (closedCount > 0) {
    console.log(`\n✅ Closed ${closedCount} GitHub issue${closedCount > 1 ? 's' : ''} after merge to main`);
  }

  process.exit(0);
}

main().catch(error => {
  // Don't block the merge on errors
  console.warn('⚠ Post-merge hook encountered an error:', error.message);
  process.exit(0);
});
