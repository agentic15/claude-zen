# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [5.0.7] - 2025-12-28

### Fixed
- **CRITICAL: Missing dependency** - Added `@octokit/rest` to package.json dependencies
  - GitHub integration (GitHubClient.js) requires this package
  - Fixes "Cannot find package '@octokit/rest'" error when running any `npx agentic15` command
  - Users upgrading from v5.0.6 should run `npm install` to get the missing dependency

## [5.0.6] - 2025-12-28

### Added
- **`update-settings` command** - New CLI command to update `.claude/settings.json` from latest framework version
  - Automatically backs up existing settings to `.claude/settings.json.backup`
  - Copies latest framework settings from `node_modules/@agentic15.com/agentic15-claude-zen/framework/settings.json`
  - Preserves user overrides in `.claude/settings.local.json`
  - Usage: `npx agentic15 update-settings`
  - Solves the issue where settings.json is not automatically updated when upgrading the npm package
  - Includes validation for framework files and .claude directory existence

## [5.0.5] - 2025-12-28

### Added
- **Migration guide** - Comprehensive v4.x to v5.x migration documentation
  - `MIGRATION-GUIDE-v4-to-v5.md` with step-by-step upgrade instructions
  - Explains architectural changes (framework files moved to node_modules)
  - GitHub settings migration options
  - Troubleshooting section for common issues
  - Quick migration checklist
  - Linked from README.md Documentation section

### Fixed
- **Framework settings.json GitHub config** - Aligned with v5.x standards
  - Removed `token` field (no longer needed with gh CLI authentication)
  - Set `autoCreate`, `autoUpdate`, `autoClose` to `false` (matching v5.0.4 defaults)
  - Updated comment to reference `npx agentic15 auth` command
  - Updated comment to clarify gh CLI handles authentication
  - New projects now have consistent GitHub defaults matching AuthCommand.js behavior

## [5.0.4] - 2025-12-28

### Fixed
- **CRITICAL: GitHub default settings** - Changed default GitHub integration settings to prevent automatic actions without user consent
  - **AuthCommand.js:** Set `autoCreate`, `autoUpdate`, and `autoClose` to `false` by default (were `true`)
  - **README.md:** Updated Manual Configuration example to show correct defaults
  - **Impact:** Users now have full control over GitHub issue creation/updates/closing
  - **Migration:** Existing users with `settings.local.json` are unaffected
  - **Rationale:** Prevents surprise GitHub issues and repository clutter, gives users opt-in control
  - Users can set these to `true` in `.claude/settings.local.json` if they want automatic GitHub issue management

## [5.0.3] - 2025-12-28

### Changed
- **README.md layout improvements** - Major documentation readability enhancements
  - **2-column layout** for main sections using HTML tables
    - Overview: "What is Agentic15 Claude Zen?" | "Key Benefits"
    - Core Features: "Commands" | "Workflow Automation"
    - Project Structure: "Directory Layout" | "Framework Upgrades"
    - GitHub Integration: "Authentication" | "Manual Configuration"
    - Requirements & Philosophy: "Requirements/Docs/Support" | "Philosophy"
  - **Single-column Quick Start** - Converted from cramped 3-column table to clean sequential layout
    - Each step (1-6) has its own heading with clear description
    - Commands properly formatted in code blocks with syntax highlighting
    - Bash/Mac/Linux and PowerShell (Windows) clearly separated
    - Visual separators (---) between steps
  - **Single-column Daily Development Workflow** - Same clean format as Quick Start
    - Each step clearly labeled with location (Claude Code, Your Terminal, GitHub)
    - Commands in proper code blocks
  - **Benefits:**
    - Much easier to read and follow
    - Better mobile/narrow screen compatibility
    - Professional documentation appearance
    - Better use of horizontal space
    - Improved visual hierarchy

## [5.0.2] - 2025-12-28

### Added
- **Visual test file list display** - `npx agentic15 visual-test <url>` now displays all generated file paths with visual separators for easy copy-paste to Claude
  - Shows fullpage.png, viewport.png, console-errors.log (if errors), console-warnings.log (if warnings), page.html
  - Eliminates manual file navigation - users can now instantly share all test outputs with Claude for analysis

### Changed
- **GitHub authentication documentation** - Updated README.md GitHub Integration section
  - Removed all personal access token references
  - Clarified that authentication is handled by `gh` CLI
  - Added clear setup instructions using `npx agentic15 auth`
  - Updated manual configuration example to show gh CLI is used (no token field needed)

- **Quick Start documentation** - Reformatted Quick Start section as easy-to-read tables
  - Setup steps now displayed in table format matching Commands section
  - Added Daily Development Workflow table
  - Improved readability and scanability

### Fixed
- **Documentation accuracy** - Removed outdated GitHub token configuration examples from README
  - No longer references environment variables `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`
  - Accurate reflection of v5.0.1 gh CLI authentication changes

## [2.0.0] - 2025-12-25

### Added

#### CLI Implementation
- **New `agentic15` CLI** - Complete command-line interface replacing npm scripts
  - `npx agentic15 auth` - GitHub authentication setup with git config verification
  - `npx agentic15 plan "description"` - Generate and lock plans in single command
  - `npx agentic15 task next` - Auto-start next pending task
  - `npx agentic15 task start TASK-XXX` - Start specific task
  - `npx agentic15 commit` - Test, commit, push, and create PR in one command
  - `npx agentic15 status` - Show project progress and task status

#### Visual Testing Feedback Loop
- **Playwright visual regression testing** - Screenshot-based UI testing
  - Multi-viewport testing (desktop 1920x1080, mobile 375x667)
  - Baseline screenshot generation
  - Pixel-perfect diff detection
- **Claude debugging hook** - `post-visual-test.js` copies screenshots to `.claude/visual-test-results/`
  - Generates markdown report with visual diffs
  - Makes screenshots readable by Claude for automated UI fixes
  - Complete feedback loop: Human runs tests → Hook processes failures → Claude reads report → Claude fixes UI

#### Documentation
- **QUICK-START.md** - One-page cheat sheet with 5-command workflow
- **WORKFLOW-COMMANDS.md** - Complete workflow guide (plan → task → test → PR)
- **VISUAL-TESTING-WORKFLOW.md** - UI testing guide with screenshot workflows
- **MIGRATION-GUIDE-v2.md** - Upgrade guide from v1.x to v2.0
- **FIXES-APPLIED.md** - Bug fix documentation from black box testing
- **BLACK-BOX-TEST-FINDINGS.md** - Test results and bug reports

#### Automation
- **Auto-generated commit messages** - Format: `[TASK-XXX] Task title`
- **Feature branch creation** - Automatic `feature/task-XXX` branches
- **Automated PR creation** - One-command workflow from code to pull request
- **GitHub issue integration** - Automatic issue creation and status updates

### Changed

#### Template Files
- **Simplified POST-INSTALL.md** - Reduced from 370+ lines to 18 lines
- **Updated package.json** - Added CLI dependency `@agentic15.com/agentic15-claude-zen@^2.0.0`
- **Added Playwright** - Visual testing dependency `@playwright/test@^1.41.0`
- **Updated settings.json** - Block Claude from CLI, git, gh, and docs

#### Architecture
- **CLI-first design** - All automation via `agentic15` commands
- **Feature branch workflow** - Required feature branches + PRs (no direct-to-main)
- **Zero configuration** - Just provide GitHub token once, everything else automatic
- **Clear responsibility separation** - Human runs CLI, Claude writes code only

### Removed

#### npm Scripts
- Removed `npm run plan:generate` (replaced with `npx agentic15 plan`)
- Removed `npm run plan:init` (combined into `npx agentic15 plan`)
- Removed `npm run plan:create` (combined into `npx agentic15 plan`)
- Removed `npm run task:start` (replaced with `npx agentic15 task start`)
- Removed `npm run task:next` (replaced with `npx agentic15 task next`)
- Removed `npm run task:done` (auto-detected by CLI)
- Removed `npm run task:status` (replaced with `npx agentic15 status`)
- Removed `npm run task:merge` (handled by git hooks)

#### Documentation
- **Deleted `docs/` folder** - Entire folder removed to prevent Claude confusion
  - Removed 400+ lines of GitHub integration documentation
  - Moved to external website/wiki
  - Claude now blocked from reading docs via settings.json

#### Features
- **Removed custom commit messages** - Always auto-generated for consistency
- **Removed direct-to-main workflow** - Feature branches + PRs now required
- **Removed configuration options** - Zero-config approach

### Fixed

#### Critical Bugs (Discovered in Black Box Testing)
- **Fixed CLI availability** - Template package.json now includes CLI dependency
- **Fixed command syntax** - All documentation updated to use `npx agentic15`
- **Fixed commit message escaping** - Windows-compatible double-quote escaping
- **Fixed action handler context** - Arrow functions preserve `this` context
- **Fixed ESM imports** - Proper ES6 module syntax throughout

### Breaking Changes

#### For Users
- **Command syntax change**: `npm run task:start` → `npx agentic15 task start`
- **Feature branches required**: No more direct-to-main commits
- **Auto-generated commits**: Cannot customize commit messages
- **GitHub token required**: Must run `npx agentic15 auth` before workflows

#### For Claude
- **Cannot run CLI commands**: Blocked via settings.json
- **Cannot run git/gh**: All git operations handled by CLI
- **Cannot read docs**: Documentation moved to external location
- **Simplified instructions**: Only reads 18-line POST-INSTALL.md

### Migration Guide

**For New Projects**:
```bash
npx @agentic15.com/agentic15-claude-zen@2.0.0 my-project
cd my-project
npx agentic15 auth
npx agentic15 plan "Build feature"
```

**For Existing v1.x Projects**:
See [MIGRATION-GUIDE-v2.md](MIGRATION-GUIDE-v2.md) for detailed upgrade instructions.

### Testing

- ✅ Black box testing completed (9/10 steps passed)
- ✅ Full workflow tested: plan → task → code → test → commit → PR
- ✅ Visual regression testing verified with Calculator component
- ✅ Screenshot feedback loop tested and working
- ✅ GitHub integration tested (issues, PRs, status updates)

### Technical Details

**Dependencies Added**:
- `commander@^12.1.0` - CLI framework
- `@octokit/rest@^20.0.2` - GitHub API client
- `@playwright/test@^1.41.0` - Visual testing (template)

**Architecture**:
- ESM modules (`type: "module"`)
- Commander.js command structure
- Graceful degradation without GitHub token
- Multi-viewport Playwright testing
- Post-test hooks for Claude feedback

---

## [1.1.1] - 2025-12-24

### Added
- GitHub Issues integration
- Automated issue creation during task start
- Issue status updates (open → in review → closed)
- PR-issue linking via "Closes #XXX"

### Fixed
- Git hook error handling
- GitHub API error messages

---

## [1.1.0] - 2025-12-23

### Added
- GitHub token support in settings.local.json
- GitHub API integration via Octokit
- Repository auto-detection from git remote
- Graceful degradation when GitHub token missing

---

## [1.0.0] - 2025-12-20

### Added
- Initial release
- Plan generation and management
- Task tracking system
- Git hooks for automation
- Claude Code integration
- npm scripts for workflow automation

---

[2.0.0]: https://github.com/agentic15/claude-zen/compare/v1.1.1...v2.0.0
[1.1.1]: https://github.com/agentic15/claude-zen/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/agentic15/claude-zen/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/agentic15/claude-zen/releases/tag/v1.0.0
