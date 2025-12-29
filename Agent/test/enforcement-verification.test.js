#!/usr/bin/env node

/**
 * Enforcement Verification Tests
 *
 * Verifies that the framework properly enforces:
 * 1. Active task requirement for code changes
 * 2. Permission system blocks dangerous operations
 * 3. Hook system blocks violations
 * 4. Git workflow enforcement
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let passed = 0;
let failed = 0;

function log(message, color = 'reset') {
  const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
  };
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function test(name, fn) {
  try {
    fn();
    log(`✓ ${name}`, 'green');
    passed++;
  } catch (error) {
    log(`✗ ${name}`, 'red');
    log(`  ${error.message}`, 'red');
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

log('\n🔒 Enforcement Verification Tests\n', 'blue');

// Test 1: Hooks are bundled and present
test('All hooks are bundled in dist/', () => {
  const hooksDir = path.join(__dirname, '..', 'dist', 'hooks');
  assert(fs.existsSync(hooksDir), 'dist/hooks directory does not exist');

  const hookFiles = fs.readdirSync(hooksDir).filter(f => f.endsWith('.js'));
  assert(hookFiles.length >= 23, `Expected at least 23 hooks, found ${hookFiles.length}`);
});

// Test 2: Scripts are bundled and present
test('All scripts are bundled in dist/', () => {
  const scriptsDir = path.join(__dirname, '..', 'dist', 'scripts');
  assert(fs.existsSync(scriptsDir), 'dist/scripts directory does not exist');

  const scriptFiles = fs.readdirSync(scriptsDir).filter(f => f.endsWith('.js'));
  assert(scriptFiles.length >= 16, `Expected at least 16 scripts, found ${scriptFiles.length}`);
});

// Test 3: Template settings.json has strict permissions
test('Template settings.json has strict permissions', () => {
  const settingsPath = path.join(__dirname, '..', 'templates', '.claude', 'settings.json');
  assert(fs.existsSync(settingsPath), 'settings.json template not found');

  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

  // Check deny list includes dangerous operations
  const denyList = settings.permissions?.deny || [];
  assert(denyList.includes('Bash(rm -rf*)'), 'Missing rm -rf block');
  assert(denyList.includes('Bash(sudo*)'), 'Missing sudo block');
  assert(denyList.includes('Bash(git push --force*)'), 'Missing force push block');
  assert(denyList.includes('Bash(npm install*)'), 'Missing npm install block');
  assert(denyList.includes('Bash(npm publish*)'), 'Missing npm publish block');

  // Check allow list has necessary operations
  const allowList = settings.permissions?.allow || [];
  assert(allowList.includes('Read(**)'), 'Missing Read(**) permission');
  assert(allowList.some(p => p.includes('git commit')), 'Missing git commit permission');
  assert(allowList.some(p => p.includes('git push')), 'Missing git push permission (non-force)');
});

// Test 4: Template settings.json has hooks configured
test('Template settings.json has hooks configured', () => {
  const settingsPath = path.join(__dirname, '..', 'templates', '.claude', 'settings.json');
  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

  assert(settings.hooks, 'No hooks configuration found');
  assert(settings.hooks.PreToolUse, 'No PreToolUse hooks configured');
  assert(settings.hooks.PostToolUse, 'No PostToolUse hooks configured');

  // Check critical hooks are present
  const preToolHooks = JSON.stringify(settings.hooks.PreToolUse);
  assert(preToolHooks.includes('enforce-structured-development'), 'Missing structured development hook');
  assert(preToolHooks.includes('enforce-hard-requirements'), 'Missing hard requirements hook');

  const postToolHooks = JSON.stringify(settings.hooks.PostToolUse);
  assert(postToolHooks.includes('validate-test-quality'), 'Missing test quality hook');
});

// Test 5: enforce-structured-development hook exists and is executable
test('enforce-structured-development hook is bundled and executable', () => {
  const hookPath = path.join(__dirname, '..', 'dist', 'hooks', 'enforce-structured-development.js');
  assert(fs.existsSync(hookPath), 'enforce-structured-development hook not found');

  const hookContent = fs.readFileSync(hookPath, 'utf8');
  assert(hookContent.includes('#!/usr/bin/env node'), 'Hook is missing shebang');
  assert(hookContent.length > 1000, 'Hook appears to be empty or incomplete');
});

// Test 6: Template CLAUDE.md documents direct main workflow
test('Template CLAUDE.md documents direct main workflow', () => {
  const claudeMdPath = path.join(__dirname, '..', 'templates', '.claude', 'CLAUDE.md');
  assert(fs.existsSync(claudeMdPath), 'CLAUDE.md template not found');

  const content = fs.readFileSync(claudeMdPath, 'utf8');
  assert(content.includes('All work happens directly on main branch'), 'Does not document main branch workflow');
  assert(!content.includes('Create feature branch'), 'Still mentions feature branches');
  assert(content.includes('Commit and push to main branch'), 'Does not mention committing to main');
});

// Test 7: init.js automatically installs git hooks
test('init.js automatically installs git hooks', () => {
  const initPath = path.join(__dirname, '..', 'lib', 'init.js');
  assert(fs.existsSync(initPath), 'init.js not found');

  const content = fs.readFileSync(initPath, 'utf8');
  assert(content.includes('npm run setup:git-hooks'), 'Does not call setup:git-hooks');
  assert(content.includes('Setting up Git hooks'), 'Missing git hooks setup message');
});

// Test 8: Package.json has plan:generate script
test('Package.json includes plan:generate script', () => {
  const pkgPath = path.join(__dirname, '..', 'templates', 'package.json');
  assert(fs.existsSync(pkgPath), 'package.json template not found');

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  assert(pkg.scripts['plan:generate'], 'Missing plan:generate script');
});

// Test 9: README documents npx usage (not npm create)
test('README documents npx usage correctly', () => {
  const readmePath = path.join(__dirname, '..', 'README.md');
  assert(fs.existsSync(readmePath), 'README.md not found');

  const content = fs.readFileSync(readmePath, 'utf8');
  assert(content.includes('npx agentic15-claude-zen'), 'README does not show npx usage');

  // Check it doesn't mention npm create (which doesn't work)
  const npmCreateMatches = content.match(/npm create agentic15-claude-zen/g);
  assert(!npmCreateMatches || npmCreateMatches.length === 0, 'README still mentions npm create (which does not work)');
});

// Test 10: plan-generate.js script exists
test('plan-generate.js script exists', () => {
  const scriptPath = path.join(__dirname, '..', 'dist', 'scripts', 'plan-generate.js');
  assert(fs.existsSync(scriptPath), 'plan-generate.js not found in dist/scripts');
});

// Summary
log('\n' + '─'.repeat(50), 'blue');
log(`Tests: ${passed} passed, ${failed} failed`, failed > 0 ? 'red' : 'green');

if (failed > 0) {
  log('\n❌ Enforcement verification FAILED', 'red');
  process.exit(1);
} else {
  log('\n✅ All enforcement checks passed', 'green');
  process.exit(0);
}
