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
log('🎯 GL-LIFE-CLAUDE-ZEN WORKFLOW - SESSION START', 'bold');
console.log('═'.repeat(70) + '\n');

// Display active context
if (activePlan && tracker) {
  log('✅ ACTIVE PROJECT CONTEXT:', 'green');
  log(`   Project: ${tracker.projectName}`, 'cyan');
  log(`   Plan: ${activePlan}`, 'cyan');
  log(`   Location: .claude/plans/${activePlan}/`, 'cyan');

  if (tracker.activeTask) {
    const taskFile = path.join(planDir, 'tasks', `${tracker.activeTask}.json`);
    if (fs.existsSync(taskFile)) {
      const task = JSON.parse(fs.readFileSync(taskFile, 'utf8'));
      log(`\n   Active Task: ${tracker.activeTask}`, 'yellow');
      log(`   Title: ${task.title}`, 'yellow');
      log(`   Status: ${task.status}`, 'yellow');
      log(`   Description: ${task.description}`, 'yellow');
    }
  } else {
    log('\n   ⚠️  No active task - start one:', 'yellow');
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
log('📖 MANDATORY WORKFLOW RULES:', 'bold');
console.log('─'.repeat(70));
log('   1. NO work without active plan + task', 'cyan');
log('   2. Work ONLY on main branch (no feature branches)', 'cyan');
log('   3. Edit ONLY ./Agent/** and ./scripts/** directories', 'cyan');
log('   4. Follow 9-step task completion checklist', 'cyan');
log('   5. Follow TDD: write tests first, then code', 'cyan');
log('   6. Commit with task ID: [TASK-XXX] Description', 'cyan');
log('   7. Push regularly: git push origin main', 'cyan');

console.log('\n' + '─'.repeat(70));
log('📂 DIRECTORY STRUCTURE:', 'bold');
console.log('─'.repeat(70));
log('   ./Agent/                    # Your workspace (EDIT HERE)', 'green');
log('   ./scripts/                  # Your scripts (EDIT HERE)', 'green');
log('   ./.claude/                  # Framework files (READ ONLY)', 'yellow');
log('   ./node_modules/.agentic15-claude-zen/  # Bundled scripts & hooks', 'yellow');

console.log('\n' + '─'.repeat(70));
log('📋 AVAILABLE COMMANDS:', 'bold');
console.log('─'.repeat(70));
log('   npx agentic15 plan              # Generate and lock plan', 'cyan');
log('   npx agentic15 task next         # Start next task', 'cyan');
log('   npx agentic15 status            # View progress', 'cyan');
log('   npx agentic15 commit            # Test, commit, push, PR', 'cyan');
log('   npx agentic15 visual-test <url> # Capture UI screenshots', 'cyan');

console.log('\n' + '─'.repeat(70));
log('⚠️  ENFORCEMENT ACTIVE:', 'bold');
console.log('─'.repeat(70));
log('   • Hooks BLOCK operations that violate rules', 'red');
log('   • Permission system DENIES dangerous commands', 'red');
log('   • All work requires active task (enforced)', 'red');
log('   • Tests must pass before commit (enforced)', 'red');
log('   • Direct main branch workflow (enforced)', 'red');

console.log('\n' + '═'.repeat(70));
log('📖 Read .claude/ONBOARDING.md for complete workflow details', 'bold');
console.log('═'.repeat(70) + '\n');

process.exit(0);
