# 🎯 POST-INSTALL INSTRUCTIONS FOR CLAUDE
**Version:** 1.1.0
**Last Updated:** 2025-12-25
**Package:** agentic15-claude-zen

**CRITICAL: Claude MUST follow these exact steps after package installation**

**🔗 NEW in v1.1.0:** GitHub Issues integration is now available! See section below for auto-create, auto-update, and auto-close features.

## ✅ 6-Step Setup Workflow

### STEP 1: Verify Directory Structure
```bash
ls -la
```

**Expected structure:**
```
./
├── .claude/          ✅ Framework configuration
├── Agent/            ✅ Your workspace (EDIT HERE)
├── scripts/          ✅ Your scripts (EDIT HERE)
├── test-site/        ✅ Integration testing site
├── node_modules/     ✅ Dependencies
├── package.json      ✅ Project config
└── README.md         ✅ Documentation
```

### STEP 2: Generate Project Plan
```bash
npm run plan:generate "Your project description here"
```

**What this does:**
- Creates `.claude/plans/plan-001-generated/PROJECT-REQUIREMENTS.txt`
- Claude MUST read this file and create `PROJECT-PLAN.json` in the same directory
- Follow the PLAN-SCHEMA.json structure exactly

### STEP 3: Set Active Plan
```bash
echo "plan-001-generated" > .claude/ACTIVE-PLAN
```

**CRITICAL:** This MUST be done BEFORE running plan:init in Step 4.

### STEP 4: Lock the Plan
```bash
npm run plan:init
```

**What this creates:**
- `.claude/plans/plan-001-generated/TASK-TRACKER.json` - Progress tracking
- `.claude/plans/plan-001-generated/tasks/TASK-XXX.json` - Individual task files
- `.claude/plans/plan-001-generated/.plan-locked` - Immutability marker

### STEP 5: Start First Task
```bash
npm run task:start TASK-001
```

**What this does:**
- Marks TASK-001 as "in_progress"
- Displays task details and requirements
- Sets up task tracking

### STEP 6: Work on the Task

**MANDATORY 9-STEP WORKFLOW:**
```
1. Read task file: .claude/plans/plan-001-generated/tasks/TASK-001.json
2. Read related files mentioned in task
3. Make changes ONLY in ./Agent/ or ./scripts/
4. Write/update tests with real assertions
5. Run tests: npm test (must pass)
   - Git hooks test ONLY changed files (fast)
   - Manual "npm test" runs FULL test suite (slow)
6. Commit: git commit -m "[TASK-001] Description"
7. Push: git push origin main
8. Verify ALL completion criteria met
9. Complete: npm run task:done TASK-001
```

**⚡ SMART TESTING (43,000+ line codebases):**
- Git hooks automatically detect changed files and run ONLY those tests
- Manual `npm test` by Claude or human runs complete test suite
- This prevents infinite loops and speeds up commits

## 🎨 UI COMPONENT WORKFLOW (CRITICAL FOR REACT/VUE/ANGULAR PROJECTS)

**If you're building UI components (.jsx, .tsx, .vue, .svelte), follow this workflow:**

### When Creating a UI Component:

**1. Create component in Agent/src/components/**
```bash
./Agent/src/components/Button.jsx
```

**2. Create component test (REQUIRED - will be BLOCKED otherwise)**
```bash
./Agent/tests/components/Button.test.jsx
```

Test MUST include:
- Import and render the component
- Test user interactions (clicks, inputs)
- Mock API calls if component uses them
- Test state changes
- Test props validation

**3. Add component to test-site (REQUIRED - will be BLOCKED otherwise)**
```bash
./test-site/src/components/Button.jsx
```

Purpose: Stakeholder preview with hot-reload

**4. Run tests**
```bash
npm test
```

**Example UI Component Workflow:**
```bash
# Create Button component
Write(./Agent/src/components/Button.jsx)

# Create Button test (BLOCKED without this)
Write(./Agent/tests/components/Button.test.jsx)

# Add to integration site (BLOCKED without this)
Write(./test-site/src/components/Button.jsx)

# Run tests
npm test

# Commit
git commit -m "[TASK-XXX] Add Button component with tests"
```

**Why test-site?**
- Allows stakeholders to preview components
- Hot-reload for rapid iteration
- Visual regression baseline
- Component showcase

## 🔗 GITHUB INTEGRATION (Optional)

**Automatically sync tasks with GitHub Issues for team collaboration and PR workflows.**

### Quick Setup (3 Steps)

**1. Create GitHub Personal Access Token**
- Go to: https://github.com/settings/tokens
- Click "Generate new token (classic)"
- Scopes needed: `repo` (Full control of private repositories)
- Copy the token (starts with `ghp_` or `github_pat_`)

**2. Configure Locally**
```bash
# Create local settings file (gitignored)
cat > .claude/settings.local.json << 'EOF'
{
  "github": {
    "enabled": true,
    "autoCreate": true,
    "autoUpdate": true,
    "autoClose": true,
    "token": "YOUR_GITHUB_TOKEN_HERE",
    "owner": "your-github-username",
    "repo": "your-repo-name"
  }
}
EOF
```

**3. Verify Configuration**
```bash
# Check if GitHub integration is active
cat .claude/settings.local.json
```

### What Gets Automated

✅ **Auto-Create Issues** - When you run `npm run task:start TASK-001`, creates GitHub issue #123
✅ **Auto-Update Status** - When you run `npm run task:done TASK-001`, updates issue labels
✅ **Auto-Close on Merge** - When PR merges to main, closes associated issues

### Configuration Options

**Disable Specific Features:**
```json
{
  "github": {
    "enabled": true,
    "autoCreate": true,    // Create issues on task start
    "autoUpdate": false,   // Don't update issues (manual control)
    "autoClose": true      // Close issues when merged
  }
}
```

**Completely Disable GitHub:**
```json
{
  "github": {
    "enabled": false
  }
}
```

### Environment Variables (Alternative)

For CI/CD or temporary use:
```bash
export GITHUB_TOKEN="ghp_your_token_here"
export GITHUB_OWNER="your-username"
export GITHUB_REPO="your-repo-name"
```

Priority: Environment Variables > settings.local.json > settings.json > auto-detect

### PR Workflow (Recommended)

**Enable branch protection to require PRs:**

1. GitHub → Settings → Branches → Add rule
2. Branch name: `main`
3. ✅ Require pull request before merging
4. ✅ Require approvals: 1
5. ✅ Require status checks to pass
6. Save changes

**Modified Workflow with PRs:**
```bash
# Create feature branch
git checkout -b feature/task-001

# Work on task
npm run task:start TASK-001
# ... make changes ...
npm test
git commit -m "[TASK-001] Description"
git push -u origin feature/task-001

# Create PR
gh pr create --title "[TASK-001] Description" --body "Closes #123"

# After approval and merge to main
# Post-merge hook automatically closes GitHub issue #123
```

### More Information

📖 **Full Guide:** See `docs/github-integration.md`
📖 **Branch Protection:** See `docs/github-setup.md`

### Graceful Degradation

**GitHub integration is OPTIONAL:**
- System works fully without GitHub
- If token missing/invalid, logs warning and continues
- Network failures don't block task workflow
- All GitHub operations fail gracefully

## 🚨 HARD RULES (Enforced by Hooks)

1. **NO work without active task**
   - Hooks will BLOCK Edit/Write in Agent/ without active task

2. **Work ONLY on main branch**
   - NO feature branches
   - NO pull requests
   - Direct commits to main

3. **Edit ONLY in allowed directories**
   - ✅ ALLOWED: ./Agent/**
   - ✅ ALLOWED: ./scripts/**
   - ❌ BLOCKED: Everything else

4. **Tests MUST pass before commit**
   - Hooks validate npm test exit code
   - Fake/empty tests are BLOCKED

5. **UI components MUST have tests**
   - Component test files required
   - Must render, test props, events, API mocks

## 📋 Quick Reference Commands

```bash
# Setup (Steps 2-5)
npm run plan:generate "description"
echo "plan-001-generated" > .claude/ACTIVE-PLAN
npm run plan:init
npm run task:start TASK-001

# During Work (Step 6)
npm test
git commit -m "[TASK-001] Description"
git push origin main
npm run task:done TASK-001

# Next Task
npm run task:next
```

## ⚠️  What NOT to Do

❌ Create feature branches
❌ Create pull requests
❌ Edit .md files (documentation)
❌ Edit .claude/ framework files
❌ Run scripts with node ./scripts/** (human executes)
❌ Run database CLI directly (psql, mysql, etc.)
❌ Force push (git push --force)
❌ Modify files outside ./Agent/ or ./scripts/

## 🎯 Complete Example

```bash
# STEP 2: Generate plan
npm run plan:generate "Build a calculator with add/subtract functions"

# Claude creates PROJECT-PLAN.json in .claude/plans/plan-001-generated/

# STEP 3: Set active plan (CRITICAL - do this BEFORE plan:init)
echo "plan-001-generated" > .claude/ACTIVE-PLAN

# STEP 4: Lock the plan
npm run plan:init

# STEP 5: Start first task
npm run task:start TASK-001
# Output: Starting TASK-001: Implement add function

# STEP 6: Work on task
# Read task
cat .claude/plans/plan-001-generated/tasks/TASK-001.json

# Write test
Write(./Agent/tests/calculator.test.js)

# Write code
Write(./Agent/src/calculator.js)

# Run tests
npm test

# Commit
git commit -m "[TASK-001] Implement add function with tests"
git push origin main

# Complete
npm run task:done TASK-001

# Next task
npm run task:next
```

## 📖 Additional Resources

- **Workflow details:** Read `.claude/ONBOARDING.md`
- **Permissions:** Read `.claude/settings.json`
- **Plan schema:** Read `.claude/PLAN-SCHEMA.json`

---

**This file is for Claude's reference. Human should read README.md instead.**
