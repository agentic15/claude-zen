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

import { execSync } from 'child_process';

/**
 * GitInitializer - Initializes git repository
 *
 * Single Responsibility: Initialize and configure git
 */
export class GitInitializer {
  /**
   * Initialize git repository
   *
   * @param {string} targetDir - Target directory path
   */
  async initialize(targetDir) {
    console.log('\n🔧 Initializing git repository...');
    try {
      execSync('git init', { cwd: targetDir, stdio: 'ignore' });
      execSync('git add .', { cwd: targetDir, stdio: 'ignore' });
      execSync('git commit -m "Initial commit: Agentic15 Claude Zen framework"', {
        cwd: targetDir,
        stdio: 'ignore'
      });
      console.log('✅ Git repository initialized');
    } catch (error) {
      console.log('⚠️  Warning: Git initialization failed');
      console.log('   You can initialize manually with: git init');
    }
  }
}
