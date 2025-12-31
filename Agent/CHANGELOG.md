# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Copyright 2024-2025 agentic15.com

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
