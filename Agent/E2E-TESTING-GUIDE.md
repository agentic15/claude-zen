# End-to-End Testing Guide

This guide provides step-by-step instructions for testing the complete Agentic15 workflow with all skills.

## Prerequisites

1. **Separate Test Repository** (DO NOT test in this repo)
   - Create a new repository or use an existing test project
   - Initialize git: `git init`
   - Add remote: `git remote add origin <url>`

2. **Install Agentic15 Framework**
   ```bash
   npm install @agentic15.com/agentic15-claude-zen
   ```

3. **Initialize Agentic15 Project**
   ```bash
   npx agentic15-claude-zen init
   ```

4. **Install Plugin** (once published)
   ```bash
   npm install @agentic15.com/claude-code-zen-plugin
   ```

## Test Scenario 1: Complete Project Workflow

### Phase 1: Project Setup

1. **Generate Plan**
   ```
   /agentic15:plan "Build a simple todo app with React"
   ```

   **Expected Result:**
   - Creates `.claude/plans/plan-001-generated/`
   - Creates `PROJECT-REQUIREMENTS.txt`
   - Sets `ACTIVE-PLAN` file
   - Shows success message

2. **Create Project Plan** (Claude does this)
   - Tell Claude: "Create the project plan"
   - Claude creates `PROJECT-PLAN.json` with tasks

3. **Lock the Plan**
   ```
   /agentic15:plan
   ```

   **Expected Result:**
   - Validates `PROJECT-PLAN.json`
   - Creates `TASK-TRACKER.json`
   - Creates `.plan-locked` file
   - Shows task count

### Phase 2: Task Development Cycle

4. **Start First Task**
   ```
   /agentic15:task-next
   ```

   **Expected Result:**
   - Finds first pending task
   - Creates `feature/task-001` branch
   - Marks task as in_progress
   - Shows task details

5. **Write Code** (Claude does this)
   - Tell Claude: "Write code for this task"
   - Claude implements the task
   - Verify the code works

6. **Check Status**
   ```
   /agentic15:status
   ```

   **Expected Result:**
   - Shows plan progress: 0/X completed
   - Shows current task: TASK-001
   - Lists changed files

7. **Visual Test** (Optional, if UI task)
   ```bash
   # Start dev server
   npm run dev

   # In another terminal
   /agentic15:visual-test http://localhost:3000
   ```

   **Expected Result:**
   - Launches Playwright
   - Captures screenshots
   - Logs errors
   - Saves to `.claude/visual-test/`

8. **Commit Task**
   ```
   /agentic15:commit
   ```

   **Expected Result:**
   - Marks task as completed
   - Creates git commit
   - Pushes to remote
   - Creates pull request
   - Shows PR URL

9. **Merge PR**
   - Go to GitHub/Azure DevOps
   - Review the PR
   - Merge the PR

10. **Sync with Main**
    ```
    /agentic15:sync
    ```

    **Expected Result:**
    - Switches to main branch
    - Pulls latest changes
    - Deletes `feature/task-001` branch
    - Shows next steps

11. **Repeat Steps 4-10** for remaining tasks

### Phase 3: Completion

12. **Final Status Check**
    ```
    /agentic15:status
    ```

    **Expected Result:**
    - Shows 100% completion
    - No tasks in progress

## Test Scenario 2: Error Handling

### Test 2.1: Plan Errors

1. **Attempt to lock non-existent plan**
   ```
   /agentic15:plan
   ```
   When no plan file exists.

   **Expected:** Error message about missing plan file

2. **Attempt to lock already locked plan**
   ```
   /agentic15:plan
   ```
   When plan is already locked.

   **Expected:** Error message about plan being locked

### Test 2.2: Task Errors

3. **Attempt to start task when one is in progress**
   ```
   /agentic15:task-next
   ```
   When a task is already in_progress.

   **Expected:** Error about task already in progress

4. **Attempt to start invalid task ID**
   ```
   /agentic15:task-start INVALID
   ```

   **Expected:** Error about invalid task ID format

5. **Attempt to start completed task**
   ```
   /agentic15:task-start TASK-001
   ```
   When TASK-001 is already completed.

   **Expected:** Error about task already completed

### Test 2.3: Commit Errors

6. **Attempt to commit without active task**
   ```
   /agentic15:commit
   ```
   When no task is in progress.

   **Expected:** Error about no active task (or commits leftover changes)

7. **Attempt to commit with uncommitted changes on main**
   ```bash
   git checkout main
   echo "test" > test.txt
   /agentic15:commit
   ```

   **Expected:** Error about protected branch

### Test 2.4: Sync Errors

8. **Attempt to sync with uncommitted changes**
   ```bash
   echo "test" > test.txt
   /agentic15:sync
   ```

   **Expected:** Error about uncommitted changes

9. **Attempt to sync on invalid branch**
   ```bash
   git checkout -b custom-branch
   /agentic15:sync
   ```

   **Expected:** Error about invalid branch

### Test 2.5: Visual Test Errors

10. **Attempt visual test without URL**
    ```
    /agentic15:visual-test
    ```

    **Expected:** Error about URL required

11. **Attempt visual test with invalid URL**
    ```
    /agentic15:visual-test localhost:3000
    ```

    **Expected:** Error about invalid URL format

## Test Scenario 3: Recovery Scenarios

### Recovery 3.1: Task Stuck in Progress

```bash
# Reset the task
npx agentic15 task reset TASK-001

# Start it again
/agentic15:task-start TASK-001
```

**Expected:** Task resets to pending, can be started again

### Recovery 3.2: Wrong Branch

```bash
# Check current branch
git status

# Switch back
git checkout feature/task-001
```

**Expected:** Can continue work on correct branch

### Recovery 3.3: Uncommitted Changes

```bash
# Option 1: Commit them
/agentic15:commit

# Option 2: Stash them
git stash
/agentic15:sync
git stash pop
```

**Expected:** Can sync after handling changes

## Validation Checklist

Use this checklist to verify all functionality:

### Plan Skill
- [ ] Generate plan with requirements
- [ ] Lock plan with PROJECT-PLAN.json
- [ ] Error: No requirements provided
- [ ] Error: Plan already locked
- [ ] Error: PROJECT-PLAN.json not found

### Task-Next Skill
- [ ] Start next pending task
- [ ] Create feature branch
- [ ] Mark task as in_progress
- [ ] Error: No pending tasks
- [ ] Error: Task already in progress

### Task-Start Skill
- [ ] Start specific task by ID
- [ ] Validate task ID format
- [ ] Error: Invalid task ID
- [ ] Error: Task not found
- [ ] Error: Task already completed

### Commit Skill
- [ ] Commit completed task
- [ ] Create git commit
- [ ] Push to remote
- [ ] Create pull request
- [ ] Error: No active task
- [ ] Error: Protected branch

### Sync Skill
- [ ] Switch to main branch
- [ ] Pull latest changes
- [ ] Delete feature branch
- [ ] Error: Uncommitted changes
- [ ] Error: Invalid branch

### Status Skill
- [ ] Show plan progress
- [ ] Show current task
- [ ] List changed files
- [ ] Error: No active plan

### Visual-Test Skill
- [ ] Launch Playwright
- [ ] Capture screenshots
- [ ] Log console errors
- [ ] Run accessibility checks
- [ ] Error: No URL provided
- [ ] Error: Invalid URL format

## Tips for Testing

1. **Use a Fresh Repository**
   - Start with a clean slate for each test run
   - Avoid polluting with test artifacts

2. **Test in Order**
   - Follow the workflow sequence
   - Don't skip steps

3. **Verify Each Step**
   - Check file creation
   - Verify git state
   - Confirm expected behavior

4. **Test Error Paths**
   - Try invalid inputs
   - Test boundary conditions
   - Verify error messages

5. **Document Issues**
   - Note any unexpected behavior
   - Capture error messages
   - Record steps to reproduce

## Success Criteria

All tests pass when:
- ✅ All skills execute without errors (happy path)
- ✅ Error messages are clear and helpful
- ✅ Git state is correct after each step
- ✅ PRs are created successfully
- ✅ Branches are managed correctly
- ✅ Files are created in correct locations
- ✅ Recovery scenarios work as expected
