#!/usr/bin/env node

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
 * Feature Flag Validation Tests (TDD)
 *
 * Tests for Azure DevOps feature flag configuration and GitHub/Azure isolation.
 * These tests are written BEFORE implementation to guide the development.
 *
 * CRITICAL REQUIREMENT: GitHub and Azure integrations must remain completely isolated.
 * Enabling Azure should NEVER affect GitHub functionality.
 */

import { GitHubConfig } from '../../src/core/GitHubConfig.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test results
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(`  ${error.message}`);
    failed++;
  }
}

async function testAsync(name, fn) {
  try {
    await fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(`  ${error.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

function assertDeepEqual(actual, expected, message) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    throw new Error(message || `Expected ${expectedStr}, got ${actualStr}`);
  }
}

// ===== Helper: Create temp settings file =====
function createTempSettings(settings) {
  const tempDir = path.join(__dirname, 'temp-test-' + Date.now());
  const claudeDir = path.join(tempDir, '.claude');
  fs.mkdirSync(claudeDir, { recursive: true });

  const settingsPath = path.join(claudeDir, 'settings.json');
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

  return { tempDir, cleanup: () => fs.rmSync(tempDir, { recursive: true, force: true }) };
}

console.log('\n=== Feature Flag Validation Tests ===\n');

// ===== Main Test Runner =====
(async () => {
  try {

// ===== Test Suite 1: AzureDevOpsConfig Class Tests =====
console.log('--- AzureDevOpsConfig Tests ---\n');

await testAsync('AzureDevOpsConfig class should exist', async () => {
  // This will import the AzureDevOpsConfig class when implemented
  try {
    // Dynamically import to handle missing file gracefully in TDD
    const { AzureDevOpsConfig } = await import('../../src/core/AzureDevOpsConfig.js').catch(() => ({}));
    assert(AzureDevOpsConfig !== undefined, 'AzureDevOpsConfig class should be defined');
  } catch {
    throw new Error('AzureDevOpsConfig class not found - needs to be implemented');
  }
});

await testAsync('AzureDevOpsConfig should default to disabled', async () => {
  try {
    const { AzureDevOpsConfig } = await import('../../src/core/Azure/AzureDevOpsConfig.js');
    const config = new AzureDevOpsConfig('/nonexistent');
    assertEqual(config.isEnabled(), false, 'Azure should be disabled by default');
  } catch (error) {
    if (error.message.includes('not found') || error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error('AzureDevOpsConfig not implemented yet - this is expected in TDD');
    }
    throw error;
  }
});

await testAsync('AzureDevOpsConfig should read azureDevOps.enabled from settings.json', async () => {
  const { tempDir, cleanup } = createTempSettings({
    azureDevOps: {
      enabled: true,
      organization: 'test-org',
      project: 'test-project',
      token: 'test-token'
    }
  });

  try {
    const { AzureDevOpsConfig } = await import('../../src/core/Azure/AzureDevOpsConfig.js');
    const config = new AzureDevOpsConfig(tempDir);

    // Should read the enabled flag from settings
    assert(config.config.enabled === true, 'Should read enabled=true from settings.json');
    assertEqual(config.config.organization, 'test-org', 'Should read organization');
    assertEqual(config.config.project, 'test-project', 'Should read project');
  } catch (error) {
    if (error.message.includes('not found') || error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error('AzureDevOpsConfig not implemented yet');
    }
    throw error;
  } finally {
    cleanup();
  }
});

await testAsync('AzureDevOpsConfig should require all fields to be fully enabled', async () => {
  const { tempDir, cleanup } = createTempSettings({
    azureDevOps: {
      enabled: true,
      organization: 'test-org'
      // Missing project and token
    }
  });

  try {
    const { AzureDevOpsConfig } = await import('../../src/core/Azure/AzureDevOpsConfig.js');
    const config = new AzureDevOpsConfig(tempDir);

    // Even though enabled=true, should not be fully enabled without all required fields
    assertEqual(config.isEnabled(), false, 'Should not be enabled without all required fields');
  } catch (error) {
    if (error.message.includes('not found') || error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error('AzureDevOpsConfig not implemented yet');
    }
    throw error;
  } finally {
    cleanup();
  }
});

// ===== Test Suite 2: GitHub/Azure Isolation Tests =====
console.log('\n--- GitHub/Azure Isolation Tests ---\n');

await testAsync('GitHub integration should work when Azure is disabled', async () => {
  // Clear environment variables that could interfere with tests
  const originalEnv = {
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    GITHUB_OWNER: process.env.GITHUB_OWNER,
    GITHUB_REPO: process.env.GITHUB_REPO
  };
  delete process.env.GITHUB_TOKEN;
  delete process.env.GITHUB_OWNER;
  delete process.env.GITHUB_REPO;

  const { tempDir, cleanup } = createTempSettings({
    github: {
      enabled: true,
      token: 'github-token',
      owner: 'test-owner',
      repo: 'test-repo',
      autoCreate: true
    },
    azureDevOps: {
      enabled: false
    }
  });

  try {
    const githubConfig = new GitHubConfig(tempDir);

    // GitHub should be fully functional when Azure is disabled
    const repoInfo = githubConfig.getRepoInfo();
    const token = githubConfig.getToken();

    assert(githubConfig.isEnabled(), `GitHub should be enabled (token: ${token}, owner: ${repoInfo.owner}, repo: ${repoInfo.repo})`);
    assert(githubConfig.isAutoCreateEnabled(), 'GitHub auto-create should work');
    assertEqual(repoInfo.owner, 'test-owner', `GitHub config should be intact (got: ${repoInfo.owner})`);
  } finally {
    cleanup();
    // Restore environment variables
    if (originalEnv.GITHUB_TOKEN) process.env.GITHUB_TOKEN = originalEnv.GITHUB_TOKEN;
    if (originalEnv.GITHUB_OWNER) process.env.GITHUB_OWNER = originalEnv.GITHUB_OWNER;
    if (originalEnv.GITHUB_REPO) process.env.GITHUB_REPO = originalEnv.GITHUB_REPO;
  }
});

await testAsync('GitHub integration should work when Azure is enabled', async () => {
  // Clear environment variables that could interfere with tests
  const originalEnv = {
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    GITHUB_OWNER: process.env.GITHUB_OWNER,
    GITHUB_REPO: process.env.GITHUB_REPO,
    AZURE_DEVOPS_TOKEN: process.env.AZURE_DEVOPS_TOKEN
  };
  delete process.env.GITHUB_TOKEN;
  delete process.env.GITHUB_OWNER;
  delete process.env.GITHUB_REPO;
  delete process.env.AZURE_DEVOPS_TOKEN;

  const { tempDir, cleanup } = createTempSettings({
    github: {
      enabled: true,
      token: 'github-token',
      owner: 'test-owner',
      repo: 'test-repo',
      autoCreate: true
    },
    azureDevOps: {
      enabled: true,
      organization: 'azure-org',
      project: 'azure-project',
      token: 'azure-token'
    }
  });

  try {
    const githubConfig = new GitHubConfig(tempDir);

    // CRITICAL: GitHub should remain fully functional even when Azure is enabled
    const repoInfo = githubConfig.getRepoInfo();
    const token = githubConfig.getToken();

    assert(githubConfig.isEnabled(), `GitHub should still be enabled with Azure enabled (token: ${token}, owner: ${repoInfo.owner})`);
    assert(githubConfig.isAutoCreateEnabled(), 'GitHub features should be unaffected');
    assertEqual(repoInfo.owner, 'test-owner', `GitHub config should be independent (got: ${repoInfo.owner})`);
    assertEqual(token, 'github-token', `GitHub token should be separate (got: ${token})`);
  } finally {
    cleanup();
    // Restore environment variables
    if (originalEnv.GITHUB_TOKEN) process.env.GITHUB_TOKEN = originalEnv.GITHUB_TOKEN;
    if (originalEnv.GITHUB_OWNER) process.env.GITHUB_OWNER = originalEnv.GITHUB_OWNER;
    if (originalEnv.GITHUB_REPO) process.env.GITHUB_REPO = originalEnv.GITHUB_REPO;
    if (originalEnv.AZURE_DEVOPS_TOKEN) process.env.AZURE_DEVOPS_TOKEN = originalEnv.AZURE_DEVOPS_TOKEN;
  }
});

await testAsync('Azure and GitHub should have independent authentication', async () => {
  // Clear environment variables that could interfere with tests
  const originalEnv = {
    GITHUB_TOKEN: process.env.GITHUB_TOKEN
  };
  delete process.env.GITHUB_TOKEN;

  const { tempDir, cleanup } = createTempSettings({
    github: {
      enabled: true,
      token: 'github-secret-token',
      owner: 'test-owner',
      repo: 'test-repo'
    },
    azureDevOps: {
      enabled: true,
      organization: 'test-org',
      project: 'test-project',
      useCliAuth: true  // Azure uses CLI auth, no token
    }
  });

  try {
    const githubConfig = new GitHubConfig(tempDir);
    const { AzureDevOpsConfig } = await import('../../src/core/Azure/AzureDevOpsConfig.js');
    const azureConfig = new AzureDevOpsConfig(tempDir);

    // GitHub uses token authentication
    const githubToken = githubConfig.getToken();
    assertEqual(githubToken, 'github-secret-token', `GitHub token should be correct (got: ${githubToken})`);

    // Azure uses CLI authentication (no token needed)
    const azureOrg = azureConfig.getOrganization();
    const azureProject = azureConfig.getProject();
    assertEqual(azureOrg, 'test-org', `Azure org should be correct (got: ${azureOrg})`);
    assertEqual(azureProject, 'test-project', `Azure project should be correct (got: ${azureProject})`);

    // Verify they are independent - GitHub has tokens, Azure does not
    assert(githubToken !== null, 'GitHub should have a token');
    assert(azureOrg !== null, 'Azure should have organization');
  } catch (error) {
    if (error.message.includes('not found') || error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error('AzureDevOpsConfig not implemented yet');
    }
    throw error;
  } finally {
    cleanup();
    // Restore environment variables
    if (originalEnv.GITHUB_TOKEN) process.env.GITHUB_TOKEN = originalEnv.GITHUB_TOKEN;
  }
});

// ===== Test Suite 3: Azure Feature Guard Tests =====
console.log('\n--- Azure Feature Guard Tests ---\n');

await testAsync('Azure features should throw error when flag is disabled', async () => {
  const { tempDir, cleanup } = createTempSettings({
    azureDevOps: {
      enabled: false
    }
  });

  try {
    const { AzureDevOpsConfig } = await import('../../src/core/Azure/AzureDevOpsConfig.js');
    const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js').catch(() => ({}));

    if (!AzureDevOpsClient) {
      throw new Error('AzureDevOpsClient not implemented yet');
    }

    const config = new AzureDevOpsConfig(tempDir);
    const client = new AzureDevOpsClient(config);

    // Attempting to use Azure features when disabled should fail gracefully
    const result = await client.createWorkItem('Test', 'Description');
    assertEqual(result, null, 'Azure operations should return null when disabled');
  } catch (error) {
    if (error.message.includes('not implemented')) {
      throw error;
    }
    if (error.message.includes('not found') || error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error('Azure client classes not implemented yet');
    }
    throw error;
  } finally {
    cleanup();
  }
});

await testAsync('Azure features should only work when flag is enabled', async () => {
  const { tempDir, cleanup } = createTempSettings({
    azureDevOps: {
      enabled: true,
      organization: 'test-org',
      project: 'test-project',
      token: 'test-token'
    }
  });

  try {
    const { AzureDevOpsConfig } = await import('../../src/core/Azure/AzureDevOpsConfig.js');
    const config = new AzureDevOpsConfig(tempDir);

    // When properly configured, Azure should be enabled
    assert(config.isEnabled(), 'Azure should be enabled with all required config');
    assertEqual(config.getOrganization(), 'test-org', 'Should have organization');
    assertEqual(config.getProject(), 'test-project', 'Should have project');
  } catch (error) {
    if (error.message.includes('not found') || error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error('AzureDevOpsConfig not implemented yet');
    }
    throw error;
  } finally {
    cleanup();
  }
});

// ===== Test Suite 4: Configuration Validation Tests =====
console.log('\n--- Configuration Validation Tests ---\n');

await testAsync('Should support both GitHub and Azure enabled simultaneously', async () => {
  // Clear environment variables that could interfere with tests
  const originalEnv = {
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    GITHUB_OWNER: process.env.GITHUB_OWNER,
    GITHUB_REPO: process.env.GITHUB_REPO
  };
  delete process.env.GITHUB_TOKEN;
  delete process.env.GITHUB_OWNER;
  delete process.env.GITHUB_REPO;

  const { tempDir, cleanup } = createTempSettings({
    github: {
      enabled: true,
      token: 'gh-token',
      owner: 'owner',
      repo: 'repo'
    },
    azureDevOps: {
      enabled: true,
      organization: 'org',
      project: 'proj',
      useCliAuth: true
    }
  });

  try {
    const githubConfig = new GitHubConfig(tempDir);
    const { AzureDevOpsConfig } = await import('../../src/core/Azure/AzureDevOpsConfig.js');
    const azureConfig = new AzureDevOpsConfig(tempDir);

    // Both should be enabled simultaneously
    assert(githubConfig.isEnabled(), 'GitHub should be enabled');
    assert(azureConfig.isEnabled(), 'Azure should be enabled');

    // Both should have their own independent configs
    // GitHub uses token auth, Azure uses CLI auth
    const githubToken = githubConfig.getToken();
    const azureOrg = azureConfig.getOrganization();

    assert(githubToken !== null, 'GitHub should have token');
    assert(azureOrg !== null, 'Azure should have organization');
    assertEqual(githubToken, 'gh-token', `GitHub token should be correct (expected: gh-token, got: ${githubToken})`);
    assertEqual(azureOrg, 'org', `Azure org should be correct (expected: org, got: ${azureOrg})`);
  } catch (error) {
    if (error.message.includes('not found') || error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error('AzureDevOpsConfig not implemented yet');
    }
    throw error;
  } finally {
    cleanup();
    // Restore environment variables
    if (originalEnv.GITHUB_TOKEN) process.env.GITHUB_TOKEN = originalEnv.GITHUB_TOKEN;
    if (originalEnv.GITHUB_OWNER) process.env.GITHUB_OWNER = originalEnv.GITHUB_OWNER;
    if (originalEnv.GITHUB_REPO) process.env.GITHUB_REPO = originalEnv.GITHUB_REPO;
  }
});

await testAsync('Should handle missing azureDevOps config gracefully', async () => {
  const { tempDir, cleanup } = createTempSettings({
    github: {
      enabled: true,
      token: 'token',
      owner: 'owner',
      repo: 'repo'
    }
    // No azureDevOps section at all
  });

  try {
    const { AzureDevOpsConfig } = await import('../../src/core/Azure/AzureDevOpsConfig.js');
    const azureConfig = new AzureDevOpsConfig(tempDir);

    // Should default to disabled when config section is missing
    assertEqual(azureConfig.isEnabled(), false, 'Azure should be disabled when config is missing');
    assertEqual(azureConfig.config.enabled, false, 'Default enabled should be false');
  } catch (error) {
    if (error.message.includes('not found') || error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error('AzureDevOpsConfig not implemented yet');
    }
    throw error;
  } finally {
    cleanup();
  }
});

// ===== Test Summary =====
console.log('\n=== Test Summary ===\n');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}\n`);

if (failed > 0) {
  console.log('⚠️  Expected failures in TDD: Tests should fail until implementation in TASK-003\n');
  process.exit(1);
} else {
  console.log('✅ All tests passed!\n');
  process.exit(0);
}

  } catch (error) {
    console.error('\n❌ Test runner error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
})();
