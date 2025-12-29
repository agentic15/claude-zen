#!/usr/bin/env node

/**
 * Require Active Task Hook
 *
 * BLOCKS all Edit/Write operations when no active task exists
 *
 * This is the enforcement mechanism that prevents workflow violations
 */

const fs = require('fs');
const path = require('path');

// Read tool use from stdin
let input = '';
process.stdin.on('data', chunk => {
  input += chunk;
});

process.stdin.on('end', () => {
  try {
    const toolUse = JSON.parse(input);

    // Only check Edit and Write operations
    if (toolUse.name !== 'Edit' && toolUse.name !== 'Write') {
      // Allow all other tools
      process.exit(0);
      return;
    }

    // Check if active task exists
    const activePlanFile = '.claude/ACTIVE-PLAN';

    if (!fs.existsSync(activePlanFile)) {
      console.error('\n' + '═'.repeat(70));
      console.error('❌ BLOCKED: No active plan exists');
      console.error('═'.repeat(70));
      console.error('\nYou MUST have an active plan before making code changes.');
      console.error('\nTo create a plan:');
      console.error('  npx agentic15 plan "Your project requirements"');
      console.error('\n' + '═'.repeat(70) + '\n');
      process.exit(1);
      return;
    }

    const activePlan = fs.readFileSync(activePlanFile, 'utf8').trim();
    const planDir = path.join('.claude/plans', activePlan);
    const trackerPath = path.join(planDir, 'TASK-TRACKER.json');

    if (!fs.existsSync(trackerPath)) {
      console.error('\n' + '═'.repeat(70));
      console.error('❌ BLOCKED: Task tracker not found');
      console.error('═'.repeat(70));
      console.error('\nPlan exists but task tracker is missing.');
      console.error('This indicates a corrupted plan state.');
      console.error('\n' + '═'.repeat(70) + '\n');
      process.exit(1);
      return;
    }

    const tracker = JSON.parse(fs.readFileSync(trackerPath, 'utf8'));

    if (!tracker.activeTask) {
      console.error('\n' + '═'.repeat(70));
      console.error('❌ BLOCKED: No active task');
      console.error('═'.repeat(70));
      console.error('\nYou MUST have an active task before making code changes.');
      console.error('\nTo start a task:');
      console.error('  npx agentic15 task next');
      console.error('\nThis will:');
      console.error('  1. Show you the next pending task');
      console.error('  2. Create a feature branch');
      console.error('  3. Create a GitHub issue');
      console.error('  4. Mark the task as active');
      console.error('\nThen you can make your changes.');
      console.error('\n' + '═'.repeat(70) + '\n');
      process.exit(1);
      return;
    }

    // Active task exists - allow the operation
    process.exit(0);

  } catch (error) {
    // If we can't parse or check, fail safe and allow
    // (don't want to block legitimate work due to hook errors)
    process.exit(0);
  }
});
