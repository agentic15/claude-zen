# Agentic15 Claude Code Plugin

**Native slash commands for Agentic15 framework in Claude Code**

[![npm version](https://badge.fury.io/js/@agentic15.com%2Fclaude-code-zen-plugin.svg)](https://www.npmjs.com/package/@agentic15.com/claude-code-zen-plugin)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

---

## Overview

This Claude Code plugin provides native slash commands (`/agentic15:*`) as an alternative to the npm CLI for the Agentic15 framework. Use familiar slash commands directly in Claude Code instead of running terminal commands.

**Plugin Approach:**
```
/agentic15:plan "Build todo app"
/agentic15:task-next
/agentic15:commit
```

**npm CLI Approach:**
```bash
npx agentic15 plan "Build todo app"
npx agentic15 task next
npx agentic15 commit
```

---

## Installation

### For Claude Code Users

Install the plugin globally or in your project:

```bash
npm install -g @agentic15.com/claude-code-zen-plugin
```

Or add to your project:

```bash
npm install --save-dev @agentic15.com/claude-code-zen-plugin
```

### Claude Code Configuration

The plugin is automatically discovered by Claude Code. Skills will appear with the `agentic15:` namespace.

---

## Available Skills

| Skill | Description |
|-------|-------------|
| `/agentic15:plan [requirements]` | Generate or lock project plan |
| `/agentic15:task-next` | Start next pending task |
| `/agentic15:task-start TASK-ID` | Start specific task by ID |
| `/agentic15:commit` | Commit changes and create PR |
| `/agentic15:sync` | Sync with main after PR merge |
| `/agentic15:status` | Show project status |
| `/agentic15:visual-test <url>` | Run UI verification |

---

## Usage Examples

### Create and Lock Plan

```
User: /agentic15:plan "Build a task management API with CRUD operations"
Claude: ✅ Plan requirements created: plan-003-generated
        Tell me when you're ready to create the project plan

User: Create the project plan
Claude: [Creates PROJECT-PLAN.json]

User: /agentic15:plan
Claude: ✅ Plan locked successfully
        💡 Next step: /agentic15:task-next
```

### Work Through Tasks

```
User: /agentic15:task-next
Claude: ✅ Started TASK-001: Create database schema
        [Implements the task]

User: /agentic15:commit
Claude: ✅ PR created: https://github.com/user/repo/pull/42
```

### Check Status

```
User: /agentic15:status
Claude: 📊 Project Status
        Plan: plan-003-generated
        Progress: [████████░░] 40%
        Active: TASK-003
        Completed: 4 | Pending: 6
```

---

## Plugin vs npm CLI

### When to Use the Plugin

✅ **Use `/agentic15:*` skills when:**
- Working entirely in Claude Code
- Want Claude to run commands autonomously
- Prefer slash command UX
- Don't want to switch to terminal

### When to Use npm CLI

✅ **Use `npx agentic15` when:**
- Working in terminal/shell scripts
- Running commands outside Claude Code
- Integrating with CI/CD
- Prefer traditional CLI

Both approaches work identically - choose based on your workflow preference.

---

## Requirements

- **Node.js:** 18.0.0 or higher
- **Claude Code:** Latest version recommended
- **Agentic15 Framework:** ^7.0.1 (installed automatically as dependency)

---

## Architecture

This plugin is a **thin wrapper** around the core Agentic15 framework:

```
/agentic15:plan
    ↓
skills/plan.js (this plugin)
    ↓
PlanCommand.js (@agentic15.com/agentic15-claude-zen)
    ↓
Framework logic
```

**Benefits:**
- No code duplication
- Always in sync with framework
- Tiny package size (<50kB)
- Single source of truth

---

## Development

### Package Structure

```
plugin/
├── package.json          # Plugin metadata and dependencies
├── skills/               # Skill implementations
│   ├── plan.js
│   ├── task-next.js
│   ├── task-start.js
│   ├── commit.js
│   ├── sync.js
│   ├── status.js
│   └── visual-test.js
├── utils/                # Shared utilities
│   └── skill-wrapper.js
├── tests/                # Test suite
└── README.md
```

### Building

This plugin requires the core framework as a dependency:

```bash
npm install
```

### Testing

```bash
npm test
```

---

## Troubleshooting

### Skills Not Appearing in Claude Code

1. Verify plugin is installed: `npm list @agentic15.com/claude-code-zen-plugin`
2. Restart Claude Code
3. Check Claude Code plugin settings

### "No active plan" Error

Run `/agentic15:status` to check if a plan exists. If not:

```
/agentic15:plan "Your requirements here"
```

### Skill Conflicts

If you have multiple plugins with similar names, skills use the `agentic15:` namespace to avoid conflicts:

```
/agentic15:plan    ✅ This plugin
/plan              ❌ Different plugin
```

---

## License

Apache 2.0 - See [LICENSE](../Agent/LICENSE) for details.

Copyright 2024-2026 agentic15.com

---

## Links

- **Framework:** [@agentic15.com/agentic15-claude-zen](https://www.npmjs.com/package/@agentic15.com/agentic15-claude-zen)
- **Documentation:** https://github.com/agentic15/claude-zen
- **Issues:** https://github.com/agentic15/claude-zen/issues
