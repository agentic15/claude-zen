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

import { AzureDevOpsConfig } from './AzureDevOpsConfig.js';
import { AzureDevOpsClient } from './AzureDevOpsClient.js';
import { TaskWorkItemMapper } from './TaskWorkItemMapper.js';

/**
 * WorkItemSync - Synchronizes tasks with Azure DevOps work items
 *
 * Single Responsibility: Orchestrate work item operations based on task lifecycle
 *
 * Handles:
 * - Auto-create work items when tasks are created
 * - Auto-update work items when task status changes
 * - Auto-close work items when tasks are completed
 */
export class WorkItemSync {
  /**
   * Initialize work item sync
   *
   * @param {string} projectRoot - Project root directory
   */
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
    this.config = new AzureDevOpsConfig(projectRoot);

    // Initialize client if config is valid
    if (this.config.isEnabled()) {
      this.client = new AzureDevOpsClient(
        this.config.getOrganization(),
        this.config.getProject()
      );
    } else {
      this.client = null;
    }
  }

  /**
   * Check if work item sync is enabled and configured
   *
   * @returns {boolean} True if ready to sync, false otherwise
   */
  isEnabled() {
    return this.config.isEnabled() && this.client && this.client.isConfigured();
  }

  /**
   * Create a work item for a new task
   *
   * @param {Object} task - Task object
   * @returns {Promise<number|null>} Work item ID or null
   */
  async createWorkItem(task) {
    if (!this.config.isAutoCreateEnabled()) {
      return null;
    }

    if (!this.isEnabled()) {
      return null;
    }

    try {
      const title = TaskWorkItemMapper.taskToWorkItemTitle(task);
      const description = TaskWorkItemMapper.taskToWorkItemDescription(task);
      const tags = TaskWorkItemMapper.taskToWorkItemTags(task);

      const workItemId = await this.client.createWorkItem(title, description, tags);

      if (workItemId) {
        console.log(`✓ Created Azure work item #${workItemId} for task ${task.id}`);
      }

      return workItemId;
    } catch (error) {
      console.warn('⚠ Failed to create work item:', error.message);
      return null;
    }
  }

  /**
   * Update work item when task status changes
   *
   * @param {Object} task - Task object with updated status
   * @param {number} workItemId - Work item ID
   * @returns {Promise<boolean>} True if updated, false otherwise
   */
  async updateWorkItemStatus(task, workItemId) {
    if (!this.config.isAutoUpdateEnabled()) {
      return false;
    }

    if (!this.isEnabled() || !workItemId) {
      return false;
    }

    try {
      const state = TaskWorkItemMapper.taskStatusToWorkItemState(task.status);
      const success = await this.client.updateWorkItemState(workItemId, state);

      if (success) {
        console.log(`✓ Updated Azure work item #${workItemId} to state: ${state}`);
      }

      return success;
    } catch (error) {
      console.warn('⚠ Failed to update work item status:', error.message);
      return false;
    }
  }

  /**
   * Update work item tags
   *
   * @param {Object} task - Task object
   * @param {number} workItemId - Work item ID
   * @returns {Promise<boolean>} True if updated, false otherwise
   */
  async updateWorkItemTags(task, workItemId) {
    if (!this.config.isAutoUpdateEnabled()) {
      return false;
    }

    if (!this.isEnabled() || !workItemId) {
      return false;
    }

    try {
      const tags = TaskWorkItemMapper.taskToWorkItemTags(task);
      const success = await this.client.updateWorkItemTags(workItemId, tags);

      if (success) {
        console.log(`✓ Updated Azure work item #${workItemId} tags`);
      }

      return success;
    } catch (error) {
      console.warn('⚠ Failed to update work item tags:', error.message);
      return false;
    }
  }

  /**
   * Add comment to work item
   *
   * @param {number} workItemId - Work item ID
   * @param {string} comment - Comment text
   * @returns {Promise<boolean>} True if added, false otherwise
   */
  async addWorkItemComment(workItemId, comment) {
    if (!this.isEnabled() || !workItemId) {
      return false;
    }

    try {
      const success = await this.client.addWorkItemComment(workItemId, comment);

      if (success) {
        console.log(`✓ Added comment to Azure work item #${workItemId}`);
      }

      return success;
    } catch (error) {
      console.warn('⚠ Failed to add work item comment:', error.message);
      return false;
    }
  }

  /**
   * Close work item when task is completed
   *
   * @param {Object} task - Completed task object
   * @param {number} workItemId - Work item ID
   * @param {string} comment - Optional closing comment
   * @returns {Promise<boolean>} True if closed, false otherwise
   */
  async closeWorkItem(task, workItemId, comment = null) {
    if (!this.config.isAutoCloseEnabled()) {
      return false;
    }

    if (!this.isEnabled() || !workItemId) {
      return false;
    }

    try {
      const closingComment = comment || `Task ${task.id} completed`;
      const success = await this.client.closeWorkItem(workItemId, closingComment);

      if (success) {
        console.log(`✓ Closed Azure work item #${workItemId}`);
      }

      return success;
    } catch (error) {
      console.warn('⚠ Failed to close work item:', error.message);
      return false;
    }
  }

  /**
   * Sync task lifecycle with work item
   *
   * Handles complete task lifecycle:
   * - Creates work item for new tasks
   * - Updates state when task status changes
   * - Closes work item when task completes
   *
   * @param {Object} task - Task object
   * @param {number|null} workItemId - Existing work item ID (if any)
   * @param {string} action - Action: 'create', 'update', 'complete'
   * @returns {Promise<number|null>} Work item ID
   */
  async syncTask(task, workItemId = null, action = 'create') {
    if (!this.isEnabled()) {
      return null;
    }

    try {
      switch (action) {
        case 'create':
          // Create new work item for task
          return await this.createWorkItem(task);

        case 'update':
          // Update existing work item
          if (workItemId) {
            await this.updateWorkItemStatus(task, workItemId);
            await this.updateWorkItemTags(task, workItemId);
          }
          return workItemId;

        case 'complete':
          // Close work item when task completes
          if (workItemId) {
            await this.closeWorkItem(task, workItemId);
          }
          return workItemId;

        default:
          console.warn(`⚠ Unknown sync action: ${action}`);
          return workItemId;
      }
    } catch (error) {
      console.warn('⚠ Failed to sync task with work item:', error.message);
      return workItemId;
    }
  }

  /**
   * Batch sync multiple tasks
   *
   * @param {Array<Object>} tasks - Array of task objects
   * @param {string} action - Action to perform on all tasks
   * @returns {Promise<Map<string, number>>} Map of task IDs to work item IDs
   */
  async syncTasks(tasks, action = 'update') {
    if (!this.isEnabled()) {
      return new Map();
    }

    const results = new Map();

    for (const task of tasks) {
      const workItemId = await this.syncTask(task, task.workItemId, action);
      if (workItemId) {
        results.set(task.id, workItemId);
      }
    }

    return results;
  }

  /**
   * Get work item details
   *
   * @param {number} workItemId - Work item ID
   * @returns {Promise<Object|null>} Work item object or null
   */
  async getWorkItem(workItemId) {
    if (!this.isEnabled() || !workItemId) {
      return null;
    }

    try {
      return await this.client.getWorkItem(workItemId);
    } catch (error) {
      console.warn('⚠ Failed to get work item:', error.message);
      return null;
    }
  }

  /**
   * Check if work item exists and is accessible
   *
   * @param {number} workItemId - Work item ID
   * @returns {Promise<boolean>} True if exists, false otherwise
   */
  async workItemExists(workItemId) {
    const workItem = await this.getWorkItem(workItemId);
    return workItem !== null;
  }
}
