---
name: agentic15:commit
description: Commit completed task and create pull request
---

# agentic15:commit

Commit your completed task and create a pull request.

## Usage

```
/agentic15:commit
```

## What it does

1. Marks the current task as completed in the task tracker
2. Stages all changes (including updated TASK-TRACKER.json)
3. Creates a commit with a descriptive message
4. Pushes the feature branch to remote
5. Creates a pull request on GitHub/Azure DevOps
6. Updates the GitHub issue (if one exists)
7. Shows the PR URL

## Error Handling

- **No active task**: Start a task first with `/agentic15:task-next`
- **Uncommitted changes on main**: You can't commit directly to main branch
- **No active plan**: Create a plan first
- **Task tracker not found**: Lock the plan first

## Commit Message Format

```
[TASK-XXX] Task Title

- Changes made
- Features added
- Issues fixed

🤖 Generated with Claude Code
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

## Next Steps

After committing:
1. Review the PR on GitHub/Azure DevOps
2. Merge the PR when ready
3. Run `/agentic15:sync` to sync with main
4. Start the next task with `/agentic15:task-next`
