# Installation Guide

Complete guide for installing the Agentic15 Claude Code Plugin.

## Prerequisites

Before installing, ensure you have:

- ✅ **Claude Code** installed ([Get it here](https://claude.com/claude-code))
- ✅ **Agentic15 Framework** installed globally:
  ```bash
  npm install -g @agentic15.com/agentic15-claude-zen
  ```
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

For programmatic access or if you prefer npm.

#### Step 1: Install Globally

```bash
npm install -g @agentic15.com/claude-code-zen-plugin
```

Or install locally in your project:
```bash
npm install --save-dev @agentic15.com/claude-code-zen-plugin
```

#### Step 2: Configure Claude Settings

Add to `.claude/settings.json` in your project:

```json
{
  "plugins": {
    "@agentic15.com/claude-code-zen-plugin": {
      "enabled": true
    }
  }
}
```

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
npx agentic15-claude-zen init
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
npm update -g @agentic15.com/claude-code-zen-plugin
```

Or for local install:
```bash
npm update @agentic15.com/claude-code-zen-plugin
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
npm uninstall -g @agentic15.com/claude-code-zen-plugin
```

---

## Troubleshooting

### Issue: Skills Not Appearing

**Symptom:** `/agentic15:*` commands not available

**Solution:**
1. Verify plugin is enabled:
   ```bash
   /plugin list
   ```

2. Check settings:
   ```bash
   cat .claude/settings.json
   ```

3. Reload Claude Code

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
    "@agentic15.com/claude-code-zen-plugin": {
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
