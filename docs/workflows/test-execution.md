# Test Execution Guide

**Complete guide to testing strategies, smart testing, and quality enforcement in Agentic15 Claude Zen**

This guide covers testing philosophies, smart testing for large codebases, and hook-enforced quality standards.

---

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Test Types](#test-types)
3. [Smart Testing](#smart-testing)
4. [Writing Quality Tests](#writing-quality-tests)
5. [Running Tests](#running-tests)
6. [Test Coverage](#test-coverage)
7. [Hook Validation](#hook-validation)
8. [Troubleshooting](#troubleshooting)

---

## Testing Philosophy

### Why Testing Matters

**Tests provide:**
- ✅ Confidence in code correctness
- ✅ Safety net for refactoring
- ✅ Living documentation
- ✅ Early bug detection
- ✅ Design feedback

**In Agentic15 Claude Zen:**
- Tests are **mandatory** (hooks enforce)
- Quality is **validated** (no empty/fake tests)
- Execution is **smart** (only changed files on commit)
- Coverage is **tracked** (warnings at < 70%)

### Testing Pyramid

```
        E2E Tests
       /         \
      /           \
     / Integration \
    /     Tests     \
   /                 \
  /   Component Tests \
 /                     \
/      Unit Tests       \
─────────────────────────
   Most tests here
```

**Distribution:**
- **70%** Unit tests (fast, isolated, many)
- **20%** Component/Integration tests (moderate speed, realistic)
- **10%** E2E tests (slow, full system, critical paths only)

### Test-Driven Development (TDD)

**Recommended workflow:**

```
1. Write failing test (RED)
2. Write minimal code to pass (GREEN)
3. Refactor (REFACTOR)
4. Repeat
```

**Benefits:**
- Better design (testable from start)
- Higher coverage (tests written first)
- Fewer bugs (requirements clarified upfront)

**Not required, but encouraged.**

---

## Test Types

### 1. Unit Tests

**Purpose**: Test individual functions/modules in isolation

**Characteristics:**
- Fast (< 1ms each)
- No dependencies
- Pure logic testing
- High coverage target (90%+)

**Example:**

```javascript
// Agent/src/utils/formatDate.js
export function formatDate(isoString) {
  const date = new Date(isoString);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

// Agent/tests/utils/formatDate.test.js
import { formatDate } from '../../src/utils/formatDate';

describe('formatDate', () => {
  test('formats ISO date to MM/DD/YYYY', () => {
    expect(formatDate('2025-12-24')).toBe('12/24/2025');
  });

  test('handles single-digit months and days', () => {
    expect(formatDate('2025-01-05')).toBe('1/5/2025');
  });

  test('handles leap years', () => {
    expect(formatDate('2024-02-29')).toBe('2/29/2024');
  });

  test('throws error for invalid date', () => {
    expect(() => formatDate('invalid')).toThrow();
  });
});
```

### 2. Component Tests

**Purpose**: Test UI components with user interactions

**Characteristics:**
- Moderate speed (10-50ms each)
- Use testing-library
- Test from user perspective
- Mock external dependencies

**Example:**

```javascript
// Agent/src/components/Counter.jsx
import React, { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <span data-testid="count">{count}</span>
      <button onClick={() => setCount(count + 1)} data-testid="increment">
        +
      </button>
      <button onClick={() => setCount(count - 1)} data-testid="decrement">
        -
      </button>
    </div>
  );
}

// Agent/tests/components/Counter.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Counter from '../../src/components/Counter';

describe('Counter Component', () => {
  test('starts at zero', () => {
    render(<Counter />);
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  test('increments count', () => {
    render(<Counter />);

    fireEvent.click(screen.getByTestId('increment'));
    expect(screen.getByTestId('count')).toHaveTextContent('1');

    fireEvent.click(screen.getByTestId('increment'));
    expect(screen.getByTestId('count')).toHaveTextContent('2');
  });

  test('decrements count', () => {
    render(<Counter />);

    fireEvent.click(screen.getByTestId('decrement'));
    expect(screen.getByTestId('count')).toHaveTextContent('-1');
  });
});
```

### 3. Integration Tests

**Purpose**: Test multiple components/modules working together

**Characteristics:**
- Slower (100-500ms each)
- Test realistic scenarios
- May use real API calls (mocked network)
- Focus on critical paths

**Example:**

```javascript
// Agent/tests/integration/authentication.test.js
import request from 'supertest';
import app from '../../src/app';
import { setupTestDB, teardownTestDB } from '../helpers/database';

describe('Authentication Flow', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  test('complete registration and login flow', async () => {
    // Register new user
    const registerResponse = await request(app)
      .post('/api/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body).toHaveProperty('token');

    // Login with credentials
    const loginResponse = await request(app)
      .post('/api/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty('token');
    expect(loginResponse.body.user.email).toBe('test@example.com');
  });
});
```

### 4. E2E Tests (End-to-End)

**Purpose**: Test complete user journeys in real browser

**Characteristics:**
- Slowest (1-10s each)
- Use Playwright/Cypress
- Test critical user paths only
- Run less frequently

**Example:**

```javascript
// Agent/tests/e2e/task-management.spec.js
import { test, expect } from '@playwright/test';

test('create and complete task', async ({ page }) => {
  // Navigate to app
  await page.goto('http://localhost:3000');

  // Login
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'password123');
  await page.click('[data-testid="login-button"]');

  // Create new task
  await page.click('[data-testid="new-task"]');
  await page.fill('[data-testid="task-title"]', 'Buy groceries');
  await page.fill('[data-testid="task-description"]', 'Milk, eggs, bread');
  await page.click('[data-testid="save-task"]');

  // Verify task appears
  await expect(page.locator('text=Buy groceries')).toBeVisible();

  // Complete task
  await page.click('[data-testid="task-checkbox"]');

  // Verify completed
  await expect(page.locator('[data-testid="task-status"]')).toHaveText('Completed');
});
```

---

## Smart Testing

### The Problem: Large Codebases

**Scenario:**
- Project has 43,000 lines of code
- 500 test files
- Full test suite takes 45 seconds
- You changed 1 file

**Traditional approach:**
```bash
git commit -m "Fix typo"
# Runs ALL 500 tests (45 seconds)
# Wastes time on every commit
```

**Result**: Developers disable tests or commit without testing.

### The Solution: Smart Testing

**Agentic15 Claude Zen approach:**
```bash
git commit -m "Fix typo"
# Detects: Only 1 file changed
# Runs: Only tests for that file (0.5 seconds)
# Full suite still available: npm test
```

**Benefits:**
- ✅ Fast commits (< 5 seconds)
- ✅ No infinite loops
- ✅ No skipped testing
- ✅ Full suite on demand

### How Smart Testing Works

**1. Git hook detects staged files**

```javascript
// Hook: validate-test-results.js
function getChangedFiles() {
  const staged = execSync('git diff --cached --name-only')
    .toString()
    .split('\n')
    .filter(Boolean);
  return staged;
}
```

**2. Filters for code and test files**

```javascript
function getChangedTestFiles() {
  const changedFiles = getChangedFiles();

  // Direct test files
  const testFiles = changedFiles.filter(file =>
    file.match(/\.(test|spec)\.(js|jsx|ts|tsx)$/)
  );

  // Source files → find related tests
  const sourceFiles = changedFiles.filter(file =>
    file.match(/Agent\/src\/.*\.(js|jsx|ts|tsx)$/)
  );

  const relatedTests = sourceFiles.map(srcFile => {
    // Agent/src/components/Button.jsx → Agent/tests/components/Button.test.jsx
    return srcFile
      .replace('/src/', '/tests/')
      .replace(/\.(js|jsx|ts|tsx)$/, '.test$&');
  });

  return [...testFiles, ...relatedTests].filter(fs.existsSync);
}
```

**3. Runs only those tests**

```javascript
const changedTests = getChangedTestFiles();

if (changedTests.length > 0) {
  console.log(`Testing ${changedTests.length} changed files:`);
  changedTests.forEach(f => console.log(`  - ${f}`));

  // Run jest with specific files
  execSync(`npx jest ${changedTests.join(' ')}`);
} else {
  console.log('No test files changed - skipping');
}
```

### Example: Smart Testing in Action

**Scenario: You modify 2 files**

```bash
# Modified files
vim Agent/src/components/Button.jsx
vim Agent/tests/components/Button.test.jsx

# Stage changes
git add Agent/src/components/Button.jsx
git add Agent/tests/components/Button.test.jsx

# Commit
git commit -m "[TASK-012] Update button styles"
```

**Hook output:**

```
📋 Testing only changed files (2 files):
   - Agent/src/components/Button.jsx
   - Agent/tests/components/Button.test.jsx

Running tests...

PASS Agent/tests/components/Button.test.jsx
  Button Component
    ✓ renders with label (15 ms)
    ✓ calls onClick when clicked (12 ms)
    ✓ is disabled when disabled prop true (10 ms)

Tests:       3 passed, 3 total
Time:        0.456 s

✅ All changed tests passed

💡 TIP: Run "npm test" manually for full test suite

✅ Commit allowed
```

**Full suite comparison:**

```bash
# Smart testing (changed files only)
git commit → 0.5 seconds

# Full suite (all tests)
npm test → 45 seconds

# 90x faster! ⚡
```

### When Full Suite Still Runs

**Smart testing is for commits.**

**Full suite runs:**
- Manual `npm test` command
- CI/CD pipelines
- Before merging to main
- On demand for confidence

**Best practice:**
```bash
# During development: use smart testing
git commit -m "[TASK-XXX] Feature"
# Fast, validates changed code

# Before task:done: run full suite
npm test
# Ensure nothing broke elsewhere

# Pre-deployment: full suite + E2E
npm test && npm run test:e2e
# Maximum confidence
```

---

## Writing Quality Tests

### Test Quality Standards

**Hooks enforce:**
1. ✅ Tests must exist for code
2. ✅ Tests must have assertions
3. ✅ Tests must not be empty
4. ✅ Tests must pass
5. ⚠️ Tests should be meaningful (not trivial)

### Good vs Bad Tests

**❌ BAD: Empty test**
```javascript
test('validates email', () => {
  // TODO: implement
});

// Hook blocks: "Empty test body detected"
```

**❌ BAD: No assertions**
```javascript
test('validates email', () => {
  validateEmail('test@example.com');
  // No expect() call
});

// Hook blocks: "Test has no assertions"
```

**❌ BAD: Trivial test**
```javascript
test('truth', () => {
  expect(true).toBe(true);
});

// Hook blocks: "Trivial test detected"
```

**❌ BAD: Only tests mocks**
```javascript
test('calls API', () => {
  const mockApi = jest.fn();
  callApi(mockApi);
  expect(mockApi).toHaveBeenCalled();
  // Only verifies mock was called, not behavior
});

// Hook warns: "Tests only verify mocks"
```

**✅ GOOD: Real test with assertions**
```javascript
test('validates email format', () => {
  expect(validateEmail('test@example.com')).toBe(true);
  expect(validateEmail('invalid')).toBe(false);
  expect(validateEmail('')).toBe(false);
});

// Hook approves: Real validation of behavior
```

**✅ GOOD: Component test**
```javascript
test('shows error message on invalid input', () => {
  render(<LoginForm onSubmit={jest.fn()} />);

  fireEvent.change(screen.getByTestId('email'), {
    target: { value: 'invalid' },
  });
  fireEvent.click(screen.getByTestId('submit'));

  expect(screen.getByTestId('email-error')).toHaveTextContent('Invalid email');
});

// Hook approves: Tests real user interaction and outcome
```

### Test Structure (AAA Pattern)

```javascript
test('description', () => {
  // Arrange: Set up test data and conditions
  const input = 'test@example.com';
  const expected = true;

  // Act: Execute the code under test
  const result = validateEmail(input);

  // Assert: Verify the outcome
  expect(result).toBe(expected);
});
```

### Test Naming

**❌ BAD: Vague names**
```javascript
test('works', () => { ... });
test('test1', () => { ... });
test('button', () => { ... });
```

**✅ GOOD: Descriptive names**
```javascript
test('validates email format correctly', () => { ... });
test('shows error message when password too short', () => { ... });
test('increments counter when plus button clicked', () => { ... });
```

**Format:**
```
test('[what] [under what condition] [expected result]', () => {})
```

Examples:
- `'validates email when valid format provided'`
- `'throws error when input is null'`
- `'renders loading spinner when data is fetching'`

---

## Running Tests

### Run All Tests

```bash
npm test
```

**Output:**
```
PASS Agent/tests/utils/validation.test.js
PASS Agent/tests/components/Button.test.jsx
PASS Agent/tests/components/LoginForm.test.jsx
PASS Agent/tests/api/auth.test.js

Test Suites: 15 passed, 15 total
Tests:       87 passed, 87 total
Snapshots:   0 total
Time:        3.245 s
```

### Run Specific Test File

```bash
npm test Button.test.jsx
```

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

**Watches for file changes and re-runs tests automatically.**

### Run Tests with Coverage

```bash
npm test -- --coverage
```

**Output:**
```
--------------------|---------|----------|---------|---------|-------------------
File                | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
--------------------|---------|----------|---------|---------|-------------------
All files           |   85.32 |    78.45 |   82.14 |   85.98 |
 components/        |   92.15 |    87.50 |   90.00 |   92.68 |
  Button.jsx        |  100.00 |   100.00 |  100.00 |  100.00 |
  LoginForm.jsx     |   95.45 |    90.00 |   92.31 |   96.15 | 45-47
  TaskList.jsx      |   88.24 |    80.00 |   85.71 |   89.47 | 78,92,105
 utils/             |   78.95 |    68.42 |   75.00 |   80.00 |
  validation.js     |   85.00 |    75.00 |   80.00 |   87.50 | 23,45
  formatDate.js     |  100.00 |   100.00 |  100.00 |  100.00 |
--------------------|---------|----------|---------|---------|-------------------
```

### Run Only Failed Tests

```bash
npm test -- --onlyFailures
```

### Run Tests by Pattern

```bash
# Run all component tests
npm test -- components/

# Run all auth-related tests
npm test -- auth

# Run specific describe block
npm test -- -t "validates email"
```

---

## Test Coverage

### Coverage Metrics

**Four dimensions:**
1. **Statements**: % of code statements executed
2. **Branches**: % of if/else branches taken
3. **Functions**: % of functions called
4. **Lines**: % of lines executed

**Targets:**
- **Unit tests**: 90%+ coverage
- **Component tests**: 80%+ coverage
- **Integration tests**: Critical paths covered
- **Overall project**: 70%+ coverage

### Interpreting Coverage

**✅ High coverage (90%+)**
```
Most code paths tested
Low risk of bugs
Safe to refactor
```

**⚠️ Medium coverage (70-90%)**
```
Core logic tested
Some edge cases may be missing
Review untested code
```

**❌ Low coverage (< 70%)**
```
Many code paths untested
High risk of bugs
Difficult to refactor safely
```

### Coverage Gaps

**Example coverage report:**
```javascript
// Agent/src/utils/validation.js
export function validatePassword(password) {
  if (!password) {                    // ✅ Covered
    return false;
  }

  if (password.length < 8) {          // ✅ Covered
    return false;
  }

  if (!/[A-Z]/.test(password)) {      // ❌ NOT covered
    return false;
  }

  if (!/[0-9]/.test(password)) {      // ❌ NOT covered
    return false;
  }

  return true;                        // ✅ Covered
}
```

**Add tests for gaps:**
```javascript
test('requires uppercase letter', () => {
  expect(validatePassword('password123')).toBe(false);
  expect(validatePassword('Password123')).toBe(true);
});

test('requires number', () => {
  expect(validatePassword('Password')).toBe(false);
  expect(validatePassword('Password1')).toBe(true);
});
```

---

## Hook Validation

### Pre-Commit Hook Validation

**Hooks run automatically on `git commit`:**

```
1. validate-test-quality.js
   ✓ Tests exist
   ✓ Tests have assertions
   ✓ No empty tests

2. validate-test-results.js
   ✓ Runs changed tests
   ✓ All tests pass
   ✓ No skipped tests

3. validate-ui-integration.js (UI only)
   ✓ Component tests exist
   ✓ Test-site files exist
```

### What Hooks Check

**Test Quality:**
```javascript
// Validates:
✓ File matches /\.(test|spec)\.(js|jsx|ts|tsx)$/
✓ Contains test() or it() calls
✓ Contains expect() or assert() calls
✓ No empty test bodies: test('...', () => {})
✓ No trivial tests: expect(true).toBe(true)
✓ Proper test structure
```

**Test Results:**
```javascript
// Validates:
✓ Jest/testing framework detected in output
✓ "X passed" appears in output
✓ No "X failed" in output
✓ No "0 tests" warnings
✓ Tests ran (not skipped)
✓ Execution time reasonable (not suspiciously fast)
```

**UI Integration:**
```javascript
// For UI component files, validates:
✓ Component exists in Agent/src/components/
✓ Test exists in Agent/tests/components/
✓ Integration exists in test-site/src/components/
✓ All three files present (3-file pattern)
```

### Hook Responses

**✅ Success (exit 0):**
```
✅ Tests passed (12/12)
✅ Real assertions found (25 expect calls)
✅ No empty tests
✅ Commit allowed
```

**⚠️ Warning (exit 0, shows message):**
```
⚠️  WARNING: Test coverage only 68%
⚠️  Consider adding more tests

Commit allowed, but review test coverage
```

**❌ Block (exit 2):**
```
❌ TEST QUALITY CHECK FAILED

File: LoginForm.test.jsx

  BLOCKED: Test file has no assertions
  Every test must have expect() or assert()

Fix this issue before committing.
```

### Bypassing Hooks (Not Recommended)

**Emergency only:**
```bash
git commit --no-verify -m "Emergency hotfix"
```

**Why not recommended:**
- Defeats purpose of framework
- Introduces untested code
- Breaks quality guarantees
- "Ship with Confidence" becomes "Ship and Hope"

**Better approach:**
```bash
# Fix the actual issue
vim Agent/tests/component.test.jsx

# Commit properly
git commit -m "[HOTFIX] Fix critical bug"
```

---

## Troubleshooting

### "Tests are failing"

**Problem**: Hook blocks commit

**Solution**:
```bash
# Run tests to see failures
npm test

# Fix the failures
# ... debug and fix ...

# Verify fix
npm test

# Commit again
git commit -m "[TASK-XXX] Fix"
```

### "No assertions found"

**Problem**: Test has no expect() calls

**Solution**:
```javascript
// ❌ Before
test('validates email', () => {
  validateEmail('test@example.com');
});

// ✅ After
test('validates email', () => {
  expect(validateEmail('test@example.com')).toBe(true);
});
```

### "Empty test body"

**Problem**: Test function is empty

**Solution**:
```javascript
// ❌ Before
test('validates email', () => {
  // TODO
});

// ✅ After
test('validates email', () => {
  expect(validateEmail('test@example.com')).toBe(true);
  expect(validateEmail('invalid')).toBe(false);
});
```

### "Tests too slow"

**Problem**: Full suite takes too long

**Remember**: Smart testing runs only changed files on commit!

```bash
# During commit (fast - changed files only)
git commit → 2 seconds

# Manual full suite (when needed)
npm test → 45 seconds
```

**If still slow:**
```bash
# Parallelize tests
npm test -- --maxWorkers=4

# Run only unit tests (faster)
npm test -- --testPathPattern=unit

# Skip slow E2E tests during development
npm test -- --testPathIgnorePatterns=e2e
```

### "Test file not found"

**Problem**: Test file doesn't exist for source file

**Solution**:
```bash
# Create test file
touch Agent/tests/components/NewComponent.test.jsx

# Write tests
vim Agent/tests/components/NewComponent.test.jsx

# Commit both
git add Agent/src/components/NewComponent.jsx
git add Agent/tests/components/NewComponent.test.jsx
git commit -m "[TASK-XXX] Add NewComponent with tests"
```

---

## Summary

**Testing in Agentic15 Claude Zen:**

**Philosophy:**
- Tests mandatory (hooks enforce)
- Quality validated (no fake tests)
- Smart execution (changed files only)
- Coverage tracked (70%+ target)

**Test Types:**
- Unit tests (70% - fast, isolated)
- Component tests (20% - user interactions)
- Integration tests (8% - realistic scenarios)
- E2E tests (2% - critical paths only)

**Smart Testing:**
- Commits test only changed files (< 5s)
- Full suite available on demand (npm test)
- No infinite loops
- Scales to 43,000+ line codebases

**Quality Enforcement:**
- Tests must exist
- Tests must have assertions
- Tests must pass
- Tests must be meaningful
- Hooks block bad tests

**Commands:**
- `npm test` - Run all tests
- `npm test -- --watch` - Watch mode
- `npm test -- --coverage` - Coverage report
- `git commit` - Smart testing (changed files only)

**Remember:**
- Write tests first (TDD)
- Test behavior, not implementation
- Use AAA pattern (Arrange, Act, Assert)
- Descriptive test names
- Run full suite before task:done

---

**Copyright 2024-2025 Agentic15**
Licensed under the Apache License, Version 2.0
