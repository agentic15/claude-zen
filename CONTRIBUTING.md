# Contributing to Agentic15 Claude Zen

> **Code with Intelligence, Ship with Confidence**

Thank you for your interest in contributing to Agentic15 Claude Zen! This document provides guidelines for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [Contribution Workflow](#contribution-workflow)
5. [Code Standards](#code-standards)
6. [Testing Requirements](#testing-requirements)
7. [Documentation](#documentation)
8. [Pull Request Process](#pull-request-process)
9. [License](#license)

---

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behavior:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards others

**Unacceptable behavior:**
- Trolling, insulting/derogatory comments, personal or political attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Violations may be reported to conduct@agentic15.com. All complaints will be reviewed and investigated promptly and fairly.

---

## Getting Started

### Ways to Contribute

**Code contributions:**
- Bug fixes
- New features
- Performance improvements
- Code refactoring

**Documentation:**
- Fix typos or clarify existing docs
- Add examples or tutorials
- Translate documentation
- Improve API documentation

**Community:**
- Answer questions in Discussions
- Help triage issues
- Review pull requests
- Share your experience using the framework

### Before You Start

1. **Search existing issues** - Your idea or bug may already be reported
2. **Open an issue** - Discuss major changes before implementing
3. **Follow the plan** - Check if work aligns with project roadmap
4. **Read the docs** - Understand the framework before contributing

---

## Development Setup

### Prerequisites

```bash
node --version    # v18.0.0+
npm --version     # 9.0.0+
git --version     # 2.30.0+
```

### Clone Repository

```bash
git clone https://github.com/agentic15/claude-zen.git
cd claude-zen
```

### Install Dependencies

```bash
npm install
```

### Build Package

```bash
npm run build
```

### Run Tests

```bash
npm test
```

### Verify Setup

```bash
# Should show all available commands
npm run help

# Should build without errors
npm run build

# Should pass all tests
npm test
```

---

## Contribution Workflow

### 1. Fork and Branch

```bash
# Fork repository on GitHub

# Clone your fork
git clone https://github.com/YOUR_USERNAME/claude-zen.git
cd claude-zen

# Add upstream remote
git remote add upstream https://github.com/agentic15/claude-zen.git

# Create feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Changes

**File organization:**
```
packages/create-agentic15-claude-zen/
├── src/
│   ├── core/           # Core business logic
│   ├── hooks/          # Git hooks
│   ├── scripts/        # CLI scripts
│   ├── templates/      # Project templates
│   └── utils/          # Utility functions
├── test/               # Tests
└── docs/               # Documentation
```

**Code changes:**
- Write code in appropriate directory
- Follow SOLID principles
- Add tests for new functionality
- Update documentation

### 3. Test Your Changes

```bash
# Run all tests
npm test

# Run specific test file
npm test -- your-test.test.js

# Check coverage
npm test -- --coverage

# Build package
npm run build

# Test package locally
npm link
cd /tmp/test-project
npx create-agentic15-claude-zen test-app
```

### 4. Commit Changes

**Commit message format:**
```
[CATEGORY] Brief description (50 chars max)

Detailed explanation (wrap at 72 chars):
- What changed
- Why it changed
- Impact on existing functionality

Fixes #123
```

**Categories:**
- `[FEAT]` - New feature
- `[FIX]` - Bug fix
- `[DOCS]` - Documentation only
- `[STYLE]` - Code style (formatting, missing semicolons, etc.)
- `[REFACTOR]` - Code refactoring
- `[TEST]` - Adding or updating tests
- `[CHORE]` - Maintenance tasks

**Examples:**
```bash
git commit -m "[FEAT] Add support for Vue 3 in template

- Update Babel configuration for Vue 3
- Add Vue 3 dependencies to package.json template
- Update jest.config.js for Vue 3 components
- Add Vue 3 example to documentation

This allows users to create Vue 3 projects with the framework.

Closes #45"
```

### 5. Push and Create PR

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create Pull Request on GitHub
# - Use descriptive title
# - Reference related issues
# - Describe changes and rationale
# - Add screenshots if UI changes
```

---

## Code Standards

### JavaScript/Node.js

**Style guide:**
- Use ES6+ features
- 2 spaces for indentation
- Single quotes for strings
- Semicolons required
- Max line length: 100 characters

**Example:**
```javascript
/**
 * Copyright 2024-2025 Agentic15
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 */

/**
 * Validates email format
 *
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email format
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

### SOLID Principles

**Single Responsibility:**
```javascript
// ❌ BAD: Class does too much
class ProjectManager {
  createProject() { ... }
  installDependencies() { ... }
  setupGitHooks() { ... }
  copyTemplates() { ... }
}

// ✅ GOOD: Separate responsibilities
class ProjectInitializer { createProject() { ... } }
class DependencyInstaller { install() { ... } }
class HookInstaller { setup() { ... } }
class TemplateManager { copy() { ... } }
```

**Dependency Injection:**
```javascript
// ❌ BAD: Hard-coded dependencies
class TaskManager {
  constructor() {
    this.fs = require('fs');
    this.git = require('./git');
  }
}

// ✅ GOOD: Dependencies injected
class TaskManager {
  constructor(fileSystem, gitClient) {
    this.fs = fileSystem;
    this.git = gitClient;
  }
}
```

### Copyright Headers

**All source files must include:**

```javascript
/**
 * Copyright 2024-2025 Agentic15
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
```

---

## Testing Requirements

### Test Coverage

**Minimum requirements:**
- Unit tests: 90%+ coverage
- Integration tests: Critical paths covered
- Overall project: 80%+ coverage

**All PRs must:**
- Include tests for new features
- Update tests for bug fixes
- Maintain or improve coverage
- Pass all existing tests

### Writing Tests

**Test structure (AAA pattern):**
```javascript
describe('validateEmail', () => {
  test('returns true for valid email', () => {
    // Arrange
    const email = 'test@example.com';

    // Act
    const result = validateEmail(email);

    // Assert
    expect(result).toBe(true);
  });
});
```

**Test naming:**
```javascript
// ❌ BAD
test('test1', () => { ... });
test('works', () => { ... });

// ✅ GOOD
test('returns true when email format is valid', () => { ... });
test('throws error when email is null', () => { ... });
```

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage

# Specific file
npm test -- TaskManager.test.js
```

---

## Documentation

### Documentation Standards

**All changes must include documentation updates:**

**Code changes:**
- Update relevant markdown files in `docs/`
- Add JSDoc comments to functions
- Update README if API changes
- Add examples for new features

**New features:**
- Add to feature list in README
- Create guide in appropriate `docs/` section
- Add code examples
- Update quick start if relevant

**Bug fixes:**
- Update troubleshooting sections
- Add to CHANGELOG.md

### Documentation Style

**Markdown format:**
```markdown
# Title (H1 - once per document)

Brief introduction paragraph.

## Section (H2)

### Subsection (H3)

**Bold for emphasis**
*Italic for terms*
`Code inline`

```bash
# Code blocks with language
npm test
```

**Lists:**
- Bullet points
- For related items

**Tables:**
| Header | Header |
|--------|--------|
| Cell   | Cell   |
```

**Examples:**
- Show both good and bad examples
- Use ✅ and ❌ for clarity
- Include complete, runnable code

---

## Pull Request Process

### Before Submitting

**Checklist:**
- [ ] Code follows style guide
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Copyright headers added
- [ ] No linting errors
- [ ] Build succeeds
- [ ] CHANGELOG.md updated

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Fixes #123
Relates to #456

## Testing
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] Manual testing completed

## Screenshots (if applicable)
[Add screenshots for UI changes]

## Checklist
- [ ] Code follows style guide
- [ ] Tests pass
- [ ] Documentation updated
- [ ] Copyright headers added
```

### Review Process

1. **Automated checks run** (tests, linting, build)
2. **Maintainer reviews** code and design
3. **Feedback provided** - address comments
4. **Approval** - maintainer approves
5. **Merge** - squash and merge to main

### After Merge

- Your changes appear in next release
- Mentioned in CHANGELOG.md
- Added to contributors list
- Announced in release notes

---

## Development Guidelines

### Adding New Features

**Process:**
1. Open issue describing feature
2. Discuss approach with maintainers
3. Get approval before implementing
4. Follow contribution workflow
5. Submit PR with tests and docs

**Feature requirements:**
- Aligns with project philosophy
- Maintains backward compatibility (or documents breaking changes)
- Includes comprehensive tests
- Well documented with examples
- Performs well (no significant slowdowns)

### Fixing Bugs

**Process:**
1. Reproduce bug
2. Write failing test
3. Fix bug
4. Verify test passes
5. Submit PR

**Bug fix requirements:**
- Test demonstrates bug
- Fix resolves test failure
- No regression in other tests
- Root cause explained in PR

### Refactoring

**Guidelines:**
- Don't refactor and add features in same PR
- Maintain existing behavior
- Improve code quality/performance
- Add tests if coverage lacking
- Document rationale

---

## Release Process

**Maintainers only**

### Version Numbering

Semantic versioning (MAJOR.MINOR.PATCH):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Release Steps

```bash
# Update version
npm version patch|minor|major

# Update CHANGELOG.md
vim CHANGELOG.md

# Commit version bump
git commit -am "Release v1.2.3"

# Tag release
git tag -a v1.2.3 -m "Release version 1.2.3"

# Push
git push origin main --tags

# Publish to npm
npm publish

# Create GitHub release
gh release create v1.2.3
```

---

## Getting Help

### Questions?

- **GitHub Discussions**: https://github.com/agentic15/claude-zen/discussions
- **Issue Tracker**: https://github.com/agentic15/claude-zen/issues
- **Email**: developers@agentic15.com

### Resources

- **Documentation**: https://github.com/agentic15/claude-zen/tree/main/docs
- **Examples**: https://github.com/agentic15/claude-zen/tree/main/examples
- **Roadmap**: https://github.com/agentic15/claude-zen/projects

---

## Recognition

### Contributors

All contributors are recognized in:
- `CONTRIBUTORS.md` file
- GitHub contributors page
- Release notes
- Project README

### Becoming a Maintainer

Active contributors may be invited to become maintainers. Criteria:
- Consistent quality contributions
- Understanding of project architecture
- Helpful in reviews and discussions
- Aligned with project values

---

## License

By contributing to Agentic15 Claude Zen, you agree that your contributions will be licensed under the Apache License, Version 2.0.

See [LICENSE](LICENSE) for full text.

---

## Thank You!

Your contributions make Agentic15 Claude Zen better for everyone. We appreciate your time and effort!

**"Code with Intelligence, Ship with Confidence"** - Agentic15

---

**Copyright 2024-2025 Agentic15**
Licensed under the Apache License, Version 2.0
