import { execSync } from 'child_process';
import { existsSync, writeFileSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';

/**
 * VisualTestCommand - Capture screenshots and console errors for UI debugging
 *
 * Uses Claude Code's built-in screenshot capabilities (no API key needed)
 * Helps report UI issues to Claude without manual back-and-forth
 */
export class VisualTestCommand {
  static async execute(url) {
    console.log('\n🎯 Visual Test - Capture screenshots and console errors\n');

    if (!url) {
      console.log('❌ URL required');
      console.log('   Usage: npx agentic15 visual-test <url>\n');
      console.log('   Example: npx agentic15 visual-test http://localhost:3000\n');
      process.exit(1);
    }

    // Check if Playwright is installed
    const hasPlaywright = this.checkPlaywright();

    if (!hasPlaywright) {
      console.log('⚠️  Playwright not installed');
      console.log('   Install with: npx playwright install chromium\n');
      process.exit(1);
    }

    console.log(`📸 Capturing screenshots and logs from: ${url}\n`);

    try {
      // Run Playwright visual test
      this.runVisualTest(url);

      console.log('\n✅ Visual test complete');
      console.log('   Screenshots saved to: .claude/visual-test/\n');
      console.log('💡 Next steps:');
      console.log('   1. Review screenshots in .claude/visual-test/');
      console.log('   2. Check console-errors.log for JavaScript errors');
      console.log('   3. Ask Claude to analyze the visual test results\n');

      process.exit(0);
    } catch (error) {
      console.log(`\n❌ Visual test failed: ${error.message}\n`);
      process.exit(1);
    }
  }

  static checkPlaywright() {
    const projectRoot = process.cwd();
    const packageJsonPath = join(projectRoot, 'package.json');

    if (!existsSync(packageJsonPath)) {
      return false;
    }

    try {
      // Check if playwright is in devDependencies
      execSync('npx playwright --version', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  static runVisualTest(url) {
    const testScript = `
const { chromium } = require('playwright');
const { writeFileSync, mkdirSync } = require('fs');
const { join } = require('path');

(async () => {
  const outputDir = join(process.cwd(), '.claude', 'visual-test');
  mkdirSync(outputDir, { recursive: true });

  const consoleErrors = [];
  const consoleWarnings = [];

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push({
        timestamp: new Date().toISOString(),
        message: msg.text()
      });
    } else if (msg.type() === 'warning') {
      consoleWarnings.push({
        timestamp: new Date().toISOString(),
        message: msg.text()
      });
    }
  });

  // Capture page errors
  page.on('pageerror', error => {
    consoleErrors.push({
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack
    });
  });

  try {
    // Navigate to URL
    await page.goto('${url}', { waitUntil: 'networkidle', timeout: 30000 });

    // Wait for page to stabilize
    await page.waitForTimeout(2000);

    // Capture full page screenshot
    await page.screenshot({
      path: join(outputDir, 'fullpage.png'),
      fullPage: true
    });

    // Capture viewport screenshot
    await page.screenshot({
      path: join(outputDir, 'viewport.png'),
      fullPage: false
    });

    // Save console errors
    if (consoleErrors.length > 0) {
      const errorLog = consoleErrors.map(e =>
        \`[\${e.timestamp}] \${e.message}\${e.stack ? '\\n' + e.stack : ''}\`
      ).join('\\n\\n');

      writeFileSync(join(outputDir, 'console-errors.log'), errorLog);
      console.log(\`❌ Found \${consoleErrors.length} console errors\`);
    } else {
      console.log('✅ No console errors detected');
    }

    // Save console warnings
    if (consoleWarnings.length > 0) {
      const warningLog = consoleWarnings.map(w =>
        \`[\${w.timestamp}] \${w.message}\`
      ).join('\\n\\n');

      writeFileSync(join(outputDir, 'console-warnings.log'), warningLog);
      console.log(\`⚠️  Found \${consoleWarnings.length} console warnings\`);
    }

    // Capture page HTML for debugging
    const html = await page.content();
    writeFileSync(join(outputDir, 'page.html'), html);

  } catch (error) {
    console.error('Error during visual test:', error.message);

    // Try to capture screenshot even on error
    try {
      await page.screenshot({
        path: join(outputDir, 'error-screenshot.png')
      });
    } catch {}

    throw error;
  } finally {
    await browser.close();
  }
})();
`;

    // Write test script to temp file and execute
    const tempScriptPath = join(process.cwd(), '.claude', 'temp-visual-test.js');

    mkdirSync(join(process.cwd(), '.claude'), { recursive: true });
    writeFileSync(tempScriptPath, testScript);

    try {
      execSync(`node "${tempScriptPath}"`, {
        stdio: 'inherit',
        cwd: process.cwd()
      });
    } finally {
      // Clean up temp script
      try {
        unlinkSync(tempScriptPath);
      } catch {}
    }
  }
}
