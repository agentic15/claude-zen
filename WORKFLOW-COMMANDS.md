# Agentic15 Claude Zen - Complete Workflow Commands

## Table of Contents
1. [Initial Setup](#initial-setup)
2. [Workflow 1: Backend Feature (No UI)](#workflow-1-backend-feature-no-ui)
3. [Workflow 2: UI Feature with Visual Testing](#workflow-2-ui-feature-with-visual-testing)
4. [Workflow 3: Bug Fix](#workflow-3-bug-fix)
5. [Command Reference](#command-reference)

---

## Initial Setup

### One-Time Project Setup

```bash
# Step 1: Create new project
npx @agentic15.com/agentic15-claude-zen my-project
cd my-project

# Step 2: Configure GitHub authentication
npx agentic15 auth

# Step 3: Install dependencies
npm install

# Step 4: Set up git hooks
npm run setup:git-hooks

# Done! Ready for development.
```

---

## Workflow 1: Backend Feature (No UI)

**Example**: Building a calculator with add, subtract, multiply, divide functions

### Step 1: Generate Plan

```bash
# Generate plan from description
npx agentic15 plan "Build calculator with add, subtract, multiply, divide"
```

**What happens**:
- Creates `.claude/plans/plan-XXX-generated/PROJECT-REQUIREMENTS.txt`
- Displays: "Tell Claude to create PROJECT-PLAN.json"

### Step 2: Human Tells Claude to Create Plan

```
Human: "Create the project plan"
```

**Claude does**:
- Reads `PROJECT-REQUIREMENTS.txt`
- Writes `PROJECT-PLAN.json` with tasks
- Says "Plan created"

### Step 3: Lock the Plan

```bash
# Lock plan and create task tracker
npx agentic15 plan
```

**What happens**:
- Detects `PROJECT-PLAN.json` exists
- Creates `TASK-TRACKER.json`
- Creates individual task files (`TASK-001.json`, `TASK-002.json`, etc.)
- Creates `.plan-locked` file
- Displays: "Plan locked. Run 'agentic15 task next' to start"

### Step 4: Start First Task

```bash
# Start next task in queue
npx agentic15 task next
```

**What happens**:
- Finds first pending task (TASK-001)
- Creates feature branch (`feature/task-001`)
- Creates GitHub issue (if configured)
- Updates task status to `in_progress`
- Displays task details
- Says: "Tell Claude to write code for TASK-001"

### Step 5: Human Tells Claude to Write Code

```
Human: "Write code for TASK-001"
```

**Claude does**:
- Reads `.claude/plans/.../tasks/TASK-001.json`
- Writes code in `Agent/src/`
- Writes tests in `Agent/tests/`
- Says "Done"

### Step 6: Commit, Push, Create PR

```bash
# Run tests, commit, push, create PR (ALL IN ONE)
npx agentic15 commit
```

**What happens**:
1. Runs `npm test` (BLOCKS if fails)
2. Stages all files in `Agent/`
3. Auto-generates commit message: `[TASK-001] Implement add function`
4. Creates commit
5. Pushes to `feature/task-001` branch
6. Creates PR via `gh` CLI
7. Updates GitHub issue to "in review"
8. Displays PR URL

**Output**:
```
✅ Tests passed
✅ Files staged: Agent/src/calculator.js, Agent/tests/calculator.test.js
✅ Commit created: [TASK-001] Implement add function
✅ Pushed to feature/task-001
✅ PR created: https://github.com/user/repo/pull/123
✅ GitHub issue #456 updated to "in review"

📋 Next steps:
   1. Review PR on GitHub
   2. Merge PR when approved
   3. Run: agentic15 task next
```

### Step 7: Human Reviews and Merges PR on GitHub

**Manual action**: Go to GitHub, review PR, click "Merge pull request"

### Step 8: Post-Merge (Automatic)

**What happens automatically**:
- Git hook detects merge
- Closes GitHub issue
- Deletes feature branch
- Updates task tracker (TASK-001 → completed)
- Checks out `main` branch

### Step 9: Repeat for Next Task

```bash
# Start next task
npx agentic15 task next
```

**Repeat steps 5-9 until all tasks complete**

### Step 10: Check Overall Progress

```bash
# View progress
npx agentic15 status
```

**Output**:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 PROJECT STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Project: Simple Calculator
Plan ID: plan-002-generated

   Progress: [██████████████████████████████] 100%

   ✅ Completed: 5 tasks
   ⏳ In Progress: 0 tasks
   📝 Pending: 0 tasks

🎉 All tasks completed!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Workflow 2: UI Feature with Visual Testing

**Example**: Building a Calculator UI component with React

### Steps 1-5: Same as Workflow 1

Follow Workflow 1 steps 1-5 to create plan and start task.

### Step 6: Human Tells Claude to Write UI Code

```
Human: "Write code for TASK-002 (Create Calculator UI component)"
```

**Claude does**:
- Reads `.claude/plans/.../tasks/TASK-002.json`
- Writes React component in `Agent/src/components/Calculator.jsx`
- Writes unit tests in `Agent/tests/components/Calculator.test.jsx`
- Writes visual tests in `Agent/tests/visual/Calculator.visual.test.js`
- Says "Done"

### Step 7: Run Unit Tests

```bash
# Run Jest tests
npm test
```

**Output**:
```
PASS Agent/tests/components/Calculator.test.jsx
  ✓ renders calculator with title
  ✓ performs addition correctly
  ✓ handles decimal numbers
  ✓ shows error for invalid input
  ✓ clear button resets inputs

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
```

### Step 8: Create Visual Test Baselines (First Time Only)

```bash
# Install Playwright (first time only)
npm install --save-dev @playwright/test
npx playwright install chromium

# Generate baseline screenshots
npx playwright test --update-snapshots
```

**Output**:
```
Running 6 tests using 4 workers

  6 passed (5.2s)

  6 snapshots written to:
    Agent/tests/visual/__screenshots__/Calculator.visual.test.js/
```

### Step 9: Run Visual Tests

```bash
# Run visual regression tests
npx playwright test
```

**If UI is correct**:
```
Running 6 tests using 4 workers
  6 passed (4.8s)
```

**If UI has issues** (visual regression):
```
Running 6 tests using 4 workers
  ✓ [chromium] Calculator initial state - desktop
  ✓ [chromium] Calculator initial state - mobile
  ✓ [chromium] Calculator with inputs filled
  ✗ [chromium] Calculator showing result
  ✓ [chromium] Calculator showing error
  ✓ [chromium] Calculator button hover state

  1 failed
    Calculator showing result
  5 passed (5.1s)
```

### Step 10: Run Visual Test Hook (If Tests Failed)

```bash
# Process visual test failures
node .claude/hooks/post-visual-test.js
```

**Output**:
```
📸 Post-Visual-Test Hook Running...

📊 Found 1 test result directories

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📸 VISUAL TEST RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ 1 visual test(s) FAILED
📸 3 screenshot(s) copied to .claude/visual-test-results/

📄 Report generated for Claude:
   .claude/visual-test-results/LATEST-VISUAL-TEST-REPORT.md

💡 Next steps:
   1. Ask Claude to read the visual test report
   2. Claude will view screenshots and fix issues
   3. Re-run: npx playwright test

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 11: Human Asks Claude to Fix Visual Issues

```
Human: "Claude, read the visual test report and fix the UI issues"
```

**Claude does**:
- Reads `.claude/visual-test-results/LATEST-VISUAL-TEST-REPORT.md`
- Views diff images (red pixels showing changes)
- Views actual vs expected screenshots
- Identifies the problem (e.g., wrong color, size, spacing)
- Fixes the code
- Says "Fixed"

### Step 12: Re-run Visual Tests

```bash
# Verify fix
npx playwright test
```

**Output**:
```
Running 6 tests using 4 workers
  6 passed (4.9s)

✅ All visual tests passed!
```

### Step 13: Commit, Push, Create PR

```bash
# All tests passing, commit everything
npx agentic15 commit
```

**What happens**:
1. Runs `npm test` ✅
2. Runs `npx playwright test` (if playwright.config.js exists) ✅
3. Commits with message: `[TASK-002] Create Calculator UI component`
4. Pushes to `feature/task-002`
5. Creates PR
6. Updates GitHub issue

### Steps 14-15: Same as Workflow 1

Merge PR on GitHub, continue to next task.

---

## Workflow 3: Bug Fix

**Example**: Fix calculation error in subtract function

### Step 1: Start Bug Fix Task

```bash
# If bug fix is in plan
npx agentic15 task next

# OR start specific task
npx agentic15 task start TASK-007
```

### Step 2: Human Tells Claude to Fix Bug

```
Human: "Fix the bug in TASK-007 (subtract function returns wrong result)"
```

**Claude does**:
- Reads task file
- Investigates code in `Agent/src/calculator.js`
- Identifies bug
- Fixes code
- Updates tests
- Says "Fixed"

### Step 3: Verify Fix

```bash
# Run tests to verify fix
npm test
```

**Output**:
```
PASS Agent/tests/calculator.test.js
  ✓ subtract function works correctly
  ✓ handles negative results
  ✓ handles decimal subtraction

Tests:       3 passed, 3 total
```

### Step 4: Commit, Push, Create PR

```bash
# Commit the fix
npx agentic15 commit
```

**What happens**:
- Runs tests ✅
- Commits: `[TASK-007] Fix subtract function calculation error`
- Pushes to `feature/task-007`
- Creates PR with bug fix description
- Updates GitHub issue

### Step 5: Merge and Continue

Merge PR on GitHub, continue to next task.

---

## Command Reference

### agentic15 Commands

| Command | Description | Example |
|---------|-------------|---------|
| `npx agentic15 auth` | GitHub authentication setup | `npx agentic15 auth` |
| `npx agentic15 plan "description"` | Generate and lock plan | `npx agentic15 plan "Build todo app"` |
| `npx agentic15 task start TASK-001` | Start specific task | `npx agentic15 task start TASK-003` |
| `npx agentic15 task next` | Auto-start next pending task | `npx agentic15 task next` |
| `npx agentic15 commit` | Test, commit, push, create PR | `npx agentic15 commit` |
| `npx agentic15 status` | Show project progress | `npx agentic15 status` |

### npm Commands

| Command | Description | Example |
|---------|-------------|---------|
| `npm test` | Run Jest unit tests | `npm test` |
| `npm run setup:git-hooks` | Install git hooks | `npm run setup:git-hooks` |

### Playwright Commands

| Command | Description | Example |
|---------|-------------|---------|
| `npx playwright test` | Run visual regression tests | `npx playwright test` |
| `npx playwright test --update-snapshots` | Update baseline screenshots | `npx playwright test --update-snapshots` |
| `npx playwright install chromium` | Install browser for testing | `npx playwright install chromium` |

### Hook Commands

| Command | Description | Example |
|---------|-------------|---------|
| `node .claude/hooks/post-visual-test.js` | Process visual test failures | `node .claude/hooks/post-visual-test.js` |

### Git Commands (for reference, handled by agentic15)

| Command | What agentic15 Does Instead |
|---------|----------------------------|
| `git checkout -b feature/task-001` | `npx agentic15 task next` |
| `git add .` | `npx agentic15 commit` |
| `git commit -m "message"` | `npx agentic15 commit` |
| `git push origin feature/task-001` | `npx agentic15 commit` |
| `gh pr create` | `npx agentic15 commit` |

---

## Quick Reference: Complete Feature Flow

```bash
# 1. Create plan
npx agentic15 plan "Feature description"

# 2. Human tells Claude: "Create the project plan"

# 3. Lock plan
npx agentic15 plan

# 4. Start task
npx agentic15 task next

# 5. Human tells Claude: "Write code for TASK-XXX"

# 6. Test and commit
npm test                    # Verify unit tests
npx playwright test         # Verify visual tests (if UI)
npx agentic15 commit           # Commit, push, create PR

# 7. Merge PR on GitHub

# 8. Repeat steps 4-7 for each task
npx agentic15 task next
# ... Claude writes code ...
npm test
npx agentic15 commit
# ... Merge PR ...

# 9. Check progress
npx agentic15 status
```

---

## Quick Reference: Visual Testing Flow

```bash
# First time setup
npm install --save-dev @playwright/test
npx playwright install chromium

# Create baselines (after writing visual tests)
npx playwright test --update-snapshots

# Run visual tests
npx playwright test

# If tests fail
node .claude/hooks/post-visual-test.js

# Human tells Claude: "Read visual test report and fix"

# Re-run tests
npx playwright test

# When passing, commit
npx agentic15 commit
```

---

## Troubleshooting Commands

### Check Current Status

```bash
# View current task and progress
npx agentic15 status

# View git status
git status

# View current branch
git branch
```

### Tests Failing

```bash
# Run tests with verbose output
npm test -- --verbose

# Run specific test file
npm test -- Agent/tests/calculator.test.js

# Run visual tests with debug
npx playwright test --debug
```

### Visual Test Issues

```bash
# View visual test report
cat .claude/visual-test-results/LATEST-VISUAL-TEST-REPORT.md

# Update baselines (if UI intentionally changed)
npx playwright test --update-snapshots

# Run only specific visual test
npx playwright test Calculator.visual.test.js
```

### GitHub Issues

```bash
# View open issues
gh issue list

# View specific issue
gh issue view 123

# View open PRs
gh pr list

# View specific PR
gh pr view 456
```

---

## Notes

### Human vs Claude Responsibilities

**Human does**:
- Run `agentic15` commands
- Run `npm test`, `npx playwright test`
- Review and merge PRs on GitHub
- Approve/reject Claude's plan

**Claude does**:
- Create `PROJECT-PLAN.json` from requirements
- Write code in `Agent/src/`
- Write tests in `Agent/tests/`
- Fix bugs and visual regressions
- Read visual test reports

**agentic15 CLI does**:
- Generate plan requirements
- Create/manage tasks
- Run tests
- Create commits with auto-generated messages
- Push to feature branches
- Create PRs
- Update GitHub issues

### Blocked Commands

Claude **CANNOT** run these commands (blocked in settings.json):
- `npx agentic15 *` (CLI commands)
- `git *` (git commands)
- `gh *` (GitHub CLI commands)

This ensures clear separation: Human handles automation, Claude writes code.

---

## Summary

The entire workflow boils down to **5 human commands**:

```bash
1. agentic15 plan "description"       # Generate plan
2. agentic15 plan                     # Lock plan (after Claude creates it)
3. agentic15 task next                # Start task
4. npm test && npx playwright test    # Verify tests
5. agentic15 commit                   # Commit, push, PR
```

Everything else is automated or handled by Claude.
