# Directory Structure

Complete guide to the Agentic15 Claude Zen directory organization.

## Project Structure

```
your-project/
├── .claude/                    # Framework configuration (DO NOT EDIT)
│   ├── hooks/                  # Git hooks for enforcement
│   ├── plans/                  # Project plans and tracking
│   │   └── plan-001/
│   │       ├── PROJECT-PLAN.json
│   │       ├── TASK-TRACKER.json
│   │       ├── AMENDMENTS.json
│   │       ├── .plan-locked
│   │       └── tasks/
│   │           ├── TASK-001.json
│   │           └── ...
│   ├── ACTIVE-PLAN             # Current active plan ID
│   ├── CLAUDE.md               # Instructions for Claude Code
│   ├── ONBOARDING.md           # Detailed onboarding
│   ├── POST-INSTALL.md         # Post-installation guide
│   ├── PLAN-SCHEMA.json        # Plan structure schema
│   └── settings.json           # Claude Code hook configuration
├── Agent/                      # Your workspace (EDIT HERE)
│   ├── src/                    # Source code
│   ├── tests/                  # Test files
│   └── db/                     # Database scripts
├── scripts/                    # Build and deployment scripts
├── test-site/                  # Integration testing site (UI)
├── __mocks__/                  # Jest mock files
├── .babelrc                    # Babel configuration
├── .gitignore                  # Git ignore patterns
├── jest.config.js              # Jest configuration
├── jest.setup.js               # Jest setup
├── package.json                # Project dependencies
└── README.md                   # Project README
```

## Directory Purposes

### .claude/ (Framework Files)
**DO NOT EDIT** - Managed by framework

- **hooks/**: Git hooks that enforce quality
- **plans/**: All project plans and task tracking
- **settings.json**: Claude Code configuration

### Agent/ (Your Code)
**EDIT HERE** - Your workspace

- **src/**: All source code goes here
- **tests/**: All tests go here (required)
- **db/**: Database migration scripts (write only)

### test-site/ (UI Preview)
**UI Projects Only**

- Integration site for component previews
- Hot-reload development server
- Stakeholder demonstrations

---

**Copyright 2024-2025 Agentic15**
