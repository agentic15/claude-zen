# Migration Guide: v4.x → v5.x

**Upgrading from Agentic15 Claude Zen v4.x to v5.x**

---

## Overview

Version 5.0.0 is a **major architectural redesign** that moves framework files from your project's `.claude/` directory into `node_modules`. This makes upgrades automatic via `npm install` and separates framework code from your user-generated content.

**Benefits of v5:**
- ✅ Automatic framework upgrades with `npm install`
- ✅ No more manual `npx agentic15 upgrade` command
- ✅ Clear separation between framework and user content
- ✅ No risk of overwriting user-generated files
- ✅ Standard npm package workflow

---

## What Changed?

### v4.x Architecture (OLD)
```
my-project/
├── .claude/
│   ├── hooks/              ← Framework files (copied to project)
│   ├── settings.json       ← Framework settings (copied to project)
│   ├── PLAN-SCHEMA.json    ← Framework schema (copied to project)
│   ├── ACTIVE-PLAN         ← User content
│   └── plans/              ← User content
└── package.json
```

### v5.x Architecture (NEW)
```
my-project/
├── node_modules/
│   └── @agentic15.com/agentic15-claude-zen/
│       └── framework/          ← Framework files (auto-updated)
│           ├── hooks/
│           ├── settings.json
│           ├── PLAN-SCHEMA.json
│           ├── PROJECT-PLAN-TEMPLATE.json
│           └── POST-INSTALL.md
├── .claude/
│   ├── ACTIVE-PLAN             ← User content ONLY
│   ├── plans/                  ← User content ONLY
│   ├── settings.json           ← References framework in node_modules
│   └── settings.local.json     ← Optional user overrides
└── package.json
```

---

## Migration Steps

### Step 1: Backup Your Project

**IMPORTANT:** Backup your `.claude/plans/` directory and `ACTIVE-PLAN` file before starting.

```bash
# Create backup
cp -r .claude/plans .claude-backup-plans
cp .claude/ACTIVE-PLAN .claude-backup-ACTIVE-PLAN 2>/dev/null || true
```

### Step 2: Upgrade npm Package

```bash
npm install @agentic15.com/agentic15-claude-zen@latest
```

This installs the framework files to `node_modules/@agentic15.com/agentic15-claude-zen/framework/`

### Step 3: Clean Up Old Framework Files

Remove the old framework files from your `.claude/` directory:

```bash
# Remove old framework files
rm -rf .claude/hooks/
rm -f .claude/PLAN-SCHEMA.json
rm -f .claude/PROJECT-PLAN-TEMPLATE.json
rm -f .claude/POST-INSTALL.md
```

**DO NOT DELETE:**
- `.claude/ACTIVE-PLAN` (your active plan reference)
- `.claude/plans/` (your project plans and tasks)
- `.claude/settings.local.json` (your local overrides, if it exists)

### Step 4: Update settings.json

Replace `.claude/settings.json` with the new version that references framework files in `node_modules`:

```bash
cp node_modules/@agentic15.com/agentic15-claude-zen/framework/settings.json .claude/settings.json
```

**What this does:**
- Updates hook paths to point to `node_modules/@agentic15.com/agentic15-claude-zen/framework/hooks/`
- Updates schema references to point to framework directory
- Removes obsolete settings

### Step 5: Verify Migration

Check that everything is in the right place:

```bash
# Verify framework files exist in node_modules
ls node_modules/@agentic15.com/agentic15-claude-zen/framework/

# Should show:
# - hooks/
# - settings.json
# - PLAN-SCHEMA.json
# - PROJECT-PLAN-TEMPLATE.json
# - POST-INSTALL.md

# Verify user content is intact
ls .claude/

# Should show:
# - ACTIVE-PLAN (if you have an active plan)
# - plans/ (your project plans)
# - settings.json (framework reference)
# - settings.local.json (if you have local overrides)
```

### Step 6: Test the Migration

Test that hooks and commands still work:

```bash
# Test that hooks execute correctly
npx agentic15 task status

# Test that plans can be read
npx agentic15 plan
```

If you see any errors about missing hooks or schema files, verify that `settings.json` was updated correctly in Step 4.

---

## GitHub Settings Update (v5.0.4)

**IMPORTANT:** If you're upgrading to v5.0.4 or later, the default GitHub settings have changed.

### What Changed

**v4.x defaults:**
```json
{
  "autoCreate": true,
  "autoUpdate": true,
  "autoClose": true
}
```

**v5.0.4+ defaults:**
```json
{
  "autoCreate": false,
  "autoUpdate": false,
  "autoClose": false
}
```

### Impact

- GitHub issues will **NOT** be automatically created when starting tasks
- GitHub issues will **NOT** be automatically updated when creating PRs
- GitHub issues will **NOT** be automatically closed when merging to main

### Migration Options

**Option 1: Keep automatic behavior (like v4.x)**

If you want to keep the automatic GitHub issue management, create or update `.claude/settings.local.json`:

```json
{
  "github": {
    "enabled": true,
    "autoCreate": true,
    "autoUpdate": true,
    "autoClose": true,
    "owner": "your-username",
    "repo": "your-repo"
  }
}
```

**Option 2: Use new defaults (recommended)**

Accept the new defaults and manually control GitHub issue creation. You'll have full control over when issues are created/updated/closed.

---

## Breaking Changes Summary

### 1. Framework File Locations

| v4.x | v5.x |
|------|------|
| `.claude/hooks/` | `node_modules/@agentic15.com/agentic15-claude-zen/framework/hooks/` |
| `.claude/settings.json` | `node_modules/@agentic15.com/agentic15-claude-zen/framework/settings.json` (referenced from `.claude/settings.json`) |
| `.claude/PLAN-SCHEMA.json` | `node_modules/@agentic15.com/agentic15-claude-zen/framework/PLAN-SCHEMA.json` |

### 2. Removed Commands

- **`npx agentic15 upgrade`** - No longer needed, use `npm install @agentic15.com/agentic15-claude-zen@latest` instead

### 3. settings.json Structure

The `.claude/settings.json` file now references framework files in `node_modules` instead of containing all settings directly.

**v4.x settings.json:**
```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/session-start-context.js"
          }
        ]
      }
    ]
  }
}
```

**v5.x settings.json:**
```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [
          {
            "type": "command",
            "command": "node node_modules/@agentic15.com/agentic15-claude-zen/framework/hooks/session-start-context.js"
          }
        ]
      }
    ]
  }
}
```

---

## Troubleshooting

### Error: "Hook not found" or "Schema not found"

**Problem:** `.claude/settings.json` still references old file paths

**Solution:** Re-run Step 4:
```bash
cp node_modules/@agentic15.com/agentic15-claude-zen/framework/settings.json .claude/settings.json
```

### Error: "Cannot find module '@agentic15.com/agentic15-claude-zen'"

**Problem:** Package not installed correctly

**Solution:** Reinstall the package:
```bash
rm -rf node_modules/@agentic15.com/agentic15-claude-zen
npm install @agentic15.com/agentic15-claude-zen@latest
```

### Plans/Tasks Missing After Migration

**Problem:** Accidentally deleted user content

**Solution:** Restore from backup:
```bash
cp -r .claude-backup-plans .claude/plans
cp .claude-backup-ACTIVE-PLAN .claude/ACTIVE-PLAN
```

### GitHub Issues Being Auto-Created (v5.0.4+)

**Problem:** You have old settings with `autoCreate: true`

**Solution:** Either:
1. Accept the new behavior and set to `false` in `.claude/settings.local.json`, OR
2. Keep the old behavior by explicitly setting to `true` in `.claude/settings.local.json`

---

## Future Upgrades (v5.x → v5.y)

After migrating to v5.x, future upgrades are automatic:

```bash
# Upgrade to latest patch/minor version
npm install @agentic15.com/agentic15-claude-zen@latest

# Or specific version
npm install @agentic15.com/agentic15-claude-zen@5.0.4
```

**What gets updated automatically:**
- ✅ Framework hooks in `node_modules/`
- ✅ Settings schema and templates
- ✅ CLI commands

**What stays unchanged:**
- ✅ Your code in `Agent/`
- ✅ Your plans and tasks in `.claude/plans/`
- ✅ Your local settings in `.claude/settings.local.json`

---

## Quick Migration Checklist

- [ ] Backup `.claude/plans/` and `.claude/ACTIVE-PLAN`
- [ ] Run `npm install @agentic15.com/agentic15-claude-zen@latest`
- [ ] Delete `.claude/hooks/`
- [ ] Delete `.claude/PLAN-SCHEMA.json`
- [ ] Delete `.claude/PROJECT-PLAN-TEMPLATE.json`
- [ ] Delete `.claude/POST-INSTALL.md`
- [ ] Run `cp node_modules/@agentic15.com/agentic15-claude-zen/framework/settings.json .claude/settings.json`
- [ ] Verify user content intact: `ls .claude/plans/`
- [ ] Test: `npx agentic15 task status`
- [ ] (Optional) Configure GitHub settings in `.claude/settings.local.json`

---

## Need Help?

- **Issues:** https://github.com/agentic15/claude-zen/issues
- **Documentation:** https://github.com/agentic15/claude-zen
- **Changelog:** See [CHANGELOG.md](CHANGELOG.md) for detailed version history

---

**Made with ❤️ for Claude Code developers**
