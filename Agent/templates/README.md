# {{PROJECT_NAME}}

Created with [Agentic15 Claude Zen](https://github.com/agentic15/claude-zen)

## Quick Start

```bash
# Setup authentication
npx agentic15 auth

# Create plan
npx agentic15 plan "Build your feature"

# Tell Claude to create plan, then lock it
npx agentic15 plan

# Start first task
npx agentic15 task next

# Tell Claude to write code

# Test and commit
npm test
npx agentic15 commit

# Merge PR on GitHub

# Repeat
npx agentic15 task next
```

## Commands

- `npx agentic15 auth` - Setup GitHub authentication
- `npx agentic15 plan "description"` - Generate plan requirements
- `npx agentic15 plan` - Lock plan and create tasks
- `npx agentic15 task next` - Start next task
- `npx agentic15 task start TASK-XXX` - Start specific task
- `npx agentic15 commit` - Test, commit, push, create PR
- `npx agentic15 status` - Check progress
- `npm test` - Run tests

## Workflow

1. **Plan** → `npx agentic15 plan "description"`
2. **Create** → Tell Claude: "Create the project plan"
3. **Lock** → `npx agentic15 plan`
4. **Task** → `npx agentic15 task next`
5. **Code** → Tell Claude: "Write code for TASK-XXX"
6. **Test** → `npm test`
7. **Ship** → `npx agentic15 commit`
8. **Repeat** → Steps 4-7 for each task

## Directory Structure

```
.
├── .claude/              # Framework config
│   ├── plans/            # Project plans and tasks
│   └── settings.json     # Claude permissions
├── Agent/                # Your code
│   ├── src/              # Source files
│   └── tests/            # Test files
└── package.json
```

## Documentation

See [WORKFLOWS.md](https://github.com/agentic15/claude-zen/blob/main/WORKFLOWS.md) for complete workflows with diagrams.

## Your Code

Write your source code in `Agent/src/` and tests in `Agent/tests/`.
