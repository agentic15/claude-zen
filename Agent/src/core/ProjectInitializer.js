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
 * ProjectInitializer - Orchestrates project setup
 *
 * Single Responsibility: Coordinate the initialization process
 */
export class ProjectInitializer {
  /**
   * @param {TemplateManager} templateManager - Manages template copying
   * @param {HookInstaller} hookInstaller - Installs git hooks
   * @param {DependencyInstaller} dependencyInstaller - Installs npm dependencies
   * @param {GitInitializer} gitInitializer - Initializes git repository
   */
  constructor(templateManager, hookInstaller, dependencyInstaller, gitInitializer) {
    this.templateManager = templateManager;
    this.hookInstaller = hookInstaller;
    this.dependencyInstaller = dependencyInstaller;
    this.gitInitializer = gitInitializer;
  }

  /**
   * Initialize a new project with Agentic15 Claude Zen framework
   *
   * @param {string} projectName - Name of the project
   * @param {string} targetDir - Target directory path
   * @param {Object} options - Configuration options
   * @param {boolean} options.initGit - Initialize git repository
   * @param {boolean} options.installDeps - Install npm dependencies
   */
  async initialize(projectName, targetDir, options = {}) {
    const { initGit = true, installDeps = true } = options;

    console.log('\n' + '═'.repeat(70));
    console.log('🚀 Agentic15 Claude Zen - Project Initialization');
    console.log('   "Code with Intelligence, Ship with Confidence"');
    console.log('═'.repeat(70) + '\n');

    // Step 1: Copy templates
    await this.templateManager.copyTemplates(projectName, targetDir);

    // Step 2: Initialize git repository
    if (initGit) {
      await this.gitInitializer.initialize(targetDir);
    }

    // Step 3: Install dependencies
    if (installDeps) {
      await this.dependencyInstaller.install(targetDir);
    }

    // Step 4: Setup git hooks
    if (initGit) {
      await this.hookInstaller.install(targetDir);
    }

    // Step 5: Display onboarding instructions
    this.displayOnboarding();
  }

  /**
   * Display critical onboarding instructions
   */
  displayOnboarding() {
    console.log('\n' + '═'.repeat(70));
    console.log('🎯 PROJECT CREATED SUCCESSFULLY');
    console.log('═'.repeat(70));
    console.log('\n📖 READ THIS FILE: .claude/POST-INSTALL.md');
    console.log('\n   Complete workflow documentation with examples.\n');
    console.log('🚀 QUICK START:');
    console.log('  1. npx agentic15 auth');
    console.log('  2. npx agentic15 plan (interactive - paste requirements, Ctrl+D)');
    console.log('  3. Tell Claude: "Create the project plan"');
    console.log('  4. npx agentic15 plan (locks the plan)');
    console.log('  5. npx agentic15 task next');
    console.log('  6. Tell Claude: "Write code for TASK-001"');
    console.log('  7. npx agentic15 commit');
    console.log('\n📂 Your Workspace:');
    console.log('  ./Agent/src/     - Your source code');
    console.log('  ./Agent/tests/   - Your test files');
    console.log('  ./test-site/     - Test site for visual verification');
    console.log('  ./.claude/       - Framework files (auto-managed)');
    console.log('\n' + '═'.repeat(70));
    console.log('✅ Setup complete! See .claude/POST-INSTALL.md for details.');
    console.log('═'.repeat(70) + '\n');
  }
}
