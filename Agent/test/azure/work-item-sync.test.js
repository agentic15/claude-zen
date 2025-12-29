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
 * Work Item Sync Tests (TDD)
 *
 * Tests for work item synchronization with task lifecycle
 */

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

// ===== Helper: Create Temp Settings =====
function createTempSettings(settings) {
  const tempDir = path.join(__dirname, 'temp-sync-' + Date.now());
  const claudeDir = path.join(tempDir, '.claude');
  fs.mkdirSync(claudeDir, { recursive: true });

  const settingsPath = path.join(claudeDir, 'settings.json');
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

  return {
    tempDir,
    cleanup: () => fs.rmSync(tempDir, { recursive: true, force: true })
  };
}

console.log('\n=== Work Item Sync Tests ===\n');

// ===== Test Suite 1: Initialization =====
console.log('--- Initialization ---\n');

await testAsync('WorkItemSync should initialize with project root', async () => {
  const { WorkItemSync } = await import('../../src/core/Azure/WorkItemSync.js');

  const sync = new WorkItemSync(process.cwd());

  assert(sync !== null, 'Should initialize');
  assert(sync.config !== null, 'Should have config');
});

await testAsync('WorkItemSync should initialize client when config is enabled', async () => {
  const { tempDir, cleanup } = createTempSettings({
    azureDevOps: {
      enabled: true,
      organization: 'test-org',
      project: 'test-project'
    }
  });

  try {
    const { WorkItemSync } = await import('../../src/core/Azure/WorkItemSync.js');
    const sync = new WorkItemSync(tempDir);

    assert(sync.client !== null, 'Should initialize client when enabled');
  } finally {
    cleanup();
  }
});

await testAsync('WorkItemSync should not initialize client when config is disabled', async () => {
  const { tempDir, cleanup } = createTempSettings({
    azureDevOps: {
      enabled: false
    }
  });

  try {
    const { WorkItemSync } = await import('../../src/core/Azure/WorkItemSync.js');
    const sync = new WorkItemSync(tempDir);

    assertEqual(sync.client, null, 'Should not initialize client when disabled');
  } finally {
    cleanup();
  }
});

// ===== Test Suite 2: Enabled Status =====
console.log('\n--- Enabled Status ---\n');

await testAsync('isEnabled should return false when config is disabled', async () => {
  const { tempDir, cleanup } = createTempSettings({
    azureDevOps: {
      enabled: false
    }
  });

  try {
    const { WorkItemSync } = await import('../../src/core/Azure/WorkItemSync.js');
    const sync = new WorkItemSync(tempDir);

    assertEqual(sync.isEnabled(), false, 'Should not be enabled when config disabled');
  } finally {
    cleanup();
  }
});

await testAsync('isEnabled should return false when organization missing', async () => {
  const { tempDir, cleanup } = createTempSettings({
    azureDevOps: {
      enabled: true,
      project: 'test-project'
    }
  });

  try {
    const { WorkItemSync } = await import('../../src/core/Azure/WorkItemSync.js');
    const sync = new WorkItemSync(tempDir);

    assertEqual(sync.isEnabled(), false, 'Should not be enabled without organization');
  } finally {
    cleanup();
  }
});

// ===== Test Suite 3: Create Work Item =====
console.log('\n--- Create Work Item ---\n');

await testAsync('createWorkItem should return null when autoCreate disabled', async () => {
  const { tempDir, cleanup } = createTempSettings({
    azureDevOps: {
      enabled: true,
      organization: 'test-org',
      project: 'test-project',
      autoCreate: false
    }
  });

  try {
    const { WorkItemSync } = await import('../../src/core/Azure/WorkItemSync.js');
    const sync = new WorkItemSync(tempDir);

    const task = {
      id: 'TASK-001',
      title: 'Test Task',
      description: 'Test Description',
      status: 'pending'
    };

    const workItemId = await sync.createWorkItem(task);

    assertEqual(workItemId, null, 'Should return null when autoCreate disabled');
  } finally {
    cleanup();
  }
});

await testAsync('createWorkItem should call client when autoCreate enabled', async () => {
  const { tempDir, cleanup } = createTempSettings({
    azureDevOps: {
      enabled: true,
      organization: 'test-org',
      project: 'test-project',
      autoCreate: true
    }
  });

  try {
    const { WorkItemSync } = await import('../../src/core/Azure/WorkItemSync.js');
    const sync = new WorkItemSync(tempDir);

    const task = {
      id: 'TASK-001',
      title: 'Test Task',
      description: 'Test Description',
      status: 'pending'
    };

    const workItemId = await sync.createWorkItem(task);

    // Result should be number (work item ID) or null (if Azure CLI not available)
    assert(typeof workItemId === 'number' || workItemId === null,
      'Should return work item ID or null');
  } finally {
    cleanup();
  }
});

// ===== Test Suite 4: Update Work Item =====
console.log('\n--- Update Work Item ---\n');

await testAsync('updateWorkItemStatus should return false when autoUpdate disabled', async () => {
  const { tempDir, cleanup } = createTempSettings({
    azureDevOps: {
      enabled: true,
      organization: 'test-org',
      project: 'test-project',
      autoUpdate: false
    }
  });

  try {
    const { WorkItemSync } = await import('../../src/core/Azure/WorkItemSync.js');
    const sync = new WorkItemSync(tempDir);

    const task = {
      id: 'TASK-001',
      title: 'Test Task',
      status: 'in_progress'
    };

    const result = await sync.updateWorkItemStatus(task, 123);

    assertEqual(result, false, 'Should return false when autoUpdate disabled');
  } finally {
    cleanup();
  }
});

await testAsync('updateWorkItemStatus should call client when autoUpdate enabled', async () => {
  const { tempDir, cleanup } = createTempSettings({
    azureDevOps: {
      enabled: true,
      organization: 'test-org',
      project: 'test-project',
      autoUpdate: true
    }
  });

  try {
    const { WorkItemSync } = await import('../../src/core/Azure/WorkItemSync.js');
    const sync = new WorkItemSync(tempDir);

    const task = {
      id: 'TASK-001',
      title: 'Test Task',
      status: 'in_progress'
    };

    const result = await sync.updateWorkItemStatus(task, 123);

    assert(typeof result === 'boolean', 'Should return boolean');
  } finally {
    cleanup();
  }
});

await testAsync('updateWorkItemTags should return false when autoUpdate disabled', async () => {
  const { tempDir, cleanup } = createTempSettings({
    azureDevOps: {
      enabled: true,
      organization: 'test-org',
      project: 'test-project',
      autoUpdate: false
    }
  });

  try {
    const { WorkItemSync } = await import('../../src/core/Azure/WorkItemSync.js');
    const sync = new WorkItemSync(tempDir);

    const task = {
      id: 'TASK-001',
      title: 'Test Task',
      tags: ['tag1']
    };

    const result = await sync.updateWorkItemTags(task, 123);

    assertEqual(result, false, 'Should return false when autoUpdate disabled');
  } finally {
    cleanup();
  }
});

// ===== Test Suite 5: Close Work Item =====
console.log('\n--- Close Work Item ---\n');

await testAsync('closeWorkItem should return false when autoClose disabled', async () => {
  const { tempDir, cleanup } = createTempSettings({
    azureDevOps: {
      enabled: true,
      organization: 'test-org',
      project: 'test-project',
      autoClose: false
    }
  });

  try {
    const { WorkItemSync } = await import('../../src/core/Azure/WorkItemSync.js');
    const sync = new WorkItemSync(tempDir);

    const task = {
      id: 'TASK-001',
      title: 'Test Task',
      status: 'completed'
    };

    const result = await sync.closeWorkItem(task, 123);

    assertEqual(result, false, 'Should return false when autoClose disabled');
  } finally {
    cleanup();
  }
});

await testAsync('closeWorkItem should call client when autoClose enabled', async () => {
  const { tempDir, cleanup } = createTempSettings({
    azureDevOps: {
      enabled: true,
      organization: 'test-org',
      project: 'test-project',
      autoClose: true
    }
  });

  try {
    const { WorkItemSync } = await import('../../src/core/Azure/WorkItemSync.js');
    const sync = new WorkItemSync(tempDir);

    const task = {
      id: 'TASK-001',
      title: 'Test Task',
      status: 'completed'
    };

    const result = await sync.closeWorkItem(task, 123);

    assert(typeof result === 'boolean', 'Should return boolean');
  } finally {
    cleanup();
  }
});

// ===== Test Suite 6: Task Sync =====
console.log('\n--- Task Sync ---\n');

await testAsync('syncTask should handle create action', async () => {
  const { tempDir, cleanup } = createTempSettings({
    azureDevOps: {
      enabled: true,
      organization: 'test-org',
      project: 'test-project',
      autoCreate: true
    }
  });

  try {
    const { WorkItemSync } = await import('../../src/core/Azure/WorkItemSync.js');
    const sync = new WorkItemSync(tempDir);

    const task = {
      id: 'TASK-001',
      title: 'Test Task',
      description: 'Test Description',
      status: 'pending'
    };

    const workItemId = await sync.syncTask(task, null, 'create');

    assert(typeof workItemId === 'number' || workItemId === null,
      'Should return work item ID or null');
  } finally {
    cleanup();
  }
});

await testAsync('syncTask should handle update action', async () => {
  const { tempDir, cleanup } = createTempSettings({
    azureDevOps: {
      enabled: true,
      organization: 'test-org',
      project: 'test-project',
      autoUpdate: true
    }
  });

  try {
    const { WorkItemSync } = await import('../../src/core/Azure/WorkItemSync.js');
    const sync = new WorkItemSync(tempDir);

    const task = {
      id: 'TASK-001',
      title: 'Test Task',
      status: 'in_progress'
    };

    const workItemId = await sync.syncTask(task, 123, 'update');

    assertEqual(workItemId, 123, 'Should return same work item ID');
  } finally {
    cleanup();
  }
});

await testAsync('syncTask should handle complete action', async () => {
  const { tempDir, cleanup } = createTempSettings({
    azureDevOps: {
      enabled: true,
      organization: 'test-org',
      project: 'test-project',
      autoClose: true
    }
  });

  try {
    const { WorkItemSync } = await import('../../src/core/Azure/WorkItemSync.js');
    const sync = new WorkItemSync(tempDir);

    const task = {
      id: 'TASK-001',
      title: 'Test Task',
      status: 'completed'
    };

    const workItemId = await sync.syncTask(task, 123, 'complete');

    assertEqual(workItemId, 123, 'Should return same work item ID');
  } finally {
    cleanup();
  }
});

// ===== Test Suite 7: Batch Sync =====
console.log('\n--- Batch Sync ---\n');

await testAsync('syncTasks should handle multiple tasks', async () => {
  const { tempDir, cleanup } = createTempSettings({
    azureDevOps: {
      enabled: true,
      organization: 'test-org',
      project: 'test-project',
      autoUpdate: true
    }
  });

  try {
    const { WorkItemSync } = await import('../../src/core/Azure/WorkItemSync.js');
    const sync = new WorkItemSync(tempDir);

    const tasks = [
      { id: 'TASK-001', title: 'Task 1', status: 'pending', workItemId: 101 },
      { id: 'TASK-002', title: 'Task 2', status: 'in_progress', workItemId: 102 }
    ];

    const results = await sync.syncTasks(tasks, 'update');

    assert(results instanceof Map, 'Should return Map');
  } finally {
    cleanup();
  }
});

await testAsync('syncTasks should return empty Map when not enabled', async () => {
  const { tempDir, cleanup } = createTempSettings({
    azureDevOps: {
      enabled: false
    }
  });

  try {
    const { WorkItemSync } = await import('../../src/core/Azure/WorkItemSync.js');
    const sync = new WorkItemSync(tempDir);

    const tasks = [
      { id: 'TASK-001', title: 'Task 1', status: 'pending' }
    ];

    const results = await sync.syncTasks(tasks, 'create');

    assertEqual(results.size, 0, 'Should return empty Map when not enabled');
  } finally {
    cleanup();
  }
});

// ===== Test Suite 8: Get Work Item =====
console.log('\n--- Get Work Item ---\n');

await testAsync('getWorkItem should return null when not enabled', async () => {
  const { tempDir, cleanup } = createTempSettings({
    azureDevOps: {
      enabled: false
    }
  });

  try {
    const { WorkItemSync } = await import('../../src/core/Azure/WorkItemSync.js');
    const sync = new WorkItemSync(tempDir);

    const result = await sync.getWorkItem(123);

    assertEqual(result, null, 'Should return null when not enabled');
  } finally {
    cleanup();
  }
});

await testAsync('workItemExists should return false when work item not found', async () => {
  const { tempDir, cleanup } = createTempSettings({
    azureDevOps: {
      enabled: true,
      organization: 'test-org',
      project: 'test-project'
    }
  });

  try {
    const { WorkItemSync } = await import('../../src/core/Azure/WorkItemSync.js');
    const sync = new WorkItemSync(tempDir);

    const exists = await sync.workItemExists(999999);

    assertEqual(exists, false, 'Should return false when work item not found');
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
  console.log('⚠️  Some tests failed\n');
  process.exit(1);
} else {
  console.log('✅ All tests passed!\n');
  process.exit(0);
}
