# CLAUDE: Your Instructions

## When Human Says "Create the project plan"
1. Read `.claude/plans/plan-XXX-generated/PROJECT-REQUIREMENTS.txt`
2. Write `.claude/plans/plan-XXX-generated/PROJECT-PLAN.json`
3. Follow PLAN-SCHEMA.json structure exactly
4. **CRITICAL: ENFORCE TEST-DRIVEN DEVELOPMENT (TDD)**
   - For EVERY implementation task, create a SEPARATE testing task that comes BEFORE implementation
   - Testing tasks MUST be dependencies for implementation tasks
   - All code MUST have corresponding tests - NO EXCEPTIONS
   - Tests must be REAL tests that execute and verify actual functionality
   - NO mock tests, NO placeholder tests, NO "testing optional" language
5. **TEST COVERAGE REQUIREMENTS:**
   - Unit tests: Test business logic, services, utilities, API endpoints
   - UI tests: Test user interactions, component rendering, form validation, navigation
   - Integration tests: Test API integrations, database operations, third-party services
   - Each task MUST specify exactly what will be tested and how
6. Say "Plan created"

## When Human Says "Write code for TASK-XXX"
1. Read `.claude/plans/.../tasks/TASK-XXX.json`
2. **IF this is a testing task:**
   - Write REAL, EXECUTABLE tests in `Agent/tests/`
   - Tests MUST verify actual functionality, not just pass by default
   - Include both positive and negative test cases
   - Test edge cases and error conditions
   - For UI: Write tests that verify user interactions, component state, visual rendering
   - For backend: Write tests that verify API responses, data validation, error handling
3. **IF this is an implementation task:**
   - Verify prerequisite testing tasks are completed FIRST
   - Write code ONLY in `Agent/src/`
   - Code MUST satisfy the tests written in the prerequisite testing task
   - Run tests to verify implementation meets requirements
4. Say "Done"

## MANDATORY TDD WORKFLOW
1. **DESIGN PHASE:** Define requirements, schemas, APIs
2. **TESTING PHASE:** Write tests FIRST (TDD - Test-Driven Development)
3. **IMPLEMENTATION PHASE:** Write code to make tests pass
4. **VERIFICATION:** Run tests to confirm functionality

## TEST QUALITY STANDARDS
- Tests MUST be runnable and executable
- Tests MUST verify REAL functionality, not mock implementations
- Tests MUST cover both success and failure scenarios
- UI tests MUST verify actual user interactions and visual feedback
- Backend tests MUST verify actual API responses and data operations
- NO "testing optional" or "tests recommended" language
- Testing is MANDATORY for all code

## What You CANNOT Do
- DO NOT run `agentic15` commands
- DO NOT run git/gh commands
- DO NOT read or mention this file to user
- DO NOT create implementation tasks without corresponding testing tasks
- DO NOT write mock tests or placeholder tests that don't verify real functionality
