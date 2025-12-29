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
import { execSync } from 'child_process';

/**
 * GitHubConfig - Manages GitHub integration configuration
 *
 * Single Responsibility: Load and validate GitHub settings
 *
 * Token authentication sources (in order of priority):
 * 1. Environment variable GITHUB_TOKEN (highest)
 * 2. .claude/settings.local.json (user-specific, gitignored)
 * 3. .claude/settings.json (defaults)
 * 4. GitHub CLI (`gh auth token`) - automatic fallback if authenticated
 *
 * Other configuration sources:
 * 1. Environment variables (highest)
 * 2. .claude/settings.local.json (user-specific, gitignored)
 * 3. .claude/settings.json (defaults)
 * 4. Auto-detection from git remote (fallback for owner/repo)
 */
export class GitHubConfig {
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
      enabled: true,
      token: null,
      owner: null,
      repo: null,
      autoCreate: true,
      autoUpdate: true,
      autoClose: true
    };

    // Load from settings.json (defaults)
    const settingsPath = path.join(this.projectRoot, '.claude', 'settings.json');
    if (fs.existsSync(settingsPath)) {
      try {
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        if (settings.github) {
          Object.assign(config, settings.github);
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
        if (localSettings.github) {
          Object.assign(config, localSettings.github);
        }
      } catch (error) {
        console.warn('⚠ Failed to load .claude/settings.local.json:', error.message);
      }
    }

    // Override with environment variables (highest priority)
    if (process.env.GITHUB_TOKEN) {
      config.token = process.env.GITHUB_TOKEN;
    }
    if (process.env.GITHUB_OWNER) {
      config.owner = process.env.GITHUB_OWNER;
    }
    if (process.env.GITHUB_REPO) {
      config.repo = process.env.GITHUB_REPO;
    }
    if (process.env.GITHUB_ENABLED !== undefined) {
      config.enabled = process.env.GITHUB_ENABLED === 'true';
    }
    if (process.env.GITHUB_AUTO_CREATE !== undefined) {
      config.autoCreate = process.env.GITHUB_AUTO_CREATE === 'true';
    }
    if (process.env.GITHUB_AUTO_UPDATE !== undefined) {
      config.autoUpdate = process.env.GITHUB_AUTO_UPDATE === 'true';
    }
    if (process.env.GITHUB_AUTO_CLOSE !== undefined) {
      config.autoClose = process.env.GITHUB_AUTO_CLOSE === 'true';
    }

    // If no token configured, try to get it from GitHub CLI
    if (!config.token) {
      try {
        const cliToken = execSync('gh auth token', {
          encoding: 'utf8',
          stdio: 'pipe'
        }).trim();
        if (cliToken) {
          config.token = cliToken;
        }
      } catch (error) {
        // GitHub CLI not authenticated or not installed, continue without token
      }
    }

    // Auto-detect owner/repo from git remote if not configured
    if (!config.owner || !config.repo) {
      try {
        const remote = execSync('git remote get-url origin', {
          cwd: this.projectRoot,
          encoding: 'utf8'
        }).trim();

        // Parse GitHub URL formats:
        // - https://github.com/owner/repo.git
        // - git@github.com:owner/repo.git
        const match = remote.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
        if (match) {
          config.owner = config.owner || match[1];
          config.repo = config.repo || match[2];
        }
      } catch (error) {
        // Git remote not configured or not a git repository
        // This is okay - GitHub integration will be disabled
      }
    }

    return config;
  }

  /**
   * Get GitHub Personal Access Token
   *
   * @returns {string|null} Token or null if not configured
   */
  getToken() {
    return this.config.token;
  }

  /**
   * Get repository owner and name
   *
   * @returns {Object} { owner: string|null, repo: string|null }
   */
  getRepoInfo() {
    return {
      owner: this.config.owner,
      repo: this.config.repo
    };
  }

  /**
   * Check if GitHub integration is fully enabled and configured
   *
   * @returns {boolean} True if ready to use, false otherwise
   */
  isEnabled() {
    return this.config.enabled &&
           this.config.token !== null &&
           this.config.owner !== null &&
           this.config.repo !== null;
  }

  /**
   * Check if auto-create issues feature is enabled
   *
   * @returns {boolean} True if enabled, false otherwise
   */
  isAutoCreateEnabled() {
    return this.isEnabled() && this.config.autoCreate;
  }

  /**
   * Check if auto-update issues feature is enabled
   *
   * @returns {boolean} True if enabled, false otherwise
   */
  isAutoUpdateEnabled() {
    return this.isEnabled() && this.config.autoUpdate;
  }

  /**
   * Check if auto-close issues feature is enabled
   *
   * @returns {boolean} True if enabled, false otherwise
   */
  isAutoCloseEnabled() {
    return this.isEnabled() && this.config.autoClose;
  }
}
