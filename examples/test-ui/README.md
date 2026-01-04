# Test UI - UI Verification Workflow

Sample UI project for testing Claude's autonomous UI verification workflow.

## Purpose

This test page validates that the visual-test command correctly detects:
- Console errors
- Accessibility violations
- Network errors (none in this case)
- Visual rendering issues

## Intentional Issues

### Console Errors (2)
1. Reference to `undefinedVariable`
2. Attempt to click `nonExistentElement`

### Accessibility Violations
1. Email input missing `<label>` element
2. Low contrast error messages (`.error-message`)

## Usage

**1. Start the server:**
```bash
cd examples/test-ui
npm start
```

**2. Run visual test:**
```bash
npx agentic15 visual-test http://localhost:3000
```

**3. Check results:**
```
.claude/visual-test/
├── fullpage.png           # Screenshot
├── viewport.png           # Above-fold screenshot
├── console-errors.log     # Should contain 2 errors ✓
├── accessibility.log      # Should contain violations ✓
├── network-errors.log     # Should be empty or not exist ✓
└── page.html             # Page source
```

## Expected Results

**Console Errors:** 2 found
**Accessibility Violations:** 2+ found
**Network Errors:** 0
**Page Renders:** Yes ✓

## Testing the Workflow

This page tests that Claude can:
1. See the page is rendering correctly (screenshots)
2. Detect JavaScript errors (console-errors.log)
3. Detect accessibility issues (accessibility.log)
4. Verify no network failures (network-errors.log)

Claude should analyze the results and identify:
- "Found 2 console errors that need fixing"
- "Found accessibility violations: missing label, low contrast"
- "Page renders correctly visually"
