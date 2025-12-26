# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Copyright 2024-2025 agentic15.com

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
