# Agentic15 Claude Zen - Quick Start Cheat Sheet

## 🚀 Initial Setup (One Time)

```bash
npx @agentic15.com/agentic15-claude-zen my-project
cd my-project
npx agentic15 auth
npm install
```

---

## 📋 Development Loop (Repeat for Each Feature)

### 1️⃣ Create Plan

```bash
npx agentic15 plan "Build feature X with Y and Z"
```

### 2️⃣ Tell Claude

```
Human: "Create the project plan"
```

### 3️⃣ Lock Plan

```bash
npx agentic15 plan
```

### 4️⃣ Start Task

```bash
npx agentic15 task next
```

### 5️⃣ Tell Claude

```
Human: "Write code for TASK-XXX"
```

### 6️⃣ Test (Backend)

```bash
npm test
```

### 6️⃣ Test (UI) - Additional Steps

```bash
# Run unit tests
npm test

# Run visual tests
npx playwright test

# If visual tests fail
node .claude/hooks/post-visual-test.js
```

```
Human: "Claude, read the visual test report and fix the UI issues"
```

```bash
# Re-run visual tests
npx playwright test
```

### 7️⃣ Commit & PR

```bash
npx agentic15 commit
```

### 8️⃣ Merge PR

Go to GitHub → Review → Merge

### 9️⃣ Repeat

```bash
npx agentic15 task next
```

---

## 🎨 Visual Testing Setup (First Time)

```bash
npm install --save-dev @playwright/test
npx playwright install chromium

# After Claude writes visual tests
npx playwright test --update-snapshots
```

---

## 📊 Status Check

```bash
npx agentic15 status
```

---

## 🔧 Common Tasks

### Start Specific Task
```bash
npx agentic15 task start TASK-003
```

### Run Specific Test File
```bash
npm test -- Agent/tests/calculator.test.js
```

### Update Visual Baselines (After Intentional UI Changes)
```bash
npx playwright test --update-snapshots
```

### View GitHub Issues
```bash
gh issue list
```

### View PRs
```bash
gh pr list
```

---

## 💡 Remember

**Human commands only:**
- `npx agentic15 plan`
- `npx agentic15 task next`
- `npm test`
- `npx playwright test`
- `npx agentic15 commit`

**Claude writes code only:**
- Creates `PROJECT-PLAN.json`
- Writes code in `Agent/src/`
- Writes tests in `Agent/tests/`
- Fixes bugs and visual regressions

**agentic15 CLI automates:**
- Git branching
- Git commits
- Git push
- PR creation
- GitHub issue management

---

## 🎯 The Complete 5-Command Workflow

```bash
1. npx agentic15 plan "description"    # Create plan
2. npx agentic15 plan                  # Lock plan
3. npx agentic15 task next             # Start task
4. npm test                            # Test
5. npx agentic15 commit                # Ship it
```

Repeat steps 3-5 for each task. That's it!
