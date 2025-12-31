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

import fs from 'fs';
import path from 'path';

/**
 * AzureDevOpsConfig - Manages Azure DevOps integration configuration
 *
 * Single Responsibility: Load and validate Azure DevOps settings
 *
 * Configuration sources (in order of priority):
 * 1. Environment variables (highest)
 * 2. .claude/settings.local.json (user-specific, gitignored)
 * 3. .claude/settings.json (defaults)
 *
 * CRITICAL: Completely isolated from GitHub integration
 */
export class AzureDevOpsConfig {
  /**
   * Initialize configuration loader
   *
   * @param {string} projectRoot - Project root directory
   */
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
    this.config = this.loadConfig();
  }

  /**
   * Load configuration from all sources
   *
   * @returns {Object} Merged configuration object
   */
  loadConfig() {
    const config = {
      enabled: false, // Default to disabled for safety
      token: null,
      organization: null,
      project: null,
      autoCreate: false,
      autoUpdate: false,
      autoClose: false
    };

    // Load from settings.json (defaults)
    const settingsPath = path.join(this.projectRoot, '.claude', 'settings.json');
    if (fs.existsSync(settingsPath)) {
      try {
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        if (settings.azureDevOps) {
          Object.assign(config, settings.azureDevOps);
        }
      } catch (error) {
        console.warn('⚠ Failed to load .claude/settings.json:', error.message);
      }
    }

    // Load from settings.local.json (user overrides)
    const localSettingsPath = path.join(this.projectRoot, '.claude', 'settings.local.json');
    if (fs.existsSync(localSettingsPath)) {
      try {
        const localSettings = JSON.parse(fs.readFileSync(localSettingsPath, 'utf8'));
        if (localSettings.azureDevOps) {
          Object.assign(config, localSettings.azureDevOps);
        }
      } catch (error) {
        console.warn('⚠ Failed to load .claude/settings.local.json:', error.message);
      }
    }

    // Override with environment variables (highest priority)
    if (process.env.AZURE_DEVOPS_PAT) {
      config.token = process.env.AZURE_DEVOPS_PAT;
    }
    if (process.env.AZURE_DEVOPS_ORGANIZATION) {
      config.organization = process.env.AZURE_DEVOPS_ORGANIZATION;
    }
    if (process.env.AZURE_DEVOPS_PROJECT) {
      config.project = process.env.AZURE_DEVOPS_PROJECT;
    }
    if (process.env.AZURE_DEVOPS_ENABLED !== undefined) {
      config.enabled = process.env.AZURE_DEVOPS_ENABLED === 'true';
    }
    if (process.env.AZURE_DEVOPS_AUTO_CREATE !== undefined) {
      config.autoCreate = process.env.AZURE_DEVOPS_AUTO_CREATE === 'true';
    }
    if (process.env.AZURE_DEVOPS_AUTO_UPDATE !== undefined) {
      config.autoUpdate = process.env.AZURE_DEVOPS_AUTO_UPDATE === 'true';
    }
    if (process.env.AZURE_DEVOPS_AUTO_CLOSE !== undefined) {
      config.autoClose = process.env.AZURE_DEVOPS_AUTO_CLOSE === 'true';
    }

    return config;
  }

  /**
   * Get Azure DevOps Personal Access Token
   *
   * @returns {string|null} Token or null if not configured
   */
  getToken() {
    return this.config.token;
  }

  /**
   * Get organization name
   *
   * @returns {string|null} Organization or null if not configured
   */
  getOrganization() {
    return this.config.organization;
  }

  /**
   * Get project name
   *
   * @returns {string|null} Project or null if not configured
   */
  getProject() {
    return this.config.project;
  }

  /**
   * Get organization and project info
   *
   * @returns {Object} { organization: string|null, project: string|null }
   */
  getProjectInfo() {
    return {
      organization: this.config.organization,
      project: this.config.project
    };
  }

  /**
   * Check if Azure DevOps integration is fully enabled and configured
   *
   * @returns {boolean} True if ready to use, false otherwise
   */
  isEnabled() {
    return this.config.enabled &&
           this.config.token !== null &&
           this.config.organization !== null &&
           this.config.project !== null;
  }

  /**
   * Check if auto-create work items feature is enabled
   *
   * @returns {boolean} True if enabled, false otherwise
   */
  isAutoCreateEnabled() {
    return this.isEnabled() && this.config.autoCreate;
  }

  /**
   * Check if auto-update work items feature is enabled
   *
   * @returns {boolean} True if enabled, false otherwise
   */
  isAutoUpdateEnabled() {
    return this.isEnabled() && this.config.autoUpdate;
  }

  /**
   * Check if auto-close work items feature is enabled
   *
   * @returns {boolean} True if enabled, false otherwise
   */
  isAutoCloseEnabled() {
    return this.isEnabled() && this.config.autoClose;
  }
}
