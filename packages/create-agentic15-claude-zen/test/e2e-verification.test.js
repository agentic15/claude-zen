#!/usr/bin/env node

/**
 * E2E Verification Test for agentic15-claude-zen v1.1.0
 *
 * Tests the published package by:
 * 1. Creating a fresh project with npx
 * 2. Verifying test-site template exists
 * 3. Verifying UI testing configuration
 * 4. Testing hook enforcement
 * 5. Testing integration site setup
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_DIR = path.join(__dirname, '..', '..', 'e2e-test-project');
const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function cleanup() {
  if (fs.existsSync(TEST_DIR)) {
    log('🧹 Cleaning up previous test directory...', 'yellow');
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
}

function createProject() {
  log('\n📦 Creating test project with published package...', 'blue');

  try {
    // Use the local built package for testing
    const packagePath = path.join(__dirname, '..');
    execSync(`node ${path.join(packagePath, 'bin', 'create-agentic15-claude-zen.js')} e2e-test-project`, {
      cwd: path.join(TEST_DIR, '..'),
      stdio: 'inherit'
    });

    log('✅ Project created successfully', 'green');
    return true;
  } catch (error) {
    log(`❌ Failed to create project: ${error.message}`, 'red');
    return false;
  }
}

function verifyTestSiteTemplate() {
  log('\n🔍 Verifying test-site template...', 'blue');

  const testSiteDir = path.join(TEST_DIR, 'test-site');
  const requiredFiles = [
    '.gitignore',
    'index.html',
    'package.json',
    'README.md',
    'vite.config.js',
    'src/App.jsx',
    'src/App.css',
    'src/index.css',
    'src/main.jsx'
  ];

  let allExist = true;

  for (const file of requiredFiles) {
    const filePath = path.join(testSiteDir, file);
    if (fs.existsSync(filePath)) {
      log(`  ✅ ${file}`, 'green');
    } else {
      log(`  ❌ Missing: ${file}`, 'red');
      allExist = false;
    }
  }

  return allExist;
}

function verifyUITestingConfig() {
  log('\n🔍 Verifying UI testing configuration...', 'blue');

  const settingsPath = path.join(TEST_DIR, '.claude', 'settings.json');

  if (!fs.existsSync(settingsPath)) {
    log('  ❌ settings.json not found', 'red');
    return false;
  }

  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

  if (!settings.testing?.ui) {
    log('  ❌ testing.ui configuration missing', 'red');
    return false;
  }

  const config = settings.testing.ui;
  const requiredKeys = [
    'strictMode',
    'requireTestFile',
    'requireImport',
    'requireRender',
    'requireProps',
    'requireEventTests',
    'requireApiMocking',
    'requireStateTests',
    'requireFormTests',
    'requireConditionalTests',
    'requireIntegrationSite',
    'integrationSiteDir',
    'conditionalThreshold'
  ];

  let allPresent = true;

  for (const key of requiredKeys) {
    if (key in config) {
      log(`  ✅ ${key}: ${config[key]}`, 'green');
    } else {
      log(`  ❌ Missing: ${key}`, 'red');
      allPresent = false;
    }
  }

  return allPresent;
}

function verifyHooksInstalled() {
  log('\n🔍 Verifying hooks installed...', 'blue');

  const hooksDir = path.join(TEST_DIR, 'node_modules', '.agentic15-claude-zen', 'hooks');

  if (!fs.existsSync(hooksDir)) {
    log('  ❌ Hooks directory not found', 'red');
    return false;
  }

  const requiredHooks = [
    'validate-ui-integration.js',
    'validate-integration-site.js'
  ];

  let allExist = true;

  for (const hook of requiredHooks) {
    const hookPath = path.join(hooksDir, hook);
    if (fs.existsSync(hookPath)) {
      const stats = fs.statSync(hookPath);
      log(`  ✅ ${hook} (${stats.size} bytes)`, 'green');
    } else {
      log(`  ❌ Missing: ${hook}`, 'red');
      allExist = false;
    }
  }

  return allExist;
}

function verifyTestSiteInstallation() {
  log('\n🔍 Testing test-site npm installation...', 'blue');

  const testSiteDir = path.join(TEST_DIR, 'test-site');

  try {
    execSync('npm install', {
      cwd: testSiteDir,
      stdio: 'inherit'
    });

    log('✅ npm install successful', 'green');

    // Verify node_modules created
    if (fs.existsSync(path.join(testSiteDir, 'node_modules'))) {
      log('✅ node_modules directory created', 'green');
      return true;
    } else {
      log('❌ node_modules directory not created', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ npm install failed: ${error.message}`, 'red');
    return false;
  }
}

function verifyTestSiteREADME() {
  log('\n🔍 Verifying test-site README content...', 'blue');

  const readmePath = path.join(TEST_DIR, 'test-site', 'README.md');

  if (!fs.existsSync(readmePath)) {
    log('  ❌ README.md not found', 'red');
    return false;
  }

  const content = fs.readFileSync(readmePath, 'utf8');
  const requiredSections = [
    'Integration Test Website',
    'Quick Start',
    'Deployment',
    'GitHub Pages'
  ];

  let allPresent = true;

  for (const section of requiredSections) {
    if (content.includes(section)) {
      log(`  ✅ Section: ${section}`, 'green');
    } else {
      log(`  ❌ Missing section: ${section}`, 'red');
      allPresent = false;
    }
  }

  return allPresent;
}

function verifyCLAUDEmdDocumentation() {
  log('\n🔍 Verifying CLAUDE.md integration test documentation...', 'blue');

  const claudeMdPath = path.join(TEST_DIR, '.claude', 'CLAUDE.md');

  if (!fs.existsSync(claudeMdPath)) {
    log('  ❌ CLAUDE.md not found', 'red');
    return false;
  }

  const content = fs.readFileSync(claudeMdPath, 'utf8');
  const requiredSections = [
    'Integration Test Website',
    'test-site/',
    'npm run dev',
    'npm run deploy',
    'GitHub Pages'
  ];

  let allPresent = true;

  for (const section of requiredSections) {
    if (content.includes(section)) {
      log(`  ✅ Contains: ${section}`, 'green');
    } else {
      log(`  ❌ Missing: ${section}`, 'red');
      allPresent = false;
    }
  }

  return allPresent;
}

// Main test execution
async function runTests() {
  log('═══════════════════════════════════════════════════', 'blue');
  log('  E2E Verification Test - agentic15-claude-zen v1.1.0', 'blue');
  log('═══════════════════════════════════════════════════', 'blue');

  const results = {
    projectCreation: false,
    testSiteTemplate: false,
    uiTestingConfig: false,
    hooksInstalled: false,
    testSiteInstall: false,
    testSiteREADME: false,
    claudeMdDocs: false
  };

  // Cleanup before starting
  cleanup();

  // Run tests
  results.projectCreation = createProject();
  if (!results.projectCreation) {
    log('\n❌ Cannot continue - project creation failed', 'red');
    process.exit(1);
  }

  results.testSiteTemplate = verifyTestSiteTemplate();
  results.uiTestingConfig = verifyUITestingConfig();
  results.hooksInstalled = verifyHooksInstalled();
  results.testSiteInstall = verifyTestSiteInstallation();
  results.testSiteREADME = verifyTestSiteREADME();
  results.claudeMdDocs = verifyCLAUDEmdDocumentation();

  // Summary
  log('\n═══════════════════════════════════════════════════', 'blue');
  log('  Test Results Summary', 'blue');
  log('═══════════════════════════════════════════════════', 'blue');

  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;

  for (const [test, result] of Object.entries(results)) {
    const status = result ? '✅' : '❌';
    const color = result ? 'green' : 'red';
    log(`${status} ${test}`, color);
  }

  log('\n═══════════════════════════════════════════════════', 'blue');
  log(`  Results: ${passed}/${total} tests passed`, passed === total ? 'green' : 'red');
  log('═══════════════════════════════════════════════════', 'blue');

  // Cleanup after tests
  log('\n🧹 Cleaning up test directory...', 'yellow');
  cleanup();

  process.exit(passed === total ? 0 : 1);
}

runTests().catch(error => {
  log(`\n💥 Test execution failed: ${error.message}`, 'red');
  console.error(error);
  cleanup();
  process.exit(1);
});
