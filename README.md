# Agentic15 Claude Zen

**Structured AI-Assisted Development Framework for Claude Code**

[![npm version](https://badge.fury.io/js/@agentic15.com%2Fagentic15-claude-zen.svg)](https://www.npmjs.com/package/@agentic15.com/agentic15-claude-zen)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

---

## Overview

<table>
<tr>
<td width="50%">

### What is Agentic15 Claude Zen?

Agentic15 Claude Zen is a structured development framework designed to work seamlessly with Claude Code. It provides task tracking, workflow structure, and GitHub integration without enforcing rigid testing requirements.

**Philosophy:** Structure, not enforcement. The framework provides commands and organization, while Claude decides when tests are appropriate.

</td>
<td width="50%">

### Key Benefits

- ✅ **Task tracking** and organization
- ✅ **Consistent workflow** structure
- ✅ **GitHub integration** with automated PRs
- ✅ **Manual UI testing** tools
- ✅ **Flexible** - no mandatory testing
- ✅ **Claude Code optimized** hooks

</td>
</tr>
</table>

---

## Quick Start

### 1. Create Project
Creates new project with framework structure

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

---

### 2. Initialize Git
Links project to GitHub (required for PRs)

```bash
git init
git branch -M main
git add .
git commit -m "Initial commit"

gh repo create OWNER/REPO --public
git remote add origin https://github.com/OWNER/REPO.git
git push -u origin main
```

**Note:** Replace `OWNER/REPO` with your GitHub username/repo

---

### 3. Configure Auth
One-time GitHub authentication setup

```bash
npx agentic15 auth
```

---

### 4. Create Plan
Generates and locks project plan

**In Terminal:**
```bash
npx agentic15 plan "Build a todo app with add, remove, and list features"
```

**In Claude Code (launch from project directory):**
```
Ask: "Create the project plan from the requirements file"
```

**Back in Terminal:**
```bash
npx agentic15 plan
git add .
git commit -m "Add initial project plan"
git push
```

**Important:** Commit plan to main BEFORE enabling branch protection

---

### 5. Enable Branch Protection
Enforces PR-only workflow for all future changes

**Bash/Mac/Linux:**
```bash
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

gh api repos/OWNER/REPO -X PATCH \
  -H "Accept: application/vnd.github+json" \
  -f delete_branch_on_merge=true
```

**PowerShell (Windows):**
```powershell
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

gh api repos/OWNER/REPO -X PATCH -H "Accept: application/vnd.github+json" -f delete_branch_on_merge=true
```

---

### 6. Start First Task
Creates feature branch for first task

```bash
npx agentic15 task next
```

---

## Daily Development Workflow

### 1. Implement (Claude Code)
Ask: "Implement the active task"

Claude writes code in `Agent/` directory

---

### 2. Commit & PR (Your Terminal)
```bash
npx agentic15 commit
```

Stages changes, commits, pushes, creates PR

---

### 3. Review (GitHub)
Review and merge the PR

---

### 4. Sync & Next (Your Terminal)
```bash
npx agentic15 sync
```

Syncs with main, deletes feature branch

```bash
npx agentic15 task next
```

Starts next task

---

## Core Features

<table>
<tr>
<td width="50%">

### Commands

| Command | Description |
|---------|-------------|
| `npx agentic15 plan` | Generate and lock project plan |
| `npx agentic15 task next` | Start next pending task |
| `npx agentic15 task start TASK-XXX` | Start specific task |
| `npx agentic15 task status` | View current progress |
| `npx agentic15 commit` | Commit, push, and create PR |
| `npx agentic15 sync` | Sync with main branch after PR merge |
| `npx agentic15 update-settings` | Update `.claude/settings.json` from latest framework |
| `npx agentic15 visual-test <url>` | Capture UI screenshots and console errors |
| `npx agentic15 auth` | Configure GitHub authentication |

</td>
<td width="50%">

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

</td>
</tr>
</table>

---

## Project Structure

<table>
<tr>
<td width="50%">

### Directory Layout

```
my-project/
├── node_modules/
│   └── @agentic15.com/agentic15-claude-zen/
│       └── framework/          # Framework files
│           ├── hooks/          # Claude Code hooks
│           ├── settings.json   # Framework settings
│           ├── PLAN-SCHEMA.json
│           ├── PROJECT-PLAN-TEMPLATE.json
│           └── POST-INSTALL.md
├── .claude/                    # User-generated content
│   ├── ACTIVE-PLAN             # Current active plan
│   ├── plans/                  # Your project plans
│   │   └── {planId}/
│   │       ├── TASK-TRACKER.json
│   │       └── tasks/
│   ├── settings.json           # References framework
│   └── settings.local.json     # Local overrides
├── Agent/                      # Your code workspace
│   ├── src/                    # Source code
│   └── tests/                  # Tests (optional)
├── scripts/                    # Build utilities
└── package.json                # Project dependencies
```

</td>
<td width="50%">

### Framework Upgrades

Framework files live in `node_modules` and are automatically updated:

```bash
# Upgrade to latest version
npm install @agentic15.com/agentic15-claude-zen@latest

# Update settings.json to latest framework version
npx agentic15 update-settings

# Or to a specific version
npm install @agentic15.com/agentic15-claude-zen@5.0.0
npx agentic15 update-settings
```

**What gets updated:**
- ✅ Framework hooks in `node_modules`
- ✅ Settings schema and templates
- ✅ CLI commands

**What stays unchanged:**
- ✅ Your code in `Agent/`
- ✅ Your plans and tasks in `.claude/plans/`
- ✅ Your local settings in `.claude/settings.local.json`

**Note:** After upgrading, run `npx agentic15 update-settings` to update your `.claude/settings.json` with the latest framework configuration. Your existing settings will be backed up to `.claude/settings.json.backup`.

</td>
</tr>
</table>

---

## GitHub Integration

<table>
<tr>
<td width="50%">

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

**Note:** Authentication is handled by `gh` CLI - no token field needed.

</td>
<td width="50%">

### Manual Configuration (Optional)

If you need to override the auto-detected values, create or edit `.claude/settings.local.json`:
```json
{
  "github": {
    "enabled": true,
    "autoCreate": false,
    "autoUpdate": false,
    "autoClose": false,
    "owner": "your-username",
    "repo": "your-repo"
  }
}
```

**Note:** Default settings have `autoCreate`, `autoUpdate`, and `autoClose` set to `false` to give you full control. Set them to `true` if you want automatic GitHub issue management.

### Features (Optional - Enable in settings)
- **Auto-create issues:** When starting tasks (set `autoCreate: true`)
- **Auto-update issues:** When creating PRs (set `autoUpdate: true`)
- **Auto-close issues:** When merging to main (set `autoClose: true`)
- **Secure authentication:** Uses `gh` CLI credentials

</td>
</tr>
</table>

---

## Requirements & Philosophy

<table>
<tr>
<td width="50%">

### Requirements

- **Node.js:** 18.0.0 or higher
- **Git:** Any recent version
- **GitHub CLI:** `gh` command-line tool
- **GitHub Account:** For issue and PR management

### Documentation

- **[CHANGELOG.md](CHANGELOG.md)** - Version history and release notes
- **[MIGRATION-GUIDE-v4-to-v5.md](MIGRATION-GUIDE-v4-to-v5.md)** - Upgrade guide from v4.x to v5.x

### Support

- **Issues:** https://github.com/agentic15/claude-zen/issues
- **Documentation:** https://github.com/agentic15/claude-zen

</td>
<td width="50%">

### Philosophy

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

</td>
</tr>
</table>

---

## License

Apache 2.0 - See [LICENSE](LICENSE) file for details.

---

**Made with ❤️ for Claude Code developers**
