---
name: agentic15:sync
description: Sync with main branch after PR merge
---

# agentic15:sync

Sync your local repository with the main branch after merging a pull request.

## Usage

```
/agentic15:sync
```

## What it does

1. Verifies you're on a feature/plan/admin branch or main
2. Checks for uncommitted changes (blocks if found)
3. Verifies the PR has been merged (safety check)
4. Switches to the main branch
5. Pulls the latest changes from remote
6. Deletes the feature/plan/admin branch locally
7. Shows next steps

## When to Use

Run this command after:
- Merging a PR on GitHub/Azure DevOps
- Completing a task
- Before starting the next task

## Error Handling

- **Uncommitted changes detected**: Commit or stash your changes first
- **Invalid branch**: This command works on feature/plan/admin branches
- **PR not merged**: Merge the PR before syncing to prevent data loss
- **Not a git repository**: Run this in a git repository

## Safety Features

The sync command includes critical safety checks:
- Blocks if PR is still open (prevents losing work)
- Blocks if branch has unpushed commits
- Warns if PR was closed without merging

## Next Steps

After syncing: `/agentic15:task-next` to start the next task
