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
 * TaskWorkItemMapper - Maps internal tasks to Azure DevOps work items
 *
 * Single Responsibility: Convert task format to Azure work item format
 *
 * CRITICAL: Completely isolated from GitHub integration
 * - No imports from GitHub folder
 * - Independent mapping logic
 * - Azure-specific format
 */
export class TaskWorkItemMapper {
  /**
   * Convert task to Azure DevOps work item title
   *
   * @param {Object} task - Task object
   * @returns {string} Work item title
   */
  static taskToWorkItemTitle(task) {
    return `[${task.id}] ${task.title}`;
  }

  /**
   * Convert task to Azure DevOps work item description
   *
   * @param {Object} task - Task object
   * @returns {string} Work item description (HTML format)
   */
  static taskToWorkItemDescription(task) {
    let description = `<h2>${task.title}</h2>\n\n`;

    if (task.description) {
      description += `<p>${task.description}</p>\n\n`;
    }

    if (task.phase) {
      description += `<p><strong>Phase:</strong> ${task.phase}</p>\n`;
    }

    if (task.estimatedHours) {
      description += `<p><strong>Estimated Hours:</strong> ${task.estimatedHours}</p>\n\n`;
    }

    if (task.completionCriteria && task.completionCriteria.length > 0) {
      description += `<h3>Completion Criteria</h3>\n<ul>\n`;
      task.completionCriteria.forEach(criterion => {
        description += `  <li>${criterion}</li>\n`;
      });
      description += `</ul>\n\n`;
    }

    if (task.testCases && task.testCases.length > 0) {
      description += `<h3>Test Cases</h3>\n<ul>\n`;
      task.testCases.forEach(testCase => {
        description += `  <li>${testCase}</li>\n`;
      });
      description += `</ul>\n`;
    }

    return description;
  }

  /**
   * Convert task status to Azure DevOps work item state
   *
   * @param {string} status - Task status (pending, in_progress, completed, blocked)
   * @returns {string} Azure work item state
   */
  static taskStatusToWorkItemState(status) {
    const stateMap = {
      'pending': 'New',
      'in_progress': 'Active',
      'completed': 'Closed',
      'blocked': 'Blocked'
    };

    return stateMap[status] || 'New';
  }

  /**
   * Convert task to Azure DevOps work item tags
   *
   * @param {string} status - Task status
   * @param {string} phase - Task phase (optional)
   * @returns {Array<string>} Tags array
   */
  static taskToWorkItemTags(status, phase = null) {
    const tags = [`status: ${status}`];

    if (phase) {
      tags.push(`phase: ${phase}`);
    }

    return tags;
  }

  /**
   * Get work item type based on task phase
   *
   * @param {string} phase - Task phase
   * @returns {string} Azure work item type
   */
  static phaseToWorkItemType(phase) {
    const typeMap = {
      'design': 'User Story',
      'implementation': 'Task',
      'testing': 'Task',
      'deployment': 'Task'
    };

    return typeMap[phase] || 'Task';
  }
}
