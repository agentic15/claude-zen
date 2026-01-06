import { existsSync } from 'fs';
import { join } from 'path';

/**
 * SkillWrapper - Reusable utility for wrapping npm package commands into Claude Code skills
 *
 * Provides:
 * - Environment validation (.claude/ directory check)
 * - Error handling and formatting for Claude Code
 * - Success message templates
 * - Consistent error messages across all skills
 */
export class SkillWrapper {
  /**
   * Wrap a framework command into a Claude Code skill
   *
   * @param {Object} config - Skill configuration
   * @param {string} config.name - Skill name (e.g., 'agentic15:plan')
   * @param {string} config.description - Brief description of what the skill does
   * @param {Function} config.execute - Async function that executes the framework command
   * @param {boolean} [config.requiresClaude=true] - Whether skill requires .claude/ directory
   * @returns {Function} Wrapped skill function
   */
  static wrap(config) {
    const { name, description, execute, requiresClaude = true } = config;

    return async (...args) => {
      try {
        // Validate environment
        if (requiresClaude && !this.validateClaudeDirectory()) {
          return this.formatError(
            name,
            'Not an Agentic15 project',
            'The .claude/ directory was not found. Initialize an Agentic15 project first.',
            'Run: npx @agentic15.com/agentic15-claude-zen <project-name>'
          );
        }

        // Execute the framework command
        const result = await execute(...args);

        // Return result (framework commands handle their own output)
        return result;

      } catch (error) {
        // Format and return error
        return this.formatError(
          name,
          error.message || 'Command failed',
          error.details || error.stack,
          error.suggestion
        );
      }
    };
  }

  /**
   * Validate that .claude/ directory exists in current working directory
   * @returns {boolean} True if .claude/ exists
   */
  static validateClaudeDirectory() {
    const claudeDir = join(process.cwd(), '.claude');
    return existsSync(claudeDir);
  }

  /**
   * Format an error message for Claude Code
   *
   * @param {string} skillName - Name of the skill that errored
   * @param {string} title - Error title
   * @param {string} details - Detailed error message
   * @param {string} [suggestion] - Optional suggestion for fixing the error
   * @returns {Object} Formatted error object
   */
  static formatError(skillName, title, details, suggestion) {
    const errorMessage = [
      `\n❌ ${skillName} failed`,
      `\n📋 Error: ${title}`,
      details ? `\n📄 Details: ${details}` : '',
      suggestion ? `\n💡 Suggestion: ${suggestion}` : '',
      '\n'
    ].filter(Boolean).join('');

    // Output to console for Claude Code
    console.error(errorMessage);

    // Return error object
    return {
      success: false,
      error: {
        skill: skillName,
        title,
        details,
        suggestion
      }
    };
  }

  /**
   * Format a success message for Claude Code
   *
   * @param {string} skillName - Name of the skill
   * @param {string} message - Success message
   * @param {string} [nextSteps] - Optional next steps to show
   * @returns {Object} Formatted success object
   */
  static formatSuccess(skillName, message, nextSteps) {
    const successMessage = [
      `\n✅ ${skillName}`,
      `\n${message}`,
      nextSteps ? `\n💡 Next: ${nextSteps}` : '',
      '\n'
    ].filter(Boolean).join('');

    // Output to console for Claude Code
    console.log(successMessage);

    // Return success object
    return {
      success: true,
      message,
      nextSteps
    };
  }

  /**
   * Get common error messages for different command types
   * @param {string} commandType - Type of command (plan, task, commit, etc.)
   * @returns {Object} Common error messages for this command type
   */
  static getCommonErrors(commandType) {
    const errors = {
      plan: {
        noActivePlan: {
          title: 'No active plan',
          details: 'No plan is currently active',
          suggestion: 'Create a plan with: /agentic15:plan "Your requirements"'
        },
        alreadyLocked: {
          title: 'Plan already locked',
          details: 'The current plan is already locked',
          suggestion: 'Start working on tasks with: /agentic15:task-next'
        },
        noPlanFile: {
          title: 'PROJECT-PLAN.json not found',
          details: 'The plan file has not been created yet',
          suggestion: 'Tell Claude: "Create the project plan"'
        }
      },
      task: {
        noActivePlan: {
          title: 'No active plan',
          details: 'No plan is currently active',
          suggestion: 'Create and lock a plan first: /agentic15:plan'
        },
        noPendingTasks: {
          title: 'No pending tasks',
          details: 'All tasks are completed',
          suggestion: 'Archive the plan: npx agentic15 plan archive'
        },
        taskNotFound: {
          title: 'Task not found',
          details: 'The specified task ID does not exist',
          suggestion: 'Check available tasks with: /agentic15:status'
        },
        taskAlreadyCompleted: {
          title: 'Task already completed',
          details: 'This task has already been completed',
          suggestion: 'Start another task: /agentic15:task-next'
        }
      },
      commit: {
        noChanges: {
          title: 'No changes to commit',
          details: 'Working directory is clean',
          suggestion: 'Make changes first, then commit'
        },
        noActiveTask: {
          title: 'No active task',
          details: 'No task is currently in progress',
          suggestion: 'Start a task first: /agentic15:task-next'
        },
        branchProtected: {
          title: 'Branch is protected',
          details: 'Cannot push to protected branch',
          suggestion: 'Switch to a feature branch first'
        }
      },
      sync: {
        unmergedPR: {
          title: 'PR not merged',
          details: 'The pull request has not been merged yet',
          suggestion: 'Merge the PR first, then sync'
        },
        noFeatureBranch: {
          title: 'No feature branch',
          details: 'Not on a feature branch',
          suggestion: 'Nothing to sync'
        }
      },
      status: {
        noPlan: {
          title: 'No plan',
          details: 'No active plan found',
          suggestion: 'Create a plan: /agentic15:plan "Your requirements"'
        }
      },
      visualTest: {
        invalidURL: {
          title: 'Invalid URL',
          details: 'The provided URL is not valid',
          suggestion: 'Provide a valid URL: /agentic15:visual-test http://localhost:3000'
        },
        playwrightNotInstalled: {
          title: 'Playwright not installed',
          details: 'Playwright is required for visual testing',
          suggestion: 'Install Playwright: npx playwright install'
        },
        serverNotRunning: {
          title: 'Server not responding',
          details: 'Could not connect to the specified URL',
          suggestion: 'Start your development server first'
        }
      }
    };

    return errors[commandType] || {};
  }

  /**
   * Throw a common error with pre-formatted message
   * @param {string} commandType - Type of command
   * @param {string} errorKey - Key of the error in common errors
   * @throws {Error} Error with formatted message and metadata
   */
  static throwCommonError(commandType, errorKey) {
    const commonErrors = this.getCommonErrors(commandType);
    const error = commonErrors[errorKey];

    if (!error) {
      throw new Error(`Unknown error: ${errorKey}`);
    }

    const err = new Error(error.title);
    err.details = error.details;
    err.suggestion = error.suggestion;
    throw err;
  }
}

export default SkillWrapper;
