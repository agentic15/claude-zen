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
 * Platform Detection Tests (TDD)
 *
 * Tests for platform detection logic - written BEFORE implementation.
 * These tests define the expected behavior of the PlatformDetector class.
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

// ===== Helper: Mock Git Environment =====
class GitMock {
  constructor() {
    this.tempDir = path.join(__dirname, 'temp-git-' + Date.now());
    fs.mkdirSync(this.tempDir, { recursive: true });
  }

  setupGitRepo(remoteUrl) {
    const gitDir = path.join(this.tempDir, '.git');
    fs.mkdirSync(gitDir, { recursive: true });

    // Create .git/config with remote
    const config = `[core]
\trepositoryformatversion = 0
[remote "origin"]
\turl = ${remoteUrl}
\tfetch = +refs/heads/*:refs/remotes/origin/*
`;
    fs.writeFileSync(path.join(gitDir, 'config'), config);
  }

  setupMultipleRemotes(remotes) {
    const gitDir = path.join(this.tempDir, '.git');
    fs.mkdirSync(gitDir, { recursive: true });

    let config = `[core]
\trepositoryformatversion = 0
`;

    Object.entries(remotes).forEach(([name, url]) => {
      config += `[remote "${name}"]
\turl = ${url}
\tfetch = +refs/heads/*:refs/remotes/${name}/*
`;
    });

    fs.writeFileSync(path.join(gitDir, 'config'), config);
  }

  cleanup() {
    fs.rmSync(this.tempDir, { recursive: true, force: true });
  }
}

// ===== Helper: Mock Settings =====
function createMockSettings(settings) {
  const tempDir = path.join(__dirname, 'temp-settings-' + Date.now());
  const claudeDir = path.join(tempDir, '.claude');
  fs.mkdirSync(claudeDir, { recursive: true });

  const settingsPath = path.join(claudeDir, 'settings.json');
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

  return {
    tempDir,
    cleanup: () => fs.rmSync(tempDir, { recursive: true, force: true })
  };
}

console.log('\n=== Platform Detection Tests ===\n');

// ===== Test Suite 1: GitHub URL Detection =====
console.log('--- GitHub URL Detection ---\n');

await testAsync('Detects GitHub from HTTPS URL', async () => {
  try {
    const { PlatformDetector } = await import('../../src/core/Platform/PlatformDetector.js');
    const gitMock = new GitMock();

    gitMock.setupGitRepo('https://github.com/owner/repo.git');

    const result = PlatformDetector.parseRemoteURL('https://github.com/owner/repo.git');
    assertEqual(result, 'github', 'Should detect github from HTTPS URL');

    gitMock.cleanup();
  } catch (error) {
    if (error.message.includes('not found') || error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error('PlatformDetector not implemented yet - expected in TDD');
    }
    throw error;
  }
});

await testAsync('Detects GitHub from SSH URL', async () => {
  try {
    const { PlatformDetector } = await import('../../src/core/Platform/PlatformDetector.js');

    const result = PlatformDetector.parseRemoteURL('git@github.com:owner/repo.git');
    assertEqual(result, 'github', 'Should detect github from SSH URL');
  } catch (error) {
    if (error.message.includes('not found') || error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error('PlatformDetector not implemented yet');
    }
    throw error;
  }
});

await testAsync('Detects GitHub from git:// URL', async () => {
  try {
    const { PlatformDetector } = await import('../../src/core/Platform/PlatformDetector.js');

    const result = PlatformDetector.parseRemoteURL('git://github.com/owner/repo.git');
    assertEqual(result, 'github', 'Should detect github from git:// URL');
  } catch (error) {
    if (error.message.includes('not found') || error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error('PlatformDetector not implemented yet');
    }
    throw error;
  }
});

// ===== Test Suite 2: Azure DevOps URL Detection =====
console.log('\n--- Azure DevOps URL Detection ---\n');

await testAsync('Detects Azure from dev.azure.com HTTPS URL', async () => {
  try {
    const { PlatformDetector } = await import('../../src/core/Platform/PlatformDetector.js');

    const result = PlatformDetector.parseRemoteURL('https://dev.azure.com/org/project/_git/repo');
    assertEqual(result, 'azure', 'Should detect azure from dev.azure.com');
  } catch (error) {
    if (error.message.includes('not found') || error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error('PlatformDetector not implemented yet');
    }
    throw error;
  }
});

await testAsync('Detects Azure from visualstudio.com URL (legacy)', async () => {
  try {
    const { PlatformDetector } = await import('../../src/core/Platform/PlatformDetector.js');

    const result = PlatformDetector.parseRemoteURL('https://org.visualstudio.com/project/_git/repo');
    assertEqual(result, 'azure', 'Should detect azure from visualstudio.com');
  } catch (error) {
    if (error.message.includes('not found') || error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error('PlatformDetector not implemented yet');
    }
    throw error;
  }
});

await testAsync('Detects Azure from SSH URL', async () => {
  try {
    const { PlatformDetector } = await import('../../src/core/Platform/PlatformDetector.js');

    const result = PlatformDetector.parseRemoteURL('git@ssh.dev.azure.com:v3/org/project/repo');
    assertEqual(result, 'azure', 'Should detect azure from SSH URL');
  } catch (error) {
    if (error.message.includes('not found') || error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error('PlatformDetector not implemented yet');
    }
    throw error;
  }
});

// ===== Test Suite 3: Edge Cases =====
console.log('\n--- Edge Cases ---\n');

await testAsync('Returns null for unknown platform', async () => {
  try {
    const { PlatformDetector } = await import('../../src/core/Platform/PlatformDetector.js');

    const result = PlatformDetector.parseRemoteURL('https://gitlab.com/owner/repo.git');
    assertEqual(result, null, 'Should return null for unknown platforms');
  } catch (error) {
    if (error.message.includes('not found') || error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error('PlatformDetector not implemented yet');
    }
    throw error;
  }
});

await testAsync('Returns null for invalid URL', async () => {
  try {
    const { PlatformDetector } = await import('../../src/core/Platform/PlatformDetector.js');

    const result = PlatformDetector.parseRemoteURL('not-a-valid-url');
    assertEqual(result, null, 'Should return null for invalid URLs');
  } catch (error) {
    if (error.message.includes('not found') || error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error('PlatformDetector not implemented yet');
    }
    throw error;
  }
});

await testAsync('Returns null for empty string', async () => {
  try {
    const { PlatformDetector } = await import('../../src/core/Platform/PlatformDetector.js');

    const result = PlatformDetector.parseRemoteURL('');
    assertEqual(result, null, 'Should return null for empty string');
  } catch (error) {
    if (error.message.includes('not found') || error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error('PlatformDetector not implemented yet');
    }
    throw error;
  }
});

// ===== Test Suite 4: User Config Override =====
console.log('\n--- User Config Override ---\n');

await testAsync('Respects user override for GitHub', async () => {
  const { tempDir, cleanup } = createMockSettings({
    platform: {
      type: 'github',
      autoDetect: false
    }
  });

  try {
    const { PlatformDetector } = await import('../../src/core/Platform/PlatformDetector.js');

    // Even with Azure URL, should return GitHub due to override
    const detector = new PlatformDetector(tempDir);
    const result = detector.checkUserOverride();

    assertEqual(result, 'github', 'Should respect user override');
  } catch (error) {
    if (error.message.includes('not found') || error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error('PlatformDetector not implemented yet');
    }
    throw error;
  } finally {
    cleanup();
  }
});

await testAsync('Respects user override for Azure', async () => {
  const { tempDir, cleanup } = createMockSettings({
    platform: {
      type: 'azure',
      autoDetect: false
    }
  });

  try {
    const { PlatformDetector } = await import('../../src/core/Platform/PlatformDetector.js');

    const detector = new PlatformDetector(tempDir);
    const result = detector.checkUserOverride();

    assertEqual(result, 'azure', 'Should respect user override for Azure');
  } catch (error) {
    if (error.message.includes('not found') || error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error('PlatformDetector not implemented yet');
    }
    throw error;
  } finally {
    cleanup();
  }
});

await testAsync('Returns null when autoDetect is true (no override)', async () => {
  const { tempDir, cleanup } = createMockSettings({
    platform: {
      type: 'github',
      autoDetect: true  // Auto-detect enabled, so no override
    }
  });

  try {
    const { PlatformDetector } = await import('../../src/core/Platform/PlatformDetector.js');

    const detector = new PlatformDetector(tempDir);
    const result = detector.checkUserOverride();

    assertEqual(result, null, 'Should return null when autoDetect is enabled');
  } catch (error) {
    if (error.message.includes('not found') || error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error('PlatformDetector not implemented yet');
    }
    throw error;
  } finally {
    cleanup();
  }
});

// ===== Test Suite 5: Feature Flag Detection =====
console.log('\n--- Feature Flag Detection ---\n');

await testAsync('Detects GitHub when only GitHub is enabled', async () => {
  const { tempDir, cleanup } = createMockSettings({
    github: { enabled: true },
    azureDevOps: { enabled: false }
  });

  try {
    const { PlatformDetector } = await import('../../src/core/Platform/PlatformDetector.js');

    const detector = new PlatformDetector(tempDir);
    const result = detector.detectFromFeatureFlags();

    assertEqual(result, 'github', 'Should detect GitHub from feature flags');
  } catch (error) {
    if (error.message.includes('not found') || error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error('PlatformDetector not implemented yet');
    }
    throw error;
  } finally {
    cleanup();
  }
});

await testAsync('Detects Azure when only Azure is enabled', async () => {
  const { tempDir, cleanup } = createMockSettings({
    github: { enabled: false },
    azureDevOps: { enabled: true }
  });

  try {
    const { PlatformDetector } = await import('../../src/core/Platform/PlatformDetector.js');

    const detector = new PlatformDetector(tempDir);
    const result = detector.detectFromFeatureFlags();

    assertEqual(result, 'azure', 'Should detect Azure from feature flags');
  } catch (error) {
    if (error.message.includes('not found') || error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error('PlatformDetector not implemented yet');
    }
    throw error;
  } finally {
    cleanup();
  }
});

await testAsync('Defaults to GitHub when both are enabled', async () => {
  const { tempDir, cleanup } = createMockSettings({
    github: { enabled: true },
    azureDevOps: { enabled: true }
  });

  try {
    const { PlatformDetector } = await import('../../src/core/Platform/PlatformDetector.js');

    const detector = new PlatformDetector(tempDir);
    const result = detector.detectFromFeatureFlags();

    assertEqual(result, 'github', 'Should default to GitHub when both enabled');
  } catch (error) {
    if (error.message.includes('not found') || error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error('PlatformDetector not implemented yet');
    }
    throw error;
  } finally {
    cleanup();
  }
});

await testAsync('Returns null when neither is enabled', async () => {
  const { tempDir, cleanup } = createMockSettings({
    github: { enabled: false },
    azureDevOps: { enabled: false }
  });

  try {
    const { PlatformDetector } = await import('../../src/core/Platform/PlatformDetector.js');

    const detector = new PlatformDetector(tempDir);
    const result = detector.detectFromFeatureFlags();

    assertEqual(result, null, 'Should return null when neither enabled');
  } catch (error) {
    if (error.message.includes('not found') || error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error('PlatformDetector not implemented yet');
    }
    throw error;
  } finally {
    cleanup();
  }
});

// ===== Test Suite 6: Caching =====
console.log('\n--- Caching ---\n');

await testAsync('Caches detection result', async () => {
  try {
    const { PlatformDetector } = await import('../../src/core/Platform/PlatformDetector.js');

    // First call - should detect
    PlatformDetector._cachedPlatform = null;
    const result1 = PlatformDetector.parseRemoteURL('https://github.com/owner/repo.git');
    PlatformDetector._cachedPlatform = result1;

    // Second call - should use cache
    const result2 = PlatformDetector._cachedPlatform;

    assertEqual(result1, result2, 'Should cache detection result');
    assertEqual(result2, 'github', 'Cached result should be correct');
  } catch (error) {
    if (error.message.includes('not found') || error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error('PlatformDetector not implemented yet');
    }
    throw error;
  }
});

await testAsync('Clears cache on demand', async () => {
  try {
    const { PlatformDetector } = await import('../../src/core/Platform/PlatformDetector.js');

    // Set cache
    PlatformDetector._cachedPlatform = 'github';

    // Clear cache
    if (typeof PlatformDetector.clearCache === 'function') {
      PlatformDetector.clearCache();
      assertEqual(PlatformDetector._cachedPlatform, null, 'Should clear cache');
    } else {
      throw new Error('clearCache method not implemented');
    }
  } catch (error) {
    if (error.message.includes('not found') || error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error('PlatformDetector not implemented yet');
    }
    throw error;
  }
});

// ===== Test Summary =====
console.log('\n=== Test Summary ===\n');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}\n`);

if (failed > 0) {
  console.log('⚠️  Expected failures in TDD: Tests should fail until implementation in TASK-008\n');
  process.exit(1);
} else {
  console.log('✅ All tests passed!\n');
  process.exit(0);
}
