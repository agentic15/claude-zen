# Platform Comparison & Migration Guide

Detailed comparison between GitHub Issues and Azure DevOps Work Items integration.

## Table of Contents

- [Feature Comparison](#feature-comparison)
- [When to Use Each Platform](#when-to-use-each-platform)
- [Migration Scenarios](#migration-scenarios)
- [Dual-Platform Setup](#dual-platform-setup)
- [Differences in Behavior](#differences-in-behavior)

---

## Feature Comparison

### Authentication

| Aspect | GitHub Issues | Azure DevOps Work Items |
|--------|---------------|------------------------|
| **CLI Tool** | GitHub CLI (`gh`) | Azure CLI (`az`) |
| **Auth Command** | `gh auth login` | `az login` |
| **Token Storage** | GitHub CLI keychain | Azure CLI keychain |
| **Token Type** | GitHub Personal Access Token | Azure AD OAuth token |
| **MFA Support** | ✅ Yes | ✅ Yes |
| **Conditional Access** | ❌ No | ✅ Yes (Azure AD) |
| **Auto Refresh** | ✅ Yes | ✅ Yes |
| **Manual Token** | ⚠️ Optional (auto-fetched) | ❌ Not supported |

**Winner:** Tie - Both use secure CLI-based authentication

---

### Setup Complexity

| Step | GitHub Issues | Azure DevOps Work Items |
|------|---------------|------------------------|
| **1. Install CLI** | `brew install gh` | `brew install azure-cli` |
| **2. Install Extension** | ❌ Not needed | ✅ `az extension add --name azure-devops` |
| **3. Authenticate** | `gh auth login` | `az login` |
| **4. Configure Defaults** | ❌ Not needed | ✅ `az devops configure --defaults ...` |
| **5. Settings File** | Optional (auto-detected) | Required |

**GitHub Setup:**
```bash
gh auth login
```

**Azure Setup:**
```bash
az login
az extension add --name azure-devops
az devops configure --defaults organization=... project=...
```

**Winner:** GitHub - Simpler setup (2 steps vs 4 steps)

---

### Platform Detection

| Method | GitHub Issues | Azure DevOps Work Items |
|--------|---------------|------------------------|
| **Git Remote Pattern** | `github.com` | `dev.azure.com`, `visualstudio.com` |
| **HTTPS URL** | `https://github.com/owner/repo.git` | `https://dev.azure.com/org/project/_git/repo` |
| **SSH URL** | `git@github.com:owner/repo.git` | `git@ssh.dev.azure.com:v3/org/project/repo` |
| **Auto-Detection** | ✅ Yes | ✅ Yes |
| **Manual Override** | ✅ Yes | ✅ Yes |

**Winner:** Tie - Both support auto-detection and manual override

---

### Work Item/Issue Creation

| Aspect | GitHub Issues | Azure DevOps Work Items |
|--------|---------------|------------------------|
| **CLI Command** | `gh issue create` | `az boards work-item create` |
| **API Used** | GitHub REST API | Azure DevOps REST API (via CLI) |
| **Title Format** | `[TASK-001] Title` | `[TASK-001] Title` |
| **Description** | Markdown | Markdown (HTML rendering) |
| **Tags** | Labels | Tags |
| **Assignee** | ✅ Supported | ✅ Supported |
| **Milestones** | ✅ Milestones | ✅ Iterations |
| **Projects** | ✅ GitHub Projects | ✅ Area Paths |

**Winner:** Tie - Feature parity

---

### State Management

| Aspect | GitHub Issues | Azure DevOps Work Items |
|--------|---------------|------------------------|
| **Status Representation** | Labels | Work Item State |
| **Pending** | `status: pending` label | `New` state |
| **In Progress** | `status: in-progress` label | `Active` state |
| **Completed** | `status: completed` label + Closed | `Closed` state |
| **Blocked** | `status: blocked` label | `New` + `blocked` tag |
| **Custom States** | ✅ Custom labels | ✅ Custom work item types |
| **State Transitions** | ❌ No validation | ✅ Workflow rules |

**Example - GitHub:**
```javascript
// Add label to change status
await client.updateIssueLabels(issueId, ['status: in-progress']);
```

**Example - Azure:**
```javascript
// Update work item state
await client.updateWorkItemState(workItemId, 'Active');
```

**Winner:** Azure - Better state management with workflow validation

---

### Comments

| Aspect | GitHub Issues | Azure DevOps Work Items |
|--------|---------------|------------------------|
| **CLI Command** | `gh issue comment` | `az boards work-item update` |
| **Markdown Support** | ✅ Full | ✅ Full (HTML rendering) |
| **Mentions** | `@username` | `@<email>` |
| **Reactions** | ✅ Emoji reactions | ❌ No reactions |
| **Threading** | ❌ No threads | ✅ Discussion threads |
| **Edit History** | ✅ Yes | ✅ Yes |

**Winner:** GitHub - Better social features (reactions)

---

### Search & Filtering

| Feature | GitHub Issues | Azure DevOps Work Items |
|---------|---------------|------------------------|
| **Label/Tag Filter** | ✅ `label:bug` | ✅ `[Tags] Contains 'bug'` |
| **Status Filter** | ✅ `is:open` | ✅ `[State] = 'Active'` |
| **Assignee Filter** | ✅ `assignee:username` | ✅ `[Assigned To] = 'User'` |
| **Full-Text Search** | ✅ Yes | ✅ Yes |
| **Query Language** | GitHub search syntax | WIQL (Work Item Query Language) |
| **Saved Searches** | ❌ No | ✅ Shared queries |
| **Advanced Queries** | ⚠️ Limited | ✅ Full WIQL support |

**Winner:** Azure - More powerful query capabilities

---

### Integration & Automation

| Feature | GitHub Issues | Azure DevOps Work Items |
|---------|---------------|------------------------|
| **API Access** | GitHub REST/GraphQL API | Azure DevOps REST API |
| **Webhooks** | ✅ GitHub webhooks | ✅ Service hooks |
| **GitHub Actions** | ✅ Native integration | ⚠️ Via extensions |
| **Azure Pipelines** | ⚠️ Via actions | ✅ Native integration |
| **Power Automate** | ⚠️ Via connectors | ✅ Native connector |
| **Zapier** | ✅ Yes | ✅ Yes |

**Winner:** Tie - Different strengths based on ecosystem

---

### Reporting & Analytics

| Feature | GitHub Issues | Azure DevOps Work Items |
|---------|---------------|------------------------|
| **Built-in Reports** | ⚠️ Basic Insights | ✅ Rich dashboards |
| **Burndown Charts** | ❌ Requires Projects | ✅ Built-in |
| **Velocity Tracking** | ❌ No | ✅ Built-in |
| **Custom Dashboards** | ⚠️ GitHub Projects only | ✅ Full support |
| **Analytics API** | ⚠️ Limited | ✅ Analytics API |
| **Power BI Integration** | ❌ No | ✅ Native |

**Winner:** Azure - Superior reporting and analytics

---

### Pricing & Limits

| Aspect | GitHub Issues | Azure DevOps Work Items |
|--------|---------------|------------------------|
| **Free Tier** | Unlimited (public repos) | 5 users free |
| **Private Repos** | Included in plan | Included |
| **API Rate Limits** | 5,000 req/hour (authenticated) | 200 req/5min per user |
| **Storage** | Included | Included |
| **Additional Users** | Per seat pricing | $6/user/month |

**Winner:** GitHub - Better for open source and small teams

---

## When to Use Each Platform

### Use GitHub Issues When:

✅ **Open source projects** - Public repos are free with unlimited issues
✅ **GitHub ecosystem** - Already using GitHub Actions, Projects, Discussions
✅ **Simpler workflows** - Don't need advanced work item tracking
✅ **Developer-focused teams** - Team comfortable with git/GitHub
✅ **Quick setup** - Want minimal configuration
✅ **Social coding** - Value reactions, mentions, community features

**Example Use Cases:**
- Open source library maintenance
- Developer tool projects
- Small team rapid prototyping
- Documentation-heavy projects

---

### Use Azure DevOps Work Items When:

✅ **Enterprise teams** - Need advanced project management features
✅ **Azure ecosystem** - Using Azure Pipelines, Repos, Test Plans
✅ **Complex workflows** - Custom work item types, state transitions
✅ **Agile/Scrum** - Sprint planning, burndown charts, velocity tracking
✅ **Reporting needs** - Dashboards, analytics, Power BI integration
✅ **Compliance** - Audit trails, conditional access policies
✅ **Microsoft shops** - Integration with Microsoft 365, Teams

**Example Use Cases:**
- Enterprise application development
- Regulated industries (finance, healthcare)
- Large agile teams
- Projects requiring detailed analytics

---

## Migration Scenarios

### Scenario 1: GitHub → Azure DevOps

**When to migrate:**
- Team growth requiring advanced project management
- Enterprise adoption with compliance requirements
- Need for advanced reporting and analytics
- Integration with Microsoft ecosystem

**Migration steps:**

1. **Export GitHub issues:**
   ```bash
   gh issue list --repo owner/repo --state all --json number,title,body,labels > issues.json
   ```

2. **Update git remote:**
   ```bash
   git remote set-url origin https://dev.azure.com/ORG/PROJECT/_git/REPO
   ```

3. **Setup Azure CLI:**
   ```bash
   az login
   az extension add --name azure-devops
   az devops configure --defaults \
     organization=https://dev.azure.com/ORG \
     project=PROJECT
   ```

4. **Update settings:**
   ```json
   {
     "github": { "enabled": false },
     "azureDevOps": {
       "enabled": true,
       "organization": "ORG",
       "project": "PROJECT"
     }
   }
   ```

5. **Import work items** (optional - manual or via script):
   ```bash
   # For each issue in issues.json
   az boards work-item create \
     --title "Issue title" \
     --description "Issue body" \
     --type Task
   ```

---

### Scenario 2: Azure DevOps → GitHub

**When to migrate:**
- Moving to open source
- Simplifying workflow
- Team prefers GitHub ecosystem
- Cost reduction for small teams

**Migration steps:**

1. **Export work items:**
   ```bash
   az boards query --wiql "SELECT [System.Id], [System.Title], [System.Description] FROM WorkItems" > work-items.json
   ```

2. **Update git remote:**
   ```bash
   git remote set-url origin https://github.com/owner/repo.git
   ```

3. **Setup GitHub CLI:**
   ```bash
   gh auth login
   ```

4. **Update settings:**
   ```json
   {
     "github": {
       "enabled": true,
       "owner": "owner",
       "repo": "repo"
     },
     "azureDevOps": { "enabled": false }
   }
   ```

5. **Import issues** (optional):
   ```bash
   # For each work item in work-items.json
   gh issue create \
     --title "Work item title" \
     --body "Work item description"
   ```

---

### Scenario 3: Staying with Current Platform

**No migration needed if:**
- Current platform meets all requirements
- Team is productive with current tools
- No major pain points
- Cost is acceptable

**Optimization tips:**

**For GitHub:**
- Use GitHub Projects for project management
- Set up automated issue labeling
- Use issue templates for consistency
- Leverage GitHub Actions for automation

**For Azure DevOps:**
- Configure custom work item types
- Set up dashboards for visibility
- Use queries to track work
- Integrate with Azure Boards features

---

## Dual-Platform Setup

You can use **both platforms simultaneously** with different repos:

### Configuration

```json
{
  "github": {
    "enabled": true,
    "owner": "my-org",
    "repo": "github-repo"
  },
  "azureDevOps": {
    "enabled": true,
    "organization": "my-azure-org",
    "project": "azure-project"
  }
}
```

### Platform Selection

Platform is chosen based on:

1. **Manual override:**
   ```json
   {
     "platform": {
       "type": "azure",      // or "github"
       "autoDetect": false
     }
   }
   ```

2. **Git remote URL** (if `autoDetect: true`):
   ```bash
   git remote get-url origin
   # https://github.com/... → GitHub
   # https://dev.azure.com/... → Azure
   ```

3. **Feature flags** (if both enabled):
   - Defaults to GitHub if both enabled and no override

### Use Cases for Dual Setup

**Different repos, different platforms:**
- Main product on Azure DevOps
- Documentation site on GitHub
- Open source library on GitHub
- Internal tools on Azure DevOps

**Example workflow:**
```bash
# Work on Azure DevOps project
cd ~/azure-project
npx agentic15 status
# Platform: Azure DevOps
# Work items syncing...

# Switch to GitHub project
cd ~/github-project
npx agentic15 status
# Platform: GitHub
# Issues syncing...
```

---

## Differences in Behavior

### Task Status Mapping

**GitHub (Labels):**
```
pending      → status: pending
in_progress  → status: in-progress
completed    → status: completed + issue closed
blocked      → status: blocked
```

**Azure (States):**
```
pending      → New
in_progress  → Active
completed    → Closed
blocked      → New + blocked tag
```

### Task Creation

**GitHub:**
```javascript
// Creates issue with labels
{
  title: "[TASK-001] Task title",
  body: "Description with completion criteria",
  labels: ["status: pending", "phase: implementation"]
}
```

**Azure:**
```javascript
// Creates work item with state
{
  title: "[TASK-001] Task title",
  description: "Description with completion criteria",
  state: "New",
  tags: "task-001; implementation"
}
```

### Auto-Detection Behavior

**GitHub:**
- Token auto-fetched from `gh auth token`
- Owner/repo auto-detected from git remote
- No manual configuration required if authenticated

**Azure:**
- Organization/project must be configured
- Can use Azure CLI defaults or settings.json
- Requires explicit configuration

### Error Handling

**GitHub:**
```
⚠ Failed to create GitHub issue: Bad credentials
```
- Returns `null` on error
- No retry logic
- User should check `gh auth status`

**Azure:**
```
⚠ Failed to create Azure work item: Please run 'az login'
```
- Returns `null` on error
- No retry logic
- User should check `az account show`

---

## Performance Comparison

| Operation | GitHub Issues | Azure DevOps Work Items |
|-----------|---------------|------------------------|
| **Create Item** | ~500-1000ms | ~800-1500ms |
| **Update State** | ~300-600ms | ~600-1200ms |
| **Add Comment** | ~300-600ms | ~600-1200ms |
| **List Items** | ~200-400ms | ~400-800ms |
| **Search** | ~300-500ms | ~500-1000ms |

Performance varies based on:
- Network latency
- API rate limits
- CLI overhead
- Azure region (for Azure DevOps)

**Winner:** GitHub - Slightly faster due to simpler API

---

## Summary Table

| Criteria | GitHub Issues | Azure DevOps | Winner |
|----------|---------------|--------------|--------|
| Setup Complexity | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | GitHub |
| Authentication | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Tie |
| State Management | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Azure |
| Reporting | ⭐⭐ | ⭐⭐⭐⭐⭐ | Azure |
| Social Features | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | GitHub |
| API Capabilities | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Azure |
| Pricing | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | GitHub |
| Enterprise Features | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Azure |
| Developer UX | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | GitHub |
| Performance | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | GitHub |

---

## Recommendation

### Choose GitHub Issues if:
- Open source or small team
- Simple workflows
- Developer-focused
- Quick setup priority

### Choose Azure DevOps if:
- Enterprise team
- Complex project management
- Advanced reporting needs
- Microsoft ecosystem

### Use Both if:
- Multiple projects on different platforms
- Gradual migration between platforms
- Different teams with different preferences

---

**See Also:**
- [Azure Integration Guide](./azure-integration-guide.md)
- [Platform Detection](./platform-detection.md)
- [Quick Reference](./azure-quick-reference.md)
