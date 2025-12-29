# Azure DevOps Integration

This folder contains all Azure DevOps-specific integration code.

## Structure

```
Azure/
├── AzureDevOpsConfig.js      # Configuration loader for Azure DevOps
├── AzureDevOpsClient.js      # Azure DevOps API client
├── TaskWorkItemMapper.js     # Maps tasks to Azure work items
└── README.md                 # This file
```

## Components

### AzureDevOpsConfig
Loads Azure DevOps configuration from:
1. Environment variables (highest priority)
2. `.claude/settings.local.json` (user-specific)
3. `.claude/settings.json` (defaults)

**Settings:**
```json
{
  "azureDevOps": {
    "enabled": false,
    "token": "your-pat-token",
    "organization": "your-org",
    "project": "your-project",
    "autoCreate": false,
    "autoUpdate": false,
    "autoClose": false
  }
}
```

### AzureDevOpsClient
Handles Azure DevOps API operations:
- Create work items
- Update work item tags
- Add comments
- Close work items

### TaskWorkItemMapper
Converts internal task format to Azure DevOps work item format.

## Isolation Guarantee

**CRITICAL:** This folder is completely isolated from GitHub integration.

- ✅ No imports from `../GitHub/`
- ✅ No shared state
- ✅ Independent configuration
- ✅ Separate authentication

## Usage

```javascript
import { AzureDevOpsConfig } from './core/Azure/AzureDevOpsConfig.js';
import { AzureDevOpsClient } from './core/Azure/AzureDevOpsClient.js';

const config = new AzureDevOpsConfig();
const client = new AzureDevOpsClient(config);

if (config.isEnabled()) {
  await client.createWorkItem(title, description);
}
```

## Environment Variables

- `AZURE_DEVOPS_TOKEN` - Personal Access Token
- `AZURE_DEVOPS_ORGANIZATION` - Organization name
- `AZURE_DEVOPS_PROJECT` - Project name
- `AZURE_DEVOPS_ENABLED` - Enable/disable flag

## See Also

- [Folder Structure Design](../../docs/azure-folder-structure.md)
- [Feature Flag Documentation](../../docs/feature-flags.md)
