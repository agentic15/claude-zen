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

import { existsSync, mkdirSync, copyFileSync, readdirSync, statSync, readFileSync, writeFileSync, unlinkSync, rmdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * UpgradeCommand - Updates framework files in existing projects
 *
 * Upgrades .claude/ framework files while preserving:
 * - User code (Agent/src, Agent/tests)
 * - Active plans (.claude/plans, .claude/ACTIVE-PLAN)
 * - Local settings (.claude/settings.local.json)
 */
export class UpgradeCommand {
  static execute() {
    console.log('\n' + '═'.repeat(70));
    console.log('🔄 Agentic15 Claude Zen - Framework Upgrade');
    console.log('═'.repeat(70) + '\n');

    // Verify we're in a project directory
    if (!existsSync('.claude')) {
      console.log('❌ Not in an Agentic15 project directory');
      console.log('   Run this command from your project root (where .claude/ exists)\n');
      process.exit(1);
    }

    // Get current and package versions
    const currentVersion = this.getCurrentVersion();
    const packageVersion = this.getPackageVersion();

    console.log(`📦 Current framework version: ${currentVersion || 'unknown'}`);
    console.log(`📦 Package version: ${packageVersion}\n`);

    // Backup current .claude directory
    console.log('📂 Creating backup...');
    this.createBackup();

    try {
      // Update framework files
      console.log('🔄 Updating framework files...\n');
      this.updateFrameworkFiles();

      // Update version file
      this.updateVersionFile(packageVersion);

      console.log('\n✅ Upgrade completed successfully!\n');
      console.log('📋 What was updated:');
      console.log('   - .claude/hooks/ (git hooks)');
      console.log('   - .claude/settings.json (framework settings)');
      console.log('   - .claude/PLAN-SCHEMA.json (plan structure)');
      console.log('   - .claude/PROJECT-PLAN-TEMPLATE.json (plan template)');
      console.log('   - .claude/POST-INSTALL.md (documentation)\n');
      console.log('📋 What was preserved:');
      console.log('   - .claude/plans/ (your project plans)');
      console.log('   - .claude/ACTIVE-PLAN (current plan)');
      console.log('   - .claude/settings.local.json (local settings)');
      console.log('   - Agent/ (your source code)');
      console.log('   - scripts/ (your scripts)');
      console.log('   - test-site/ (your test site)');
      console.log('   - package.json (your project config)');
      console.log('   - README.md (your documentation)\n');
      console.log('💾 Backup location: .claude.backup/\n');
      console.log('═'.repeat(70) + '\n');
    } catch (error) {
      console.log('\n❌ Upgrade failed:', error.message);
      console.log('   Your original files are backed up in .claude.backup/');
      console.log('   To restore: rm -rf .claude && mv .claude.backup .claude\n');
      process.exit(1);
    }
  }

  static getCurrentVersion() {
    const versionFile = join('.claude', '.framework-version');
    if (existsSync(versionFile)) {
      return readFileSync(versionFile, 'utf-8').trim();
    }
    return null;
  }

  static getPackageVersion() {
    const packageJsonPath = join(__dirname, '..', '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    return packageJson.version;
  }

  static createBackup() {
    const backupDir = '.claude.backup';

    // Remove old backup if exists
    if (existsSync(backupDir)) {
      this.removeDirectory(backupDir);
    }

    // Copy entire .claude directory
    this.copyDirectory('.claude', backupDir);
    console.log('   ✓ Backup created at .claude.backup/\n');
  }

  static updateFrameworkFiles() {
    const templatesDir = join(__dirname, '..', '..', 'templates', '.claude');

    // Files to update (framework files only)
    const filesToUpdate = [
      'hooks/complete-task.js',
      'hooks/enforce-plan-template.js',
      'hooks/require-active-task.js',
      'hooks/session-start-context.js',
      'hooks/start-task.js',
      'PLAN-SCHEMA.json',
      'PROJECT-PLAN-TEMPLATE.json',
      'POST-INSTALL.md',
      'settings.json'
    ];

    // Ensure hooks directory exists
    const hooksDir = join('.claude', 'hooks');
    if (!existsSync(hooksDir)) {
      mkdirSync(hooksDir, { recursive: true });
    }

    // Copy framework files
    filesToUpdate.forEach(file => {
      const sourcePath = join(templatesDir, file);
      const destPath = join('.claude', file);

      if (existsSync(sourcePath)) {
        copyFileSync(sourcePath, destPath);
        console.log(`   ✓ Updated ${file}`);
      }
    });
  }

  static updateVersionFile(version) {
    const versionFile = join('.claude', '.framework-version');
    writeFileSync(versionFile, version);
  }

  static copyDirectory(src, dest) {
    if (!existsSync(dest)) {
      mkdirSync(dest, { recursive: true });
    }

    const entries = readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = join(src, entry.name);
      const destPath = join(dest, entry.name);

      if (entry.isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        copyFileSync(srcPath, destPath);
      }
    }
  }

  static removeDirectory(dir) {
    if (existsSync(dir)) {
      const entries = readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          this.removeDirectory(fullPath);
        } else {
          unlinkSync(fullPath);
        }
      }

      rmdirSync(dir);
    }
  }
}
