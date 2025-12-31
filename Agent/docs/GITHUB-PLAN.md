# GitHub Plan Creation Guide

Create your first project plan with GitHub workflow.

---

## Prerequisites

✅ Completed [GitHub Setup](GITHUB-SETUP.md)

---

## 1. Generate Plan

```bash
npx agentic15 plan "Build a todo app with add, remove, and list features"
```

This creates:
- Plan ID (e.g., `plan-001-generated`)
- Requirements file in `.claude/plans/plan-001-generated/`

---

## 2. Create Plan (in Claude Code)

Launch Claude Code from your project directory and ask:

```
"Create the project plan from the requirements file"
```

Claude will:
- Read requirements
- Create comprehensive PROJECT-PLAN.json
- Include tasks, milestones, dependencies

---

## 3. Lock the Plan

```bash
npx agentic15 plan
```

This:
- Validates PROJECT-PLAN.json
- Creates task tracker
- Marks plan as locked

---

## 4. Commit Plan to Main

⚠️ **Important:** Commit to main BEFORE enabling branch protection!

```bash
git add .
git commit -m "Add initial project plan"
git push
```

This pushes directly to main (branch protection not enabled yet).

---

## 5. Enable Branch Protection

Now that the plan is in main, enable protection:

```bash
gh api repos/OWNER/REPO/branches/main/protection -X PUT \
  -H "Accept: application/vnd.github+json" \
  --input - << 'EOF'
{
  "required_pull_request_reviews": {
    "required_approving_review_count": 0
  },
  "enforce_admins": false,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_status_checks": null,
  "restrictions": null
}
EOF
```

Enable auto-delete of merged branches:

```bash
gh api repos/OWNER/REPO -X PATCH \
  -f delete_branch_on_merge=true
```

Replace `OWNER/REPO` with your GitHub username/repo.

---

## 6. Start First Task

```bash
npx agentic15 task next
```

This:
- Creates feature branch
- Marks first task as in-progress
- Ready for development!

---

## Verify

```bash
npx agentic15 status
```

Expected output:
- ✅ Plan locked
- ✅ Task tracker created
- ✅ Branch protection enabled
- ✅ Ready to start tasks

---

## Next Steps

✅ **Plan created!** Now:

1. **Implement task** - Ask Claude in Claude Code: "Implement the active task"
2. **Commit & PR** - Run `npx agentic15 commit`
3. **Review & merge** - On GitHub
4. **Next task** - Run `npx agentic15 task next`

See [Daily Workflow](../README.md#daily-development-workflow) for details.

---

## Troubleshooting

### Plan command not found
```bash
npm install -g @agentic15.com/agentic15-claude-zen@latest
```

### PROJECT-PLAN.json not created
- Check Claude Code created the file in `.claude/plans/plan-XXX/`
- Verify file exists: `ls .claude/plans/plan-*/PROJECT-PLAN.json`

### Can't push to main (already protected)
Branch protection was enabled too early. Either:
1. Temporarily disable it in GitHub settings
2. Or create PR to merge plan to main

### Wrong plan ID
Check `.claude/ACTIVE-PLAN` for current plan ID.

### Task stuck in progress / Need to restart task
If you need to reset a task and start over:
```bash
npx agentic15 task reset
```
This resets the current task to pending and provides cleanup instructions.

---

**Need help?** [Open an issue](https://github.com/agentic15/claude-zen/issues)
