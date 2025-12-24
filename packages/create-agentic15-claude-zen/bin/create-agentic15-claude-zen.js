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
 * create-agentic15-claude-zen
 *
 * CLI entry point for creating new projects with Agentic15 Claude Zen framework
 *
 * Usage: npx create-agentic15-claude-zen [project-name]
 *        npx create-agentic15-claude-zen (interactive mode)
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { createInterface } from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get package version
function getVersion() {
  const pkgPath = join(__dirname, '..', 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  return pkg.version;
}

// Show help message
function showHelp() {
  const version = getVersion();
  console.log(`
Agentic15 Claude Zen Project Generator v${version}
"Code with Intelligence, Ship with Confidence"

Usage:
  npx create-agentic15-claude-zen [project-name] [options]

Options:
  --help, -h       Show this help message
  --version, -v    Show version number

Examples:
  npx create-agentic15-claude-zen my-project    Create project with defaults
  npx create-agentic15-claude-zen               Interactive mode with prompts

Interactive Mode:
  When run without a project name, you will be prompted for:
  - Project name (lowercase, numbers, hyphens, underscores)
  - Git initialization (Y/n)
  - Install dependencies (Y/n)

Framework Features:
  - Structured task-based development workflow
  - Git workflow enforcement with hooks
  - Smart testing (tests only changed files)
  - Pre-commit validation and auto-formatting
  - Task tracking with dependencies
  - Immutable project plan management
  - UI component workflow (Agent + test-site)

For more information: https://github.com/agentic15/claude-zen
`);
}

// Helper: Create readline interface
function createPrompt() {
  return createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

// Helper: Prompt user for input
function question(rl, query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Helper: Validate project name
function isValidProjectName(name) {
  return /^[a-z0-9-_]+$/.test(name);
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  // Handle --help flag
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  // Handle --version flag
  if (args.includes('--version') || args.includes('-v')) {
    console.log(getVersion());
    process.exit(0);
  }

  let projectName = args[0];
  let initGit = true;
  let installDeps = true;

  console.log('\n🚀 Agentic15 Claude Zen Project Generator');
  console.log('   "Code with Intelligence, Ship with Confidence"\n');

  // Interactive mode if no project name provided
  if (!projectName) {
    const rl = createPrompt();

    // Ask for project name
    while (!projectName || !isValidProjectName(projectName)) {
      projectName = await question(rl, '📁 Project name (lowercase, numbers, hyphens, underscores): ');
      projectName = projectName.trim();

      if (!projectName) {
        console.log('❌ Project name is required');
        continue;
      }

      if (!isValidProjectName(projectName)) {
        console.log('❌ Invalid name. Use only lowercase letters, numbers, hyphens, and underscores');
        projectName = null;
      }
    }

    // Ask about git initialization
    const gitAnswer = await question(rl, '\n🔧 Initialize git repository? (Y/n): ');
    initGit = !gitAnswer.trim() || gitAnswer.toLowerCase() === 'y';

    // Ask about npm install
    const depsAnswer = await question(rl, '📦 Install dependencies after creation? (Y/n): ');
    installDeps = !depsAnswer.trim() || depsAnswer.toLowerCase() === 'y';

    rl.close();
    console.log('');
  }

  // Validate project name
  if (!isValidProjectName(projectName)) {
    console.error('❌ ERROR: Invalid project name\n');
    console.log('Project name must:');
    console.log('  - Use only lowercase letters, numbers, hyphens, and underscores');
    console.log('  - Not contain spaces or special characters\n');
    console.log('Example: my-app, my_app, myapp123\n');
    process.exit(1);
  }

  // Check if directory already exists
  const targetDir = join(process.cwd(), projectName);
  if (existsSync(targetDir)) {
    console.error(`❌ ERROR: Directory "${projectName}" already exists\n`);
    console.log('Please choose a different name or remove the existing directory.\n');
    process.exit(1);
  }

  console.log('🚀 Creating new project with Agentic15 Claude Zen framework...\n');
  console.log(`📁 Project: ${projectName}`);
  console.log(`📂 Location: ${targetDir}`);
  console.log(`🔧 Git: ${initGit ? 'Yes' : 'No'}`);
  console.log(`📦 Install deps: ${installDeps ? 'Yes' : 'No'}\n`);

  // Import and run initialization
  try {
    const { initializeProject } = await import('../dist/index.js');
    await initializeProject(projectName, targetDir, { initGit, installDeps });

    console.log('\n✅ Project created successfully!\n');
    console.log('Next steps:');
    console.log(`  cd ${projectName}`);
    if (!installDeps) {
      console.log('  npm install');
    }
    console.log('  cat .claude/POST-INSTALL.md\n');

  } catch (error) {
    console.error('\n❌ ERROR: Failed to create project\n');
    console.error(error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
