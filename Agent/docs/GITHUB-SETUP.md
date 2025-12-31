# GitHub Setup Guide

Repository setup and authentication for Agentic15 with GitHub.

---

## Prerequisites

- **Node.js** 18.0.0 or higher
- **Git** installed
- **GitHub Account**
- **GitHub CLI** (`gh`) - [Install here](https://cli.github.com/)

---

## 1. Create GitHub Repository

### Option A: Via GitHub CLI (Recommended)

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

Replace `OWNER/REPO` with your GitHub username/repository name.

### Option B: Via GitHub Web UI

1. Go to https://github.com/new
2. Create repository (don't initialize with README/gitignore)
3. Copy the repository URL
4. In your project:

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

```bash
npx agentic15 auth
```

This command:
- ✅ Checks if `gh` CLI is installed
- ✅ Runs `gh auth login` if needed
- ✅ Auto-detects owner/repo from git remote
- ✅ Saves to `.claude/settings.local.json`

### Manual Authentication (if needed)

```bash
# Install GitHub CLI first (if not installed)
# Mac: brew install gh
# Windows: winget install GitHub.cli

# Authenticate
gh auth login

# Configure agentic15
npx agentic15 auth
```

---

## 3. Configure Settings (Optional)

`.claude/settings.local.json` created by `npx agentic15 auth`:

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

**Settings:**
- `enabled`: Enable/disable GitHub integration
- `autoCreate`: Auto-create issues when starting tasks
- `autoUpdate`: Auto-update issues with PR links
- `autoClose`: Auto-close issues when PRs merge
- `owner/repo`: Auto-detected from git remote

**Enable auto-features** (optional):
```json
{
  "github": {
    "autoCreate": true,
    "autoUpdate": true,
    "autoClose": true
  }
}
```

---

## 4. Enable Branch Protection (Do Later)

⚠️ **Do this AFTER creating your first plan** (see [GitHub Plan Guide](GITHUB-PLAN.md))

Branch protection enforces PR workflow:

```bash
# After plan is committed to main
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

# Enable auto-delete merged branches
gh api repos/OWNER/REPO -X PATCH \
  -f delete_branch_on_merge=true
```

---

## Verify Setup

```bash
# Check authentication
gh auth status

# Check remote
git remote -v

# Check agentic15
npx agentic15 status
```

Expected:
- ✅ GitHub CLI authenticated
- ✅ Remote points to GitHub
- ✅ Ready for plan creation

---

## Next Steps

✅ **Setup complete!** Now:

👉 **[Create Your First Plan](GITHUB-PLAN.md)** - GitHub workflow

---

## Troubleshooting

### "gh: command not found"
Install: `brew install gh` (Mac) or `winget install GitHub.cli` (Windows)

### "failed to create PR"
```bash
gh auth status          # Check auth
git remote -v          # Check remote
gh repo view           # Check repo exists
```

### Wrong owner/repo
Edit `.claude/settings.local.json`:
```json
{
  "github": {
    "owner": "correct-username",
    "repo": "correct-repo"
  }
}
```

---

**Need help?** [Open an issue](https://github.com/agentic15/claude-zen/issues)
