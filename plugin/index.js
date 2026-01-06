/**
 * Agentic15 Claude Code Plugin
 *
 * Provides native /agentic15:* slash commands for Claude Code
 * Integrates with the Agentic15 framework for AI-assisted development
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf-8'));

/**
 * Plugin metadata
 */
export const plugin = {
  name: packageJson.name,
  version: packageJson.version,
  description: packageJson.description,
  namespace: packageJson.claudePlugin.namespace,
  skills: packageJson.claudePlugin.skills,

  /**
   * Get the path to a skill implementation
   * @param {string} skillName - The skill name (e.g., 'plan', 'task-next')
   * @returns {string} Path to the skill file
   */
  getSkillPath(skillName) {
    return join(__dirname, 'skills', `${skillName}.js`);
  },

  /**
   * Get the path to a skill's markdown documentation
   * @param {string} skillName - The skill name
   * @returns {string} Path to the skill markdown file
   */
  getSkillMarkdownPath(skillName) {
    return join(__dirname, '.claude-plugin', 'skills', `${skillName}.md`);
  },

  /**
   * Get all available skills
   * @returns {Array<string>} List of skill names
   */
  getSkills() {
    return [...this.skills];
  }
};

/**
 * Skill imports for direct usage
 */
export { default as plan } from './skills/plan.js';
export { default as taskNext } from './skills/task-next.js';
export { default as taskStart } from './skills/task-start.js';
export { default as commit } from './skills/commit.js';
export { default as sync } from './skills/sync.js';
export { default as status } from './skills/status.js';
export { default as visualTest } from './skills/visual-test.js';

/**
 * Utility exports
 */
export { default as SkillWrapper } from './utils/skill-wrapper.js';

export default plugin;
