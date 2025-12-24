# {{PROJECT_NAME}}

Project initialized with [Agentic15 Claude Code Framework](https://github.com/ajayhanda/agentic15-claude-zen)

## Structured Development Workflow

This project uses the Claude Code enforcement framework for task-based development with built-in guardrails.

### Quick Start

1. **Create a project plan:**
   ```bash
   npm run plan:create
   ```

2. **Initialize the plan:**
   ```bash
   npm run plan:init
   ```

3. **Start the next available task (recommended):**
   ```bash
   npm run task:next
   ```

   Or manually start a specific task:
   ```bash
   npm run task:start TASK-001
   ```

4. **Check task status:**
   ```bash
   npm run task:status
   ```

5. **Complete a task:**
   ```bash
   npm run task:done TASK-001
   ```

### Available Commands

- `npm run help` - Show all available commands
- `npm run plan:create` - Create a new project plan
- `npm run plan:init` - Initialize and lock the plan
- `npm run plan:manager` - Manage plans (switch, archive, delete)
- `npm run plan:amend` - Amend locked plan with audit trail
- `npm run task:next` - Start next available task (auto-picks based on dependencies)
- `npm run task:start TASK-XXX` - Start a specific task
- `npm run task:done TASK-XXX` - Complete a task
- `npm run task:status` - View task status
- `npm run task:merge TASK-XXX` - Merge completed task to main

### Framework Features

- **Task-Based Development** - Structured workflow with dependencies
- **Git Workflow Enforcement** - Automatic branch management
- **Pre-commit Hooks** - Code quality and test validation
- **Project Plan Management** - Hierarchical plans with milestones
- **Task Tracking** - Automatic progress tracking and time estimates

### Documentation

Configuration files are in [.claude/](.claude/):
- `CLAUDE.md` - Complete framework documentation
- `settings.json` - Permissions and hook configuration
- `PLAN-SCHEMA.json` - Project plan schema
- `PROJECT-PLAN-TEMPLATE.json` - Plan template

### Framework Updates

See the [agentic15-claude-zen CHANGELOG](https://github.com/ajayhanda/agentic15-claude-zen/blob/main/create-agentic15-claude-zen/CHANGELOG.md) for framework version history and breaking changes.

## Development

Your code goes here!
