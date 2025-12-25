# Black Box Test Findings - v2.0

## Test Date: 2025-12-25

## Test Methodology
Created brand new project following QUICK-START.md exactly as a user with zero knowledge of the system.

## Critical Bugs Discovered

### 🔴 BUG #1: agentic15 CLI Not Available (BLOCKER)

**Steps to Reproduce:**
```bash
node bin/create-agentic15-claude-zen.js workflow-test
cd workflow-test
agentic15 auth
```

**Expected:**
```
GitHub authentication setup wizard launches
```

**Actual:**
```
bash: agentic15: command not found
```

**Root Cause:**
1. CLI commands created in `src/cli/` folder
2. CLI binary defined in package.json: `"bin": { "agentic15": "./bin/agentic15.js" }`
3. BUT: CLI is NOT installed globally or locally during project creation
4. Template package.json doesn't include agentic15 as a dependency

**Impact:** ⚠️ **COMPLETE BLOCKER** - None of the v2.0 workflows work

**User Experience:**
- User follows QUICK-START.md
- First command fails immediately
- No way to proceed
- 100% failure rate

---

### 🔴 BUG #2: Template package.json Still Using v1.x (BLOCKER)

**File:** `templates/package.json`

**Current State (WRONG):**
```json
{
  "scripts": {
    "test": "jest",
    "plan:generate": "node node_modules/.agentic15-claude-zen/scripts/plan-generate.js",
    "plan:init": "node node_modules/.agentic15-claude-zen/scripts/plan-init.js",
    "setup:git-hooks": "node node_modules/.agentic15-claude-zen/scripts/setup-git-hooks.js"
  }
}
```

**Expected (v2.0):**
```json
{
  "scripts": {
    "test": "jest"
  },
  "dependencies": {
    "@agentic15.com/agentic15-claude-zen": "^2.0.0"
  }
}
```

**Root Cause:**
- Template package.json was never updated when creating v2.0
- Still references old npm scripts
- No dependency on agentic15 package

**Impact:** ⚠️ **BLOCKER** - Generated projects use v1.x structure

---

###  🟡 BUG #3: ProjectInitializer Doesn't Install CLI

**File:** `src/core/ProjectInitializer.js`

**Current:** Creates project, copies files, installs deps
**Missing:** Doesn't make `agentic15` command available

**What Should Happen:**
```javascript
// After project creation, install CLI globally OR locally
execSync('npm install -g .', { cwd: targetDir, stdio: 'inherit' });
// OR
// Make sure package.json has agentic15 in dependencies
```

**Impact:** 🟡 Medium - CLI not accessible after project creation

---

## What Actually Works

✅ POST-INSTALL.md is correct (18-line v2.0 version)
✅ Visual test hook copied correctly
✅ .claude/hooks/ directory created
✅ Git repository initialized
✅ Dependencies installed (Jest, React Testing Library, etc.)

## What Doesn't Work

❌ `agentic15 auth` - Command not found
❌ `agentic15 plan` - Command not found
❌ `agentic15 task next` - Command not found
❌ `agentic15 commit` - Command not found
❌ `agentic15 status` - Command not found

**Result:** 0% of v2.0 workflows functional

---

## Required Fixes

### Fix #1: Update Template package.json

**File:** `templates/package.json`

```json
{
  "name": "{{PROJECT_NAME}}",
  "version": "1.0.0",
  "description": "Project with Claude Code structured development framework",
  "type": "commonjs",
  "scripts": {
    "test": "jest"
  },
  "dependencies": {
    "@agentic15.com/agentic15-claude-zen": "^2.0.0"
  },
  "devDependencies": {
    "jest": "^30.2.0",
    "@testing-library/react": "^16.1.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/user-event": "^14.5.2",
    "@babel/preset-env": "^7.26.0",
    "@babel/preset-react": "^7.26.3",
    "babel-jest": "^30.0.0",
    "jest-environment-jsdom": "^30.0.0",
    "prop-types": "^15.8.1",
    "identity-obj-proxy": "^3.0.0",
    "@playwright/test": "^1.41.0"
  }
}
```

**Changes:**
- Remove `plan:generate`, `plan:init`, `setup:git-hooks` scripts
- Add `@agentic15.com/agentic15-claude-zen` to dependencies
- Add `@playwright/test` to devDependencies (for visual testing)

---

### Fix #2: Make CLI Available

**Option A: Local via npx**

Users run: `npx agentic15 auth` instead of `agentic15 auth`

**Option B: Global Installation**

In ProjectInitializer.js after project creation:
```javascript
// Install CLI globally
console.log('\n📦 Installing agentic15 CLI globally...');
execSync('npm install -g @agentic15.com/agentic15-claude-zen@2.0.0', { stdio: 'inherit' });
console.log('✅ agentic15 CLI installed globally');
```

**Option C: Local bin linking**

In ProjectInitializer.js after npm install:
```javascript
// Link local bin
execSync('npm link @agentic15.com/agentic15-claude-zen', { cwd: targetDir, stdio: 'inherit' });
```

**Recommendation:** Option A (npx) + update docs
- Simplest
- No global pollution
- Works immediately
- Just update QUICK-START.md to use `npx agentic15` everywhere

---

### Fix #3: Update All Documentation

**Files to Update:**
1. QUICK-START.md
2. WORKFLOW-COMMANDS.md
3. VISUAL-TESTING-WORKFLOW.md
4. MIGRATION-GUIDE-v2.md
5. README.md

**Change:**
```bash
# BEFORE
agentic15 auth

# AFTER
npx agentic15 auth
```

Apply to all commands in all docs.

---

## Testing the Fix

### Quick Fix Test (Without Modifying Code)

**Workaround for immediate testing:**

```bash
# In workflow-test project
cd /c/Agentic15/public/workflow-test

# Install agentic15 CLI manually
npm install @agentic15.com/agentic15-claude-zen@2.0.0

# Use npx to run commands
npx agentic15 auth
npx agentic15 plan "Build todo app"
npx agentic15 task next
npx agentic15 commit
npx agentic15 status
```

**Expected:** All commands should work via npx

---

## Severity Assessment

**Priority:** 🔴 **CRITICAL - P0**

**Impact:**
- v2.0 completely non-functional
- All workflow documentation invalid
- 100% failure rate for new users
- Cannot proceed past step 2 of QUICK-START.md

**User Impact:**
- Total blocker for anyone trying v2.0
- Confusion: docs say `agentic15 auth`, terminal says "command not found"
- Zero value delivery

**Business Impact:**
- v2.0 cannot be released in current state
- All testing and documentation efforts wasted without this fix
- Critical blocker for any v2.0 launch

---

## Recommended Action Plan

### Immediate (Today)

1. ✅ Document findings (this file)
2. ⏳ Update template package.json
3. ⏳ Choose CLI availability strategy (recommend npx)
4. ⏳ Update all documentation
5. ⏳ Re-test with new workflow-test project

### Before Release

1. ⏳ Full black box test following ALL workflows
2. ⏳ Test on fresh Windows machine
3. ⏳ Test on fresh Mac machine
4. ⏳ Test on fresh Linux machine
5. ⏳ Verify all commands in QUICK-START.md work
6. ⏳ Verify all workflows in WORKFLOW-COMMANDS.md work
7. ⏳ Verify visual testing workflow works

---

## Lessons Learned

1. **Always black box test new features** - We created CLI but never tested end-to-end
2. **Template files are critical** - Must be updated with implementation
3. **Documentation without implementation is useless** - Docs looked perfect but nothing worked
4. **npx is better than global install** - Simpler, cleaner, works everywhere
5. **Test as a dumb user** - Caught issue immediately on step 2

---

## Black Box Test Results (After Fixes)

### Test Execution: Workflow Test Project

**Setup:**
```bash
# Used local v2.0 package
npm install ../agentic15-claude-zen/packages/create-agentic15-claude-zen
```

**Commands Tested:**

| Command | Status | Notes |
|---------|--------|-------|
| `npx agentic15 auth` | ✅ WORKS | Shows git config, prompts for GitHub token |
| `npx agentic15 plan "description"` | ✅ WORKS | Creates PROJECT-REQUIREMENTS.txt |
| `npx agentic15 plan` (lock) | ✅ WORKS | Locks plan, creates task tracker |
| `npx agentic15 task next` | ✅ WORKS | Starts TASK-001, creates feature branch |
| `npx agentic15 commit` | ⚠️ PARTIAL | Tests pass, commit created, push fails (no remote) |
| `npx agentic15 status` | ✅ WORKS | Shows progress, current task, modified files |

**Workflow Test:**
1. ✅ Created project
2. ✅ Generated plan ("Build a simple todo app")
3. ✅ Created PROJECT-PLAN.json (simulated Claude)
4. ✅ Locked plan (4 tasks created)
5. ✅ Started TASK-001 (feature branch created)
6. ✅ Wrote Todo class and tests (simulated Claude)
7. ✅ Ran `npm test` (7 tests passed)
8. ✅ Ran `npx agentic15 commit` (tests passed, files staged, commit created)
9. ⚠️ Push failed (expected - no GitHub remote)
10. ✅ Checked status (shows current progress)

**Test Results:**
- **9/10 steps passed** ✅
- Only failure was GitHub push (expected without remote)
- All core workflows functional
- CLI commands work via `npx agentic15`

---

## Status

**Current State:** v2.0 CLI implementation **WORKS WITH WORKAROUND**
- CLI commands created ✅
- Documentation created ✅
- Template integration **NEEDS FIX** ⚠️
- CLI availability **WORKS VIA NPX** ✅

**Remaining Issues:**
1. Template package.json needs @agentic15.com/agentic15-claude-zen dependency
2. All documentation needs `npx agentic15` instead of `agentic15`
3. v2.0 not published to npm (local testing only)

**Next Steps:**
1. ✅ Verify workflows work (DONE - tested successfully)
2. ⏳ Update template package.json
3. ⏳ Update all documentation to use `npx agentic15`
4. ⏳ Publish v2.0 to npm
