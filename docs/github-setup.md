# GitHub Branch Protection Setup

Guide to enforcing PR-only workflow by configuring GitHub branch protection rules.

## Overview

Branch protection prevents direct commits to `main`, requiring all changes to go through pull requests. This ensures:
- Code review before merging
- Automated tests run on all changes
- GitHub issues auto-close when PRs merge
- Clean, auditable commit history
- Automatic branch cleanup after merge

## Prerequisites

- Repository created on GitHub
- Initial code pushed to main branch
- Admin access to repository settings
- At least one collaborator (for PR approvals)

## Step-by-Step Setup

### 0. Enable Automatic Branch Deletion (Recommended First)

**IMPORTANT: Do this BEFORE setting up branch protection to avoid clutter from merged PRs.**

1. Go to your repository on GitHub
2. Click **Settings** (top navigation)
3. Click **General** (left sidebar)
4. Scroll to **Pull Requests** section
5. ✅ Check **Automatically delete head branches**
6. Click **Save** (if button appears)

**What this does**: When a PR is merged, GitHub automatically deletes the feature branch. This keeps your repository clean and prevents branch clutter.

### 1. Navigate to Branch Protection

1. Go to your repository on GitHub
2. Click **Settings** (top navigation)
3. Click **Branches** (left sidebar)
4. Under "Branch protection rules", click **Add rule**

### 2. Configure Branch Pattern

**Branch name pattern**: `main`

This applies the rule to your main branch.

### 3. Enable Pull Request Requirements

✅ **Require a pull request before merging**
- ✅ Require approvals: **1**
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require review from Code Owners *(optional, if you have CODEOWNERS file)*
- ❌ Require approval of the most recent reviewable push *(optional)*

### 4. Enable Status Checks (Recommended)

✅ **Require status checks to pass before merging**
- ✅ Require branches to be up to date before merging
- Add status checks from your CI/CD (see GitHub Actions section below)
  - Example: `test`, `build`, `lint`

### 5. Enable Additional Protections

✅ **Require conversation resolution before merging**
- Ensures all PR comments are addressed

✅ **Require signed commits** *(recommended)*
- Verifies commit authenticity

✅ **Require linear history**
- Prevents merge commits, keeps history clean
- Requires rebase or squash merge

✅ **Include administrators**
- Apply rules to admins too (recommended for consistency)

### 6. Restrict Push Access

✅ **Restrict who can push to matching branches**
- **Do NOT add any users or teams**
- This blocks ALL direct pushes
- Exception: Add "GitHub Actions" if using automated deployments

### 7. Save Protection Rule

Click **Create** or **Save changes**

## Result

After setup:
- ✅ Direct commits to main are **blocked**
- ✅ All changes require pull requests
- ✅ PRs need at least 1 approval
- ✅ Tests must pass before merge
- ✅ Issues auto-close when PR merges *(via post-merge hook)*

## Testing the Protection

### Test 1: Try Direct Commit (Should Fail)

```bash
git checkout main
echo "test" >> README.md
git add README.md
git commit -m "test commit"
git push
```

**Expected**: Push rejected with message about branch protection

### Test 2: Create PR (Should Succeed)

```bash
git checkout -b feature/test-protection
echo "test" >> README.md
git add README.md
git commit -m "test: verify branch protection"
git push -u origin feature/test-protection
gh pr create --title "Test PR" --body "Testing branch protection"
```

**Expected**: PR created successfully, requires approval before merge

## GitHub Actions Integration

### Basic Test Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Test

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Run build
        run: npm run build
```

### Adding Status Check to Branch Protection

After creating the workflow:

1. Open a test PR to trigger the workflow
2. Wait for workflow to complete
3. Go back to **Settings → Branches → Edit rule**
4. Under "Require status checks to pass", search for **test**
5. Click to add it
6. Save changes

Now PRs cannot merge until tests pass!

### Advanced: Multiple Checks

```yaml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
```

Add all three as required checks: `lint`, `test`, `build`

## Common Workflows

### Standard PR Workflow

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes and commit
git add .
git commit -m "[TASK-001] Implement new feature"

# 3. Push branch
git push -u origin feature/new-feature

# 4. Create PR
gh pr create --title "[FEATURE] New feature" --body "Description..."

# 5. Wait for:
#    - Tests to pass ✓
#    - Code review approval ✓
#    - All conversations resolved ✓

# 6. Merge PR (via GitHub UI or CLI)
gh pr merge --squash

# 7. Update local main
git checkout main
git pull

# 8. Delete feature branch
git branch -d feature/new-feature
```

### Emergency Hotfix

For critical fixes that need to bypass protection:

**Option 1**: Temporarily disable protection
1. Settings → Branches → Edit rule
2. Uncheck "Include administrators"
3. Push fix directly
4. Re-enable immediately after

**Option 2**: Fast-track PR
1. Create branch and PR as normal
2. Request immediate review from team
3. Merge as soon as approved

**Recommended**: Option 2 (maintains audit trail)

## Troubleshooting

### "I can't push to main anymore"

✅ **This is correct!** Branch protection is working.

**Solution**: Create a branch and open a PR instead.

### "My PR won't merge"

Check the PR page for:
- ❌ Reviews: Need 1 approval
- ❌ Status checks: Tests must pass
- ❌ Conflicts: Branch must be up to date
- ❌ Conversations: All must be resolved

### "Automated deployment failing"

If you use automated deployments:

1. Settings → Branches → Edit rule
2. Under "Restrict who can push"
3. Add: **github-actions** (or your deploy bot)
4. Save

### "Want to change number of required approvals"

1. Settings → Branches → Edit rule
2. Under "Require pull request before merging"
3. Change "Require approvals" number
4. Save

## Best Practices

### ✅ DO

- Require at least 1 approval
- Enable status checks if you have CI/CD
- Include administrators in rules
- Require conversation resolution
- Keep main branch stable
- Use descriptive PR titles and descriptions
- Reference task IDs in commits for auto-close

### ❌ DON'T

- Disable protection for convenience
- Skip code reviews
- Merge failing PRs
- Force-push to protected branches
- Leave stale branches

### Code Review Guidelines

**As PR Author:**
- Write clear PR description
- Link related issues
- Respond to all comments
- Keep PRs focused and small
- Run tests locally first

**As Reviewer:**
- Review within 24 hours
- Be constructive and specific
- Test changes locally if needed
- Approve only when confident
- Use "Request changes" for blocking issues

## Advanced Configuration

### Auto-Merge for Dependabot

```yaml
# .github/workflows/auto-merge.yml
name: Auto-merge Dependabot PRs

on:
  pull_request:
    branches: [main]

jobs:
  auto-merge:
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]'
    steps:
      - uses: actions/checkout@v3
      - name: Auto-merge
        run: gh pr merge --auto --squash "${{ github.event.pull_request.html_url }}"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Required Reviewers by Path

Create `.github/CODEOWNERS`:

```
# Global owners
* @team-leads

# Frontend code
/src/components/** @frontend-team

# Backend code
/src/api/** @backend-team

# Infrastructure
/.github/** @devops-team
/docker/** @devops-team
```

Then enable "Require review from Code Owners" in branch protection.

### Ruleset (Beta Alternative)

GitHub now offers "Rulesets" as a more flexible alternative:

1. Settings → Rules → Rulesets
2. New ruleset → New branch ruleset
3. Configure same rules as above
4. Can target multiple branches with patterns
5. Can have bypass permissions

## Further Reading

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [CODEOWNERS Documentation](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [GitHub Rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)

## Support

- Documentation: [GitHub](https://github.com/agentic15/claude-zen/tree/main/docs)
- Issues: [GitHub Issues](https://github.com/agentic15/claude-zen/issues)
- Email: developers@agentic15.com
