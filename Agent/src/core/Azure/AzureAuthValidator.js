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

import { execSync } from 'child_process';

/**
 * AzureAuthValidator - Validates Azure DevOps authentication setup
 *
 * Single Responsibility: Check and validate Azure CLI authentication
 */
export class AzureAuthValidator {
  /**
   * Check if Azure CLI is installed
   *
   * @returns {boolean} True if installed, false otherwise
   */
  static isAzureCliInstalled() {
    try {
      execSync('az --version', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if Azure DevOps extension is installed
   *
   * @returns {boolean} True if installed, false otherwise
   */
  static isAzureDevOpsExtensionInstalled() {
    try {
      const result = execSync('az extension list --output json', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      const extensions = JSON.parse(result);
      return extensions.some(ext => ext.name === 'azure-devops');
    } catch {
      return false;
    }
  }

  /**
   * Check if user is authenticated with Azure CLI
   *
   * @returns {boolean} True if authenticated, false otherwise
   */
  static isAuthenticated() {
    try {
      execSync('az account show', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current Azure account info
   *
   * @returns {Object|null} Account info or null if not authenticated
   */
  static getAccountInfo() {
    try {
      const result = execSync('az account show --output json', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return JSON.parse(result);
    } catch {
      return null;
    }
  }

  /**
   * Check if Azure DevOps defaults are configured
   *
   * @returns {Object} { organization: string|null, project: string|null }
   */
  static getAzureDevOpsDefaults() {
    try {
      const result = execSync('az devops configure --list', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const defaults = {
        organization: null,
        project: null
      };

      // Parse output like:
      // organization=https://dev.azure.com/myorg
      // project=myproject
      const orgMatch = result.match(/organization\s*=\s*(.+)/);
      const projectMatch = result.match(/project\s*=\s*(.+)/);

      if (orgMatch) {
        defaults.organization = orgMatch[1].trim();
      }
      if (projectMatch) {
        defaults.project = projectMatch[1].trim();
      }

      return defaults;
    } catch {
      return { organization: null, project: null };
    }
  }

  /**
   * Validate complete Azure DevOps setup
   *
   * @returns {Object} Validation results with detailed status
   */
  static validateSetup() {
    const results = {
      cliInstalled: false,
      extensionInstalled: false,
      authenticated: false,
      accountInfo: null,
      defaultsConfigured: false,
      organization: null,
      project: null,
      ready: false,
      errors: [],
      warnings: []
    };

    // Check 1: Azure CLI installed
    results.cliInstalled = this.isAzureCliInstalled();
    if (!results.cliInstalled) {
      results.errors.push('Azure CLI not installed');
      return results; // Can't proceed without CLI
    }

    // Check 2: Azure DevOps extension installed
    results.extensionInstalled = this.isAzureDevOpsExtensionInstalled();
    if (!results.extensionInstalled) {
      results.warnings.push('Azure DevOps extension not installed');
      results.warnings.push('Run: az extension add --name azure-devops');
    }

    // Check 3: Authenticated
    results.authenticated = this.isAuthenticated();
    if (!results.authenticated) {
      results.errors.push('Not authenticated with Azure CLI');
      results.errors.push('Run: az login');
      return results; // Can't proceed without authentication
    }

    // Get account info
    results.accountInfo = this.getAccountInfo();

    // Check 4: Azure DevOps defaults configured
    const defaults = this.getAzureDevOpsDefaults();
    results.organization = defaults.organization;
    results.project = defaults.project;

    if (defaults.organization && defaults.project) {
      results.defaultsConfigured = true;
      results.ready = true;
    } else {
      if (!defaults.organization) {
        results.warnings.push('Azure DevOps organization not configured');
        results.warnings.push('Run: az devops configure --defaults organization=https://dev.azure.com/YOUR-ORG');
      }
      if (!defaults.project) {
        results.warnings.push('Azure DevOps project not configured');
        results.warnings.push('Run: az devops configure --defaults project=YOUR-PROJECT');
      }
    }

    return results;
  }

  /**
   * Print validation results to console
   *
   * @param {Object} results - Results from validateSetup()
   */
  static printValidationResults(results) {
    console.log('\n=== Azure DevOps Authentication Status ===\n');

    // CLI Installation
    if (results.cliInstalled) {
      console.log('✓ Azure CLI installed');
    } else {
      console.log('✗ Azure CLI not installed');
      console.log('  Install: https://learn.microsoft.com/en-us/cli/azure/install-azure-cli\n');
      return; // Don't show more if CLI not installed
    }

    // Extension Installation
    if (results.extensionInstalled) {
      console.log('✓ Azure DevOps extension installed');
    } else {
      console.log('⚠ Azure DevOps extension not installed');
      console.log('  Run: az extension add --name azure-devops');
    }

    // Authentication
    if (results.authenticated) {
      console.log('✓ Authenticated with Azure CLI');
      if (results.accountInfo) {
        console.log(`  Account: ${results.accountInfo.user?.name || 'Unknown'}`);
        console.log(`  Subscription: ${results.accountInfo.name || 'Unknown'}`);
      }
    } else {
      console.log('✗ Not authenticated with Azure CLI');
      console.log('  Run: az login\n');
      return; // Don't show more if not authenticated
    }

    // Azure DevOps Configuration
    if (results.defaultsConfigured) {
      console.log('✓ Azure DevOps defaults configured');
      console.log(`  Organization: ${results.organization}`);
      console.log(`  Project: ${results.project}`);
    } else {
      console.log('⚠ Azure DevOps defaults not fully configured');
      if (!results.organization) {
        console.log('  Missing organization - Run:');
        console.log('    az devops configure --defaults organization=https://dev.azure.com/YOUR-ORG');
      }
      if (!results.project) {
        console.log('  Missing project - Run:');
        console.log('    az devops configure --defaults project=YOUR-PROJECT');
      }
    }

    // Overall Status
    console.log('\n--- Overall Status ---\n');
    if (results.ready) {
      console.log('✅ Ready to use Azure DevOps integration!\n');
    } else {
      console.log('⚠️  Setup incomplete. Follow the steps above.\n');
    }

    // Errors
    if (results.errors.length > 0) {
      console.log('Errors:');
      results.errors.forEach(error => console.log(`  - ${error}`));
      console.log('');
    }

    // Warnings
    if (results.warnings.length > 0 && results.errors.length === 0) {
      console.log('Warnings:');
      results.warnings.forEach(warning => console.log(`  - ${warning}`));
      console.log('');
    }
  }

  /**
   * Get setup instructions for users
   *
   * @returns {string} Setup instructions
   */
  static getSetupInstructions() {
    return `
Azure DevOps Setup Instructions:

1. Install Azure CLI:
   - macOS: brew install azure-cli
   - Windows: Download from https://aka.ms/installazurecliwindows
   - Linux: curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

2. Verify installation:
   az --version

3. Login to Azure:
   az login

4. Install Azure DevOps extension:
   az extension add --name azure-devops

5. Configure Azure DevOps defaults:
   az devops configure --defaults organization=https://dev.azure.com/YOUR-ORG
   az devops configure --defaults project=YOUR-PROJECT

6. Verify setup:
   az devops configure --list

7. Test work item access:
   az boards work-item list --output table

For more information, see:
https://learn.microsoft.com/en-us/azure/devops/cli/
`;
  }
}
