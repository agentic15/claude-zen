#!/usr/bin/env node

/**
 * Integration Tests for create-agentic15-claude-zen
 *
 * Tests package initialization and verifies:
 * - Project structure creation
 * - Template file copying
 * - Bundled scripts/hooks extraction
 * - Configuration correctness
 */

import { execSync } from 'child_process';
import { existsSync, rmSync, readFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PKG_ROOT = join(__dirname, '..');
const CLI_PATH = join(PKG_ROOT, 'bin', 'create-agentic15-claude-zen.js');
const TEST_DIR = join(PKG_ROOT, 'test-output');
const TEST_PROJECT = 'test-project';
const TEST_PATH = join(TEST_DIR, TEST_PROJECT);

// Test utilities
function cleanup() {
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true });
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function testFileExists(filePath, description) {
  const fullPath = join(TEST_PATH, filePath);
  assert(existsSync(fullPath), `${description}: ${filePath} should exist`);
  console.log(`  ✓ ${description}`);
}

function testFileContains(filePath, substring, description) {
  const fullPath = join(TEST_PATH, filePath);
  const content = readFileSync(fullPath, 'utf8');
  assert(content.includes(substring), `${description}: ${filePath} should contain "${substring}"`);
  console.log(`  ✓ ${description}`);
}

// Test suite
console.log('\n🧪 Running integration tests...\n');

try {
  // Setup
  console.log('📦 Setup: Creating test directory');
  cleanup();
  mkdirSync(TEST_DIR, { recursive: true });

  // Test 1: Package initialization
  console.log('\n📋 Test 1: Package initialization without git/npm install');
  execSync(`node "${CLI_PATH}" ${TEST_PROJECT}`, {
    cwd: TEST_DIR,
    stdio: 'ignore',
    env: { ...process.env }
  });

  testFileExists('.', 'Project directory created');
  testFileExists('.claude', '.claude directory created');
  testFileExists('package.json', 'package.json created');
  testFileExists('README.md', 'README.md created');
  testFileExists('.gitignore', '.gitignore created');

  // Test 2: Template structure
  console.log('\n📋 Test 2: Template structure verification');
  testFileExists('.claude/settings.json', 'settings.json exists');
  testFileExists('.claude/PLAN-SCHEMA.json', 'PLAN-SCHEMA.json exists');
  testFileExists('.claude/PROJECT-PLAN-TEMPLATE.json', 'PROJECT-PLAN-TEMPLATE.json exists');
  testFileExists('.claude/hooks/require-active-task.js', 'require-active-task.js hook exists');
  testFileExists('.claude/hooks/session-start-context.js', 'session-start-context.js hook exists');
  testFileExists('.claude/hooks/enforce-plan-template.js', 'enforce-plan-template.js hook exists');
  testFileExists('.claude/hooks/validate-git-workflow.js', 'validate-git-workflow.js hook exists');
  testFileExists('.claude/hooks/post-merge.js', 'post-merge.js hook exists');
  testFileExists('.claude/hooks/start-task.js', 'start-task.js hook exists');
  testFileExists('.claude/hooks/complete-task.js', 'complete-task.js hook exists');

  // Test 3: Configuration correctness
  console.log('\n📋 Test 3: Configuration verification');
  testFileContains('package.json', TEST_PROJECT, 'Project name interpolated in package.json');
  testFileContains('README.md', TEST_PROJECT, 'Project name interpolated in README');
  testFileContains('.claude/settings.json', '.claude/hooks/', 'Hooks reference correct path');

  // Cleanup
  console.log('\n🧹 Cleanup: Removing test directory');
  cleanup();

  console.log('\n✅ All integration tests passed!\n');
  process.exit(0);

} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  if (error.stack) {
    console.error('\nStack trace:');
    console.error(error.stack);
  }

  // Cleanup on failure
  try {
    cleanup();
  } catch (cleanupError) {
    console.error('Warning: Cleanup failed:', cleanupError.message);
  }

  process.exit(1);
}
