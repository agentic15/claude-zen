# Architecture Overview

**High-level architecture and design philosophy of Agentic15 Claude Zen**

This document provides a comprehensive view of how Agentic15 Claude Zen is structured and how its components interact.

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [System Architecture](#system-architecture)
3. [Component Interaction](#component-interaction)
4. [Data Flow](#data-flow)
5. [Extension Points](#extension-points)

---

## Design Philosophy

### Core Principles

**1. Quality Over Speed**
```
Every commit must meet quality standards
Hooks enforce testing, no exceptions
"Ship with Confidence" means real confidence
```

**2. Simplicity Over Complexity**
```
Single clear workflow, not multiple options
Flat directory structure where possible
Convention over configuration
```

**3. Intelligence With Guardrails**
```
AI agents empowered to write code
Humans maintain control via plans and reviews
Hooks prevent dangerous operations
```

**4. Transparency**
```
All actions logged and auditable
Plan changes tracked with reasons
Progress visible at all times
```

### Architectural Goals

**Enforceability**
- Quality standards enforced by hooks
- Impossible to bypass without explicit override
- Violations blocked before damage occurs

**Scalability**
- Smart testing for large codebases (43,000+ lines)
- Hierarchical plans for complex projects
- Modular hook system

**Maintainability**
- SOLID principles throughout
- Single responsibility per module
- Dependency injection for testability

**Usability**
- Clear error messages
- Helpful documentation
- Progressive disclosure of complexity

---

## System Architecture

### High-Level View

```
┌─────────────────────────────────────────────────────────┐
│                    User/AI Agent                         │
└────────────┬────────────────────────────────────────────┘
             │
             │ CLI Commands / Code Changes
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│              Agentic15 Claude Zen Framework              │
│  ┌───────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  CLI Scripts  │  │   Templates  │  │   Git Hooks  │ │
│  │               │  │              │  │              │ │
│  │ • plan:*      │  │ • .claude/   │  │ • PreToolUse │ │
│  │ • task:*      │  │ • Agent/     │  │ • PostToolUse│ │
│  │ • init        │  │ • test-site/ │  │              │ │
│  └───────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│          │                  │                  │         │
│          └──────────────────┼──────────────────┘         │
│                             │                            │
│          ┌──────────────────▼──────────────────┐        │
│          │         Core Engine                 │        │
│          │  ┌────────────────────────────────┐ │        │
│          │  │  • ProjectInitializer          │ │        │
│          │  │  • PlanManager                 │ │        │
│          │  │  • TaskManager                 │ │        │
│          │  │  • HookInstaller               │ │        │
│          │  │  • TemplateManager             │ │        │
│          │  └────────────────────────────────┘ │        │
│          └─────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────┘
             │
             │ File System Operations
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│                    Project Files                         │
│  • .claude/plans/           (Immutable after lock)       │
│  • Agent/src/               (User writes here)           │
│  • Agent/tests/             (Tests required)             │
│  • test-site/               (UI integration)             │
└─────────────────────────────────────────────────────────┘
```

### Component Layers

**Layer 1: User Interface**
- CLI commands (`npm run task:start`)
- Human interactions (reviewing, approving)
- AI agent operations (writing code, tests)

**Layer 2: Framework Core**
- Plan management (create, lock, amend)
- Task tracking (start, complete)
- Hook execution (validate, enforce)
- Template processing (copy, customize)

**Layer 3: Storage**
- File system (plans, tasks, code)
- Git repository (version control, audit)

---

## Component Interaction

### 1. Project Initialization

```
User                  Framework               File System
  │                       │                        │
  │ npx create-...        │                        │
  ├──────────────────────>│                        │
  │                       │ Create directories     │
  │                       ├───────────────────────>│
  │                       │                        │
  │                       │ Copy templates         │
  │                       ├───────────────────────>│
  │                       │                        │
  │                       │ Install hooks          │
  │                       ├───────────────────────>│
  │                       │                        │
  │                       │ Initialize git         │
  │                       ├───────────────────────>│
  │                       │                        │
  │ <Project created>     │                        │
  │<──────────────────────┤                        │
```

**Components involved:**
- `ProjectInitializer` - Orchestrates setup
- `TemplateManager` - Copies template files
- `HookInstaller` - Sets up git hooks
- `DependencyInstaller` - Runs npm install

### 2. Plan Creation & Locking

```
User            PlanManager        TaskManager        FileSystem
  │                 │                   │                  │
  │ plan:generate   │                   │                  │
  ├────────────────>│                   │                  │
  │                 │ Create requirements.txt              │
  │                 ├──────────────────────────────────────>│
  │                 │                   │                  │
  │ (Claude creates PROJECT-PLAN.json) │                  │
  │                 │                   │                  │
  │ plan:init       │                   │                  │
  ├────────────────>│                   │                  │
  │                 │ Validate plan     │                  │
  │                 │ Create tracker    │                  │
  │                 ├──────────────────>│                  │
  │                 │                   │ Write files      │
  │                 │                   ├─────────────────>│
  │                 │                   │                  │
  │                 │ Lock plan         │                  │
  │                 ├──────────────────────────────────────>│
  │                 │                   │                  │
  │ <Plan locked>   │                   │                  │
  │<────────────────┤                   │                  │
```

**Components involved:**
- `PlanManager` - Validates and locks plans
- `TaskManager` - Creates task tracker
- `Validator` - Checks plan schema
- `FileSystem` - Persists plan data

### 3. Task Execution

```
User       TaskManager    HookSystem    TestRunner    Git
  │            │              │             │          │
  │ task:start │              │             │          │
  ├───────────>│              │             │          │
  │            │ Validate     │             │          │
  │            │ Update state │             │          │
  │            │              │             │          │
  │ (Code + Tests written)    │             │          │
  │                           │             │          │
  │ git commit                │             │          │
  ├───────────────────────────┼────────────>│          │
  │                           │ PreToolUse  │          │
  │                           │<────────────┤          │
  │                           │ Validate    │          │
  │                           │             │          │
  │                           │ Run tests   │          │
  │                           ├────────────>│          │
  │                           │ <Results>   │          │
  │                           │<────────────┤          │
  │                           │             │          │
  │                           │ PostToolUse │          │
  │                           │ (auto-format, etc)     │
  │                           │             │          │
  │                           │             │ Commit   │
  │                           │             ├─────────>│
  │                           │             │          │
  │ task:done │              │             │          │
  ├───────────>│              │             │          │
  │            │ Validate completion        │          │
  │            │ Update tracker│             │          │
  │<───────────┤              │             │          │
```

**Components involved:**
- `TaskManager` - Lifecycle management
- `HookSystem` - Quality enforcement
- `TestRunner` - Execute tests
- `GitClient` - Version control

### 4. Hook Execution Flow

```
Tool Use          HookSystem        Individual Hooks     Validator
  │                   │                    │                │
  │ Write/Edit/Commit │                    │                │
  ├──────────────────>│                    │                │
  │                   │ Load hooks config  │                │
  │                   │                    │                │
  │                   │ PreToolUse         │                │
  │                   ├───────────────────>│                │
  │                   │                    │ Validate       │
  │                   │                    ├───────────────>│
  │                   │                    │ <Result>       │
  │                   │                    │<───────────────┤
  │                   │ <Pass/Fail>        │                │
  │                   │<───────────────────┤                │
  │                   │                    │                │
  │                   │ (If passed)        │                │
  │                   │ Execute tool       │                │
  │                   │                    │                │
  │                   │ PostToolUse        │                │
  │                   ├───────────────────>│                │
  │                   │                    │ Auto-format    │
  │                   │                    │ Validate       │
  │                   │                    │                │
  │                   │ <Complete>         │                │
  │                   │<───────────────────┤                │
  │ <Result>          │                    │                │
  │<──────────────────┤                    │                │
```

**Components involved:**
- `HookSystem` - Orchestrates hook execution
- `HookLoader` - Loads hook configuration
- Individual hooks - Specific validations
- `Validator` - Common validation logic

---

## Data Flow

### Plan Data Flow

```
PROJECT-REQUIREMENTS.txt
    │
    │ (Human/AI creates plan)
    ▼
PROJECT-PLAN.json
    │
    │ (plan:init validates & locks)
    ▼
┌───────────────────────────────────────┐
│ TASK-TRACKER.json                     │
│ • Overall progress                    │
│ • Task states                         │
│ • Time tracking                       │
└───────────────────────────────────────┘
    │
    │ (Splits into individual tasks)
    ▼
┌───────────────────────────────────────┐
│ tasks/TASK-XXX.json (one per task)    │
│ • Task details                        │
│ • Files to modify                     │
│ • Completion criteria                 │
└───────────────────────────────────────┘
    │
    │ (task:start, task:done updates)
    ▼
┌───────────────────────────────────────┐
│ TASK-TRACKER.json (updated)           │
│ • Status: pending → in_progress       │
│ •         in_progress → completed     │
│ • Time spent                          │
└───────────────────────────────────────┘
```

### Code Change Flow

```
User/Agent writes code
    │
    ▼
Agent/src/Component.jsx
    │
    ▼
Agent/tests/Component.test.jsx
    │
    ▼
test-site/src/Component.jsx
    │
    │ (git commit triggered)
    ▼
PreToolUse Hooks
    │
    ├─> validate-git-workflow
    ├─> enforce-plan-template
    └─> (others)
    │
    │ (If all pass)
    ▼
Commit Staged
    │
    ▼
PostToolUse Hooks
    │
    ├─> auto-format
    ├─> validate-test-quality
    ├─> validate-test-results
    ├─> validate-ui-integration
    └─> (others)
    │
    │ (If all pass)
    ▼
Commit Accepted
    │
    ▼
Git Repository
```

---

## Extension Points

### Custom Hooks

**Add custom validation hooks:**

```javascript
// .claude/hooks/custom-validation.js
module.exports = function(toolData) {
  const { tool_name, tool_input } = toolData;

  // Your validation logic
  if (needsValidation) {
    if (isValid) {
      process.exit(0); // Allow
    } else {
      console.error('Validation failed');
      process.exit(2); // Block
    }
  }

  process.exit(0); // Allow by default
};
```

**Register in settings.json:**

```json
{
  "hooks": {
    "postToolUse": [
      ".claude/hooks/custom-validation.js"
    ]
  }
}
```

### Custom Templates

**Override default templates:**

```bash
# Copy default template
cp -r node_modules/.agentic15/templates/Agent ./custom-templates/

# Modify as needed
vim ./custom-templates/Agent/src/index.js

# Use custom template
export AGENTIC15_TEMPLATE_DIR=./custom-templates
npx create-agentic15-claude-zen my-project
```

### Custom Scripts

**Add project-specific scripts:**

```javascript
// scripts/custom-deploy.js
#!/usr/bin/env node

const { execSync } = require('child_process');

// Custom deployment logic
console.log('🚀 Deploying to production...');

execSync('npm run build', { stdio: 'inherit' });
execSync('docker build -t myapp .', { stdio: 'inherit' });
execSync('docker push myapp', { stdio: 'inherit' });

console.log('✅ Deployed successfully');
```

**Register in package.json:**

```json
{
  "scripts": {
    "deploy": "node scripts/custom-deploy.js"
  }
}
```

### Plugin System (Future)

**Planned for future releases:**

```javascript
// plugins/slack-notifications.js
module.exports = {
  name: 'slack-notifications',
  version: '1.0.0',

  onTaskComplete: async (task) => {
    await sendSlackMessage(`Task ${task.id} completed!`);
  },

  onPlanComplete: async (plan) => {
    await sendSlackMessage(`Plan ${plan.id} completed! 🎉`);
  }
};
```

---

## Performance Considerations

### Smart Testing

**Problem:** Large codebases slow down commits

**Solution:** Test only changed files during git hooks

**Impact:**
- 45s → 2s commit time
- 95% time savings
- No quality compromise

### Hook Optimization

**Hooks are obfuscated and bundled:**
- Faster execution (no require() overhead)
- Smaller file size
- Protected intellectual property

**Caching:**
- Plan validation cached
- Schema validation cached
- Repeated operations optimized

### File System Operations

**Batched operations:**
- Read multiple files in parallel
- Write operations grouped
- Minimize disk I/O

---

## Security Considerations

### Immutability

**Plans locked after initialization:**
- Prevents accidental modifications
- Ensures audit trail integrity
- Amendments explicitly tracked

### Permission System

**Strict file access:**
- Agents can only write to `Agent/` and `scripts/`
- Framework files (`.claude/`) read-only
- Database operations write-only (scripts)

### Hook Validation

**Hooks cannot be bypassed easily:**
- Configured in Claude Code settings
- Blocks occur before damage
- `--no-verify` discouraged

---

## Scalability

### Large Projects

**Tested with:**
- 43,000+ lines of code
- 500+ test files
- 120+ tasks in plan

**Strategies:**
- Hierarchical plans (Project → Subproject → Milestone → Task)
- Smart testing (changed files only)
- Parallel hook execution
- Cached validations

### Team Collaboration

**Multi-developer support:**
- Task-based workflow prevents conflicts
- Clear ownership via task assignments
- Audit trail tracks all changes
- PR integration supported

---

## Future Architecture

### Planned Enhancements

**1. Plugin System**
- Extensible hook system
- Third-party integrations
- Custom validators

**2. Cloud Sync**
- Sync plans across devices
- Team collaboration features
- Progress dashboards

**3. AI Agent Improvements**
- Multi-agent task parallelization
- Intelligent task splitting
- Automatic dependency detection

**4. Analytics**
- Estimate accuracy tracking
- Productivity metrics
- Bottleneck detection

---

## Summary

**Architecture Highlights:**

**Layered Design:**
- User Interface (CLI, humans, AI)
- Framework Core (plans, tasks, hooks)
- Storage (file system, git)

**SOLID Principles:**
- Single responsibility per component
- Open for extension, closed for modification
- Dependency injection throughout

**Quality Enforcement:**
- Git hooks validate all changes
- Smart testing scales to large codebases
- Immutability guarantees integrity

**Extension Points:**
- Custom hooks
- Custom templates
- Custom scripts
- Plugin system (future)

---

**Copyright 2024-2025 Agentic15**
Licensed under the Apache License, Version 2.0
