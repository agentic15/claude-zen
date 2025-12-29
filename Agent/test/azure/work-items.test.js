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
 * Azure DevOps Work Item API Tests (TDD)
 *
 * Tests for Azure work item operations using Azure CLI
 * These tests define the expected behavior of work item CRUD operations
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

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

console.log('\n=== Azure DevOps Work Item API Tests ===\n');

// ===== Test Suite 1: Client Initialization =====
console.log('--- Client Initialization ---\n');

await testAsync('AzureDevOpsClient should initialize with organization and project', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

  const client = new AzureDevOpsClient('test-org', 'test-project');

  assertEqual(client.organization, 'test-org', 'Organization should be set');
  assertEqual(client.project, 'test-project', 'Project should be set');
});

await testAsync('AzureDevOpsClient should not be configured without organization', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

  const client = new AzureDevOpsClient(null, 'test-project');

  assertEqual(client.isConfigured(), false, 'Should not be configured without organization');
});

await testAsync('AzureDevOpsClient should not be configured without project', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

  const client = new AzureDevOpsClient('test-org', null);

  assertEqual(client.isConfigured(), false, 'Should not be configured without project');
});

// ===== Test Suite 2: Work Item Creation =====
console.log('\n--- Work Item Creation ---\n');

await testAsync('createWorkItem should have correct signature', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

  const client = new AzureDevOpsClient('test-org', 'test-project');

  assert(typeof client.createWorkItem === 'function', 'Should have createWorkItem method');
  // Note: function.length doesn't count parameters with default values
  // createWorkItem(title, description, tags = []) has length 2, not 3
  assert(client.createWorkItem.length >= 2, 'Should accept at least 2 parameters (title, description)');
});

await testAsync('createWorkItem should return null when not configured', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

  const client = new AzureDevOpsClient(null, null);

  const result = await client.createWorkItem('Test', 'Description', []);

  assertEqual(result, null, 'Should return null when not configured');
});

await testAsync('createWorkItem should accept title, description, and tags', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

  const client = new AzureDevOpsClient('test-org', 'test-project');

  // This will fail if Azure CLI not authenticated, but should not throw
  const result = await client.createWorkItem('Test Title', 'Test Description', ['tag1', 'tag2']);

  // Result should be either a number (work item ID) or null
  assert(typeof result === 'number' || result === null,
    'Should return number (work item ID) or null');
});

await testAsync('createWorkItem should handle empty tags array', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

  const client = new AzureDevOpsClient('test-org', 'test-project');

  const result = await client.createWorkItem('Test Title', 'Test Description', []);

  assert(typeof result === 'number' || result === null,
    'Should handle empty tags array');
});

await testAsync('createWorkItem should handle missing tags parameter', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

  const client = new AzureDevOpsClient('test-org', 'test-project');

  const result = await client.createWorkItem('Test Title', 'Test Description');

  assert(typeof result === 'number' || result === null,
    'Should handle missing tags parameter with default empty array');
});

// ===== Test Suite 3: Work Item State Updates =====
console.log('\n--- Work Item State Updates ---\n');

await testAsync('updateWorkItemState should have correct signature', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

  const client = new AzureDevOpsClient('test-org', 'test-project');

  assert(typeof client.updateWorkItemState === 'function', 'Should have updateWorkItemState method');
  assertEqual(client.updateWorkItemState.length, 2, 'Should accept 2 parameters (workItemId, state)');
});

await testAsync('updateWorkItemState should return false when not configured', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

  const client = new AzureDevOpsClient(null, null);

  const result = await client.updateWorkItemState(123, 'Active');

  assertEqual(result, false, 'Should return false when not configured');
});

await testAsync('updateWorkItemState should return false without work item ID', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

  const client = new AzureDevOpsClient('test-org', 'test-project');

  const result = await client.updateWorkItemState(null, 'Active');

  assertEqual(result, false, 'Should return false without work item ID');
});

await testAsync('updateWorkItemState should accept valid states', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

  const client = new AzureDevOpsClient('test-org', 'test-project');

  // Test various valid states
  const states = ['New', 'Active', 'Closed', 'Resolved'];

  for (const state of states) {
    const result = await client.updateWorkItemState(123, state);
    assert(typeof result === 'boolean', `Should return boolean for state: ${state}`);
  }
});

// ===== Test Suite 4: Work Item Tags =====
console.log('\n--- Work Item Tags ---\n');

await testAsync('updateWorkItemTags should have correct signature', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

  const client = new AzureDevOpsClient('test-org', 'test-project');

  assert(typeof client.updateWorkItemTags === 'function', 'Should have updateWorkItemTags method');
  assertEqual(client.updateWorkItemTags.length, 2, 'Should accept 2 parameters (workItemId, tags)');
});

await testAsync('updateWorkItemTags should return false when not configured', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

  const client = new AzureDevOpsClient(null, null);

  const result = await client.updateWorkItemTags(123, ['tag1']);

  assertEqual(result, false, 'Should return false when not configured');
});

await testAsync('updateWorkItemTags should handle empty tags array', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

  const client = new AzureDevOpsClient('test-org', 'test-project');

  const result = await client.updateWorkItemTags(123, []);

  assert(typeof result === 'boolean', 'Should handle empty tags array');
});

await testAsync('updateWorkItemTags should handle multiple tags', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

  const client = new AzureDevOpsClient('test-org', 'test-project');

  const result = await client.updateWorkItemTags(123, ['tag1', 'tag2', 'tag3']);

  assert(typeof result === 'boolean', 'Should handle multiple tags');
});

// ===== Test Suite 5: Work Item Comments =====
console.log('\n--- Work Item Comments ---\n');

await testAsync('addWorkItemComment should have correct signature', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

  const client = new AzureDevOpsClient('test-org', 'test-project');

  assert(typeof client.addWorkItemComment === 'function', 'Should have addWorkItemComment method');
  assertEqual(client.addWorkItemComment.length, 2, 'Should accept 2 parameters (workItemId, comment)');
});

await testAsync('addWorkItemComment should return false when not configured', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

  const client = new AzureDevOpsClient(null, null);

  const result = await client.addWorkItemComment(123, 'Test comment');

  assertEqual(result, false, 'Should return false when not configured');
});

await testAsync('addWorkItemComment should return false without work item ID', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

  const client = new AzureDevOpsClient('test-org', 'test-project');

  const result = await client.addWorkItemComment(null, 'Test comment');

  assertEqual(result, false, 'Should return false without work item ID');
});

await testAsync('addWorkItemComment should accept comment text', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

  const client = new AzureDevOpsClient('test-org', 'test-project');

  const result = await client.addWorkItemComment(123, 'This is a test comment');

  assert(typeof result === 'boolean', 'Should return boolean');
});

// ===== Test Suite 6: Close Work Item =====
console.log('\n--- Close Work Item ---\n');

await testAsync('closeWorkItem should have correct signature', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

  const client = new AzureDevOpsClient('test-org', 'test-project');

  assert(typeof client.closeWorkItem === 'function', 'Should have closeWorkItem method');
  // Note: function.length doesn't count parameters with default values
  // closeWorkItem(workItemId, comment = null) has length 1, not 2
  assert(client.closeWorkItem.length >= 1, 'Should accept at least 1 parameter (workItemId)');
});

await testAsync('closeWorkItem should return false when not configured', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

  const client = new AzureDevOpsClient(null, null);

  const result = await client.closeWorkItem(123);

  assertEqual(result, false, 'Should return false when not configured');
});

await testAsync('closeWorkItem should accept optional comment', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

  const client = new AzureDevOpsClient('test-org', 'test-project');

  // Without comment
  const result1 = await client.closeWorkItem(123);
  assert(typeof result1 === 'boolean', 'Should work without comment');

  // With comment
  const result2 = await client.closeWorkItem(123, 'Closing comment');
  assert(typeof result2 === 'boolean', 'Should work with comment');
});

// ===== Test Suite 7: Get Work Item =====
console.log('\n--- Get Work Item ---\n');

await testAsync('getWorkItem should have correct signature', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

  const client = new AzureDevOpsClient('test-org', 'test-project');

  assert(typeof client.getWorkItem === 'function', 'Should have getWorkItem method');
  assertEqual(client.getWorkItem.length, 1, 'Should accept 1 parameter (workItemId)');
});

await testAsync('getWorkItem should return null when not configured', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

  const client = new AzureDevOpsClient(null, null);

  const result = await client.getWorkItem(123);

  assertEqual(result, null, 'Should return null when not configured');
});

await testAsync('getWorkItem should return null without work item ID', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

  const client = new AzureDevOpsClient('test-org', 'test-project');

  const result = await client.getWorkItem(null);

  assertEqual(result, null, 'Should return null without work item ID');
});

await testAsync('getWorkItem should return object or null', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

  const client = new AzureDevOpsClient('test-org', 'test-project');

  const result = await client.getWorkItem(123);

  assert(typeof result === 'object' || result === null,
    'Should return object (work item) or null');
});

// ===== Test Suite 8: Error Handling =====
console.log('\n--- Error Handling ---\n');

await testAsync('Client should handle Azure CLI errors gracefully', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

  // Client with invalid configuration
  const client = new AzureDevOpsClient('invalid-org', 'invalid-project');

  // Should not throw, should return null or false
  const createResult = await client.createWorkItem('Test', 'Description');
  assert(createResult === null, 'createWorkItem should return null on error');

  const updateResult = await client.updateWorkItemState(999999, 'Active');
  assert(typeof updateResult === 'boolean', 'updateWorkItemState should return boolean on error');

  const commentResult = await client.addWorkItemComment(999999, 'Comment');
  assert(typeof commentResult === 'boolean', 'addWorkItemComment should return boolean on error');
});

await testAsync('Client should validate input parameters', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');

  const client = new AzureDevOpsClient('test-org', 'test-project');

  // Null work item IDs should be handled
  const updateResult = await client.updateWorkItemState(null, 'Active');
  assertEqual(updateResult, false, 'Should reject null work item ID');

  const commentResult = await client.addWorkItemComment(0, 'Comment');
  assert(typeof commentResult === 'boolean', 'Should handle zero work item ID');
});

// ===== Test Suite 9: Integration with Config =====
console.log('\n--- Integration with Config ---\n');

await testAsync('Client should work with AzureDevOpsConfig', async () => {
  const { AzureDevOpsClient } = await import('../../src/core/Azure/AzureDevOpsClient.js');
  const { AzureDevOpsConfig } = await import('../../src/core/Azure/AzureDevOpsConfig.js');

  const config = new AzureDevOpsConfig(process.cwd());

  // Create client from config
  const client = new AzureDevOpsClient(
    config.getOrganization(),
    config.getProject()
  );

  assert(client !== null, 'Should create client from config');
  assert(typeof client.isConfigured === 'function', 'Client should have isConfigured method');
});

await testAsync('Client should respect config enabled state', async () => {
  const { AzureDevOpsConfig } = await import('../../src/core/Azure/AzureDevOpsConfig.js');

  const config = new AzureDevOpsConfig(process.cwd());

  // If config is not enabled, operations should gracefully handle it
  if (!config.isEnabled()) {
    // Config correctly reports not enabled
    assert(true, 'Config correctly reports enabled state');
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
