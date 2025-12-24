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

import { execSync } from 'child_process';

/**
 * DependencyInstaller - Installs npm dependencies
 *
 * Single Responsibility: Install project dependencies
 */
export class DependencyInstaller {
  /**
   * Install npm dependencies
   *
   * @param {string} targetDir - Target directory path
   */
  async install(targetDir) {
    console.log('\n📦 Installing dependencies...');
    console.log('   This may take a minute...');
    try {
      execSync('npm install', { cwd: targetDir, stdio: 'inherit' });
      console.log('✅ Dependencies installed');
    } catch (error) {
      console.log('⚠️  Warning: npm install failed');
      console.log('   You can install manually with: npm install');
    }
  }
}
