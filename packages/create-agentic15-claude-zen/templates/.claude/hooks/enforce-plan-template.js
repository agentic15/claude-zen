#!/usr/bin/env node

/**
 * Enforce Plan Template Hook
 *
 * CRITICAL: Blocks custom plan formats - ONLY allow official template
 *
 * When Claude writes PROJECT-PLAN.json, this hook validates:
 * 1. Plan follows PLAN-SCHEMA.json structure
 * 2. Has required fields: planId, projectName, structure, tasks
 * 3. Tasks have proper format: id, title, description, phase, dependencies
 * 4. No custom formats allowed
 */

const fs = require('fs');
const path = require('path');

// Read the tool input
const input = process.argv[2] || '{}';
const toolData = JSON.parse(input);

const filePath = toolData.tool_input?.file_path;
const content = toolData.tool_input?.content;
const tool = toolData.tool;

// Only check when writing PROJECT-PLAN.json
if (tool === 'Write' && filePath && filePath.includes('PROJECT-PLAN.json')) {

  let plan;
  try {
    plan = JSON.parse(content);
  } catch (error) {
    console.error('\n❌ BLOCKED: PROJECT-PLAN.json must be valid JSON');
    console.error(`   Parse error: ${error.message}\n`);
    process.exit(2);
  }

  const errors = [];

  // Required top-level fields
  const requiredFields = ['planId', 'projectName', 'description', 'structure', 'tasks'];
  for (const field of requiredFields) {
    if (!plan[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate structure field
  if (plan.structure && typeof plan.structure !== 'string') {
    errors.push('Field "structure" must be "flat" or "hierarchical"');
  }

  // Validate tasks array
  if (plan.tasks && !Array.isArray(plan.tasks)) {
    errors.push('Field "tasks" must be an array');
  }

  // Validate each task
  if (Array.isArray(plan.tasks)) {
    const taskRequiredFields = ['id', 'title', 'description', 'phase', 'dependencies', 'estimatedHours'];

    plan.tasks.forEach((task, index) => {
      for (const field of taskRequiredFields) {
        if (task[field] === undefined) {
          errors.push(`Task ${task.id || index}: Missing required field "${field}"`);
        }
      }

      // Validate task ID format
      if (task.id && !task.id.match(/^TASK-\d{3}$/)) {
        errors.push(`Task ${task.id || index}: Invalid ID format. Must be TASK-XXX (e.g., TASK-001)`);
      }

      // Validate dependencies is array
      if (task.dependencies && !Array.isArray(task.dependencies)) {
        errors.push(`Task ${task.id || index}: dependencies must be an array`);
      }

      // Validate phase
      const validPhases = ['design', 'implementation', 'testing', 'deployment'];
      if (task.phase && !validPhases.includes(task.phase)) {
        errors.push(`Task ${task.id || index}: Invalid phase "${task.phase}". Must be one of: ${validPhases.join(', ')}`);
      }
    });
  }

  // If errors found, block
  if (errors.length > 0) {
    console.error('\n❌ BLOCKED: PROJECT-PLAN.json does NOT follow template');
    console.error('\n   Validation errors:');
    errors.forEach(err => console.error(`   • ${err}`));
    console.error('\n   ✅ Use the official template:');
    console.error('   1. Read .claude/PLAN-SCHEMA.json for structure');
    console.error('   2. Read .claude/PROJECT-PLAN-TEMPLATE.json for format');
    console.error('   3. Follow the exact structure');
    console.error('\n   Required fields:');
    console.error('   - planId, projectName, description, structure, tasks');
    console.error('   - Each task: id (TASK-XXX), title, description, phase, dependencies, estimatedHours\n');
    process.exit(2);
  }

  // Validation passed
  console.log('✅ PROJECT-PLAN.json follows official template');
}

process.exit(0);
