# Agent Workflow Guide

**For**: Claude Code and AI agents
**Purpose**: How AI agents should operate within the Agentic15 Claude Zen framework

This guide defines the mandatory workflows, responsibilities, and constraints for AI agents working with this framework.

---

## Table of Contents

1. [Agent Responsibilities](#agent-responsibilities)
2. [Mandatory Workflows](#mandatory-workflows)
3. [File Access Rules](#file-access-rules)
4. [Task Execution](#task-execution)
5. [Testing Requirements](#testing-requirements)
6. [UI Development](#ui-development)
7. [Git & Commits](#git--commits)
8. [What Agents Cannot Do](#what-agents-cannot-do)
9. [Hook Interaction](#hook-interaction)
10. [Error Handling](#error-handling)

---

## Agent Responsibilities

As an AI agent working within Agentic15 Claude Zen, you are responsible for:

### 1. Reading Task Requirements
**ALWAYS read the task file before starting work:**

```bash
# Read active task
cat .claude/plans/*/tasks/TASK-XXX.json
```

**Never work from memory**. Task files contain:
- Requirements and acceptance criteria
- Dependencies on other tasks
- Estimated time and phase
- Specific files to modify

### 2. Following Structured Workflow
**You MUST follow the 9-step workflow:**

```
1. Read task file
2. Read all related files mentioned in task
3. Make changes ONLY in Agent/ or scripts/
4. Write/update tests with real assertions
5. Run tests (must pass)
6. Commit with task reference [TASK-XXX]
7. Push to remote
8. Verify completion criteria met
9. Mark task complete (human does this)
```

**Never skip steps**. Hooks enforce this workflow.

### 3. Ensuring Quality
**Before every commit:**
- ✅ Tests exist for all code
- ✅ Tests have real assertions (not empty/fake)
- ✅ All tests pass
- ✅ Code is formatted
- ✅ UI components have integration site files

**Hooks will block commits that fail these checks.**

---

## Mandatory Workflows

### Task Start Workflow

**When human starts a task:**

```bash
# Human runs:
npm run task:start TASK-005

# You must:
1. Read .claude/plans/*/tasks/TASK-005.json
2. Understand requirements completely
3. Read all files mentioned in task
4. Plan your implementation
5. Ask human for clarification if needed
```

**Example task file:**
```json
{
  "id": "TASK-005",
  "title": "Create user authentication component",
  "description": "Build login form with email/password validation",
  "phase": "implementation",
  "estimatedHours": 3,
  "dependencies": ["TASK-004"],
  "files": [
    "Agent/src/components/LoginForm.jsx",
    "Agent/tests/components/LoginForm.test.jsx"
  ],
  "completionCriteria": [
    "LoginForm component renders correctly",
    "Email and password validation works",
    "Tests cover all validation scenarios",
    "Component added to test-site"
  ]
}
```

**Your response:**
```
I'll create the user authentication component for TASK-005.

Let me start by reading the task requirements and related files:
[reads task file]
[reads related files]

I'll implement:
1. LoginForm.jsx with email/password fields
2. Form validation for both fields
3. Tests covering all validation scenarios
4. Integration site preview

Starting implementation...
```

### Development Workflow

**CRITICAL: Work ONLY in allowed directories:**

```
✅ Agent/src/        - Your source code
✅ Agent/tests/      - Your tests
✅ Agent/db/         - Database scripts (write only, human executes)
✅ scripts/          - Build/deployment scripts
❌ .claude/          - BLOCKED (framework files)
❌ node_modules/     - BLOCKED (dependencies)
❌ Root files        - BLOCKED (package.json, etc.)
```

**Write code following this sequence:**

```javascript
// 1. Create component
// Agent/src/components/LoginForm.jsx
import React, { useState } from 'react';

export default function LoginForm({ onSubmit }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!email.includes('@')) {
      newErrors.email = 'Invalid email';
    }
    if (password.length < 8) {
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
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      {errors.email && <span>{errors.email}</span>}

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      {errors.password && <span>{errors.password}</span>}

      <button type="submit">Login</button>
    </form>
  );
}
```

```javascript
// 2. Create test with REAL assertions
// Agent/tests/components/LoginForm.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginForm from '../../src/components/LoginForm';

describe('LoginForm', () => {
  test('renders email and password fields', () => {
    render(<LoginForm onSubmit={jest.fn()} />);
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  test('validates email format', () => {
    render(<LoginForm onSubmit={jest.fn()} />);
    const emailInput = screen.getByPlaceholderText('Email');

    fireEvent.change(emailInput, { target: { value: 'invalid' } });
    fireEvent.click(screen.getByText('Login'));

    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  test('validates password length', () => {
    render(<LoginForm onSubmit={jest.fn()} />);
    const passwordInput = screen.getByPlaceholderText('Password');

    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.click(screen.getByText('Login'));

    expect(screen.getByText('Password must be 8+ characters')).toBeInTheDocument();
  });

  test('calls onSubmit with valid data', () => {
    const mockSubmit = jest.fn();
    render(<LoginForm onSubmit={mockSubmit} />);

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByText('Login'));

    expect(mockSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });
});
```

```javascript
// 3. Copy to test-site for preview
// test-site/src/components/LoginForm.jsx
// [Same as Agent/src/components/LoginForm.jsx]
```

### Testing Workflow

**Run tests before committing:**

```bash
npm test
```

**Expected output:**
```
PASS Agent/tests/components/LoginForm.test.jsx
  LoginForm
    ✓ renders email and password fields (25ms)
    ✓ validates email format (18ms)
    ✓ validates password length (15ms)
    ✓ calls onSubmit with valid data (20ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
```

**If tests fail, FIX THEM before committing.**

**Never:**
- ❌ Commit with failing tests
- ❌ Write empty test bodies
- ❌ Write tests without assertions
- ❌ Skip tests "to fix later"

### Commit Workflow

**Stage your changes:**

```bash
git add Agent/src/components/LoginForm.jsx
git add Agent/tests/components/LoginForm.test.jsx
git add test-site/src/components/LoginForm.jsx
```

**Commit with task reference:**

```bash
git commit -m "[TASK-005] Create user authentication component

- Add LoginForm with email/password validation
- Validate email format and password length
- Add comprehensive tests (4 scenarios)
- Add to test-site for stakeholder preview
"
```

**Hooks validate automatically:**
```
📋 Testing changed files (3 files):
   - Agent/src/components/LoginForm.jsx
   - Agent/tests/components/LoginForm.test.jsx
   - test-site/src/components/LoginForm.jsx

✅ Tests passed (4/4)
✅ Real assertions found (expect calls: 6)
✅ No empty test bodies
✅ UI integration validated
✅ Code auto-formatted
✅ Commit allowed
```

**Push to remote:**

```bash
git push origin main
```

---

## File Access Rules

### Allowed Operations

| Directory | Read | Write | Execute |
|-----------|------|-------|---------|
| `Agent/src/` | ✅ | ✅ | ❌ |
| `Agent/tests/` | ✅ | ✅ | ❌ |
| `Agent/db/` | ✅ | ✅ (write scripts only) | ❌ |
| `scripts/` | ✅ | ✅ | ❌ |
| `test-site/` | ✅ | ✅ | ❌ |
| `.claude/plans/` | ✅ | ❌ | ❌ |
| `.claude/hooks/` | ✅ | ❌ | ❌ |
| `.claude/CLAUDE.md` | ✅ | ❌ | ❌ |
| `node_modules/` | ❌ | ❌ | ❌ |
| `package.json` | ✅ | ❌ | ❌ |

### Database Operations

**CRITICAL: Agents write scripts, humans execute them.**

```javascript
// ✅ CORRECT: Write migration script
// Agent/db/migrations/001-create-users-table.sql

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Human will execute:
-- psql database < Agent/db/migrations/001-create-users-table.sql
```

```bash
# ❌ WRONG: Agent tries to execute
psql database < Agent/db/migrations/001-create-users-table.sql
# This will be BLOCKED by hooks
```

**Why?** Database operations can be destructive. Humans must review and execute.

---

## Task Execution

### Reading Task Context

**Before writing ANY code:**

```bash
# 1. Read task file
cat .claude/plans/PLAN-001-REBRAND/tasks/TASK-012.json

# 2. Read related files mentioned in task
cat Agent/src/existing-file.js

# 3. Read relevant documentation
cat .claude/CLAUDE.md
```

**Never work from memory or assumptions.**

### Following Dependencies

**Check task dependencies:**

```json
{
  "id": "TASK-015",
  "dependencies": ["TASK-013", "TASK-014"]
}
```

**Hooks will WARN if:**
- You start TASK-015 before TASK-013 completes
- You skip tasks in sequence (TASK-010 → TASK-015)

**You must:**
- Wait for dependencies to complete
- Follow recommended sequence
- Ask human if unclear

### Tracking Progress

**After each commit, report progress:**

```
✅ Completed: LoginForm component
✅ Completed: LoginForm tests (4 scenarios)
✅ Completed: test-site integration

📊 TASK-005 Progress:
   - Component: ✅ Done
   - Tests: ✅ Done (4/4 passing)
   - Integration: ✅ Done
   - All completion criteria met: ✅

Ready for task:done when you confirm.
```

**Let human mark task complete.** Don't run `npm run task:done` yourself.

---

## Testing Requirements

### Test Quality Standards

**Every test must have:**

1. **Real assertions** (expect/assert calls)
2. **Meaningful test names**
3. **Actual implementation** (no empty bodies)
4. **Proper setup/teardown**

**Examples:**

```javascript
// ✅ GOOD: Real test with assertions
test('validates email format', () => {
  const result = validateEmail('invalid');
  expect(result).toBe(false);
  expect(result.error).toBe('Invalid email');
});

// ❌ BAD: Empty test (BLOCKED by hooks)
test('validates email format', () => {
  // TODO: implement later
});

// ❌ BAD: No assertions (BLOCKED by hooks)
test('validates email format', () => {
  validateEmail('invalid');
  // No expect() calls
});

// ❌ BAD: Trivial test (BLOCKED by hooks)
test('truth', () => {
  expect(true).toBe(true);
});
```

### Test Coverage Requirements

**Minimum coverage:**
- **Unit tests**: Every function/module
- **Component tests**: Every UI component
- **Integration tests**: Critical user flows

**Hooks validate:**
- ✅ Test files exist for changed code
- ✅ Tests have assertions
- ✅ Tests pass
- ⚠️ Coverage warnings if < 70%

### Smart Testing on Large Codebases

**Hooks automatically test ONLY changed files:**

```bash
# You modify 2 files
git add Agent/src/utils/validator.js
git add Agent/tests/utils/validator.test.js

# Hooks detect changes and run only those tests
git commit -m "[TASK-020] Add email validator"

# Output:
📋 Testing changed files (2 files):
   - Agent/src/utils/validator.js
   - Agent/tests/utils/validator.test.js

✅ Tests passed (3/3) in 0.5s
```

**Benefits:**
- Fast commits on 43,000+ line codebases
- No infinite loops
- Full test suite still available via `npm test`

---

## UI Development

### Three-File Pattern (Mandatory)

**For EVERY UI component, create:**

1. **Component** in `Agent/src/components/`
2. **Test** in `Agent/tests/components/`
3. **Integration** in `test-site/src/components/`

**Hooks will BLOCK commits missing any file.**

### Component Requirements

```jsx
// ✅ GOOD: Complete component
import React from 'react';
import PropTypes from 'prop-types';

function Button({ label, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid="button"
    >
      {label}
    </button>
  );
}

Button.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

Button.defaultProps = {
  disabled: false,
};

export default Button;
```

**Must include:**
- ✅ PropTypes validation
- ✅ data-testid for testing
- ✅ Default props (if applicable)
- ✅ Proper exports

### Component Test Requirements

```jsx
// ✅ GOOD: Complete component test
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from '../../src/components/Button';

describe('Button Component', () => {
  test('renders with label', () => {
    render(<Button label="Click me" onClick={jest.fn()} />);
    expect(screen.getByTestId('button')).toHaveTextContent('Click me');
  });

  test('calls onClick when clicked', () => {
    const mockClick = jest.fn();
    render(<Button label="Click" onClick={mockClick} />);

    fireEvent.click(screen.getByTestId('button'));

    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  test('is disabled when disabled prop is true', () => {
    render(<Button label="Click" onClick={jest.fn()} disabled={true} />);
    expect(screen.getByTestId('button')).toBeDisabled();
  });
});
```

**Must test:**
- ✅ Component renders
- ✅ Props are used correctly
- ✅ User interactions work
- ✅ Edge cases handled
- ✅ State changes (if stateful)

### Integration Site Requirements

**Purpose:** Stakeholder preview with hot-reload

```jsx
// test-site/src/App.jsx
import Button from './components/Button';

function App() {
  return (
    <div>
      <h1>Component Preview</h1>

      <h2>Button Component</h2>
      <Button
        label="Primary Button"
        onClick={() => alert('Clicked!')}
      />
      <Button
        label="Disabled Button"
        onClick={() => {}}
        disabled={true}
      />
    </div>
  );
}

export default App;
```

**Human can run:**
```bash
cd test-site
npm run dev
# Opens http://localhost:5173
```

---

## Git & Commits

### Commit Message Format

**Required format:**

```
[TASK-XXX] Brief description

Detailed explanation:
- What changed
- Why it changed
- How it works

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

**Examples:**

```bash
# ✅ GOOD
git commit -m "[TASK-012] Add email validation to registration form

- Add validateEmail utility function
- Validate on blur and submit
- Show inline error messages
- Add 5 test cases covering edge cases

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# ❌ BAD: No task reference
git commit -m "fix stuff"

# ❌ BAD: Too vague
git commit -m "[TASK-012] updates"
```

### Commit Frequency

**Commit often:**
- After completing each component
- After tests pass
- Before switching contexts

**Don't:**
- Wait until entire task done
- Batch multiple features
- Commit broken code

### Branch Strategy

**Default: Main branch only**

```bash
# Work directly on main
git checkout main
# ... make changes ...
git commit -m "[TASK-XXX] Description"
git push origin main
```

**If human requests branches:**

```bash
# Create task branch
git checkout -b task-012-email-validation
# ... work ...
git commit -m "[TASK-012] Description"
git push origin task-012-email-validation
```

---

## What Agents Cannot Do

### Hard Blocks (Hooks prevent these)

**1. Modify framework files**
```bash
# ❌ BLOCKED
vim .claude/hooks/validate-test.js
vim .claude/CLAUDE.md
vim package.json
```

**2. Execute database commands**
```bash
# ❌ BLOCKED
psql -c "DROP TABLE users"
mongosh --eval "db.users.drop()"
```

**3. Commit without tests**
```bash
# ❌ BLOCKED (hooks validate)
git add Agent/src/feature.js
git commit -m "New feature"
# Hook error: No test file found
```

**4. Commit failing tests**
```bash
# ❌ BLOCKED (hooks run tests)
npm test  # FAIL: 2 tests failing
git commit -m "WIP"
# Hook error: Tests must pass
```

**5. Skip task workflow**
```bash
# ❌ BLOCKED
# Cannot write code without active task
vim Agent/src/random-code.js
git commit -m "Random changes"
# Hook warns: No active task
```

### Soft Warnings (Allowed but warned)

**1. Skipping task sequence**
```bash
npm run task:start TASK-020
# ⚠️  Warning: TASK-015-019 are pending
# Continue anyway? (5 second delay)
```

**2. console.log in tests**
```javascript
test('something', () => {
  console.log('debug'); // ⚠️  Warning: Remove debug statements
  expect(true).toBe(true);
});
```

**3. Low test coverage**
```bash
npm test -- --coverage
# ⚠️  Warning: Coverage only 65% (target: 70%)
```

---

## Hook Interaction

### Hook Types

**1. PreToolUse Hooks** (Before you act)
- `validate-git-workflow.js` - Checks git status
- `enforce-plan-template.js` - Validates active plan

**2. PostToolUse Hooks** (After you act)
- `auto-format.js` - Formats code automatically
- `validate-test-quality.js` - Checks test quality
- `validate-test-results.js` - Runs and validates tests
- `validate-ui-integration.js` - Checks 3-file pattern

### Hook Behavior

**Hooks run automatically on:**
- File writes (Edit/Write tools)
- Git commits (Bash tool with git commit)
- Test runs (npm test command)

**Hook responses:**

```bash
# ✅ Success (exit 0)
# Your action proceeds

# ⚠️  Warning (exit 0, but message shown)
# Your action proceeds with warning

# ❌ Block (exit 2)
# Your action is rejected
# Fix issue and retry
```

### Responding to Hook Blocks

**Example block:**

```
❌ TEST QUALITY CHECK FAILED

File: LoginForm.test.jsx

  BLOCKED: Test file contains test cases but NO assertions
  Every test must have at least one expect() or assert()

Fix these issues before proceeding.
```

**Your response:**

```
The hooks blocked my commit because LoginForm.test.jsx has no assertions.

Let me fix the test file by adding proper expect() calls:

[fixes test file]

Now retrying the commit...

[git commit succeeds]

✅ Tests now pass with real assertions.
```

**Never:**
- Try to bypass hooks (--no-verify)
- Ignore hook warnings repeatedly
- Modify hook files to disable checks

---

## Error Handling

### Common Errors

**1. "No active plan found"**

```bash
# Error when trying to start task
npm run task:start TASK-001
# ❌ Error: No active plan found

# Fix:
echo "plan-001-generated" > .claude/ACTIVE-PLAN
npm run task:start TASK-001
```

**2. "Task has unmet dependencies"**

```bash
# Error when dependencies not complete
npm run task:start TASK-015
# ❌ Error: TASK-013, TASK-014 must be completed first

# Fix: Complete dependencies first or ask human
```

**3. "Tests failed"**

```bash
# Hook blocks commit
git commit -m "[TASK-005] Feature"
# ❌ BLOCKED: Tests are FAILING
# All tests must pass before committing

# Fix: Debug and fix failing tests
npm test
# [fix issues]
npm test  # All pass
git commit -m "[TASK-005] Feature"
```

**4. "File not found"**

```bash
# You try to read non-existent file
cat Agent/src/missing-file.js
# Error: No such file

# Fix: Verify file path, check task requirements
```

### Recovery Strategies

**When blocked by hooks:**

1. **Read error message carefully**
2. **Fix the specific issue**
3. **Retry the operation**
4. **Ask human if unclear**

**When unsure about requirements:**

1. **Re-read task file**
2. **Check related files**
3. **Review documentation**
4. **Ask human for clarification**

**When tests fail:**

1. **Run tests locally**: `npm test`
2. **Read failure messages**
3. **Fix code or tests**
4. **Re-run until green**
5. **Never commit red tests**

---

## Summary: Agent Quick Reference

### DO:
✅ Read task file before starting
✅ Write code in Agent/ directory only
✅ Write tests with real assertions
✅ Run tests before committing
✅ Commit with [TASK-XXX] reference
✅ Follow 3-file pattern for UI
✅ Ask human when unclear
✅ Report progress clearly

### DON'T:
❌ Modify .claude/ files
❌ Work without active task
❌ Commit failing tests
❌ Write empty/fake tests
❌ Execute database commands
❌ Skip task dependencies
❌ Work from memory
❌ Bypass git hooks

### Remember:
- **Quality over speed** - hooks enforce this
- **Test everything** - no exceptions
- **Communicate clearly** - humans review your work
- **Follow the plan** - it exists for a reason

---

**Copyright 2024-2025 Agentic15**
Licensed under the Apache License, Version 2.0
