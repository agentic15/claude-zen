# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Copyright 2024-2025 agentic15.com

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
