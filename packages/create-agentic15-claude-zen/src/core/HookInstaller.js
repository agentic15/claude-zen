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

import { writeFileSync, readFileSync, existsSync, chmodSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

/**
 * HookInstaller - Installs git hooks
 *
 * Single Responsibility: Setup git hooks in project
 */
export class HookInstaller {
  /**
   * Install git hooks
   *
   * @param {string} targetDir - Target directory path
   */
  async install(targetDir) {
    console.log('\n🔗 Setting up Git hooks...');
    try {
      const gitHooksDir = join(targetDir, '.git', 'hooks');
      const claudeHooksDir = join(targetDir, '.claude', 'hooks');

      // Create pre-commit hook (reminder that hooks run via Claude Code)
      const preCommitHook = `#!/bin/sh
# agentic15-claude-zen pre-commit hook
# This hook is CRITICAL for enforcement

echo "⚠️  agentic15-claude-zen git hooks are NOT yet active"
echo "   Hooks run via Claude Code settings.json, not git hooks"
echo "   This is just a reminder"
exit 0
`;

      writeFileSync(join(gitHooksDir, 'pre-commit'), preCommitHook, { mode: 0o755 });

      // Install post-merge hook for GitHub issue auto-close
      const postMergeSource = join(claudeHooksDir, 'post-merge.js');
      if (existsSync(postMergeSource)) {
        const postMergeContent = readFileSync(postMergeSource, 'utf8');
        const postMergeHook = join(gitHooksDir, 'post-merge');
        writeFileSync(postMergeHook, postMergeContent, { mode: 0o755 });
        try {
          chmodSync(postMergeHook, 0o755);
        } catch (chmodError) {
          // chmod might fail on some systems, but file should still be executable
        }
        console.log('✅ Git hooks configured (including post-merge for GitHub integration)');
      } else {
        console.log('✅ Git hooks configured');
      }
    } catch (error) {
      console.log('⚠️  Warning: Git hooks setup failed');
      console.log(`   Error: ${error.message}`);
    }
  }
}
