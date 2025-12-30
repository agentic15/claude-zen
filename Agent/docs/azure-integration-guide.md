# Azure DevOps Integration Guide

Complete guide for integrating Agentic15 Claude Zen with Azure DevOps work items.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Usage](#usage)
- [Platform Detection](#platform-detection)
- [Troubleshooting](#troubleshooting)
- [Architecture](#architecture)

---

## Overview

Agentic15 Claude Zen supports **dual-platform integration** with both GitHub Issues and Azure DevOps Work Items. The integration provides:

- **Automatic platform detection** from git remote URLs
- **CLI-based authentication** (no token storage required)
- **Task lifecycle synchronization** (create, update, close)
- **Complete isolation** between GitHub and Azure implementations
- **Unified API** through PlatformRouter

### Key Features

✅ Auto-create work items for new tasks
✅ Auto-update work item state when task status changes
✅ Auto-close work items when tasks complete
✅ CLI-based authentication using Azure CLI
✅ Platform routing (GitHub Issues OR Azure Work Items)
✅ Feature flags for granular control

---

## Prerequisites

### Required Tools

1. **Azure CLI** (version 2.50.0 or later)
   ```bash
   # Install Azure CLI
   # Windows (PowerShell as Administrator)
   winget install -e --id Microsoft.AzureCLI

   # macOS
   brew install azure-cli

   # Linux
   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
   ```

2. **Azure DevOps Extension**
   ```bash
   az extension add --name azure-devops
   ```

3. **Git** (configured with Azure DevOps remote)

### Verify Installation

```bash
# Check Azure CLI version
az --version

# Check Azure DevOps extension
az extension list --output table | grep azure-devops
```

---

## Quick Start

### Step 1: Authenticate with Azure CLI

```bash
# Login to Azure
az login

# This will open a browser window for authentication
# Follow the prompts to sign in with your Azure account
```

### Step 2: Configure Azure DevOps Defaults

```bash
# Set your organization
az devops configure --defaults organization=https://dev.azure.com/YOUR-ORG

# Set your project
az devops configure --defaults project=YOUR-PROJECT

# Verify configuration
az devops configure --list
```

Expected output:
```
organization=https://dev.azure.com/YOUR-ORG
project=YOUR-PROJECT
```

### Step 3: Enable Azure Integration

Edit `.claude/settings.json`:

```json
{
  "azureDevOps": {
    "enabled": true,
    "organization": "YOUR-ORG",
    "project": "YOUR-PROJECT",
    "autoCreate": true,
    "autoUpdate": true,
    "autoClose": true
  }
}
```

### Step 4: Verify Setup

```bash
# Run validation script
npx agentic15 validate-azure

# Or manually verify
az devops project show --project YOUR-PROJECT
```

✅ **You're ready!** The integration will now automatically sync tasks with Azure DevOps work items.

---

## Configuration

### Settings File Location

Configuration is stored in `.claude/settings.json` (or `.claude/settings.local.json` for local overrides).

### Complete Configuration Options

```json
{
  "azureDevOps": {
    // Core Settings
    "enabled": true,              // Enable/disable Azure integration
    "organization": "YOUR-ORG",   // Azure DevOps organization name
    "project": "YOUR-PROJECT",    // Azure DevOps project name

    // Feature Flags
    "autoCreate": true,           // Auto-create work items for new tasks
    "autoUpdate": true,           // Auto-update work item state on status changes
    "autoClose": true,            // Auto-close work items when tasks complete

    // Work Item Settings
    "workItemType": "Task",       // Work item type (Task, User Story, Bug, etc.)
    "areaPath": null,             // Optional area path
    "iterationPath": null         // Optional iteration path
  },

  // Platform Override (optional)
  "platform": {
    "type": "azure",              // Force platform: 'github' or 'azure'
    "autoDetect": false           // Set to false when using override
  }
}
```

### Configuration Priority

Settings are loaded in this order (highest priority first):

1. **Environment variables** - `AZURE_DEVOPS_ORGANIZATION`, `AZURE_DEVOPS_PROJECT`
2. **`.claude/settings.local.json`** - Local overrides (gitignored)
3. **`.claude/settings.json`** - Project defaults (committed)
4. **Azure CLI defaults** - From `az devops configure`

### Feature Flags

Control specific behaviors with feature flags:

| Flag | Description | Default |
|------|-------------|---------|
| `enabled` | Master switch for Azure integration | `false` |
| `autoCreate` | Create work items when tasks are created | `true` |
| `autoUpdate` | Update work items when task status changes | `true` |
| `autoClose` | Close work items when tasks complete | `true` |

**Example:** Enable Azure but disable auto-create:

```json
{
  "azureDevOps": {
    "enabled": true,
    "organization": "my-org",
    "project": "my-project",
    "autoCreate": false,    // Don't auto-create
    "autoUpdate": true,
    "autoClose": true
  }
}
```

---

## Usage

### Task Lifecycle Integration

The integration automatically syncs task lifecycle events with Azure DevOps:

#### 1. Create Task → Create Work Item

When you create a new task:

```javascript
// Task created in Agentic15
{
  "id": "TASK-001",
  "title": "Implement user authentication",
  "description": "Add OAuth 2.0 authentication",
  "status": "pending",
  "tags": ["security", "backend"]
}
```

Automatically creates Azure work item:
- **Title:** `[TASK-001] Implement user authentication`
- **Description:** Task description with completion criteria
- **State:** `New`
- **Tags:** `task-001`, `security`, `backend`

#### 2. Update Task → Update Work Item

When task status changes:

```javascript
// Task status updated
task.status = "in_progress"
```

Automatically updates work item:
- **State:** `New` → `Active`

Status mapping:
- `pending` → `New`
- `in_progress` → `Active`
- `completed` → `Closed`
- `blocked` → `New` (with `blocked` tag)

#### 3. Complete Task → Close Work Item

When task is completed:

```javascript
// Task completed
task.status = "completed"
```

Automatically closes work item:
- **State:** `Closed`
- **Comment:** `Task TASK-001 completed`

### Manual Operations

You can also perform manual operations:

```javascript
import { PlatformRouter } from './src/core/Platform/PlatformRouter.js';

const router = new PlatformRouter();

// Check detected platform
console.log(router.getPlatform()); // 'azure' or 'github'

// Create work item manually
const task = {
  id: 'TASK-001',
  title: 'My Task',
  description: 'Task description',
  tags: ['feature', 'backend']
};

const workItemId = await router.createTaskItem(task);
console.log(`Created work item #${workItemId}`);

// Update work item
await router.updateTaskItem(task, workItemId);

// Add comment
await router.addComment(workItemId, 'Progress update...');

// Close work item
await router.closeTaskItem(workItemId, 'Task completed');
```

---

## Platform Detection

The system automatically detects whether to use GitHub Issues or Azure DevOps Work Items.

### Detection Hierarchy

1. **User Override** (highest priority)
   ```json
   {
     "platform": {
       "type": "azure",
       "autoDetect": false
     }
   }
   ```

2. **Git Remote URL**
   ```bash
   # Azure DevOps remote
   git remote get-url origin
   # https://dev.azure.com/org/project/_git/repo

   # GitHub remote
   git remote get-url origin
   # https://github.com/owner/repo.git
   ```

3. **Feature Flags**
   ```json
   {
     "github": { "enabled": false },
     "azureDevOps": { "enabled": true }
   }
   ```
   If only one platform is enabled, it's selected.

4. **Default:** GitHub (if both enabled)

### Verify Platform Detection

```javascript
import { PlatformDetector } from './src/core/Platform/PlatformDetector.js';

const platform = PlatformDetector.detect();
console.log(`Detected platform: ${platform}`); // 'github' or 'azure'
```

### Force Platform Selection

To force Azure DevOps even with a GitHub remote:

```json
{
  "platform": {
    "type": "azure",
    "autoDetect": false
  },
  "azureDevOps": {
    "enabled": true,
    "organization": "my-org",
    "project": "my-project"
  }
}
```

---

## Troubleshooting

### Common Issues

#### 1. "Azure CLI not authenticated"

**Symptom:**
```
⚠ Failed to create work item: Please run 'az login'
```

**Solution:**
```bash
# Login to Azure
az login

# Verify authentication
az account show
```

---

#### 2. "Organization or project not configured"

**Symptom:**
```
⚠ Azure DevOps organization not configured
⚠ Azure DevOps project not configured
```

**Solution:**
```bash
# Configure defaults
az devops configure --defaults organization=https://dev.azure.com/YOUR-ORG
az devops configure --defaults project=YOUR-PROJECT

# Or set in settings.json
{
  "azureDevOps": {
    "organization": "YOUR-ORG",
    "project": "YOUR-PROJECT"
  }
}
```

---

#### 3. "Platform detected as GitHub instead of Azure"

**Symptom:**
Work items not being created, platform shows 'github'

**Solution:**
1. Check git remote:
   ```bash
   git remote get-url origin
   ```
   Should be an Azure DevOps URL.

2. Or force Azure in settings:
   ```json
   {
     "platform": {
       "type": "azure",
       "autoDetect": false
     }
   }
   ```

---

#### 4. "Work items not being created"

**Symptom:**
Tasks created but no work items in Azure

**Solution:**
1. Check `autoCreate` flag:
   ```json
   {
     "azureDevOps": {
       "autoCreate": true  // Must be true
     }
   }
   ```

2. Verify Azure CLI access:
   ```bash
   az boards work-item create --title "Test" --type Task --project YOUR-PROJECT
   ```

3. Check permissions in Azure DevOps (need "Contributor" role)

---

#### 5. "Azure CLI extension not found"

**Symptom:**
```
⚠ Failed to create work item: az boards: command not found
```

**Solution:**
```bash
# Install Azure DevOps extension
az extension add --name azure-devops

# Verify installation
az extension list --output table
```

---

### Validation Commands

Run these commands to diagnose issues:

```bash
# 1. Check Azure CLI
az --version

# 2. Check authentication
az account show

# 3. Check Azure DevOps extension
az extension show --name azure-devops

# 4. Check defaults
az devops configure --list

# 5. Test work item creation
az boards work-item create \
  --title "Test Work Item" \
  --type Task \
  --project YOUR-PROJECT

# 6. Run built-in validator
npx agentic15 validate-azure
```

---

## Architecture

### Component Overview

```
┌─────────────────────────────────────────────────┐
│           Task Management System                │
└─────────────────┬───────────────────────────────┘
                  │
                  v
        ┌─────────────────┐
        │ PlatformRouter  │ ← Unified API
        └────────┬────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
    v                         v
┌──────────────┐      ┌──────────────┐
│ GitHubClient │      │ WorkItemSync │
└──────────────┘      └──────────────┘
    │                         │
    v                         v
┌──────────────┐      ┌──────────────┐
│ GitHub API   │      │ Azure CLI    │
└──────────────┘      └──────────────┘
```

### Key Components

#### PlatformRouter
**Location:** `src/core/Platform/PlatformRouter.js`

Unified interface that routes operations to the correct platform.

```javascript
class PlatformRouter {
  getPlatform()           // Returns 'github' or 'azure'
  getClient()             // Returns platform-specific client
  createTaskItem(task)    // Create issue/work item
  updateTaskItem(task)    // Update issue/work item
  closeTaskItem(itemId)   // Close issue/work item
  addComment(itemId, text)// Add comment
}
```

#### PlatformDetector
**Location:** `src/core/Platform/PlatformDetector.js`

Detects which platform to use based on git remote and configuration.

```javascript
class PlatformDetector {
  static detect()              // Detect platform
  static parseRemoteURL(url)   // Parse git remote URL
  static clearCache()          // Clear detection cache
}
```

#### WorkItemSync
**Location:** `src/core/Azure/WorkItemSync.js`

Orchestrates Azure DevOps work item operations.

```javascript
class WorkItemSync {
  createWorkItem(task)              // Create work item
  updateWorkItemStatus(task, id)    // Update state
  closeWorkItem(task, id, comment)  // Close work item
  syncTask(task, id, action)        // Sync task lifecycle
}
```

#### AzureDevOpsClient
**Location:** `src/core/Azure/AzureDevOpsClient.js`

Executes Azure CLI commands for work item operations.

```javascript
class AzureDevOpsClient {
  createWorkItem(title, desc, tags) // Create via CLI
  updateWorkItemState(id, state)    // Update state via CLI
  addWorkItemComment(id, comment)   // Add comment via CLI
  closeWorkItem(id, comment)        // Close via CLI
}
```

#### AzureDevOpsConfig
**Location:** `src/core/Azure/AzureDevOpsConfig.js`

Loads and validates Azure DevOps configuration.

```javascript
class AzureDevOpsConfig {
  isEnabled()              // Check if enabled
  getOrganization()        // Get organization name
  getProject()             // Get project name
  isAutoCreateEnabled()    // Check autoCreate flag
  isAutoUpdateEnabled()    // Check autoUpdate flag
  isAutoCloseEnabled()     // Check autoClose flag
}
```

### Complete Isolation

GitHub and Azure implementations are completely isolated:

- **Separate configuration classes** - `GitHubConfig` vs `AzureDevOpsConfig`
- **Separate clients** - `GitHubClient` vs `AzureDevOpsClient`
- **Separate mappers** - `TaskIssueMapper` vs `TaskWorkItemMapper`
- **Separate authentication** - GitHub CLI vs Azure CLI
- **No shared state** - Each platform manages its own data

This ensures:
- ✅ No breaking changes to existing GitHub integration
- ✅ Azure changes don't affect GitHub
- ✅ Can enable both platforms simultaneously
- ✅ Easy to add more platforms in the future

---

## GitHub vs Azure Comparison

| Feature | GitHub Issues | Azure DevOps Work Items |
|---------|--------------|-------------------------|
| **Authentication** | `gh auth login` | `az login` |
| **CLI Tool** | GitHub CLI (`gh`) | Azure CLI (`az`) |
| **Token Storage** | Managed by `gh` CLI | Managed by `az` CLI |
| **Item Creation** | `gh issue create` | `az boards work-item create` |
| **State Updates** | Labels (`status: in-progress`) | Work item state (`Active`) |
| **Comments** | `gh issue comment` | `az boards work-item update` |
| **Closure** | `gh issue close` | `az boards work-item update --state Closed` |
| **Configuration** | `.claude/settings.json` → `github` | `.claude/settings.json` → `azureDevOps` |
| **Feature Flags** | `autoCreate`, `autoUpdate`, `autoClose` | `autoCreate`, `autoUpdate`, `autoClose` |
| **Platform Detection** | `github.com` in git remote | `dev.azure.com` in git remote |

### Unified API

Both platforms use the same API through `PlatformRouter`:

```javascript
// Same code works for both platforms
const router = new PlatformRouter();

// Platform automatically detected
const platform = router.getPlatform(); // 'github' or 'azure'

// Operations route to correct platform
await router.createTaskItem(task);    // GitHub Issue OR Azure Work Item
await router.updateTaskItem(task, id);
await router.closeTaskItem(id);
```

---

## Testing

### Run Tests

```bash
# All Azure tests
npm run test:azure

# Specific test suites
node Agent/test/azure/authentication.test.js
node Agent/test/azure/validator.test.js
node Agent/test/azure/work-items.test.js
node Agent/test/azure/work-item-sync.test.js

# Platform router tests
node Agent/test/platform/router.test.js

# Platform detection tests
node Agent/test/platform/detection.test.js
```

### Test Coverage

- **Authentication:** 17 tests - CLI auth, config loading, isolation
- **Validator:** 13 tests - Setup validation, CLI detection
- **Work Items:** 31 tests - CRUD operations, error handling
- **Work Item Sync:** 19 tests - Task lifecycle, feature flags
- **Platform Router:** 20 tests - Platform detection, routing
- **Platform Detection:** 18 tests - URL parsing, feature flags

**Total:** 118 Azure-specific tests

---

## Security Considerations

### CLI-Based Authentication

The integration uses CLI-based authentication (not PAT tokens) for security:

✅ **No token storage** - Credentials managed by Azure CLI
✅ **System keychain** - Azure CLI uses OS-native secure storage
✅ **Token refresh** - Azure CLI handles token expiration
✅ **MFA support** - Full support for multi-factor authentication
✅ **Conditional access** - Supports Azure AD conditional access policies

### Permissions Required

Minimum Azure DevOps permissions:

- **Project:** Contributor role
- **Work Items:** Create, read, update
- **Area Paths:** Read
- **Iterations:** Read

### Recommended Practices

1. **Use Azure CLI** - Don't use Personal Access Tokens
2. **Enable MFA** - Require multi-factor authentication
3. **Limit scope** - Only grant necessary permissions
4. **Audit logs** - Monitor work item creation/updates
5. **Rotate credentials** - Re-login periodically (`az login`)

---

## Migration Guide

### From GitHub to Azure DevOps

If you're migrating from GitHub Issues to Azure DevOps Work Items:

1. **Update git remote:**
   ```bash
   git remote set-url origin https://dev.azure.com/ORG/PROJECT/_git/REPO
   ```

2. **Authenticate with Azure:**
   ```bash
   az login
   az devops configure --defaults organization=https://dev.azure.com/ORG
   az devops configure --defaults project=PROJECT
   ```

3. **Update settings:**
   ```json
   {
     "github": {
       "enabled": false  // Disable GitHub
     },
     "azureDevOps": {
       "enabled": true,  // Enable Azure
       "organization": "ORG",
       "project": "PROJECT"
     }
   }
   ```

4. **Verify detection:**
   ```javascript
   import { PlatformDetector } from './src/core/Platform/PlatformDetector.js';
   console.log(PlatformDetector.detect()); // Should show 'azure'
   ```

### Using Both Platforms

You can use both GitHub and Azure simultaneously:

```json
{
  "github": {
    "enabled": true,
    "token": "ghp_xxx",
    "owner": "my-org",
    "repo": "github-repo"
  },
  "azureDevOps": {
    "enabled": true,
    "organization": "my-azure-org",
    "project": "azure-project"
  },
  "platform": {
    "type": "azure",      // Choose which to use
    "autoDetect": false   // Disable auto-detection
  }
}
```

Platform selection is based on:
- Git remote URL (if `autoDetect: true`)
- Explicit override (if `autoDetect: false`)

---

## Additional Resources

- [Azure Authentication Guide](./azure-authentication.md) - Detailed auth setup
- [Platform Detection Guide](./platform-detection.md) - How platform detection works
- [Feature Flags Guide](./feature-flags.md) - Configuring feature flags
- [Folder Structure](./azure-folder-structure.md) - Azure code organization

### Azure DevOps Documentation

- [Azure CLI Documentation](https://docs.microsoft.com/cli/azure/)
- [Azure DevOps CLI Reference](https://docs.microsoft.com/cli/azure/devops)
- [Work Items API](https://docs.microsoft.com/rest/api/azure/devops/wit/)

### Support

For issues or questions:
- GitHub Issues: [agentic15/agentic15-claude-zen/issues](https://github.com/agentic15/agentic15-claude-zen/issues)
- Documentation: [Agent/docs/](../docs/)

---

## Changelog

### Version 1.0.0 (2025-01-XX)

**Initial Release**
- ✅ Azure DevOps Work Items integration
- ✅ CLI-based authentication (Azure CLI)
- ✅ Platform auto-detection
- ✅ Task lifecycle synchronization
- ✅ Complete GitHub/Azure isolation
- ✅ Feature flags for granular control
- ✅ Comprehensive test coverage (118 tests)

---

**Last Updated:** 2025-01-XX
**Version:** 1.0.0
**Status:** Stable
