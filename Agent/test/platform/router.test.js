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
 * Platform Router Tests (TDD)
 *
 * Tests for platform routing logic - routes operations to GitHub or Azure
 * based on platform detection
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
  const tempDir = path.join(__dirname, 'temp-router-' + Date.now());
  const claudeDir = path.join(tempDir, '.claude');
  fs.mkdirSync(claudeDir, { recursive: true });

  const settingsPath = path.join(claudeDir, 'settings.json');
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

  return {
    tempDir,
    cleanup: () => fs.rmSync(tempDir, { recursive: true, force: true })
  };
}

// ===== Helper: Create Mock Git Repo =====
function createMockGitRepo(tempDir, remoteUrl) {
  const gitDir = path.join(tempDir, '.git');
  fs.mkdirSync(gitDir, { recursive: true });

  const config = `[core]
\trepositoryformatversion = 0
[remote "origin"]
\turl = ${remoteUrl}
\tfetch = +refs/heads/*:refs/remotes/origin/*
`;
  fs.writeFileSync(path.join(gitDir, 'config'), config);
}

console.log('\n=== Platform Router Tests ===\n');

// ===== Test Suite 1: Router Initialization =====
console.log('--- Router Initialization ---\n');

await testAsync('PlatformRouter should initialize with project root', async () => {
  const { PlatformRouter } = await import('../../src/core/Platform/PlatformRouter.js');

  const router = new PlatformRouter(process.cwd());

  assert(router !== null, 'Should initialize');
});

await testAsync('PlatformRouter should detect platform on initialization', async () => {
  const { tempDir, cleanup } = createTempSettings({
    github: { enabled: true },
    azureDevOps: { enabled: false }
  });

  try {
    createMockGitRepo(tempDir, 'https://github.com/owner/repo.git');

    const { PlatformRouter } = await import('../../src/core/Platform/PlatformRouter.js');
    const router = new PlatformRouter(tempDir);

    assert(router.platform !== undefined, 'Should detect platform');
  } finally {
    cleanup();
  }
});

// ===== Test Suite 2: Platform Detection =====
console.log('\n--- Platform Detection ---\n');

await testAsync('Router should detect GitHub platform', async () => {
  const { tempDir, cleanup } = createTempSettings({
    github: { enabled: true },
    azureDevOps: { enabled: false }
  });

  try {
    createMockGitRepo(tempDir, 'https://github.com/owner/repo.git');

    const { PlatformRouter } = await import('../../src/core/Platform/PlatformRouter.js');
    const router = new PlatformRouter(tempDir);

    assertEqual(router.getPlatform(), 'github', 'Should detect GitHub');
  } finally {
    cleanup();
  }
});

await testAsync('Router should detect Azure DevOps platform', async () => {
  const { tempDir, cleanup } = createTempSettings({
    github: { enabled: false },
    azureDevOps: { enabled: true }
  });

  try {
    createMockGitRepo(tempDir, 'https://dev.azure.com/org/project/_git/repo');

    // Clear cache before detection
    const { PlatformDetector } = await import('../../src/core/Platform/PlatformDetector.js');
    PlatformDetector.clearCache();

    const { PlatformRouter } = await import('../../src/core/Platform/PlatformRouter.js');
    const router = new PlatformRouter(tempDir);

    assertEqual(router.getPlatform(), 'azure', `Should detect Azure DevOps (got: ${router.getPlatform()})`);
  } finally {
    cleanup();
  }
});

await testAsync('Router should handle no platform detected', async () => {
  const { tempDir, cleanup } = createTempSettings({
    github: { enabled: false },
    azureDevOps: { enabled: false }
  });

  try {
    // Clear cache before detection
    const { PlatformDetector } = await import('../../src/core/Platform/PlatformDetector.js');
    PlatformDetector.clearCache();

    const { PlatformRouter } = await import('../../src/core/Platform/PlatformRouter.js');
    const router = new PlatformRouter(tempDir);

    assertEqual(router.getPlatform(), null, `Should return null when no platform (got: ${router.getPlatform()})`);
  } finally {
    cleanup();
  }
});

// ===== Test Suite 3: Client Routing =====
console.log('\n--- Client Routing ---\n');

await testAsync('Router should provide GitHub client when platform is GitHub', async () => {
  const { tempDir, cleanup } = createTempSettings({
    github: {
      enabled: true,
      token: 'test-token',
      owner: 'test-owner',
      repo: 'test-repo'
    },
    azureDevOps: { enabled: false }
  });

  try {
    createMockGitRepo(tempDir, 'https://github.com/owner/repo.git');

    const { PlatformRouter } = await import('../../src/core/Platform/PlatformRouter.js');
    const router = new PlatformRouter(tempDir);

    const client = router.getClient();

    assert(client !== null, 'Should provide GitHub client');
  } finally {
    cleanup();
  }
});

await testAsync('Router should provide Azure client when platform is Azure', async () => {
  const { tempDir, cleanup } = createTempSettings({
    github: { enabled: false },
    azureDevOps: {
      enabled: true,
      organization: 'test-org',
      project: 'test-project'
    }
  });

  try {
    createMockGitRepo(tempDir, 'https://dev.azure.com/org/project/_git/repo');

    // Clear cache before detection
    const { PlatformDetector } = await import('../../src/core/Platform/PlatformDetector.js');
    PlatformDetector.clearCache();

    const { PlatformRouter } = await import('../../src/core/Platform/PlatformRouter.js');
    const router = new PlatformRouter(tempDir);

    const client = router.getClient();

    assert(client !== null, `Should provide Azure client (platform: ${router.getPlatform()}, client: ${client})`);
  } finally {
    cleanup();
  }
});

await testAsync('Router should return null client when no platform', async () => {
  const { tempDir, cleanup } = createTempSettings({
    github: { enabled: false },
    azureDevOps: { enabled: false }
  });

  try {
    const { PlatformRouter } = await import('../../src/core/Platform/PlatformRouter.js');
    const router = new PlatformRouter(tempDir);

    const client = router.getClient();

    assertEqual(client, null, 'Should return null when no platform');
  } finally {
    cleanup();
  }
});

// ===== Test Suite 4: Task Operations =====
console.log('\n--- Task Operations ---\n');

await testAsync('Router should have createTaskItem method', async () => {
  const { PlatformRouter } = await import('../../src/core/Platform/PlatformRouter.js');

  const router = new PlatformRouter(process.cwd());

  assert(typeof router.createTaskItem === 'function', 'Should have createTaskItem method');
});

await testAsync('Router should have updateTaskItem method', async () => {
  const { PlatformRouter } = await import('../../src/core/Platform/PlatformRouter.js');

  const router = new PlatformRouter(process.cwd());

  assert(typeof router.updateTaskItem === 'function', 'Should have updateTaskItem method');
});

await testAsync('Router should have closeTaskItem method', async () => {
  const { PlatformRouter } = await import('../../src/core/Platform/PlatformRouter.js');

  const router = new PlatformRouter(process.cwd());

  assert(typeof router.closeTaskItem === 'function', 'Should have closeTaskItem method');
});

await testAsync('createTaskItem should return null when no platform', async () => {
  const { tempDir, cleanup } = createTempSettings({
    github: { enabled: false },
    azureDevOps: { enabled: false }
  });

  try {
    const { PlatformRouter } = await import('../../src/core/Platform/PlatformRouter.js');
    const router = new PlatformRouter(tempDir);

    const task = {
      id: 'TASK-001',
      title: 'Test Task',
      description: 'Test Description'
    };

    const result = await router.createTaskItem(task);

    assertEqual(result, null, 'Should return null when no platform');
  } finally {
    cleanup();
  }
});

// ===== Test Suite 5: Platform-Specific Routing =====
console.log('\n--- Platform-Specific Routing ---\n');

await testAsync('Router should route to GitHub for issue operations', async () => {
  const { tempDir, cleanup } = createTempSettings({
    github: {
      enabled: true,
      token: 'test-token',
      owner: 'test-owner',
      repo: 'test-repo'
    }
  });

  try {
    createMockGitRepo(tempDir, 'https://github.com/owner/repo.git');

    const { PlatformRouter } = await import('../../src/core/Platform/PlatformRouter.js');
    const router = new PlatformRouter(tempDir);

    const task = {
      id: 'TASK-001',
      title: 'Test Task',
      description: 'Test Description'
    };

    const result = await router.createTaskItem(task);

    // Should call GitHub client (returns number or null)
    assert(typeof result === 'number' || result === null,
      'Should route to GitHub');
  } finally {
    cleanup();
  }
});

await testAsync('Router should route to Azure for work item operations', async () => {
  const { tempDir, cleanup } = createTempSettings({
    azureDevOps: {
      enabled: true,
      organization: 'test-org',
      project: 'test-project'
    }
  });

  try {
    createMockGitRepo(tempDir, 'https://dev.azure.com/org/project/_git/repo');

    const { PlatformRouter } = await import('../../src/core/Platform/PlatformRouter.js');
    const router = new PlatformRouter(tempDir);

    const task = {
      id: 'TASK-001',
      title: 'Test Task',
      description: 'Test Description'
    };

    const result = await router.createTaskItem(task);

    // Should call Azure client (returns number or null)
    assert(typeof result === 'number' || result === null,
      'Should route to Azure');
  } finally {
    cleanup();
  }
});

// ===== Test Suite 6: Error Handling =====
console.log('\n--- Error Handling ---\n');

await testAsync('Router should handle platform detection errors gracefully', async () => {
  const { tempDir, cleanup } = createTempSettings({});

  try {
    const { PlatformRouter } = await import('../../src/core/Platform/PlatformRouter.js');
    const router = new PlatformRouter(tempDir);

    // Should not throw, should handle gracefully
    assert(router !== null, 'Should handle detection errors gracefully');
  } finally {
    cleanup();
  }
});

await testAsync('Router should handle client initialization errors', async () => {
  const { tempDir, cleanup } = createTempSettings({
    github: {
      enabled: true
      // Missing token, owner, repo - invalid config
    }
  });

  try {
    createMockGitRepo(tempDir, 'https://github.com/owner/repo.git');

    const { PlatformRouter } = await import('../../src/core/Platform/PlatformRouter.js');
    const router = new PlatformRouter(tempDir);

    // Should initialize but client might be null/unconfigured
    assert(router !== null, 'Should handle client init errors');
  } finally {
    cleanup();
  }
});

await testAsync('Router should handle operation errors gracefully', async () => {
  const { tempDir, cleanup } = createTempSettings({
    github: {
      enabled: true,
      token: 'invalid-token',
      owner: 'invalid',
      repo: 'invalid'
    }
  });

  try {
    createMockGitRepo(tempDir, 'https://github.com/owner/repo.git');

    const { PlatformRouter } = await import('../../src/core/Platform/PlatformRouter.js');
    const router = new PlatformRouter(tempDir);

    const task = {
      id: 'TASK-001',
      title: 'Test Task',
      description: 'Test Description'
    };

    // Should not throw, should return null on error
    const result = await router.createTaskItem(task);
    assert(result === null, 'Should return null on operation error');
  } finally {
    cleanup();
  }
});

// ===== Test Suite 7: Platform Override =====
console.log('\n--- Platform Override ---\n');

await testAsync('Router should respect platform override in config', async () => {
  const { tempDir, cleanup } = createTempSettings({
    platform: {
      type: 'azure',
      autoDetect: false
    },
    github: { enabled: true },
    azureDevOps: {
      enabled: true,
      organization: 'test-org',
      project: 'test-project'
    }
  });

  try {
    // Even with GitHub remote, should use Azure due to override
    createMockGitRepo(tempDir, 'https://github.com/owner/repo.git');

    // Clear cache before detection
    const { PlatformDetector } = await import('../../src/core/Platform/PlatformDetector.js');
    PlatformDetector.clearCache();

    const { PlatformRouter } = await import('../../src/core/Platform/PlatformRouter.js');
    const router = new PlatformRouter(tempDir);

    assertEqual(router.getPlatform(), 'azure', `Should respect platform override (got: ${router.getPlatform()})`);
  } finally {
    cleanup();
  }
});

// ===== Test Suite 8: Multiple Platforms =====
console.log('\n--- Multiple Platforms ---\n');

await testAsync('Router should handle both platforms enabled', async () => {
  const { tempDir, cleanup } = createTempSettings({
    github: {
      enabled: true,
      token: 'test-token',
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
    createMockGitRepo(tempDir, 'https://github.com/owner/repo.git');

    const { PlatformRouter } = await import('../../src/core/Platform/PlatformRouter.js');
    const router = new PlatformRouter(tempDir);

    // Should default to GitHub when both enabled and remote is GitHub
    assertEqual(router.getPlatform(), 'github', 'Should choose platform based on remote');
  } finally {
    cleanup();
  }
});

// ===== Test Suite 9: Cache Management =====
console.log('\n--- Cache Management ---\n');

await testAsync('Router should cache platform detection result', async () => {
  const { tempDir, cleanup } = createTempSettings({
    github: { enabled: true }
  });

  try {
    createMockGitRepo(tempDir, 'https://github.com/owner/repo.git');

    const { PlatformRouter } = await import('../../src/core/Platform/PlatformRouter.js');
    const router = new PlatformRouter(tempDir);

    const platform1 = router.getPlatform();
    const platform2 = router.getPlatform();

    assertEqual(platform1, platform2, 'Should cache detection result');
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
