#!/usr/bin/env node

/**
 * Session Start Context Display Hook
 *
 * CRITICAL: Shows Claude the current context at session start
 * - Active plan name and location
 * - Active task ID and description
 * - Project structure
 * - Role definitions (Claude vs Human)
 * - Workflow reminder
 *
 * This hook FORCES Claude to acknowledge the agentic15-claude-zen workflow
 */

import fs from 'fs';
import path from 'path';

function log(message, color = 'reset') {
  const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    red: '\x1b[31m',
    bold: '\x1b[1m',
    magenta: '\x1b[35m'
  };
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Load settings
let settings = {};
try {
  if (fs.existsSync('.claude/settings.json')) {
    settings = JSON.parse(fs.readFileSync('.claude/settings.json', 'utf8'));
  }
} catch (e) {
  // Ignore
}

// Check if active plan exists
const activePlanFile = '.claude/ACTIVE-PLAN';
let activePlan = null;
let planDir = null;
let tracker = null;
let activeTask = null;

if (fs.existsSync(activePlanFile)) {
  activePlan = fs.readFileSync(activePlanFile, 'utf8').trim();
  planDir = path.join('.claude/plans', activePlan);

  const trackerPath = path.join(planDir, 'TASK-TRACKER.json');
  if (fs.existsSync(trackerPath)) {
    tracker = JSON.parse(fs.readFileSync(trackerPath, 'utf8'));
  }
}

console.log('\n' + '═'.repeat(70));
log('🎯 AGENTIC15-CLAUDE-ZEN WORKFLOW - SESSION START', 'bold');
console.log('═'.repeat(70) + '\n');

// Display system status
log('⚙️  SYSTEM STATUS:', 'bold');
log(`   Framework: agentic15-claude-zen`, 'cyan');
log(`   Sandbox: ${settings.sandbox?.enabled ? '✓ Enabled' : '✗ Disabled'}`, 'cyan');

// Role definitions
console.log('\n' + '─'.repeat(70));
log('👥 ROLE DEFINITIONS - CLEAR SEPARATION OF CONCERNS:', 'bold');
console.log('─'.repeat(70));
log('   🤖 CLAUDE (AI Assistant):', 'magenta');
log('      • READ code, files, and documentation', 'cyan');
log('      • WRITE code in ./Agent/** and ./scripts/**', 'cyan');
log('      • EDIT existing code files', 'cyan');
log('      • ANSWER questions about code and architecture', 'cyan');
log('      • IMPLEMENT features according to task requirements', 'cyan');
log('', 'reset');
log('   👤 HUMAN (Developer):', 'magenta');
log('      • RUN agentic15 commands (plan, task, commit, sync)', 'yellow');
log('      • MANAGE git operations (merge PRs, resolve conflicts)', 'yellow');
log('      • MAKE architectural decisions and approve plans', 'yellow');
log('      • REVIEW and merge pull requests', 'yellow');
log('      • CONFIGURE settings and environment', 'yellow');

console.log('\n' + '─'.repeat(70));
log('🚫 WHAT CLAUDE MUST NOT DO:', 'bold');
console.log('─'.repeat(70));
log('   ❌ Run agentic15 commands (plan, task, commit, sync)', 'red');
log('   ❌ Run git commands (commit, push, checkout, merge)', 'red');
log('   ❌ Edit .claude/PROJECT-PLAN.json or TASK-TRACKER.json', 'red');
log('   ❌ Modify settings.json or settings.local.json', 'red');
log('   ❌ Create or delete git branches', 'red');
log('   ❌ Ask "should I commit?" or "should I run task next?"', 'red');

// Display active context
console.log('\n' + '─'.repeat(70));
if (activePlan && tracker) {
  log('✅ ACTIVE PROJECT CONTEXT:', 'green');
  log(`   Project: ${tracker.projectName}`, 'cyan');
  log(`   Plan: ${activePlan}`, 'cyan');
  log(`   Location: .claude/plans/${activePlan}/`, 'cyan');

  // Find task with in_progress status
  const inProgressTask = tracker.taskFiles.find(t => t.status === 'in_progress');

  if (inProgressTask) {
    const taskFile = path.join(planDir, 'tasks', `${inProgressTask.id}.json`);
    if (fs.existsSync(taskFile)) {
      const task = JSON.parse(fs.readFileSync(taskFile, 'utf8'));
      log(`\n   🔄 TASK IN PROGRESS: ${inProgressTask.id}`, 'yellow');
      log(`   Title: ${task.title}`, 'yellow');
      log(`   Description: ${task.description}`, 'yellow');
      log(`\n   📝 YOUR JOB: Write code to complete this task`, 'green');
      log(`   ⚠️  HUMAN WILL: Run "npx agentic15 commit" when you're done`, 'yellow');
    }
  } else {
    log('\n   ✓ No task in progress', 'yellow');
    log('   ⚠️  HUMAN WILL: Run "npx agentic15 task next" to start a task', 'yellow');
    log('   📝 YOUR JOB: Wait for human to start a task', 'yellow');
  }

  // Show progress
  const stats = tracker.statistics;
  log(`\n   Progress: ${stats.completed}/${stats.totalTasks} tasks complete`, 'cyan');
  log(`   In Progress: ${stats.inProgress}`, 'cyan');
  log(`   Pending: ${stats.pending}`, 'cyan');

} else {
  log('❌ NO ACTIVE PROJECT PLAN', 'red');
  log('\n   ⚠️  HUMAN MUST: Initialize the plan', 'yellow');
  log('   Commands: npx agentic15 plan', 'yellow');
  log('   Then: npx agentic15 task next\n', 'yellow');
}

console.log('\n' + '─'.repeat(70));
log('📂 DIRECTORY STRUCTURE:', 'bold');
console.log('─'.repeat(70));
log('   ./Agent/                    # Your workspace (WRITE CODE HERE)', 'green');
log('   ./scripts/                  # Your scripts (WRITE CODE HERE)', 'green');
log('   ./.claude/                  # Framework files (READ ONLY)', 'yellow');

console.log('\n' + '─'.repeat(70));
log('📋 COMMANDS (HUMAN RUNS THESE - NOT CLAUDE):', 'bold');
console.log('─'.repeat(70));
log('   npx agentic15 plan              # Generate and lock plan', 'cyan');
log('   npx agentic15 task next         # Start next pending task', 'cyan');
log('   npx agentic15 task reset        # Reset stuck task', 'cyan');
log('   npx agentic15 task status       # View progress', 'cyan');
log('   npx agentic15 commit            # Commit, push, create PR', 'cyan');
log('   npx agentic15 sync              # Sync with main after PR merge', 'cyan');

console.log('\n' + '─'.repeat(70));
log('📖 MANDATORY WORKFLOW RULES:', 'bold');
console.log('─'.repeat(70));
log('   1. Claude writes code, Human runs commands', 'cyan');
log('   2. ONE task at a time - complete before starting next', 'cyan');
log('   3. Claude edits ONLY ./Agent/** and ./scripts/**', 'cyan');
log('   4. Human runs: task → Claude codes → Human commits', 'cyan');
log('   5. Testing is optional - structure, not enforcement', 'cyan');

console.log('\n' + '═'.repeat(70));
log('📖 Read .claude/POST-INSTALL.md for complete workflow details', 'bold');
console.log('═'.repeat(70) + '\n');

process.exit(0);
