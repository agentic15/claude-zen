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
 * AzureDevOpsClient - Handles Azure DevOps API operations
 *
 * Single Responsibility: Interact with Azure DevOps Work Items API
 *
 * CRITICAL: Completely isolated from GitHub integration
 * - Uses separate configuration (AzureDevOpsConfig)
 * - Uses separate authentication (Azure PAT tokens)
 * - No shared state with GitHub client
 */
export class AzureDevOpsClient {
  /**
   * Initialize Azure DevOps client
   *
   * @param {Object} config - AzureDevOpsConfig instance
   */
  constructor(config) {
    this.config = config;
    this.apiVersion = '7.0';
  }

  /**
   * Check if client is properly configured
   *
   * @returns {boolean} True if configured, false otherwise
   */
  isConfigured() {
    return this.config && this.config.isEnabled();
  }

  /**
   * Get base URL for Azure DevOps API
   *
   * @returns {string} Base URL
   */
  getBaseUrl() {
    const org = this.config.getOrganization();
    const project = this.config.getProject();
    return `https://dev.azure.com/${org}/${project}/_apis`;
  }

  /**
   * Get authorization header for API requests
   *
   * @returns {Object} Authorization header
   */
  getAuthHeader() {
    const token = this.config.getToken();
    const encoded = Buffer.from(`:${token}`).toString('base64');
    return {
      'Authorization': `Basic ${encoded}`,
      'Content-Type': 'application/json-patch+json'
    };
  }

  /**
   * Create a work item in Azure DevOps
   *
   * @param {string} title - Work item title
   * @param {string} description - Work item description
   * @param {Array<string>} tags - Work item tags (optional)
   * @param {string} workItemType - Work item type (default: 'Task')
   * @returns {Promise<Object|null>} Work item object with { id, url } or null if failed
   */
  async createWorkItem(title, description, tags = [], workItemType = 'Task') {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const url = `${this.getBaseUrl()}/wit/workitems/$${workItemType}?api-version=${this.apiVersion}`;

      // Build JSON Patch document
      const patchDocument = [
        {
          op: 'add',
          path: '/fields/System.Title',
          value: title
        },
        {
          op: 'add',
          path: '/fields/System.Description',
          value: description
        }
      ];

      // Add tags if provided
      if (tags && tags.length > 0) {
        patchDocument.push({
          op: 'add',
          path: '/fields/System.Tags',
          value: tags.join('; ')
        });
      }

      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.getAuthHeader(),
        body: JSON.stringify(patchDocument)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Azure DevOps API error: ${response.status} - ${errorText}`);
      }

      const workItem = await response.json();
      return {
        id: workItem.id,
        url: workItem._links.html.href
      };
    } catch (error) {
      console.error('Failed to create Azure DevOps work item:', error.message);
      return null;
    }
  }

  /**
   * Update work item tags in Azure DevOps
   *
   * @param {number} workItemId - Work item ID
   * @param {Array<string>} tags - New tags to set
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  async updateWorkItemTags(workItemId, tags) {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      const url = `${this.getBaseUrl()}/wit/workitems/${workItemId}?api-version=${this.apiVersion}`;

      const patchDocument = [
        {
          op: 'add',
          path: '/fields/System.Tags',
          value: tags.join('; ')
        }
      ];

      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.getAuthHeader(),
        body: JSON.stringify(patchDocument)
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to update work item tags:', error.message);
      return false;
    }
  }

  /**
   * Add comment to work item
   *
   * @param {number} workItemId - Work item ID
   * @param {string} comment - Comment text
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  async addWorkItemComment(workItemId, comment) {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      const url = `${this.getBaseUrl()}/wit/workitems/${workItemId}/comments?api-version=${this.apiVersion}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...this.getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: comment })
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to add work item comment:', error.message);
      return false;
    }
  }

  /**
   * Close a work item
   *
   * @param {number} workItemId - Work item ID
   * @param {string} comment - Optional closing comment
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  async closeWorkItem(workItemId, comment = null) {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      const url = `${this.getBaseUrl()}/wit/workitems/${workItemId}?api-version=${this.apiVersion}`;

      const patchDocument = [
        {
          op: 'add',
          path: '/fields/System.State',
          value: 'Closed'
        }
      ];

      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.getAuthHeader(),
        body: JSON.stringify(patchDocument)
      });

      // Add comment if provided
      if (response.ok && comment) {
        await this.addWorkItemComment(workItemId, comment);
      }

      return response.ok;
    } catch (error) {
      console.error('Failed to close work item:', error.message);
      return false;
    }
  }
}
