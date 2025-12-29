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
 * Azure DevOps Authentication Tests (TDD)
 *
 * Tests for Azure CLI-based authentication - written BEFORE full implementation.
 * These tests define the expected behavior of Azure authentication using Azure CLI.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
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

// ===== Helper: Create Temp Settings =====
function createTempSettings(settings) {
  const tempDir = path.join(__dirname, 'temp-auth-' + Date.now());
  const claudeDir = path.join(tempDir, '.claude');
  fs.mkdirSync(claudeDir, { recursive: true });

  const settingsPath = path.join(claudeDir, 'settings.json');
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

  return {
    tempDir,
    cleanup: () => fs.rmSync(tempDir, { recursive: true, force: true })
  };
}

console.log('\n=== Azure DevOps Authentication Tests ===\n');

// ===== Test Suite 1: Azure CLI Authentication Check =====
console.log('--- Azure CLI Authentication Check ---\n');

await testAsync('AzureDevOpsClient should check if Azure CLI is authenticated', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

  const client = new AzureDevOpsClient('test-org', 'test-project');

  // isConfigured() should check for Azure CLI authentication
  // This will fail if user is not logged in with `az login`
  const isConfigured = client.isConfigured();

  // Result depends on whether user has run `az login`
  // Test should verify the method exists and returns boolean
  assert(typeof isConfigured === 'boolean', 'isConfigured() should return boolean');
});

await testAsync('AzureDevOpsClient should return false if organization is missing', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

  const client = new AzureDevOpsClient(null, 'test-project');

  const isConfigured = client.isConfigured();

  assertEqual(isConfigured, false, 'Should return false when organization is missing');
});

await testAsync('AzureDevOpsClient should return false if project is missing', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

  const client = new AzureDevOpsClient('test-org', null);

  const isConfigured = client.isConfigured();

  assertEqual(isConfigured, false, 'Should return false when project is missing');
});

// ===== Test Suite 2: Configuration Loading (No Tokens) =====
console.log('\n--- Configuration Loading (CLI Auth) ---\n');

await testAsync('AzureDevOpsConfig should not have token field', async () => {
  const { tempDir, cleanup } = createTempSettings({
    azureDevOps: {
      enabled: true,
      organization: 'test-org',
      project: 'test-project',
      useCliAuth: true
    }
  });

  try {
    const { AzureDevOpsConfig } = await import('../../src/core/Azure/AzureDevOpsConfig.js');
    const config = new AzureDevOpsConfig(tempDir);

    // Config should NOT have getToken() method
    assert(typeof config.getToken !== 'function', 'Config should not have getToken() method');

    // Config should have organization and project
    assert(typeof config.getOrganization === 'function', 'Config should have getOrganization()');
    assert(typeof config.getProject === 'function', 'Config should have getProject()');

    assertEqual(config.getOrganization(), 'test-org', 'Organization should be loaded');
    assertEqual(config.getProject(), 'test-project', 'Project should be loaded');
  } finally {
    cleanup();
  }
});

await testAsync('AzureDevOpsConfig should use CLI auth by default', async () => {
  const { tempDir, cleanup } = createTempSettings({
    azureDevOps: {
      enabled: true,
      organization: 'test-org',
      project: 'test-project'
    }
  });

  try {
    const { AzureDevOpsConfig } = await import('../../src/core/Azure/AzureDevOpsConfig.js');
    const config = new AzureDevOpsConfig(tempDir);

    // useCliAuth should default to true
    assertEqual(config.config.useCliAuth, true, 'useCliAuth should default to true');
  } finally {
    cleanup();
  }
});

await testAsync('AzureDevOpsConfig should be enabled without token', async () => {
  const { tempDir, cleanup } = createTempSettings({
    azureDevOps: {
      enabled: true,
      organization: 'test-org',
      project: 'test-project'
    }
  });

  try {
    const { AzureDevOpsConfig } = await import('../../src/core/Azure/AzureDevOpsConfig.js');
    const config = new AzureDevOpsConfig(tempDir);

    // Should be enabled with just org + project (no token needed)
    assert(config.isEnabled(), 'Config should be enabled without token when using CLI auth');
  } finally {
    cleanup();
  }
});

// ===== Test Suite 3: Environment Variables (No Token Env Var) =====
console.log('\n--- Environment Variables (CLI Auth) ---\n');

await testAsync('Should not accept AZURE_DEVOPS_TOKEN environment variable', async () => {
  const originalToken = process.env.AZURE_DEVOPS_TOKEN;
  process.env.AZURE_DEVOPS_TOKEN = 'should-be-ignored';
  process.env.AZURE_DEVOPS_ORGANIZATION = 'env-org';
  process.env.AZURE_DEVOPS_PROJECT = 'env-project';
  process.env.AZURE_DEVOPS_ENABLED = 'true';

  const { tempDir, cleanup } = createTempSettings({
    azureDevOps: {
      enabled: false
    }
  });

  try {
    const { AzureDevOpsConfig } = await import('../../src/core/Azure/AzureDevOpsConfig.js');
    const config = new AzureDevOpsConfig(tempDir);

    // Env vars should override file settings
    assertEqual(config.config.enabled, true, 'Enabled should come from env var');
    assertEqual(config.getOrganization(), 'env-org', 'Organization should come from env var');
    assertEqual(config.getProject(), 'env-project', 'Project should come from env var');

    // But token should NOT be in config
    assert(!config.config.token, 'Token should not be set even if AZURE_DEVOPS_TOKEN env var exists');
  } finally {
    cleanup();
    delete process.env.AZURE_DEVOPS_TOKEN;
    delete process.env.AZURE_DEVOPS_ORGANIZATION;
    delete process.env.AZURE_DEVOPS_PROJECT;
    delete process.env.AZURE_DEVOPS_ENABLED;
    if (originalToken) process.env.AZURE_DEVOPS_TOKEN = originalToken;
  }
});

// ===== Test Suite 4: Client Operations (CLI Commands) =====
console.log('\n--- Client Operations (CLI Commands) ---\n');

await testAsync('AzureDevOpsClient should have createWorkItem method', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

  const client = new AzureDevOpsClient('test-org', 'test-project');

  assert(typeof client.createWorkItem === 'function', 'Client should have createWorkItem method');
});

await testAsync('AzureDevOpsClient should have updateWorkItemState method', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

  const client = new AzureDevOpsClient('test-org', 'test-project');

  assert(typeof client.updateWorkItemState === 'function', 'Client should have updateWorkItemState method');
});

await testAsync('AzureDevOpsClient should have addWorkItemComment method', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

  const client = new AzureDevOpsClient('test-org', 'test-project');

  assert(typeof client.addWorkItemComment === 'function', 'Client should have addWorkItemComment method');
});

await testAsync('AzureDevOpsClient should have closeWorkItem method', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

  const client = new AzureDevOpsClient('test-org', 'test-project');

  assert(typeof client.closeWorkItem === 'function', 'Client should have closeWorkItem method');
});

await testAsync('AzureDevOpsClient should return null from operations when not configured', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

  // Create client with missing organization (not configured)
  const client = new AzureDevOpsClient(null, 'test-project');

  const result = await client.createWorkItem('Test', 'Description');

  assertEqual(result, null, 'Should return null when not configured');
});

// ===== Test Suite 5: Isolation from GitHub =====
console.log('\n--- Isolation from GitHub Authentication ---\n');

await testAsync('Azure should use CLI auth while GitHub uses token auth', async () => {
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
      repo: 'test-repo'
    },
    azureDevOps: {
      enabled: true,
      organization: 'test-org',
      project: 'test-project',
      useCliAuth: true
    }
  });

  try {
    const { GitHubConfig } = await import('../../src/core/GitHubConfig.js');
    const { AzureDevOpsConfig } = await import('../../src/core/Azure/AzureDevOpsConfig.js');

    const githubConfig = new GitHubConfig(tempDir);
    const azureConfig = new AzureDevOpsConfig(tempDir);

    // GitHub uses token authentication
    assert(typeof githubConfig.getToken === 'function', 'GitHub should have getToken()');
    assertEqual(githubConfig.getToken(), 'github-token', 'GitHub should have token');

    // Azure uses CLI authentication (no token)
    assert(typeof azureConfig.getToken !== 'function', 'Azure should NOT have getToken()');
    assertEqual(azureConfig.getOrganization(), 'test-org', 'Azure should have organization');
    assertEqual(azureConfig.getProject(), 'test-project', 'Azure should have project');

    // Both should be enabled independently
    assert(githubConfig.isEnabled(), 'GitHub should be enabled');
    assert(azureConfig.isEnabled(), 'Azure should be enabled');
  } finally {
    cleanup();
    // Restore environment variables
    if (originalEnv.GITHUB_TOKEN) process.env.GITHUB_TOKEN = originalEnv.GITHUB_TOKEN;
    if (originalEnv.GITHUB_OWNER) process.env.GITHUB_OWNER = originalEnv.GITHUB_OWNER;
    if (originalEnv.GITHUB_REPO) process.env.GITHUB_REPO = originalEnv.GITHUB_REPO;
  }
});

await testAsync('GitHub and Azure clients should be completely independent', async () => {
  const { tempDir, cleanup } = createTempSettings({
    github: {
      enabled: true,
      token: 'github-token',
      owner: 'test-owner',
      repo: 'test-repo'
    },
    azureDevOps: {
      enabled: true,
      organization: 'test-org',
      project: 'test-project'
    }
  });

  try {
    const { GitHubConfig } = await import('../../src/core/GitHubConfig.js');
    const { GitHubClient } = await import('../../src/core/GitHubClient.js');
    const { AzureDevOpsConfig } = await import('../../src/core/Azure/AzureDevOpsConfig.js');
    const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

    const githubConfig = new GitHubConfig(tempDir);
    const azureConfig = new AzureDevOpsConfig(tempDir);

    const githubClient = new GitHubClient(
      githubConfig.getToken(),
      githubConfig.getRepoInfo().owner,
      githubConfig.getRepoInfo().repo
    );

    const azureClient = new AzureDevOpsClient(
      azureConfig.getOrganization(),
      azureConfig.getProject()
    );

    // GitHub client uses Octokit with token
    assert(githubClient.octokit !== undefined || !githubClient.configured, 'GitHub client should use Octokit or be unconfigured');

    // Azure client uses CLI (no Octokit, no token)
    assert(!azureClient.octokit, 'Azure client should NOT use Octokit');
    assert(!azureClient.token, 'Azure client should NOT have token field');

    // Both have different method signatures
    assert(typeof githubClient.createIssue === 'function', 'GitHub should have createIssue()');
    assert(typeof azureClient.createWorkItem === 'function', 'Azure should have createWorkItem()');
  } finally {
    cleanup();
  }
});

// ===== Test Suite 6: Error Handling =====
console.log('\n--- Error Handling ---\n');

await testAsync('AzureDevOpsClient should handle missing Azure CLI gracefully', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

  const client = new AzureDevOpsClient('test-org', 'test-project');

  // If Azure CLI is not installed or user not logged in, isConfigured() should return false
  // This is tested by the actual CLI check, not a mock
  const isConfigured = client.isConfigured();

  // Should return boolean, not throw error
  assert(typeof isConfigured === 'boolean', 'Should return boolean even if CLI not available');
});

await testAsync('AzureDevOpsClient should return null when operations fail', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

  // Create client with invalid configuration
  const client = new AzureDevOpsClient('', '');

  const result = await client.createWorkItem('Test', 'Description');

  assertEqual(result, null, 'Should return null when operation fails');
});

await testAsync('AzureDevOpsConfig should handle missing config file gracefully', async () => {
  const tempDir = path.join(__dirname, 'temp-no-config-' + Date.now());
  fs.mkdirSync(tempDir, { recursive: true });

  try {
    const { AzureDevOpsConfig } = await import('../../src/core/Azure/AzureDevOpsConfig.js');
    const config = new AzureDevOpsConfig(tempDir);

    // Should have default values
    assertEqual(config.config.enabled, false, 'Should default to disabled');
    assertEqual(config.config.organization, null, 'Organization should default to null');
    assertEqual(config.config.project, null, 'Project should default to null');
    assertEqual(config.config.useCliAuth, true, 'useCliAuth should default to true');
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

// ===== Test Summary =====
console.log('\n=== Test Summary ===\n');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}\n`);

if (failed > 0) {
  console.log('⚠️  Some tests failed\n');
  process.exit(1);
} else {
  console.log('✅ All tests passed!\n');
  process.exit(0);
}
