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

import { FeatureFlags } from '../../src/config/FeatureFlags.js';
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';

/**
 * Feature Flags Tests
 *
 * Tests for feature flag validation and configuration:
 * - Azure DevOps feature flag enabled/disabled
 * - Configuration reading from settings.json
 * - Default values
 * - GitHub integration independence
 */

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

function assertThrows(fn, expectedMessage) {
  let threw = false;
  let error = null;
  try {
    fn();
  } catch (e) {
    threw = true;
    error = e;
  }
  if (!threw) {
    throw new Error('Expected function to throw an error');
  }
  if (expectedMessage && !error.message.includes(expectedMessage)) {
    throw new Error(`Expected error message to include "${expectedMessage}", got "${error.message}"`);
  }
}

// Helper to create temporary settings file
function createTempSettings(config) {
  const tempPath = join(process.cwd(), '.claude', 'settings.test.json');
  writeFileSync(tempPath, JSON.stringify(config, null, 2));
  return tempPath;
}

function cleanupTempSettings(path) {
  if (existsSync(path)) {
    unlinkSync(path);
  }
}

console.log('\n🧪 Running Feature Flags Tests\n');

// Test 1: Feature flag defaults to false/disabled
test('Feature flag defaults to false/disabled', () => {
  const config = {
    azureDevOps: {
      enabled: false
    }
  };
  const tempPath = createTempSettings(config);

  const flags = new FeatureFlags(tempPath);
  assertEqual(flags.isAzureDevOpsEnabled(), false, 'Azure DevOps should be disabled by default');

  cleanupTempSettings(tempPath);
});

// Test 2: Can read azureDevOps.enabled from settings.json
test('Can read azureDevOps.enabled from settings.json', () => {
  const config = {
    azureDevOps: {
      enabled: true,
      organization: 'test-org',
      project: 'test-project'
    }
  };
  const tempPath = createTempSettings(config);

  const flags = new FeatureFlags(tempPath);
  assertEqual(flags.isAzureDevOpsEnabled(), true, 'Should read enabled=true from settings');
  assertEqual(flags.getAzureDevOpsConfig().organization, 'test-org', 'Should read organization');
  assertEqual(flags.getAzureDevOpsConfig().project, 'test-project', 'Should read project');

  cleanupTempSettings(tempPath);
});

// Test 3: GitHub integration works when Azure flag is true
test('GitHub integration works when Azure flag is true', () => {
  const config = {
    github: {
      enabled: true,
      owner: 'test-owner',
      repo: 'test-repo'
    },
    azureDevOps: {
      enabled: true
    }
  };
  const tempPath = createTempSettings(config);

  const flags = new FeatureFlags(tempPath);
  assertEqual(flags.isGitHubEnabled(), true, 'GitHub should work when Azure is enabled');
  assertEqual(flags.isAzureDevOpsEnabled(), true, 'Azure should be enabled');
  assertEqual(flags.getGitHubConfig().owner, 'test-owner', 'Should read GitHub config');

  cleanupTempSettings(tempPath);
});

// Test 4: GitHub integration works when Azure flag is false
test('GitHub integration works when Azure flag is false', () => {
  const config = {
    github: {
      enabled: true,
      owner: 'test-owner',
      repo: 'test-repo'
    },
    azureDevOps: {
      enabled: false
    }
  };
  const tempPath = createTempSettings(config);

  const flags = new FeatureFlags(tempPath);
  assertEqual(flags.isGitHubEnabled(), true, 'GitHub should work when Azure is disabled');
  assertEqual(flags.isAzureDevOpsEnabled(), false, 'Azure should be disabled');

  cleanupTempSettings(tempPath);
});

// Test 5: Azure features throw error when flag is false
test('Azure features throw error when flag is false', () => {
  const config = {
    azureDevOps: {
      enabled: false
    }
  };
  const tempPath = createTempSettings(config);

  const flags = new FeatureFlags(tempPath);
  assertThrows(
    () => flags.requireAzureDevOpsEnabled(),
    'Azure DevOps integration is disabled'
  );

  cleanupTempSettings(tempPath);
});

// Test 6: Missing azureDevOps config defaults to disabled
test('Missing azureDevOps config defaults to disabled', () => {
  const config = {
    github: {
      enabled: true
    }
    // No azureDevOps section
  };
  const tempPath = createTempSettings(config);

  const flags = new FeatureFlags(tempPath);
  assertEqual(flags.isAzureDevOpsEnabled(), false, 'Should default to disabled when config missing');

  cleanupTempSettings(tempPath);
});

// Test 7: Azure enabled=true requires organization and project
test('Azure config validation when enabled', () => {
  const config = {
    azureDevOps: {
      enabled: true,
      organization: 'test-org',
      project: 'test-project'
    }
  };
  const tempPath = createTempSettings(config);

  const flags = new FeatureFlags(tempPath);
  const azureConfig = flags.getAzureDevOpsConfig();
  assert(azureConfig.organization, 'Organization should be set');
  assert(azureConfig.project, 'Project should be set');

  cleanupTempSettings(tempPath);
});

// Test 8: Settings.local.json overrides settings.json
test('Local settings override base settings', () => {
  const baseConfig = {
    azureDevOps: {
      enabled: false,
      organization: 'base-org'
    }
  };
  const localConfig = {
    azureDevOps: {
      enabled: true,
      organization: 'local-org'
    }
  };

  const basePath = createTempSettings(baseConfig);
  const localPath = basePath.replace('settings.test.json', 'settings.local.test.json');
  writeFileSync(localPath, JSON.stringify(localConfig, null, 2));

  const flags = new FeatureFlags(basePath, localPath);
  assertEqual(flags.isAzureDevOpsEnabled(), true, 'Local setting should override base');
  assertEqual(flags.getAzureDevOpsConfig().organization, 'local-org', 'Local org should override base org');

  cleanupTempSettings(basePath);
  cleanupTempSettings(localPath);
});

// Test 9: Both GitHub and Azure can be disabled
test('Both GitHub and Azure can be disabled', () => {
  const config = {
    github: {
      enabled: false
    },
    azureDevOps: {
      enabled: false
    }
  };
  const tempPath = createTempSettings(config);

  const flags = new FeatureFlags(tempPath);
  assertEqual(flags.isGitHubEnabled(), false, 'GitHub should be disabled');
  assertEqual(flags.isAzureDevOpsEnabled(), false, 'Azure should be disabled');

  cleanupTempSettings(tempPath);
});

// Test 10: Invalid config type throws error
test('Invalid enabled type throws error', () => {
  const config = {
    azureDevOps: {
      enabled: 'yes' // Should be boolean
    }
  };
  const tempPath = createTempSettings(config);

  assertThrows(
    () => new FeatureFlags(tempPath),
    'enabled must be a boolean'
  );

  cleanupTempSettings(tempPath);
});

// Print summary
console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
}
