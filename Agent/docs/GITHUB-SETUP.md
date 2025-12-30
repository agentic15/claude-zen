# GitHub Setup Guide

Complete guide for setting up Agentic15 Claude Zen with GitHub integration.

---

## Prerequisites

- **Node.js** 18.0.0 or higher
- **Git** installed and configured
- **GitHub Account**
- **GitHub CLI** (`gh`) - [Install here](https://cli.github.com/)

---

## 1. Create GitHub Repository

### Option A: Create via GitHub CLI (Recommended)

```bash
# Navigate to your project
cd my-project

# Initialize git
git init
git branch -M main

# Create initial commit
git add .
git commit -m "Initial commit: Agentic15 project setup"

# Create GitHub repository and push
gh repo create OWNER/REPO --public --source=. --push
```

Replace `OWNER/REPO` with your GitHub username and repository name (e.g., `myusername/my-project`).

### Option B: Create via GitHub Web UI

1. Go to https://github.com/new
2. Create a new repository
3. **Do NOT** initialize with README, .gitignore, or license
4. Copy the repository URL
5. In your project:

```bash
git init
git branch -M main
git add .
git commit -m "Initial commit: Agentic15 project setup"
git remote add origin https://github.com/OWNER/REPO.git
git push -u origin main
```

---

## 2. Authenticate with GitHub

Agentic15 uses **GitHub CLI** for authentication - no personal access tokens needed!

```bash
npx agentic15 auth
```

This command will:
1. ✅ Check if `gh` CLI is installed
2. ✅ Run `gh auth login` if not already authenticated
3. ✅ Auto-detect your repository owner/repo from git remote
4. ✅ Save configuration to `.claude/settings.local.json`

### Manual Authentication (if needed)

If `gh` CLI is not installed:

```bash
# Install GitHub CLI first
# Mac: brew install gh
# Windows: winget install GitHub.cli
# Linux: See https://github.com/cli/cli#installation

# Then authenticate
gh auth login

# Then run agentic15 auth
npx agentic15 auth
```

---

## 3. Configure GitHub Integration

The `agentic15 auth` command auto-creates `.claude/settings.local.json`:

```json
{
  "github": {
    "enabled": true,
    "autoCreate": false,
    "autoUpdate": false,
    "autoClose": false,
    "owner": "your-username",
    "repo": "your-repo"
  }
}
```

### Configuration Options

| Setting | Default | Description |
|---------|---------|-------------|
| `enabled` | `true` | Enable/disable GitHub integration |
| `autoCreate` | `false` | Auto-create GitHub issues when starting tasks |
| `autoUpdate` | `false` | Auto-update issues when creating PRs |
| `autoClose` | `false` | Auto-close issues when PRs are merged |
| `owner` | auto-detected | GitHub username or organization |
| `repo` | auto-detected | Repository name |

### Enable Auto-Features (Optional)

To enable automatic issue management, edit `.claude/settings.local.json`:

```json
{
  "github": {
    "enabled": true,
    "autoCreate": true,    // ← Create issues automatically
    "autoUpdate": true,    // ← Update issues with PR links
    "autoClose": true,     // ← Close issues when merged
    "owner": "your-username",
    "repo": "your-repo"
  }
}
```

**Recommended:** Start with auto-features disabled and enable them once comfortable with the workflow.

---

## 4. Enable Branch Protection (Recommended)

Protect your main branch to enforce PR workflow:

### Via GitHub CLI

```bash
gh api repos/OWNER/REPO/branches/main/protection \
  --method PUT \
  --field required_pull_request_reviews[required_approving_review_count]=0 \
  --field required_pull_request_reviews[dismiss_stale_reviews]=false \
  --field required_pull_request_reviews[require_code_owner_reviews]=false \
  --field enforce_admins=false \
  --field restrictions=null
```

### Via GitHub Web UI

1. Go to repository **Settings** → **Branches**
2. Click **Add rule** under "Branch protection rules"
3. Branch name pattern: `main`
4. Check **"Require a pull request before merging"**
5. Uncheck **"Require approvals"** (for solo projects)
6. Click **Save changes**

---

## 5. Verify Setup

Test that everything is working:

```bash
# Check GitHub CLI authentication
gh auth status

# Check repository connection
git remote -v

# Check agentic15 configuration
npx agentic15 status
```

Expected output:
- ✅ GitHub CLI authenticated
- ✅ Remote points to your GitHub repo
- ✅ Agentic15 ready to create plans

---

## How It Works

### Workflow Overview

1. **Create tasks** → Optionally creates GitHub issues
2. **Implement code** → Work in feature branches
3. **Run `npx agentic15 commit`** → Creates PR automatically
4. **Review & merge** → Optionally closes linked issues

### GitHub Integration Features

**Automatic PR Creation:**
- Creates PR from feature branch to main
- Uses `.github/PULL_REQUEST_TEMPLATE.md` if exists
- Includes task details and completion criteria
- Links to GitHub issues if `autoCreate: true`

**Issue Management (if enabled):**
- Creates issues from task descriptions
- Updates issues with PR links
- Closes issues when PRs merge to main
- Syncs task status with issue labels

**Branch Protection:**
- Enforces PR workflow
- Prevents direct commits to main
- Maintains clean git history

---

## Troubleshooting

### "gh: command not found"

Install GitHub CLI:
- **Mac:** `brew install gh`
- **Windows:** `winget install GitHub.cli`
- **Linux:** See https://github.com/cli/cli#installation

### "failed to create PR"

Check:
```bash
gh auth status          # Ensure authenticated
git remote -v          # Ensure remote is set
gh repo view           # Ensure repo exists
```

### "repository not found"

Ensure `.claude/settings.local.json` has correct owner/repo:
```json
{
  "github": {
    "owner": "correct-username",
    "repo": "correct-repo-name"
  }
}
```

### PRs not creating automatically

1. Check `gh` CLI is installed: `gh --version`
2. Check authentication: `gh auth status`
3. Check branch protection allows PRs
4. Run with verbose output to see errors

---

## Next Steps

✅ GitHub setup complete! Now you can:

1. **[Create your first plan](../README.md#4-create-plan)**
2. **[Start your first task](../README.md#6-start-first-task)**
3. **[Learn the daily workflow](../README.md#daily-development-workflow)**

---

## Advanced Configuration

### Custom PR Templates

Create `.github/PULL_REQUEST_TEMPLATE.md` to customize PR format:

```markdown
## Description
<!-- Describe your changes -->

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change

## Testing
<!-- How has this been tested? -->

## Checklist
- [ ] Code follows project style
- [ ] Tests added/updated
- [ ] Documentation updated
```

Agentic15 will automatically use this template when creating PRs.

### Multiple Repositories

Working with multiple repos? Each project has its own `.claude/settings.local.json`:

```bash
# Project A
cd project-a
npx agentic15 auth  # Configures for project-a

# Project B
cd ../project-b
npx agentic15 auth  # Configures for project-b
```

### Organization Repositories

Same process works for organization repos:

```bash
gh repo create my-org/my-project --public --source=. --push
npx agentic15 auth  # Auto-detects org ownership
```

---

**Need help?** [Open an issue](https://github.com/agentic15/claude-zen/issues)
