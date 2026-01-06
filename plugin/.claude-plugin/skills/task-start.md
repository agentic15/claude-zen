---
name: agentic15:task-start
description: Start a specific task by ID
---

# agentic15:task-start

Start a specific task by its ID (e.g., TASK-003) instead of starting the next pending task.

## Usage

```
/agentic15:task-start TASK-003
```

## What it does

1. Validates the task ID format (must be TASK-XXX)
2. Checks that the task exists and is not completed
3. Switches to main branch and pulls latest changes
4. Creates a feature branch: `feature/task-XXX`
5. Marks the task as `in_progress`
6. Creates a GitHub issue (if auto-create is enabled)
7. Shows task details and next steps

## Task ID Format

- Must be uppercase: `TASK-` prefix
- Must have exactly 3 digits: `001`, `002`, etc.
- Examples: `TASK-001`, `TASK-042`, `TASK-999`

## Error Handling

- **No task ID provided**: You must specify which task to start
- **Invalid task ID format**: Must match `TASK-XXX` format (uppercase, 3 digits)
- **Task not found**: The specified task doesn't exist in the tracker
- **Task already completed**: This task has already been finished
- **Another task in progress**: Complete the current task first

## Next Steps

After starting: Tell Claude "Write code for this task"

When done: `/agentic15:commit`
