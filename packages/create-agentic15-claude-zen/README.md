# Agentic15 Claude Zen

AI-Assisted Development Framework with Automated Workflows

[![npm version](https://badge.fury.io/js/@agentic15.com%2Fagentic15-claude-zen.svg)](https://www.npmjs.com/package/@agentic15.com/agentic15-claude-zen)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

---

## Quick Start

```bash
npx @agentic15.com/agentic15-claude-zen my-project
cd my-project
npx agentic15 auth
npx agentic15 plan "Build a todo app"
```

**See [WORKFLOWS.md](WORKFLOWS.md) for complete workflows.**

---

## What It Does

**5 Commands:**
- `npx agentic15 plan` - Generate and lock plans
- `npx agentic15 task next` - Start next task
- `npx agentic15 commit` - Test + commit + push + PR
- `npx agentic15 status` - Check progress
- `npm test` - Run tests

**Automates:**
- Feature branches (`feature/task-001`)
- Commit messages (`[TASK-001] Task title`)
- GitHub push
- Pull requests
- Issue tracking

**Workflow:**
```
plan → task → code → test → commit → PR → merge → repeat
```

---

## Documentation

- **[WORKFLOWS.md](WORKFLOWS.md)** - Complete workflows with diagrams
- **[CHANGELOG.md](CHANGELOG.md)** - Version history

---

## Requirements

- Node.js 18+
- Git
- GitHub account
- GitHub CLI (`gh`)

---

## License

Apache 2.0 - See [LICENSE](LICENSE)

---

**Support:** https://github.com/agentic15/claude-zen/issues
