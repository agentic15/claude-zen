import { cpSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * UpdateSettingsCommand - Update .claude/settings.json from framework
 *
 * Copies the latest framework settings.json to user's .claude directory
 */
export class UpdateSettingsCommand {
  static async execute() {
    console.log('\n🔄 Updating .claude/settings.json from framework\n');

    const targetPath = join(process.cwd(), '.claude', 'settings.json');
    const frameworkPath = join(__dirname, '..', '..', 'framework', 'settings.json');

    // Check if framework settings exists
    if (!existsSync(frameworkPath)) {
      console.log('❌ Framework settings.json not found');
      console.log('   Expected: node_modules/@agentic15.com/agentic15-claude-zen/framework/settings.json\n');
      process.exit(1);
    }

    // Check if target directory exists
    if (!existsSync(join(process.cwd(), '.claude'))) {
      console.log('❌ .claude directory not found');
      console.log('   Are you in the project root directory?\n');
      process.exit(1);
    }

    // Backup existing settings if it exists
    if (existsSync(targetPath)) {
      const backupPath = join(process.cwd(), '.claude', 'settings.json.backup');
      console.log('📦 Backing up current settings.json to settings.json.backup');
      cpSync(targetPath, backupPath);
    }

    // Copy framework settings
    console.log('📋 Copying latest framework settings.json');
    cpSync(frameworkPath, targetPath);

    console.log('\n✅ Settings updated successfully!');
    console.log('   Updated: .claude/settings.json');
    console.log('   Backup: .claude/settings.json.backup (if previous file existed)\n');
    console.log('💡 Note: Your .claude/settings.local.json overrides are preserved\n');
  }
}
