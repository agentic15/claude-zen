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

import { GitHubConfig } from '../core/GitHubConfig.js';
import { GitHubClient } from '../core/GitHubClient.js';
import { TaskIssueMapper } from '../core/TaskIssueMapper.js';

/**
 * Update GitHub issue status when task state changes
 *
 * This utility function is used by various hooks to keep GitHub issues
 * in sync with local task status changes.
 *
 * @param {Object} taskData - Task JSON object
 * @param {string} projectRoot - Path to project root directory
 * @param {string} newStatus - New task status (pending, in_progress, completed, blocked)
 * @param {Object} options - Optional parameters
 * @param {string} options.comment - Optional comment to add to the issue
 * @returns {Promise<boolean>} - Success status
 */
export async function updateTaskGitHubStatus(taskData, projectRoot, newStatus, options = {}) {
  try {
    // Load GitHub configuration
    const githubConfig = new GitHubConfig(projectRoot);

    // Check if auto-update is enabled
    if (!githubConfig.isAutoUpdateEnabled()) {
      return false;
    }

    // Check if task has associated GitHub issue
    if (!taskData.githubIssue) {
      return false;
    }

    // Initialize GitHub client
    const { owner, repo } = githubConfig.getRepoInfo();
    const githubClient = new GitHubClient(
      githubConfig.getToken(),
      owner,
      repo
    );

    // Update issue labels based on new status
    const labels = TaskIssueMapper.taskStatusToLabels(newStatus, taskData.phase);
    const labelsUpdated = await githubClient.updateIssueLabels(taskData.githubIssue, labels);

    if (!labelsUpdated) {
      console.warn(`⚠ Failed to update GitHub issue #${taskData.githubIssue} labels`);
      return false;
    }

    // Add comment if provided
    if (options.comment) {
      const commentAdded = await githubClient.addIssueComment(taskData.githubIssue, options.comment);
      if (!commentAdded) {
        console.warn(`⚠ Failed to add comment to GitHub issue #${taskData.githubIssue}`);
      }
    }

    console.log(`✓ Updated GitHub issue #${taskData.githubIssue} to ${newStatus}`);
    return true;

  } catch (error) {
    console.warn('⚠ Failed to update GitHub issue status:', error.message);
    return false;
  }
}
