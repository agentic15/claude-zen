---
name: agentic15:plan
description: Create and lock project plans for Agentic15 workflow
---

# agentic15:plan

Create and lock project plans for the Agentic15 workflow.

## Usage

**Generate a new plan:**
```
/agentic15:plan "Build a task management app with React"
```

**Lock an existing plan:**
```
/agentic15:plan
```

## What it does

### Generate Plan Mode (with requirements)
1. Creates `.claude/plans/plan-XXX-generated/` directory
2. Creates `PROJECT-REQUIREMENTS.txt` with your requirements
3. Sets the `ACTIVE-PLAN` pointer
4. Prompts you to tell Claude: "Create the project plan"

### Lock Plan Mode (no requirements)
1. Validates `PROJECT-PLAN.json` exists and is well-formed
2. Creates `TASK-TRACKER.json` from the plan tasks
3. Marks the plan as locked
4. Shows task count and next steps

## Error Handling

- **No requirements provided and no active plan**: You must provide requirements to generate a new plan
- **Plan already locked**: The current plan is already locked, start working on tasks
- **PROJECT-PLAN.json not found**: The plan file hasn't been created yet by Claude
- **Active plan exists**: You can't create a new plan while one is active

## Next Steps

After locking: `/agentic15:task-next` to start the first task
