# Platform Detection Strategy

## Overview

This document defines how to detect whether a repository is hosted on GitHub or Azure DevOps, enabling automatic platform selection for task/issue synchronization.

## Design Goals

1. **Accurate Detection**: Correctly identify platform 99%+ of the time
2. **Fast Performance**: Detection should take <100ms
3. **Graceful Degradation**: Handle edge cases without errors
4. **User Override**: Allow manual platform selection via config

## Detection Methods

### Method 1: Git Remote URL (Primary)

**Priority:** 1 (Fastest and most reliable)

**Implementation:**
```javascript
const remote = execSync('git remote get-url origin', { encoding: 'utf-8' }).trim();

if (remote.includes('github.com')) {
  return 'github';
} else if (remote.includes('dev.azure.com') || remote.includes('visualstudio.com')) {
  return 'azure';
}
```

**Patterns:**

| Platform | SSH Format | HTTPS Format |
|----------|------------|--------------|
| GitHub | `git@github.com:owner/repo.git` | `https://github.com/owner/repo.git` |
| Azure DevOps | `git@ssh.dev.azure.com:v3/org/project/repo` | `https://dev.azure.com/org/project/_git/repo` |
| Azure (Legacy) | N/A | `https://org.visualstudio.com/project/_git/repo` |

**Pros:**
- ✅ Fast (single command)
- ✅ Reliable (URL is definitive)
- ✅ No API calls needed

**Cons:**
- ❌ Fails if no remote configured
- ❌ Doesn't work for local-only repos

**Performance:** ~10-20ms

---

### Method 2: .git/config Inspection (Fallback)

**Priority:** 2 (Backup when remote command fails)

**Implementation:**
```javascript
const gitConfig = fs.readFileSync('.git/config', 'utf-8');
const urlMatch = gitConfig.match(/url\s*=\s*(.+)/);

if (urlMatch) {
  const url = urlMatch[1];
  if (url.includes('github.com')) return 'github';
  if (url.includes('dev.azure.com') || url.includes('visualstudio.com')) return 'azure';
}
```

**Pros:**
- ✅ Works even if git commands are unavailable
- ✅ Fast file read
- ✅ More portable

**Cons:**
- ❌ Requires file system access
- ❌ May have multiple remotes (ambiguous)

**Performance:** ~5-10ms

---

### Method 3: Feature Flag Override (User Config)

**Priority:** 0 (Highest - explicit user choice)

**Implementation:**
```javascript
// In .claude/settings.json or .claude/settings.local.json
{
  "platform": {
    "type": "github",  // or "azure"
    "autoDetect": false
  }
}
```

**Usage:**
```javascript
const config = loadSettings();
if (config.platform && !config.platform.autoDetect) {
  return config.platform.type;  // User override
}
// Otherwise proceed with auto-detection
```

**Pros:**
- ✅ User has full control
- ✅ Instant (no detection needed)
- ✅ Handles edge cases (mirrors, proxies)

**Cons:**
- ❌ Requires manual configuration
- ❌ Could be forgotten/outdated

**Performance:** ~1ms

---

### Method 4: API Endpoint Probing (Last Resort)

**Priority:** 3 (Only if all else fails)

**Implementation:**
```javascript
// Try GitHub API
try {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
  if (response.ok) return 'github';
} catch {}

// Try Azure DevOps API
try {
  const response = await fetch(
    `https://dev.azure.com/${org}/${project}/_apis/git/repositories/${repo}?api-version=7.0`
  );
  if (response.ok) return 'azure';
} catch {}
```

**Pros:**
- ✅ Definitive verification
- ✅ Works for any repo setup

**Cons:**
- ❌ Slow (network latency)
- ❌ Requires authentication
- ❌ May hit rate limits
- ❌ Fails offline

**Performance:** ~200-500ms

**Note:** Only use as absolute last resort or for verification.

---

## Detection Algorithm

### Flowchart

```
START
  ↓
Check user config override?
  ├─ YES → Return configured platform
  ↓ NO
Try git remote get-url origin
  ├─ SUCCESS → Parse URL → Return platform
  ↓ FAIL
Read .git/config file
  ├─ SUCCESS → Parse URL → Return platform
  ↓ FAIL
Check feature flags
  ├─ GitHub enabled only → Return 'github'
  ├─ Azure enabled only → Return 'azure'
  ├─ Both enabled → Default to 'github' + warn
  ↓ Neither enabled
Return null (no platform)
```

### Implementation

```javascript
export class PlatformDetector {
  static detect() {
    // Priority 0: User override
    const override = this.checkUserOverride();
    if (override) return override;

    // Priority 1: Git remote URL
    try {
      const remote = execSync('git remote get-url origin', {
        encoding: 'utf-8',
        stdio: 'pipe'
      }).trim();
      return this.parseRemoteURL(remote);
    } catch {}

    // Priority 2: .git/config file
    try {
      const gitConfig = fs.readFileSync('.git/config', 'utf-8');
      const url = this.extractURLFromConfig(gitConfig);
      if (url) return this.parseRemoteURL(url);
    } catch {}

    // Priority 3: Feature flags
    const flagged = this.detectFromFeatureFlags();
    if (flagged) return flagged;

    // No detection possible
    return null;
  }

  static parseRemoteURL(url) {
    if (url.includes('github.com')) return 'github';
    if (url.includes('dev.azure.com') || url.includes('visualstudio.com')) {
      return 'azure';
    }
    return null;
  }

  static checkUserOverride() {
    const config = this.loadSettings();
    if (config.platform && config.platform.type && !config.platform.autoDetect) {
      return config.platform.type;
    }
    return null;
  }

  static detectFromFeatureFlags() {
    const config = this.loadSettings();
    const githubEnabled = config.github?.enabled === true;
    const azureEnabled = config.azureDevOps?.enabled === true;

    if (githubEnabled && !azureEnabled) return 'github';
    if (azureEnabled && !githubEnabled) return 'azure';
    if (githubEnabled && azureEnabled) {
      console.warn('⚠️  Both GitHub and Azure are enabled. Defaulting to GitHub.');
      console.warn('   Set platform.type in settings.json to override.');
      return 'github';
    }
    return null;
  }
}
```

---

## Fallback Strategy

### Hierarchy

1. **User Config Override** → Always respected
2. **Git Remote URL** → Most reliable auto-detection
3. **Git Config File** → Backup for URL
4. **Feature Flags** → Infer from enabled integrations
5. **Default to GitHub** → Safe default (most common)
6. **Disable Integration** → If no platform detected

### Error Handling

```javascript
const platform = PlatformDetector.detect();

if (!platform) {
  console.log('⚠️  Could not detect platform');
  console.log('   Issue/work item sync will be disabled');
  console.log('   To enable, configure platform in .claude/settings.json\n');
  return; // Skip integration
}
```

---

## Edge Cases

### 1. Multiple Remotes

**Scenario:** Repo has both `origin` (GitHub) and `azure` (Azure DevOps) remotes.

**Solution:**
- Detect from `origin` remote (convention)
- Allow user override via config
- Warn if multiple platforms detected

**Implementation:**
```javascript
// List all remotes
const remotes = execSync('git remote -v', { encoding: 'utf-8' });
const platforms = new Set();

if (remotes.includes('github.com')) platforms.add('github');
if (remotes.includes('dev.azure.com')) platforms.add('azure');

if (platforms.size > 1) {
  console.warn('⚠️  Multiple platforms detected');
  console.warn('   Using origin remote. Override in settings if needed.');
}
```

---

### 2. No Remote Configured

**Scenario:** Local repo with no remote (e.g., just initialized).

**Solution:**
- Fall back to feature flags
- If both enabled, default to GitHub
- If neither, disable integration

**User Guidance:**
```
❌ No git remote configured

   To enable task sync, either:
   1. Add a remote: git remote add origin <URL>
   2. Set platform manually in .claude/settings.json:
      {
        "platform": {
          "type": "github",
          "autoDetect": false
        }
      }
```

---

### 3. Self-Hosted Instances

**Scenario:** GitHub Enterprise or Azure DevOps Server with custom domains.

**Solution:**
- User override required (auto-detection won't work)
- Provide clear configuration instructions

**Configuration:**
```json
{
  "platform": {
    "type": "github",
    "autoDetect": false
  },
  "github": {
    "apiUrl": "https://github.company.com/api/v3",
    "enabled": true
  }
}
```

---

### 4. Git Mirrors / Proxies

**Scenario:** Repo uses a mirror URL (e.g., `gitproxy.internal.com/github/org/repo`).

**Solution:**
- Auto-detection will fail
- Require user override
- Document in error messages

---

### 5. Fork Workflows

**Scenario:** Forked repo with different platform than upstream.

**Solution:**
- Detect from `origin` (user's fork)
- Ignore `upstream` remote
- User can override if needed

---

### 6. Offline Mode

**Scenario:** No network access, API probing fails.

**Solution:**
- Never use API probing by default
- Only use local detection methods
- Cache detection result for session

---

## Performance Considerations

### Caching

**Problem:** Re-detecting on every operation is wasteful.

**Solution:** Cache detection result per session.

```javascript
export class PlatformDetector {
  static _cachedPlatform = null;

  static detect(useCache = true) {
    if (useCache && this._cachedPlatform) {
      return this._cachedPlatform;
    }

    const platform = this._performDetection();
    this._cachedPlatform = platform;
    return platform;
  }

  static clearCache() {
    this._cachedPlatform = null;
  }
}
```

**Invalidation:** Clear cache when:
- User updates settings
- Git remote changes
- Manual refresh requested

---

### Benchmark Targets

| Method | Target | Acceptable | Unacceptable |
|--------|--------|------------|--------------|
| User Override | <1ms | <5ms | >10ms |
| Git Remote URL | <20ms | <50ms | >100ms |
| Git Config File | <10ms | <30ms | >50ms |
| Feature Flags | <5ms | <10ms | >20ms |
| API Probing | N/A | N/A | Always (don't use) |

**Total Detection Time:** <30ms (target), <100ms (acceptable)

---

### Lazy Detection

**Strategy:** Only detect when needed.

```javascript
// Don't detect on every startup
// Only detect when task sync is actually used

export class PlatformRouter {
  constructor() {
    this._platform = null;  // Not detected yet
  }

  async createTaskItem(task) {
    // Detect only on first use
    if (!this._platform) {
      this._platform = PlatformDetector.detect();
    }

    if (this._platform === 'github') {
      // Use GitHub client
    } else if (this._platform === 'azure') {
      // Use Azure client
    }
  }
}
```

---

## Configuration Schema

### settings.json / settings.local.json

```json
{
  "platform": {
    "type": "github",           // or "azure" or null
    "autoDetect": true,         // Enable auto-detection
    "cacheDetection": true,     // Cache detection result
    "fallback": "github"        // Fallback if detection fails
  },
  "github": {
    "enabled": true,
    "apiUrl": "https://api.github.com",  // For GitHub Enterprise
    // ... other GitHub settings
  },
  "azureDevOps": {
    "enabled": false,
    // ... other Azure settings
  }
}
```

---

## Testing Strategy

### Unit Tests

```javascript
describe('PlatformDetector', () => {
  it('detects GitHub from HTTPS URL', () => {
    mockGitRemote('https://github.com/owner/repo.git');
    expect(PlatformDetector.detect()).toBe('github');
  });

  it('detects GitHub from SSH URL', () => {
    mockGitRemote('git@github.com:owner/repo.git');
    expect(PlatformDetector.detect()).toBe('github');
  });

  it('detects Azure from dev.azure.com', () => {
    mockGitRemote('https://dev.azure.com/org/project/_git/repo');
    expect(PlatformDetector.detect()).toBe('azure');
  });

  it('detects Azure from visualstudio.com', () => {
    mockGitRemote('https://org.visualstudio.com/project/_git/repo');
    expect(PlatformDetector.detect()).toBe('azure');
  });

  it('respects user override', () => {
    mockSettings({ platform: { type: 'azure', autoDetect: false } });
    mockGitRemote('https://github.com/owner/repo.git');
    expect(PlatformDetector.detect()).toBe('azure');  // Override wins
  });

  it('handles no remote gracefully', () => {
    mockGitRemoteError();
    expect(PlatformDetector.detect()).toBeNull();
  });
});
```

---

## Migration Path

### Phase 1: Detection Only ✅
- Implement detection logic
- Return detected platform
- No routing yet

### Phase 2: Routing (TASK-008)
- Create PlatformRouter
- Route operations to correct platform
- Test with both platforms

### Phase 3: Optimization
- Add caching
- Performance tuning
- Edge case handling

---

## Summary

| Aspect | Decision |
|--------|----------|
| **Primary Method** | Git remote URL parsing |
| **Fallback** | .git/config → Feature flags → Default |
| **User Override** | Always respected (highest priority) |
| **Performance** | <30ms target, cache result |
| **Edge Cases** | Graceful degradation, clear errors |
| **Default** | GitHub (when ambiguous) |
| **API Calls** | NEVER used for detection |

This strategy provides fast, reliable platform detection while handling edge cases gracefully and respecting user preferences.
