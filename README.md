# Agentic15 Claude Zen

> **Code with Intelligence, Ship with Confidence**

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![npm version](https://badge.fury.io/js/agentic15-claude-zen.svg)](https://www.npmjs.com/package/agentic15-claude-zen)
[![GitHub stars](https://img.shields.io/github/stars/agentic15/claude-zen.svg)](https://github.com/agentic15/claude-zen/stargazers)

**Agentic15 Claude Zen** is a professional, enterprise-grade framework for structured AI-assisted software development with Claude Code. It enforces quality standards, automates testing, and ensures every commit meets production requirements.

## 🎯 What is Agentic15 Claude Zen?

A comprehensive development framework that transforms Claude Code into a disciplined, production-ready development environment through:

- **Structured Project Management**: Hierarchical plans, task tracking, and progress monitoring
- **Automated Quality Enforcement**: Git hooks that validate tests, code quality, and UI components
- **Smart Testing**: Only test changed files (perfect for 43,000+ line codebases)
- **UI Component Workflows**: Enforced 3-file pattern (component, test, integration site)
- **Framework Agnostic**: Works with React, Vue, Angular, Svelte, and more

## 🚀 Quick Start

```bash
# Create a new project
npx create-agentic15-claude-zen my-project

# Navigate to project
cd my-project

# Read the post-install guide
cat .claude/POST-INSTALL.md

# Start developing
npm run plan:generate "Build a todo app with React"
```

## 📚 Documentation

Comprehensive documentation is organized by role and use case:

- **[Getting Started](docs/getting-started/README.md)** - Installation, configuration, quick start
- **[User Workflows](docs/workflows/user-workflow.md)** - How humans interact with the framework
- **[Agent Workflows](docs/workflows/agent-workflow.md)** - How Claude Code operates within the framework
- **[Plan Management](docs/workflows/plan-management.md)** - Creating, locking, and amending plans
- **[Task Management](docs/workflows/task-management.md)** - Starting, tracking, and completing tasks
- **[Test Execution](docs/workflows/test-execution.md)** - Smart testing strategies for all project sizes
- **[Architecture](docs/architecture/README.md)** - Design principles, SOLID patterns, directory structure

## ✨ Key Features

### 📋 Structured Development
- Hierarchical project planning (Project → Subproject → Milestone → Task)
- Immutable plans with audit trail for amendments
- Dependency tracking and validation
- Progress monitoring and time estimation

### 🔒 Quality Enforcement
- **Pre-commit hooks** validate tests, code quality, and UI components
- **Smart testing** runs only changed files during commits
- **Test quality validation** blocks empty tests, missing assertions
- **UI integration validation** enforces component + test + integration site pattern

### ⚡ Performance
- Token-optimized with prompt caching
- Smart file change detection for testing
- Obfuscated hooks for fast execution
- Scales to projects with 43,000+ lines of code

### 🎨 UI Development
- Framework-agnostic (React, Vue, Angular, Svelte)
- Complete Jest + Babel configuration included
- Testing Library integration
- Integration site for stakeholder previews

## 🏗️ Directory Structure

```
your-project/
├── .claude/              # Framework configuration (DO NOT EDIT)
│   ├── hooks/            # Git hooks for enforcement
│   ├── plans/            # Project plans and task tracking
│   ├── CLAUDE.md         # Instructions for Claude Code
│   ├── POST-INSTALL.md   # Setup guide
│   └── settings.json     # Claude Code hook configuration
├── Agent/                # Your workspace (EDIT HERE)
│   ├── src/              # Source code
│   ├── tests/            # Test files
│   └── db/               # Database scripts
├── scripts/              # Build and deployment scripts
├── test-site/            # Integration testing site (UI projects)
├── jest.config.js        # Test configuration
├── .babelrc              # Transpiler configuration
└── package.json          # Project dependencies
```

## 🔧 Core Workflows

### For Project Owners (Humans)

1. **Create a plan**: `npm run plan:generate "Your project description"`
2. **Review and approve**: Claude creates `PROJECT-PLAN.json`
3. **Lock the plan**: `npm run plan:init`
4. **Start a task**: `npm run task:start TASK-001`
5. **Monitor progress**: `npm run task:status`
6. **Complete task**: `npm run task:done TASK-001`

### For AI Agents (Claude Code)

1. **Read task requirements**: `.claude/plans/*/tasks/TASK-XXX.json`
2. **Write code** in `Agent/` directory
3. **Write tests** with real assertions
4. **Run tests**: `npm test` (must pass)
5. **Commit**: Git hooks validate automatically
6. **Mark complete**: After all criteria met

## 🧪 Smart Testing

**Problem**: Large codebases with 43,000+ lines take too long to test on every commit.

**Solution**: Git hooks test ONLY changed files:

- Detects staged files
- Maps source files to test files
- Runs related tests only
- Manual `npm test` still runs full suite

```bash
# During git commit (fast - changed files only)
git commit -m "Fix bug"
# → Tests 3 files in 2 seconds

# Manual full test suite (slower - all files)
npm test
# → Tests 500 files in 45 seconds
```

## 🎨 UI Component Workflow

Every UI component requires 3 files:

1. **Component**: `Agent/src/components/Button.jsx`
2. **Test**: `Agent/tests/components/Button.test.jsx`
3. **Integration**: `test-site/src/components/Button.jsx`

Git hooks BLOCK commits missing any of these files.

## 📖 Examples

See [examples/](examples/) directory for complete project examples:

- **React Todo App** - Full-featured todo application
- **Vue Dashboard** - Analytics dashboard with charts
- **Angular Forms** - Complex form validation
- **Svelte Portfolio** - Personal portfolio site

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/agentic15/claude-zen.git
cd claude-zen

# Install dependencies
npm install

# Run tests
npm test

# Build package
npm run build
```

## 🔐 Security

For security vulnerabilities, please email security@agentic15.com

See [SECURITY.md](SECURITY.md) for our security policy.

## 📄 License

Copyright 2024-2025 Agentic15

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

See [LICENSE](LICENSE) for full text.

## 🏢 About Agentic15

**Agentic15** is a software development company specializing in AI-assisted development tools and frameworks.

- **Website**: https://agentic15.com
- **Documentation**: https://docs.agentic15.com
- **GitHub**: https://github.com/agentic15
- **Twitter**: https://twitter.com/agentic15
- **Email**: hello@agentic15.com

---

**"Code with Intelligence, Ship with Confidence"** - Agentic15
