# Migration Guide: v1.x → v2.0

## Overview

Version 2.0 introduces the `agentic15` CLI to simplify workflows and eliminate documentation confusion. This guide shows you what changed and how to migrate.

---

## What Changed?

### ✅ Improvements in v2.0

1. **Dedicated CLI** - All automation via `agentic15` commands
2. **Simplified Documentation** - 3 focused guides instead of 400+ lines
3. **Visual Testing Feedback Loop** - Claude can see and fix UI issues
4. **Auto-Generated Commits** - No more manual commit messages
5. **Streamlined Workflows** - 5 commands instead of 18+ npm scripts
6. **Clear Responsibilities** - Human (CLI) vs Claude (code) separation

### ❌ What Was Removed

1. **npm scripts** - `npm run task:*` replaced with `npx agentic15 task *`
2. **docs/ folder** - Moved to external website to prevent Claude confusion
3. **Manual git commands** - All handled by CLI
4. **Configuration options** - Zero config, just works

---

## Command Comparison

### Plan Management

| v1.x | v2.0 |
|------|------|
| `npm run plan:generate "desc"` | `npx agentic15 plan "desc"` |
| `npm run plan:init` | `npx agentic15 plan` (auto-detects state) |
| `npm run plan:create` | Removed (combined into above) |
| `npm run plan:manager` | Removed (use `npx agentic15 status`) |
| `npm run plan:amend` | Not implemented yet |

### Task Management

| v1.x | v2.0 |
|------|------|
| `npm run task:start TASK-001` | `npx agentic15 task start TASK-001` |
| `npm run task:next` | `npx agentic15 task next` |
| `npm run task:status` | `npx agentic15 status` |
| `npm run task:done` | Removed (auto-detected) |
| `npm run task:merge` | Removed (handled by git hooks) |

### Git & GitHub

| v1.x | v2.0 |
|------|------|
| `git checkout -b feature/task-001` | `npx agentic15 task next` (automatic) |
| `git add .` | `npx agentic15 commit` (automatic) |
| `git commit -m "message"` | `npx agentic15 commit` (auto-generated) |
| `git push origin feature/task-001` | `npx agentic15 commit` (automatic) |
| `gh pr create` | `npx agentic15 commit` (automatic) |
| Manual GitHub issue creation | `npx agentic15 task next` (automatic) |

### Testing

| v1.x | v2.0 |
|------|------|
| `npm test` | `npm test` (same) |
| Manual visual testing | `npx playwright test` |
| N/A | `node .claude/hooks/post-visual-test.js` (new) |

### Authentication

| v1.x | v2.0 |
|------|------|
| Manual `.claude/settings.local.json` edit | `npx agentic15 auth` |
| Manual GitHub token setup | `npx agentic15 auth` (interactive) |

---

## File Structure Changes

### Deleted Files (in template)

```
docs/                           # Entire folder deleted
├── getting-started/
├── workflows/
├── architecture/
└── github-integration.md       # 400+ lines removed

templates/package.json
  scripts: {
    "plan:generate": ...,       # REMOVED
    "plan:create": ...,         # REMOVED
    "plan:init": ...,           # REMOVED
    "plan:manager": ...,        # REMOVED
    "task:start": ...,          # REMOVED
    "task:done": ...,           # REMOVED
    "task:next": ...,           # REMOVED
    "task:status": ...,         # REMOVED
    "task:merge": ...,          # REMOVED
  }
```

### New Files

```
bin/agentic15.js                # CLI entry point
src/cli/
  ├── AuthCommand.js            # GitHub auth
  ├── TaskCommand.js            # Task management
  ├── CommitCommand.js          # Auto-commit workflow
  ├── StatusCommand.js          # Progress tracking
  └── PlanCommand.js            # Plan generation

templates/.claude/hooks/
  └── post-visual-test.js       # Visual testing feedback

QUICK-START.md                  # One-page cheat sheet
WORKFLOW-COMMANDS.md            # Complete workflow guide
VISUAL-TESTING-WORKFLOW.md     # UI testing guide
```

### Modified Files

```
templates/.claude/POST-INSTALL.md
  # BEFORE: 370+ lines
  # AFTER:  18 lines

templates/.claude/settings.json
  # NEW blocks:
  - Read(./.claude/POST-INSTALL.md)
  - Read(./docs/**)
  - Bash(agentic15 *)
  - Bash(git *)
  - Bash(gh *)

package.json
  # NEW:
  "bin": {
    "agentic15": "./bin/agentic15.js"
  }
  "dependencies": {
    "commander": "^12.1.0"
  }
```

---

## Migration Steps

### For New Projects (Recommended)

**Just use v2.0**:

```bash
npx @agentic15.com/agentic15-claude-zen@2.0.0 my-project
cd my-project
npx agentic15 auth
npx agentic15 plan "Build feature"
```

### For Existing v1.x Projects

#### Option 1: Fresh Start (Recommended)

Best for projects in early stages:

```bash
# Backup your Agent/ code
cp -r my-project/Agent /tmp/agent-backup

# Create new v2.0 project
npx @agentic15.com/agentic15-claude-zen@2.0.0 my-project-v2
cd my-project-v2

# Restore your code
cp -r /tmp/agent-backup/* Agent/

# Set up v2.0
npx agentic15 auth
npx agentic15 plan "Continue development"
```

#### Option 2: Update in Place (Advanced)

For projects with active branches and history:

```bash
cd my-project

# 1. Update package
npm uninstall @agentic15.com/agentic15-claude-zen
npm install @agentic15.com/agentic15-claude-zen@2.0.0

# 2. Configure CLI
npx agentic15 auth

# 3. Update package.json scripts
# Remove all task:* and plan:* scripts except:
#   - plan:generate (used internally)
#   - plan:init (used internally)
#   - setup:git-hooks (used internally)

# 4. Update .claude/POST-INSTALL.md
# Replace with 18-line version from template

# 5. Update .claude/settings.json
# Add new deny rules for agentic15, git, gh, docs

# 6. Install visual testing hook
mkdir -p .claude/hooks
cp node_modules/.agentic15-claude-zen/templates/.claude/hooks/post-visual-test.js .claude/hooks/

# 7. Continue development with v2.0 commands
npx agentic15 task next
```

---

## Workflow Changes

### Before (v1.x)

```bash
# 1. Generate plan
npm run plan:generate "Build calculator"

# 2. Tell Claude to create plan

# 3. Initialize plan
npm run plan:init

# 4. Start task
npm run task:start TASK-001

# 5. Tell Claude to write code

# 6. Test
npm test

# 7. Manual git workflow
git add .
git commit -m "[TASK-001] Implement add function"
git push origin feature/task-001

# 8. Manual PR creation
gh pr create --title "..." --body "..."

# 9. Mark task done
npm run task:done TASK-001

# 10. Merge branch
npm run task:merge TASK-001
```

**Commands**: 10+ steps, lots of manual work

### After (v2.0)

```bash
# 1. Generate and lock plan
npx agentic15 plan "Build calculator"

# 2. Tell Claude to create plan

# 3. Lock plan (auto-detects state)
npx agentic15 plan

# 4. Start task
npx agentic15 task next

# 5. Tell Claude to write code

# 6. Test and commit
npm test
npx agentic15 commit

# 7. Merge PR on GitHub

# 8. Repeat
npx agentic15 task next
```

**Commands**: 5 steps, mostly automated

---

## Breaking Changes

### 1. npm Scripts Removed

**Impact**: Scripts like `npm run task:start` no longer work

**Fix**: Use `npx agentic15 task start` instead

### 2. docs/ Folder Deleted

**Impact**: Internal documentation no longer available

**Fix**: Use new workflow guides:
- QUICK-START.md
- WORKFLOW-COMMANDS.md
- VISUAL-TESTING-WORKFLOW.md

### 3. Manual Commit Messages

**Impact**: Can't specify custom commit messages

**Fix**: Commits auto-generated as `[TASK-XXX] Task title`
- This is intentional for consistency
- No configuration option

### 4. Direct-to-Main Workflow

**Impact**: v1.x supported committing directly to main
v2.0 **requires** feature branches + PRs

**Fix**: Always creates feature branches
- `feature/task-001`, `feature/task-002`, etc.
- PRs required for code review
- Better for team collaboration

### 5. Claude Can't Read POST-INSTALL.md

**Impact**: Claude blocked from reading onboarding docs

**Fix**: This is intentional to prevent confusion
- POST-INSTALL.md reduced to 18 lines
- Only contains Claude's specific instructions
- Humans use QUICK-START.md instead

---

## New Features to Leverage

### 1. Visual Testing Feedback Loop

**Before**: Claude couldn't debug UI issues

**Now**:
```bash
npx playwright test
node .claude/hooks/post-visual-test.js
# Claude reads report, sees screenshots, fixes issues
```

### 2. Auto-Generated Commits

**Before**: Manual commit messages

**Now**: `[TASK-001] Implement add function` (automatic)

### 3. GitHub Integration

**Before**: Manual issue/PR creation

**Now**: `npx agentic15 commit` creates PRs and links issues

### 4. Task Auto-Queue

**Before**: `npm run task:next` (basic)

**Now**: `npx agentic15 task next` (smarter, creates branches, issues)

---

## Troubleshooting

### "agentic15: command not found"

```bash
# Reinstall package
npm install -g @agentic15.com/agentic15-claude-zen@2.0.0
```

### "npm run task:start not found"

You're using v1.x commands. Use:
```bash
npx agentic15 task start TASK-001
```

### "Claude is trying to run git commands"

Update `.claude/settings.json`:
```json
{
  "permissions": {
    "deny": [
      "Bash(git *)",
      "Bash(gh *)",
      "Bash(agentic15 *)"
    ]
  }
}
```

### "Visual tests failing but no screenshots"

Run the hook manually:
```bash
node .claude/hooks/post-visual-test.js
```

---

## Backward Compatibility

### What Still Works

✅ `npm test` - Jest tests run the same way
✅ `Agent/` directory structure - No changes
✅ Plan JSON schemas - Compatible with v1.x plans
✅ Task file format - Same structure
✅ Git hooks - Compatible

### What Breaks

❌ All `npm run task:*` commands
❌ All `npm run plan:*` commands (except internal ones)
❌ Direct main branch commits (now requires PRs)
❌ Manual commit messages
❌ Reading docs/ folder (deleted)

---

## Recommended Upgrade Path

### Low-Risk Projects (Early Development)

**Recommendation**: Fresh start with v2.0

1. Backup code
2. Create new v2.0 project
3. Copy code back
4. Continue development

**Time**: ~10 minutes

### Active Projects (Multiple Branches)

**Recommendation**: Update in place

1. Update package
2. Configure CLI
3. Clean up package.json scripts
4. Update .claude/ files
5. Continue development

**Time**: ~30 minutes

### Large Projects (Team Collaboration)

**Recommendation**: Staged migration

1. Finish current sprint on v1.x
2. Merge all branches to main
3. Update to v2.0 during sprint planning
4. Train team on new commands
5. Start next sprint with v2.0

**Time**: ~1 hour (includes team training)

---

## FAQ

**Q: Can I use v1.x and v2.0 in the same project?**
A: No. Pick one version.

**Q: Will my existing tasks/plans work in v2.0?**
A: Yes, task and plan JSON formats are compatible.

**Q: Can I customize commit messages in v2.0?**
A: No, they're auto-generated for consistency.

**Q: What if I don't want feature branches?**
A: v2.0 requires feature branches + PRs. Stay on v1.x if needed.

**Q: Is v1.x still supported?**
A: Bug fixes only. New features in v2.0 only.

---

## Support

- **Issues**: https://github.com/agentic15/claude-zen/issues
- **Discussions**: https://github.com/agentic15/claude-zen/discussions
- **Email**: support@agentic15.com

---

## Summary

v2.0 is a **major simplification** focused on:
- CLI automation (`agentic15` commands)
- Visual testing feedback loop
- Reduced documentation (18 lines vs 370+)
- Clear human/AI separation

**Upgrade if you want**:
- Simpler workflows
- Better UI testing
- Less manual work
- Team collaboration via PRs

**Stay on v1.x if you need**:
- Direct-to-main commits
- Custom commit messages
- npm script workflows
