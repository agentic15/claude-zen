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

import { execSync, execFileSync } from 'child_process';

/**
 * AzureDevOpsClient - Handles Azure DevOps work item operations via Azure CLI
 *
 * Single Responsibility: Interact with Azure DevOps Work Items using `az boards` CLI
 *
 * CRITICAL: Completely isolated from GitHub integration
 * - Uses separate configuration (AzureDevOpsConfig)
 * - Uses Azure CLI authentication (az login) - NO tokens needed
 * - No shared state with GitHub client
 *
 * Authentication: Requires `az login` - credentials managed by Azure CLI
 */
export class AzureDevOpsClient {
  /**
   * Initialize Azure DevOps client
   *
   * @param {string} organization - Azure DevOps organization name
   * @param {string} project - Azure DevOps project name
   */
  constructor(organization, project) {
    this.organization = organization;
    this.project = project;
  }

  /**
   * Check if Azure CLI is authenticated and client is configured
   *
   * @returns {boolean} True if configured and authenticated, false otherwise
   */
  isConfigured() {
    if (!this.organization || !this.project) {
      return false;
    }

    try {
      // Check if Azure CLI is authenticated
      execSync('az account show', { stdio: 'pipe' });
      return true;
    } catch {
      console.warn('⚠ Azure CLI not authenticated. Run: az login');
      return false;
    }
  }

  /**
   * Create a work item in Azure DevOps
   *
   * @param {string} title - Work item title
   * @param {string} description - Work item description
   * @param {Array<string>} tags - Work item tags (optional)
   * @returns {Promise<number|null>} Work item ID or null if failed
   */
  async createWorkItem(title, description, tags = []) {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const tagString = tags.join(';');

      // Build args array for execFileSync (handles escaping automatically)
      const args = [
        'boards', 'work-item', 'create',
        '--title', title,
        '--type', 'Task',
        '--description', description,
        '--organization', `https://dev.azure.com/${this.organization}`,
        '--project', this.project,
        '--output', 'json'
      ];

      // Add tags field if tags provided
      if (tagString) {
        args.push('--fields', `System.Tags=${tagString}`);
      }

      const result = execFileSync('az', args, { encoding: 'utf8' });
      const workItem = JSON.parse(result);

      return workItem.id;
    } catch (error) {
      console.warn('⚠ Failed to create Azure work item:', error.message);
      return null;
    }
  }

  /**
   * Update work item state
   *
   * @param {number} workItemId - Work item ID
   * @param {string} state - New state (New, Active, Closed, Resolved, etc.)
   * @returns {Promise<boolean>} True if updated, false on failure
   */
  async updateWorkItemState(workItemId, state) {
    if (!this.isConfigured() || !workItemId) {
      return false;
    }

    try {
      const args = [
        'boards', 'work-item', 'update',
        '--id', workItemId.toString(),
        '--state', state,
        '--organization', `https://dev.azure.com/${this.organization}`,
        '--project', this.project
      ];

      execFileSync('az', args);

      return true;
    } catch (error) {
      console.warn('⚠ Failed to update work item state:', error.message);
      return false;
    }
  }

  /**
   * Update work item tags
   *
   * @param {number} workItemId - Work item ID
   * @param {Array<string>} tags - New tags to set
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  async updateWorkItemTags(workItemId, tags) {
    if (!this.isConfigured() || !workItemId) {
      return false;
    }

    try {
      const tagString = tags.join(';');

      const args = [
        'boards', 'work-item', 'update',
        '--id', workItemId.toString(),
        '--fields', `System.Tags=${tagString}`,
        '--organization', `https://dev.azure.com/${this.organization}`,
        '--project', this.project
      ];

      execFileSync('az', args);

      return true;
    } catch (error) {
      console.warn('⚠ Failed to update work item tags:', error.message);
      return false;
    }
  }

  /**
   * Add a comment to work item (as discussion)
   *
   * @param {number} workItemId - Work item ID
   * @param {string} comment - Comment text
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  async addWorkItemComment(workItemId, comment) {
    if (!this.isConfigured() || !workItemId) {
      return false;
    }

    try {
      // In Azure Boards, comments are added via the --discussion flag
      const args = [
        'boards', 'work-item', 'update',
        '--id', workItemId.toString(),
        '--discussion', comment,
        '--organization', `https://dev.azure.com/${this.organization}`,
        '--project', this.project
      ];

      execFileSync('az', args);

      return true;
    } catch (error) {
      console.warn('⚠ Failed to add work item comment:', error.message);
      return false;
    }
  }

  /**
   * Close a work item with optional comment
   *
   * @param {number} workItemId - Work item ID
   * @param {string|null} comment - Optional closing comment
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  async closeWorkItem(workItemId, comment = null) {
    if (!this.isConfigured() || !workItemId) {
      return false;
    }

    try {
      // Add comment first if provided
      if (comment) {
        await this.addWorkItemComment(workItemId, comment);
      }

      // Close the work item by setting state to 'Closed'
      return await this.updateWorkItemState(workItemId, 'Closed');
    } catch (error) {
      console.warn('⚠ Failed to close work item:', error.message);
      return false;
    }
  }

  /**
   * Get work item details
   *
   * @param {number} workItemId - Work item ID
   * @returns {Promise<Object|null>} Work item object or null
   */
  async getWorkItem(workItemId) {
    if (!this.isConfigured() || !workItemId) {
      return null;
    }

    try {
      const args = [
        'boards', 'work-item', 'show',
        '--id', workItemId.toString(),
        '--organization', `https://dev.azure.com/${this.organization}`,
        '--project', this.project,
        '--output', 'json'
      ];

      const result = execFileSync('az', args, { encoding: 'utf8' });

      return JSON.parse(result);
    } catch (error) {
      console.warn('⚠ Failed to get work item:', error.message);
      return null;
    }
  }
}
