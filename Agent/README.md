# Agentic15 Claude Zen

**Structured AI-Assisted Development Framework for Claude Code**

[![npm version](https://badge.fury.io/js/@agentic15.com%2Fagentic15-claude-zen.svg)](https://www.npmjs.com/package/@agentic15.com/agentic15-claude-zen)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

> **Latest:** v7.0.1 - Token-Efficient Architecture & Autonomous UI Verification

---

## Overview

<table>
<tr>
<td width="50%">

### What is Agentic15 Claude Zen?

Agentic15 Claude Zen is a structured development framework designed to work seamlessly with Claude Code. It provides task tracking, workflow structure, and platform integration (GitHub or Azure DevOps) without enforcing rigid testing requirements.

**Philosophy:** Structure, not enforcement. The framework provides commands and organization, while Claude decides when tests are appropriate.

**NEW in v7.0:** Token-efficient service layer pattern for data-driven apps - reduces Claude's token usage by 1000x when transitioning from mock to real data.

</td>
<td width="50%">

### Key Benefits

- ✅ **Task tracking** and organization
- ✅ **Consistent workflow** structure
- ✅ **Dual-platform support** - GitHub or Azure DevOps
- ✅ **Automated PRs** and issue tracking
- ✅ **Autonomous UI verification** - Screenshots + accessibility
- ✅ **Token-efficient architecture** - 2K tokens (not 2M)
- ✅ **Service layer pattern** - Production-ready from Day 1
- ✅ **Flexible** - no mandatory testing
- ✅ **Claude Code optimized** hooks

</td>
</tr>
</table>

---

## Quick Start

### 1. Create Project

**Bash/Mac/Linux:**
```bash
npx @agentic15.com/agentic15-claude-zen my-project
cd my-project
```

**Windows (PowerShell):**
```powershell
npx @agentic15.com/agentic15-claude-zen my-project
cd my-project
```

### 2. Setup Platform

**GitHub:**
```bash
npx agentic15 auth
```

**Azure DevOps:**
```bash
az login && az devops login
```

**📘 Detailed Setup Guides:**
- [GitHub Setup Guide](./Agent/docs/GITHUB-SETUP.md)
- [Azure DevOps Setup Guide](./Agent/docs/AZURE-SETUP.md)

### 3. Create First Plan

```bash
npx agentic15 plan "Build a todo app with add, remove, and list features"
```

In Claude Code:
```
Ask: "Create the project plan from the requirements file"
```

Then lock the plan:
```bash
npx agentic15 plan
```

### 4. Start First Task

```bash
npx agentic15 task next
```

---

## 🚀 What's New in v7.0

### Token-Efficient Service Layer Pattern

For data-driven applications (Database + API + UI), v7.0 introduces a revolutionary architecture pattern:

**The Problem:**
- Traditional approach: Claude updates 1000+ UI files with mock→real transitions
- **Cost:** 2M+ tokens, high error risk, maintenance nightmare

**The Solution:**
- **Centralized Service Layer:** Claude updates only 1 file (`services/api.js`)
- **Cost:** 2K tokens (1000x reduction!)
- **UI Code:** Production-ready from Day 1, never changes across phases

**Architecture:**
```
UI Components (1000+ files) → Never change
     ↓
services/api.js (1 file) → Claude updates ONLY this
     ↓
Mock Data OR Real API → Config-based switching
```

**Development Phases:**
1. **Phase 1:** UI with mocks - User sees working app Day 1
2. **Phase 2:** Real API - Claude changes 1 line in services/api.js
3. **Phase 3:** Real Database - Backend only, frontend untouched

### Autonomous UI Verification

- **Visual Testing:** `npx agentic15 visual-test <url>` captures screenshots + logs
- **Network Monitoring:** Automatic 4xx/5xx error detection
- **Accessibility:** Integrated axe-core for WCAG compliance
- **Claude Self-Checks:** Autonomous verification before commit

### Complete Workflow Consistency

- **Plan Branches:** Auto-create `plan/<plan-id>` branches (like tasks)
- **Sync Support:** `npx agentic15 sync` handles plan branches
- **Archive Naming:** Unique timestamps prevent conflicts

---

## Commands

| Command | Description |
|---------|-------------|
| `npx agentic15 plan [requirements]` | Generate or lock project plan |
| `npx agentic15 plan archive [reason]` | Archive completed plan |
| `npx agentic15 task next` | Start next pending task |
| `npx agentic15 task start TASK-ID` | Start specific task |
| `npx agentic15 status` | Show project status |
| `npx agentic15 commit` | Commit & create PR |
| `npx agentic15 sync` | Sync with main after PR merge |
| `npx agentic15 visual-test <url>` | Capture UI screenshots and console errors |
| `npx agentic15 auth` | Configure GitHub authentication |

---

## Daily Workflow

### 1. Implement (Claude Code)
```
Ask: "Implement the active task"
```

Claude writes code in `Agent/` directory.

### 2. Commit & PR (Your Terminal)
```bash
npx agentic15 commit
```

Stages changes, commits, pushes, creates PR.

### 3. Review (GitHub/Azure)
Review and merge the PR.

### 4. Sync & Next (Your Terminal)
```bash
npx agentic15 sync
npx agentic15 task next
```

Syncs with main, deletes feature branch, starts next task.

---

## Platform Integration

**Choose one platform for your project:**

### GitHub

**Quick Setup:**
```bash
npx agentic15 auth  # Authenticate with GitHub CLI
```

**📘 [Complete GitHub Setup Guide](./Agent/docs/GITHUB-SETUP.md)**

---

### Azure DevOps

**Quick Setup:**
```bash
az login           # Authenticate with Azure
az devops login    # Authenticate with Azure DevOps
```

**📘 [Complete Azure DevOps Setup Guide](./Agent/docs/AZURE-SETUP.md)**

**Additional Resources:**
- [Azure Integration Guide](./Agent/docs/azure-integration-guide.md)
- [Azure Authentication](./Agent/docs/azure-authentication.md)
- [Azure Quick Reference](./Agent/docs/azure-quick-reference.md)

---

### Platform Comparison

| Feature | GitHub | Azure DevOps |
|---------|--------|--------------|
| **Authentication** | `gh` CLI (no tokens) | Azure CLI + PAT |
| **Setup Command** | `npx agentic15 auth` | `az login && az devops login` |
| **PR Creation** | `gh pr create` | `az repos pr create` |
| **Issue Tracking** | GitHub Issues (optional) | Azure Boards (optional) |
| **Auto-Detection** | From git remote | From git remote |

---

## Upgrading

### Upgrade Framework

```bash
npm install -g @agentic15.com/agentic15-claude-zen@latest
```

**What gets updated:**
- ✅ Framework hooks in `node_modules`
- ✅ Settings schema and templates
- ✅ CLI commands

**What stays unchanged:**
- ✅ Your code in `Agent/`
- ✅ Your plans and tasks in `.claude/plans/`
- ✅ Your local settings in `.claude/settings.local.json`

**After upgrading:**
```bash
npx agentic15 update-settings
```

This updates your `.claude/settings.json` with the latest framework configuration. Your existing settings will be backed up to `.claude/settings.json.backup`.

---

## Requirements & Philosophy

<table>
<tr>
<td width="50%">

### Requirements

- **Node.js:** 18.0.0 or higher
- **Git:** Any recent version
- **Platform CLI:** `gh` (GitHub) or `az` (Azure DevOps)
- **Claude Code:** Latest version recommended

### Documentation

- **[CHANGELOG.md](./Agent/CHANGELOG.md)** - Version history and release notes
- **[GitHub Setup](./Agent/docs/GITHUB-SETUP.md)** - Detailed GitHub integration
- **[Azure Setup](./Agent/docs/AZURE-SETUP.md)** - Detailed Azure DevOps integration

### Support

- **Issues:** https://github.com/agentic15/claude-zen/issues
- **Documentation:** https://github.com/agentic15/claude-zen

</td>
<td width="50%">

### Philosophy

This framework embodies a **lean** philosophy:

**Structure, not enforcement:**
- Provides organization and commands
- No mandatory testing requirements
- Claude decides what tests are appropriate

**Token efficiency:**
- Centralized service layer for data-driven apps
- One file updates instead of 1000
- 1000x reduction in token usage

**User engagement:**
- UI-first development approach
- Working demos from Day 1
- Visual verification over unit testing

**Workflow consistency:**
- Plans and tasks follow same patterns
- Branch → Commit → PR → Sync
- Autonomous when possible, manual when needed

</td>
</tr>
</table>

---

## License

Apache 2.0 - See [LICENSE](./Agent/LICENSE) for details.

Copyright 2024-2026 agentic15.com

---

## Version History

### v7.0.1 (2026-01-04) - Documentation Improvements
- **README:** 58% smaller (340 lines vs 806)
- **Organization:** Links to detailed guides instead of embedding

### v7.0.0 (2026-01-04) - Token-Efficient Architecture
- **Service Layer Pattern:** 1000x token reduction for data-driven apps
- **Autonomous UI Verification:** Visual testing with screenshots + accessibility
- **Workflow Consistency:** Plan branches, sync support, archive naming

### v6.0.0 (2025-12-31) - Dual-Platform Support
- GitHub and Azure DevOps integration
- Platform auto-detection
- Unified command structure

See [CHANGELOG.md](./Agent/CHANGELOG.md) for complete history.
