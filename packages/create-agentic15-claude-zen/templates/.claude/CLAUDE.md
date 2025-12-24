# Structured Coding Project
**Version:** 1.4.0
**Last Updated:** 2025-12-23
**Package:** agentic15-claude-zen

## Communication Protocol
- Keep responses under 10 lines (brief summaries only)
- If user asks specific question, answer ONLY that question
- No examples, walls of text, or comprehensive explanations unless requested
- Ask "want details?" if answer requires more than 10 lines
- If making in-memory promise/correction, state: "IN MEMORY: WILL BE LOST ON CONTEXT CHANGE"

## Your Job
Write source code and tests. Run them. Fix them. That's it.

## What You Can Do
- Read any file (full codebase visibility)
- Modify files in `./Agent/` directory (all source, tests, migrations, db)
- Modify files in `./scripts/` directory (server scripts, utilities)
- Run npm scripts (build, test, lint)
- Commit and push to main branch

## What You Cannot Do (Hard Blocked)
- Modify ANY files outside `./Agent/` and `./scripts/` directories (BLOCKED)
- Execute scripts in `./scripts/` or `./Agent/db/` (BLOCKED - human executes only)
- Modify documentation files (.md files in `./docs/` are DENIED)
- EDIT project plans once created (can Write initial plan, but Edit is BLOCKED)
- EDIT project plans once locked (hooks enforce immutability after lock)
- Modify .env or config files without asking
- Edit existing migration files (migrations are immutable once created)
- Run database CLI commands directly (psql, mysql, mongosh DENIED)
- Write code without an active task (task tracker enforced)
- Force push
- Install dependencies without asking
- Access external networks (curl, wget DENIED)

## Git Workflow (Hard Enforced by Hooks)
**All work happens directly on main branch.** Task IDs in commit messages help track changes.

### With Structured Development (Recommended):
1. Start task: `npm run task:start TASK-001`
2. Write code on main branch
3. Run tests
4. Commit frequently: `git commit -m "[TASK-001] Description"`
5. Push to remote: `git push origin main`
6. Complete task: `npm run task:done TASK-001`

### Without Structured Development:
1. Work on main branch
2. Write code
3. Run tests
4. Commit: `git commit -m "Description"`
5. Push: `git push origin main`

**Note:** All commits reference task IDs for traceability. No branching required.

## Before Every Commit (Hard Enforced)
- Tests MUST pass (validated by hooks)
- Tests MUST contain real assertions (validated by hooks)
- Tests MUST NOT be empty/fake (validated by hooks)
- Code MUST be formatted (auto-formatted by hooks)

**⚡ SMART TESTING:**
- Hooks test ONLY changed/staged files (fast for 43,000+ line codebases)
- Manual `npm test` runs full test suite
- Changed source files (Agent/src/) automatically test related test files
- Prevents infinite loops on large projects

## Commands Available
- `/commit-commands:commit` - Stage and commit to main branch

## Architecture
All source code and tests are in `./Agent/` directory.

**Agent Directory Structure:**
- `./Agent/src/` - Source code
- `./Agent/tests/` - Test files
- `./Agent/spec/` - Spec files (if using spec-based testing)
- `./Agent/migrations/` - Database migration files (immutable once created)
- `./Agent/db/` - Database scripts (Claude writes, human executes)
- `./Agent/prisma/` - Prisma schema and migrations (if using Prisma)

**Scripts Directory:**
- `./scripts/` - Server startup scripts, utilities, deployment scripts
- Claude can READ/WRITE scripts
- Human EXECUTES scripts (Claude cannot run node ./scripts/** or bash ./scripts/**)

## Critical Rules (Enforced by Hooks)
- NEVER work from memory - always read files first
- NEVER duplicate code - check existing implementations
- NEVER write fake/empty tests - hooks will block them
- NEVER write tests without assertions - hooks will block them
- NEVER skip failing tests - hooks will block commits
- NEVER create .md files - permission system blocks them

## How Hooks Protect You
- PreToolUse hook validates git workflow before execution
- PostToolUse hook auto-formats code after edits
- PostToolUse hook validates test quality (blocks fake tests)
- PostToolUse hook validates UI component tests (blocks API-only tests)
- PostToolUse hook validates database changes (blocks direct schema edits)
- PostToolUse hook analyzes migration impact (warns about breaking changes)
- PostToolUse hook validates test results (blocks failures)
- PostToolUse hook enforces test pyramid (warns on missing UI tests)
- PostToolUse hook enforces migration workflow (blocks unsafe migrations)
- SessionStart hook reminds you of current context
- Permission system blocks dangerous operations

## UI Testing Requirements (Hard Enforced)
When modifying UI components (.tsx, .jsx, .vue, .svelte):
- Component test file MUST exist
- Test MUST import and render the component
- Test MUST provide required props
- Test MUST simulate user events (clicks, inputs)
- Test MUST mock API calls if component uses them
- Test MUST validate state changes if component has state
- E2E tests REQUIRED for multi-component user flows

## Integration Test Website (Hard Enforced)

UI components MUST be integrated into a test website for stakeholder validation before production deployment.

### Purpose
Integration test websites allow stakeholders to:
- Preview UI components in realistic scenarios
- Interact with components using actual data
- Validate behavior and design before production
- Test responsiveness across devices
- Approve UX flows and visual design

### Requirements
When modifying UI components (.tsx, .jsx, .vue, .svelte):
1. **Test site directory MUST exist** at `./test-site/` (or configured path)
2. **Test site MUST have package.json** with dev script
3. **Component SHOULD be imported** in test site for validation
4. Test site should run locally with hot reload

### Workflow

#### 1. Initial Setup (One-Time)
```bash
# Test site is included in project template
cd test-site
npm install
```

#### 2. Add Components to Test Site
Edit `test-site/src/App.jsx` to import and render your component:

```jsx
// Import your component
import { Button } from '../Agent/src/components/Button'

function App() {
  return (
    <section className="demo-section">
      <h2>Button Component</h2>
      <p>Validation: Click handlers, variants, disabled state</p>
      <Button onClick={() => alert('Clicked!')} variant="primary">
        Primary Button
      </Button>
      <Button variant="secondary">Secondary</Button>
      <Button disabled>Disabled</Button>
    </section>
  )
}
```

#### 3. Run Test Site Locally
```bash
cd test-site
npm run dev
```

Opens at http://localhost:3000 with hot reload.

#### 4. Share with Stakeholders

**Option A: Deploy to GitHub Pages**
```bash
cd test-site
npm run deploy
```

Share URL: `https://username.github.io/repo-name/`

**Option B: Local Network**
Run `npm run dev` and share your local IP:
```
http://192.168.1.XXX:3000
```

**Option C: Tunneling (ngrok)**
```bash
npx ngrok http 3000
```

Share the generated public URL.

#### 5. Collect Feedback
- Schedule live demo sessions
- Record video walkthroughs
- Use GitHub Issues for feedback
- Create approval checklists

### Best Practices

**Use Realistic Data**
```jsx
// Good: Realistic data stakeholders recognize
<UserCard name="John Smith" email="john@company.com" role="Manager" />

// Bad: Placeholder text
<UserCard name="Test User" email="test@test.com" role="User" />
```

**Show Multiple States**
```jsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button disabled>Disabled</Button>
<Button loading>Loading...</Button>
```

**Test Edge Cases**
```jsx
<UserName name="Really Long Name That Might Wrap To Multiple Lines" />
<UserName name="" /> {/* Empty state */}
<ErrorMessage>Network connection lost. Please try again.</ErrorMessage>
```

**Group by Feature**
```jsx
<section className="checkout-flow">
  <h2>Checkout Flow</h2>
  <p>Validation: Cart → Shipping → Payment → Confirmation</p>
  <ShoppingCart />
  <ShippingForm />
  <PaymentForm />
</section>
```

**Add Annotations**
```jsx
<div className="demo-section">
  <h2>Login Form</h2>
  <p><strong>Validation Points:</strong></p>
  <ul>
    <li>Email validation works correctly</li>
    <li>Password toggle shows/hides password</li>
    <li>Error messages display properly</li>
    <li>Submit button disables during API call</li>
  </ul>
  <LoginForm />
</div>
```

### Configuration

Test site requirement can be disabled in `.claude/settings.json`:
```json
{
  "testing": {
    "ui": {
      "requireIntegrationSite": false
    }
  }
}
```

Or configure custom directory:
```json
{
  "testing": {
    "ui": {
      "integrationSiteDir": "demo-site"
    }
  }
}
```

### Troubleshooting

**Components Not Found**
- Check import path relative to `test-site/src/`
- Verify components are exported properly
- Ensure file extensions match (.jsx, .tsx)

**Styles Not Working**
- Import component CSS alongside components
- Configure Tailwind/styled-components if used
- Check CSS module naming conventions

**Hot Reload Issues**
- Save files to trigger reload
- Check terminal for build errors
- Restart dev server: `Ctrl+C` then `npm run dev`

**Deployment Fails**
- Ensure GitHub Pages enabled in repo settings
- Check `gh-pages` branch exists
- Verify base path in `vite.config.js`

### Framework Support

**React (Default)**
Template uses Vite + React with hot reload.

**Vue**
See `test-site/README.md` for Vue migration guide.

**Svelte**
See `test-site/README.md` for Svelte migration guide.

## Database Migration Requirements (Hard Enforced)
Database changes MUST follow migration workflow:
- WRITE migration files in `./Agent/migrations/` or `./Agent/prisma/migrations/`
- WRITE database scripts in `./Agent/db/` (setup, seed, backup scripts)
- NEVER edit existing migrations (migrations are immutable once created)
- NEVER run database CLI (psql, mysql, mongosh BLOCKED)
- NEVER execute scripts (node ./Agent/db/** is BLOCKED)
- Human executes database scripts, Claude only writes them
- ALWAYS create new migration scripts:
  - TypeORM: npm run migration:generate -- -n YourChange
  - Prisma: npx prisma migrate dev --name your-change
  - Sequelize: npx sequelize-cli migration:generate --name your-change
- ALWAYS update code/tests affected by schema changes
- ALWAYS run tests after migrations to verify compatibility
- Breaking changes (DROP/RENAME) require updating ALL affected code first

## Structured Development Workflow (Hard Enforced)

### Phase 1: Planning (Before Lock - Agent Creates Plan)
**Human Role:**
1. Provide requirements: features, goals, constraints, acceptance criteria
2. Review agent's proposed plan
3. Request changes or approve plan
4. Lock the plan when satisfied: `npm run plan:init`

**Agent Role:**
1. Analyze human requirements
2. Create PROJECT-PLAN.json in `.claude/plans/PLAN-ID/`
   - Choose structure: Flat or Hierarchical (Project → Subproject → Milestone → Task)
   - Break down work into tasks with IDs: TASK-001, TASK-002, etc.
   - Assign phases: design, implementation, testing, deployment
   - Estimate hours and define dependencies
3. Present plan to human for review (summary + full breakdown)
4. Revise plan based on human feedback (iterate until approved)
5. DO NOT lock the plan - only human can lock

**Key Point:** Agent creates and refines the plan. Human reviews, requests changes, and approves/locks.

### Phase 2: Lock the Plan (One-Time Action by Human)
1. Human runs: `npm run plan:init`
2. System generates:
   - `.claude/plans/PLAN-ID/TASK-TRACKER.json` (tracks task states)
   - `.claude/plans/PLAN-ID/tasks/TASK-XXX.json` (individual task files)
   - `.claude/plans/PLAN-ID/.plan-locked` (immutability marker)
3. Plan becomes IMMUTABLE (cannot be edited directly by anyone)
4. Amendments require tool: `npm run plan:amend` (creates audit trail)

### Phase 3: Execution (After Lock - Immutable Plan)
**Human Role:**
1. Start a task: `npm run task:start TASK-001`
2. Monitor progress: `npm run task:status`
3. Complete task: `npm run task:done TASK-001`
4. Request amendments if needed: `npm run plan:amend`

**Agent Role:**
1. Work directly on main branch (no branching required)
2. Write code in `Agent/` directory (blocked if no active task)
3. Run tests and fix issues
4. Commit changes frequently with task ID reference (REQUIRED)
5. Push to remote regularly
6. When task complete, ensure all changes committed
7. Make amendments via tool when human requests

**Git Workflow (HARD ENFORCED):**
1. **All work on main branch:** No branching required
2. **During development:** Commit regularly with descriptive messages
3. **Commit message format:** `[TASK-XXX] Description of changes`
4. **When task done:** All changes must be committed before marking complete
5. **Push regularly:** `git push origin main` to backup work
6. **No merging needed:** Everything stays on main branch

**System Role:**
1. Enforce active task requirement (hard block)
2. Validate dependencies before task start
3. Track time and progress automatically
4. Log all amendments with timestamp and reason

### Task Tracking Rules (Hard Enforced):
- ONE task active at a time (system enforced)
- Code changes in `Agent/` require active task (hook blocks Write/Edit)
- Commit messages should reference task ID (recommended)
- Tasks cannot be restarted once completed (system enforced)
- Dependencies must be completed first (HARD BLOCK - system checks on task:start)
- **Sequence validation:** Warns if skipping earlier tasks in same phase (5-second delay to cancel)
- **Phase order validation:** Warns if starting later phase with incomplete earlier phases (5-second delay to cancel)
- Progress tracked automatically in TASK-TRACKER.json
- Plan IMMUTABLE once locked - amendments only via tool with audit trail
- Active plan tracked in `.claude/ACTIVE-PLAN` file

## Token Optimization
- Prompt caching enabled
- Output limited to 8192 tokens
- Non-essential model calls disabled
- Context loaded only when needed
