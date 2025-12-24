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
  testFileExists('.claude/CLAUDE.md', 'CLAUDE.md exists');
  testFileExists('.claude/PLAN-SCHEMA.json', 'PLAN-SCHEMA.json exists');
  testFileExists('.claude/PROJECT-PLAN-TEMPLATE.json', 'PROJECT-PLAN-TEMPLATE.json exists');

  // Test 3: Bundled files extraction
  console.log('\n📋 Test 3: Bundled files extraction');
  testFileExists('node_modules/.agentic15-claude-zen/scripts', 'Scripts bundle directory exists');
  testFileExists('node_modules/.agentic15-claude-zen/hooks', 'Hooks bundle directory exists');
  testFileExists('node_modules/.agentic15-claude-zen/scripts/task-start.js', 'task-start.js extracted');
  testFileExists('node_modules/.agentic15-claude-zen/scripts/task-done.js', 'task-done.js extracted');
  testFileExists('node_modules/.agentic15-claude-zen/scripts/task-next.js', 'task-next.js extracted');
  testFileExists('node_modules/.agentic15-claude-zen/scripts/plan-init.js', 'plan-init.js extracted');
  testFileExists('node_modules/.agentic15-claude-zen/hooks/enforce-structured-development.js', 'Hook extracted');

  // Test 4: Configuration correctness
  console.log('\n📋 Test 4: Configuration verification');
  testFileContains('package.json', TEST_PROJECT, 'Project name interpolated in package.json');
  testFileContains('package.json', 'node_modules/.agentic15-claude-zen/scripts', 'Scripts reference bundled path');
  testFileContains('README.md', TEST_PROJECT, 'Project name interpolated in README');
  testFileContains('.claude/settings.json', 'node_modules/.agentic15-claude-zen/hooks', 'Hooks reference bundled path');

  // Test 5: Script executability
  console.log('\n📋 Test 5: npm scripts availability');
  const packageJson = JSON.parse(readFileSync(join(TEST_PATH, 'package.json'), 'utf8'));
  assert(packageJson.scripts['task:start'], 'task:start script exists');
  assert(packageJson.scripts['task:done'], 'task:done script exists');
  assert(packageJson.scripts['task:next'], 'task:next script exists');
  assert(packageJson.scripts['plan:init'], 'plan:init script exists');
  assert(packageJson.scripts['plan:create'], 'plan:create script exists');
  console.log('  ✓ All required npm scripts defined');

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
