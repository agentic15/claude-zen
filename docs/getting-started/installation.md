# Installation Guide

This guide walks you through installing and setting up Agentic15 Claude Zen for the first time.

## Prerequisites

Before installing, ensure you have:

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher
- **Git** 2.30.0 or higher
- **Claude Code** (Anthropic's Claude Code CLI)

### Verify Prerequisites

```bash
node --version    # Should be v18.0.0 or higher
npm --version     # Should be 9.0.0 or higher
git --version     # Should be 2.30.0 or higher
claude --version  # Should show Claude Code version
```

## Installation Methods

### Method 1: NPX (Recommended)

Create a new project without installing globally:

```bash
npx create-agentic15-claude-zen my-project
```

This is the recommended method as it always uses the latest version.

### Method 2: Global Installation

Install the package globally to use repeatedly:

```bash
# Install globally
npm install -g agentic15-claude-zen

# Create projects
create-agentic15-claude-zen my-project
create-agentic15-claude-zen another-project
```

### Method 3: Local Installation (Advanced)

For development or custom setups:

```bash
# Clone the repository
git clone https://github.com/agentic15/claude-zen.git
cd claude-zen

# Install dependencies
npm install

# Build the package
npm run build

# Link locally
npm link

# Use it
create-agentic15-claude-zen my-project
```

## Post-Installation Setup

After creating a project, follow these steps:

### 1. Navigate to Project

```bash
cd my-project
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- Testing frameworks (Jest, Testing Library)
- Build tools (Babel)
- Framework dependencies

### 3. Configure Claude Code

The framework works with Claude Code's settings. Verify hooks are enabled:

```bash
# Check .claude/settings.json
cat .claude/settings.json
```

Should show:
```json
{
  "hooks": {
    "preToolUse": [
      ".claude/hooks/validate-git-workflow.js",
      ".claude/hooks/enforce-plan-template.js"
    ],
    "postToolUse": [
      ".claude/hooks/auto-format.js",
      ".claude/hooks/validate-test-quality.js",
      ".claude/hooks/validate-test-results.js",
      ".claude/hooks/validate-ui-integration.js"
    ]
  }
}
```

### 4. Initialize Git Repository

If not already initialized:

```bash
git init
git add .
git commit -m "Initial commit: Agentic15 Claude Zen framework"
```

### 5. Read Post-Install Guide

```bash
cat .claude/POST-INSTALL.md
```

This file contains the complete workflow for your first project.

## Directory Structure

After installation, your project will have:

```
my-project/
├── .claude/              # Framework configuration (DO NOT EDIT)
│   ├── hooks/            # Git hooks for enforcement
│   ├── plans/            # Project plans directory
│   ├── CLAUDE.md         # Instructions for Claude Code
│   ├── POST-INSTALL.md   # Setup guide
│   ├── ONBOARDING.md     # Detailed onboarding
│   ├── PLAN-SCHEMA.json  # Plan structure schema
│   └── settings.json     # Claude Code hook configuration
├── Agent/                # Your workspace (EDIT HERE)
│   ├── src/              # Source code
│   │   └── .gitkeep
│   ├── tests/            # Test files
│   │   └── .gitkeep
│   └── db/               # Database scripts
│       └── .gitkeep
├── scripts/              # Build and deployment scripts
│   └── .gitkeep
├── test-site/            # Integration testing site (UI projects)
│   ├── index.html
│   ├── package.json
│   ├── server.js
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── App.css
│       └── index.css
├── __mocks__/            # Jest mock files
│   └── fileMock.js
├── .babelrc              # Babel configuration
├── .gitignore            # Git ignore patterns
├── jest.config.js        # Jest configuration
├── jest.setup.js         # Jest setup
├── package.json          # Project dependencies
└── README.md             # Project README
```

## Verify Installation

Run these commands to verify everything is set up correctly:

```bash
# 1. Check that npm scripts are available
npm run help

# 2. Verify hooks are installed
ls -la .claude/hooks/

# 3. Run tests (should pass with 0 tests initially)
npm test

# 4. Check git status
git status
```

Expected output:
- ✅ Help command shows all available scripts
- ✅ Hooks directory contains multiple .js files
- ✅ Tests run without errors
- ✅ Git repository is clean

## Framework-Specific Setup

### React Projects

No additional setup needed. Jest and Babel are pre-configured for React:

```bash
# Start development
npm run plan:generate "Build a React app"
```

### Vue Projects

Add Vue-specific Babel preset:

```bash
npm install --save-dev @babel/preset-vue babel-plugin-transform-vue-jsx
```

Update `.babelrc`:
```json
{
  "presets": [
    ["@babel/preset-env", { "targets": { "node": "current" } }],
    "@babel/preset-vue"
  ]
}
```

### Angular Projects

Add TypeScript support:

```bash
npm install --save-dev @babel/preset-typescript ts-jest
```

Update `jest.config.js`:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  // ... rest of config
};
```

### Svelte Projects

Add Svelte Jest transformer:

```bash
npm install --save-dev svelte-jester
```

Update `jest.config.js`:
```javascript
module.exports = {
  transform: {
    '^.+\\.svelte$': 'svelte-jester',
    '^.+\\.js$': 'babel-jest',
  },
  // ... rest of config
};
```

## Troubleshooting

### Issue: "Command not found: create-agentic15-claude-zen"

**Solution**: Use `npx`:
```bash
npx create-agentic15-claude-zen my-project
```

### Issue: "npm ERR! EOTP"

**Solution**: You're publishing, not installing. Use installation commands above.

### Issue: "Permission denied"

**Solution**: Don't use `sudo` with npm. Fix permissions:
```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.profile
source ~/.profile
```

### Issue: "Hooks not running"

**Solution**: Verify Claude Code settings:
1. Open Claude Code
2. Check Settings → Hooks
3. Ensure `.claude/settings.json` is loaded

### Issue: "Tests failing immediately"

**Solution**: Check Jest configuration:
```bash
# Verify jest.config.js exists
ls jest.config.js

# Verify .babelrc exists
ls .babelrc

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

After successful installation:

1. **Read the Quick Start**: [Quick Start Guide](quick-start.md)
2. **Understand the workflow**: [User Workflow](../workflows/user-workflow.md)
3. **Create your first plan**: [Plan Management](../workflows/plan-management.md)
4. **Explore examples**: [Example Projects](../../examples/)

## Getting Help

If you encounter issues:

- **GitHub Issues**: https://github.com/agentic15/claude-zen/issues
- **Community Forum**: https://github.com/agentic15/claude-zen/discussions
- **Email Support**: support@agentic15.com

---

**Copyright 2024-2025 Agentic15**
Licensed under the Apache License, Version 2.0
