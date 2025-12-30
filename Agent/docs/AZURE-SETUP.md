# Azure DevOps Setup Guide

Complete guide for setting up Agentic15 Claude Zen with Azure DevOps integration.

---

## Prerequisites

- **Node.js** 18.0.0 or higher
- **Git** installed and configured
- **Azure DevOps Account** - [Sign up free](https://azure.microsoft.com/services/devops/)
- **Azure CLI** (optional) - [Install here](https://learn.microsoft.com/cli/azure/install-azure-cli)

---

## 1. Create Azure DevOps Project

### Via Azure DevOps Web UI

1. Go to https://dev.azure.com
2. Click **+ New project**
3. Enter project details:
   - **Project name:** my-project
   - **Visibility:** Private or Public
   - **Version control:** Git
   - **Work item process:** Agile (recommended) or Scrum/Basic
4. Click **Create**

### Via Azure CLI (Optional)

```bash
# Login to Azure
az login

# Create project
az devops project create \
  --name "my-project" \
  --organization "https://dev.azure.com/YOUR-ORG" \
  --visibility private
```

---

## 2. Create Git Repository

### Option A: Initialize in Azure DevOps

1. In your project, go to **Repos** → **Files**
2. Click **Initialize** to create main branch
3. Click **Clone** and copy the repository URL

Then in your local project:

```bash
cd my-project

git init
git branch -M main
git add .
git commit -m "Initial commit: Agentic15 project setup"

# Add Azure DevOps remote
git remote add origin https://YOUR-ORG@dev.azure.com/YOUR-ORG/my-project/_git/my-project
git push -u origin main
```

### Option B: Push existing repository

If you already have a local git repository:

```bash
# Add Azure DevOps remote
git remote add origin https://YOUR-ORG@dev.azure.com/YOUR-ORG/my-project/_git/my-project

# Push to Azure DevOps
git push -u origin main
```

---

## 3. Create Personal Access Token (PAT)

Agentic15 uses a PAT for Azure DevOps authentication.

### Steps:

1. In Azure DevOps, click your **profile icon** (top right)
2. Click **Personal access tokens**
3. Click **+ New Token**
4. Configure token:
   - **Name:** `agentic15-claude-zen`
   - **Organization:** Your organization
   - **Expiration:** 90 days (or custom)
   - **Scopes:** Select these:
     - ✅ **Code:** Read & Write
     - ✅ **Work Items:** Read, Write & Manage
     - ✅ **Pull Requests:** Read, Write & Manage
5. Click **Create**
6. **⚠️ IMPORTANT:** Copy the token immediately - you won't see it again!

### Recommended Token Scopes

| Scope | Access | Required For |
|-------|--------|--------------|
| Code | Read & Write | Repository access, PR creation |
| Work Items | Read, Write & Manage | Issue creation, status updates |
| Pull Requests | Read, Write & Manage | Automated PR creation |

---

## 4. Configure Environment Variable

**⚠️ NEVER store PAT in code or settings files!**

Store your PAT as an environment variable:

### Mac/Linux (Bash/Zsh)

Add to `~/.bashrc` or `~/.zshrc`:

```bash
export AZURE_DEVOPS_PAT="your-pat-token-here"
```

Then reload:
```bash
source ~/.bashrc  # or ~/.zshrc
```

### Windows (PowerShell)

```powershell
# Set for current session
$env:AZURE_DEVOPS_PAT = "your-pat-token-here"

# Set permanently (run as Administrator)
[System.Environment]::SetEnvironmentVariable('AZURE_DEVOPS_PAT', 'your-pat-token-here', 'User')
```

### Windows (Command Prompt)

```cmd
# Set for current session
set AZURE_DEVOPS_PAT=your-pat-token-here

# Set permanently (run as Administrator)
setx AZURE_DEVOPS_PAT "your-pat-token-here"
```

### Verify environment variable

```bash
# Mac/Linux
echo $AZURE_DEVOPS_PAT

# Windows PowerShell
echo $env:AZURE_DEVOPS_PAT

# Windows Command Prompt
echo %AZURE_DEVOPS_PAT%
```

---

## 5. Enable Azure DevOps Integration

Create or edit `.claude/settings.local.json`:

```json
{
  "azureDevOps": {
    "enabled": true,
    "autoCreate": false,
    "autoUpdate": false,
    "autoClose": false,
    "organization": "your-org-name",
    "project": "my-project"
  }
}
```

### Configuration Options

| Setting | Default | Description |
|---------|---------|-------------|
| `enabled` | `false` | **Must be `true`** to enable Azure integration |
| `autoCreate` | `false` | Auto-create work items when starting tasks |
| `autoUpdate` | `false` | Auto-update work items when creating PRs |
| `autoClose` | `false` | Auto-close work items when PRs complete |
| `organization` | `null` | Azure DevOps organization name |
| `project` | `null` | Azure DevOps project name |

### Finding Your Organization and Project Names

From your Azure DevOps URL:
```
https://dev.azure.com/YOUR-ORG/YOUR-PROJECT/_git/...
                         ^^^^^^^^  ^^^^^^^^^^^^
                         organization  project
```

**Example:**
- URL: `https://dev.azure.com/mycompany/ecommerce-app/_git/repo`
- Organization: `mycompany`
- Project: `ecommerce-app`

---

## 6. Enable Branch Policies (Recommended)

Protect your main branch to enforce PR workflow:

1. Go to **Project Settings** (bottom left)
2. Under **Repos**, click **Repositories**
3. Select your repository
4. Click **Policies** tab
5. Under **Branch Policies**, click on `main` branch
6. Configure:
   - ✅ **Require a minimum number of reviewers:** 0 (for solo projects) or 1+
   - ✅ **Check for linked work items:** Optional
   - ✅ **Check for comment resolution:** Recommended
7. Click **Save changes**

---

## 7. Verify Setup

Test that everything is working:

```bash
# Check environment variable
echo $AZURE_DEVOPS_PAT  # Mac/Linux
echo $env:AZURE_DEVOPS_PAT  # Windows PowerShell

# Check git remote
git remote -v

# Check agentic15 configuration
npx agentic15 status
```

Expected output:
- ✅ PAT environment variable set
- ✅ Remote points to Azure DevOps
- ✅ Agentic15 ready to create plans

---

## How It Works

### Workflow Overview

1. **Create tasks** → Optionally creates Azure work items
2. **Implement code** → Work in feature branches
3. **Run `npx agentic15 commit`** → Creates PR automatically
4. **Review & merge** → Optionally closes linked work items

### Azure DevOps Integration Features

**Automatic PR Creation:**
- Creates PR from feature branch to main
- Includes task details and completion criteria
- Links to Azure work items if `autoCreate: true`
- Follows Azure DevOps PR best practices

**Work Item Management (if enabled):**
- Creates work items from task descriptions
- Updates work items with PR links
- Closes work items when PRs complete
- Syncs task status with work item state

**Branch Policies:**
- Enforces PR workflow
- Prevents direct commits to main
- Maintains clean git history
- Optional code review requirements

---

## Troubleshooting

### "AZURE_DEVOPS_PAT not found"

Ensure environment variable is set:
```bash
# Check if set
echo $AZURE_DEVOPS_PAT

# If empty, set it (see section 4)
export AZURE_DEVOPS_PAT="your-token"
```

Restart your terminal after setting environment variables.

### "Authentication failed"

1. Verify PAT is valid (not expired)
2. Check PAT has correct scopes (Code, Work Items, Pull Requests)
3. Regenerate PAT if needed in Azure DevOps

### "Organization or project not found"

Check `.claude/settings.local.json` has correct names:
```json
{
  "azureDevOps": {
    "organization": "exact-org-name",  // No spaces, case-sensitive
    "project": "exact-project-name"     // No spaces, case-sensitive
  }
}
```

### PRs not creating automatically

1. Check `AZURE_DEVOPS_PAT` environment variable is set
2. Verify PAT has "Pull Requests: Read, Write & Manage" scope
3. Check branch policies allow PRs
4. Ensure `azureDevOps.enabled: true` in settings

### Work items not creating

1. Ensure `autoCreate: true` in settings
2. Check PAT has "Work Items: Read, Write & Manage" scope
3. Verify project uses Agile/Scrum/Basic process template

---

## Security Best Practices

### PAT Security

- ✅ **DO** store PAT in environment variables
- ✅ **DO** use minimum required scopes
- ✅ **DO** set expiration dates (90-180 days)
- ✅ **DO** rotate PATs regularly
- ❌ **NEVER** commit PAT to git
- ❌ **NEVER** share PAT in chat/email
- ❌ **NEVER** store PAT in settings files

### .gitignore

Ensure these are in `.gitignore`:
```
.env
.env.local
*.local.json
.azure-credentials
```

### Revoking Compromised PAT

If PAT is accidentally exposed:

1. Go to Azure DevOps → **User Settings** → **Personal access tokens**
2. Find the token
3. Click **Revoke**
4. Create a new PAT immediately
5. Update `AZURE_DEVOPS_PAT` environment variable

---

## Dual Platform Support

### Using Both GitHub and Azure DevOps

Agentic15 supports both platforms simultaneously. Platform is auto-detected from git remote URL.

**GitHub remote:**
```bash
git remote add origin https://github.com/user/repo.git
# → Uses GitHub integration
```

**Azure DevOps remote:**
```bash
git remote add origin https://dev.azure.com/org/project/_git/repo
# → Uses Azure DevOps integration
```

**Both platforms enabled:**
```json
{
  "github": {
    "enabled": true,
    "owner": "username",
    "repo": "repo"
  },
  "azureDevOps": {
    "enabled": true,
    "organization": "org",
    "project": "project"
  }
}
```

Platform detection uses git remote URL to route to correct integration.

---

## Next Steps

✅ Azure DevOps setup complete! Now you can:

1. **[Create your first plan](../README.md#4-create-plan)**
2. **[Start your first task](../README.md#6-start-first-task)**
3. **[Learn the daily workflow](../README.md#daily-development-workflow)**

---

## Advanced Configuration

### Custom Work Item Types

Default work item type is **Task**. To use different types, the integration can be extended.

### Azure Repos vs External Git

Agentic15 works with:
- ✅ Azure Repos (native)
- ✅ GitHub (with Azure Boards integration)
- ✅ Any git remote (PRs via Azure DevOps REST API)

### CI/CD Integration

Azure DevOps Pipelines can trigger on agentic15 PR creation:

```yaml
# azure-pipelines.yml
trigger:
  branches:
    include:
    - feature/*

pr:
  branches:
    include:
    - main

steps:
- script: npm test
  displayName: 'Run tests'
```

---

**Need help?** [Open an issue](https://github.com/agentic15/claude-zen/issues)
