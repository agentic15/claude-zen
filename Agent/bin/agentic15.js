#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { AuthCommand } from '../src/cli/AuthCommand.js';
import { TaskCommand } from '../src/cli/TaskCommand.js';
import { CommitCommand } from '../src/cli/CommitCommand.js';
import { StatusCommand } from '../src/cli/StatusCommand.js';
import { PlanCommand } from '../src/cli/PlanCommand.js';
import { VisualTestCommand } from '../src/cli/VisualTestCommand.js';
import { SyncCommand } from '../src/cli/SyncCommand.js';
import { UpdateSettingsCommand } from '../src/cli/UpdateSettingsCommand.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

const program = new Command();

program
  .name('agentic15')
  .description('Agentic15 Claude Zen - Automated AI development workflow')
  .version(packageJson.version);

// GitHub authentication setup
program
  .command('auth')
  .description('GitHub authentication setup')
  .action(() => AuthCommand.setup());

// Task management
program
  .command('task')
  .description('Task management')
  .argument('<action>', 'Action: start, next, status')
  .argument('[taskId]', 'Task ID (e.g., TASK-001) - required for "start"')
  .action((action, taskId) => TaskCommand.handle(action, taskId));

// Auto-commit workflow
program
  .command('commit')
  .description('Run tests, commit, push, create PR')
  .action(() => CommitCommand.execute());

// Show status
program
  .command('status')
  .description('Show current task status and progress')
  .action(() => StatusCommand.show());

// Plan management (generate, lock, archive)
program
  .command('plan')
  .description('Plan management: generate, lock, or archive')
  .argument('[action]', 'Action: archive, or project description for generate')
  .argument('[description]', 'Description/reason for archive')
  .action((action, description) => PlanCommand.handle(action, description));

// Visual testing - capture screenshots and console errors
program
  .command('visual-test')
  .description('Capture screenshots and console errors for UI debugging')
  .argument('<url>', 'URL to test (e.g., http://localhost:3000)')
  .action((url) => VisualTestCommand.execute(url));

// Sync with remote main branch
program
  .command('sync')
  .description('Switch to main branch, pull latest changes, and cleanup feature branch')
  .action(() => SyncCommand.execute());

// Update settings.json from framework
program
  .command('update-settings')
  .description('Update .claude/settings.json from latest framework version')
  .action(() => UpdateSettingsCommand.execute());

program.parse();
