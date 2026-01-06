---
name: agentic15:visual-test
description: Capture screenshots and console errors for UI debugging
---

# agentic15:visual-test

Capture screenshots, console errors, and accessibility issues from your web application for AI-assisted debugging.

## Usage

```
/agentic15:visual-test http://localhost:3000
```

## What it does

1. Launches Playwright in headless browser mode
2. Navigates to the specified URL
3. Captures screenshots (full page + viewport)
4. Records console errors and warnings
5. Logs network errors (4xx/5xx responses)
6. Runs accessibility audit with axe-core
7. Saves page HTML for debugging
8. Stores all results in `.claude/visual-test/`

## Prerequisites

Install Playwright first:
```bash
npx playwright install chromium
```

## Generated Files

The command creates these files in `.claude/visual-test/`:
- `fullpage.png` - Full page screenshot
- `viewport.png` - Viewport screenshot
- `console-errors.log` - JavaScript errors (if any)
- `console-warnings.log` - JavaScript warnings (if any)
- `network-errors.log` - Failed HTTP requests (if any)
- `accessibility.log` - A11y violations (if any)
- `page.html` - Page source for debugging

## Error Handling

- **No URL provided**: You must specify a URL to test
- **Invalid URL format**: URL must start with `http://` or `https://`
- **Playwright not installed**: Install with `npx playwright install chromium`

## Example Workflow

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Run visual test:
   ```
   /agentic15:visual-test http://localhost:3000
   ```

3. Ask Claude to analyze results:
   > "Analyze the visual test results in .claude/visual-test/"

4. Claude reviews screenshots and logs, suggests fixes

5. Implement fixes and re-test

## Use Cases

- UI regression testing
- Debugging layout issues
- Finding console errors
- Accessibility compliance
- Network request debugging
- Cross-page testing
