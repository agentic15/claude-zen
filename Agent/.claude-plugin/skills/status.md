---
name: agentic15:status
description: Show current project and task status
---

# agentic15:status

Display the current status of your project, plan, and tasks.

## Usage

```
/agentic15:status
```

## What it shows

**Plan Information:**
- Plan ID and name
- Total number of tasks
- Completed vs pending tasks

**Current Task (if any):**
- Task ID and title
- Current status (in_progress)
- Changed files in working directory

**Progress Overview:**
- Completion percentage
- Tasks remaining
- Next suggested action

## Example Output

```
📊 Task Status

   Plan: plan-002-plugin
   Progress: 5/10 completed (5 pending)

   🔄 Currently working on: TASK-006
   📌 Implement agentic15:commit skill

   📝 Changed files:
      - plugin/skills/commit.js
      - plugin/tests/commit.test.js
```

## When to Use

Check status anytime during development:
- Before starting work each day
- To see which task you're on
- To check overall progress
- To see what files you've modified

## Error Handling

- **No active plan**: Create a plan first with `/agentic15:plan`
- **Task tracker not found**: Lock the plan first

## Next Steps

The status command suggests what to do next:
- If no task in progress: Start one with `/agentic15:task-next`
- If task in progress: Continue working or commit when done
