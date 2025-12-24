/**
 * Copyright 2024-2025 Agentic15
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
 * Agentic15 Claude Zen - Main Entry Point
 *
 * Structured AI-assisted development framework for Claude Code
 * with enforced quality standards
 */

import { ProjectInitializer } from './core/ProjectInitializer.js';
import { TemplateManager } from './core/TemplateManager.js';
import { HookInstaller } from './core/HookInstaller.js';
import { DependencyInstaller } from './core/DependencyInstaller.js';
import { GitInitializer } from './core/GitInitializer.js';

/**
 * Initialize a new project with Agentic15 Claude Zen framework
 *
 * @param {string} projectName - Name of the project
 * @param {string} targetDir - Target directory path
 * @param {Object} options - Configuration options
 * @param {boolean} options.initGit - Initialize git repository (default: true)
 * @param {boolean} options.installDeps - Install npm dependencies (default: true)
 */
export async function initializeProject(projectName, targetDir, options = {}) {
  // Dependency Injection: Create all dependencies
  const templateManager = new TemplateManager();
  const hookInstaller = new HookInstaller();
  const dependencyInstaller = new DependencyInstaller();
  const gitInitializer = new GitInitializer();

  // Create orchestrator with injected dependencies
  const projectInitializer = new ProjectInitializer(
    templateManager,
    hookInstaller,
    dependencyInstaller,
    gitInitializer
  );

  // Execute initialization
  await projectInitializer.initialize(projectName, targetDir, options);
}
