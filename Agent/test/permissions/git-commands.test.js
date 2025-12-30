#!/usr/bin/env node

/**
 * Git Command Permissions Tests
 *
 * Verifies that git command permissions are correctly configured:
 * - Read-only commands are allowed
 * - Write/destructive commands are blocked
 * - No blanket git:* deny that would override allows
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test utilities
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function testCommandAllowed(settings, command, description) {
  const pattern = `Bash(${command}:*)`;
  assert(
    settings.permissions.allow.includes(pattern),
    `${description}: ${pattern} should be in allow list`
  );
  console.log(`  ✓ ${description}`);
}

function testCommandDenied(settings, command, description) {
  const pattern = `Bash(${command}:*)`;
  assert(
    settings.permissions.deny.includes(pattern),
    `${description}: ${pattern} should be in deny list`
  );
  console.log(`  ✓ ${description}`);
}

function testCommandNotDenied(settings, command, description) {
  const pattern = `Bash(${command}:*)`;
  assert(
    !settings.permissions.deny.includes(pattern),
    `${description}: ${pattern} should NOT be in deny list`
  );
  console.log(`  ✓ ${description}`);
}

// Load settings
console.log('\n🧪 Running Git Command Permissions Tests...\n');

try {
  const settingsPath = join(__dirname, '../../framework/settings.json');
  const settings = JSON.parse(readFileSync(settingsPath, 'utf-8'));

  // Test 1: Read-only commands are allowed
  console.log('📋 Test 1: Read-only git commands should be ALLOWED');
  testCommandAllowed(settings, 'git status', 'git status allowed');
  testCommandAllowed(settings, 'git branch', 'git branch allowed');
  testCommandAllowed(settings, 'git log', 'git log allowed');
  testCommandAllowed(settings, 'git diff', 'git diff allowed');
  testCommandAllowed(settings, 'git remote get-url', 'git remote get-url allowed');
  testCommandAllowed(settings, 'git rev-parse', 'git rev-parse allowed');
  testCommandAllowed(settings, 'git describe', 'git describe allowed');

  // Test 2: Write/destructive commands are denied
  console.log('\n📋 Test 2: Write/destructive git commands should be DENIED');
  testCommandDenied(settings, 'git commit', 'git commit denied');
  testCommandDenied(settings, 'git push', 'git push denied');
  testCommandDenied(settings, 'git checkout', 'git checkout denied');
  testCommandDenied(settings, 'git merge', 'git merge denied');
  testCommandDenied(settings, 'git reset', 'git reset denied');
  testCommandDenied(settings, 'git rebase', 'git rebase denied');
  testCommandDenied(settings, 'git cherry-pick', 'git cherry-pick denied');

  // Test 3: No blanket deny
  console.log('\n📋 Test 3: No blanket git:* deny rule');
  testCommandNotDenied(settings, 'git', 'No blanket Bash(git:*) deny');

  // Test 4: Permission structure validation
  console.log('\n📋 Test 4: Permission structure validation');
  assert(
    Array.isArray(settings.permissions.allow),
    'permissions.allow should be an array'
  );
  console.log('  ✓ permissions.allow is an array');

  assert(
    Array.isArray(settings.permissions.deny),
    'permissions.deny should be an array'
  );
  console.log('  ✓ permissions.deny is an array');

  const gitAllowCount = settings.permissions.allow.filter(p => p.startsWith('Bash(git')).length;
  assert(
    gitAllowCount >= 7,
    `Should have at least 7 git commands in allow list (found ${gitAllowCount})`
  );
  console.log(`  ✓ Found ${gitAllowCount} git commands in allow list`);

  const gitDenyCount = settings.permissions.deny.filter(p => p.startsWith('Bash(git')).length;
  assert(
    gitDenyCount >= 7,
    `Should have at least 7 git commands in deny list (found ${gitDenyCount})`
  );
  console.log(`  ✓ Found ${gitDenyCount} git commands in deny list`);

  console.log('\n✅ All git command permission tests passed!\n');
  process.exit(0);

} catch (error) {
  console.error(`\n❌ Test failed: ${error.message}\n`);
  if (error.stack) {
    console.error('Stack trace:');
    console.error(error.stack);
  }
  process.exit(1);
}
