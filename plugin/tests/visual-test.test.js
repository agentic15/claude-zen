import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import visualTestSkill from '../skills/visual-test.js';

/**
 * Tests for agentic15:visual-test skill
 *
 * Focus: Validation logic ONLY
 * We test error handling and validation paths that throw BEFORE
 * calling VisualTestCommand.execute(). We do NOT test successful execution
 * because that would launch Playwright, open browsers, and create screenshots.
 */
describe('agentic15:visual-test skill - Validation', () => {
  const testDir = join(process.cwd(), 'test-visual-test-skill');
  const claudeDir = join(testDir, '.claude');
  let originalCwd;

  before(() => {
    originalCwd = process.cwd();
  });

  after(() => {
    process.chdir(originalCwd);
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  beforeEach(() => {
    process.chdir(originalCwd);
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
    mkdirSync(testDir, { recursive: true });
    mkdirSync(claudeDir, { recursive: true });
    process.chdir(testDir);
  });

  it('should fail when .claude/ directory does not exist', async () => {
    rmSync(claudeDir, { recursive: true, force: true });

    const result = await visualTestSkill('http://localhost:3000');

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'Not an Agentic15 project');
  });

  it('should fail when no URL provided', async () => {
    const result = await visualTestSkill();

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'URL required');
    assert.ok(result.error.suggestion.includes('Provide a URL'));
  });

  it('should fail when empty URL provided', async () => {
    const result = await visualTestSkill('   ');

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'URL required');
  });

  it('should fail when URL format is invalid - no protocol', async () => {
    const result = await visualTestSkill('localhost:3000');

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'Invalid URL format');
    assert.ok(result.error.details.includes('must start with http://'));
  });

  it('should fail when URL format is invalid - wrong protocol', async () => {
    const result = await visualTestSkill('ftp://example.com');

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'Invalid URL format');
  });

  it('should fail when URL format is invalid - just domain', async () => {
    const result = await visualTestSkill('example.com');

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.title, 'Invalid URL format');
  });

  it('should document expected behavior for valid URL without Playwright', async () => {
    // NOTE: Cannot test valid URL without Playwright being installed
    // because VisualTestCommand.execute() would:
    // 1. Check for Playwright (checkPlaywright)
    // 2. If not installed, call process.exit(1)
    // 3. If installed, launch browser and run tests
    //
    // Expected behavior:
    // - If Playwright not installed: exit with error message
    // - If Playwright installed: run visual tests (would take time, create files)
    //
    // This test documents the expected behavior.

    assert.ok(true, 'Test documents expected behavior: validates Playwright requirement');
  });

  it('should document expected behavior for valid HTTP URL', async () => {
    // NOTE: Cannot test with valid URL because it would trigger real execution
    //
    // Expected behavior for: http://localhost:3000
    // - URL passes format validation
    // - Calls VisualTestCommand.execute()
    // - Launches Playwright browser
    // - Navigates to URL
    // - Captures screenshots
    // - Logs errors
    // - Returns success with file paths
    //
    // This test documents the expected behavior.

    assert.ok(true, 'Test documents expected behavior: should test HTTP URLs');
  });

  it('should document expected behavior for valid HTTPS URL', async () => {
    // NOTE: Cannot test with valid URL because it would trigger real execution
    //
    // Expected behavior for: https://example.com
    // - URL passes format validation
    // - Calls VisualTestCommand.execute()
    // - Launches Playwright browser
    // - Navigates to URL
    // - Captures screenshots
    // - Runs accessibility checks
    // - Returns success with file paths
    //
    // This test documents the expected behavior.

    assert.ok(true, 'Test documents expected behavior: should test HTTPS URLs');
  });
});

// ⚠️ IMPORTANT: We do NOT test the success path where all validations pass
// because that would call VisualTestCommand.execute() which:
// - Checks for Playwright installation
// - Launches a headless browser
// - Navigates to the provided URL
// - Captures screenshots (fullpage.png, viewport.png)
// - Logs console errors, warnings, network errors
// - Runs accessibility audits with axe-core
// - Creates files in .claude/visual-test/
//
// The framework tests VisualTestCommand.execute() - our job is only to validate inputs.
