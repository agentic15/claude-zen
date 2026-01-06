---
name: agentic15:task-next
description: Start the next pending task in the active plan
---

# agentic15:task-next

Automatically start the next pending task in your active plan.

## Usage

```
/agentic15:task-next
```

## What it does

1. Finds the next pending task in the task tracker
2. Switches to main branch and pulls latest changes
3. Creates a feature branch: `feature/task-XXX`
4. Marks the task as `in_progress`
5. Creates a GitHub issue (if auto-create is enabled)
6. Shows task details and next steps

## Error Handling

- **No active plan**: You must create and lock a plan first
- **Task tracker not found**: The plan hasn't been locked yet
- **No pending tasks**: All tasks are completed! 🎉
- **Task already in progress**: Complete the current task before starting a new one

## Next Steps

After starting: Tell Claude "Write code for this task"

When done: `/agentic15:commit`
