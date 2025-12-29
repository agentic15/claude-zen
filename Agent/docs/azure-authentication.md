# Azure DevOps Authentication Design

## Overview

This document defines the authentication flow for Azure DevOps integration using **Azure CLI** (`az devops`), mirroring the GitHub CLI approach used in the project.

## Design Goals

1. **Security First**: No tokens stored in files - authentication handled by Azure CLI
2. **Consistency**: Mirror GitHub CLI (`gh`) approach for familiarity
3. **Simplicity**: One-time login, no token management needed
4. **Developer Experience**: Simple setup with `az login`
5. **Zero Trust**: Credentials managed by Azure CLI, not application code

## Authentication Method: Azure CLI

### Why Azure CLI?

Azure DevOps supports multiple authentication methods:
- OAuth 2.0
- Personal Access Tokens (PAT)
- SSH Keys
- **Azure CLI** ← **Chosen**

**Decision: Use Azure CLI** because:
- ✅ **Consistent with GitHub CLI approach** (user uses `gh auth login`)
- ✅ No token storage needed (CLI manages credentials)
- ✅ Simple one-time login (`az login`)
- ✅ Works in CI/CD environments
- ✅ Automatic token refresh
- ✅ More secure (no files to leak)
- ✅ Easy revocation (just `az logout`)
- ✅ No expiration management needed

## How It Works

### Comparison with GitHub

| Aspect | GitHub | Azure DevOps | Status |
|--------|--------|--------------|--------|
| Auth Command | `gh auth login` | `az login` | ✅ Parallel |
| CLI Tool | GitHub CLI (`gh`) | Azure CLI (`az`) | ✅ Parallel |
| Token Storage | Managed by `gh` CLI | Managed by `az` CLI | ✅ Identical |
| Token in Config | ❌ Never | ❌ Never | ✅ Identical |
| Issue/Work Item Creation | Uses Octokit + token | Uses `az boards` CLI | Different (see note) |
| PR Creation | `gh pr create` | Not needed (using work items) | N/A |

**Note on Difference:**
- GitHub currently uses **Octokit with tokens** for issue operations
- We'll use **Azure CLI commands** for work item operations
- This makes Azure **more consistent** with the PR workflow (which already uses `gh` CLI)

---

## Setup Process

### Step 1: Install Azure CLI

**macOS:**
```bash
brew update && brew install azure-cli
```

**Windows:**
```powershell
# Download and run installer
# https://learn.microsoft.com/en-us/cli/azure/install-azure-cli-windows
```

**Linux:**
```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

**Verify:**
```bash
az --version
```

---

### Step 2: Login to Azure

```bash
# Login to Azure (opens browser for authentication)
az login

# Verify login
az account show
```

**What happens:**
- Browser opens for Microsoft authentication
- You login with your Azure account
- Azure CLI stores credentials securely in keychain/credential manager
- No tokens stored in project files

---

### Step 3: Configure Azure DevOps

```bash
# Set default organization
az devops configure --defaults organization=https://dev.azure.com/YOUR-ORG

# Set default project
az devops configure --defaults project=YOUR-PROJECT

# Verify configuration
az devops configure --list
```

**Output:**
```
organization=https://dev.azure.com/myorg
project=myproject
```

---

### Step 4: Test Work Item Access

```bash
# List work items to verify access
az boards work-item list --output table

# Create a test work item
az boards work-item create \
  --title "Test Work Item" \
  --type "Task" \
  --description "Testing Azure CLI access"
```

**If successful:** You're ready to use Azure DevOps integration!

---

## Configuration Schema

### .claude/settings.json (Team Defaults)

```json
{
  "azureDevOps": {
    "enabled": false,
    "organization": null,
    "project": null,
    "autoCreate": false,
    "autoUpdate": false,
    "autoClose": false,
    "useCliAuth": true
  }
}
```

**Fields:**
- `enabled`: Enable/disable Azure integration
- `organization`: Azure DevOps organization name (can be auto-detected)
- `project`: Azure DevOps project name (can be auto-detected)
- `autoCreate`: Auto-create work items for new tasks
- `autoUpdate`: Auto-update work items on task status changes
- `autoClose`: Auto-close work items when tasks complete
- `useCliAuth`: **Always true** - use Azure CLI authentication

---

### .claude/settings.local.json (User Overrides)

```json
{
  "azureDevOps": {
    "enabled": true,
    "organization": "myorg",
    "project": "myproject"
  }
}
```

**No token needed!** Authentication is handled by `az login`.

---

### Environment Variables (CI/CD)

For automated environments (GitHub Actions, Azure Pipelines):

```bash
# Service principal authentication
export AZURE_DEVOPS_ORGANIZATION="myorg"
export AZURE_DEVOPS_PROJECT="myproject"
export AZURE_DEVOPS_ENABLED="true"

# Azure CLI will use service principal if configured
az login --service-principal \
  --username $AZURE_CLIENT_ID \
  --password $AZURE_CLIENT_SECRET \
  --tenant $AZURE_TENANT_ID
```

---

## Implementation in AzureDevOpsConfig

### Current Implementation (from TASK-003)

```javascript
loadConfig() {
  const config = {
    enabled: false,
    organization: null,
    project: null,
    autoCreate: false,
    autoUpdate: false,
    autoClose: false,
    useCliAuth: true  // ← Always true
  };

  // Priority 3: Load from settings.json (defaults only)
  const settingsPath = path.join(this.projectRoot, '.claude', 'settings.json');
  if (fs.existsSync(settingsPath)) {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    if (settings.azureDevOps) {
      Object.assign(config, settings.azureDevOps);
    }
  }

  // Priority 2: Load from settings.local.json (user overrides)
  const localSettingsPath = path.join(this.projectRoot, '.claude', 'settings.local.json');
  if (fs.existsSync(localSettingsPath)) {
    const localSettings = JSON.parse(fs.readFileSync(localSettingsPath, 'utf8'));
    if (localSettings.azureDevOps) {
      Object.assign(config, localSettings.azureDevOps);
    }
  }

  // Priority 1: Override with environment variables (highest)
  if (process.env.AZURE_DEVOPS_ORGANIZATION) {
    config.organization = process.env.AZURE_DEVOPS_ORGANIZATION;
  }
  if (process.env.AZURE_DEVOPS_PROJECT) {
    config.project = process.env.AZURE_DEVOPS_PROJECT;
  }
  if (process.env.AZURE_DEVOPS_ENABLED !== undefined) {
    config.enabled = process.env.AZURE_DEVOPS_ENABLED === 'true';
  }

  // No token field needed!

  return config;
}
```

---

## Implementation in AzureDevOpsClient

### CLI Command Approach

Instead of using REST API with tokens, we'll use Azure CLI commands:

```javascript
import { execSync } from 'child_process';

export class AzureDevOpsClient {
  constructor(organization, project) {
    this.organization = organization;
    this.project = project;
  }

  /**
   * Check if Azure CLI is authenticated
   */
  isConfigured() {
    try {
      execSync('az account show', { stdio: 'pipe' });
      return true;
    } catch {
      console.warn('⚠ Azure CLI not authenticated. Run: az login');
      return false;
    }
  }

  /**
   * Create a new work item
   *
   * @param {string} title - Work item title
   * @param {string} description - Work item description
   * @param {string[]} tags - Array of tags
   * @returns {Promise<number|null>} Work item ID or null
   */
  async createWorkItem(title, description, tags = []) {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const tagString = tags.join(';');

      const command = `az boards work-item create \
        --title "${title}" \
        --type "Task" \
        --description "${description}" \
        --fields "System.Tags=${tagString}" \
        --organization "https://dev.azure.com/${this.organization}" \
        --project "${this.project}" \
        --output json`;

      const result = execSync(command, { encoding: 'utf8' });
      const workItem = JSON.parse(result);
      return workItem.id;
    } catch (error) {
      console.warn('⚠ Failed to create work item:', error.message);
      return null;
    }
  }

  /**
   * Update work item state
   *
   * @param {number} workItemId - Work item ID
   * @param {string} state - New state (New, Active, Closed)
   * @returns {Promise<boolean>} True if updated, false on failure
   */
  async updateWorkItemState(workItemId, state) {
    if (!this.isConfigured() || !workItemId) {
      return false;
    }

    try {
      const command = `az boards work-item update \
        --id ${workItemId} \
        --state "${state}" \
        --organization "https://dev.azure.com/${this.organization}" \
        --project "${this.project}"`;

      execSync(command, { stdio: 'pipe' });
      return true;
    } catch (error) {
      console.warn('⚠ Failed to update work item state:', error.message);
      return false;
    }
  }

  /**
   * Add a comment to work item
   *
   * @param {number} workItemId - Work item ID
   * @param {string} comment - Comment text
   * @returns {Promise<boolean>} True if added, false on failure
   */
  async addWorkItemComment(workItemId, comment) {
    if (!this.isConfigured() || !workItemId) {
      return false;
    }

    try {
      // Comments are added as discussion in Azure Boards
      const command = `az boards work-item update \
        --id ${workItemId} \
        --discussion "${comment}" \
        --organization "https://dev.azure.com/${this.organization}" \
        --project "${this.project}"`;

      execSync(command, { stdio: 'pipe' });
      return true;
    } catch (error) {
      console.warn('⚠ Failed to add work item comment:', error.message);
      return false;
    }
  }

  /**
   * Close a work item with optional comment
   *
   * @param {number} workItemId - Work item ID
   * @param {string|null} comment - Optional closing comment
   * @returns {Promise<boolean>} True if closed, false on failure
   */
  async closeWorkItem(workItemId, comment = null) {
    if (!this.isConfigured() || !workItemId) {
      return false;
    }

    try {
      // Add comment first if provided
      if (comment) {
        await this.addWorkItemComment(workItemId, comment);
      }

      // Close the work item
      return await this.updateWorkItemState(workItemId, 'Closed');
    } catch (error) {
      console.warn('⚠ Failed to close work item:', error.message);
      return false;
    }
  }
}
```

---

## Azure CLI Commands Reference

### Work Item Operations

| Operation | Command |
|-----------|---------|
| Create | `az boards work-item create --title "..." --type "Task"` |
| Update | `az boards work-item update --id 123 --state "Active"` |
| Show | `az boards work-item show --id 123` |
| List | `az boards work-item list --project "myproject"` |
| Delete | `az boards work-item delete --id 123` |

### Configuration

| Operation | Command |
|-----------|---------|
| Set org | `az devops configure --defaults organization=https://dev.azure.com/org` |
| Set project | `az devops configure --defaults project=myproject` |
| List config | `az devops configure --list` |

### Authentication

| Operation | Command |
|-----------|---------|
| Login | `az login` |
| Logout | `az logout` |
| Show account | `az account show` |
| List accounts | `az account list` |

---

## Error Handling

### Not Authenticated

```javascript
// Check if user is logged in
try {
  execSync('az account show', { stdio: 'pipe' });
} catch (error) {
  console.error('❌ Azure CLI not authenticated');
  console.error('   Run: az login');
  process.exit(1);
}
```

### Not Configured

```javascript
// Check if defaults are set
try {
  const config = execSync('az devops configure --list', { encoding: 'utf8' });
  if (!config.includes('organization') || !config.includes('project')) {
    console.warn('⚠ Azure DevOps not configured');
    console.warn('   Run: az devops configure --defaults organization=... project=...');
  }
} catch (error) {
  console.warn('⚠ Azure DevOps CLI extension not installed');
  console.warn('   Run: az extension add --name azure-devops');
}
```

### Permission Denied

```javascript
try {
  // Try to create work item
  execSync('az boards work-item create ...', { stdio: 'pipe' });
} catch (error) {
  if (error.message.includes('permission') || error.message.includes('403')) {
    console.error('❌ Permission denied');
    console.error('   Your Azure account needs "Contributor" access to this project');
  }
}
```

---

## Security Considerations

### 1. No Token Storage

**Advantage:**
- ✅ No tokens in files (nothing to accidentally commit)
- ✅ No token expiration to manage
- ✅ No token rotation needed
- ✅ Credentials stored in OS keychain (encrypted)

**How Azure CLI Manages Credentials:**
- macOS: Stores in Keychain
- Windows: Stores in Credential Manager
- Linux: Stores in `.azure/` directory (encrypted)

---

### 2. Authentication Verification

```javascript
// Always check authentication before operations
if (!this.isConfigured()) {
  console.warn('⚠ Azure DevOps not configured, skipping work item creation');
  return null;
}
```

---

### 3. CI/CD Authentication

**For automated environments:**

```yaml
# GitHub Actions example
- name: Azure Login
  uses: azure/login@v1
  with:
    creds: ${{ secrets.AZURE_CREDENTIALS }}

- name: Configure Azure DevOps
  run: |
    az devops configure --defaults organization=${{ secrets.AZURE_ORG }}
    az devops configure --defaults project=${{ secrets.AZURE_PROJECT }}
```

**For Azure Pipelines:**
```yaml
# Use built-in Azure authentication
- task: AzureCLI@2
  inputs:
    azureSubscription: 'MyServiceConnection'
    scriptType: 'bash'
    scriptLocation: 'inlineScript'
    inlineScript: |
      az devops configure --defaults organization=$(System.CollectionUri)
      az devops configure --defaults project=$(System.TeamProject)
```

---

## Setup Instructions for Users

### Quick Start

1. **Install Azure CLI:**
   ```bash
   # macOS
   brew install azure-cli

   # Windows (run installer)
   # https://aka.ms/installazurecliwindows

   # Linux
   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
   ```

2. **Login to Azure:**
   ```bash
   az login
   ```

3. **Configure Azure DevOps:**
   ```bash
   az devops configure --defaults \
     organization=https://dev.azure.com/YOUR-ORG \
     project=YOUR-PROJECT
   ```

4. **Install Azure DevOps extension (if needed):**
   ```bash
   az extension add --name azure-devops
   ```

5. **Enable in settings:**
   ```bash
   # Create .claude/settings.local.json
   cat > .claude/settings.local.json << EOF
   {
     "azureDevOps": {
       "enabled": true,
       "organization": "YOUR-ORG",
       "project": "YOUR-PROJECT"
     }
   }
   EOF
   ```

6. **Verify:**
   ```bash
   npx agentic15 status
   ```

---

## Comparison with GitHub Authentication

### GitHub (Current)

**For Issues (via Octokit):**
- Uses GitHub Personal Access Token
- Token stored in config files or env vars
- Requires token management

**For PRs (via GitHub CLI):**
- Uses `gh auth login`
- No tokens in config
- Authentication managed by `gh` CLI

### Azure DevOps (New)

**For Work Items (via Azure CLI):**
- Uses `az login`
- No tokens in config
- Authentication managed by `az` CLI
- **More consistent with GitHub CLI approach**

---

## Migration from GitHub-Only

**For projects currently using GitHub:**

1. Your GitHub config remains unchanged
2. Azure config is additive (separate)
3. Both can be enabled simultaneously
4. Platform detection chooses the right one automatically
5. **Both use CLI-based authentication for better security**

**No breaking changes to GitHub authentication.** ✅

---

## Troubleshooting

### "az: command not found"

**Solution:** Install Azure CLI
```bash
# macOS
brew install azure-cli

# Verify
az --version
```

---

### "Please run 'az login' to setup account."

**Solution:** Authenticate with Azure
```bash
az login
```

---

### "The extension 'azure-devops' is not installed."

**Solution:** Install Azure DevOps extension
```bash
az extension add --name azure-devops
```

---

### "No organization or project configured"

**Solution:** Set defaults
```bash
az devops configure --defaults \
  organization=https://dev.azure.com/YOUR-ORG \
  project=YOUR-PROJECT
```

---

## Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Auth Method** | Azure CLI (`az login`) | Consistent with GitHub CLI, no token management |
| **Command Tool** | `az boards work-item` | Native Azure CLI commands |
| **Token Storage** | ❌ NEVER | Managed by Azure CLI keychain |
| **Configuration** | Organization + Project | Stored in settings, no secrets |
| **Error Handling** | Graceful degradation | Work item sync optional, doesn't block workflow |
| **Security** | OS Keychain | Encrypted credential storage |
| **Consistency** | Mirror GitHub CLI approach | Familiar pattern for users |

This design provides **simpler, more secure** Azure DevOps authentication by leveraging the Azure CLI, just like how GitHub uses the `gh` CLI for PR operations. No token management needed!
