# Installation Guide

Complete guide for installing Agentic15 Claude Zen - the structured AI-assisted development framework with integrated Claude Code skills.

## Prerequisites

Before installing, ensure you have:

- ✅ **Claude Code** installed ([Get it here](https://claude.com/claude-code))
- ✅ **Git** configured with a remote repository
- ✅ **Node.js 18+** for npm-based installation

## Installation Methods

### Method 1: Claude Marketplace (Recommended)

This is the easiest method for most users.

#### Step 1: Add the Marketplace

```bash
/plugin marketplace add agentic15/claude-zen
```

Or using the full GitHub URL:
```bash
/plugin marketplace add https://github.com/agentic15/claude-zen
```

#### Step 2: Install the Plugin

```bash
/plugin install agentic15-claude-zen-plugin@agentic15-marketplace
```

#### Step 3: Verify Installation

```bash
/plugin list
```

You should see `agentic15-claude-zen-plugin` in the list.

#### Step 4: Test a Skill

In an Agentic15 project:
```
/agentic15:status
```

---

### Method 2: NPM Package

Three ways to use the package via npm:

#### Option A: Use with npx (CLI Only - No Claude Code Skills)

```bash
# Initialize a new project
npx @agentic15.com/agentic15-claude-zen init

# Use CLI commands
npx agentic15 plan generate "Your requirements"
npx agentic15 status
```

**Provides**: CLI commands only (`npx agentic15`)
**Does NOT provide**: Claude Code skills (`/agentic15:*`)
**Pros**: No installation needed, always uses latest version
**Cons**: No Claude Code integration, slightly slower first run

**Note**: For Claude Code skills, use Option B or C below.

#### Option B: Install Locally (CLI + Claude Code Skills - Recommended)

```bash
# Install in your project
npm install --save-dev @agentic15.com/agentic15-claude-zen

# Use CLI with npx
npx agentic15 status

# Claude Code skills automatically available
# /agentic15:plan, /agentic15:status, etc.
```

**Provides**:
- ✅ CLI commands (`npx agentic15`)
- ✅ Claude Code skills (`/agentic15:*`) - auto-detected from node_modules

**Pros**: Version locked per project, Claude Code auto-detects, no config needed
**Cons**: Requires installation per project

#### Option C: Install Globally (CLI + Claude Code Skills)

```bash
# Install once globally
npm install -g @agentic15.com/agentic15-claude-zen

# Use CLI directly without npx
agentic15 status

# Configure Claude Code (one-time)
# Add to .claude/settings.json:
# { "plugins": { "@agentic15.com/agentic15-claude-zen": { "enabled": true } } }
```

**Provides**:
- ✅ CLI commands (`agentic15` - no npx needed)
- ✅ Claude Code skills (`/agentic15:*`) - via settings.json config

**Pros**: Available system-wide, fastest execution, works across all projects
**Cons**: Requires settings.json config, single version across projects

#### Step 2: Configure Claude Settings (Optional)

Claude Code will auto-detect the package if installed locally. Optionally, explicitly enable in `.claude/settings.json`:

```json
{
  "plugins": {
    "@agentic15.com/agentic15-claude-zen": {
      "enabled": true
    }
  }
}
```

**Note**: If installed locally (`npm install --save-dev`), Claude Code automatically detects it from `node_modules/`.

#### Step 3: Verify Installation

```bash
/plugin list
```

#### Step 4: Test a Skill

```
/agentic15:status
```

---

### Method 3: Local Development

For contributing or testing local changes.

#### Step 1: Clone the Repository

```bash
git clone https://github.com/agentic15/claude-zen.git
cd claude-zen/plugin
```

#### Step 2: Install Dependencies

```bash
npm install
```

#### Step 3: Link Locally

```bash
npm link
```

#### Step 4: Add Local Marketplace

In your test project:
```bash
/plugin marketplace add /path/to/claude-zen
```

#### Step 5: Install from Local Marketplace

```bash
/plugin install agentic15-claude-zen-plugin@agentic15-marketplace
```

---

## Post-Installation Setup

### 1. Initialize an Agentic15 Project

If you haven't already:

```bash
cd your-project
npx @agentic15.com/agentic15-claude-zen init
# or if installed globally: agentic15-claude-zen init
```

This creates the `.claude/` directory structure.

### 2. Verify Plugin Works

```bash
/agentic15:status
```

Expected output (if no plan active):
```
❌ agentic15:status failed
📋 Error: No active plan
💡 Suggestion: Create a plan first: /agentic15:plan "Your requirements"
```

This confirms the plugin is loaded and working!

### 3. Create Your First Plan

```bash
/agentic15:plan "Build a simple todo app"
```

---

## Updating

### Update from Claude Marketplace

```bash
/plugin marketplace update
/plugin update agentic15-claude-zen-plugin
```

### Update from NPM

```bash
npm update -g @agentic15.com/agentic15-claude-zen
```

Or for local install:
```bash
npm update @agentic15.com/agentic15-claude-zen
```

---

## Uninstallation

### Remove from Claude Marketplace

```bash
/plugin uninstall agentic15-claude-zen-plugin
/plugin marketplace remove agentic15-marketplace
```

### Remove from NPM

```bash
npm uninstall -g @agentic15.com/agentic15-claude-zen
```

---

## Troubleshooting

### Issue: Skills Not Appearing

**Symptom:** `/agentic15:*` commands not available

**Solution:**
1. Verify package is installed:
   ```bash
   npm list -g @agentic15.com/agentic15-claude-zen
   ```

2. Verify plugin is enabled:
   ```bash
   /plugin list
   ```

3. Check settings:
   ```bash
   cat .claude/settings.json
   ```

4. Reload Claude Code

### Issue: "Not an Agentic15 project"

**Symptom:** All skills fail with this error

**Solution:**
1. Verify `.claude/` directory exists:
   ```bash
   ls .claude/
   ```

2. Initialize if missing:
   ```bash
   npx agentic15-claude-zen init
   ```

### Issue: NPM Permission Error

**Symptom:** `EACCES` error during global install

**Solution:**
Use npx instead:
```bash
npx @agentic15.com/agentic15-claude-zen <command>
```

Or configure npm for global installs without sudo:
```bash
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

### Issue: Playwright Not Found (visual-test)

**Symptom:** `/agentic15:visual-test` fails

**Solution:**
Install Playwright browsers:
```bash
npx playwright install chromium
```

### Issue: Plugin Version Mismatch

**Symptom:** Unexpected behavior after update

**Solution:**
1. Clear plugin cache:
   ```bash
   /plugin clear-cache
   ```

2. Reinstall:
   ```bash
   /plugin uninstall agentic15-claude-zen-plugin
   /plugin install agentic15-claude-zen-plugin@agentic15-marketplace
   ```

---

## Configuration Options

### Enable/Disable Plugin

In `.claude/settings.json`:

```json
{
  "plugins": {
    "@agentic15.com/agentic15-claude-zen": {
      "enabled": false  // Disable the plugin
    }
  }
}
```

### Team-Wide Installation

For organizations, add to `.claude/settings.json` in your repository:

```json
{
  "extraKnownMarketplaces": {
    "agentic15": {
      "source": {
        "source": "github",
        "repo": "agentic15/claude-zen"
      }
    }
  },
  "enabledPlugins": {
    "agentic15-claude-zen-plugin@agentic15": true
  }
}
```

Team members will automatically have access to the marketplace.

---

## Verification Checklist

Use this checklist after installation:

- [ ] Plugin appears in `/plugin list`
- [ ] Skills appear when typing `/agentic15:`
- [ ] `/agentic15:status` returns an error (expected if no plan)
- [ ] `.claude/` directory exists in your project
- [ ] Framework command works: `npx agentic15 --version`

---

## Next Steps

After successful installation:

1. 📖 Read the [Quick Start Guide](./README.md#quick-start)
2. 🎯 Create your first plan with `/agentic15:plan`
3. 📚 Review [Skill Documentation](./README.md#skill-documentation)
4. 🧪 Try the [E2E Testing Guide](./E2E-TESTING-GUIDE.md)

---

## Getting Help

- 📖 [Full Documentation](./README.md)
- 🐛 [Report Issues](https://github.com/agentic15/claude-zen/issues)
- 💬 [Discussions](https://github.com/agentic15/claude-zen/discussions)
- 📧 Email: developers@agentic15.com

Happy coding! 🚀
