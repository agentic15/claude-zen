# Plan Management Guide

**Complete guide to creating, locking, and managing project plans in Agentic15 Claude Zen**

This guide covers the entire lifecycle of project plans - from initial creation through amendments and completion.

---

## Table of Contents

1. [Overview](#overview)
2. [Plan Structure](#plan-structure)
3. [Creating Plans](#creating-plans)
4. [Locking Plans](#locking-plans)
5. [Working with Plans](#working-with-plans)
6. [Amending Plans](#amending-plans)
7. [Plan Schemas](#plan-schemas)
8. [Best Practices](#best-practices)

---

## Overview

### What is a Plan?

A **plan** is a structured breakdown of work into hierarchical tasks with:
- Clear objectives and deliverables
- Time estimates
- Dependencies between tasks
- Progress tracking
- Immutability guarantees (after locking)

### Why Use Plans?

**Benefits:**
- ✅ Clear project roadmap
- ✅ Progress tracking and reporting
- ✅ Dependency management
- ✅ Time estimation and budgeting
- ✅ Audit trail of all changes
- ✅ AI agents know exactly what to build

**Without plans:**
- ❌ Unclear priorities
- ❌ No progress visibility
- ❌ Dependencies missed
- ❌ Scope creep
- ❌ AI agents work from assumptions

### Plan Lifecycle

```
1. Generate    → Create PROJECT-REQUIREMENTS.txt
2. Create      → Human/Agent creates PROJECT-PLAN.json
3. Review      → Human reviews and approves
4. Activate    → Set as active plan
5. Lock        → Make immutable, create task tracker
6. Execute     → Work through tasks
7. Amend       → Modify when requirements change (with audit trail)
8. Complete    → All tasks done
```

---

## Plan Structure

### Two Plan Types

**1. Flat Structure** (Simple projects)
```json
{
  "structure": "flat",
  "tasks": [
    { "id": "TASK-001", "title": "..." },
    { "id": "TASK-002", "title": "..." }
  ]
}
```

**2. Hierarchical Structure** (Complex projects)
```json
{
  "structure": "hierarchical",
  "hierarchy": {
    "project": {
      "id": "PROJ-001",
      "subprojects": [
        {
          "id": "SUB-001",
          "milestones": [
            {
              "id": "MILE-001",
              "tasks": [
                { "id": "TASK-001" }
              ]
            }
          ]
        }
      ]
    }
  }
}
```

### Hierarchy Levels

```
Project (PROJ-001)
  └── Subproject (SUB-001)
      └── Milestone (MILE-001)
          └── Task (TASK-001)
```

**When to use each:**
- **Flat**: < 20 tasks, single focus, short timeline
- **Hierarchical**: > 20 tasks, multiple features, complex dependencies

---

## Creating Plans

### Step 1: Generate Requirements

**Human creates requirements:**

```bash
npm run plan:generate "Build a task management application with:
- User authentication (login, register, logout)
- Task CRUD (create, read, update, delete)
- Task categories and tags
- Due dates and reminders
- React frontend with Material-UI
- Node.js backend with PostgreSQL
- REST API
- Unit and integration tests
"
```

**System creates:**
```
.claude/plans/plan-001-generated/PROJECT-REQUIREMENTS.txt
```

**Content example:**
```txt
PROJECT REQUIREMENTS
Generated: 2025-12-24

Title: Task Management Application

Description:
A full-featured task management web application allowing users to organize
their tasks with categories, tags, and due dates.

Features:
1. User Authentication
   - User registration with email/password
   - Login/logout functionality
   - JWT token-based authentication

2. Task Management
   - Create new tasks
   - Edit existing tasks
   - Delete tasks
   - Mark tasks as complete

3. Organization
   - Assign categories to tasks
   - Add multiple tags per task
   - Set due dates
   - Priority levels (low, medium, high)

4. Technology Stack
   - Frontend: React with Material-UI
   - Backend: Node.js with Express
   - Database: PostgreSQL
   - Testing: Jest + React Testing Library

5. Quality Requirements
   - 80%+ test coverage
   - All API endpoints tested
   - All components tested
   - Mobile responsive design
```

### Step 2: Create PROJECT-PLAN.json

**Option A: Claude Code creates the plan**

Claude Code reads PROJECT-REQUIREMENTS.txt and generates:

```json
{
  "metadata": {
    "planId": "plan-001-generated",
    "title": "Task Management Application",
    "description": "Full-stack task management with authentication and organization features",
    "created": "2025-12-24T19:00:00Z",
    "version": "1.0.0",
    "estimatedHours": 120,
    "priority": "high"
  },
  "structure": "hierarchical",
  "hierarchy": {
    "project": {
      "id": "PROJ-001",
      "title": "Task Management Application",
      "description": "Complete task management system",
      "estimatedHours": 120,
      "subprojects": [
        {
          "id": "SUB-001",
          "title": "Authentication System",
          "description": "User registration, login, JWT auth",
          "estimatedHours": 20,
          "milestones": [
            {
              "id": "MILE-001",
              "title": "User Registration",
              "description": "Registration form and API",
              "estimatedHours": 8,
              "tasks": [
                {
                  "id": "TASK-001",
                  "title": "Create registration form component",
                  "description": "React form with email, password, confirm password fields",
                  "phase": "implementation",
                  "estimatedHours": 2,
                  "files": [
                    "Agent/src/components/RegisterForm.jsx",
                    "Agent/tests/components/RegisterForm.test.jsx",
                    "test-site/src/components/RegisterForm.jsx"
                  ],
                  "completionCriteria": [
                    "Form validates email format",
                    "Passwords must match",
                    "Shows error messages",
                    "Tests cover all validation"
                  ]
                },
                {
                  "id": "TASK-002",
                  "title": "Implement registration API endpoint",
                  "description": "POST /api/register endpoint with validation",
                  "phase": "implementation",
                  "estimatedHours": 3,
                  "dependencies": ["TASK-001"],
                  "files": [
                    "Agent/src/api/auth.js",
                    "Agent/tests/api/auth.test.js"
                  ],
                  "completionCriteria": [
                    "Validates email uniqueness",
                    "Hashes password with bcrypt",
                    "Returns JWT token",
                    "Integration tests pass"
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  }
}
```

**Option B: Human creates the plan manually**

Edit PROJECT-PLAN.json following the schema in `.claude/PLAN-SCHEMA.json`.

### Step 3: Review and Refine

**Review checklist:**
- [ ] All requirements covered
- [ ] Tasks are specific and actionable
- [ ] Time estimates realistic
- [ ] Dependencies correct
- [ ] Files to modify listed
- [ ] Completion criteria clear

**Common issues:**

```json
// ❌ BAD: Task too vague
{
  "id": "TASK-001",
  "title": "Build authentication",
  "estimatedHours": 10
}

// ✅ GOOD: Task specific
{
  "id": "TASK-001",
  "title": "Create registration form component",
  "description": "React form with email, password, confirm password fields and validation",
  "estimatedHours": 2,
  "files": ["Agent/src/components/RegisterForm.jsx"],
  "completionCriteria": [
    "Form validates email format",
    "Passwords must match",
    "Shows error messages"
  ]
}
```

---

## Locking Plans

### Why Lock Plans?

**Locked plans are immutable** to:
- ✅ Prevent accidental changes
- ✅ Maintain audit trail
- ✅ Ensure consistency
- ✅ Track progress accurately

**Changes require formal amendment** (tracked in audit log).

### Lock Process

**Step 1: Set active plan**

```bash
echo "plan-001-generated" > .claude/ACTIVE-PLAN
```

**Step 2: Run plan:init**

```bash
npm run plan:init
```

**System performs:**

1. **Validates plan against schema**
   ```
   ✅ Plan follows PLAN-SCHEMA.json
   ✅ All required fields present
   ✅ Task IDs unique
   ✅ Dependencies valid
   ```

2. **Creates TASK-TRACKER.json**
   ```json
   {
     "planId": "plan-001-generated",
     "lockedAt": "2025-12-24T19:15:00Z",
     "tasks": {
       "TASK-001": {
         "status": "pending",
         "startedAt": null,
         "completedAt": null,
         "timeSpent": 0
       }
     }
   }
   ```

3. **Creates individual task files**
   ```
   .claude/plans/plan-001-generated/tasks/
     ├── TASK-001.json
     ├── TASK-002.json
     └── ...
   ```

4. **Creates .plan-locked marker**
   ```
   .claude/plans/plan-001-generated/.plan-locked
   ```

**Output:**
```
🔒 Locking plan: plan-001-generated

✅ Plan validated
✅ TASK-TRACKER.json created (120 tasks)
✅ Individual task files created
✅ Plan locked (amendments require plan:amend)

📊 Plan Summary:
   Total tasks: 120
   Estimated hours: 240
   Phases: design (20), implementation (80), testing (20)

🎯 Ready to start!
   Run: npm run task:start TASK-001
```

### What Locking Prevents

**After locking, you CANNOT:**
- ❌ Edit PROJECT-PLAN.json directly
- ❌ Delete tasks
- ❌ Change task IDs
- ❌ Modify dependencies without audit

**You CAN (via plan:amend):**
- ✅ Add new tasks
- ✅ Update estimates
- ✅ Change descriptions
- ✅ Adjust dependencies
- ✅ Add completion criteria

---

## Working with Plans

### Check Plan Status

```bash
npm run task:status
```

**Output:**
```
📊 Project: Task Management Application
📋 Plan: plan-001-generated
🔒 Status: Locked
📅 Started: 2025-12-24

Progress:
  ✅ Completed: 15 tasks (12.5%)
  🔄 In progress: 1 task (TASK-016)
  ⏸️  Pending: 104 tasks (86.7%)

Time:
  Estimated: 240 hours
  Spent: 28.5 hours
  Remaining: 211.5 hours
  On track: Yes (95% of estimate)

Current Task:
  TASK-016: Create task list component
  Phase: implementation
  Estimate: 3 hours
  Started: 2 hours ago

Next Available:
  TASK-017: Implement task filtering
  TASK-018: Add task search
```

### View Plan Details

```bash
# View full plan
cat .claude/plans/plan-001-generated/PROJECT-PLAN.json

# View specific task
cat .claude/plans/plan-001-generated/tasks/TASK-016.json

# View tracker
cat .claude/plans/plan-001-generated/TASK-TRACKER.json
```

### List All Plans

```bash
npm run plan:manager
```

**Output:**
```
📚 Available Plans:

1. plan-001-generated [ACTIVE] [LOCKED]
   Task Management Application
   Progress: 15/120 tasks (12.5%)
   Created: 2025-12-24

2. plan-002-redesign [LOCKED]
   UI Redesign Project
   Progress: 45/50 tasks (90%)
   Created: 2025-12-20

? Select plan: (Use arrow keys)
  › 1. Set as active
    2. View details
    3. Archive
    4. Cancel
```

### Switch Plans

```bash
# Set different plan as active
echo "plan-002-redesign" > .claude/ACTIVE-PLAN

# Verify
npm run task:status
```

---

## Amending Plans

### When to Amend

Amend plans when:
- Requirements change
- New features requested
- Tasks need splitting
- Estimates need adjustment
- Dependencies change

### Amendment Process

**Step 1: Initiate amendment**

```bash
npm run plan:amend
```

**Interactive prompts:**

```
🔧 Plan Amendment Tool
Plan: plan-001-generated

? What would you like to amend?
  › Add new task
    Modify existing task
    Remove task (deprecate)
    Change dependencies
    Update time estimates
    Add completion criteria

? Select task to modify:
  › TASK-016: Create task list component

? What to change?
  › Estimated hours
    Description
    Completion criteria
    Dependencies
    Files to modify

? New estimated hours: (current: 3)
  › 5

? Reason for amendment:
  › Task more complex than initially thought - need to add pagination and infinite scroll

✅ Amendment recorded

Audit Log Entry:
  Timestamp: 2025-12-24T20:30:00Z
  Task: TASK-016
  Field: estimatedHours
  Old value: 3
  New value: 5
  Reason: Task more complex than initially thought - need to add pagination and infinite scroll
  Amended by: human

? Update TASK-TRACKER.json?
  › Yes

✅ Plan amended
✅ Audit trail updated
✅ TASK-TRACKER.json updated
```

**Step 2: Review amendment**

```bash
cat .claude/plans/plan-001-generated/AMENDMENTS.json
```

**Output:**
```json
{
  "amendments": [
    {
      "timestamp": "2025-12-24T20:30:00Z",
      "task": "TASK-016",
      "field": "estimatedHours",
      "oldValue": 3,
      "newValue": 5,
      "reason": "Task more complex than initially thought - need to add pagination and infinite scroll",
      "amendedBy": "human"
    }
  ]
}
```

### Adding New Tasks

```bash
npm run plan:amend
```

```
? What would you like to amend?
  › Add new task

? Insert after which task?
  › TASK-016

New task details:
? Task ID: TASK-016A
? Title: Add pagination controls
? Description: Add prev/next buttons and page indicator to task list
? Phase: implementation
? Estimated hours: 2
? Dependencies: TASK-016
? Files to create:
  - Agent/src/components/Pagination.jsx
  - Agent/tests/components/Pagination.test.jsx

? Reason for adding task:
  › Pagination was overlooked in original plan

✅ TASK-016A created
✅ Inserted after TASK-016
✅ Amendment logged
```

### Removing Tasks

**Tasks are never deleted, only deprecated:**

```bash
npm run plan:amend
```

```
? What would you like to amend?
  › Remove task (deprecate)

? Which task to deprecate?
  › TASK-050

? Reason:
  › Feature cancelled by stakeholder

✅ TASK-050 marked as deprecated
✅ Will not appear in task:status
✅ Preserved in audit trail
```

---

## Plan Schemas

### Required Fields

**Every plan must have:**

```json
{
  "metadata": {
    "planId": "string (required)",
    "title": "string (required)",
    "description": "string (required)",
    "created": "ISO 8601 datetime (required)",
    "version": "semantic version (required)",
    "estimatedHours": "number (required)",
    "priority": "low|medium|high|critical (required)"
  },
  "structure": "flat|hierarchical (required)",
  "tasks": [] // or "hierarchy": {}
}
```

### Task Schema

**Every task must have:**

```json
{
  "id": "TASK-001 (required, unique)",
  "title": "Brief description (required)",
  "description": "Detailed explanation (required)",
  "phase": "design|implementation|testing|deployment (required)",
  "estimatedHours": "number (required)",
  "status": "pending|in_progress|completed (auto-managed)",
  "dependencies": ["TASK-XXX"] // optional
  "files": ["path/to/file.js"], // recommended
  "completionCriteria": ["criterion1", "criterion2"] // recommended
}
```

### Validation Rules

**System validates:**

1. **Unique IDs**
   ```
   ❌ Error: Duplicate task ID: TASK-001
   ```

2. **Valid dependencies**
   ```
   ❌ Error: TASK-015 depends on non-existent TASK-999
   ```

3. **No circular dependencies**
   ```
   ❌ Error: Circular dependency: TASK-001 → TASK-002 → TASK-001
   ```

4. **Required fields present**
   ```
   ❌ Error: Task TASK-005 missing required field: estimatedHours
   ```

5. **Valid phase values**
   ```
   ❌ Error: Invalid phase 'coding' (must be: design, implementation, testing, deployment)
   ```

---

## Best Practices

### Planning Tips

**1. Break down large tasks**
```
❌ BAD: "Build authentication system" (20 hours)

✅ GOOD:
  - TASK-001: Create login form (2 hours)
  - TASK-002: Create registration form (2 hours)
  - TASK-003: Implement JWT auth API (4 hours)
  - TASK-004: Add password reset flow (3 hours)
  - TASK-005: Write auth integration tests (3 hours)
```

**2. Use descriptive titles**
```
❌ BAD: "Fix bug"
❌ BAD: "Update component"

✅ GOOD: "Fix email validation in registration form"
✅ GOOD: "Update TaskCard component to show due dates"
```

**3. Define clear completion criteria**
```
❌ BAD: "Component works"

✅ GOOD:
  - Component renders with all props
  - User interactions trigger correct callbacks
  - Edge cases handled (null props, empty arrays)
  - Tests cover 90%+ of component code
```

**4. Estimate realistically**
```
❌ BAD: Round numbers (5 hours, 10 hours)

✅ GOOD: Detailed estimates
  - Design: 0.5 hours
  - Implementation: 2.5 hours
  - Testing: 1 hour
  - Documentation: 0.5 hours
  - Total: 4.5 hours
```

**5. Track dependencies**
```
✅ GOOD:
  TASK-010: Create database schema
  TASK-011: Implement data layer (depends on TASK-010)
  TASK-012: Build API endpoints (depends on TASK-011)
  TASK-013: Create UI components (depends on TASK-012)
```

### Maintenance Tips

**1. Review progress weekly**
```bash
npm run task:status
# Are estimates accurate?
# Are we on schedule?
# Any blockers?
```

**2. Amend when needed**
```
Don't force-fit reality to plan
Update estimates if tasks take longer
Add tasks for discovered work
Document reasons in audit trail
```

**3. Celebrate milestones**
```
When milestone completes:
  1. Review what went well
  2. Document lessons learned
  3. Adjust future estimates
  4. Recognize team effort
```

**4. Keep plans focused**
```
❌ Don't plan 6 months ahead in detail
✅ Do plan 2-4 weeks in detail
✅ Do have high-level roadmap for longer term
```

### Anti-Patterns

**❌ Avoid:**

1. **Too granular**: Tasks < 1 hour
2. **Too vague**: "Work on feature"
3. **No estimates**: Can't track progress
4. **Ignored dependencies**: Blocking work starts early
5. **Never amending**: Plan becomes fiction
6. **Waterfall planning**: All design up front
7. **No completion criteria**: Unclear when done

---

## Example: Complete Plan Workflow

### Scenario: Todo App Project

**Day 1: Plan Creation**

```bash
# 1. Generate requirements
npm run plan:generate "Simple todo app with React"

# 2. Claude creates PROJECT-PLAN.json with 25 tasks

# 3. Human reviews and refines
vim .claude/plans/plan-001-generated/PROJECT-PLAN.json

# 4. Activate and lock
echo "plan-001-generated" > .claude/ACTIVE-PLAN
npm run plan:init
# ✅ Plan locked with 25 tasks
```

**Day 2-10: Execution**

```bash
# Start task
npm run task:start TASK-001

# Claude works on task
# ... writes code ...
# ... writes tests ...
# ... commits ...

# Complete task
npm run task:done TASK-001

# Check progress
npm run task:status
# Progress: 1/25 tasks (4%)

# Continue with next tasks
npm run task:start TASK-002
# ...
```

**Day 7: Requirements Change**

```bash
# Client wants dark mode feature
npm run plan:amend

# Add new tasks:
#   TASK-26: Create theme context
#   TASK-27: Add theme toggle button
#   TASK-28: Style components for dark mode

# Reason: Client requested dark mode support

# ✅ Amendment logged
# ✅ Plan updated to 28 tasks
```

**Day 10: Completion**

```bash
npm run task:status
# Progress: 28/28 tasks (100%)
# ✅ All tasks complete
# ✅ Ready for deployment
```

---

## Troubleshooting

### "Plan validation failed"

**Problem**: PROJECT-PLAN.json doesn't match schema

**Solution**:
```bash
# Check schema
cat .claude/PLAN-SCHEMA.json

# Validate manually
npm run plan:validate

# Common issues:
# - Missing required fields
# - Invalid task IDs
# - Circular dependencies
# - Wrong data types
```

### "No active plan found"

**Problem**: .claude/ACTIVE-PLAN is empty or missing

**Solution**:
```bash
# Set active plan
echo "plan-001-generated" > .claude/ACTIVE-PLAN

# Verify
cat .claude/ACTIVE-PLAN
```

### "Cannot modify locked plan"

**Problem**: Trying to edit PROJECT-PLAN.json directly

**Solution**:
```bash
# Use amendment tool
npm run plan:amend

# This creates audit trail and updates properly
```

---

## Summary

**Plans provide:**
- ✅ Structure and clarity
- ✅ Progress tracking
- ✅ Dependency management
- ✅ Time estimation
- ✅ Audit trail

**Best practices:**
- Break work into small tasks (2-4 hours each)
- Define clear completion criteria
- Track dependencies explicitly
- Estimate realistically
- Amend when requirements change
- Review progress regularly

**Remember:**
- Plans are living documents
- Amend when reality changes
- Use audit trail for accountability
- Lock provides safety, amendments provide flexibility

---

**Copyright 2024-2025 Agentic15**
Licensed under the Apache License, Version 2.0
