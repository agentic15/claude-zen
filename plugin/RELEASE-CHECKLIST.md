# Release Checklist

Pre-flight checklist for releasing version 1.0.0 of the Agentic15 Claude Code Plugin.

## Package Verification

### NPM Package Structure ✅

**Package Name**: `@agentic15.com/claude-code-zen-plugin`
**Version**: `1.0.0`
**Size**: 15.9 KB (22 files)

#### Included Files:
```
✅ index.js                              (Entry point - 2.0 KB)
✅ package.json                          (Package metadata - 1.4 KB)
✅ README.md                             (Main documentation - 5.4 KB)
✅ INSTALLATION.md                       (Installation guide - 6.6 KB)
✅ E2E-TESTING-GUIDE.md                  (Testing guide - 8.1 KB)
✅ skills/*.js (7 files)                 (JavaScript implementations)
   - plan.js (3.4 KB)
   - task-next.js (2.6 KB)
   - task-start.js (3.4 KB)
   - commit.js (4.3 KB)
   - sync.js (3.1 KB)
   - status.js (2.1 KB)
   - visual-test.js (1.9 KB)
✅ utils/skill-wrapper.js                (Utility - 8.2 KB)
✅ .claude-plugin/plugin.json            (Marketplace manifest - 566 B)
✅ .claude-plugin/skills/*.md (7 files)  (Markdown skill docs)
   - plan.md (1.3 KB)
   - task-next.md (935 B)
   - task-start.md (1.3 KB)
   - commit.md (1.2 KB)
   - sync.md (1.3 KB)
   - status.md (1.4 KB)
   - visual-test.md (2.0 KB)
```

#### Excluded Files (via .npmignore):
```
✅ tests/ (22 test files)
✅ *.test.js
✅ .git/
✅ .github/
✅ Development files
```

---

### Claude Marketplace Structure ✅

**Marketplace Name**: `agentic15-marketplace`
**Repository**: `https://github.com/agentic15/claude-zen`

#### Marketplace Files:
```
✅ .claude-plugin/marketplace.json       (Root marketplace config)
✅ plugin/.claude-plugin/plugin.json     (Plugin manifest)
✅ plugin/.claude-plugin/skills/*.md     (7 markdown skills)
```

---

## Code Quality Verification

### Tests ✅
```bash
npm test
```
**Expected**: All 85 tests passing
**Status**: ✅ Verified

### Package Build ✅
```bash
npm pack
```
**Expected**: Creates `agentic15.com-claude-code-zen-plugin-1.0.0.tgz`
**Status**: ✅ Created successfully

---

## Documentation Verification

### Core Documentation ✅

- [x] `README.md` - Main documentation with quick start
- [x] `INSTALLATION.md` - Both NPM and marketplace installation
- [x] `E2E-TESTING-GUIDE.md` - End-to-end testing workflows
- [x] `PUBLISHING.md` - Complete publishing guide

### Skill Documentation ✅

All 7 skills have both:
- [x] JavaScript implementation (`skills/*.js`)
- [x] Markdown documentation (`.claude-plugin/skills/*.md`)

**Skills**:
1. ✅ `agentic15:plan` - Create and lock project plans
2. ✅ `agentic15:task-next` - Start next pending task
3. ✅ `agentic15:task-start` - Start specific task by ID
4. ✅ `agentic15:commit` - Commit task and create PR
5. ✅ `agentic15:sync` - Sync with main after PR merge
6. ✅ `agentic15:status` - Show project status
7. ✅ `agentic15:visual-test` - Capture UI screenshots

---

## Configuration Verification

### package.json ✅

Required fields verified:
- [x] `name`: `@agentic15.com/claude-code-zen-plugin`
- [x] `version`: `1.0.0`
- [x] `description`: Clear and concise
- [x] `type`: `module` (ES modules)
- [x] `main`: `index.js` (exists)
- [x] `keywords`: Comprehensive list
- [x] `author`: Set
- [x] `license`: `Apache-2.0`
- [x] `repository`: GitHub URL with directory
- [x] `publishConfig.access`: `public`
- [x] `files`: All necessary files included
- [x] `claudePlugin`: Namespace and skills list
- [x] `engines.node`: `>=18.0.0`
- [x] `dependencies`: Framework version specified

### .npmignore ✅

- [x] Excludes `tests/`
- [x] Excludes `*.test.js`
- [x] Excludes development files
- [x] Excludes git files

### Marketplace Config ✅

**`.claude-plugin/marketplace.json`**:
- [x] Marketplace name set
- [x] Owner information complete
- [x] Plugin source path: `./plugin`
- [x] Version matches package.json

**`plugin/.claude-plugin/plugin.json`**:
- [x] Plugin name matches
- [x] Version matches package.json
- [x] Description clear
- [x] Repository URL set
- [x] License specified

---

## Distribution Methods

### Method 1: NPM Package ✅

**Installation**:
```bash
npm install -g @agentic15.com/claude-code-zen-plugin
```

**Configure** in `.claude/settings.json`:
```json
{
  "plugins": {
    "@agentic15.com/claude-code-zen-plugin": {
      "enabled": true
    }
  }
}
```

### Method 2: Claude Marketplace ✅

**Add marketplace**:
```bash
/plugin marketplace add https://github.com/agentic15/claude-zen
```

**Install plugin**:
```bash
/plugin install agentic15-claude-zen-plugin@agentic15-marketplace
```

---

## Pre-Publishing Checklist

Before running `npm publish`:

### Git Status
- [ ] All changes committed
- [ ] Working directory clean
- [ ] On main branch
- [ ] Pushed to remote

### Version
- [ ] Version number updated if needed
- [ ] Version consistent across:
  - [ ] `package.json`
  - [ ] `.claude-plugin/plugin.json`
  - [ ] Git tag (if applicable)

### Testing
- [ ] All tests pass (`npm test`)
- [ ] Package builds (`npm pack`)
- [ ] Package contents verified (`tar -tzf *.tgz`)

### Documentation
- [ ] CHANGELOG.md updated (if exists)
- [ ] README.md version references updated
- [ ] Installation examples accurate

---

## Publishing Commands

### Publish to NPM

```bash
# Login (if needed)
npm login --scope=@agentic15.com

# Dry run first
npm publish --dry-run

# Actual publish
npm publish --access public
```

### Tag Git Release

```bash
# Create tag
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push tag
git push origin v1.0.0
```

---

## Post-Publishing Verification

### NPM
- [ ] Visit: https://www.npmjs.com/package/@agentic15.com/claude-code-zen-plugin
- [ ] Version shows correctly
- [ ] README renders properly
- [ ] Test installation: `npm install -g @agentic15.com/claude-code-zen-plugin`

### Marketplace
- [ ] Users can add marketplace: `/plugin marketplace add https://github.com/agentic15/claude-zen`
- [ ] Users can install: `/plugin install agentic15-claude-zen-plugin@agentic15-marketplace`
- [ ] Skills appear: `/agentic15:` tab completion

### Functionality
- [ ] In Agentic15 project, run: `/agentic15:status`
- [ ] Returns expected output or error
- [ ] All 7 skills accessible

---

## Package Statistics

**Total Size**: 15.9 KB (compressed)
**Unpacked Size**: 62.5 KB
**Total Files**: 22
**Skills**: 7
**Tests**: 85 (100% passing)
**Test Coverage**: All validation paths
**Node Version**: >= 18.0.0

---

## Ready for Release ✅

**Status**: Package is ready for publishing to both NPM and Claude Marketplace.

**Next Steps**:
1. Review this checklist
2. Follow `PUBLISHING.md` for detailed publishing steps
3. Publish to NPM
4. Tag git release
5. Announce in discussions/changelog

---

**Date Prepared**: 2026-01-05
**Package Version**: 1.0.0
**Prepared By**: Claude Code (Agentic15 Task System)
