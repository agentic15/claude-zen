# Azure DevOps Folder Structure Design

## Overview

This document defines the folder structure and naming conventions for Azure DevOps integration, designed to mirror the GitHub integration while maintaining complete isolation.

## Design Principles

1. **Parallel Structure**: Mirror GitHub's organization for consistency
2. **Complete Isolation**: No shared code or state between GitHub and Azure
3. **Clear Naming**: Prefix Azure-specific files for easy identification
4. **Maintainability**: Similar patterns make codebase easier to understand
5. **Separation of Concerns**: Each module has a single, well-defined responsibility

## Folder Structure

```
Agent/
├── src/
│   ├── cli/
│   │   ├── AuthCommand.js              # Handles both GitHub & Azure auth
│   │   ├── CommitCommand.js            # Uses platform detection
│   │   ├── TaskCommand.js              # Uses platform detection
│   │   └── SyncCommand.js              # Uses platform detection
│   │
│   ├── core/
│   │   ├── GitHub/                     # GitHub-specific (NEW)
│   │   │   ├── GitHubClient.js         # Moved from core/
│   │   │   ├── GitHubConfig.js         # Moved from core/
│   │   │   └── TaskIssueMapper.js      # Moved from core/
│   │   │
│   │   ├── Azure/                      # Azure-specific (NEW)
│   │   │   ├── AzureDevOpsClient.js    # Moved from core/
│   │   │   ├── AzureDevOpsConfig.js    # Moved from core/
│   │   │   └── TaskWorkItemMapper.js   # NEW - Maps tasks to work items
│   │   │
│   │   ├── Platform/                   # Platform detection (NEW)
│   │   │   ├── PlatformDetector.js     # Detects GitHub vs Azure
│   │   │   └── PlatformRouter.js       # Routes to correct platform
│   │   │
│   │   ├── DependencyInstaller.js      # Shared utility
│   │   ├── GitInitializer.js           # Shared utility
│   │   ├── HookInstaller.js            # Shared utility
│   │   ├── ProjectInitializer.js       # Shared utility
│   │   └── TemplateManager.js          # Shared utility
│   │
│   ├── utils/
│   │   ├── updateTaskGitHubStatus.js   # GitHub-specific
│   │   └── updateTaskAzureStatus.js    # Azure-specific (NEW)
│   │
│   └── index.js
│
├── test/
│   ├── config/
│   │   └── feature-flags.test.js       # Feature flag tests
│   │
│   ├── github-integration.test.js      # GitHub tests
│   ├── manual-github-test.js           # Manual GitHub tests
│   ├── azure-integration.test.js       # Azure tests (NEW)
│   └── manual-azure-test.js            # Manual Azure tests (NEW)
│
└── docs/
    ├── azure-folder-structure.md       # This document
    └── feature-flags.md                # Feature flag docs
```

## Naming Conventions

### File Naming

| Component | GitHub Pattern | Azure Pattern | Example |
|-----------|----------------|---------------|---------|
| Config | `GitHubConfig.js` | `AzureDevOpsConfig.js` | Configuration loaders |
| Client | `GitHubClient.js` | `AzureDevOpsClient.js` | API clients |
| Mapper | `TaskIssueMapper.js` | `TaskWorkItemMapper.js` | Entity mappers |
| Utils | `updateTaskGitHubStatus.js` | `updateTaskAzureStatus.js` | Utility functions |
| Tests | `github-integration.test.js` | `azure-integration.test.js` | Test files |

### Class Naming

| Purpose | GitHub Class | Azure Class |
|---------|--------------|-------------|
| Configuration | `GitHubConfig` | `AzureDevOpsConfig` |
| API Client | `GitHubClient` | `AzureDevOpsClient` |
| Entity Mapping | `TaskIssueMapper` | `TaskWorkItemMapper` |
| Platform Detection | N/A | `PlatformDetector` |
| Platform Routing | N/A | `PlatformRouter` |

### Settings Keys

| Setting | GitHub | Azure |
|---------|--------|-------|
| Root key | `github` | `azureDevOps` |
| Enabled flag | `github.enabled` | `azureDevOps.enabled` |
| Token | `github.token` | `azureDevOps.token` |
| Repository | `github.owner` / `github.repo` | `azureDevOps.organization` / `azureDevOps.project` |
| Auto-create | `github.autoCreate` | `azureDevOps.autoCreate` |
| Auto-update | `github.autoUpdate` | `azureDevOps.autoUpdate` |
| Auto-close | `github.autoClose` | `azureDevOps.autoClose` |

### Environment Variables

| Purpose | GitHub | Azure |
|---------|--------|-------|
| Token | `GITHUB_TOKEN` | `AZURE_DEVOPS_TOKEN` |
| Owner/Org | `GITHUB_OWNER` | `AZURE_DEVOPS_ORGANIZATION` |
| Repo/Project | `GITHUB_REPO` | `AZURE_DEVOPS_PROJECT` |
| Enabled | `GITHUB_ENABLED` | `AZURE_DEVOPS_ENABLED` |

## File Organization Details

### Core Classes (Agent/src/core/)

#### GitHub Subfolder
- **GitHubConfig.js**: Loads GitHub configuration from settings
- **GitHubClient.js**: GitHub API interactions (issues, comments, labels)
- **TaskIssueMapper.js**: Converts tasks to GitHub issue format

#### Azure Subfolder
- **AzureDevOpsConfig.js**: Loads Azure DevOps configuration from settings
- **AzureDevOpsClient.js**: Azure DevOps API interactions (work items, comments)
- **TaskWorkItemMapper.js**: Converts tasks to Azure work item format

#### Platform Subfolder (NEW)
- **PlatformDetector.js**: Detects which platform the repo uses
  - Checks git remote URL
  - Checks .git/config
  - Checks feature flags
- **PlatformRouter.js**: Routes operations to correct platform
  - Single interface for both platforms
  - Delegates to GitHub or Azure based on detection

### Utilities (Agent/src/utils/)

- **updateTaskGitHubStatus.js**: Updates GitHub issue status when task changes
- **updateTaskAzureStatus.js**: Updates Azure work item status when task changes

### Tests (Agent/test/)

- **github-integration.test.js**: Tests for GitHub classes
- **azure-integration.test.js**: Tests for Azure DevOps classes
- **config/feature-flags.test.js**: Tests for feature flag isolation

## Migration Path

### Phase 1: Current State ✅
- [x] Created `AzureDevOpsConfig.js` and `AzureDevOpsClient.js` in `core/`
- [x] Feature flag tests ensure isolation

### Phase 2: Reorganization (Optional)
- [ ] Create `core/GitHub/` subfolder
- [ ] Move GitHub files to subfolder
- [ ] Create `core/Azure/` subfolder
- [ ] Move Azure files to subfolder
- [ ] Update import paths

### Phase 3: Platform Detection
- [ ] Create `core/Platform/` subfolder
- [ ] Implement `PlatformDetector.js`
- [ ] Implement `PlatformRouter.js`
- [ ] Update CLI commands to use router

### Phase 4: Complete Azure Implementation
- [ ] Create `TaskWorkItemMapper.js`
- [ ] Create `updateTaskAzureStatus.js`
- [ ] Implement Azure API operations
- [ ] Create Azure integration tests

## Isolation Guarantees

### Configuration Isolation
- ✅ Separate configuration objects (`github` vs `azureDevOps`)
- ✅ Separate tokens (no shared credentials)
- ✅ Separate environment variables
- ✅ Independent enable/disable flags

### Code Isolation
- ✅ No shared state between GitHub and Azure classes
- ✅ No imports from GitHub classes into Azure (and vice versa)
- ✅ Platform router provides single interface without coupling

### Data Isolation
- ✅ Separate entity mappers (issues vs work items)
- ✅ Separate API clients
- ✅ Separate utility functions

## Example Usage

### Configuration (`.claude/settings.local.json`)

```json
{
  "github": {
    "enabled": true,
    "token": "ghp_xxxxxxxxxxxx",
    "owner": "myorg",
    "repo": "myrepo",
    "autoCreate": true,
    "autoUpdate": true,
    "autoClose": true
  },
  "azureDevOps": {
    "enabled": false,
    "token": "xxxxxxxxxxxxxxxx",
    "organization": "myorg",
    "project": "myproject",
    "autoCreate": false,
    "autoUpdate": false,
    "autoClose": false
  }
}
```

### Import Patterns

```javascript
// GitHub integration
import { GitHubConfig } from './core/GitHub/GitHubConfig.js';
import { GitHubClient } from './core/GitHub/GitHubClient.js';
import { TaskIssueMapper } from './core/GitHub/TaskIssueMapper.js';

// Azure integration
import { AzureDevOpsConfig } from './core/Azure/AzureDevOpsConfig.js';
import { AzureDevOpsClient } from './core/Azure/AzureDevOpsClient.js';
import { TaskWorkItemMapper } from './core/Azure/TaskWorkItemMapper.js';

// Platform detection
import { PlatformDetector } from './core/Platform/PlatformDetector.js';
import { PlatformRouter } from './core/Platform/PlatformRouter.js';
```

### Platform Router Pattern

```javascript
// Unified interface - no need to know which platform
const router = new PlatformRouter();
await router.createTaskItem(task);  // Creates GitHub issue OR Azure work item
await router.updateTaskStatus(taskId, status);
await router.closeTask(taskId);
```

## Conflict Prevention

### No Name Conflicts
- ✅ Different class names (`GitHubClient` vs `AzureDevOpsClient`)
- ✅ Different file names
- ✅ Different settings keys

### No Path Conflicts
- ✅ Files in separate subfolders (after reorganization)
- ✅ No overlapping import paths

### No Runtime Conflicts
- ✅ Independent configuration loading
- ✅ Separate API clients
- ✅ Feature flag protection

## Summary

This design ensures:

1. **Consistency**: Azure follows same patterns as GitHub
2. **Isolation**: Complete separation prevents interference
3. **Clarity**: Clear naming makes code self-documenting
4. **Maintainability**: Parallel structure is easy to understand
5. **Extensibility**: Adding more platforms follows same pattern

The folder structure supports both platforms independently while providing a unified interface through the platform router.
