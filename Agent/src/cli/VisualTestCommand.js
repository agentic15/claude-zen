import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'fs';
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
      const generatedFiles = this.runVisualTest(url);

      console.log('\n✅ Visual test complete');
      console.log('   Screenshots saved to: .claude/visual-test/\n');

      // Display all generated files for easy copy-paste
      console.log('📁 Generated Files (copy these paths for Claude):');
      console.log('─'.repeat(60));
      generatedFiles.forEach(file => {
        console.log(file);
      });
      console.log('─'.repeat(60));

      console.log('\n💡 Next steps:');
      console.log('   1. Copy the file paths above');
      console.log('   2. Ask Claude to analyze the visual test results');
      console.log('   3. Paste the paths when Claude asks for them\n');

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
const { writeFileSync, mkdirSync, existsSync } = require('fs');
const { join } = require('path');

(async () => {
  const outputDir = join(process.cwd(), '.claude', 'visual-test');
  mkdirSync(outputDir, { recursive: true });

  const consoleErrors = [];
  const consoleWarnings = [];
  const networkErrors = [];
  const accessibilityViolations = [];
  const generatedFiles = [];

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Capture network request failures (4xx, 5xx)
  page.on('response', response => {
    const status = response.status();
    if (status >= 400) {
      networkErrors.push({
        timestamp: new Date().toISOString(),
        url: response.url(),
        method: response.request().method(),
        status: status,
        statusText: response.statusText()
      });
    }
  });

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

    // Run accessibility checks with axe-core
    try {
      await page.evaluate(() => {
        // Inject axe-core from CDN
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.2/axe.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      });

      // Wait for axe to load
      await page.waitForTimeout(500);

      // Run axe accessibility audit
      const axeResults = await page.evaluate(() => {
        return new Promise((resolve) => {
          window.axe.run().then(results => resolve(results));
        });
      });

      // Store violations
      if (axeResults.violations && axeResults.violations.length > 0) {
        axeResults.violations.forEach(violation => {
          accessibilityViolations.push({
            impact: violation.impact,
            description: violation.description,
            help: violation.help,
            helpUrl: violation.helpUrl,
            nodes: violation.nodes.length,
            targets: violation.nodes.map(n => n.target).slice(0, 3) // First 3 examples
          });
        });
      }
    } catch (error) {
      console.log(\`⚠️  Accessibility check failed: \${error.message}\`);
    }

    // Capture full page screenshot
    const fullpagePath = join(outputDir, 'fullpage.png');
    await page.screenshot({
      path: fullpagePath,
      fullPage: true
    });
    generatedFiles.push(fullpagePath);

    // Capture viewport screenshot
    const viewportPath = join(outputDir, 'viewport.png');
    await page.screenshot({
      path: viewportPath,
      fullPage: false
    });
    generatedFiles.push(viewportPath);

    // Save console errors
    if (consoleErrors.length > 0) {
      const errorLog = consoleErrors.map(e =>
        \`[\${e.timestamp}] \${e.message}\${e.stack ? '\\n' + e.stack : ''}\`
      ).join('\\n\\n');

      const errorLogPath = join(outputDir, 'console-errors.log');
      writeFileSync(errorLogPath, errorLog);
      generatedFiles.push(errorLogPath);
      console.log(\`❌ Found \${consoleErrors.length} console errors\`);
    } else {
      console.log('✅ No console errors detected');
    }

    // Save console warnings
    if (consoleWarnings.length > 0) {
      const warningLog = consoleWarnings.map(w =>
        \`[\${w.timestamp}] \${w.message}\`
      ).join('\\n\\n');

      const warningLogPath = join(outputDir, 'console-warnings.log');
      writeFileSync(warningLogPath, warningLog);
      generatedFiles.push(warningLogPath);
      console.log(\`⚠️  Found \${consoleWarnings.length} console warnings\`);
    }

    // Save network errors (4xx, 5xx)
    if (networkErrors.length > 0) {
      const networkLog = networkErrors.map(e =>
        \`[\${e.timestamp}] \${e.method} \${e.url}\\n  Status: \${e.status} \${e.statusText}\`
      ).join('\\n\\n');

      const networkLogPath = join(outputDir, 'network-errors.log');
      writeFileSync(networkLogPath, networkLog);
      generatedFiles.push(networkLogPath);
      console.log(\`🌐 Found \${networkErrors.length} network errors (4xx/5xx)\`);
    } else {
      console.log('✅ No network errors detected');
    }

    // Save accessibility violations
    if (accessibilityViolations.length > 0) {
      const a11yLog = accessibilityViolations.map(v => {
        const impactLabel = v.impact.toUpperCase();
        return \`[\${impactLabel}] \${v.description}\\n  Help: \${v.help}\\n  URL: \${v.helpUrl}\\n  Affected elements: \${v.nodes}\\n  Examples: \${v.targets.join(', ')}\`;
      }).join('\\n\\n');

      const a11yLogPath = join(outputDir, 'accessibility.log');
      writeFileSync(a11yLogPath, a11yLog);
      generatedFiles.push(a11yLogPath);

      // Count by impact level
      const critical = accessibilityViolations.filter(v => v.impact === 'critical').length;
      const serious = accessibilityViolations.filter(v => v.impact === 'serious').length;

      console.log(\`♿ Found \${accessibilityViolations.length} accessibility violations\`);
      if (critical > 0) {
        console.log(\`   ❌ Critical: \${critical}\`);
      }
      if (serious > 0) {
        console.log(\`   ⚠️  Serious: \${serious}\`);
      }
    } else {
      console.log('✅ No accessibility violations detected');
    }

    // Capture page HTML for debugging
    const html = await page.content();
    const htmlPath = join(outputDir, 'page.html');
    writeFileSync(htmlPath, html);
    generatedFiles.push(htmlPath);

    // Write file list for the parent process to read
    const fileListPath = join(outputDir, '.file-list.json');
    writeFileSync(fileListPath, JSON.stringify(generatedFiles, null, 2));

  } catch (error) {
    console.error('Error during visual test:', error.message);

    // Try to capture screenshot even on error
    try {
      const errorScreenshotPath = join(outputDir, 'error-screenshot.png');
      await page.screenshot({
        path: errorScreenshotPath
      });
      generatedFiles.push(errorScreenshotPath);

      // Write file list even on error
      const fileListPath = join(outputDir, '.file-list.json');
      writeFileSync(fileListPath, JSON.stringify(generatedFiles, null, 2));
    } catch {}

    throw error;
  } finally {
    await browser.close();
  }
})();
`;

    // Write test script to temp file and execute
    // Use .cjs extension to ensure CommonJS mode regardless of package.json type field
    const tempScriptPath = join(process.cwd(), '.claude', 'temp-visual-test.cjs');
    const fileListPath = join(process.cwd(), '.claude', 'visual-test', '.file-list.json');

    mkdirSync(join(process.cwd(), '.claude'), { recursive: true });
    writeFileSync(tempScriptPath, testScript);

    try {
      execSync(`node "${tempScriptPath}"`, {
        stdio: 'inherit',
        cwd: process.cwd()
      });

      // Read the generated file list
      let generatedFiles = [];
      if (existsSync(fileListPath)) {
        const fileListContent = readFileSync(fileListPath, 'utf-8');
        generatedFiles = JSON.parse(fileListContent);
      }

      return generatedFiles;
    } finally {
      // Clean up temp script and file list
      try {
        unlinkSync(tempScriptPath);
      } catch {}
      try {
        unlinkSync(fileListPath);
      } catch {}
    }
  }
}
