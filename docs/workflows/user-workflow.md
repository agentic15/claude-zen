# User Workflow Guide

**For**: Project owners, developers, stakeholders (humans)
**Purpose**: How to use Agentic15 Claude Zen as a human working with or without AI agents

This guide covers the complete workflow from project creation to deployment.

---

## Table of Contents

1. [Project Setup](#project-setup)
2. [Planning Phase](#planning-phase)
3. [Development Phase](#development-phase)
4. [Testing & Quality](#testing--quality)
5. [UI Component Workflow](#ui-component-workflow)
6. [Review & Deployment](#review--deployment)
7. [Advanced Workflows](#advanced-workflows)

---

## Project Setup

### Create New Project

```bash
npx create-agentic15-claude-zen my-project
cd my-project
```

**Verify Installation:**
```bash
npm run help          # See all commands
ls -la .claude/       # Verify framework files
git status            # Should be clean with initial commit
```

### Configure Project

Edit `package.json` for your needs:

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "description": "Your project description",
  "scripts": {
    "test": "jest",
    "build": "your-build-command",
    "deploy": "your-deploy-command"
  }
}
```

###Connect to Remote Repository

```bash
git remote add origin https://github.com/yourname/your-repo.git
git push -u origin main
```

---

## Planning Phase

### Step 1: Generate Plan

**Human (You):** Define what you want to build.

```bash
npm run plan:generate "Build a task management app with:
- User authentication
- Create, edit, delete tasks
- Task categories and tags
- Due dates and reminders
- React frontend, Node.js backend
"
```

**System:** Creates `.claude/plans/plan-001-generated/PROJECT-REQUIREMENTS.txt`

### Step 2: Review Requirements

```bash
cat .claude/plans/plan-001-generated/PROJECT-REQUIREMENTS.txt
```

**Edit if needed:**
```bash
vim .claude/plans/plan-001-generated/PROJECT-REQUIREMENTS.txt
```

### Step 3: Create Structured Plan

**Option A: Claude Code creates plan**
- Claude Code reads PROJECT-REQUIREMENTS.txt
- Creates PROJECT-PLAN.json following PLAN-SCHEMA.json
- Breaks work into tasks with estimates

**Option B: You create plan manually**

```json
{
  "metadata": {
    "planId": "plan-001-generated",
    "title": "Task Management App",
    "description": "Full-stack task management with React and Node.js",
    "created": "2025-12-24T18:00:00Z",
    "estimatedHours": 120
  },
  "structure": "hierarchical",
  "hierarchy": {
    "project": {
      "id": "PROJ-001",
      "title": "Task Management App",
      "subprojects": [
        {
          "id": "SUB-001",
          "title": "Authentication System",
          "milestones": [
            {
              "id": "MILE-001",
              "title": "User Login",
              "tasks": [
                {
                  "id": "TASK-001",
                  "title": "Create login form component",
                  "phase": "implementation",
                  "estimatedHours": 3
                },
                {
                  "id": "TASK-002",
                  "title": "Implement authentication API",
                  "phase": "implementation",
                  "estimatedHours": 5,
                  "dependencies": ["TASK-001"]
                }
              ]
            }
          ]
        }
      ]
    }
  }
}
```

### Step 4: Activate Plan

```bash
echo "plan-001-generated" > .claude/ACTIVE-PLAN
```

**Critical**: This MUST be done before locking.

### Step 5: Lock Plan

```bash
npm run plan:init
```

**What this does:**
- Validates plan against PLAN-SCHEMA.json
- Creates TASK-TRACKER.json for progress tracking
- Creates individual task files in tasks/
- Creates .plan-locked marker (plan becomes immutable)

**After locking**, you can only modify the plan via:
```bash
npm run plan:amend
```

This creates an audit trail of all changes.

---

## Development Phase

### Start a Task

**Check available tasks:**
```bash
npm run task:status
```

**Output:**
```
📊 Project: Task Management App
📋 Plan: plan-001-generated

Tasks:
  ⏸️  TASK-001: Create login form component [pending]
  ⏸️  TASK-002: Implement authentication API [pending] (blocked by TASK-001)
  ⏸️  TASK-003: Add JWT token handling [pending] (blocked by TASK-002)

Progress: 0/15 tasks completed (0%)
```

**Start first task:**
```bash
npm run task:start TASK-001
```

**System validates:**
- ✅ No other task is in progress
- ✅ All dependencies are completed
- ✅ Task is in correct sequence (warns if skipping)

### Work on Task

**Read task details:**
```bash
cat .claude/plans/plan-001-generated/tasks/TASK-001.json
```

**Write code in Agent/ directory:**
```bash
# Create component
vim Agent/src/components/LoginForm.jsx

# Create test
vim Agent/tests/components/LoginForm.test.jsx

# Add to integration site (UI only)
vim test-site/src/components/LoginForm.jsx
```

**Key rules:**
1. All source code goes in `Agent/src/`
2. All tests go in `Agent/tests/`
3. All scripts go in `scripts/`
4. UI components need test-site integration

### Run Tests

**Full test suite:**
```bash
npm test
```

**Watch mode:**
```bash
npm test -- --watch
```

**Coverage:**
```bash
npm test -- --coverage
```

**Expected output:**
```
PASS Agent/tests/components/LoginForm.test.jsx
  LoginForm Component
    ✓ renders email and password fields (23 ms)
    ✓ calls onSubmit with form data (18 ms)
    ✓ shows error message on invalid input (15 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Coverage:    95% statements, 90% branches
```

### Commit Work

**Stage changes:**
```bash
git add Agent/src/components/LoginForm.jsx
git add Agent/tests/components/LoginForm.test.jsx
git add test-site/src/components/LoginForm.jsx
```

**Commit with task reference:**
```bash
git commit -m "[TASK-001] Create login form component

- Add LoginForm component with email/password fields
- Add form validation
- Add comprehensive tests
- Add to integration site for preview
"
```

**Hooks run automatically:**
```
📋 Testing changed files (3 files):
   - Agent/src/components/LoginForm.jsx
   - Agent/tests/components/LoginForm.test.jsx
   - test-site/src/components/LoginForm.jsx

✅ Tests passed (3/3)
✅ Code formatted
✅ No empty tests detected
✅ UI integration validated
✅ Commit allowed

[main a7f3c2d] [TASK-001] Create login form component
 3 files changed, 150 insertions(+)
```

**If hooks block:**
```
❌ TEST QUALITY CHECK FAILED

File: LoginForm.test.jsx

  BLOCKED: Test contains only comments, no actual code
  BLOCKED: Test file contains test cases but NO assertions

Fix these issues before proceeding.
```

**Fix and retry:**
```bash
# Fix the test
vim Agent/tests/components/LoginForm.test.jsx

# Retry commit
git commit -m "[TASK-001] Create login form component"
```

### Complete Task

**When all requirements met:**
```bash
npm run task:done TASK-001
```

**System validates:**
- ✅ All code committed
- ✅ Tests passing
- ✅ No pending changes
- ✅ Completion criteria met

**Output:**
```
✅ TASK-001 marked as completed
⏱️  Time spent: 2.5 hours (estimated: 3 hours)

📊 Progress:
   Total: 15 tasks
   Completed: 1
   In progress: 0
   Pending: 14

🎯 Next available task: TASK-002
   Run: npm run task:start TASK-002
```

### Continue with Next Tasks

```bash
npm run task:start TASK-002
# ... work on task ...
npm test
git commit -m "[TASK-002] Description"
npm run task:done TASK-002

npm run task:start TASK-003
# ... repeat ...
```

---

## Testing & Quality

### Test Types

**1. Unit Tests** (Required for all code)
```javascript
// Agent/tests/utils/formatDate.test.js
import { formatDate } from '../../src/utils/formatDate';

describe('formatDate', () => {
  test('formats ISO date to MM/DD/YYYY', () => {
    expect(formatDate('2025-12-24')).toBe('12/24/2025');
  });
});
```

**2. Component Tests** (Required for UI)
```javascript
// Agent/tests/components/TaskList.test.jsx
import { render, screen } from '@testing-library/react';
import TaskList from '../../src/components/TaskList';

describe('TaskList', () => {
  test('renders list of tasks', () => {
    const tasks = [{ id: 1, title: 'Test task' }];
    render(<TaskList tasks={tasks} />);
    expect(screen.getByText('Test task')).toBeInTheDocument();
  });
});
```

**3. Integration Tests** (Recommended)
```javascript
// Agent/tests/integration/authentication.test.js
import request from 'supertest';
import app from '../../src/app';

describe('Authentication Flow', () => {
  test('complete login flow', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});
```

### Smart Testing (Large Codebases)

**Problem:** 43,000 lines of code = slow tests on every commit

**Solution:** Hooks test ONLY changed files

**How it works:**
```bash
# You modify 2 files
vim Agent/src/components/Button.jsx
vim Agent/tests/components/Button.test.jsx

# Git commit triggers hooks
git commit -m "[TASK-005] Update button styles"

# Hooks detect changed files
# → Only runs tests for Button component (2 seconds)
# → NOT all 500 test files (45 seconds)
```

**Manual full suite:**
```bash
npm test  # Runs ALL tests (use before merging to main)
```

### Quality Enforcement

**Hooks validate:**

| Check | Blocks Commit? | Purpose |
|-------|---------------|----------|
| Tests exist | ✅ Yes | Ensure code is tested |
| Tests have assertions | ✅ Yes | No fake tests |
| Tests pass | ✅ Yes | No broken code |
| Code formatted | No (auto-fixes) | Consistent style |
| UI integration exists | ✅ Yes (UI only) | Preview components |
| Empty test bodies | ✅ Yes | No placeholder tests |
| console.log in tests | ⚠️ Warn | Remove debug code |

---

## UI Component Workflow

### Three-File Pattern (Required)

Every UI component needs 3 files:

**1. Component** (`Agent/src/components/`)
```jsx
// Agent/src/components/TaskCard.jsx
import React from 'react';

export default function TaskCard({ task, onComplete }) {
  return (
    <div className="task-card">
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <button onClick={() => onComplete(task.id)}>
        Complete
      </button>
    </div>
  );
}
```

**2. Test** (`Agent/tests/components/`)
```jsx
// Agent/tests/components/TaskCard.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import TaskCard from '../../src/components/TaskCard';

test('calls onComplete when button clicked', () => {
  const mockComplete = jest.fn();
  const task = { id: 1, title: 'Test', description: 'Desc' };

  render(<TaskCard task={task} onComplete={mockComplete} />);

  fireEvent.click(screen.getByText('Complete'));

  expect(mockComplete).toHaveBeenCalledWith(1);
});
```

**3. Integration Site** (`test-site/src/components/`)
```jsx
// test-site/src/components/TaskCard.jsx
// Copy from Agent/src/components/TaskCard.jsx
import React from 'react';

export default function TaskCard({ task, onComplete }) {
  return (
    <div className="task-card">
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <button onClick={() => onComplete(task.id)}>
        Complete
      </button>
    </div>
  );
}
```

**Add to test-site App:**
```jsx
// test-site/src/App.jsx
import TaskCard from './components/TaskCard';

function App() {
  const sampleTask = {
    id: 1,
    title: 'Sample Task',
    description: 'This is how the TaskCard looks'
  };

  return (
    <div>
      <h1>Component Preview</h1>
      <TaskCard
        task={sampleTask}
        onComplete={(id) => console.log('Completed:', id)}
      />
    </div>
  );
}
```

### Preview Integration Site

**Start dev server:**
```bash
cd test-site
npm install
npm run dev
```

**Open browser:**
```
http://localhost:5173
```

**Hot reload:** Changes to components update automatically.

**Share with stakeholders:** Run `npm run dev -- --host` to access from network.

### Why Three Files?

1. **Component**: Your actual production code
2. **Test**: Ensures component works correctly
3. **Integration Site**: Visual preview for stakeholders

**Hooks enforce this** - commits blocked if missing any file.

---

## Review & Deployment

### Pre-Deployment Checklist

```bash
# 1. All tasks complete
npm run task:status
# Should show: Progress: 15/15 tasks completed (100%)

# 2. All tests pass
npm test
# Should show: All tests passed

# 3. No uncommitted changes
git status
# Should show: nothing to commit, working tree clean

# 4. Build succeeds
npm run build
# Should complete without errors
```

### Create Release

```bash
# Tag version
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push with tags
git push origin main --tags
```

### Deploy

```bash
# Run deployment script
npm run deploy

# Or manual deployment
# (depends on your hosting)
```

---

## Advanced Workflows

### Amending Plans

**When requirements change:**

```bash
npm run plan:amend
```

**Interactive prompts:**
```
? What would you like to amend?
  › Add new task
    Modify existing task
    Remove task
    Change dependencies
    Update estimates

? Reason for amendment: Client requested new feature

✅ Amendment recorded in audit trail
✅ Plan updated
```

### Working Without Plans

**Framework works without structured plans:**

```bash
# Just code and commit
vim Agent/src/mycode.js
vim Agent/tests/mycode.test.js
git commit -m "Add new feature"

# Hooks still validate quality
```

**But you lose:**
- Task tracking
- Progress monitoring
- Time estimates
- Dependency management

### Multiple Developers

**Branch strategy:**
```bash
# Each developer works on task branch
git checkout -b task-001-login-form
# ... work on task ...
git commit -m "[TASK-001] Login form"
git push origin task-001-login-form

# Create PR
gh pr create --title "[TASK-001] Login form"

# After review, merge to main
```

**Note:** Framework designed for main-branch development, but supports branches if needed.

### Emergency Fixes

**For production hotfixes:**

```bash
# Work directly without task
vim Agent/src/buggy-code.js
npm test
git commit -m "HOTFIX: Fix critical bug in authentication"
git push origin main

# Update plan later
npm run plan:amend
# Add "TASK-999: Emergency auth fix" retroactively
```

---

## Common Questions

**Q: Do I need to use Claude Code?**
A: No! Framework is useful for any developer. Claude Code just automates the work.

**Q: Can I disable hooks temporarily?**
A: Not recommended. Edit `.claude/settings.json` if absolutely needed.

**Q: What if I want to refactor without a task?**
A: Create a "TASK-XXX: Refactor module" task in your plan.

**Q: Can I use this for non-code projects?**
A: Yes! Works for documentation, design, any file-based work.

**Q: How do I handle database migrations?**
A: Write migration scripts in `Agent/db/`, human executes them.

---

## Troubleshooting

**Hooks blocking valid commits?**
```bash
# Check what's failing
cat .claude/hooks/*.js

# Temporarily bypass (not recommended)
git commit --no-verify
```

**Task won't start?**
```bash
# Check dependencies
npm run task:status

# Check if another task in progress
cat .claude/plans/*/TASK-TRACKER.json
```

**Tests slow?**
```bash
# Hooks should test only changed files
# Verify with:
git diff --cached --name-only

# If still slow, check jest.config.js
```

---

## Next Steps

- **Read Agent Workflow**: [Agent Workflow](agent-workflow.md)
- **Deep dive into architecture**: [Architecture](../architecture/overview.md)
- **Explore examples**: [Examples](../../examples/)

---

**Copyright 2024-2025 Agentic15**
"Code with Intelligence, Ship with Confidence"
