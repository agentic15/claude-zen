#!/usr/bin/env node

import { Command } from 'commander';
import { AuthCommand } from '../src/cli/AuthCommand.js';
import { TaskCommand } from '../src/cli/TaskCommand.js';
import { CommitCommand } from '../src/cli/CommitCommand.js';
import { StatusCommand } from '../src/cli/StatusCommand.js';
import { PlanCommand } from '../src/cli/PlanCommand.js';
import { UpgradeCommand } from '../src/cli/UpgradeCommand.js';
import { VisualTestCommand } from '../src/cli/VisualTestCommand.js';
import { SyncCommand } from '../src/cli/SyncCommand.js';

const program = new Command();

program
  .name('agentic15')
  .description('Agentic15 Claude Zen - Automated AI development workflow')
  .version('2.0.0');

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

// Plan management (single command for generate + lock)
program
  .command('plan')
  .description('Generate and lock plan')
  .argument('[description]', 'Project description (required for first run)')
  .action((description) => PlanCommand.handle(description));

// Upgrade framework
program
  .command('upgrade')
  .description('Upgrade framework files to latest version')
  .action(() => UpgradeCommand.execute());

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

program.parse();
