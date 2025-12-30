# Publishing Instructions for v6.0.0

## Pre-Publish Checklist

### ✅ Completed by Claude:
- [x] Version bumped to 6.0.0 in package.json
- [x] CHANGELOG.md updated with release notes
- [x] README.md updated with new features
- [x] Documentation created (Azure integration, command permissions)
- [x] All code changes completed

### 📋 Your Publishing Steps:

## Step 1: Run Tests

Verify package integrity:

```bash
cd Agent
npm test
```

Expected: All tests should pass.

---

## Step 2: Test Package Locally

Create a test package:

```bash
npm pack
```

This creates: `agentic15.com-agentic15-claude-zen-6.0.0.tgz`

Test installation in a temporary directory:

```bash
# Create test directory
mkdir /tmp/test-package
cd /tmp/test-package

# Install the packed package
npm install /path/to/agentic15.com-agentic15-claude-zen-6.0.0.tgz

# Test the CLI
npx agentic15 --version
# Should output: 6.0.0

# Test creating a project
npx @agentic15.com/agentic15-claude-zen test-project
cd test-project
ls -la .claude/

# Cleanup
cd /tmp
rm -rf test-package
```

---

## Step 3: Commit and Merge

Commit all changes:

```bash
npx agentic15 commit
```

Review and merge the PR, then sync:

```bash
npx agentic15 sync
```

---

## Step 4: Publish to npm

**IMPORTANT: This will make v6.0.0 publicly available!**

```bash
cd Agent

# Ensure you're logged in to npm
npm whoami
# If not logged in: npm login

# Publish to npm (public access)
npm publish --access public
```

Expected output:
```
+ @agentic15.com/agentic15-claude-zen@6.0.0
```

---

## Step 5: Verify Publication

Check npm registry:

```bash
npm view @agentic15.com/agentic15-claude-zen version
# Should output: 6.0.0

npm info @agentic15.com/agentic15-claude-zen
```

Visit: https://www.npmjs.com/package/@agentic15.com/agentic15-claude-zen

---

## Step 6: Test Installation from npm

Test that users can install:

```bash
# In a new directory
mkdir /tmp/test-npm-install
cd /tmp/test-npm-install

# Install from npm
npx @agentic15.com/agentic15-claude-zen my-test-project

# Verify installation
cd my-test-project
cat package.json | grep agentic15
# Should show version 6.0.0

# Cleanup
cd /tmp
rm -rf test-npm-install
```

---

## Step 7: Create GitHub Release

Create a release on GitHub:

```bash
gh release create v6.0.0 \
  --title "v6.0.0 - Azure DevOps Integration & Plan Lifecycle" \
  --notes "See CHANGELOG.md for full release notes"
```

Or manually:
1. Go to https://github.com/agentic15/claude-zen/releases/new
2. Tag: `v6.0.0`
3. Title: `v6.0.0 - Azure DevOps Integration & Plan Lifecycle`
4. Description: Copy from CHANGELOG.md
5. Publish release

---

## Rollback (if needed)

If something goes wrong:

```bash
# Deprecate the bad version
npm deprecate @agentic15.com/agentic15-claude-zen@6.0.0 "Broken release, use 5.0.9"

# Publish a fixed version
# Update version to 6.0.1
npm publish --access public
```

---

## Success Checklist

- [ ] Tests pass locally
- [ ] Package tested with `npm pack`
- [ ] Changes committed and merged
- [ ] Published to npm successfully
- [ ] Version visible on npm registry
- [ ] Test installation works
- [ ] GitHub release created

---

## What's New in v6.0.0

**Major Features:**
- Azure DevOps integration (dual-platform support)
- Plan lifecycle commands (`archive`, `new`)
- Enhanced git command permissions
- Comprehensive documentation updates

**Migration:**
- No breaking changes for existing GitHub users
- Azure users: follow Azure Integration Guide in README
- Run `npx agentic15 update-settings` to get latest framework settings
