# UI Task Detection Strategy

## Overview
This document defines the strategy for automatically detecting when a task involves UI development and requires visual verification (screenshots, console logs, Playwright tests).

## Detection Criteria

### 1. Task Metadata Detection (Highest Priority)
Tasks explicitly marked with UI metadata fields in PROJECT-PLAN.json:

**Metadata Fields:**
- `uiUrl` (string): URL where the UI can be tested (e.g., "http://localhost:3000")
- `uiTestRequired` (boolean): Explicit flag indicating UI testing needed
- `uiFlows` (array): User flows to test (e.g., ["login", "checkout", "navigation"])
- `selectors` (object): CSS selectors for key elements

**Detection Logic:**
- If `uiTestRequired === true` → UI task (100% confidence)
- If `uiUrl` present and non-empty → UI task (100% confidence)
- If `uiFlows` array present with length > 0 → UI task (100% confidence)

**Example:**
```json
{
  "id": "TASK-042",
  "title": "Implement login form",
  "uiUrl": "http://localhost:3000/login",
  "uiTestRequired": true,
  "uiFlows": ["login-success", "login-failure", "password-reset"],
  "selectors": {
    "emailInput": "#email",
    "passwordInput": "#password",
    "submitButton": "button[type=submit]"
  }
}
```

### 2. File Change Detection (Medium Priority)
Analyze git diff to detect UI-related file changes.

**UI File Patterns:**
- **React/JSX:** `*.jsx`, `*.tsx`, `*.js` (in component directories)
- **Vue:** `*.vue`
- **Svelte:** `*.svelte`
- **Angular:** `*.component.ts`, `*.component.html`
- **Styles:** `*.css`, `*.scss`, `*.sass`, `*.less`, `*.module.css`
- **HTML:** `*.html` (excluding templates in email/backend contexts)
- **UI Assets:** `*.svg`, `*.png`, `*.jpg` (in assets/images directories)

**Detection Logic:**
- Scan git diff for modified/added files
- Match against UI file patterns
- Calculate UI file ratio: (UI files changed) / (total files changed)
- If UI file ratio > 50% → UI task (80% confidence)
- If UI file ratio > 25% → Possible UI task (50% confidence)

**Edge Cases:**
- Backend test files mentioning UI components: Exclude `*.test.js`, `*.spec.js` from UI detection unless in `/components/` or `/ui/` directories
- Configuration files: Exclude `webpack.config.js`, `vite.config.js`, etc.
- SSR/Backend rendering: Files in `/server/`, `/api/`, `/backend/` directories are excluded even if they contain `.jsx`

### 3. Task Description Keyword Detection (Low Priority)
Analyze task title and description for UI-related keywords.

**High-Confidence Keywords (90% confidence):**
- "UI", "user interface", "frontend", "front-end"
- "component", "widget", "button", "form", "modal", "dialog"
- "page", "screen", "view", "layout"
- "styling", "CSS", "responsive", "mobile", "desktop"
- "Playwright", "visual test", "screenshot", "E2E test"

**Medium-Confidence Keywords (60% confidence):**
- "click", "render", "display", "show", "hide"
- "navigation", "menu", "navbar", "sidebar"
- "animation", "transition", "hover", "focus"
- "accessible", "a11y", "ARIA", "keyboard navigation"

**Low-Confidence Keywords (30% confidence):**
- "user", "interaction", "experience"
- "visual", "appearance", "look and feel"

**Detection Logic:**
- Count keyword matches in title (weighted 2x) and description (weighted 1x)
- If high-confidence keyword count ≥ 2 → UI task (90% confidence)
- If high-confidence count ≥ 1 AND medium-confidence count ≥ 2 → UI task (70% confidence)
- If medium-confidence count ≥ 3 → Possible UI task (50% confidence)

**False Positive Prevention:**
- Exclude if task contains: "API documentation", "backend", "database", "migration", "SQL"
- Exclude if task is in phase: "deployment", "infrastructure"

### 4. Task Phase Detection (Contextual)
Some phases are more likely to involve UI work.

**High UI Likelihood Phases:**
- "design" (when combined with UI keywords)
- "implementation" (when creating frontend features)
- "testing" (when explicitly for UI/E2E tests)

**Low UI Likelihood Phases:**
- "deployment"
- "infrastructure"
- "database design"

## Confidence Scoring System

Combine all detection methods with weighted confidence scores:

```javascript
const detectionScore = {
  metadata: 0,      // 0-100
  fileChanges: 0,   // 0-100
  keywords: 0,      // 0-100
  phase: 0          // 0-20 (boost/penalty)
};

// Weighted calculation
const finalConfidence = (
  (detectionScore.metadata * 0.5) +
  (detectionScore.fileChanges * 0.3) +
  (detectionScore.keywords * 0.15) +
  (detectionScore.phase * 0.05)
);

// Decision thresholds
if (finalConfidence >= 80) → UI task (auto-verify)
if (finalConfidence >= 50) → Possible UI task (suggest verification)
if (finalConfidence < 50) → Not a UI task (skip verification)
```

## Edge Cases

### 1. Backend + Frontend Mixed Tasks
**Example:** "Add user profile API endpoint and profile page"

**Strategy:**
- Detect as UI task if UI file ratio > 30%
- Run UI verification only if `uiUrl` provided
- Skip if purely API endpoint without frontend changes

### 2. API with UI Changes
**Example:** "Update API response format" (requires frontend adjustment)

**Strategy:**
- Detect UI involvement from file changes (if frontend files modified)
- Confidence score will be medium (50-70%)
- Suggest UI verification but don't enforce

### 3. Documentation Tasks
**Example:** "Document component API"

**Strategy:**
- Exclude if task title contains: "document", "documentation", "README"
- Exclude if only `.md` files changed
- Exception: "Document UI component API" with component file changes → possible UI task

### 4. Test-Only Tasks
**Example:** "Write unit tests for validation logic"

**Strategy:**
- Exclude if only test files changed (`*.test.js`, `*.spec.js`)
- Exception: "Write Playwright E2E tests" → UI task

### 5. Styling-Only Tasks
**Example:** "Update button color scheme"

**Strategy:**
- Detect as UI task (100% confidence)
- Even if only CSS files changed
- Requires visual verification

## Integration Points

### 1. Task Completion Hook
**File:** `Agent/framework/hooks/complete-task.js`

**Integration:**
```javascript
// After task completion, before commit
const detector = new UITaskDetector();
const isUITask = await detector.detect(taskId);

if (isUITask.confidence >= 80) {
  console.log('🎨 UI task detected - running visual verification...');
  await runVisualTest(isUITask.url);
}
```

### 2. Task Start Hook (Optional)
**File:** `Agent/framework/hooks/start-task.js`

**Integration:**
```javascript
// When task starts, inform user if UI verification will run
const detector = new UITaskDetector();
const isUITask = await detector.detect(taskId);

if (isUITask.confidence >= 80) {
  console.log('📋 This task requires UI verification upon completion');
  console.log(`   URL: ${isUITask.url || 'Will be detected from project'}`);
}
```

### 3. Plan Validation
**File:** `Agent/src/cli/PlanCommand.js`

**Integration:**
```javascript
// When locking plan, validate UI tasks have required metadata
tasks.forEach(task => {
  const detector = new UITaskDetector();
  const detection = detector.detectFromMetadata(task);

  if (detection.confidence >= 80 && !task.uiUrl) {
    console.warn(`⚠️  ${task.id}: UI task missing uiUrl field`);
  }
});
```

## False Positive/Negative Scenarios

### False Positives (Detected as UI, but not)

| Scenario | Why Detected | Prevention Strategy |
|----------|--------------|---------------------|
| Backend API docs mentioning "user interface" | Keyword match | Exclude if only `.md` files + "document" in title |
| Server-side rendering template changes | `.jsx` files in `/server/` | Exclude files in `/server/`, `/api/` directories |
| Email template HTML | `.html` files | Exclude `/email/`, `/templates/` directories |
| Build config with "component" reference | Keyword in config file | Exclude build config files by pattern |

### False Negatives (UI task, but not detected)

| Scenario | Why Missed | Mitigation Strategy |
|----------|------------|---------------------|
| New UI framework (e.g., Solid.js) | File pattern not recognized | Add `.jsx` fallback, allow manual `uiTestRequired` flag |
| UI logic in plain `.js` without keywords | No clear signals | Encourage developers to use `uiTestRequired` metadata |
| CSS-in-JS (styled-components) | Only `.js` files changed | Detect import patterns: `import styled from` |
| Visual regression without code changes | No file changes | Support manual UI verification trigger |

## Implementation Approach

### Phase 1: Core Detection (TASK-003)
Implement basic detection using metadata and file patterns.

### Phase 2: Keyword Analysis (Future Enhancement)
Add NLP-based keyword detection if needed.

### Phase 3: ML-Based Detection (Future Enhancement)
Train model on historical tasks if false positive rate > 10%.

## Configuration

Allow users to customize detection via `settings.json`:

```json
{
  "uiDetection": {
    "enabled": true,
    "autoVerify": true,
    "confidenceThreshold": 80,
    "customFilePatterns": ["*.custom.ui.js"],
    "excludeDirectories": ["/server/", "/scripts/"],
    "forceUITasks": ["TASK-042", "TASK-055"]
  }
}
```

## Success Metrics

- **Accuracy Rate:** > 90% (correct detection of UI vs non-UI tasks)
- **False Positive Rate:** < 5%
- **False Negative Rate:** < 10%
- **User Override Rate:** < 3% (users manually correcting detection)

## Conclusion

This strategy prioritizes explicit metadata (developer intent) over heuristics, with fallback to file analysis and keyword detection. The confidence scoring system allows for graceful handling of ambiguous cases, and the integration points ensure seamless workflow automation.
