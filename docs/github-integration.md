# GitHub Issues Integration

Complete guide to integrating your Claude Zen workflow with GitHub Issues.

## Overview

The GitHub Issues integration automatically creates, updates, and closes GitHub issues as you work through tasks. This keeps your GitHub project board in sync with local task progress without manual intervention.

## Features

### ✅ Auto-Create Issues
When you start a task (`npm run task:start TASK-001`), a GitHub issue is automatically created with:
- Title: `[TASK-001] Your Task Title`
- Body: Full task details including description, completion criteria, dependencies, test cases
- Labels: `status: in-progress`, phase labels

### ✅ Auto-Update Issues
When you complete a task (`npm run task:done TASK-001`), the GitHub issue is automatically updated with:
- Labels changed to `status: completed`
- Comment added with completion details, time tracking, and criteria checklist

### ✅ Auto-Close Issues
When you merge to main, the GitHub issue is automatically closed with:
- Confirmation comment: "Merged to main branch! 🎉"
- Issue status: Closed

## Setup

### 1. Generate GitHub Personal Access Token

**Option A: Classic Token (Recommended)**
1. Go to GitHub → Settings → Developer settings → [Personal access tokens → Tokens (classic)](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "Claude Zen - YourProjectName")
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
5. Click "Generate token"
6. **Copy the token immediately** (you won't be able to see it again!)

**Option B: Fine-Grained Token**
1. Go to GitHub → Settings → Developer settings → [Personal access tokens → Fine-grained tokens](https://github.com/settings/personal-access-tokens/new)
2. Give it a name and set expiration
3. Select "Only select repositories" and choose your repo
4. Set Repository permissions:
   - Issues: **Read and write**
   - Metadata: **Read-only**
5. Click "Generate token"
6. **Copy the token**

### 2. Configure Locally

Create `.claude/settings.local.json` in your project:

```json
{
  "github": {
    "enabled": true,
    "autoCreate": true,
    "autoUpdate": true,
    "autoClose": true,
    "token": "ghp_YourTokenHere",
    "owner": "your-github-username",
    "repo": "your-repo-name"
  }
}
```

**Note**: This file is gitignored by default to protect your token.

### 3. Verify Configuration

Run a task to test:

```bash
npm run task:start TASK-001
```

You should see:
```
✓ Created GitHub issue #123
```

Check your GitHub repository - the issue should appear!

## Configuration Options

### Settings Priority

Configuration is loaded in this order (highest priority first):

1. **Environment Variables** (highest)
   - `GITHUB_TOKEN`
   - `GITHUB_OWNER`
   - `GITHUB_REPO`
   - `GITHUB_ENABLED` (true/false)
   - `GITHUB_AUTO_CREATE` (true/false)
   - `GITHUB_AUTO_UPDATE` (true/false)
   - `GITHUB_AUTO_CLOSE` (true/false)

2. **`.claude/settings.local.json`** (user-specific, gitignored)
3. **`.claude/settings.json`** (defaults)
4. **Auto-detection** (owner/repo from git remote)

### Disabling Features

**Disable entirely:**
```json
{
  "github": {
    "enabled": false
  }
}
```

**Disable specific features:**
```json
{
  "github": {
    "enabled": true,
    "autoCreate": true,
    "autoUpdate": false,  // Don't update issues
    "autoClose": false    // Don't close on merge
  }
}
```

### Using Environment Variables

For CI/CD or temporary configuration:

```bash
export GITHUB_TOKEN=ghp_YourToken
export GITHUB_OWNER=your-username
export GITHUB_REPO=your-repo

npm run task:start TASK-001
```

Or inline:

```bash
GITHUB_TOKEN=ghp_YourToken npm run task:start TASK-001
```

## Task Lifecycle Example

### 1. Start Task
```bash
$ npm run task:start TASK-001

✅ Started task: TASK-001
📋 Plan: my-project-plan

📌 Implement user authentication
📝 Add JWT-based authentication system

🔧 Phase: implementation
🔗 GitHub Issue: https://github.com/myorg/myrepo/issues/42

✓ Completion criteria:
  1. JWT tokens generated on login
  2. Protected routes validate tokens
  3. Tests cover auth flow
```

**GitHub Issue Created:**
- Title: `[TASK-001] Implement user authentication`
- Labels: `status: in-progress`, `phase: implementation`
- Body: Full task details with checkboxes

### 2. Complete Task
```bash
$ npm run task:done TASK-001

✅ Completed task: TASK-001
📋 Plan: my-project-plan

📌 Implement user authentication
⏱️  Time: 6.5h
   ✓ Under by 1.5h

🔗 GitHub Issue: Updated #42

📊 Progress:
   Completed: 3/10
   Remaining: 7
```

**GitHub Issue Updated:**
- Labels: `status: completed`, `phase: implementation`
- Comment added:
  ```
  Task completed! ✅

  **Status:** in_progress → completed
  **Time Taken:** 6.5h (estimated: 8h, -18.8%)

  **Completion Criteria:**
  - ✓ JWT tokens generated on login
  - ✓ Protected routes validate tokens
  - ✓ Tests cover auth flow
  ```

### 3. Merge to Main
```bash
$ git checkout main
$ git merge feature/auth

✓ Closed GitHub issue #42 for TASK-001

✅ Closed 1 GitHub issue after merge to main
```

**GitHub Issue Closed:**
- Status: Closed
- Comment: "Merged to main branch! 🎉\n\nTask TASK-001 has been successfully integrated."

## Troubleshooting

### Issue Not Created

**Check 1: Is GitHub enabled?**
```bash
# Should show your token (partially hidden)
grep -A 5 "github" .claude/settings.local.json
```

**Check 2: Is token valid?**
```bash
# Test with curl
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user
```

**Check 3: Check permissions**
- Classic token: Must have `repo` scope
- Fine-grained token: Must have Issues (Read/Write) permission

**Check 4: Rate limit**
```bash
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/rate_limit
```

### Issue Not Updated

- Verify `autoUpdate: true` in settings
- Check that task has `githubIssue` field in task JSON
- Check console for warning messages

### Issue Not Closed on Merge

- Verify `autoClose: true` in settings
- Ensure post-merge hook is installed (check `.git/hooks/post-merge`)
- Task ID must appear in commit messages: `[TASK-001]` or `TASK-001`
- Task must be completed before merge

### Permission Errors

**Error**: `Resource not accessible by personal access token`

**Solution**: Token doesn't have required permissions
- Classic: Add `repo` scope
- Fine-grained: Add Issues (Read/Write)

## Security Best Practices

### ✅ DO

- Store token in `.claude/settings.local.json` (gitignored)
- Use environment variables in CI/CD
- Use fine-grained tokens with minimal permissions
- Set token expiration dates
- Use separate tokens for different projects
- Revoke tokens when no longer needed

### ❌ DON'T

- Commit tokens to version control
- Share tokens with others
- Use tokens with excessive permissions
- Use the same token everywhere
- Leave tokens without expiration

### Token Rotation

When rotating tokens:

1. Generate new token on GitHub
2. Update `.claude/settings.local.json`
3. Test with a task start
4. Revoke old token on GitHub

## Branch Management

### Automatic Branch Deletion

To prevent branch clutter after merging PRs, enable GitHub's automatic branch deletion:

**Setup (One-time):**
1. Go to GitHub → Your Repository → Settings
2. Click **General** (left sidebar)
3. Scroll to **Pull Requests** section
4. ✅ Check **Automatically delete head branches**
5. Click **Save** (if button appears)

**What happens:**
- When a PR is merged to main, GitHub automatically deletes the feature branch
- Keeps repository clean and prevents stale branches
- Recommended for ALL projects using PR workflow

**Example:**
```bash
# Create and push feature branch
git checkout -b feature/task-001
git push -u origin feature/task-001

# Create PR and merge
gh pr create --title "[TASK-001] Feature" --body "Closes #123"
# ... get approval, merge PR ...

# After merge:
# ✓ GitHub issue #123 closed automatically (via post-merge hook)
# ✓ feature/task-001 branch deleted automatically (via GitHub setting)
```

**Manual cleanup (if not enabled):**
```bash
# Delete local branch
git branch -d feature/task-001

# Delete remote branch
git push origin --delete feature/task-001
```

**Bulk cleanup of merged branches:**
```bash
# List merged branches
git branch --merged main

# Delete all merged branches locally
git branch --merged main | grep -v "main" | xargs git branch -d

# Prune remote tracking branches
git remote prune origin
```

## Advanced Usage

### Custom Labels

To use custom label names, modify the default labels in your settings:

```json
{
  "github": {
    "enabled": true,
    "labels": {
      "pending": "todo",
      "in_progress": "in-progress",
      "completed": "done",
      "blocked": "blocked"
    }
  }
}
```

**Note**: This feature requires code modification in `TaskIssueMapper.js`.

### Multiple Repositories

For projects that span multiple repositories, configure per-project:

```bash
# Project A
cd project-a
echo '{"github":{"repo":"project-a"}}' > .claude/settings.local.json

# Project B
cd ../project-b
echo '{"github":{"repo":"project-b"}}' > .claude/settings.local.json
```

### CI/CD Integration

GitHub Actions example:

```yaml
name: Task Workflow

on:
  push:
    branches: [main]

jobs:
  close-issues:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0  # Need full history for ORIG_HEAD

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Close Issues
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          node .claude/hooks/post-merge.js
```

## Migration from Existing Projects

If you're adding GitHub integration to an existing project:

### Backfill Existing Tasks

Create issues for incomplete tasks:

```bash
# For each pending/in-progress task
npm run task:start TASK-001
# This creates the issue and links it
```

### Bulk Operations

For many tasks, use a script:

```bash
#!/bin/bash
for task in $(jq -r '.taskFiles[] | select(.status != "completed") | .id' .claude/plans/*/TASK-TRACKER.json); do
  echo "Creating issue for $task"
  npm run task:start $task
  npm run task:pause $task  # Return to pending
done
```

## API Reference

### GitHubConfig

```javascript
import { GitHubConfig } from '@agentic15.com/agentic15-claude-zen/src/core/GitHubConfig.js';

const config = new GitHubConfig(process.cwd());

config.isEnabled()           // true if fully configured
config.isAutoCreateEnabled() // true if auto-create enabled
config.isAutoUpdateEnabled() // true if auto-update enabled
config.isAutoCloseEnabled()  // true if auto-close enabled
config.getToken()            // returns token or null
config.getRepoInfo()         // returns { owner, repo }
```

### GitHubClient

```javascript
import { GitHubClient } from '@agentic15.com/agentic15-claude-zen/src/core/GitHubClient.js';

const client = new GitHubClient(token, owner, repo);

await client.createIssue(title, body, labels)     // returns issue number
await client.updateIssueLabels(issueNum, labels)  // returns true/false
await client.addIssueComment(issueNum, comment)   // returns true/false
await client.closeIssue(issueNum, comment)        // returns true/false
client.isConfigured()                             // returns true/false
```

## Support

- Documentation: [GitHub](https://github.com/agentic15/claude-zen/tree/main/docs)
- Issues: [GitHub Issues](https://github.com/agentic15/claude-zen/issues)
- Discussions: [GitHub Discussions](https://github.com/agentic15/claude-zen/discussions)
- Email: developers@agentic15.com
