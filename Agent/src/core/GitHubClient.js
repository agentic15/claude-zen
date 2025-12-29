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

import { Octokit } from '@octokit/rest';

/**
 * GitHubClient - Handles all GitHub API interactions
 *
 * Single Responsibility: Communicate with GitHub Issues API
 *
 * This class encapsulates all GitHub API calls and provides graceful
 * degradation when GitHub integration is unavailable or disabled.
 */
export class GitHubClient {
  /**
   * Initialize GitHub client
   *
   * @param {string|null} token - GitHub Personal Access Token
   * @param {string|null} owner - Repository owner
   * @param {string|null} repo - Repository name
   */
  constructor(token, owner, repo) {
    if (!token || !owner || !repo) {
      this.configured = false;
      this.octokit = null;
      this.owner = null;
      this.repo = null;
      return;
    }

    this.configured = true;
    this.octokit = new Octokit({ auth: token });
    this.owner = owner;
    this.repo = repo;
  }

  /**
   * Check if GitHub client is configured and ready
   *
   * @returns {boolean} True if configured, false otherwise
   */
  isConfigured() {
    return this.configured;
  }

  /**
   * Create a new GitHub issue
   *
   * @param {string} title - Issue title
   * @param {string} body - Issue body (markdown supported)
   * @param {string[]} labels - Array of label names
   * @returns {Promise<number|null>} Issue number if created, null on failure
   */
  async createIssue(title, body, labels = []) {
    if (!this.configured) {
      return null;
    }

    try {
      const response = await this.octokit.issues.create({
        owner: this.owner,
        repo: this.repo,
        title,
        body,
        labels
      });
      return response.data.number;
    } catch (error) {
      console.warn('⚠ Failed to create GitHub issue:', error.message);
      return null;
    }
  }

  /**
   * Update labels on an existing GitHub issue
   *
   * @param {number} issueNumber - Issue number
   * @param {string[]} labels - Array of label names to set
   * @returns {Promise<boolean>} True if updated, false on failure
   */
  async updateIssueLabels(issueNumber, labels) {
    if (!this.configured || !issueNumber) {
      return false;
    }

    try {
      await this.octokit.issues.update({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
        labels
      });
      return true;
    } catch (error) {
      console.warn('⚠ Failed to update issue labels:', error.message);
      return false;
    }
  }

  /**
   * Add a comment to an existing GitHub issue
   *
   * @param {number} issueNumber - Issue number
   * @param {string} comment - Comment text (markdown supported)
   * @returns {Promise<boolean>} True if added, false on failure
   */
  async addIssueComment(issueNumber, comment) {
    if (!this.configured || !issueNumber) {
      return false;
    }

    try {
      await this.octokit.issues.createComment({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
        body: comment
      });
      return true;
    } catch (error) {
      console.warn('⚠ Failed to add issue comment:', error.message);
      return false;
    }
  }

  /**
   * Close a GitHub issue with optional comment
   *
   * @param {number} issueNumber - Issue number
   * @param {string|null} comment - Optional closing comment
   * @returns {Promise<boolean>} True if closed, false on failure
   */
  async closeIssue(issueNumber, comment = null) {
    if (!this.configured || !issueNumber) {
      return false;
    }

    try {
      // Add comment first if provided
      if (comment) {
        await this.addIssueComment(issueNumber, comment);
      }

      // Close the issue
      await this.octokit.issues.update({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
        state: 'closed'
      });
      return true;
    } catch (error) {
      console.warn('⚠ Failed to close issue:', error.message);
      return false;
    }
  }
}
