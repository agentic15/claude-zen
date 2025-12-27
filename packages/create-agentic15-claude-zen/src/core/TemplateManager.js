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

import { mkdirSync, cpSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * TemplateManager - Manages template copying and customization
 *
 * Single Responsibility: Copy and customize project templates
 */
export class TemplateManager {
  constructor() {
    // From src/core/, go up two levels to package root, then into templates
    this.templatesDir = join(__dirname, '..', '..', 'templates');
    this.distDir = join(__dirname, '.');
  }

  /**
   * Copy all templates to target directory
   *
   * @param {string} projectName - Name of the project
   * @param {string} targetDir - Target directory path
   */
  async copyTemplates(projectName, targetDir) {
    console.log('📦 Creating project directory...');
    mkdirSync(targetDir, { recursive: true });

    console.log('📋 Copying framework templates...');

    // Copy .claude directory structure
    this.copyDirectory('.claude', targetDir);

    // Copy and customize package.json
    this.copyAndCustomize('package.json', targetDir, projectName);

    // Copy and customize README.md
    this.copyAndCustomize('README.md', targetDir, projectName);

    // Copy .gitignore (npm may rename it)
    this.copyGitignore(targetDir);

    // Copy test-site
    this.copyDirectory('test-site', targetDir);

    // Copy Agent directory
    this.copyDirectory('Agent', targetDir);

    // Copy scripts directory
    this.copyDirectory('scripts', targetDir);

    console.log('✅ Framework structure created');
    console.log('✅ Templates copied');
    console.log('✅ Configuration files generated');
  }

  /**
   * Copy a directory from templates to target
   *
   * @param {string} dirName - Directory name
   * @param {string} targetDir - Target directory path
   */
  copyDirectory(dirName, targetDir) {
    console.log(`  ├─ ${dirName}/`);
    cpSync(
      join(this.templatesDir, dirName),
      join(targetDir, dirName),
      { recursive: true }
    );
  }

  /**
   * Copy a single file from templates to target
   *
   * @param {string} fileName - File name
   * @param {string} targetDir - Target directory path
   */
  copySingleFile(fileName, targetDir) {
    console.log(`  ├─ ${fileName}`);
    cpSync(
      join(this.templatesDir, fileName),
      join(targetDir, fileName)
    );
  }

  /**
   * Copy and customize a file with project name replacement
   *
   * @param {string} fileName - File name
   * @param {string} targetDir - Target directory path
   * @param {string} projectName - Project name for replacement
   */
  copyAndCustomize(fileName, targetDir, projectName) {
    console.log(`  ├─ ${fileName}`);
    const template = readFileSync(join(this.templatesDir, fileName), 'utf8');
    const customized = template.replace(/\{\{PROJECT_NAME\}\}/g, projectName);
    writeFileSync(join(targetDir, fileName), customized);
  }

  /**
   * Copy .gitignore file (handles npm renaming issue)
   *
   * @param {string} targetDir - Target directory path
   */
  copyGitignore(targetDir) {
    console.log('  ├─ .gitignore');
    const gitignoreSource = existsSync(join(this.templatesDir, '.gitignore'))
      ? join(this.templatesDir, '.gitignore')
      : join(this.templatesDir, '.npmignore');
    cpSync(gitignoreSource, join(targetDir, '.gitignore'));
  }
}
