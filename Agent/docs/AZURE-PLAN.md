# Azure DevOps Plan Creation Guide

Create your first project plan with Azure DevOps workflow (handles branch policies).

---

## Prerequisites

✅ Completed [Azure DevOps Setup](AZURE-SETUP.md)

---

## Important: Branch Policies

⚠️ Azure DevOps has branch policies enabled by default - you **cannot push directly to main**.

**Solution:** Use PR workflow (recommended) or temporarily disable policies.

---

## Option A: PR Workflow (Recommended)

### 1. Create Plan Branch

```bash
git checkout -b initial-plan
```

### 2. Generate Plan

```bash
npx agentic15 plan "Build a todo app with add, remove, and list features"
```

### 3. Create Plan (in Claude Code)

Launch Claude Code and ask:

```
"Create the project plan from the requirements file"
```

### 4. Lock the Plan

```bash
npx agentic15 plan
```

### 5. Commit to Branch

```bash
git add .
git commit -m "Add initial project plan"
git push -u origin initial-plan
```

### 6. Create Pull Request

**Via Azure CLI:**

```bash
az repos pr create \
  --source-branch initial-plan \
  --target-branch main \
  --title "Add initial project plan" \
  --description "Initial agentic15 project plan" \
  --organization https://dev.azure.com/YOUR-ORG \
  --project YOUR-PROJECT
```

**Via Azure DevOps UI:**

1. Go to **Repos** → **Pull Requests**
2. Click **New Pull Request**
3. Source: `initial-plan` → Target: `main`
4. Title: "Add initial project plan"
5. Click **Create**

### 7. Complete the PR

1. Review the PR
2. Click **Complete**
3. Check **Delete initial-plan after merging**
4. Click **Complete merge**

### 8. Switch to Main

```bash
git checkout main
git pull origin main
```

### 9. Start First Task

```bash
npx agentic15 task next
```

---

## Option B: Disable Policies (Alternative)

### 1. Disable Branch Policies

1. Go to **Project Settings** → **Repositories**
2. Select your repo → **Policies**
3. Click **main** branch
4. **Uncheck** "Require a minimum number of reviewers"
5. Click **Save**

### 2. Generate and Commit Plan

```bash
npx agentic15 plan "Build a todo app with add, remove, and list features"
```

In Claude Code:
```
"Create the project plan from the requirements file"
```

Lock and commit:
```bash
npx agentic15 plan
git add .
git commit -m "Add initial project plan"
git push
```

### 3. Re-enable Branch Policies

1. Go back to **Policies** for main branch
2. **Re-check** "Require a minimum number of reviewers"
3. Set reviewers to `0` (for solo work)
4. Click **Save**

### 4. Start First Task

```bash
npx agentic15 task next
```

---

## Verify

```bash
npx agentic15 status
```

Expected output:
- ✅ Plan locked
- ✅ Task tracker created
- ✅ Branch policies active
- ✅ Ready to start tasks

---

## Next Steps

✅ **Plan created!** Now:

1. **Implement task** - Ask Claude: "Implement the active task"
2. **Commit & PR** - Run `npx agentic15 commit`
3. **Review & merge** - On Azure DevOps
4. **Next task** - Run `npx agentic15 task next`

See [Daily Workflow](../README.md#daily-development-workflow) for details.

---

## Troubleshooting

### Azure CLI not found

Install:
```bash
# Windows
winget install Microsoft.AzureCLI

# Mac
brew install azure-cli

# Then login
az login
```

### PR create fails

Check:
```bash
az repos pr list  # List existing PRs
az devops configure --list  # Check configuration
```

Set defaults:
```bash
az devops configure --defaults organization=https://dev.azure.com/YOUR-ORG project=YOUR-PROJECT
```

### Can't push to main

This is expected! Azure has branch policies. Use Option A (PR workflow).

### PROJECT-PLAN.json not created

- Check file exists: `ls .claude/plans/plan-*/PROJECT-PLAN.json`
- Verify Claude Code created it

### Plan locked but can't start task

```bash
cat .claude/ACTIVE-PLAN  # Check plan ID
ls .claude/plans/*/TASK-TRACKER.json  # Verify tracker exists
```

### Task stuck in progress / Need to restart task

If you need to reset a task and start over:
```bash
npx agentic15 task reset
```
This resets the current task to pending and provides cleanup instructions.

---

**Need help?** [Open an issue](https://github.com/agentic15/claude-zen/issues)
