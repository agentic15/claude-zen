import { SkillWrapper } from '../utils/skill-wrapper.js';
import { VisualTestCommand } from '@agentic15.com/agentic15-claude-zen/src/cli/VisualTestCommand.js';

/**
 * agentic15:visual-test skill
 *
 * Purpose: Capture screenshots and console errors for UI debugging
 *
 * Usage:
 *   /agentic15:visual-test http://localhost:3000
 *
 * Workflow:
 *   1. Validates URL is provided
 *   2. Checks Playwright is installed
 *   3. Launches browser and navigates to URL
 *   4. Captures screenshots (fullpage and viewport)
 *   5. Logs console errors, warnings, network errors
 *   6. Runs accessibility checks
 *   7. Saves results to .claude/visual-test/
 */

async function executeVisualTest(url) {
  // Validate URL is provided
  if (!url || url.trim().length === 0) {
    const error = new Error('URL required');
    error.details = 'You must provide a URL to test';
    error.suggestion = 'Provide a URL: /agentic15:visual-test http://localhost:3000';
    throw error;
  }

  url = url.trim();

  // Basic URL format validation
  if (!url.match(/^https?:\/\/.+/i)) {
    const error = new Error('Invalid URL format');
    error.details = `URL "${url}" must start with http:// or https://`;
    error.suggestion = 'Use format: http://localhost:3000 or https://example.com';
    throw error;
  }

  // All validations passed - execute visual test
  console.log(`\n🎯 Starting visual test for: ${url}\n`);
  await VisualTestCommand.execute(url);

  return SkillWrapper.formatSuccess(
    'agentic15:visual-test',
    'Visual test completed successfully',
    'Check .claude/visual-test/ for screenshots and logs'
  );
}

// Export wrapped skill
export default SkillWrapper.wrap({
  name: 'agentic15:visual-test',
  description: 'Capture screenshots and console errors for UI debugging',
  execute: executeVisualTest,
  requiresClaude: true
});
