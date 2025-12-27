#!/usr/bin/env node

/**
 * Session Start Context Display Hook
 *
 * CRITICAL: Shows Claude the current context at session start
 * - Active plan name and location
 * - Active task ID and description
 * - Project structure
 * - Workflow reminder
 *
 * This hook FORCES Claude to acknowledge the agentic15-claude-zen workflow
 */

const fs = require('fs');
const path = require('path');

function log(message, color = 'reset') {
  const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    red: '\x1b[31m',
    bold: '\x1b[1m'
  };
  console.log(`${colors[color]}${message}${colors.reset}`);
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

// Display active context
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
      log(`\n   ⚠️  COMPLETE THIS TASK FIRST: npx agentic15 commit`, 'red');
    }
  } else {
    log('\n   ✓ No task in progress - start next:', 'yellow');
    log('   npx agentic15 task next', 'yellow');
  }

  // Show progress
  const stats = tracker.statistics;
  log(`\n   Progress: ${stats.completed}/${stats.totalTasks} tasks complete`, 'cyan');
  log(`   In Progress: ${stats.inProgress}`, 'cyan');
  log(`   Pending: ${stats.pending}`, 'cyan');

} else {
  log('❌ NO ACTIVE PROJECT PLAN', 'red');
  log('\n   You MUST work within the agentic15-claude-zen framework.', 'yellow');
  log('   Initialize the plan and start execution:', 'yellow');
  log('   npx agentic15 plan', 'yellow');
  log('   npx agentic15 task next\n', 'yellow');
}

console.log('─'.repeat(70));
log('📖 MANDATORY WORKFLOW RULES - NO EXCEPTIONS:', 'bold');
console.log('─'.repeat(70));
log('   1. NO work without active plan + task', 'cyan');
log('   2. ONE task at a time - complete before starting next', 'cyan');
log('   3. Edit ONLY ./Agent/** and ./scripts/** directories', 'cyan');
log('   4. Commit workflow: stage → commit → push → PR', 'cyan');
log('   5. Use feature branches (feature/task-xxx)', 'cyan');
log('   6. Testing is optional - structure, not enforcement', 'cyan');

console.log('\n' + '─'.repeat(70));
log('📂 DIRECTORY STRUCTURE:', 'bold');
console.log('─'.repeat(70));
log('   ./Agent/                    # Your workspace (EDIT HERE)', 'green');
log('   ./scripts/                  # Your scripts (EDIT HERE)', 'green');
log('   ./.claude/                  # Framework files (READ ONLY)', 'yellow');

console.log('\n' + '─'.repeat(70));
log('📋 AVAILABLE COMMANDS:', 'bold');
console.log('─'.repeat(70));
log('   npx agentic15 plan              # Generate and lock plan', 'cyan');
log('   npx agentic15 task start TASK-XXX  # Start specific task', 'cyan');
log('   npx agentic15 task next         # Start next pending task', 'cyan');
log('   npx agentic15 task status       # View progress', 'cyan');
log('   npx agentic15 commit            # Commit, push, create PR', 'cyan');
log('   npx agentic15 visual-test <url> # Capture UI screenshots', 'cyan');
log('   npx agentic15 upgrade           # Update framework files', 'cyan');

console.log('\n' + '─'.repeat(70));
log('⚠️  CRITICAL: NEVER OFFER TO SKIP WORKFLOW STEPS', 'bold');
console.log('─'.repeat(70));
log('   • If task is in_progress, complete it first (agentic15 commit)', 'red');
log('   • NEVER ask "continue with next task or commit first?"', 'red');
log('   • NEVER offer options that violate one-task-at-a-time rule', 'red');
log('   • Framework enforces workflow - follow it, do not bypass it', 'red');
log('   • Settings should lead to ONE conclusion, not options', 'red');

console.log('\n' + '═'.repeat(70));
log('📖 Read .claude/POST-INSTALL.md for complete workflow details', 'bold');
console.log('═'.repeat(70) + '\n');

process.exit(0);
