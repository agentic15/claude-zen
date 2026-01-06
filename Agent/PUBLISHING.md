# Publishing Guide

Complete guide for publishing Agentic15 Claude Zen (framework + Claude Code plugin) to both NPM and Claude Marketplace.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Pre-Publishing Checklist](#pre-publishing-checklist)
- [Publishing to NPM](#publishing-to-npm)
- [Registering with Claude Marketplace](#registering-with-claude-marketplace)
- [Version Management](#version-management)
- [Post-Publishing](#post-publishing)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before publishing, ensure you have:

- ✅ **NPM Account** with publish permissions for `@agentic15.com` scope
- ✅ **GitHub Repository** with public access
- ✅ **All Tests Passing**: Run `npm test` - all 85+ tests must pass
- ✅ **Git Clean State**: No uncommitted changes
- ✅ **Version Updated**: package.json version reflects the release
- ✅ **Changelog Updated**: Document changes in CHANGELOG.md (if exists)

---

## Pre-Publishing Checklist

Use this checklist before every publish:

### 1. Code Quality

```bash
# Run all tests
cd plugin
npm test

# Expected output: ✔ All tests passed (85 tests)
```

### 2. Package Verification

```bash
# Verify package contents
npm pack --dry-run

# Should show ~22 files, ~15.9 KB
# Verify no test files are included
```

### 3. Version Check

```bash
# Check current version
npm version

# If needed, bump version (see Version Management section)
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
```

### 4. Git Status

```bash
# Ensure clean git state
git status

# Should show: "nothing to commit, working tree clean"
```

### 5. Documentation Review

- [ ] README.md is up to date
- [ ] INSTALLATION.md covers both installation methods
- [ ] E2E-TESTING-GUIDE.md is current
- [ ] All skill markdown files in `.claude-plugin/skills/` are accurate
- [ ] CHANGELOG.md has entry for this version (if applicable)

---

## Publishing to NPM

### Step 1: Login to NPM

```bash
npm login --scope=@agentic15.com
```

Enter your credentials when prompted.

### Step 2: Verify Login

```bash
npm whoami
```

Should display your NPM username.

### Step 3: Final Package Test

```bash
cd plugin
npm pack
```

This creates `agentic15.com-claude-code-zen-plugin-1.0.0.tgz`.

Extract and inspect:
```bash
tar -tzf agentic15.com-claude-code-zen-plugin-1.0.0.tgz
```

Verify the contents look correct.

### Step 4: Publish to NPM

**Dry run first** (highly recommended):
```bash
npm publish --dry-run
```

Review the output carefully.

**Actual publish**:
```bash
npm publish --access public
```

Expected output:
```
+ @agentic15.com/claude-code-zen-plugin@1.0.0
```

### Step 5: Verify Publication

Visit: https://www.npmjs.com/package/@agentic15.com/claude-code-zen-plugin

Check:
- Version number is correct
- README displays properly
- Files tab shows correct contents
- No test files are visible

### Step 6: Test Installation

In a separate test directory:
```bash
npm install -g @agentic15.com/agentic15-claude-zen
```

Verify it installs without errors and provides both CLI and plugin functionality.

---

## Registering with Claude Marketplace

### Step 1: Verify Marketplace Files

Ensure these files exist and are committed:
- `.claude-plugin/marketplace.json` (at repository root)
- `plugin/.claude-plugin/plugin.json`
- `plugin/.claude-plugin/skills/*.md` (7 skill files)

### Step 2: Commit Marketplace Files

```bash
git add .claude-plugin/
git add plugin/.claude-plugin/
git commit -m "Add Claude Marketplace configuration"
git push origin main
```

### Step 3: Tag the Release

```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

### Step 4: User Installation from Marketplace

Users can now add your marketplace:

```bash
/plugin marketplace add https://github.com/agentic15/claude-zen
```

And install the plugin:
```bash
/plugin install agentic15-claude-zen-plugin@agentic15-marketplace
```

### Step 5: Submit to Official Claude Marketplace (Optional)

If Claude has an official marketplace registry:

1. Visit the Claude marketplace submission page
2. Provide repository URL: `https://github.com/agentic15/claude-zen`
3. Specify plugin path: `plugin`
4. Submit for review

---

## Version Management

### Semantic Versioning

Follow [SemVer](https://semver.org/):

- **MAJOR** (1.0.0 -> 2.0.0): Breaking changes
- **MINOR** (1.0.0 -> 1.1.0): New features, backward compatible
- **PATCH** (1.0.0 -> 1.0.1): Bug fixes, backward compatible

### Updating Version

**Using npm version** (recommended):
```bash
cd plugin

# Patch release (bug fixes)
npm version patch -m "chore: bump to %s"

# Minor release (new features)
npm version minor -m "feat: bump to %s"

# Major release (breaking changes)
npm version major -m "chore!: bump to %s"
```

This automatically:
1. Updates package.json
2. Creates a git commit
3. Creates a git tag

Then push:
```bash
git push && git push --tags
```

**Manual update**:
1. Edit `plugin/package.json` - update `version` field
2. Edit `plugin/.claude-plugin/plugin.json` - update `version` field
3. Commit: `git commit -am "chore: bump version to 1.0.1"`
4. Tag: `git tag -a v1.0.1 -m "Release 1.0.1"`
5. Push: `git push && git push --tags`

### Version Checklist

When bumping versions, ensure consistency:
- [ ] `plugin/package.json` version field
- [ ] `plugin/.claude-plugin/plugin.json` version field
- [ ] Git tag matches version (v1.0.0)
- [ ] CHANGELOG.md has entry for this version
- [ ] README.md installation examples use new version (if hardcoded)

---

## Post-Publishing

### 1. Verify NPM Installation

Test in a clean environment:

```bash
# Global install
npm install -g @agentic15.com/claude-code-zen-plugin

# Verify
npm list -g @agentic15.com/claude-code-zen-plugin
```

### 2. Verify Marketplace Installation

In a test project with Claude Code:

```bash
/plugin marketplace add https://github.com/agentic15/claude-zen
/plugin install agentic15-claude-zen-plugin@agentic15-marketplace
/plugin list
```

Should show the plugin installed.

### 3. Test Skills

In an Agentic15 project:

```bash
/agentic15:status
```

Should return expected output or error (if no plan).

### 4. Update Documentation

If this is a new version:
- Update main repository README with latest version number
- Update any hardcoded installation examples
- Announce release in discussions/changelog

### 5. Monitor for Issues

After publishing:
- Watch for GitHub issues
- Monitor npm download stats
- Check for installation problems reported by users

---

## Troubleshooting

### Issue: NPM Publish Permission Denied

**Error**: `403 Forbidden - You do not have permission to publish "@agentic15.com/claude-code-zen-plugin"`

**Solutions**:
1. Verify you're logged in:
   ```bash
   npm whoami
   ```

2. Check scope permissions:
   ```bash
   npm org ls @agentic15.com
   ```

3. Request publish permissions from org owner

4. Use correct scope in login:
   ```bash
   npm login --scope=@agentic15.com
   ```

### Issue: Version Already Published

**Error**: `403 Forbidden - cannot modify pre-existing version`

**Solution**: Bump the version number:
```bash
npm version patch
npm publish --access public
```

### Issue: Package Too Large

**Error**: `Package size exceeds maximum`

**Solution**:
1. Check what's included:
   ```bash
   npm pack --dry-run
   ```

2. Add files to `.npmignore`:
   ```
   tests/
   docs/drafts/
   *.log
   ```

3. Verify exclusions:
   ```bash
   npm pack && tar -tzf *.tgz
   ```

### Issue: Marketplace Files Not Found

**Error**: Users report marketplace installation fails

**Solution**:
1. Verify files committed to main branch:
   ```bash
   git ls-tree -r main --name-only | grep .claude-plugin
   ```

2. Ensure marketplace.json at repo root:
   ```bash
   cat .claude-plugin/marketplace.json
   ```

3. Push if missing:
   ```bash
   git push origin main
   ```

### Issue: Skills Not Appearing in Claude

**Error**: `/agentic15:*` commands not available after install

**Solution**:
1. Verify plugin in list:
   ```bash
   /plugin list
   ```

2. Check `.claude/settings.json`:
   ```json
   {
     "plugins": {
       "@agentic15.com/claude-code-zen-plugin": {
         "enabled": true
       }
     }
   }
   ```

3. Restart Claude Code

### Issue: Test Files Included in Package

**Error**: Package contains test files (bloated size)

**Solution**:
1. Verify `.npmignore` exists with:
   ```
   tests/
   *.test.js
   ```

2. Test package contents:
   ```bash
   npm pack --dry-run
   ```

3. Should NOT show any test files

---

## Release Workflow Example

Complete workflow for a patch release:

```bash
# 1. Ensure clean state
cd plugin
git status  # Should be clean
npm test    # All tests pass

# 2. Bump version
npm version patch -m "chore: release v1.0.1"

# 3. Update marketplace version
# Edit plugin/.claude-plugin/plugin.json - set version to 1.0.1
git add plugin/.claude-plugin/plugin.json
git commit --amend --no-edit

# 4. Push to GitHub
git push && git push --tags

# 5. Publish to NPM
npm publish --access public

# 6. Verify
npm info @agentic15.com/claude-code-zen-plugin

# 7. Test installation
npm install -g @agentic15.com/claude-code-zen-plugin
```

---

## Getting Help

- 📖 [NPM Publishing Docs](https://docs.npmjs.com/cli/v9/commands/npm-publish)
- 📖 [Semantic Versioning](https://semver.org/)
- 🐛 [Report Issues](https://github.com/agentic15/claude-zen/issues)
- 💬 [Discussions](https://github.com/agentic15/claude-zen/discussions)

---

**Next Steps**: After publishing, update the main README with the latest version and notify users in discussions/announcements.
