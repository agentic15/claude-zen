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

    // Step 2: Extract bundled scripts and hooks
    await this.templateManager.extractBundledFiles(targetDir);

    // Step 3: Initialize git repository
    if (initGit) {
      await this.gitInitializer.initialize(targetDir);
    }

    // Step 4: Install dependencies
    if (installDeps) {
      await this.dependencyInstaller.install(targetDir);
    }

    // Step 5: Setup git hooks
    if (initGit) {
      await this.hookInstaller.install(targetDir);
    }

    // Step 6: Display onboarding instructions
    this.displayOnboarding();
  }

  /**
   * Display critical onboarding instructions
   */
  displayOnboarding() {
    console.log('\n' + '═'.repeat(70));
    console.log('🎯 CRITICAL: NEXT STEP FOR CLAUDE CODE');
    console.log('═'.repeat(70));
    console.log('\n📖 READ THIS FILE: .claude/POST-INSTALL.md');
    console.log('\n   This file contains the COMPLETE 6-step setup workflow.');
    console.log('   Single clear path - no confusion or multiple options.\n');
    console.log('🚀 QUICK START (6 steps):');
    console.log('  1. npm run plan:generate "description"');
    console.log('  2. Claude creates PROJECT-PLAN.json');
    console.log('  3. echo "plan-001-generated" > .claude/ACTIVE-PLAN');
    console.log('  4. npm run plan:init');
    console.log('  5. npm run task:start TASK-001');
    console.log('  6. Work on task (9-step workflow in POST-INSTALL.md)');
    console.log('\n📂 Your Workspace:');
    console.log('  ./Agent/     - Edit your source code here');
    console.log('  ./scripts/   - Edit your scripts here');
    console.log('  ./.claude/   - Framework files (DO NOT EDIT)');
    console.log('\n⚠️  Work on main branch only - NO feature branches');
    console.log('⚠️  Hooks enforce rules - violations will be BLOCKED');
    console.log('\n' + '═'.repeat(70));
    console.log('✅ Setup complete! Read .claude/POST-INSTALL.md to continue.');
    console.log('═'.repeat(70) + '\n');
  }
}
