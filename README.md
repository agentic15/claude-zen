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

| Step | Action | Commands |
|------|--------|----------|
| **1. Create Project** | **Bash/Mac/Linux:**<br>`npx @agentic15.com/agentic15-claude-zen my-project`<br>`cd my-project`<br><br>**PowerShell (Windows):**<br>`npx "@agentic15.com/agentic15-claude-zen" my-project`<br>`cd my-project` | Creates new project with framework structure |
| **2. Initialize Git** | `git init`<br>`git branch -M main`<br>`git add .`<br>`git commit -m "Initial commit"`<br><br>`gh repo create OWNER/REPO --public`<br>`git remote add origin https://github.com/OWNER/REPO.git`<br>`git push -u origin main`<br><br>**Note:** Replace `OWNER/REPO` with your GitHub username/repo | Links project to GitHub (required for PRs) |
| **3. Configure Auth** | `npx agentic15 auth` | One-time GitHub authentication setup |
| **4. Create Plan** | **In Terminal:**<br>`npx agentic15 plan "Build a todo app with add, remove, and list features"`<br><br>**In Claude Code (launch from project directory):**<br>Ask: "Create the project plan from the requirements file"<br><br>**Back in Terminal:**<br>`npx agentic15 plan`<br>`git add .`<br>`git commit -m "Add initial project plan"`<br>`git push`<br><br>**Important:** Commit plan to main BEFORE enabling branch protection | Generates and locks project plan |
| **5. Enable Branch Protection** | **Bash/Mac/Linux:**<br>```cat > /tmp/protection.json << 'EOF'```<br>```{```<br>```  "required_pull_request_reviews": {```<br>```    "required_approving_review_count": 0```<br>```  },```<br>```  "enforce_admins": false,```<br>```  "allow_force_pushes": false,```<br>```  "allow_deletions": false,```<br>```  "required_status_checks": null,```<br>```  "restrictions": null```<br>```}```<br>```EOF```<br><br>```gh api repos/OWNER/REPO/branches/main/protection -X PUT \```<br>```  -H "Accept: application/vnd.github+json" \```<br>```  --input /tmp/protection.json```<br><br>```gh api repos/OWNER/REPO -X PATCH \```<br>```  -H "Accept: application/vnd.github+json" \```<br>```  -f delete_branch_on_merge=true```<br><br>**PowerShell (Windows):**<br>```$body = @"```<br>```{```<br>```  "required_pull_request_reviews": {```<br>```    "required_approving_review_count": 0```<br>```  },```<br>```  "enforce_admins": false,```<br>```  "allow_force_pushes": false,```<br>```  "allow_deletions": false,```<br>```  "required_status_checks": null,```<br>```  "restrictions": null```<br>```}```<br>```"@```<br><br>```echo $body \| gh api repos/OWNER/REPO/branches/main/protection -X PUT -H "Accept: application/vnd.github+json" --input -```<br><br>```gh api repos/OWNER/REPO -X PATCH -H "Accept: application/vnd.github+json" -f delete_branch_on_merge=true``` | Enforces PR-only workflow for all future changes |
| **6. Start First Task** | `npx agentic15 task next` | Creates feature branch for first task |

### Daily Development Workflow

| Location | Step | Action |
|----------|------|--------|
| **Claude Code** | 1. Implement | Ask: "Implement the active task"<br>Claude writes code in `Agent/` directory |
| **Your Terminal** | 2. Commit & PR | `npx agentic15 commit`<br>Stages changes, commits, pushes, creates PR |
| **GitHub** | 3. Review | Review and merge the PR |
| **Your Terminal** | 4. Sync & Next | `npx agentic15 sync`<br>Syncs with main, deletes feature branch<br><br>`npx agentic15 task next`<br>Starts next task |

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
├── node_modules/
│   └── @agentic15.com/agentic15-claude-zen/
│       └── framework/          # Framework files (hooks, schemas, templates)
│           ├── hooks/          # Claude Code hooks
│           ├── settings.json   # Framework settings
│           ├── PLAN-SCHEMA.json
│           ├── PROJECT-PLAN-TEMPLATE.json
│           └── POST-INSTALL.md
├── .claude/                    # User-generated content only
│   ├── ACTIVE-PLAN             # Current active plan
│   ├── plans/                  # Your project plans and tasks
│   │   └── {planId}/
│   │       ├── TASK-TRACKER.json
│   │       └── tasks/
│   ├── settings.json           # References framework in node_modules
│   └── settings.local.json     # Local overrides (optional, gitignored)
├── Agent/                      # Your code workspace
│   ├── src/                    # Source code
│   └── tests/                  # Tests (optional)
├── scripts/                    # Build and utility scripts
└── package.json                # Project dependencies
```

### Framework Upgrades

Framework files live in `node_modules` and are automatically updated when you upgrade the package:

```bash
# Upgrade to latest version
npm install @agentic15.com/agentic15-claude-zen@latest

# Or to a specific version
npm install @agentic15.com/agentic15-claude-zen@5.0.0
```

**What gets updated:**
- ✅ Framework hooks in `node_modules`
- ✅ Settings schema and templates
- ✅ CLI commands

**What stays unchanged:**
- ✅ Your code in `Agent/`
- ✅ Your plans and tasks in `.claude/plans/`
- ✅ Your local settings in `.claude/settings.local.json`

---

## GitHub Integration

### Authentication

The framework uses **GitHub CLI (`gh`)** for authentication - no personal access tokens needed!

**Setup:**
```bash
npx agentic15 auth
```

This command will:
1. Check if `gh` CLI is installed
2. Run `gh auth login` if not already authenticated
3. Auto-detect your repository owner/repo from git remote
4. Save configuration to `.claude/settings.local.json`

### Manual Configuration (Optional)

If you need to override the auto-detected values, create or edit `.claude/settings.local.json`:
```json
{
  "github": {
    "enabled": true,
    "autoCreate": true,
    "autoUpdate": true,
    "autoClose": true,
    "owner": "your-username",
    "repo": "your-repo"
  }
}
```

**Note:** Authentication is handled by `gh` CLI - no token field needed.

### Features
- **Auto-create issues:** When starting tasks
- **Auto-update issues:** When creating PRs
- **Auto-close issues:** When merging to main (optional)
- **Secure authentication:** Uses `gh` CLI credentials

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
