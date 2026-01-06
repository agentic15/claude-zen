# Claude Code Skills Reference

Complete reference for all `/agentic15:*` skills available in Claude Code.

## Available Skills

When the package is properly installed (local or global), you get access to **7 skills**:

### 1. `/agentic15:plan`
**Purpose**: Create and lock project plans
**Usage**: `/agentic15:plan "Build a todo app with React"`
**When to use**: Start of new project or feature
**Example**:
```
/agentic15:plan "Build a REST API with authentication"
```

### 2. `/agentic15:task-next`
**Purpose**: Automatically start the next pending task
**Usage**: `/agentic15:task-next`
**When to use**: After completing a task or when ready to start work
**Example**:
```
/agentic15:task-next
```

### 3. `/agentic15:task-start`
**Purpose**: Start a specific task by ID
**Usage**: `/agentic15:task-start TASK-003`
**When to use**: When you want to work on a specific task out of order
**Example**:
```
/agentic15:task-start TASK-005
```

### 4. `/agentic15:commit`
**Purpose**: Commit completed task and create pull request
**Usage**: `/agentic15:commit`
**When to use**: After finishing a task and ready to create PR
**Example**:
```
/agentic15:commit
```

### 5. `/agentic15:sync`
**Purpose**: Sync local repository with main branch after PR merge
**Usage**: `/agentic15:sync`
**When to use**: After merging a PR, before starting next task
**Example**:
```
/agentic15:sync
```

### 6. `/agentic15:status`
**Purpose**: Show current project, plan, and task status
**Usage**: `/agentic15:status`
**When to use**: Anytime you want to check progress
**Example**:
```
/agentic15:status
```

### 7. `/agentic15:visual-test`
**Purpose**: Capture UI screenshots and console errors for debugging
**Usage**: `/agentic15:visual-test http://localhost:3000`
**When to use**: When debugging UI issues or verifying changes
**Example**:
```
/agentic15:visual-test http://localhost:3000
```

---

## Skill Availability by Installation Method

| Installation Method | CLI Commands | Claude Code Skills |
|-------------------|--------------|-------------------|
| **npx** (no install) | ✅ Yes | ❌ No |
| **Local install** (`npm install --save-dev`) | ✅ Yes (via npx) | ✅ Yes (auto-detected) |
| **Global install** (`npm install -g`) | ✅ Yes (direct) | ✅ Yes (via settings.json) |
| **Marketplace** | ❌ No | ✅ Yes |

---

## Complete Workflow Example

Here's how the skills work together in a typical workflow:

```bash
# 1. Create a new plan
/agentic15:plan "Build user authentication system"

# 2. Check status
/agentic15:status
# Output: Plan created with 5 tasks

# 3. Start first task
/agentic15:task-next
# Output: Started TASK-001: Set up authentication database schema

# 4. [Work on the task with Claude...]

# 5. Commit and create PR
/agentic15:commit
# Output: Created PR #123

# 6. [Merge PR on GitHub/Azure DevOps]

# 7. Sync with main
/agentic15:sync
# Output: Synced with main, deleted feature branch

# 8. Start next task
/agentic15:task-next
# Output: Started TASK-002: Implement login endpoint

# 9. Check progress anytime
/agentic15:status
# Output: 1/5 tasks completed, currently on TASK-002

# 10. Debug UI (if needed)
/agentic15:visual-test http://localhost:3000
# Output: Screenshots saved to .claude/visual-test/
```

---

## Skill Naming Pattern

All skills follow the pattern: `/agentic15:<command>`

**Namespace**: `agentic15`
**Separator**: `:`
**Command**: Lowercase with hyphens

Examples:
- ✅ `/agentic15:plan`
- ✅ `/agentic15:task-next`
- ✅ `/agentic15:visual-test`
- ❌ `/agentic15-plan` (wrong separator)
- ❌ `/agentic15:taskNext` (wrong case)

---

## How to Enable Skills

### For Local Installation (Recommended)

```bash
# Install in your project
npm install --save-dev @agentic15.com/agentic15-claude-zen

# Skills are automatically available in Claude Code
# No configuration needed!
```

### For Global Installation

```bash
# Install globally
npm install -g @agentic15.com/agentic15-claude-zen

# Configure Claude Code
# Create or edit .claude/settings.json:
```

```json
{
  "plugins": {
    "@agentic15.com/agentic15-claude-zen": {
      "enabled": true
    }
  }
}
```

### For Marketplace Installation

```bash
# Add marketplace
/plugin marketplace add https://github.com/agentic15/claude-zen

# Install plugin
/plugin install agentic15-claude-zen@agentic15-marketplace

# Skills automatically available
```

---

## Verifying Skills Are Available

After installation, verify skills are loaded:

```bash
# 1. Check plugin is loaded
/plugin list

# 2. Test a skill
/agentic15:status

# 3. Expected output (if no plan exists):
# ❌ agentic15:status failed
# 📋 Error: No active plan
# 💡 Suggestion: Create a plan first: /agentic15:plan "Your requirements"
```

If you see the formatted error message, skills are working correctly!

---

## Troubleshooting

### Skills Not Appearing

**Symptom**: `/agentic15:*` commands not available

**Solutions**:
1. Verify installation:
   ```bash
   npm list @agentic15.com/agentic15-claude-zen
   ```

2. Check Claude Code plugin list:
   ```bash
   /plugin list
   ```

3. For local install: Make sure you're in the project directory with node_modules

4. For global install: Check `.claude/settings.json` has correct plugin name

5. Restart Claude Code

### Skills Return Errors

**Symptom**: Skills appear but fail with errors

**Common issues**:
- **"Not an Agentic15 project"**: Run `npx agentic15 init` first
- **"No active plan"**: Create a plan with `/agentic15:plan "requirements"`
- **"Task tracker not found"**: Lock the plan by running `/agentic15:plan` without arguments

---

## CLI vs Skills

The package provides **both CLI and Claude Code skills** (depending on installation method):

### CLI Commands (Terminal)
```bash
npx agentic15 plan generate "Build todo app"
npx agentic15 task start TASK-001
npx agentic15 status
```

### Claude Code Skills (In Claude)
```
/agentic15:plan "Build todo app"
/agentic15:task-start TASK-001
/agentic15:status
```

**Both do the same thing**, just different interfaces:
- **CLI**: For terminal/scripts
- **Skills**: For Claude Code workflows

---

## Next Steps

- 📖 See [INSTALLATION.md](./INSTALLATION.md) for installation instructions
- 📖 See [E2E-TESTING-GUIDE.md](./E2E-TESTING-GUIDE.md) for testing workflows
- 📖 See individual skill markdown files in `.claude-plugin/skills/` for detailed docs

Happy building! 🚀
