# Task Management Guide

**Complete guide to starting, tracking, and completing tasks in Agentic15 Claude Zen**

This guide covers the entire task lifecycle from start to completion, including dependency management and progress tracking.

---

## Table of Contents

1. [Task Lifecycle](#task-lifecycle)
2. [Starting Tasks](#starting-tasks)
3. [Working on Tasks](#working-on-tasks)
4. [Completing Tasks](#completing-tasks)
5. [Task Status & Progress](#task-status--progress)
6. [Dependencies](#dependencies)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Task Lifecycle

### Task States

```
pending → in_progress → completed
```

**pending**: Task not yet started
**in_progress**: Currently being worked on (only ONE at a time)
**completed**: All criteria met, work finished

### State Transitions

```bash
# pending → in_progress
npm run task:start TASK-001

# in_progress → completed
npm run task:done TASK-001

# Cannot go backwards
# Cannot skip states
```

### Task File Structure

**When plan is locked, each task gets a file:**

```
.claude/plans/plan-001-generated/tasks/
├── TASK-001.json
├── TASK-002.json
├── TASK-003.json
└── ...
```

**Example TASK-001.json:**
```json
{
  "id": "TASK-001",
  "title": "Create login form component",
  "description": "Build React login form with email and password fields, validation, and error handling",
  "phase": "implementation",
  "estimatedHours": 3,
  "status": "pending",
  "dependencies": [],
  "files": [
    "Agent/src/components/LoginForm.jsx",
    "Agent/tests/components/LoginForm.test.jsx",
    "test-site/src/components/LoginForm.jsx"
  ],
  "completionCriteria": [
    "Form validates email format",
    "Password must be 8+ characters",
    "Shows inline error messages",
    "Calls onSubmit with form data",
    "Tests cover all validation scenarios",
    "Component renders in test-site"
  ],
  "metadata": {
    "createdAt": "2025-12-24T19:00:00Z",
    "startedAt": null,
    "completedAt": null,
    "timeSpent": 0
  }
}
```

---

## Starting Tasks

### Check Available Tasks

```bash
npm run task:status
```

**Output:**
```
📊 Project: Task Management App
📋 Plan: plan-001-generated

Available Tasks:
  ⏸️  TASK-001: Create login form component [pending]
       Phase: implementation
       Estimate: 3 hours
       Dependencies: none
       ✅ Ready to start

  ⏸️  TASK-002: Implement login API [pending]
       Phase: implementation
       Estimate: 4 hours
       Dependencies: TASK-001
       ⚠️  Blocked by: TASK-001

  ⏸️  TASK-003: Add JWT authentication [pending]
       Phase: implementation
       Estimate: 5 hours
       Dependencies: TASK-002
       ⚠️  Blocked by: TASK-001, TASK-002
```

### Start a Task

```bash
npm run task:start TASK-001
```

**System validates:**
1. ✅ No other task in progress
2. ✅ All dependencies completed
3. ✅ Task is in plan
4. ✅ Plan is active and locked

**Output:**
```
✅ TASK-001 started

📋 Task Details:
   ID: TASK-001
   Title: Create login form component
   Phase: implementation
   Estimated: 3 hours

📝 Requirements:
   Build React login form with email and password fields,
   validation, and error handling

📁 Files to Create/Modify:
   - Agent/src/components/LoginForm.jsx
   - Agent/tests/components/LoginForm.test.jsx
   - test-site/src/components/LoginForm.jsx

✅ Completion Criteria:
   1. Form validates email format
   2. Password must be 8+ characters
   3. Shows inline error messages
   4. Calls onSubmit with form data
   5. Tests cover all validation scenarios
   6. Component renders in test-site

⏱️  Time tracking started
💡 TIP: Commit frequently with [TASK-001] in message

🚀 Ready to code!
```

**Task file updated:**
```json
{
  "id": "TASK-001",
  "status": "in_progress",
  "metadata": {
    "startedAt": "2025-12-24T20:00:00Z",
    "timeSpent": 0
  }
}
```

### What Happens When Task Starts

**System updates:**
1. Task status: `pending` → `in_progress`
2. TASK-TRACKER.json updated
3. Start time recorded
4. Task displayed in active workspace

**Hooks activate:**
- Commits must reference [TASK-001]
- Changed files validated against task.files
- Completion criteria tracked

---

## Working on Tasks

### Read Task Requirements

**Always start by reading the task file:**

```bash
cat .claude/plans/plan-001-generated/tasks/TASK-001.json
```

**Extract key information:**
- What to build (description)
- Where to put it (files)
- How to know it's done (completion criteria)
- How long it should take (estimated hours)

### Follow the 9-Step Workflow

```
1. ✅ Read task file
2. ✅ Read related files
3. ✅ Write code in Agent/
4. ✅ Write tests with assertions
5. ✅ Run tests (must pass)
6. ✅ Commit with [TASK-XXX]
7. ✅ Push to remote
8. ✅ Verify criteria met
9. ✅ Mark complete
```

### Example: Complete Task Execution

**TASK-001: Create login form component**

#### Step 1-2: Read and Understand

```bash
# Read task
cat .claude/plans/plan-001-generated/tasks/TASK-001.json

# Read existing code that might be related
cat Agent/src/components/Form.jsx
cat Agent/src/utils/validation.js
```

#### Step 3: Write Code

```jsx
// Agent/src/components/LoginForm.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Login form component with email and password validation
 *
 * @param {Function} onSubmit - Callback when form is submitted with valid data
 */
export default function LoginForm({ onSubmit }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validate = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be 8+ characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ email, password });
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid="login-form">
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          data-testid="email-input"
        />
        {errors.email && (
          <span className="error" data-testid="email-error">
            {errors.email}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          data-testid="password-input"
        />
        {errors.password && (
          <span className="error" data-testid="password-error">
            {errors.password}
          </span>
        )}
      </div>

      <button type="submit" data-testid="submit-button">
        Login
      </button>
    </form>
  );
}

LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};
```

#### Step 4: Write Tests

```jsx
// Agent/tests/components/LoginForm.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginForm from '../../src/components/LoginForm';

describe('LoginForm Component', () => {
  let mockOnSubmit;

  beforeEach(() => {
    mockOnSubmit = jest.fn();
  });

  test('renders email and password fields', () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  test('validates email format', () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'invalid-email' },
    });
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByTestId('submit-button'));

    expect(screen.getByTestId('email-error')).toHaveTextContent(
      'Invalid email format'
    );
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('validates password length', () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { value: 'short' },
    });
    fireEvent.click(screen.getByTestId('submit-button'));

    expect(screen.getByTestId('password-error')).toHaveTextContent(
      'Password must be 8+ characters'
    );
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('shows error for empty fields', () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);

    fireEvent.click(screen.getByTestId('submit-button'));

    expect(screen.getByTestId('email-error')).toHaveTextContent(
      'Email is required'
    );
    expect(screen.getByTestId('password-error')).toHaveTextContent(
      'Password is required'
    );
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('calls onSubmit with valid data', () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByTestId('submit-button'));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  test('clears errors when valid input provided', () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);

    // Submit with invalid data
    fireEvent.click(screen.getByTestId('submit-button'));
    expect(screen.getByTestId('email-error')).toBeInTheDocument();

    // Fix the data
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByTestId('submit-button'));

    // Errors should be gone
    expect(screen.queryByTestId('email-error')).not.toBeInTheDocument();
    expect(screen.queryByTestId('password-error')).not.toBeInTheDocument();
  });
});
```

#### Step 5: Run Tests

```bash
npm test
```

**Output:**
```
PASS Agent/tests/components/LoginForm.test.jsx
  LoginForm Component
    ✓ renders email and password fields (28 ms)
    ✓ validates email format (22 ms)
    ✓ validates password length (19 ms)
    ✓ shows error for empty fields (18 ms)
    ✓ calls onSubmit with valid data (21 ms)
    ✓ clears errors when valid input provided (25 ms)

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        2.145 s
```

#### Step 6-7: Commit and Push

```bash
git add Agent/src/components/LoginForm.jsx
git add Agent/tests/components/LoginForm.test.jsx
git add test-site/src/components/LoginForm.jsx

git commit -m "[TASK-001] Create login form component

- Add LoginForm with email and password fields
- Validate email format with regex
- Validate password length (8+ chars)
- Show inline error messages
- Add 6 comprehensive tests
- Add to test-site for preview

All completion criteria met.
"

git push origin main
```

**Hooks validate:**
```
📋 Testing changed files (3 files):
   - Agent/src/components/LoginForm.jsx
   - Agent/tests/components/LoginForm.test.jsx
   - test-site/src/components/LoginForm.jsx

✅ Tests passed (6/6)
✅ Real assertions found (15 expect calls)
✅ UI integration validated (test-site file exists)
✅ Code auto-formatted
✅ Commit allowed

[main 7a9f3c2] [TASK-001] Create login form component
 3 files changed, 215 insertions(+)
```

#### Step 8: Verify Completion Criteria

```
Completion Criteria Checklist:

✅ Form validates email format
   → validateEmail function with regex

✅ Password must be 8+ characters
   → password.length < 8 check

✅ Shows inline error messages
   → errors.email and errors.password displayed

✅ Calls onSubmit with form data
   → onSubmit({ email, password })

✅ Tests cover all validation scenarios
   → 6 tests: rendering, email, password, empty, valid, error clearing

✅ Component renders in test-site
   → test-site/src/components/LoginForm.jsx created

ALL CRITERIA MET ✅
```

#### Step 9: Mark Complete

```bash
npm run task:done TASK-001
```

---

## Completing Tasks

### Completion Requirements

**Task can only complete when:**
1. ✅ All code committed
2. ✅ All tests passing
3. ✅ No uncommitted changes
4. ✅ All completion criteria met
5. ✅ Task currently in_progress

### Complete Task Command

```bash
npm run task:done TASK-001
```

**System validates:**

```
🔍 Validating TASK-001 completion...

✅ Task status: in_progress
✅ Git status: clean (no uncommitted changes)
✅ Tests: passing (6/6)
✅ Completion criteria: all met (6/6)

⏱️  Time tracking:
   Started: 2025-12-24 20:00:00
   Completed: 2025-12-24 22:45:00
   Duration: 2.75 hours
   Estimated: 3 hours
   Variance: -0.25 hours (8% under estimate)

✅ TASK-001 marked as completed

📊 Progress Update:
   Total tasks: 25
   Completed: 1 (4%)
   In progress: 0
   Pending: 24 (96%)

   Estimated remaining: 72 hours
   Actual pace: 91.7% of estimates

🎯 Next Available Tasks:
   TASK-002: Implement login API
      Dependencies: TASK-001 ✅
      Ready to start: YES

Run: npm run task:start TASK-002
```

**Updates made:**
```json
// .claude/plans/plan-001-generated/tasks/TASK-001.json
{
  "id": "TASK-001",
  "status": "completed",
  "metadata": {
    "startedAt": "2025-12-24T20:00:00Z",
    "completedAt": "2025-12-24T22:45:00Z",
    "timeSpent": 2.75
  }
}

// .claude/plans/plan-001-generated/TASK-TRACKER.json
{
  "tasks": {
    "TASK-001": {
      "status": "completed",
      "startedAt": "2025-12-24T20:00:00Z",
      "completedAt": "2025-12-24T22:45:00Z",
      "timeSpent": 2.75,
      "estimateAccuracy": 0.917
    }
  },
  "statistics": {
    "totalCompleted": 1,
    "averageAccuracy": 0.917,
    "totalTimeSpent": 2.75
  }
}
```

### What If Criteria Not Met?

**System blocks completion:**

```bash
npm run task:done TASK-001

❌ Cannot complete TASK-001

Incomplete criteria:
  ❌ Tests cover all validation scenarios
     → Only 3 tests found, need coverage for edge cases

  ❌ Component renders in test-site
     → File not found: test-site/src/components/LoginForm.jsx

Outstanding work:
  1. Add tests for edge cases (empty string, special chars)
  2. Create integration site file

Fix these issues and try again.
```

**Fix and retry:**

```bash
# Add missing tests
vim Agent/tests/components/LoginForm.test.jsx

# Create integration file
cp Agent/src/components/LoginForm.jsx test-site/src/components/LoginForm.jsx

# Commit
git commit -m "[TASK-001] Add missing tests and integration file"

# Try again
npm run task:done TASK-001
# ✅ Success
```

---

## Task Status & Progress

### Check Overall Status

```bash
npm run task:status
```

**Detailed output:**

```
📊 PROJECT STATUS
═══════════════════════════════════════════════════════════

Project: Task Management Application
Plan: plan-001-generated
Status: Active | Locked

PROGRESS
────────────────────────────────────────────────────────────
  Completed:    15 tasks  ████████░░░░░░░░  45%
  In Progress:   1 task   ░░░░░░░░░░░░░░░░   3%
  Pending:      18 tasks  ░░░░░░░░░░░░░░░░  52%
  ─────────────────────────────────────────────────────────
  Total:        34 tasks

TIME TRACKING
────────────────────────────────────────────────────────────
  Estimated:     85 hours
  Spent:       38.5 hours
  Remaining:   46.5 hours
  ─────────────────────────────────────────────────────────
  On Track:    YES (105% of estimate pace)
  ETA:         2025-12-28 (3 days)

CURRENT TASK
────────────────────────────────────────────────────────────
  TASK-016: Create task filtering component
  Phase: implementation
  Estimated: 4 hours
  Elapsed: 1.5 hours
  Progress: 37.5%

NEXT AVAILABLE
────────────────────────────────────────────────────────────
  TASK-017: Implement task search [Ready]
  TASK-018: Add task categories [Ready]
  TASK-019: Create task detail view [Blocked by TASK-017]

BY PHASE
────────────────────────────────────────────────────────────
  Design:         5/5    ████████████████ 100%
  Implementation: 8/20   ██████░░░░░░░░░░  40%
  Testing:        2/7    ████░░░░░░░░░░░░  29%
  Deployment:     0/2    ░░░░░░░░░░░░░░░░   0%
```

### List Tasks by Status

```bash
# Show only pending tasks
npm run task:status --pending

# Show only completed tasks
npm run task:status --completed

# Show tasks by phase
npm run task:status --phase=implementation
```

### View Specific Task

```bash
npm run task:next
```

**Shows next recommended task:**

```
🎯 NEXT TASK

TASK-017: Implement task search
─────────────────────────────────────────────────────────────

Description:
  Add search functionality to filter tasks by text in title
  and description

Phase: implementation
Estimated: 3 hours

Dependencies:
  ✅ TASK-001: Create login form
  ✅ TASK-015: Create task list component
  ✅ TASK-016: Create task filtering component

Files to Create/Modify:
  - Agent/src/components/TaskSearch.jsx
  - Agent/src/hooks/useTaskSearch.js
  - Agent/tests/components/TaskSearch.test.jsx
  - test-site/src/components/TaskSearch.jsx

Completion Criteria:
  1. Search input filters tasks in real-time
  2. Searches both title and description
  3. Case-insensitive search
  4. Highlights matching text
  5. Shows "no results" message
  6. Tests cover all search scenarios

Ready to start: YES

Run: npm run task:start TASK-017
```

---

## Dependencies

### How Dependencies Work

**Tasks can depend on other tasks:**

```json
{
  "id": "TASK-015",
  "title": "Create task API endpoints",
  "dependencies": ["TASK-010", "TASK-012"]
}
```

**Rules:**
- ✅ Cannot start TASK-015 until TASK-010 and TASK-012 complete
- ✅ System validates dependencies before allowing task:start
- ⚠️ Warns if dependencies exist but starting anyway

### Dependency Validation

**Attempting to start blocked task:**

```bash
npm run task:start TASK-015

❌ Cannot start TASK-015

Unmet dependencies:
  ❌ TASK-010: Create database schema [pending]
  ❌ TASK-012: Implement data layer [pending]

Complete these tasks first, or remove dependencies via plan:amend
```

### Viewing Dependency Tree

```bash
npm run task:tree TASK-020
```

**Output:**

```
📊 DEPENDENCY TREE: TASK-020

TASK-020: Deploy to production
  └─ TASK-019: Run integration tests
      └─ TASK-015: Create task API endpoints
          ├─ TASK-010: Create database schema ✅
          └─ TASK-012: Implement data layer
              └─ TASK-010: Create database schema ✅

Status:
  ✅ Ready: 1 task (TASK-010)
  🔄 In progress: 0 tasks
  ⏸️  Blocked: 3 tasks (TASK-012, TASK-015, TASK-019, TASK-020)

Next action: Complete TASK-012 to unblock chain
```

### Circular Dependencies

**System prevents these:**

```json
// ❌ This will be rejected
{
  "id": "TASK-010",
  "dependencies": ["TASK-012"]
},
{
  "id": "TASK-012",
  "dependencies": ["TASK-010"]
}
```

**Validation error:**

```
❌ Plan validation failed

Circular dependency detected:
  TASK-010 → TASK-012 → TASK-010

Fix: Remove one dependency to break the cycle
```

---

## Best Practices

### Task Execution

**1. One task at a time**
```
✅ GOOD: Focus on TASK-001 until complete
❌ BAD: Start TASK-001, get distracted, start TASK-002
```

**2. Read before coding**
```
✅ GOOD: Read task file, understand requirements, plan approach
❌ BAD: Start coding based on task title alone
```

**3. Commit frequently**
```
✅ GOOD: Commit after each logical unit (component, test, feature)
❌ BAD: One giant commit at task end
```

**4. Test as you go**
```
✅ GOOD: Write test → Write code → Run test → Refactor
❌ BAD: Write all code → Write all tests at end
```

**5. Verify criteria before task:done**
```
✅ GOOD: Check each criterion, ensure all met
❌ BAD: Assume completion, let hooks catch issues
```

### Time Management

**1. Track actual vs estimate**
```
Use estimates to gauge progress, not as deadlines
If consistently over/under, adjust future estimates
```

**2. Break when stuck**
```
Stuck > 30 minutes? Take a break
Ask for help rather than thrash
```

**3. Don't optimize prematurely**
```
Make it work first
Make it right second
Make it fast third (if needed)
```

### Communication

**1. Report progress clearly**
```
✅ GOOD: "Completed LoginForm component, 6/6 tests passing, all criteria met"
❌ BAD: "Done with login stuff"
```

**2. Raise blockers early**
```
✅ GOOD: "TASK-015 blocked - API spec unclear, need clarification"
❌ BAD: Work around unclear requirements, create tech debt
```

**3. Update estimates honestly**
```
✅ GOOD: "Task taking longer than estimate, need 2 more hours"
❌ BAD: Rush to meet estimate, sacrifice quality
```

---

## Troubleshooting

### "Cannot start task: another task in progress"

**Problem**: TASK-010 still in progress

**Solution**:
```bash
# Check current task
npm run task:status

# Complete current task
npm run task:done TASK-010

# Or cancel (if needed)
# Edit TASK-TRACKER.json manually (not recommended)
```

### "Task has unmet dependencies"

**Problem**: Dependencies not complete

**Solution**:
```bash
# Check dependencies
npm run task:tree TASK-020

# Complete dependencies first
npm run task:start TASK-010

# Or remove dependency via amendment
npm run plan:amend
```

### "Completion criteria not met"

**Problem**: Trying to complete unfinished task

**Solution**:
```bash
# Review criteria
cat .claude/plans/*/tasks/TASK-XXX.json

# Complete remaining work
# ... fix issues ...

# Try again
npm run task:done TASK-XXX
```

### "No active plan"

**Problem**: .claude/ACTIVE-PLAN empty

**Solution**:
```bash
echo "plan-001-generated" > .claude/ACTIVE-PLAN
```

---

## Summary

**Task lifecycle:**
```
pending → task:start → in_progress → work → task:done → completed
```

**Key commands:**
- `npm run task:status` - View progress
- `npm run task:start TASK-XXX` - Start task
- `npm run task:done TASK-XXX` - Complete task
- `npm run task:next` - Show next recommended task
- `npm run task:tree TASK-XXX` - Show dependencies

**Remember:**
- ✅ One task at a time
- ✅ Read task file first
- ✅ Follow 9-step workflow
- ✅ Test continuously
- ✅ Commit frequently with [TASK-XXX]
- ✅ Verify all criteria before task:done

---

**Copyright 2024-2025 Agentic15**
Licensed under the Apache License, Version 2.0
