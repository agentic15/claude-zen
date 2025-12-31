# Azure DevOps Setup Guide

Repository setup and authentication for Agentic15 with Azure DevOps.

---

## Prerequisites

- **Node.js** 18.0.0 or higher
- **Git** installed
- **Azure DevOps Account** - [Sign up free](https://azure.microsoft.com/services/devops/)

---

## 1. Create Azure DevOps Project

1. Go to https://dev.azure.com
2. Click **+ New project**
3. Configure:
   - **Name:** my-project
   - **Visibility:** Private or Public
   - **Version control:** Git
   - **Work item process:** Agile
4. Click **Create**

---

## 2. Create Git Repository

### Initialize Repository

1. Go to **Repos** → **Files**
2. Click **Initialize** (creates main branch)
3. Click **Clone** → Copy URL

### Push Your Local Code

```bash
cd my-project

git init
git branch -M main
git add .
git commit -m "Initial commit: Agentic15 project setup"

# Add Azure remote (replace with your URL)
git remote add origin https://YOUR-ORG@dev.azure.com/YOUR-ORG/PROJECT/_git/REPO
git push -u origin main
```

**URL Format:**
```
https://YOUR-ORG@dev.azure.com/YOUR-ORG/PROJECT/_git/REPO
```

**Example:**
```
https://mycompany@dev.azure.com/mycompany/ecommerce/_git/backend
```

---

## 3. Create Personal Access Token (PAT)

### Why Two Tokens?

- **Git credentials:** For push/pull (auto-saved by git)
- **Agentic15 PAT:** For Azure DevOps API (PRs, work items)

### Create PAT

1. Click **profile icon** (top right) → **Personal access tokens**
2. Click **+ New Token**
3. Configure:
   - **Name:** `agentic15-claude-zen`
   - **Expiration:** 90 days
   - **Scopes:**
     - ✅ **Code:** Read & Write
     - ✅ **Work Items:** Read, Write & Manage
     - ✅ **Pull Requests:** Read, Write & Manage
4. Click **Create**
5. **⚠️ COPY TOKEN NOW** - won't see again!

---

## 4. Set Environment Variable

**⚠️ NEVER commit PAT to git!**

### Mac/Linux

Add to `~/.bashrc` or `~/.zshrc`:
```bash
export AZURE_DEVOPS_PAT="your-pat-token-here"
```

Reload:
```bash
source ~/.bashrc
```

### Windows PowerShell

Permanent (run as Administrator):
```powershell
[System.Environment]::SetEnvironmentVariable('AZURE_DEVOPS_PAT', 'your-pat-token-here', 'User')
```

Restart terminal after.

### Windows Command Prompt

```cmd
setx AZURE_DEVOPS_PAT "your-pat-token-here"
```

Restart terminal after.

### Verify

```bash
# Mac/Linux
echo $AZURE_DEVOPS_PAT

# Windows PowerShell
echo $env:AZURE_DEVOPS_PAT

# Windows Command Prompt
echo %AZURE_DEVOPS_PAT%
```

---

## 5. Configure Settings

Create `.claude/settings.local.json`:

```json
{
  "azureDevOps": {
    "enabled": true,
    "autoCreate": false,
    "autoUpdate": false,
    "autoClose": false,
    "organization": "your-org-name",
    "project": "your-project-name"
  }
}
```

**Finding org/project names:**

From URL: `https://dev.azure.com/YOUR-ORG/YOUR-PROJECT/_git/...`
- Organization: `YOUR-ORG`
- Project: `YOUR-PROJECT`

**Settings:**
- `enabled`: **Must be true** for Azure
- `autoCreate`: Auto-create work items when starting tasks
- `autoUpdate`: Auto-update work items with PR links
- `autoClose`: Auto-close work items when PRs complete

**Enable auto-features (optional):**
```json
{
  "azureDevOps": {
    "enabled": true,
    "autoCreate": true,
    "autoUpdate": true,
    "autoClose": true,
    "organization": "your-org",
    "project": "your-project"
  }
}
```

---

## 6. Understand Branch Policies

⚠️ **CRITICAL:** Azure DevOps enables branch policies by default!

**Default protection on main:**
- ❌ Direct pushes **blocked**
- ✅ Must use Pull Requests

**This affects plan creation!**

You **cannot** do:
```bash
git push  # ❌ FAILS - requires PR
```

See [Azure Plan Guide](AZURE-PLAN.md) for the correct workflow.

---

## Verify Setup

```bash
# Check PAT
echo $AZURE_DEVOPS_PAT

# Check remote
git remote -v

# Check agentic15
npx agentic15 status
```

Expected:
- ✅ PAT set in environment
- ✅ Remote points to Azure DevOps
- ✅ Settings configured
- ✅ Ready for plan creation

---

## Next Steps

✅ **Setup complete!** Now:

👉 **[Create Your First Plan](AZURE-PLAN.md)** - Azure workflow with branch policies

---

## Troubleshooting

### PAT not found

```bash
# Check if set
echo $AZURE_DEVOPS_PAT

# Set it
export AZURE_DEVOPS_PAT="your-token"  # Mac/Linux
$env:AZURE_DEVOPS_PAT="your-token"    # Windows PowerShell

# Restart terminal
```

### Authentication failed

1. Verify PAT not expired (check Azure DevOps)
2. Check scopes: Code, Work Items, Pull Requests
3. Regenerate PAT if needed

### Organization or project not found

Edit `.claude/settings.local.json`:
- Use exact names (case-sensitive)
- No spaces in names
- Match Azure DevOps exactly

### Can't push to main

This is **expected**! Azure has branch policies enabled.

See [Azure Plan Guide](AZURE-PLAN.md) for PR workflow.

### Git asks for password every time

Git credentials not saved. Run:
```bash
git config --global credential.helper store
git push  # Enter credentials once, saved for future
```

---

## Security Best Practices

### PAT Security

- ✅ Store in environment variables
- ✅ Use minimum scopes needed
- ✅ Set expiration (90-180 days)
- ✅ Rotate regularly
- ❌ NEVER commit to git
- ❌ NEVER share in chat/email

### If PAT Compromised

1. **Revoke immediately:** User Settings → Personal access tokens → Revoke
2. Create new PAT with new scopes
3. Update `AZURE_DEVOPS_PAT` variable
4. Restart terminal

### .gitignore

Ensure these are ignored:
```
.env
.env.local
*.local.json
.azure-credentials
```

---

**Need help?** [Open an issue](https://github.com/agentic15/claude-zen/issues)
