# Feature Flags - Azure DevOps Integration

## Configuration Schema

Add to `.claude/settings.json`:

```json
{
  "azureDevOps": {
    "enabled": false,
    "autoCreate": false,
    "autoUpdate": false,
    "autoClose": false,
    "organization": null,
    "project": null,
    "comment": "Azure DevOps integration. Requires AZURE_DEVOPS_PAT env var. Org/project auto-detected from git remote."
  }
}
```

## Defaults

- `enabled: false` - **MUST default to false** to not affect existing GitHub workflows
- All auto-features disabled by default
- Mirrors GitHub config structure for consistency

## Implementation Notes

- Feature flag checked before ANY Azure operations
- GitHub integration remains completely independent
- Both can be enabled simultaneously (platform detection routes appropriately)
- Auth via `AZURE_DEVOPS_PAT` environment variable (NOT in settings files)
- Config merged from settings.json → settings.local.json (local overrides base)

## Validation Rules

1. `enabled` must be boolean
2. Azure operations throw error if `enabled === false`
3. Require PAT token when enabled
4. Organization/project auto-detected from git remote URL if null

---
**Schema Version**: 1.0
