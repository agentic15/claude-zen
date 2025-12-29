#!/usr/bin/env node

/**
 * Bundle Protection Tests
 *
 * Verifies:
 * - Scripts and hooks are minified
 * - Bundle size is optimized
 * - All required files are bundled
 * - Bundled files are executable
 */

import { readFileSync, existsSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PKG_ROOT = join(__dirname, '..');

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('\n🔒 Running bundle protection tests...\n');

try {
  // Test 1: Verify minification
  console.log('📋 Test 1: Minification verification');

  const scriptFile = join(PKG_ROOT, 'dist', 'scripts', 'task-start.js');
  const hookFile = join(PKG_ROOT, 'dist', 'hooks', 'enforce-structured-development.js');

  assert(existsSync(scriptFile), 'Script bundle exists');
  assert(existsSync(hookFile), 'Hook bundle exists');

  const scriptContent = readFileSync(scriptFile, 'utf8');
  const hookContent = readFileSync(hookFile, 'utf8');

  // Minified files should have very few newlines (excluding shebang and header)
  const scriptLines = scriptContent.split('\n').filter(l => l.trim().length > 0);
  const hookLines = hookContent.split('\n').filter(l => l.trim().length > 0);

  assert(scriptLines.length < 20, `Script minified (${scriptLines.length} lines)`);
  assert(hookLines.length < 20, `Hook minified (${hookLines.length} lines)`);

  // Check for common minification patterns
  assert(scriptContent.includes('var '), 'Variables minified with var');
  assert(!scriptContent.includes('\n\n\n'), 'No excessive whitespace');

  console.log('  ✓ Scripts are minified');
  console.log('  ✓ Hooks are minified');

  // Test 2: Bundle completeness
  console.log('\n📋 Test 2: Bundle completeness');

  const expectedScripts = [
    'help.js',
    'plan-amend.js',
    'plan-create.js',
    'plan-help.js',
    'plan-init.js',
    'plan-manager.js',
    'setup-git-hooks.js',
    'task-done.js',
    'task-merge.js',
    'task-next.js',
    'task-start.js',
    'task-status.js'
  ];

  const expectedHooks = [
    'auto-format.js',
    'complete-task.js',
    'enforce-migration-workflow.js',
    'enforce-structured-development.js',
    'enforce-test-pyramid.js',
    'start-task.js',
    'validate-database-changes.js',
    'validate-e2e-coverage.js',
    'validate-git-workflow.js',
    'validate-migration-impact.js',
    'validate-task-completion.js',
    'validate-test-quality.js',
    'validate-test-results.js',
    'validate-ui-integration.js'
  ];

  for (const script of expectedScripts) {
    const path = join(PKG_ROOT, 'dist', 'scripts', script);
    assert(existsSync(path), `${script} bundled`);
  }

  for (const hook of expectedHooks) {
    const path = join(PKG_ROOT, 'dist', 'hooks', hook);
    assert(existsSync(path), `${hook} bundled`);
  }

  console.log(`  ✓ All ${expectedScripts.length} scripts bundled`);
  console.log(`  ✓ All ${expectedHooks.length} hooks bundled`);

  // Test 3: Size optimization
  console.log('\n📋 Test 3: Size optimization');

  function getDirSize(dir) {
    let size = 0;
    const files = [
      ...expectedScripts.map(f => join(dir, 'scripts', f)),
      ...expectedHooks.map(f => join(dir, 'hooks', f))
    ];
    for (const file of files) {
      if (existsSync(file)) {
        size += statSync(file).size;
      }
    }
    return size;
  }

  const distSize = getDirSize(join(PKG_ROOT, 'dist'));

  console.log(`  ✓ Bundle size: ${Math.round(distSize / 1024)}KB`);
  assert(distSize > 10000, 'Bundle is not empty');
  assert(distSize < 1000000, 'Bundle is reasonably sized (< 1MB)');

  // Test 4: Shebang preservation
  console.log('\n📋 Test 4: Executable shebangs');

  assert(scriptContent.startsWith('#!/usr/bin/env node'), 'Script has shebang');
  assert(hookContent.startsWith('#!/usr/bin/env node'), 'Hook has shebang');

  console.log('  ✓ Shebangs preserved for executability');

  console.log('\n✅ All bundle protection tests passed!\n');
  process.exit(0);

} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  if (error.stack) {
    console.error('\nStack trace:');
    console.error(error.stack);
  }
  process.exit(1);
}
