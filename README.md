# Agentic15 Claude Zen

AI-Assisted Development Framework with Automated Workflows

[![npm version](https://badge.fury.io/js/@agentic15.com%2Fagentic15-claude-zen.svg)](https://www.npmjs.com/package/@agentic15.com/agentic15-claude-zen)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

---

## Quick Start

**Step 1: Create Project**
```bash
# Bash/Mac/Linux
npx @agentic15.com/agentic15-claude-zen my-project

# PowerShell (Windows)
npx "@agentic15.com/agentic15-claude-zen" my-project
```

**Step 2: Navigate Into Project**
```bash
cd my-project
```

**Step 3: Launch Claude Code from Inside Project Directory**

Start Claude Code CLI from inside the `my-project` directory. Claude Code MUST be running from inside your project directory to access the framework files.

**Step 4: Protect Your Main Branch (Recommended)**
```bash
# Prevent direct pushes to main - require PRs for all changes
gh api repos/OWNER/REPO/branches/main/protection -X PUT \
  -H "Accept: application/vnd.github+json" \
  -f required_pull_request_reviews[required_approving_review_count]=0 \
  -f enforce_admins=false \
  -f allow_force_pushes=false \
  -f allow_deletions=false
```
Replace `OWNER/REPO` with your GitHub username and repository name.

**Step 5: Use Framework Commands**
```bash
npx agentic15 auth                         # One-time GitHub setup
npx agentic15 plan                         # Enter interactive mode
# Type/paste your requirements, press Ctrl+D when done
# Open another terminal. Make sure that you in your project directory. Launch Claude
# Ask Claude: "Read the requirements file and generate a task breakdown plan"
npx agentic15 task next                    # Start first task
# Ask Claude: "Implement this task"
npx agentic15 commit                       # Test, commit, push, PR
```

> **IMPORTANT**: Always launch Claude Code from inside your project directory, not from the parent directory. The framework relies on `.claude/` configuration files that must be accessible from the working directory.

**See [WORKFLOWS.md](WORKFLOWS.md) for complete workflows.**

---

## What It Does

**5 Commands:**
- `npx agentic15 plan` - Generate and lock plans
- `npx agentic15 task next` - Start next task
- `npx agentic15 commit` - Test + commit + push + PR
- `npx agentic15 status` - Check progress
- `npm test` - Run tests

**Automates:**
- Feature branches (`feature/task-001`)
- Commit messages (`[TASK-001] Task title`)
- GitHub push
- Pull requests
- Issue tracking

**Workflow:**
```
plan → task → code → test → commit → PR → merge → repeat
```

---

## Documentation

- **[WORKFLOWS.md](WORKFLOWS.md)** - Complete workflows with diagrams
- **[CHANGELOG.md](CHANGELOG.md)** - Version history

---

## Requirements

- Node.js 18+
- Git
- GitHub account
- GitHub CLI (`gh`)

---

## License

Apache 2.0 - See [LICENSE](LICENSE)

---

**Support:** https://github.com/agentic15/claude-zen/issues
