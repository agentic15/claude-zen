# Agentic15 Claude Zen

**Structured AI-Assisted Development Framework for Claude Code**

[![npm version](https://badge.fury.io/js/@agentic15.com%2Fagentic15-claude-zen.svg)](https://www.npmjs.com/package/@agentic15.com/agentic15-claude-zen)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

---

## Overview

Agentic15 Claude Zen is a structured development framework designed to work seamlessly with Claude Code. It provides task tracking, workflow structure, and GitHub integration without enforcing rigid testing requirements.

**Philosophy:** Structure, not enforcement. The framework provides commands and organization, while Claude decides when tests are appropriate.

---

## Quick Start

### 1. Create Project

**Bash/Mac/Linux:**
```bash
npx @agentic15.com/agentic15-claude-zen my-project
cd my-project
```

**PowerShell (Windows):**
```powershell
npx "@agentic15.com/agentic15-claude-zen" my-project
cd my-project
```

### 2. Initialize Git and Link to GitHub

```bash
# Initialize git repository
git init
git branch -M main
git add .
git commit -m "Initial commit"

# Create GitHub repository and link it
gh repo create OWNER/REPO --public
git remote add origin https://github.com/OWNER/REPO.git
git push -u origin main
```

> **Note:** Replace `OWNER/REPO` with your GitHub username and repository name (e.g., `myusername/my-project`).

> **Required:** This step is mandatory. The framework needs a GitHub remote to create issues and pull requests.

### 3. Configure Repository Settings (Optional)

**Bash/Mac/Linux:**
```bash
# Prevent direct pushes to main - require PRs for all changes
cat > /tmp/protection.json << 'EOF'
{
  "required_pull_request_reviews": {
    "required_approving_review_count": 0
  },
  "enforce_admins": false,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_status_checks": null,
  "restrictions": null
}
EOF

gh api repos/OWNER/REPO/branches/main/protection -X PUT \
  -H "Accept: application/vnd.github+json" \
  --input /tmp/protection.json

# Auto-delete branches after PR merge
gh api repos/OWNER/REPO -X PATCH \
  -H "Accept: application/vnd.github+json" \
  -f delete_branch_on_merge=true
```

**PowerShell (Windows):**
```powershell
# Prevent direct pushes to main - require PRs for all changes
$body = @"
{
  "required_pull_request_reviews": {
    "required_approving_review_count": 0
  },
  "enforce_admins": false,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_status_checks": null,
  "restrictions": null
}
"@

echo $body | gh api repos/OWNER/REPO/branches/main/protection -X PUT -H "Accept: application/vnd.github+json" --input -

# Auto-delete branches after PR merge
gh api repos/OWNER/REPO -X PATCH -H "Accept: application/vnd.github+json" -f delete_branch_on_merge=true
```

### 4. Start Using the Framework

```bash
# Configure GitHub authentication (one-time setup)
npx agentic15 auth

# Create a project plan
npx agentic15 plan "Build a todo app with add, remove, and list features"

# Start the first task
npx agentic15 task next
```

### 5. Development Workflow

**In Claude Code Terminal:**
1. Ask Claude: "Implement the active task"
2. Claude writes code in `Agent/` directory

**In Your Terminal:**
```bash
# When task is complete
npx agentic15 commit
# This will: stage changes, commit, push, and create PR
```

**On GitHub:**
1. Review and merge the PR

**Back in Your Terminal:**
```bash
# Sync with main branch after PR merge
npx agentic15 sync
# This will: switch to main, pull changes, delete feature branch

# Continue to next task
npx agentic15 task next
```

---

## Core Features

### Commands

| Command | Description |
|---------|-------------|
| `npx agentic15 plan` | Generate and lock project plan |
| `npx agentic15 task next` | Start next pending task |
| `npx agentic15 task start TASK-XXX` | Start specific task |
| `npx agentic15 task status` | View current progress |
| `npx agentic15 commit` | Commit, push, and create PR |
| `npx agentic15 sync` | Sync with main branch after PR merge |
| `npx agentic15 visual-test <url>` | Capture UI screenshots and console errors |
| `npx agentic15 upgrade` | Update framework files |
| `npx agentic15 auth` | Configure GitHub authentication |

### Workflow Automation

The framework automates:
- **Feature branches:** `feature/task-001`, `feature/task-002`, etc.
- **Commit messages:** `[TASK-001] Task title`
- **GitHub push:** Automatic push to remote
- **Pull requests:** Auto-generated with task details
- **Issue tracking:** Optional GitHub Issues integration

### Standard Workflow

```
plan → task → code → commit → PR → merge → sync → next task
```

---

## Project Structure

```
my-project/
├── .claude/                    # Framework configuration
│   ├── hooks/                  # Claude Code hooks
│   ├── plans/                  # Project plans and tasks
│   ├── settings.json           # Framework settings
│   └── settings.local.json     # Local overrides (gitignored)
├── Agent/                      # Your code workspace
│   ├── src/                    # Source code
│   └── tests/                  # Tests (optional)
├── scripts/                    # Build and utility scripts
└── package.json                # Project dependencies
```

---

## GitHub Integration

### Optional Configuration

Create `.claude/settings.local.json`:
```json
{
  "github": {
    "token": "ghp_xxxxxxxxxxxxx",
    "owner": "your-username",
    "repo": "your-repo"
  }
}
```

Or use environment variables:
```bash
export GITHUB_TOKEN="ghp_xxxxxxxxxxxxx"
export GITHUB_OWNER="your-username"
export GITHUB_REPO="your-repo"
```

### Features
- **Auto-create issues:** When starting tasks
- **Auto-update issues:** When creating PRs
- **Auto-close issues:** When merging to main (optional)

---

## Requirements

- **Node.js:** 18.0.0 or higher
- **Git:** Any recent version
- **GitHub CLI:** `gh` command-line tool
- **GitHub Account:** For issue and PR management

---

## Documentation

- **[CHANGELOG.md](CHANGELOG.md)** - Version history and release notes

---

## Philosophy

**Structure, Not Enforcement**

The framework provides:
- ✅ Task tracking and organization
- ✅ Consistent workflow structure
- ✅ GitHub integration
- ✅ Manual UI testing tools

The framework does NOT enforce:
- ❌ Mandatory testing
- ❌ Specific test frameworks
- ❌ CI/CD requirements
- ❌ Code quality gates

**You decide:** When to write tests, what tools to use, and how to ensure quality. The framework provides structure and tools, not rigid rules.

---

## Support

- **Issues:** https://github.com/agentic15/claude-zen/issues
- **Documentation:** https://github.com/agentic15/claude-zen

---

## License

Apache 2.0 - See [LICENSE](LICENSE) file for details.

---

**Made with ❤️ for Claude Code developers**
