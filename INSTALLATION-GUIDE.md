# Installation Guide - Project File Structure

This document shows exactly what files are created when you run:
```bash
npx @agentic15.com/agentic15-claude-zen my-project
```

---

## Complete File Structure

When you create a new project, the framework installs the following files:

```
my-project/
├── .claude/                                    # Framework configuration directory
│   ├── hooks/                                  # Claude Code hooks (NOT git hooks)
│   │   ├── complete-task.js                    # Updates task status to completed
│   │   ├── enforce-plan-template.js            # Validates PROJECT-PLAN.json structure
│   │   ├── require-active-task.js              # Blocks Edit/Write without active task
│   │   ├── session-start-context.js            # Displays workflow context at session start
│   │   └── start-task.js                       # Updates task status to in_progress
│   │
│   ├── PLAN-SCHEMA.json                        # JSON schema for plan validation
│   ├── POST-INSTALL.md                         # Post-installation instructions
│   ├── PROJECT-PLAN-TEMPLATE.json              # Template for project plans
│   ├── settings.json                           # Framework settings (permissions, hooks)
│   └── settings.local.json.example             # Example local settings (gitignored)
│
├── .github/                                    # GitHub templates
│   ├── ISSUE_TEMPLATE/
│   │   └── task.md                             # Template for GitHub issues
│   └── PULL_REQUEST_TEMPLATE.md                # Template for pull requests
│
├── Agent/                                      # Your code workspace
│   └── .gitkeep                                # Placeholder to ensure directory is tracked
│
├── scripts/                                    # Build and utility scripts
│   └── .gitkeep                                # Placeholder to ensure directory is tracked
│
├── test-site/                                  # Integration test site (optional)
│   ├── src/
│   │   ├── App.css                             # Test app styles
│   │   ├── App.jsx                             # Test app component
│   │   ├── index.css                           # Global styles
│   │   └── main.jsx                            # Entry point
│   │
│   ├── .gitignore                              # Test site gitignore
│   ├── index.html                              # HTML template
│   ├── package.json                            # Test site dependencies
│   ├── README.md                               # Test site documentation
│   ├── server.js                               # Development server
│   └── vite.config.js                          # Vite configuration
│
├── .gitignore                                  # Project gitignore
├── package.json                                # Project dependencies
└── README.md                                   # Project documentation
```

---

## File Purposes

### `.claude/` Directory (Framework Configuration)

#### Hooks Directory
All hooks are **Claude Code hooks** (triggered when Claude uses tools), NOT git hooks (no automatic git automation).

| File | Type | Trigger | Purpose |
|------|------|---------|---------|
| `session-start-context.js` | SessionStart | Session begins | Shows workflow context, active plan, active task |
| `require-active-task.js` | PreToolUse | Before Edit/Write | Blocks code changes without active task |
| `enforce-plan-template.js` | PreToolUse | Before Write(PROJECT-PLAN.json) | Validates plan follows schema |
| `start-task.js` | Called by command | `npx agentic15 task start` | Updates task status, creates GitHub issue |
| `complete-task.js` | Called by command | `npx agentic15 commit` | Updates task status, closes GitHub issue |

#### Configuration Files

| File | Purpose | User Editable |
|------|---------|---------------|
| `settings.json` | Framework permissions, hooks, GitHub config | No (updated by `npx agentic15 upgrade`) |
| `settings.local.json.example` | Example local overrides | Copy to `settings.local.json` and edit |
| `PLAN-SCHEMA.json` | JSON schema for plan validation | No |
| `PROJECT-PLAN-TEMPLATE.json` | Template for creating plans | No |
| `POST-INSTALL.md` | Setup instructions shown after install | No |

### `.github/` Directory (GitHub Integration)

| File | Purpose |
|------|---------|
| `ISSUE_TEMPLATE/task.md` | Template for creating task issues on GitHub |
| `PULL_REQUEST_TEMPLATE.md` | Template for pull request descriptions |

### `Agent/` Directory (Your Workspace)

This is where YOU write code. Claude edits files here when implementing tasks.

**Structure (example):**
```
Agent/
├── src/              # Your source code
├── tests/            # Your tests (optional)
└── .gitkeep          # Placeholder
```

### `scripts/` Directory (Build Scripts)

Custom build and utility scripts.

**Structure (example):**
```
scripts/
├── build.sh          # Build script
├── deploy.sh         # Deployment script
└── .gitkeep          # Placeholder
```

### `test-site/` Directory (Integration Testing)

Optional Vite + React test site for manual UI testing.

**Usage:**
```bash
cd test-site
npm install
npm run dev
```

Then use:
```bash
npx agentic15 visual-test http://localhost:5173
```

### Root Files

| File | Purpose |
|------|---------|
| `.gitignore` | Git ignore rules |
| `package.json` | Project dependencies (includes `@agentic15.com/agentic15-claude-zen`) |
| `README.md` | Project documentation |

---

## What Gets Created During Workflow

### When You Run `npx agentic15 plan`

Creates:
```
.claude/
└── plans/
    └── PLAN-XXX/                    # e.g., PLAN-001
        ├── PROJECT-PLAN.json        # Your project plan
        ├── TASK-TRACKER.json        # Task tracking state
        └── tasks/                   # Individual task files
            ├── TASK-001.json
            ├── TASK-002.json
            └── ...
```

Also creates:
```
.claude/ACTIVE-PLAN                  # Points to current plan (e.g., "PLAN-001")
```

### When You Run `npx agentic15 visual-test <url>`

Creates:
```
.claude/
└── visual-test/
    ├── screenshot-fullpage.png      # Full page screenshot
    ├── screenshot-viewport.png      # Viewport screenshot
    ├── console-errors.json          # Browser console errors
    └── page.html                    # Captured HTML
```

---

## Files That Are Never Created

The framework does **NOT** create:
- ❌ Git hooks in `.git/hooks/` (all automation is manual via commands)
- ❌ Jest configuration files (`jest.config.js`, `jest.setup.js`)
- ❌ Babel configuration (`.babelrc`)
- ❌ Test mocks (`__mocks__/`)
- ❌ CI/CD configuration (`.github/workflows/`)
- ❌ ESLint, Prettier, or other linter configs

---

## Installation Commands

### Initial Install
```bash
npx @agentic15.com/agentic15-claude-zen my-project
```

This copies all files from the `templates/` directory in the npm package to `my-project/`.

### Upgrading Framework
```bash
# In existing project
npm install @agentic15.com/agentic15-claude-zen@latest
npx agentic15 upgrade
```

**What `upgrade` updates:**
- `.claude/hooks/*` (all 5 hook files)
- `.claude/settings.json`
- `.claude/PLAN-SCHEMA.json`
- `.claude/PROJECT-PLAN-TEMPLATE.json`
- `.claude/POST-INSTALL.md`

**What `upgrade` preserves:**
- `.claude/plans/` (your project plans)
- `.claude/ACTIVE-PLAN` (current plan)
- `.claude/settings.local.json` (your local settings)
- `Agent/` (your source code)
- `scripts/` (your scripts)
- `test-site/` (your test site)
- `package.json` (your project config)
- `README.md` (your documentation)

---

## File Count Summary

| Category | Count | Purpose |
|----------|-------|---------|
| Claude Code Hooks | 5 | Workflow enforcement and context |
| Framework Config | 5 | Settings, schemas, templates |
| GitHub Templates | 2 | Issue and PR templates |
| Test Site | 10 | Optional integration testing |
| Project Root | 3 | Gitignore, package.json, README |
| Placeholders | 2 | .gitkeep files for empty dirs |
| **Total** | **27** | **Complete project structure** |

---

## Important Notes

1. **No Git Hooks:** All files in `.claude/hooks/` are Claude Code hooks, NOT git hooks. There is no automation triggered by git operations.

2. **Manual Workflow:** Everything is manual:
   - User runs `npx agentic15 task next`
   - User tells Claude to code
   - User runs `npx agentic15 commit`
   - User merges PR on GitHub

3. **Optional Features:**
   - GitHub integration (configure in `.claude/settings.local.json`)
   - Test site (delete `test-site/` if not needed)
   - Visual testing (use `npx agentic15 visual-test` when needed)

4. **Upgradeable:** Run `npx agentic15 upgrade` to update framework files without affecting your code.

---

**Package Version:** 4.0.5
**Last Updated:** 2025-12-27
