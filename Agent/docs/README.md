# Agentic15 Claude Zen Documentation

Comprehensive documentation for Azure DevOps and GitHub integration.

## Quick Links

### Getting Started
- **[Azure Integration Guide](./azure-integration-guide.md)** - Complete setup and usage guide
- **[Quick Reference](./azure-quick-reference.md)** - Fast reference for common tasks
- **[Platform Comparison](./platform-comparison.md)** - GitHub vs Azure comparison & migration

### Technical Details
- **[Azure Authentication](./azure-authentication.md)** - CLI-based authentication explained
- **[Platform Detection](./platform-detection.md)** - How platform auto-detection works
- **[Feature Flags](./feature-flags.md)** - Configuration options
- **[Folder Structure](./azure-folder-structure.md)** - Azure code organization

---

## Documentation Index

### For Users

| Document | Description | When to Use |
|----------|-------------|-------------|
| [Azure Integration Guide](./azure-integration-guide.md) | Complete setup, configuration, and usage | First-time setup, reference |
| [Quick Reference](./azure-quick-reference.md) | Common commands and configurations | Daily operations, troubleshooting |
| [Platform Comparison](./platform-comparison.md) | GitHub vs Azure comparison & migration | Choosing platform, migration |
| [Azure Authentication](./azure-authentication.md) | Authentication setup and security | Setup, auth issues |

### For Developers

| Document | Description | When to Use |
|----------|-------------|-------------|
| [Platform Detection](./platform-detection.md) | Platform detection algorithm | Understanding routing |
| [Folder Structure](./azure-folder-structure.md) | Code organization | Contributing, extending |
| [Feature Flags](./feature-flags.md) | Feature flag system | Configuration, testing |

---

## Quick Start

### Azure DevOps Integration

**5-Minute Setup:**

1. Install Azure CLI:
   ```bash
   winget install -e --id Microsoft.AzureCLI  # Windows
   brew install azure-cli                     # macOS
   ```

2. Install extension and authenticate:
   ```bash
   az extension add --name azure-devops
   az login
   ```

3. Configure defaults:
   ```bash
   az devops configure --defaults \
     organization=https://dev.azure.com/YOUR-ORG \
     project=YOUR-PROJECT
   ```

4. Enable in `.claude/settings.json`:
   ```json
   {
     "azureDevOps": {
       "enabled": true,
       "organization": "YOUR-ORG",
       "project": "YOUR-PROJECT"
     }
   }
   ```

✅ **Done!** Work items will now sync automatically with your tasks.

**[→ Full Setup Guide](./azure-integration-guide.md)**

---

## Features

### Dual-Platform Support

✅ **GitHub Issues** - Via GitHub CLI (`gh`)
✅ **Azure DevOps Work Items** - Via Azure CLI (`az`)
✅ **Automatic Detection** - Based on git remote URL
✅ **Complete Isolation** - Independent implementations
✅ **Unified API** - Same code for both platforms

### Task Lifecycle Integration

- **Auto-create** - Work items created when tasks are created
- **Auto-update** - State updated when task status changes
- **Auto-close** - Work items closed when tasks complete
- **Comments** - Add comments to work items
- **Tags** - Sync task tags to work item tags

### Security

- **CLI-based auth** - No token storage required
- **System keychain** - Credentials managed by OS
- **MFA support** - Full multi-factor authentication
- **Token refresh** - Automatic token management

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│       Agentic15 Claude Zen              │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │      PlatformRouter              │  │
│  │  (Unified Task Management API)   │  │
│  └────────────┬─────────────────────┘  │
│               │                         │
│    ┌──────────┴──────────┐             │
│    │                     │             │
│    v                     v             │
│  ┌──────────┐      ┌──────────┐       │
│  │ GitHub   │      │  Azure   │       │
│  │ Issues   │      │  DevOps  │       │
│  └──────────┘      └──────────┘       │
│      │                   │             │
└──────┼───────────────────┼─────────────┘
       │                   │
       v                   v
   ┌────────┐        ┌──────────┐
   │   gh   │        │    az    │
   │  CLI   │        │   CLI    │
   └────────┘        └──────────┘
```

**[→ Architecture Details](./azure-integration-guide.md#architecture)**

---

## Configuration Reference

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

### Complete Configuration

```json
{
  "azureDevOps": {
    "enabled": true,
    "organization": "YOUR-ORG",
    "project": "YOUR-PROJECT",
    "autoCreate": true,
    "autoUpdate": true,
    "autoClose": true,
    "workItemType": "Task"
  },
  "platform": {
    "type": "azure",
    "autoDetect": false
  }
}
```

**[→ Full Configuration Guide](./azure-integration-guide.md#configuration)**

---

## Testing

### Run All Tests

```bash
# Azure tests (100 tests)
node Agent/test/azure/authentication.test.js    # 17 tests
node Agent/test/azure/validator.test.js         # 13 tests
node Agent/test/azure/work-items.test.js        # 31 tests
node Agent/test/azure/work-item-sync.test.js    # 19 tests

# Platform tests (38 tests)
node Agent/test/platform/router.test.js         # 20 tests
node Agent/test/platform/detection.test.js      # 18 tests

# GitHub tests (56 tests)
node Agent/test/github-integration.test.js      # 27 tests
node Agent/test/config/feature-flags.test.js    # 11 tests
node Agent/test/platform/detection.test.js      # 18 tests
```

**Total: 156 tests**

---

## Troubleshooting

### Common Issues

| Issue | Quick Fix | Details |
|-------|-----------|---------|
| Not authenticated | `az login` | [Auth Guide](./azure-authentication.md) |
| Missing extension | `az extension add --name azure-devops` | [Setup](./azure-integration-guide.md#prerequisites) |
| Wrong org/project | Check `az devops configure --list` | [Config](./azure-integration-guide.md#configuration) |
| Platform is GitHub | Set platform override in settings | [Detection](./platform-detection.md) |
| Work items not creating | Check `autoCreate: true` | [Feature Flags](./feature-flags.md) |

**[→ Full Troubleshooting Guide](./azure-integration-guide.md#troubleshooting)**

---

## Comparison: GitHub vs Azure

| Feature | GitHub Issues | Azure DevOps |
|---------|---------------|--------------|
| Authentication | `gh auth login` | `az login` |
| CLI Tool | `gh` | `az` |
| Create Item | `gh issue create` | `az boards work-item create` |
| State Updates | Labels | Work item states |
| Comments | `gh issue comment` | `az boards work-item update` |
| Detection | `github.com` in remote | `dev.azure.com` in remote |

**Both platforms use the same API through PlatformRouter.**

---

## Contributing

### Adding a New Platform

To add support for a new platform (GitLab, Bitbucket, etc.):

1. Create config class: `src/core/Platform/NewPlatformConfig.js`
2. Create client class: `src/core/Platform/NewPlatformClient.js`
3. Create mapper class: `src/core/Platform/NewPlatformMapper.js`
4. Update `PlatformDetector.parseRemoteURL()`
5. Update `PlatformRouter._initializeClients()`
6. Add tests in `test/platform/`
7. Add documentation in `docs/`

**[→ Folder Structure](./azure-folder-structure.md)**

---

## API Reference

### PlatformRouter

```javascript
import { PlatformRouter } from './src/core/Platform/PlatformRouter.js';

const router = new PlatformRouter(projectRoot);

// Platform detection
router.getPlatform()              // 'github' | 'azure' | null
router.isGitHub()                 // boolean
router.isAzure()                  // boolean
router.getPlatformName()          // 'GitHub' | 'Azure DevOps' | 'None'

// Client access
router.getClient()                // GitHubClient | WorkItemSync | null
router.isConfigured()             // boolean

// Operations
await router.createTaskItem(task)       // Create issue/work item
await router.updateTaskItem(task, id)   // Update issue/work item
await router.closeTaskItem(id, comment) // Close issue/work item
await router.addComment(id, comment)    // Add comment
```

### PlatformDetector

```javascript
import { PlatformDetector } from './src/core/Platform/PlatformDetector.js';

// Detection
PlatformDetector.detect(useCache, projectRoot)  // Detect platform
PlatformDetector.parseRemoteURL(url)            // Parse git URL
PlatformDetector.clearCache()                   // Clear cache

// Validation
PlatformDetector.isSupported(platform)          // Check if supported
PlatformDetector.getPlatformName(platform)      // Get display name
```

### WorkItemSync

```javascript
import { WorkItemSync } from './src/core/Azure/WorkItemSync.js';

const sync = new WorkItemSync(projectRoot);

// Status
sync.isEnabled()                              // Check if enabled

// Operations
await sync.createWorkItem(task)               // Create work item
await sync.updateWorkItemStatus(task, id)     // Update state
await sync.updateWorkItemTags(task, id)       // Update tags
await sync.addWorkItemComment(id, comment)    // Add comment
await sync.closeWorkItem(task, id, comment)   // Close work item

// Lifecycle
await sync.syncTask(task, id, action)         // Sync task lifecycle
await sync.syncTasks(tasks, action)           // Batch sync

// Retrieval
await sync.getWorkItem(id)                    // Get work item
await sync.workItemExists(id)                 // Check existence
```

---

## Support

- **Issues:** [GitHub Issues](https://github.com/agentic15/agentic15-claude-zen/issues)
- **Documentation:** [Agent/docs/](.)
- **Tests:** [Agent/test/](../test/)

---

## License

Copyright 2024-2025 agentic15.com

Licensed under the Apache License, Version 2.0

---

**Last Updated:** 2025-01-XX
**Version:** 1.0.0
