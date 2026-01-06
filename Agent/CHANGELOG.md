# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Copyright 2024-2026 agentic15.com

## [8.2.0] - 2026-01-05

### 📚 Documentation

**Skills Documentation Complete**
- **Claude Code Skills Section**: Added comprehensive skills documentation to README
- **Skills Table**: All 7 skills listed with descriptions and usage examples
- **Installation Guide**: Local and global installation options
- **Example Workflow**: Practical usage example showing skill workflow
- **Separation**: Clear distinction between Claude Code skills and CLI commands
- **Clean Documentation**: Removed version-specific references (moved to CHANGELOG)

### 🔧 Changed

**README Structure**
- Split into "Claude Code Skills" and "CLI Commands" sections
- Skills-first approach in documentation
- Evergreen documentation without version references
- All version history moved to CHANGELOG.md

---

## [8.1.1] - 2026-01-05

### 🐛 Fixed

**README Publishing Issue**
- Fixed prepublishOnly script overwriting updated README
- Root README.md now contains skills documentation
- Ensures published package shows v8.x and Claude Code skills

---

## [8.1.0] - 2026-01-05

### 📚 Documentation

**README.md Enhanced**
- **Claude Code Skills Section**: Added comprehensive skills documentation to main README
- **Installation Options**: Clear guide for local vs global installation
- **Skills Table**: All 7 skills listed with descriptions
- **Example Workflow**: Added practical usage example for skills
- **CLI vs Skills**: Separated CLI commands and Claude Code skills sections
- **Version Update**: Updated to v8.1.0 throughout README

**Additional Documentation**
- **SKILLS-REFERENCE.md**: Complete reference guide for all skills
- **Installation Clarity**: Updated all docs to clarify npx doesn't provide skills

### 🔧 Changed

**README.md Structure**
- Split "Commands" section into "Claude Code Skills" and "CLI Commands"
- Added skills-first approach (skills before CLI in documentation)
- Updated version badge and tagline

---

## [8.0.0] - 2026-01-05

### 🎉 MAJOR RELEASE - Integrated Claude Code Plugin

**BREAKING CHANGES**: This release integrates the Claude Code plugin directly into the framework package. Users upgrading from v7.x will need to update their configuration.

### Summary
The Claude Code plugin has been integrated into the main framework package, eliminating the need for a separate `@agentic15.com/claude-code-zen-plugin` package. Users now get both CLI and Claude Code skills in a single installation.

### 💥 Breaking Changes

**Plugin Integration**
- **Package Consolidation**: Claude Code plugin now included in `@agentic15.com/agentic15-claude-zen`
- **Settings Update Required**: Users must update `.claude/settings.json` to use `@agentic15.com/agentic15-claude-zen` instead of `@agentic15.com/claude-code-zen-plugin`
- **Installation Change**: Single package installation instead of two separate packages

**Migration Required**:
```bash
# OLD (v7.x)
npm install -g @agentic15.com/agentic15-claude-zen
npm install -g @agentic15.com/claude-code-zen-plugin

# NEW (v8.0) - Choose one method:
npx @agentic15.com/agentic15-claude-zen init  # No install (recommended)
npm install --save-dev @agentic15.com/agentic15-claude-zen  # Local install
npm install -g @agentic15.com/agentic15-claude-zen  # Global install
```

**Settings Update**:
```json
// OLD (.claude/settings.json)
{
  "plugins": {
    "@agentic15.com/claude-code-zen-plugin": {
      "enabled": true
    }
  }
}

// NEW (.claude/settings.json)
{
  "plugins": {
    "@agentic15.com/agentic15-claude-zen": {
      "enabled": true
    }
  }
}
```

### ✨ Added

**Integrated Claude Code Plugin**
- **7 Skills**: `/agentic15:plan`, `/agentic15:task-next`, `/agentic15:task-start`, `/agentic15:commit`, `/agentic15:sync`, `/agentic15:status`, `/agentic15:visual-test`
- **Plugin Architecture**: `plugin/` directory with skills, utilities, and tests
- **Marketplace Support**: `.claude-plugin/` configuration for Claude marketplace distribution
- **Skill Documentation**: Markdown documentation for all 7 skills
- **Test Suite**: 85 validation-only tests (100% pass rate, no side effects)
- **Plugin Entry Point**: `plugin/index.js` with skill exports and metadata

**Package Configuration**
- **claudePlugin Metadata**: Added namespace and skill list to package.json
- **Test Scripts**: `test:plugin` and `test:all` commands
- **Keywords**: Added `claude-plugin`, `workflow-automation`, `skills`

**Documentation**
- **INSTALLATION.md**: Complete installation guide for both NPM and marketplace
- **PUBLISHING.md**: Publishing instructions for dual distribution
- **E2E-TESTING-GUIDE.md**: End-to-end testing workflows
- **INTEGRATION-SUMMARY.md**: Detailed integration documentation

### 🔧 Changed

**Package Structure**
- **Size**: Increased from ~350KB to 446KB (unpacked) due to plugin integration
- **Files**: Added `plugin/` and `.claude-plugin/` directories to published package
- **Total Files**: 80 files (70 framework + 10 plugin)

**Marketplace Configuration**
- **Source Path**: Updated from `./plugin` to `./Agent`
- **Package Name**: Unified naming as `agentic15-claude-zen`

### 📦 Package Statistics

**Version**: 8.0.0
**Size**: 101.4 KB (compressed), 446.1 KB (unpacked)
**Total Files**: 80
**Tests**: 85 plugin tests + existing framework tests

### 🎯 Benefits

- **Single Installation**: One package provides both CLI and Claude Code integration
- **Version Synchronization**: Framework and plugin always in sync
- **Simpler Maintenance**: Single package.json, version, and publish command
- **Better UX**: No confusion about which packages to install
- **Consistent Naming**: Package name matches repository

### 📖 Migration Guide

See `INTEGRATION-SUMMARY.md` for complete migration instructions.

For existing users:
1. Uninstall old plugin (if installed): `npm uninstall -g @agentic15.com/claude-code-zen-plugin`
2. Choose installation method:
   - **npx** (no install): `npx @agentic15.com/agentic15-claude-zen@8.0.0 status`
   - **Local**: `npm install --save-dev @agentic15.com/agentic15-claude-zen@8.0.0`
   - **Global**: `npm install -g @agentic15.com/agentic15-claude-zen@8.0.0`
3. Update `.claude/settings.json` plugin name (if using explicit config)
4. Verify: `/plugin list` and `/agentic15:status`

---

## [7.0.1] - 2026-01-04

### Fixed
- **README.md**: Reduced from 806 lines to 340 lines (58% smaller)
- **Documentation**: Removed embedded platform guides, added links to separate docs
- **Organization**: GitHub and Azure DevOps setup now link to detailed guides instead of embedding 400+ lines

### Changed
- **README.md**: Clean, lean structure (9.0kB vs 20.8kB)
- **Platform Integration**: Quick setup + links instead of full embedded documentation

---

## [7.0.0] - 2026-01-04

### 🎉 MAJOR RELEASE - Token-Efficient Architecture & Autonomous UI Verification

This major release fundamentally improves how data-driven applications are built with Claude, introducing a centralized service layer pattern that reduces token usage by 1000x and ensures production-ready code from Day 1.

### Summary
Major architectural improvements for data-driven applications, autonomous UI verification, and complete workflow consistency.

### 🚀 New Architecture Pattern

**Centralized Service Layer for Data-Driven Apps** ⭐ **FLAGSHIP FEATURE**
- **Token Efficiency**: 2K tokens to switch phases (not 2M tokens updating 1000 files)
- **One File Updates**: Claude updates only `services/api.js` to transition mock → API → database
- **Production-Ready UI**: UI components never change across development phases
- **Phase-Based Development**: UI-first with mocks → Real API → Database integration
- **Template Files**: Pre-built `api.js.template` and `mock-data.js.template`
- **Embedded in Plan Generation**: All data-driven app plans automatically use this pattern

**Architecture:**
```
UI Components (1000+ files) → Never change
     ↓
services/api.js (1 file) → Claude updates only this
     ↓
Mock Data OR Real API → Config-based switching
```

**Impact:**
- ✅ Users see working UI on Day 1
- ✅ No confusion about mock vs real data
- ✅ Claude doesn't waste tokens reading 1000 files
- ✅ UI code is production-ready from start

---

### ✨ Added

**Autonomous UI Verification Workflow**
- **Visual Test Enhancements**: Network error logging (4xx/5xx responses) with timestamps
- **Accessibility Testing**: Integrated axe-core for WCAG compliance checking
- **Plan Generation Philosophy**: Embedded lean testing guidelines (5-10 focused tests, not 50-100)
- **UI Verification Checkpoint**: All generated tasks now include UI verification in completion criteria
- **Claude Self-Checks**: Claude autonomously runs `npx agentic15 visual-test` and analyzes results

**Plan Branch Consistency**
- **Auto-Branch Creation**: Plan commands now auto-create branches (`plan/<plan-id>`)
- **Workflow Consistency**: Plans follow same workflow as tasks (branch → commit → PR)
- **Sync Support**: `npx agentic15 sync` now handles plan branches
- **Permission Updates**: Template settings.json includes `visual-test` in allow list

### 🔧 Changed
- **PlanCommand**: Now creates branch before plan generation (matches task workflow)
- **PlanCommand**: Archive with unique naming (timestamp) when plan already archived
- **SyncCommand**: Recognizes and handles `plan/*` branches alongside `feature/*` and `admin/*`
- **Settings Template**: Updated with specific deny rules instead of blanket `npx agentic15:*` ban

### 📝 Philosophy & Guidance
- **Service Layer Pattern**: Complete architecture guidance embedded in plan generation
- **Testing Philosophy**: Necessity vs luxury testing guidelines (5-10 tests, not 50-100)
- **Documentation Philosophy**: Claude-facing decisions only, no human tutorials
- **Development Phases**: UI-first → API → Database progression strategy

### 📦 Templates
- **NEW**: `templates/services/api.js.template` - Centralized service layer boilerplate
- **NEW**: `templates/services/mock-data.js.template` - Realistic mock data structure

---

### 💡 Why Version 7.0.0?

This is a **major version** because it introduces a fundamental architectural shift in how data-driven applications are developed:

**Before (6.x):**
- Claude updates 1000 UI files with markers
- 2M+ tokens to transition mock → real
- High error risk, maintenance nightmare

**After (7.0):**
- Claude updates 1 service file
- 2K tokens to transition phases
- Production-ready UI from Day 1

This architectural pattern is now the **default approach** for all data-driven applications, fundamentally changing the development workflow.

---

## [6.0.1] - 2025-12-31

### Summary
Patch release to fix README documentation sync for npm package.

### Fixed
- **README Sync Script**: Updated `sync-readme` script to use ESM syntax (`import()` instead of `require()`)
- The prepublishOnly hook now correctly syncs the latest README.md before publishing
- npm package page will now show complete dual-platform documentation

### Changed
- Package now includes full 17.3kB README with Azure DevOps documentation (was 11.5kB)

---

## [6.0.0] - 2025-12-31

### 🎉 MAJOR RELEASE - Dual-Platform Support (GitHub + Azure DevOps)

This is a **major release** that adds comprehensive Azure DevOps support while maintaining full backward compatibility with GitHub workflows.

### ✨ What's New

#### Azure DevOps Integration
- **Platform Auto-Detection**: Automatically detects GitHub or Azure DevOps from git remote URL
- **Azure PR Creation**: Uses Azure CLI (`az repos pr create`) with proper web UI URLs
- **Azure Work Items**: Optional work item integration (disabled by default)
- **Dual-Platform Commands**: All commands (`commit`, `sync`, `plan`) work with both platforms

#### Enhanced Commands

**CommitCommand** (`npx agentic15 commit`):
- ✅ Platform detection (GitHub vs Azure DevOps)
- ✅ Azure PR creation with web UI URLs (not API endpoints)
- ✅ Extracts repository name from git remote
- ✅ Backward compatible with GitHub

**SyncCommand** (`npx agentic15 sync`):
- ✅ Azure PR status checking (`az repos pr list`)
- ✅ Admin branch support (`admin/*` for plan management)
- ✅ Context-aware next steps based on branch type:
  - After archive plan: "Start new project"
  - After new plan: "Create project plan with Claude"
  - After task: "Start next task"

**PlanCommand** (`npx agentic15 plan`):
- ✅ Help command (`npx agentic15 plan help`)
- ✅ Azure PR creation for archive/new plan workflows
- ✅ Fixed empty ACTIVE-PLAN handling after archive
- ✅ Comprehensive role definitions in requirements file
  - Explains Human's role (runs commands, manages git)
  - Explains Claude's role (reads/writes code)
  - Lists what Claude must NOT do (no agentic15/git commands)
  - Complete workflow explanation for new projects

### 🔧 Technical Improvements

**Platform Detection**:
- Added `detectPlatform()` method to all command classes
- Detects based on git remote URL patterns
- Returns `'github'`, `'azure'`, or `'unknown'`

**Azure PR URLs**:
- Fixed Azure CLI returning API endpoint URLs
- Now constructs proper web UI URLs: `https://dev.azure.com/{org}/{project}/_git/{repo}/pullrequest/{id}`
- Extracts repository name from git remote

**Admin Branch Support**:
- Sync command now handles `admin/*` branches (plan archive/new)
- Prevents data loss by checking PR status before cleanup
- Deletes admin branches after PR merge

**Configuration**:
- Added `azureDevOps` section to `framework/settings.json`
- Default: `enabled: false` (opt-in)
- Supports `autoCreate`, `autoUpdate`, `autoClose` for work items
- Authentication via `AZURE_DEVOPS_PAT` environment variable

### 📚 Documentation

**New Documentation**:
- `docs/AZURE-SETUP.md` - Complete Azure DevOps setup guide
- `docs/GITHUB-SETUP.md` - Complete GitHub setup guide

**Updated Documentation**:
- README.md - Added dual-platform sections
- Plan requirements file - Added role definitions and workflow explanation
- Settings template - Added Azure DevOps configuration

### 🐛 Bug Fixes

1. **Plan Command**: Fixed handling of empty ACTIVE-PLAN file after archive
2. **Azure PR URLs**: Fixed API endpoint URLs not opening in browser
3. **Sync Command**: Fixed not recognizing admin branches
4. **Context Awareness**: Fixed generic next steps after different workflows

### ⚙️ Configuration Example

**.claude/settings.local.json** (Azure DevOps):
```json
{
  "github": {
    "enabled": false
  },
  "azureDevOps": {
    "enabled": true,
    "autoCreate": false,
    "autoUpdate": false,
    "autoClose": false,
    "organization": "your-org",
    "project": "your-project"
  }
}
```

### 🚀 Upgrade Instructions

**Existing Projects**:
```bash
# Update package
npm install @agentic15.com/agentic15-claude-zen@6.0.0

# Update settings.json
npx agentic15 update-settings

# Configure Azure DevOps (if needed)
# Set AZURE_DEVOPS_PAT environment variable
# Update .claude/settings.local.json
```

**New Azure DevOps Projects**:
```bash
npx @agentic15.com/agentic15-claude-zen my-project
cd my-project

# Follow docs/AZURE-SETUP.md for complete setup
```

### 📦 Package Details

- **Size**: 70.0 kB compressed, 313.1 kB unpacked
- **Files**: 50
- **New Files**:
  - `src/cli/PlanCommand.js` (24.2kB) - Enhanced with help & Azure support
  - `src/cli/SyncCommand.js` (10.4kB) - Admin branch & context-aware
  - `src/cli/CommitCommand.js` (28.0kB) - Azure PR URL fix

### ⚠️ Breaking Changes

None - fully backward compatible with GitHub workflows.

### 🎯 Requirements

- **Node.js**: 18.0.0 or higher
- **Git**: Any recent version
- **Platform** (choose one or both):
  - **GitHub**: GitHub CLI (`gh`) + GitHub account
  - **Azure DevOps**: Azure CLI (`az`) + Azure DevOps account + PAT token

---

## [3.1.0] - 2025-12-26

### Summary
Minor release adding upgrade command for existing projects.

### Added
- **`npx agentic15 upgrade`** - New command to upgrade framework files in existing projects
  - Updates .claude/hooks/, settings.json, schemas, and templates
  - Preserves user code (Agent/), plans (.claude/plans/), and local settings
  - Creates automatic backup (.claude.backup/) before upgrading
  - Shows version information and detailed upgrade report

### Changed
- Updated command count in README from 5 to 6 commands

## [3.0.4] - 2025-12-25

### Summary
Package configuration cleanup - removed WORKFLOWS.md from files array as it's available on GitHub.

### Changed
- Removed WORKFLOWS.md from package.json files array (documentation available at GitHub repo)
- No functional changes

## [3.0.3] - 2025-12-25

### Summary
Critical bug fix for interactive requirements mode.

### Fixed
- Fixed interactive mode not detecting Ctrl+D/Ctrl+Z - removed `terminal: false` from readline configuration to properly detect EOF signals in terminal environments

## [3.0.2] - 2025-12-25

### Summary
Publishing update - no code changes from v3.0.1.

This release publishes the interactive requirements mode to npm registry.

## [3.0.1] - 2025-12-25

### Summary
Patch release to publish the interactive requirements mode feature to npm.

This release makes v3.0.0 officially available on npm with the interactive mode feature fully documented and tested.

## [3.0.0] - 2025-12-25

### 🎉 MAJOR RELEASE - Complete CLI Architecture Transformation

This is a **major breaking release** that fundamentally transforms the framework from npm script-based workflows to a pure CLI-driven architecture. The package has been completely rewritten, tested, and optimized for production use.

### 🆕 Interactive Requirements Mode

Running `npx agentic15 plan` without arguments now enters **interactive mode**:
- Type or paste requirements of any length
- Include URLs, detailed specs, multiple paragraphs
- Press Ctrl+D (Mac/Linux) or Ctrl+Z+Enter (Windows) to save
- No shell escaping or quote issues
- Perfect for complex corporate websites, detailed project specs

**Example**:
```bash
npx agentic15 plan
# Paste your requirements...
# Press Ctrl+D when done
```

### 💥 Breaking Changes

**CRITICAL**: This release is **NOT backward compatible** with v1.x or v2.x workflows.

1. **All npm scripts removed** - Use `npx agentic15 <command>` instead
   - ❌ `npm run plan:generate` → ✅ `npx agentic15 plan "description"`
   - ❌ `npm run plan:init` → ✅ `npx agentic15 plan` (auto-locks)
   - ❌ `npm run task:start` → ✅ `npx agentic15 task next`
   - ❌ No task:done - Status auto-detected by CLI

2. **No obfuscated/minified code** - Ships pure ESM source code
   - Removed 248KB of minified v1.x code
   - Transparent, auditable codebase
   - Easier debugging and contributions

3. **Built-in plan logic** - No external script dependencies
   - Plan generation/locking logic moved into PlanCommand class
   - No npm script wrapper required
   - Single command for entire workflow

4. **v2.0 schema support** - Updated PROJECT-PLAN.json structure
   - Root level uses `project` (singular) instead of `projects` (plural)
   - Compatible with PROJECT-PLAN-TEMPLATE.json format
   - Recursive task extraction from nested structures

### ✨ What's New

#### CLI Commands (All New)
```bash
npx agentic15 auth              # One-time GitHub setup
npx agentic15 plan "desc"       # Generate plan requirements
npx agentic15 plan              # Lock plan (if PROJECT-PLAN.json exists)
npx agentic15 task next         # Auto-start next pending task
npx agentic15 task start ID     # Start specific task
npx agentic15 commit            # Test, commit, push, create PR
npx agentic15 status            # Show current progress
```

#### GitHub Integration
- ✅ Issue templates (.github/ISSUE_TEMPLATE/task.md)
- ✅ PR templates (.github/PULL_REQUEST_TEMPLATE.md)
- ✅ CLI uses templates for consistent formatting
- ✅ Auto-generated issues follow standard structure
- ✅ Auto-generated PRs follow standard structure

#### Quality Improvements
- 📦 Package size: 46.0 kB compressed (down from 294KB)
- 📁 Total files: 52 (down from 67)
- 🧪 Black box tested - 5 critical bugs found and fixed
- ✅ All core workflows verified end-to-end
- 📚 Complete documentation with workflow diagrams

### 🐛 Critical Bug Fixes (Found During Testing)

All bugs discovered and fixed during comprehensive black box testing:

1. **Import Path Error** (bin/create-agentic15-claude-zen.js:179)
   - Fixed: dist/index.js → src/index.js

2. **Template Path Error** (src/core/TemplateManager.js:32)
   - Fixed: Added '../..' to reach package root from src/core/

3. **Obsolete Method Call** (src/core/ProjectInitializer.js)
   - Removed: extractBundledFiles() call (tried to copy non-existent scripts)

4. **Schema Compatibility** (src/cli/PlanCommand.js:207-210)
   - Added: Support for v2.0 schema with singular 'project' at root

5. **Wrong Method Reference** (src/cli/TaskCommand.js:155-158)
   - Fixed: Now calls correct TaskIssueMapper.taskToIssueTitle/Body/Labels methods

### 📊 Testing & Verification

- ✅ **Test Repository**: https://github.com/agentic15/agentic15-test-v2
- ✅ **Project Creation**: Templates, dependencies, git, hooks
- ✅ **Plan Generation**: Requirements file, plan ID, ACTIVE-PLAN
- ✅ **Plan Locking**: Task extraction (3/3 tasks verified)
- ✅ **Task Management**: Auto-start next task, feature branch creation
- ✅ **Git Workflow**: Feature branches, status tracking

### 🎯 Migration Guide (v1.x/v2.x → v3.0.0)

**Before (v1.x/v2.x)**:
```bash
npm run plan:generate "Build calculator"
# Claude creates plan
echo "plan-001-generated" > .claude/ACTIVE-PLAN
npm run plan:init
npm run task:start TASK-001
# Write code
npm run task:done
```

**After (v3.0.0)**:
```bash
npx agentic15 plan "Build calculator"
# Claude creates plan
npx agentic15 plan
npx agentic15 task next
# Write code
npx agentic15 commit
```

### 📦 Package Details

- **Size**: 46.0 kB compressed, 177.7 kB unpacked
- **Files**: 52
- **Architecture**: Pure ESM modules
- **Node**: >=18.0.0
- **Dependencies**: @octokit/rest@20.0.2, commander@12.1.0

### 🚀 Upgrade Instructions

**New Projects** (Recommended):
```bash
npx @agentic15.com/agentic15-claude-zen@3.0.0 my-project
cd my-project
npx agentic15 auth
npx agentic15 plan "Your project description"
```

**Existing Projects** (Requires Manual Migration):
1. Update package: `npm install @agentic15.com/agentic15-claude-zen@3.0.0`
2. Run auth setup: `npx agentic15 auth`
3. Replace all npm run task:* with npx agentic15 commands
4. Update any automation scripts

### 🎓 Documentation

- README.md: Quick start guide
- WORKFLOWS.md: Complete workflow documentation with mermaid diagrams
- CHANGELOG.md: Detailed version history (this file)
- .claude/POST-INSTALL.md: Instructions for Claude

### ⚠️ Known Limitations

- GitHub integration requires valid Personal Access Token
- PR creation requires GitHub CLI (gh) installed
- Windows users: Use quotes around package name in PowerShell

---

## [2.0.9] - 2025-12-25

### Changed
- **BREAKING**: Removed obfuscated scripts directory (contained old v1.x minified code)
- **BREAKING**: Removed npm scripts (plan:generate, plan:init) - no longer needed
- Refactored PlanCommand.js to have plan generation/locking logic built-in (no external scripts)
- Package now uses ONLY CLI commands as documented in WORKFLOWS.md
- Package size: 45.7 kB compressed, 176.5 kB unpacked (52 files)
- TaskIssueMapper now follows .github/ISSUE_TEMPLATE/task.md structure for consistency
- CommitCommand now follows .github/PULL_REQUEST_TEMPLATE.md structure for PRs
- Updated onboarding instructions to show v2.0 CLI commands (removed outdated npm scripts)

### Added
- GitHub issue and PR templates (.github/ISSUE_TEMPLATE/task.md, PULL_REQUEST_TEMPLATE.md)
- CLI now uses templates for consistent issue/PR formatting
- Built-in plan generation logic in PlanCommand class
- Built-in plan locking logic with task extraction
- Support for v2.0 schema (singular 'project' at root) in extractTasks()
- Standardized issue body format with sections: Task Description, Completion Criteria, Dependencies, Phase
- Standardized PR body format with sections: Task, Description, Changes, Testing, Notes

### Fixed
- **BUG #1**: Incorrect import path in bin/create-agentic15-claude-zen.js (dist/index.js → src/index.js)
- **BUG #2**: Wrong template path in TemplateManager.js (needed to go up 2 levels from src/core/)
- **BUG #3**: Removed obsolete extractBundledFiles() call (tried to copy non-existent scripts)
- **BUG #4**: extractTasks() now handles v2.0 schema with singular 'project' key
- **BUG #5**: TaskCommand.js calls correct TaskIssueMapper methods (not non-existent mapTaskToIssue)

### Removed
- All obfuscated v1.x scripts (19 files, ~248KB of minified code)
- npm run plan:* commands from templates
- extractBundledFiles() method call from ProjectInitializer

### Testing
- Black box testing completed with 5 bugs found and fixed
- Successfully tested: project creation, auth setup, plan generation, plan locking, task extraction, feature branch creation
- Test repository: https://github.com/agentic15/agentic15-test-v2

## [2.0.8] - 2025-12-25

### Changed
- Removed entire dist/ folder (48 minified files)
- Changed to ship source code only (no minification)
- Updated package.json main entry from dist/index.js to src/index.js
- Removed all build/minification scripts

### Fixed
- Fixed obfuscated/minified code showing wrong v1.x commands

## [2.0.7] - 2025-12-25

### Removed
- Deleted CLAUDE.md (1,100+ lines of obsolete v1.x documentation)
- Deleted ONBOARDING.md (86 lines of obsolete v1.x onboarding)

### Changed
- Updated templates/README.md with v2.0 commands

## [2.0.6] - 2025-12-25

### Changed
- Added PowerShell syntax to README.md and WORKFLOWS.md
- PowerShell requires quotes: `npx "@agentic15.com/agentic15-claude-zen" my-project`

## [2.0.5] - 2025-12-25

### Changed
- Simplified README.md from 307 lines to 68 lines
- README now just points to WORKFLOWS.md for detailed workflows

## [2.0.4] - 2025-12-25

### Fixed
- Fixed package README.md with broken documentation links
- Removed references to deleted docs/ folder

## [2.0.3] - 2025-12-25

### Changed
- Further simplified README.md to match WORKFLOWS.md style
- Consolidated all workflow documentation

## [2.0.2] - 2025-12-25

### Changed
- Simplified README.md to focus on quick start and command reference
- All detailed workflows now in WORKFLOWS.md

## [2.0.1] - 2025-12-25

### Changed
- Updated package README with correct v2.0 commands
- Fixed mermaid diagram syntax errors in WORKFLOWS.md

## [2.0.0] - 2025-12-25

### Added
- CLI-based architecture (`npx agentic15` commands)
- Dedicated agentic15 CLI binary for all automation
- Single WORKFLOWS.md with mermaid diagrams
- Visual testing feedback loop
- Auto-generated commit messages
- Feature branch workflow with PRs
- GitHub issue/PR integration

### Removed
- All npm run task:* commands (replaced by CLI)
- 9 workflow documentation files (3,526 lines)
- docs/ folder

### Changed
- Workflow now requires feature branches + PRs (no direct main commits)
- Simplified documentation to <20 line POST-INSTALL.md + WORKFLOWS.md
- Commit messages auto-generated as [TASK-XXX] title

## [1.0.1] - 2025-12-24

### Changed
- Updated package name to @agentic15.com/agentic15-claude-zen
- Updated bin command to agentic15-claude-zen
- Removed obfuscation, now using standard minification with sourcemaps
- Updated all copyright references from "Agentic15" to "agentic15.com"
- Added complete package documentation (README.md, CHANGELOG.md, LICENSE)
- Added npm package link to README

### Fixed
- Package now includes README.md, LICENSE, and CHANGELOG.md files

## [1.0.0] - 2025-12-24

### Added
- Initial release of Agentic15 Claude Zen framework
- Structured project planning with hierarchical organization (Project → Subproject → Milestone → Task)
- Automated quality enforcement through Git hooks
- Smart testing that runs only changed files during commits
- UI component workflow enforcement (component + test + integration site)
- Framework-agnostic support (React, Vue, Angular, Svelte)
- Complete Jest + Babel configuration for testing
- Token-optimized prompts with caching support
- Minified and bundled hooks for fast execution
- Comprehensive documentation and examples
- Post-install guide for quick setup
- Task management scripts (start, done, next, status)
- Plan management scripts (generate, init, amend)
- Integration testing site for UI previews
- Dependency tracking and validation
- Progress monitoring and time estimation

### Features
- **Pre-commit hooks** validate tests, code quality, and UI components
- **Smart testing** runs only changed files during commits (scales to 43,000+ line codebases)
- **Test quality validation** blocks empty tests and missing assertions
- **UI integration validation** enforces complete component workflow
- **Immutable plans** with audit trail for amendments
- **SOLID architecture** with clean separation of concerns

### Documentation
- Getting Started guide
- User Workflows documentation
- Agent Workflows documentation
- Plan Management guide
- Task Management guide
- Test Execution strategies
- Architecture documentation with SOLID principles

[1.0.0]: https://github.com/agentic15/claude-zen/releases/tag/v1.0.0
