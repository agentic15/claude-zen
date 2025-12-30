# Azure DevOps Quick Reference

Fast reference for common Azure DevOps integration tasks.

## Setup (One-Time)

```bash
# 1. Install Azure CLI
winget install -e --id Microsoft.AzureCLI  # Windows
brew install azure-cli                     # macOS

# 2. Install Azure DevOps extension
az extension add --name azure-devops

# 3. Login to Azure
az login

# 4. Configure defaults
az devops configure --defaults \
  organization=https://dev.azure.com/YOUR-ORG \
  project=YOUR-PROJECT

# 5. Enable in settings.json
{
  "azureDevOps": {
    "enabled": true,
    "organization": "YOUR-ORG",
    "project": "YOUR-PROJECT"
  }
}
```

---

## Common Commands

### Verify Authentication
```bash
# Check if logged in
az account show

# Check Azure DevOps access
az devops project show --project YOUR-PROJECT
```

### Check Configuration
```bash
# View current defaults
az devops configure --list

# View settings
cat .claude/settings.json
```

### Test Work Item Creation
```bash
# Create test work item
az boards work-item create \
  --title "Test Work Item" \
  --type Task \
  --project YOUR-PROJECT \
  --output table
```

### Platform Detection
```javascript
// Check detected platform
import { PlatformDetector } from './src/core/Platform/PlatformDetector.js';
console.log(PlatformDetector.detect()); // 'azure' or 'github'
```

---

## Configuration Quick Copy

### Minimal Configuration
```json
{
  "azureDevOps": {
    "enabled": true,
    "organization": "YOUR-ORG",
    "project": "YOUR-PROJECT"
  }
}
```

### Full Configuration
```json
{
  "azureDevOps": {
    "enabled": true,
    "organization": "YOUR-ORG",
    "project": "YOUR-PROJECT",
    "autoCreate": true,
    "autoUpdate": true,
    "autoClose": true,
    "workItemType": "Task",
    "areaPath": null,
    "iterationPath": null
  }
}
```

### Force Azure Platform
```json
{
  "platform": {
    "type": "azure",
    "autoDetect": false
  },
  "azureDevOps": {
    "enabled": true,
    "organization": "YOUR-ORG",
    "project": "YOUR-PROJECT"
  }
}
```

---

## Troubleshooting Quick Fixes

### Not Authenticated
```bash
az login
```

### Missing Extension
```bash
az extension add --name azure-devops
```

### Wrong Organization/Project
```bash
az devops configure --defaults \
  organization=https://dev.azure.com/CORRECT-ORG \
  project=CORRECT-PROJECT
```

### Work Items Not Creating
```json
{
  "azureDevOps": {
    "enabled": true,        // Check this
    "autoCreate": true      // Check this
  }
}
```

### Platform Detected as GitHub
```json
{
  "platform": {
    "type": "azure",
    "autoDetect": false
  }
}
```

---

## Status Mapping

| Task Status | Azure Work Item State |
|-------------|----------------------|
| `pending` | `New` |
| `in_progress` | `Active` |
| `completed` | `Closed` |
| `blocked` | `New` (+ `blocked` tag) |

---

## Feature Flags

| Flag | Description |
|------|-------------|
| `enabled` | Master switch |
| `autoCreate` | Create work items for new tasks |
| `autoUpdate` | Update state on status changes |
| `autoClose` | Close work items when tasks complete |

---

## Testing

```bash
# Run all Azure tests
node Agent/test/azure/authentication.test.js
node Agent/test/azure/validator.test.js
node Agent/test/azure/work-items.test.js
node Agent/test/azure/work-item-sync.test.js
node Agent/test/platform/router.test.js
```

---

## Validation Checklist

- [ ] Azure CLI installed (`az --version`)
- [ ] Azure DevOps extension installed (`az extension list`)
- [ ] Authenticated (`az account show`)
- [ ] Defaults configured (`az devops configure --list`)
- [ ] Settings.json has `azureDevOps.enabled: true`
- [ ] Organization and project set in settings
- [ ] Git remote is Azure DevOps URL (or platform override set)
- [ ] Can create test work item manually

---

## Code Examples

### Using PlatformRouter
```javascript
import { PlatformRouter } from './src/core/Platform/PlatformRouter.js';

const router = new PlatformRouter();

// Check platform
console.log(router.getPlatform()); // 'azure'

// Create work item
const task = {
  id: 'TASK-001',
  title: 'My Task',
  description: 'Task description',
  tags: ['backend']
};

const workItemId = await router.createTaskItem(task);
console.log(`Created: #${workItemId}`);
```

### Manual Work Item Creation
```javascript
import { WorkItemSync } from './src/core/Azure/WorkItemSync.js';

const sync = new WorkItemSync();

const task = {
  id: 'TASK-001',
  title: 'My Task',
  description: 'Description'
};

const workItemId = await sync.createWorkItem(task);
```

---

## URLs and Patterns

### Git Remote Patterns
```bash
# Azure DevOps HTTPS
https://dev.azure.com/ORGANIZATION/PROJECT/_git/REPOSITORY

# Azure DevOps SSH
git@ssh.dev.azure.com:v3/ORGANIZATION/PROJECT/REPOSITORY

# Legacy Visual Studio URL
https://ORGANIZATION.visualstudio.com/PROJECT/_git/REPOSITORY
```

### Work Item URL
```
https://dev.azure.com/ORGANIZATION/PROJECT/_workitems/edit/WORK-ITEM-ID
```

---

## Environment Variables

```bash
# Optional environment variable overrides
export AZURE_DEVOPS_ORGANIZATION="my-org"
export AZURE_DEVOPS_PROJECT="my-project"
```

---

**See Also:**
- [Full Integration Guide](./azure-integration-guide.md)
- [Authentication Details](./azure-authentication.md)
- [Platform Detection](./platform-detection.md)
