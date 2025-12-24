# Quick Start Guide

Get up and running with Agentic15 Claude Zen in 5 minutes.

## 1. Create a New Project

```bash
npx create-agentic15-claude-zen my-todo-app
cd my-todo-app
```

**What this does:**
- Creates project directory
- Copies framework templates
- Sets up git repository
- Installs dependencies
- Configures git hooks

## 2. Generate a Project Plan

```bash
npm run plan:generate "Build a todo app with React - add, complete, delete tasks"
```

**What happens:**
- Creates `.claude/plans/plan-001-generated/PROJECT-REQUIREMENTS.txt`
- Claude Code reads requirements
- Creates `PROJECT-PLAN.json` with structured tasks

**Example PROJECT-PLAN.json:**
```json
{
  "metadata": {
    "planId": "plan-001-generated",
    "title": "Todo App with React",
    "created": "2025-12-24T18:00:00Z"
  },
  "tasks": [
    {
      "id": "TASK-001",
      "title": "Create TodoItem component",
      "phase": "implementation",
      "estimatedHours": 2
    },
    {
      "id": "TASK-002",
      "title": "Create TodoList component",
      "phase": "implementation",
      "estimatedHours": 3,
      "dependencies": ["TASK-001"]
    }
  ]
}
```

## 3. Activate the Plan

```bash
echo "plan-001-generated" > .claude/ACTIVE-PLAN
```

**Critical step:** This tells the framework which plan is active.

## 4. Lock the Plan

```bash
npm run plan:init
```

**What this creates:**
- `TASK-TRACKER.json` - Tracks task progress
- `tasks/TASK-001.json` - Individual task files
- `.plan-locked` - Makes plan immutable

**TASK-TRACKER.json example:**
```json
{
  "planId": "plan-001-generated",
  "tasks": {
    "TASK-001": {
      "status": "pending",
      "startedAt": null,
      "completedAt": null
    }
  }
}
```

## 5. Start Your First Task

```bash
npm run task:start TASK-001
```

**Output:**
```
✅ TASK-001 is now in progress

📋 Task Details:
   ID: TASK-001
   Title: Create TodoItem component
   Phase: implementation
   Estimated: 2 hours

📝 Requirements:
   - Create TodoItem component in Agent/src/components/
   - Write tests in Agent/tests/components/
   - Add to test-site for preview

⚠️  Remember: All commits must reference [TASK-001]
```

## 6. Write Your Code

Claude Code (or you) now writes the code:

**Agent/src/components/TodoItem.jsx:**
```jsx
import React from 'react';
import PropTypes from 'prop-types';

function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <div className="todo-item">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      <span className={todo.completed ? 'completed' : ''}>
        {todo.text}
      </span>
      <button onClick={() => onDelete(todo.id)}>Delete</button>
    </div>
  );
}

TodoItem.propTypes = {
  todo: PropTypes.shape({
    id: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
    completed: PropTypes.bool.isRequired,
  }).isRequired,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default TodoItem;
```

**Agent/tests/components/TodoItem.test.jsx:**
```jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodoItem from '../../src/components/TodoItem';

describe('TodoItem Component', () => {
  const mockTodo = {
    id: 1,
    text: 'Test todo',
    completed: false,
  };

  test('renders todo text', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    expect(screen.getByText('Test todo')).toBeInTheDocument();
  });

  test('calls onToggle when checkbox clicked', () => {
    const mockToggle = jest.fn();
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockToggle}
        onDelete={jest.fn()}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(mockToggle).toHaveBeenCalledWith(1);
  });
});
```

**test-site/src/components/TodoItem.jsx:**
```jsx
// Copy from Agent/src/components/TodoItem.jsx for preview
```

## 7. Run Tests

```bash
npm test
```

**Expected output:**
```
PASS  Agent/tests/components/TodoItem.test.jsx
  TodoItem Component
    ✓ renders todo text (25 ms)
    ✓ calls onToggle when checkbox clicked (18 ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
```

**Hooks validate:**
- ✅ Tests exist
- ✅ Tests have real assertions
- ✅ Tests pass
- ✅ Component exists in test-site

## 8. Commit Your Work

```bash
git add .
git commit -m "[TASK-001] Create TodoItem component with tests"
```

**Hooks run automatically:**
```
📋 Testing only changed files (3 files):
   - Agent/src/components/TodoItem.jsx
   - Agent/tests/components/TodoItem.test.jsx
   - test-site/src/components/TodoItem.jsx

💡 TIP: Run "npm test" manually to run full test suite

✅ All tests passed
✅ Code formatted
✅ UI integration validated
✅ Commit allowed
```

## 9. Complete the Task

```bash
npm run task:done TASK-001
```

**Output:**
```
✅ TASK-001 marked as completed

📊 Progress:
   Total tasks: 5
   Completed: 1
   In progress: 0
   Pending: 4

🎯 Next task: TASK-002 (Create TodoList component)

Run: npm run task:start TASK-002
```

## 10. Continue with Next Tasks

```bash
npm run task:start TASK-002
# ... write code ...
npm test
git commit -m "[TASK-002] Create TodoList component"
npm run task:done TASK-002
```

## Complete Workflow Summary

```bash
# 1. Create project
npx create-agentic15-claude-zen my-app
cd my-app

# 2. Plan
npm run plan:generate "description"
echo "plan-001-generated" > .claude/ACTIVE-PLAN
npm run plan:init

# 3. Work loop (repeat for each task)
npm run task:start TASK-XXX
# ... write code in Agent/ ...
npm test
git commit -m "[TASK-XXX] Description"
npm run task:done TASK-XXX

# 4. Deploy
npm run build
npm run deploy
```

## What Makes This Different?

### Traditional Development:
```bash
# Write code anywhere
vim src/component.js

# Maybe write tests
vim test/component.test.js

# Commit without validation
git commit -m "stuff"

# Tests fail in CI
# 😱 Production broken
```

### With Agentic15 Claude Zen:
```bash
# Write code in Agent/ (enforced)
vim Agent/src/component.js

# Write tests (REQUIRED by hooks)
vim Agent/tests/component.test.js

# Tests run before commit (AUTOMATIC)
git commit -m "[TASK-001] Feature"
# ✅ Tests passed
# ✅ Code formatted
# ✅ Quality validated

# Confidence in production
# ✅ Ship with confidence
```

## Key Concepts

### 1. Agent Directory
All source code goes in `Agent/` - hooks enforce this.

### 2. Task-Driven Development
Every code change must be part of a task.

### 3. Smart Testing
Git hooks test ONLY changed files (fast for large projects).

### 4. UI Component Pattern
Every UI component requires:
- Component file
- Test file
- Integration site file

### 5. Quality Gates
Hooks validate before allowing commits:
- Tests must exist
- Tests must pass
- Tests must have assertions
- Code must be formatted

## Common First-Time Questions

**Q: Can I skip the plan and just code?**
A: Yes, but you lose task tracking. The framework works without plans, but structured development is the main value.

**Q: What if I don't want to use React?**
A: Framework supports Vue, Angular, Svelte - just update `.babelrc` for your framework.

**Q: Can I disable hooks temporarily?**
A: Not recommended. Hooks ensure quality. If needed, edit `.claude/settings.json`.

**Q: What if tests are slow on my 43,000 line codebase?**
A: Hooks test ONLY changed files. Full suite runs with `npm test` manually.

**Q: Can I use this without Claude Code?**
A: Yes! It's valuable for any developer. Claude Code just automates the work.

## Next Steps

Now that you've completed a quick start:

1. **Read the full User Workflow**: [User Workflow](../workflows/user-workflow.md)
2. **Understand Agent Workflow**: [Agent Workflow](../workflows/agent-workflow.md)
3. **Explore Architecture**: [Architecture Overview](../architecture/overview.md)
4. **See Example Projects**: [Examples](../../examples/)

## Getting Help

- **GitHub Issues**: https://github.com/agentic15/claude-zen/issues
- **Discussions**: https://github.com/agentic15/claude-zen/discussions
- **Email**: support@agentic15.com

---

**Copyright 2024-2025 Agentic15**
"Code with Intelligence, Ship with Confidence"
