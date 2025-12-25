#!/usr/bin/env node

/**
 * Post-Visual-Test Hook
 * Automatically captures visual test results and makes them available to Claude
 *
 * This hook runs after Playwright visual tests and:
 * 1. Reads test results and screenshots
 * 2. Creates a Claude-readable report with image paths
 * 3. Saves failure screenshots to a Claude-accessible location
 * 4. Generates console output for Claude to read
 *
 * Usage: npx playwright test && node .claude/hooks/post-visual-test.js
 */

const { readFileSync, existsSync, readdirSync, copyFileSync, mkdirSync, writeFileSync } = require('fs');
const { join, dirname } = require('path');

const PROJECT_ROOT = join(__dirname, '..', '..');
const TEST_RESULTS_DIR = join(PROJECT_ROOT, 'test-results');
const CLAUDE_VISUAL_DIR = join(PROJECT_ROOT, '.claude', 'visual-test-results');
const REPORT_PATH = join(CLAUDE_VISUAL_DIR, 'LATEST-VISUAL-TEST-REPORT.md');

console.log('📸 Post-Visual-Test Hook Running...\n');

// Ensure Claude visual directory exists
if (!existsSync(CLAUDE_VISUAL_DIR)) {
  mkdirSync(CLAUDE_VISUAL_DIR, { recursive: true });
}

// Check if test results exist
if (!existsSync(TEST_RESULTS_DIR)) {
  console.log('✅ No visual test results found (tests may have passed)');
  process.exit(0);
}

// Scan for test failures
const testDirs = readdirSync(TEST_RESULTS_DIR).filter(name =>
  name.startsWith('Calculator.visual-') || name.includes('-chromium')
);

if (testDirs.length === 0) {
  console.log('✅ All visual tests passed!\n');
  writeFileSync(REPORT_PATH, '# Visual Test Results\n\n✅ **All tests passed!** No regressions detected.\n');
  process.exit(0);
}

console.log(`📊 Found ${testDirs.length} test result directories\n`);

// Build report
let report = `# Visual Test Results Report\n`;
report += `**Generated:** ${new Date().toISOString()}\n`;
report += `**Test Results Directory:** \`test-results/\`\n\n`;
report += `---\n\n`;

let failureCount = 0;
let screenshotsCopied = 0;

// Process each test directory
testDirs.forEach(dirName => {
  const dirPath = join(TEST_RESULTS_DIR, dirName);
  const files = readdirSync(dirPath);

  // Look for diff images (indicates failure)
  const diffImages = files.filter(f => f.includes('-diff.png'));
  const actualImages = files.filter(f => f.includes('-actual.png'));
  const expectedImages = files.filter(f => f.includes('-expected.png'));
  const errorContext = files.find(f => f === 'error-context.md');

  if (diffImages.length > 0 || errorContext) {
    failureCount++;

    // Extract test name from directory
    const testName = dirName
      .replace('Calculator.visual-Calculat-', '')
      .replace(/-chromium$/, '')
      .replace(/-/g, ' ');

    report += `## ❌ Test Failure: ${testName}\n\n`;

    // Copy screenshots to Claude-accessible location
    const testClaudeDir = join(CLAUDE_VISUAL_DIR, dirName);
    if (!existsSync(testClaudeDir)) {
      mkdirSync(testClaudeDir, { recursive: true });
    }

    // Copy diff image
    diffImages.forEach(diffImg => {
      const srcPath = join(dirPath, diffImg);
      const destPath = join(testClaudeDir, diffImg);
      copyFileSync(srcPath, destPath);
      screenshotsCopied++;

      report += `### Visual Diff\n`;
      report += `**File:** \`.claude/visual-test-results/${dirName}/${diffImg}\`\n\n`;
      report += `![Diff](${destPath})\n\n`;
      report += `Red/orange pixels show differences between expected and actual rendering.\n\n`;
    });

    // Copy actual image
    actualImages.forEach(actualImg => {
      const srcPath = join(dirPath, actualImg);
      const destPath = join(testClaudeDir, actualImg);
      copyFileSync(srcPath, destPath);
      screenshotsCopied++;

      report += `### Actual Screenshot (What you rendered)\n`;
      report += `**File:** \`.claude/visual-test-results/${dirName}/${actualImg}\`\n\n`;
      report += `![Actual](${destPath})\n\n`;
    });

    // Copy expected image
    expectedImages.forEach(expectedImg => {
      const srcPath = join(dirPath, expectedImg);
      const destPath = join(testClaudeDir, expectedImg);
      copyFileSync(srcPath, destPath);
      screenshotsCopied++;

      report += `### Expected Screenshot (Baseline)\n`;
      report += `**File:** \`.claude/visual-test-results/${dirName}/${expectedImg}\`\n\n`;
      report += `![Expected](${destPath})\n\n`;
    });

    // Include error context if available
    if (errorContext) {
      const errorContextPath = join(dirPath, errorContext);
      const errorText = readFileSync(errorContextPath, 'utf-8');
      report += `### Error Details\n\`\`\`\n${errorText}\n\`\`\`\n\n`;
    }

    report += `---\n\n`;
  }
});

// Summary
report += `## Summary\n\n`;
if (failureCount > 0) {
  report += `❌ **${failureCount} visual test(s) failed**\n`;
  report += `📸 **${screenshotsCopied} screenshot(s) copied for review**\n\n`;
  report += `### What to do:\n`;
  report += `1. Read this report to understand what changed\n`;
  report += `2. View the diff images (red pixels = changes)\n`;
  report += `3. Compare actual vs expected screenshots\n`;
  report += `4. Fix the UI code to match expected output\n`;
  report += `5. Human will re-run: \`npx playwright test\`\n\n`;
  report += `### Claude-Accessible Files:\n`;
  report += `- **This report:** \`.claude/visual-test-results/LATEST-VISUAL-TEST-REPORT.md\`\n`;
  report += `- **Screenshots:** \`.claude/visual-test-results/*/\`\n`;
} else {
  report += `✅ **All visual tests passed!**\n`;
}

// Write report
writeFileSync(REPORT_PATH, report);

// Console output for human
console.log('━'.repeat(80));
console.log('📸 VISUAL TEST RESULTS');
console.log('━'.repeat(80));
console.log('');

if (failureCount > 0) {
  console.log(`❌ ${failureCount} visual test(s) FAILED`);
  console.log(`📸 ${screenshotsCopied} screenshot(s) copied to .claude/visual-test-results/`);
  console.log('');
  console.log('📄 Report generated for Claude:');
  console.log(`   .claude/visual-test-results/LATEST-VISUAL-TEST-REPORT.md`);
  console.log('');
  console.log('💡 Next steps:');
  console.log('   1. Ask Claude to read the visual test report');
  console.log('   2. Claude will view screenshots and fix issues');
  console.log('   3. Re-run: npx playwright test');
  console.log('');
} else {
  console.log('✅ All visual tests PASSED!');
  console.log('');
}

console.log('━'.repeat(80));

// Exit with appropriate code
process.exit(failureCount > 0 ? 1 : 0);
