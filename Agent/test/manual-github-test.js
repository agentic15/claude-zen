/**
 * Copyright 2024-2025 agentic15.com
 *
 * Manual GitHub Integration Test
 *
 * This script tests the GitHub API integration with a real token.
 * Run with: node test/manual-github-test.js
 *
 * REQUIREMENTS:
 * - GitHub Personal Access Token (classic) with 'repo' scope, OR
 * - Fine-grained PAT with permissions:
 *   - Repository access: Target repository
 *   - Repository permissions:
 *     - Issues: Read and write
 *     - Metadata: Read
 *
 * To generate a token:
 * 1. Go to GitHub → Settings → Developer settings → Personal access tokens
 * 2. For classic token: Select 'repo' scope
 * 3. For fine-grained: Select repository and grant Issues (Read/Write) permission
 */

import { GitHubClient } from '../src/core/GitHubClient.js';
import { GitHubConfig } from '../src/core/GitHubConfig.js';
import { TaskIssueMapper } from '../src/core/TaskIssueMapper.js';

async function testGitHubIntegration() {
  console.log('\n=== Manual GitHub Integration Test ===\n');

  // Test configuration
  const token = process.env.GITHUB_TOKEN;
  const owner = 'agentic15';
  const repo = 'claude-zen';

  if (!token) {
    console.error('❌ ERROR: GITHUB_TOKEN environment variable is required');
    console.error('');
    console.error('Set the token with:');
    console.error('  export GITHUB_TOKEN=your_token_here');
    console.error('  node test/manual-github-test.js');
    console.error('');
    console.error('Or run with:');
    console.error('  GITHUB_TOKEN=your_token node test/manual-github-test.js');
    console.error('');
    process.exit(1);
  }

  console.log('Configuration:');
  console.log(`  Owner: ${owner}`);
  console.log(`  Repo: ${repo}`);
  console.log(`  Token: ${token.substring(0, 10)}...`);
  console.log('');

  // Test 1: GitHubClient initialization
  console.log('Test 1: Initialize GitHubClient');
  const client = new GitHubClient(token, owner, repo);
  console.log(`  ✓ Client configured: ${client.isConfigured()}`);
  console.log('');

  // Test 2: Create a test issue
  console.log('Test 2: Create test issue');
  const testTask = {
    id: 'TEST-001',
    title: 'Manual GitHub Integration Test',
    description: 'This is a test issue created by the manual test script to verify GitHub API integration.',
    phase: 'testing',
    status: 'in_progress',
    estimatedHours: 1,
    completionCriteria: [
      'Issue creation works',
      'Issue labels are correct',
      'Issue body is formatted properly'
    ],
    dependencies: [],
    testCases: [
      'Verify issue appears on GitHub',
      'Verify labels are applied',
      'Verify issue can be closed'
    ]
  };

  const title = TaskIssueMapper.taskToIssueTitle(testTask);
  const body = TaskIssueMapper.taskToIssueBody(testTask);
  const labels = []; // Start without labels to test basic issue creation

  console.log(`  Title: ${title}`);
  console.log(`  Labels: ${labels.length > 0 ? labels.join(', ') : 'none (testing without labels first)'}`);
  console.log('  Creating issue...');

  try {
    const issueNumber = await client.createIssue(title, body, labels);

    if (issueNumber) {
      console.log(`  ✓ Issue created: #${issueNumber}`);
      console.log(`  URL: https://github.com/${owner}/${repo}/issues/${issueNumber}`);
      console.log('');

      // Test 3: Update issue labels
      console.log('Test 3: Update issue labels');
      const newLabels = TaskIssueMapper.taskStatusToLabels('completed', testTask.phase);
      console.log(`  New labels: ${newLabels.join(', ')}`);

      const updateSuccess = await client.updateIssueLabels(issueNumber, newLabels);
      console.log(`  ✓ Labels updated: ${updateSuccess}`);
      console.log('');

      // Test 4: Add comment
      console.log('Test 4: Add comment to issue');
      const comment = `Test completed! ✅\n\nAll GitHub API integration tests passed:\n- Issue creation ✓\n- Label updates ✓\n- Comments ✓`;

      const commentSuccess = await client.addIssueComment(issueNumber, comment);
      console.log(`  ✓ Comment added: ${commentSuccess}`);
      console.log('');

      // Test 5: Close issue
      console.log('Test 5: Close issue');
      const closeComment = 'Closing test issue. Manual GitHub integration test completed successfully! 🎉';

      const closeSuccess = await client.closeIssue(issueNumber, closeComment);
      console.log(`  ✓ Issue closed: ${closeSuccess}`);
      console.log('');

      console.log('=== All Tests Passed! ===\n');
      console.log(`Check the issue on GitHub: https://github.com/${owner}/${repo}/issues/${issueNumber}`);
      console.log('');

    } else {
      console.error('  ✗ Failed to create issue');
      console.error('  Check token permissions and rate limits');
      process.exit(1);
    }
  } catch (error) {
    console.error('  ✗ Error:', error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('  - Verify GitHub token has "repo" scope');
    console.error('  - Check if rate limit exceeded');
    console.error('  - Ensure repository exists and is accessible');
    process.exit(1);
  }
}

// Run tests
testGitHubIntegration().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
