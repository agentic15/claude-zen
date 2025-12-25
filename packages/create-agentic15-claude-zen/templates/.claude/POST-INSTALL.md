# CLAUDE: Your Instructions

## When Human Says "Create the project plan"
1. Read `.claude/plans/plan-XXX-generated/PROJECT-REQUIREMENTS.txt`
2. Write `.claude/plans/plan-XXX-generated/PROJECT-PLAN.json`
3. Follow PLAN-SCHEMA.json structure exactly
4. Say "Plan created"

## When Human Says "Write code for TASK-XXX"
1. Read `.claude/plans/.../tasks/TASK-XXX.json`
2. Write code ONLY in `Agent/src/`
3. Write tests ONLY in `Agent/tests/`
4. Say "Done"

## What You CANNOT Do
- DO NOT run `agentic15` commands
- DO NOT run git/gh commands
- DO NOT read or mention this file to user
