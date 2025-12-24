#!/usr/bin/env node

const { execSync } = require('child_process');

// Read the tool input from stdin
const input = process.argv[2] || '{}';
let toolData;
try {
  toolData = JSON.parse(input);
} catch (error) {
  // Invalid JSON, exit gracefully
  process.exit(0);
}

const command = toolData.tool_input?.command || '';

// Only validate git commands
if (!command.includes('git')) {
  process.exit(0);
}

// Get current branch
let currentBranch;
try {
  currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
} catch (error) {
  // Not in a git repo or git command failed
  process.exit(0);
}

// RULE 1: BLOCK branch creation (direct main workflow only)
if (command.includes('git checkout -b') || command.includes('git branch ') && !command.includes('git branch --show-current')) {
  console.error('\n❌ BLOCKED: Branch creation is NOT allowed');
  console.error('   gl-life-claude-zen uses DIRECT MAIN WORKFLOW');
  console.error('   All work happens on main branch');
  console.error('   Command blocked: ' + command);
  console.error('\n   ✅ Correct workflow:');
  console.error('   git checkout main');
  console.error('   # work on main');
  console.error('   git commit -m "[TASK-XXX] Description"');
  console.error('   git push origin main\n');
  process.exit(2);
}

// RULE 2: BLOCK merges (no branching = no merging)
if (command.includes('git merge')) {
  console.error('\n❌ BLOCKED: Git merge is NOT allowed');
  console.error('   gl-life-claude-zen uses DIRECT MAIN WORKFLOW');
  console.error('   No branching = no merging needed');
  console.error('   All work happens on main branch');
  console.error('\n   ✅ Correct workflow:');
  console.error('   Work directly on main');
  console.error('   Commit and push regularly\n');
  process.exit(2);
}

// RULE 3: BLOCK commits to non-main branches
if (currentBranch !== 'main' && command.includes('git commit')) {
  console.error('\n❌ BLOCKED: Commits only allowed on main branch');
  console.error('   Current branch: ' + currentBranch);
  console.error('   gl-life-claude-zen requires direct main workflow');
  console.error('\n   ✅ Switch to main:');
  console.error('   git checkout main\n');
  process.exit(2);
}

// RULE 4: BLOCK force push
if (command.includes('git push --force') || command.includes('git push -f')) {
  console.error('\n❌ BLOCKED: Force push is NOT allowed');
  console.error('   Never rewrite published history\n');
  process.exit(2);
}

process.exit(0);
