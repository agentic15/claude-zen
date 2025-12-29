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
 * Azure Auth Validator Tests
 *
 * Tests for Azure authentication validation utilities
 */

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

console.log('\n=== Azure Auth Validator Tests ===\n');

// ===== Test Suite 1: Validator Methods =====
console.log('--- Validator Methods ---\n');

await testAsync('AzureAuthValidator should have isAzureCliInstalled method', async () => {
  const { AzureAuthValidator } = await import('../../src/core/Azure/AzureAuthValidator.js');

  assert(typeof AzureAuthValidator.isAzureCliInstalled === 'function',
    'Should have isAzureCliInstalled method');
});

await testAsync('AzureAuthValidator should have isAzureDevOpsExtensionInstalled method', async () => {
  const { AzureAuthValidator } = await import('../../src/core/Azure/AzureAuthValidator.js');

  assert(typeof AzureAuthValidator.isAzureDevOpsExtensionInstalled === 'function',
    'Should have isAzureDevOpsExtensionInstalled method');
});

await testAsync('AzureAuthValidator should have isAuthenticated method', async () => {
  const { AzureAuthValidator } = await import('../../src/core/Azure/AzureAuthValidator.js');

  assert(typeof AzureAuthValidator.isAuthenticated === 'function',
    'Should have isAuthenticated method');
});

await testAsync('AzureAuthValidator should have validateSetup method', async () => {
  const { AzureAuthValidator } = await import('../../src/core/Azure/AzureAuthValidator.js');

  assert(typeof AzureAuthValidator.validateSetup === 'function',
    'Should have validateSetup method');
});

await testAsync('AzureAuthValidator should have getSetupInstructions method', async () => {
  const { AzureAuthValidator } = await import('../../src/core/Azure/AzureAuthValidator.js');

  assert(typeof AzureAuthValidator.getSetupInstructions === 'function',
    'Should have getSetupInstructions method');
});

// ===== Test Suite 2: CLI Detection =====
console.log('\n--- CLI Detection ---\n');

await testAsync('isAzureCliInstalled should return boolean', async () => {
  const { AzureAuthValidator } = await import('../../src/core/Azure/AzureAuthValidator.js');

  const result = AzureAuthValidator.isAzureCliInstalled();

  assert(typeof result === 'boolean', 'Should return boolean');
});

await testAsync('isAuthenticated should return boolean', async () => {
  const { AzureAuthValidator } = await import('../../src/core/Azure/AzureAuthValidator.js');

  const result = AzureAuthValidator.isAuthenticated();

  assert(typeof result === 'boolean', 'Should return boolean');
});

// ===== Test Suite 3: Validation Results =====
console.log('\n--- Validation Results ---\n');

await testAsync('validateSetup should return object with expected fields', async () => {
  const { AzureAuthValidator } = await import('../../src/core/Azure/AzureAuthValidator.js');

  const results = AzureAuthValidator.validateSetup();

  assert(typeof results === 'object', 'Should return object');
  assert('cliInstalled' in results, 'Should have cliInstalled field');
  assert('authenticated' in results, 'Should have authenticated field');
  assert('ready' in results, 'Should have ready field');
  assert('errors' in results, 'Should have errors array');
  assert('warnings' in results, 'Should have warnings array');
  assert(Array.isArray(results.errors), 'errors should be array');
  assert(Array.isArray(results.warnings), 'warnings should be array');
});

await testAsync('validateSetup should populate errors if CLI not installed', async () => {
  const { AzureAuthValidator } = await import('../../src/core/Azure/AzureAuthValidator.js');

  const results = AzureAuthValidator.validateSetup();

  // If CLI not installed, should have errors
  if (!results.cliInstalled) {
    assert(results.errors.length > 0, 'Should have errors when CLI not installed');
    assert(results.ready === false, 'Should not be ready when CLI not installed');
  }
});

await testAsync('validateSetup should populate errors if not authenticated', async () => {
  const { AzureAuthValidator } = await import('../../src/core/Azure/AzureAuthValidator.js');

  const results = AzureAuthValidator.validateSetup();

  // If not authenticated (but CLI installed), should have errors
  if (results.cliInstalled && !results.authenticated) {
    assert(results.errors.length > 0, 'Should have errors when not authenticated');
    assert(results.ready === false, 'Should not be ready when not authenticated');
  }
});

await testAsync('validateSetup should be ready when fully configured', async () => {
  const { AzureAuthValidator } = await import('../../src/core/Azure/AzureAuthValidator.js');

  const results = AzureAuthValidator.validateSetup();

  // If all checks pass, should be ready
  if (results.cliInstalled && results.authenticated &&
      results.organization && results.project) {
    assert(results.ready === true, 'Should be ready when fully configured');
  }
});

// ===== Test Suite 4: Setup Instructions =====
console.log('\n--- Setup Instructions ---\n');

await testAsync('getSetupInstructions should return string', async () => {
  const { AzureAuthValidator } = await import('../../src/core/Azure/AzureAuthValidator.js');

  const instructions = AzureAuthValidator.getSetupInstructions();

  assert(typeof instructions === 'string', 'Should return string');
  assert(instructions.length > 0, 'Instructions should not be empty');
  assert(instructions.includes('az login'), 'Should mention az login');
  assert(instructions.includes('az devops configure'), 'Should mention az devops configure');
});

// ===== Test Suite 5: Print Results =====
console.log('\n--- Print Results ---\n');

await testAsync('printValidationResults should not throw error', async () => {
  const { AzureAuthValidator } = await import('../../src/core/Azure/AzureAuthValidator.js');

  const results = AzureAuthValidator.validateSetup();

  // Should not throw error
  AzureAuthValidator.printValidationResults(results);

  assert(true, 'Should complete without error');
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
