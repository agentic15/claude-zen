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

import { GitHubClient } from '../src/core/GitHubClient.js';
import { GitHubConfig } from '../src/core/GitHubConfig.js';
import { TaskIssueMapper } from '../src/core/TaskIssueMapper.js';

/**
 * GitHub Integration Tests
 *
 * Tests for core GitHub integration classes:
 * - GitHubClient
 * - GitHubConfig
 * - TaskIssueMapper
 */

// Test results
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(`  ${error.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

function assertDeepEqual(actual, expected, message) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    throw new Error(message || `Expected ${expectedStr}, got ${actualStr}`);
  }
}

console.log('\n=== GitHub Integration Tests ===\n');

// ===== GitHubClient Tests =====
console.log('--- GitHubClient Tests ---\n');

test('GitHubClient should not be configured without token', () => {
  const client = new GitHubClient(null, 'owner', 'repo');
  assert(!client.isConfigured(), 'Client should not be configured without token');
});

test('GitHubClient should not be configured without owner', () => {
  const client = new GitHubClient('token', null, 'repo');
  assert(!client.isConfigured(), 'Client should not be configured without owner');
});

test('GitHubClient should not be configured without repo', () => {
  const client = new GitHubClient('token', 'owner', null);
  assert(!client.isConfigured(), 'Client should not be configured without repo');
});

test('GitHubClient should be configured with all parameters', () => {
  const client = new GitHubClient('token', 'owner', 'repo');
  assert(client.isConfigured(), 'Client should be configured with all parameters');
});

test('GitHubClient.createIssue should return null when not configured', async () => {
  const client = new GitHubClient(null, null, null);
  const result = await client.createIssue('Title', 'Body', ['label']);
  assertEqual(result, null, 'Should return null when not configured');
});

test('GitHubClient.updateIssueLabels should return false when not configured', async () => {
  const client = new GitHubClient(null, null, null);
  const result = await client.updateIssueLabels(123, ['label']);
  assertEqual(result, false, 'Should return false when not configured');
});

test('GitHubClient.addIssueComment should return false when not configured', async () => {
  const client = new GitHubClient(null, null, null);
  const result = await client.addIssueComment(123, 'Comment');
  assertEqual(result, false, 'Should return false when not configured');
});

test('GitHubClient.closeIssue should return false when not configured', async () => {
  const client = new GitHubClient(null, null, null);
  const result = await client.closeIssue(123, 'Comment');
  assertEqual(result, false, 'Should return false when not configured');
});

// ===== GitHubConfig Tests =====
console.log('\n--- GitHubConfig Tests ---\n');

test('GitHubConfig should load with defaults', () => {
  const config = new GitHubConfig('/nonexistent');
  assert(config.config !== null, 'Config should not be null');
  assertEqual(config.config.enabled, true, 'Default enabled should be true');
  assertEqual(config.config.autoCreate, true, 'Default autoCreate should be true');
  assertEqual(config.config.autoUpdate, true, 'Default autoUpdate should be true');
  assertEqual(config.config.autoClose, true, 'Default autoClose should be true');
});

test('GitHubConfig.isEnabled should return false without token', () => {
  const config = new GitHubConfig('/nonexistent');
  assert(!config.isEnabled(), 'Should not be enabled without token');
});

test('GitHubConfig.isAutoCreateEnabled should return false without token', () => {
  const config = new GitHubConfig('/nonexistent');
  assert(!config.isAutoCreateEnabled(), 'Auto-create should not be enabled without token');
});

test('GitHubConfig.isAutoUpdateEnabled should return false without token', () => {
  const config = new GitHubConfig('/nonexistent');
  assert(!config.isAutoUpdateEnabled(), 'Auto-update should not be enabled without token');
});

test('GitHubConfig.isAutoCloseEnabled should return false without token', () => {
  const config = new GitHubConfig('/nonexistent');
  assert(!config.isAutoCloseEnabled(), 'Auto-close should not be enabled without token');
});

test('GitHubConfig.getToken should return null by default', () => {
  const config = new GitHubConfig('/nonexistent');
  assertEqual(config.getToken(), null, 'Token should be null by default');
});

test('GitHubConfig.getRepoInfo should return nulls by default', () => {
  const config = new GitHubConfig('/nonexistent');
  const info = config.getRepoInfo();
  assertEqual(info.owner, null, 'Owner should be null by default');
  assertEqual(info.repo, null, 'Repo should be null by default');
});

// ===== TaskIssueMapper Tests =====
console.log('\n--- TaskIssueMapper Tests ---\n');

test('TaskIssueMapper.taskToIssueTitle should format correctly', () => {
  const task = { id: 'TASK-001', title: 'Implement feature' };
  const title = TaskIssueMapper.taskToIssueTitle(task);
  assertEqual(title, '[TASK-001] Implement feature', 'Title should be formatted correctly');
});

test('TaskIssueMapper.taskToIssueBody should include title', () => {
  const task = { id: 'TASK-001', title: 'Implement feature' };
  const body = TaskIssueMapper.taskToIssueBody(task);
  assert(body.includes('Implement feature'), 'Body should include title');
});

test('TaskIssueMapper.taskToIssueBody should include description', () => {
  const task = {
    id: 'TASK-001',
    title: 'Implement feature',
    description: 'Add new functionality'
  };
  const body = TaskIssueMapper.taskToIssueBody(task);
  assert(body.includes('Add new functionality'), 'Body should include description');
});

test('TaskIssueMapper.taskToIssueBody should include phase', () => {
  const task = {
    id: 'TASK-001',
    title: 'Implement feature',
    phase: 'implementation'
  };
  const body = TaskIssueMapper.taskToIssueBody(task);
  assert(body.includes('implementation'), 'Body should include phase');
});

test('TaskIssueMapper.taskToIssueBody should include completion criteria', () => {
  const task = {
    id: 'TASK-001',
    title: 'Implement feature',
    completionCriteria: ['Criterion 1', 'Criterion 2']
  };
  const body = TaskIssueMapper.taskToIssueBody(task);
  assert(body.includes('Criterion 1'), 'Body should include first criterion');
  assert(body.includes('Criterion 2'), 'Body should include second criterion');
});

test('TaskIssueMapper.taskStatusToLabels should map pending status', () => {
  const labels = TaskIssueMapper.taskStatusToLabels('pending');
  assertDeepEqual(labels, ['status: pending'], 'Should map pending status');
});

test('TaskIssueMapper.taskStatusToLabels should map in_progress status', () => {
  const labels = TaskIssueMapper.taskStatusToLabels('in_progress');
  assertDeepEqual(labels, ['status: in-progress'], 'Should map in_progress status');
});

test('TaskIssueMapper.taskStatusToLabels should map completed status', () => {
  const labels = TaskIssueMapper.taskStatusToLabels('completed');
  assertDeepEqual(labels, ['status: completed'], 'Should map completed status');
});

test('TaskIssueMapper.taskStatusToLabels should map blocked status', () => {
  const labels = TaskIssueMapper.taskStatusToLabels('blocked');
  assertDeepEqual(labels, ['status: blocked'], 'Should map blocked status');
});

test('TaskIssueMapper.taskStatusToLabels should include phase label', () => {
  const labels = TaskIssueMapper.taskStatusToLabels('in_progress', 'implementation');
  assertDeepEqual(
    labels,
    ['status: in-progress', 'phase: implementation'],
    'Should include both status and phase labels'
  );
});

test('TaskIssueMapper.phaseToLabel should map known phases', () => {
  assertEqual(
    TaskIssueMapper.phaseToLabel('design'),
    'phase: design',
    'Should map design phase'
  );
  assertEqual(
    TaskIssueMapper.phaseToLabel('implementation'),
    'phase: implementation',
    'Should map implementation phase'
  );
  assertEqual(
    TaskIssueMapper.phaseToLabel('testing'),
    'phase: testing',
    'Should map testing phase'
  );
});

test('TaskIssueMapper.phaseToLabel should handle unknown phases', () => {
  assertEqual(
    TaskIssueMapper.phaseToLabel('custom-phase'),
    'phase: custom-phase',
    'Should handle unknown phases'
  );
});

// ===== Test Summary =====
console.log('\n=== Test Summary ===\n');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}\n`);

if (failed > 0) {
  process.exit(1);
}
