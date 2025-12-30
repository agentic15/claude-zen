# Command Permissions

This document describes the command permission system used in Agentic15 Claude Zen to control what operations Claude can perform.

## Permission Levels

The framework uses three permission levels:

1. **allow** - Commands that can be executed without user approval
2. **ask** - Commands that require user confirmation before execution
3. **deny** - Commands that are completely blocked

## Git Command Permissions

### Allowed (Read-Only) Commands

These git commands are **allowed** because they only read information and don't modify the repository:

- `git status` - View working tree status
- `git branch` - List and view branches (including `--show-current`)
- `git log` - View commit history
- `git diff` - View changes between commits, branches, or files
- `git remote get-url` - Get the URL of a remote repository
- `git rev-parse` - Parse git revisions and references
- `git describe` - Describe commits using tags

### Blocked (Write/Destructive) Commands

These git commands are **denied** because they modify the repository or can cause data loss:

**Write Operations:**
- `git commit` - Create commits (managed by user via `npx agentic15 commit`)
- `git push` - Push to remote (managed by user via workflow commands)
- `git checkout` - Switch branches (managed by user manually)
- `git merge` - Merge branches (managed by user via PR workflow)
- `git stash` - Stash changes
- `git tag` - Create/modify tags

**Destructive Operations:**
- `git reset` - Reset commits (can lose work)
- `git rebase` - Rebase commits (can rewrite history)
- `git cherry-pick` - Cherry-pick commits (can cause conflicts)

**Configuration:**
- `git config` - Modify git configuration
- `git init` - Initialize new repository
- `git clone` - Clone repository

**Remote Operations:**
- `git pull` - Pull from remote (can cause merge conflicts)
- `git fetch` - Fetch from remote

## Other Blocked Commands

### Framework Commands
- `npx agentic15` - All Agentic15 commands (user manages workflow)
- `gh` - GitHub CLI commands (user manages PRs/issues)

### Package Management
- `npm install` - Install dependencies (can modify package-lock.json)
- `npm publish` - Publish to npm (destructive)

### System Commands
- `sudo` - Superuser operations
- `rm -rf` - Recursive deletion

### Database Commands
- `psql`, `mysql`, `sqlite3`, `mongosh`, `redis-cli` - Direct database access

## Updating Permissions

To update the local settings from the framework:

```bash
npx agentic15 update-settings
```

This will sync `.claude/settings.json` from `Agent/framework/settings.json`.

## Permission Rationale

**Why block all git write operations?**

The Agentic15 workflow is designed to:
1. Keep Claude focused on code and testing
2. Let the user manage git workflow via commands like `npx agentic15 commit`
3. Prevent accidental destructive operations
4. Maintain a clean, controlled git history

**Why allow read-only git commands?**

Read-only git commands help Claude:
1. Understand the current state of the repository
2. Check which branch is active
3. View commit history for context
4. Understand changes that have been made

This provides context without risk of data loss.
