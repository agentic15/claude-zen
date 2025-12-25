# Visual Testing Feedback Loop - Complete Workflow

## Overview

The Agentic15 Claude Zen framework now includes an automated visual testing feedback loop that allows Claude to:
1. See visual regression screenshots
2. Understand what went wrong
3. Fix UI code to match expected output
4. Self-correct without human intervention

## Components

### 1. Post-Visual-Test Hook
**Location**: `.claude/hooks/post-visual-test.js`

**Purpose**: Automatically processes Playwright test results and makes them accessible to Claude.

**What it does**:
- Scans `test-results/` for visual regression failures
- Copies diff, actual, and expected screenshots to `.claude/visual-test-results/`
- Generates markdown report with image paths
- Provides console guidance for next steps

### 2. Visual Test Results Directory
**Location**: `.claude/visual-test-results/`

**Contents**:
- `LATEST-VISUAL-TEST-REPORT.md` - Markdown report with all failures
- `<test-name>/` - Subdirectories for each failed test containing:
  - `*-diff.png` - Red/orange pixels showing differences
  - `*-actual.png` - What Claude's code rendered
  - `*-expected.png` - Baseline screenshot (correct output)

### 3. Permissions
Claude has read access to `.claude/visual-test-results/` by default (no restrictions in settings.json).

## Complete Workflow

### Step 1: Human Runs Visual Tests
```bash
npx playwright test
```

**Result**:
- Tests pass → No action needed
- Tests fail → Playwright generates diff images in `test-results/`

### Step 2: Post-Visual-Test Hook Runs (Optional but Recommended)
```bash
node .claude/hooks/post-visual-test.js
```

**What happens**:
```
📸 Post-Visual-Test Hook Running...

📊 Found 4 test result directories

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📸 VISUAL TEST RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ 4 visual test(s) FAILED
📸 12 screenshot(s) copied to .claude/visual-test-results/

📄 Report generated for Claude:
   .claude/visual-test-results/LATEST-VISUAL-TEST-REPORT.md

💡 Next steps:
   1. Ask Claude to read the visual test report
   2. Claude will view screenshots and fix issues
   3. Re-run: npx playwright test

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 3: Human Asks Claude to Fix
```
Human: "Claude, read the visual test report and fix the UI issues"
```

### Step 4: Claude Reads Report and Screenshots
```javascript
// Claude executes:
Read('.claude/visual-test-results/LATEST-VISUAL-TEST-REPORT.md')
Read('.claude/visual-test-results/<test-name>/<diff-image>.png')
Read('.claude/visual-test-results/<test-name>/<actual-image>.png')
Read('.claude/visual-test-results/<test-name>/<expected-image>.png')
```

**Claude sees**:
- Markdown report explaining each failure
- Diff images showing exactly what changed (red pixels)
- Actual rendering (what Claude's code produced)
- Expected rendering (baseline/correct output)
- Error context with page snapshot

### Step 5: Claude Analyzes and Fixes
Claude identifies the differences:
- "The title color changed from #333 to #FF5722"
- "The font size increased from 28px to 32px"
- "The issue is in Calculator.visual.test.js line 66-68"

Claude fixes the code:
```javascript
// BEFORE (wrong)
title: {
  color: '#FF5722',
  fontSize: '32px',
}

// AFTER (correct)
title: {
  color: '#333',
  fontSize: '28px',
}
```

### Step 6: Human Re-runs Tests
```bash
npx playwright test
```

**Result**: All tests pass ✅

### Step 7: Hook Confirms Success
```bash
node .claude/hooks/post-visual-test.js
```

**Output**:
```
✅ All visual tests passed!
```

## Example Report

Here's what Claude sees in `LATEST-VISUAL-TEST-REPORT.md`:

```markdown
# Visual Test Results Report
**Generated:** 2025-12-25T18:13:35.830Z
**Test Results Directory:** `test-results/`

---

## ❌ Test Failure: Calculator initial state - desktop

### Visual Diff
**File:** `.claude/visual-test-results/Calculator.visual-...-desktop-chromium/calculator-initial-desktop-diff.png`

![Diff](C:\...\calculator-initial-desktop-diff.png)

Red/orange pixels show differences between expected and actual rendering.

### Actual Screenshot (What you rendered)
**File:** `.claude/visual-test-results/Calculator.visual-...-desktop-chromium/calculator-initial-desktop-actual.png`

![Actual](C:\...\calculator-initial-desktop-actual.png)

### Expected Screenshot (Baseline)
**File:** `.claude/visual-test-results/Calculator.visual-...-desktop-chromium/calculator-initial-desktop-expected.png`

![Expected](C:\...\calculator-initial-desktop-expected.png)

### Error Details
```
# Page snapshot

```yaml
- generic [ref=e3]:
  - heading "Simple Calculator" [level=1] [ref=e4]
  - generic [ref=e5]:
    - generic [ref=e6]: "First Number:"
    - spinbutton [ref=e7]
```
```

---

## Summary

❌ **4 visual test(s) failed**
📸 **12 screenshot(s) copied for review**

### What to do:
1. Read this report to understand what changed
2. View the diff images (red pixels = changes)
3. Compare actual vs expected screenshots
4. Fix the UI code to match expected output
5. Human will re-run: `npx playwright test`
```

## Integration with agentic15 CLI

### Future Enhancement (Optional)
The hook could be integrated into the `agentic15 commit` command:

```javascript
// In CommitCommand.execute():
static async execute() {
  // Step 1: Run tests
  this.runTests(); // Runs npm test (Jest)

  // Step 2: Run visual tests (if configured)
  if (existsSync('playwright.config.js')) {
    execSync('npx playwright test', { stdio: 'inherit' });

    // Step 3: Run post-visual-test hook
    const hookPath = '.claude/hooks/post-visual-test.js';
    if (existsSync(hookPath)) {
      execSync(`node ${hookPath}`, { stdio: 'inherit' });
    }
  }

  // Step 4: If visual tests failed, block commit
  if (visualTestsFailed) {
    console.log('❌ Visual tests failed. Fix issues before committing.');
    process.exit(1);
  }

  // Continue with commit, push, PR creation...
}
```

## Benefits

### For Claude
1. **Can see visual output** - No longer blind to UI rendering
2. **Self-correcting** - Fixes own UI mistakes without human debugging
3. **Clear feedback** - Red pixels show exactly what changed
4. **Complete context** - Has actual, expected, and diff images

### For Humans
1. **Less debugging** - Claude fixes UI issues automatically
2. **Faster iteration** - No need to describe visual problems to Claude
3. **Quality assurance** - Visual regressions caught before merge
4. **Confidence** - Know UI looks correct before deployment

### For the System
1. **Automated feedback loop** - From test failure to fix to re-test
2. **Comprehensive testing** - Unit tests + visual tests
3. **Documentation via screenshots** - Baseline images serve as visual specs
4. **Regression prevention** - Any UI change detected immediately

## Testing Results

**Black Box Test**: Calculator Component
- **Initial test run**: 4 visual regressions detected (9,513 pixel differences)
- **Claude analyzed**: Diff images, identified title color/size changes
- **Claude fixed**: Changed styles from #FF5722/32px to #333/28px
- **Re-test**: 5/6 tests passed (1 expected failure)
- **Total time**: ~2 minutes (including human asking Claude to fix)

## Files Created

1. `.claude/hooks/post-visual-test.js` (124 lines) - Main hook
2. `VISUAL-TESTING-WORKFLOW.md` (this file) - Documentation
3. `.claude/visual-test-results/LATEST-VISUAL-TEST-REPORT.md` (auto-generated)
4. `.claude/visual-test-results/<test-dirs>/` (auto-generated screenshots)

## Next Steps

1. ✅ Hook created and tested
2. ✅ Feedback loop validated with real visual regression
3. ✅ Hook added to template (all new projects get it)
4. ⏳ Optional: Integrate into `agentic15 commit` command
5. ⏳ Optional: Add to POST-INSTALL.md (mention visual testing workflow)
6. ⏳ Optional: Create example visual tests in template

## Usage Instructions for New Projects

### Setup
```bash
# Install Playwright
npm install --save-dev @playwright/test

# Install browsers
npx playwright install chromium

# Create visual tests (example in Agent/tests/visual/)
```

### Running Tests
```bash
# Run visual tests
npx playwright test

# If tests fail, run hook
node .claude/hooks/post-visual-test.js

# Ask Claude to fix
# (Claude reads .claude/visual-test-results/LATEST-VISUAL-TEST-REPORT.md)

# Re-run tests
npx playwright test
```

### Updating Baselines
```bash
# When UI intentionally changes, update baselines:
npx playwright test --update-snapshots
```

## Summary

The visual testing feedback loop solves the critical problem: **"when claude creates wrong ui, it does not know how to get screenshots and read console logs"**

Now Claude can:
- See visual output via screenshots
- Understand what went wrong via diff images
- Fix issues autonomously
- Validate fixes by re-running tests

This creates a fully automated development loop for UI work, where Claude can iterate on visual components with minimal human intervention.
