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
 * PlatformDetector - Detects whether repository is GitHub or Azure DevOps
 *
 * Single Responsibility: Platform detection and identification
 *
 * Detection hierarchy:
 * 1. User config override (highest priority)
 * 2. Git remote URL parsing
 * 3. .git/config file inspection
 * 4. Feature flags inference
 * 5. Default (GitHub)
 */
export class PlatformDetector {
  /**
   * Cached detection result for performance
   * @private
   */
  static _cachedPlatform = null;

  /**
   * Initialize detector with project root
   *
   * @param {string} projectRoot - Project root directory
   */
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  /**
   * Detect platform with caching
   *
   * @param {boolean} useCache - Whether to use cached result
   * @returns {string|null} Platform name ('github', 'azure', or null)
   */
  static detect(useCache = true, projectRoot = process.cwd()) {
    if (useCache && this._cachedPlatform) {
      return this._cachedPlatform;
    }

    const detector = new PlatformDetector(projectRoot);
    const platform = detector.performDetection();

    this._cachedPlatform = platform;
    return platform;
  }

  /**
   * Clear cached detection result
   */
  static clearCache() {
    this._cachedPlatform = null;
  }

  /**
   * Perform platform detection
   *
   * @private
   * @returns {string|null} Platform name or null
   */
  performDetection() {
    // Priority 0: User override
    const override = this.checkUserOverride();
    if (override) {
      return override;
    }

    // Priority 1: Git remote URL
    try {
      const remote = execSync('git remote get-url origin', {
        cwd: this.projectRoot,
        encoding: 'utf-8',
        stdio: 'pipe'
      }).trim();

      const platform = PlatformDetector.parseRemoteURL(remote);
      if (platform) {
        return platform;
      }
    } catch (error) {
      // Git command failed, try next method
    }

    // Priority 2: .git/config file
    try {
      const gitConfigPath = path.join(this.projectRoot, '.git', 'config');
      if (fs.existsSync(gitConfigPath)) {
        const gitConfig = fs.readFileSync(gitConfigPath, 'utf-8');
        const url = this.extractURLFromConfig(gitConfig);
        if (url) {
          const platform = PlatformDetector.parseRemoteURL(url);
          if (platform) {
            return platform;
          }
        }
      }
    } catch (error) {
      // File read failed, try next method
    }

    // Priority 3: Feature flags
    const flagged = this.detectFromFeatureFlags();
    if (flagged) {
      return flagged;
    }

    // No detection possible
    return null;
  }

  /**
   * Parse remote URL to detect platform
   *
   * @param {string} url - Git remote URL
   * @returns {string|null} Platform name ('github', 'azure', or null)
   */
  static parseRemoteURL(url) {
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return null;
    }

    const normalizedURL = url.toLowerCase();

    // GitHub patterns
    if (normalizedURL.includes('github.com')) {
      return 'github';
    }

    // Azure DevOps patterns
    if (normalizedURL.includes('dev.azure.com') ||
        normalizedURL.includes('visualstudio.com')) {
      return 'azure';
    }

    // Unknown platform
    return null;
  }

  /**
   * Extract URL from .git/config content
   *
   * @param {string} configContent - Content of .git/config file
   * @returns {string|null} Remote URL or null
   */
  extractURLFromConfig(configContent) {
    // Look for origin remote URL
    const urlMatch = configContent.match(/\[remote "origin"\][\s\S]*?url\s*=\s*(.+)/);
    if (urlMatch && urlMatch[1]) {
      return urlMatch[1].trim();
    }
    return null;
  }

  /**
   * Check for user config override
   *
   * @returns {string|null} Platform override or null
   */
  checkUserOverride() {
    const config = this.loadSettings();

    if (config.platform &&
        config.platform.type &&
        config.platform.autoDetect === false) {
      return config.platform.type;
    }

    return null;
  }

  /**
   * Detect platform from feature flags
   *
   * @returns {string|null} Platform inferred from flags or null
   */
  detectFromFeatureFlags() {
    const config = this.loadSettings();

    const githubEnabled = config.github?.enabled === true;
    const azureEnabled = config.azureDevOps?.enabled === true;

    // Only one enabled - clear choice
    if (githubEnabled && !azureEnabled) {
      return 'github';
    }

    if (azureEnabled && !githubEnabled) {
      return 'azure';
    }

    // Both enabled - default to GitHub with warning
    if (githubEnabled && azureEnabled) {
      console.warn('⚠️  Both GitHub and Azure are enabled. Defaulting to GitHub.');
      console.warn('   Set platform.type in settings.json to override.');
      return 'github';
    }

    // Neither enabled
    return null;
  }

  /**
   * Load settings from .claude directory
   *
   * @returns {Object} Merged settings object
   */
  loadSettings() {
    const settings = {};

    // Load from settings.json
    const settingsPath = path.join(this.projectRoot, '.claude', 'settings.json');
    if (fs.existsSync(settingsPath)) {
      try {
        const fileSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
        Object.assign(settings, fileSettings);
      } catch (error) {
        // Ignore parse errors
      }
    }

    // Load from settings.local.json (overrides)
    const localSettingsPath = path.join(this.projectRoot, '.claude', 'settings.local.json');
    if (fs.existsSync(localSettingsPath)) {
      try {
        const localSettings = JSON.parse(fs.readFileSync(localSettingsPath, 'utf-8'));
        Object.assign(settings, localSettings);
      } catch (error) {
        // Ignore parse errors
      }
    }

    return settings;
  }

  /**
   * Get human-readable platform name
   *
   * @param {string} platform - Platform identifier
   * @returns {string} Human-readable name
   */
  static getPlatformName(platform) {
    const names = {
      'github': 'GitHub',
      'azure': 'Azure DevOps'
    };
    return names[platform] || 'Unknown';
  }

  /**
   * Check if platform is supported
   *
   * @param {string} platform - Platform identifier
   * @returns {boolean} True if supported
   */
  static isSupported(platform) {
    return platform === 'github' || platform === 'azure';
  }
}
