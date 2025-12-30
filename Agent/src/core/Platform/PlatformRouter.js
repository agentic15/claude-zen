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

import { PlatformDetector } from './PlatformDetector.js';
import { GitHubConfig } from '../GitHubConfig.js';
import { GitHubClient } from '../GitHubClient.js';
import { AzureDevOpsConfig } from '../Azure/AzureDevOpsConfig.js';
import { WorkItemSync } from '../Azure/WorkItemSync.js';

/**
 * PlatformRouter - Routes operations to GitHub or Azure DevOps
 *
 * Single Responsibility: Detect platform and route task operations to correct client
 *
 * Provides unified interface for:
 * - GitHub Issues (via GitHubClient)
 * - Azure DevOps Work Items (via WorkItemSync)
 *
 * Automatically detects platform from git remote and configuration
 */
export class PlatformRouter {
  /**
   * Initialize platform router
   *
   * @param {string} projectRoot - Project root directory
   */
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;

    // Detect platform (disable cache for test isolation)
    this.platform = PlatformDetector.detect(false, projectRoot);

    // Initialize clients based on detected platform
    this.githubClient = null;
    this.azureSync = null;

    this._initializeClients();
  }

  /**
   * Initialize platform-specific clients
   *
   * @private
   */
  _initializeClients() {
    if (this.platform === 'github') {
      this._initializeGitHubClient();
    } else if (this.platform === 'azure') {
      this._initializeAzureClient();
    }
  }

  /**
   * Initialize GitHub client
   *
   * @private
   */
  _initializeGitHubClient() {
    try {
      const config = new GitHubConfig(this.projectRoot);

      if (config.isEnabled()) {
        this.githubClient = new GitHubClient(
          config.getToken(),
          config.getRepoInfo().owner,
          config.getRepoInfo().repo
        );
      }
    } catch (error) {
      console.warn('⚠ Failed to initialize GitHub client:', error.message);
      this.githubClient = null;
    }
  }

  /**
   * Initialize Azure DevOps client
   *
   * @private
   */
  _initializeAzureClient() {
    try {
      this.azureSync = new WorkItemSync(this.projectRoot);

      if (!this.azureSync.isEnabled()) {
        this.azureSync = null;
      }
    } catch (error) {
      console.warn('⚠ Failed to initialize Azure client:', error.message);
      this.azureSync = null;
    }
  }

  /**
   * Get detected platform
   *
   * @returns {string|null} Platform name ('github', 'azure') or null
   */
  getPlatform() {
    return this.platform;
  }

  /**
   * Get platform-specific client
   *
   * @returns {Object|null} GitHub client or Azure sync or null
   */
  getClient() {
    if (this.platform === 'github') {
      return this.githubClient;
    } else if (this.platform === 'azure') {
      return this.azureSync;
    }
    return null;
  }

  /**
   * Check if router is configured and ready
   *
   * @returns {boolean} True if ready to route operations
   */
  isConfigured() {
    if (this.platform === 'github') {
      return this.githubClient && this.githubClient.isConfigured();
    } else if (this.platform === 'azure') {
      return this.azureSync && this.azureSync.isEnabled();
    }
    return false;
  }

  /**
   * Create task item (GitHub issue or Azure work item)
   *
   * @param {Object} task - Task object
   * @returns {Promise<number|null>} Item ID or null
   */
  async createTaskItem(task) {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      if (this.platform === 'github') {
        // Create GitHub issue
        const title = `[${task.id}] ${task.title}`;
        const body = task.description || '';
        const labels = task.tags || [];

        return await this.githubClient.createIssue(title, body, labels);
      } else if (this.platform === 'azure') {
        // Create Azure work item
        return await this.azureSync.createWorkItem(task);
      }

      return null;
    } catch (error) {
      console.warn('⚠ Failed to create task item:', error.message);
      return null;
    }
  }

  /**
   * Update task item (GitHub issue or Azure work item)
   *
   * @param {Object} task - Task object with updated status
   * @param {number} itemId - Issue/work item ID
   * @returns {Promise<boolean>} True if updated, false otherwise
   */
  async updateTaskItem(task, itemId) {
    if (!this.isConfigured() || !itemId) {
      return false;
    }

    try {
      if (this.platform === 'github') {
        // Update GitHub issue labels based on status
        const labels = this._taskStatusToGitHubLabels(task.status);
        return await this.githubClient.updateIssueLabels(itemId, labels);
      } else if (this.platform === 'azure') {
        // Update Azure work item
        return await this.azureSync.updateWorkItemStatus(task, itemId);
      }

      return false;
    } catch (error) {
      console.warn('⚠ Failed to update task item:', error.message);
      return false;
    }
  }

  /**
   * Close task item (GitHub issue or Azure work item)
   *
   * @param {number} itemId - Issue/work item ID
   * @param {string} comment - Optional closing comment
   * @returns {Promise<boolean>} True if closed, false otherwise
   */
  async closeTaskItem(itemId, comment = null) {
    if (!this.isConfigured() || !itemId) {
      return false;
    }

    try {
      if (this.platform === 'github') {
        // Close GitHub issue
        return await this.githubClient.closeIssue(itemId, comment);
      } else if (this.platform === 'azure') {
        // Close Azure work item
        const task = { id: `TASK-${itemId}` }; // Minimal task object for closure
        return await this.azureSync.closeWorkItem(task, itemId, comment);
      }

      return false;
    } catch (error) {
      console.warn('⚠ Failed to close task item:', error.message);
      return false;
    }
  }

  /**
   * Add comment to task item
   *
   * @param {number} itemId - Issue/work item ID
   * @param {string} comment - Comment text
   * @returns {Promise<boolean>} True if added, false otherwise
   */
  async addComment(itemId, comment) {
    if (!this.isConfigured() || !itemId) {
      return false;
    }

    try {
      if (this.platform === 'github') {
        return await this.githubClient.addIssueComment(itemId, comment);
      } else if (this.platform === 'azure') {
        return await this.azureSync.addWorkItemComment(itemId, comment);
      }

      return false;
    } catch (error) {
      console.warn('⚠ Failed to add comment:', error.message);
      return false;
    }
  }

  /**
   * Convert task status to GitHub labels
   *
   * @private
   * @param {string} status - Task status
   * @returns {Array<string>} GitHub labels
   */
  _taskStatusToGitHubLabels(status) {
    const labelMap = {
      'pending': ['status: pending'],
      'in_progress': ['status: in progress'],
      'completed': ['status: completed'],
      'blocked': ['status: blocked']
    };

    return labelMap[status] || [];
  }

  /**
   * Get platform name for display
   *
   * @returns {string} Human-readable platform name
   */
  getPlatformName() {
    if (this.platform === 'github') {
      return 'GitHub';
    } else if (this.platform === 'azure') {
      return 'Azure DevOps';
    }
    return 'None';
  }

  /**
   * Check if platform is GitHub
   *
   * @returns {boolean} True if GitHub
   */
  isGitHub() {
    return this.platform === 'github';
  }

  /**
   * Check if platform is Azure DevOps
   *
   * @returns {boolean} True if Azure
   */
  isAzure() {
    return this.platform === 'azure';
  }
}
