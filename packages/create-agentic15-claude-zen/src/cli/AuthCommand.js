import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import { Octokit } from '@octokit/rest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class AuthCommand {
  static async setup() {
    console.log('\n🔐 GitHub Authentication Setup\n');

    // Step 1: Display current git configuration
    this.displayGitConfig();

    // Step 2: Confirm configuration
    const configOk = await this.confirmConfig();
    if (!configOk) {
      this.showConfigCommands();
      console.log('\n❌ Setup cancelled. Please configure git first.\n');
      process.exit(1);
    }

    // Step 3: Get GitHub token
    const token = await this.promptToken();

    // Step 4: Validate token
    const isValid = await this.validateToken(token);
    if (!isValid) {
      console.log('\n❌ Invalid GitHub token. Please try again.\n');
      process.exit(1);
    }

    // Step 5: Auto-detect owner/repo
    const { owner, repo } = this.detectRepo();

    // Step 6: Save configuration
    this.saveConfig(token, owner, repo);

    console.log('\n✅ GitHub authentication configured successfully!\n');
    console.log(`   Owner: ${owner}`);
    console.log(`   Repo: ${repo}`);
    console.log(`   Config: .claude/settings.local.json\n`);
  }

  static displayGitConfig() {
    console.log('📋 Current Git Configuration:\n');

    try {
      // Global config
      const globalName = execSync('git config --global user.name', { encoding: 'utf-8' }).trim();
      const globalEmail = execSync('git config --global user.email', { encoding: 'utf-8' }).trim();

      console.log('   Global:');
      console.log(`   - user.name:  ${globalName || '(not set)'}`);
      console.log(`   - user.email: ${globalEmail || '(not set)'}`);

      // Local config (project-specific)
      try {
        const localName = execSync('git config --local user.name', { encoding: 'utf-8' }).trim();
        const localEmail = execSync('git config --local user.email', { encoding: 'utf-8' }).trim();

        if (localName || localEmail) {
          console.log('\n   Local (this project):');
          console.log(`   - user.name:  ${localName || '(not set)'}`);
          console.log(`   - user.email: ${localEmail || '(not set)'}`);
        }
      } catch (e) {
        // No local config, that's ok
      }

      console.log('');
    } catch (error) {
      console.log('   ⚠️  Unable to read git config. Is git installed?\n');
    }
  }

  static showConfigCommands() {
    console.log('\n💡 To configure git, use these commands:\n');
    console.log('   Global (all projects):');
    console.log('   git config --global user.name "Your Name"');
    console.log('   git config --global user.email "your@email.com"\n');
    console.log('   Local (this project only):');
    console.log('   git config --local user.name "Your Name"');
    console.log('   git config --local user.email "your@email.com"\n');
  }

  static async confirmConfig() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('Is this configuration correct? (y/n): ', (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
  }

  static async promptToken() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('🔑 GitHub Personal Access Token:');
    console.log('   Create one at: https://github.com/settings/tokens');
    console.log('   Required scopes: repo (Full control of private repositories)\n');

    return new Promise((resolve) => {
      rl.question('Enter your GitHub token: ', (token) => {
        rl.close();
        resolve(token.trim());
      });
    });
  }

  static async validateToken(token) {
    try {
      const octokit = new Octokit({ auth: token });
      await octokit.rest.users.getAuthenticated();
      console.log('\n✓ Token validated successfully');
      return true;
    } catch (error) {
      return false;
    }
  }

  static detectRepo() {
    try {
      // Get remote URL
      const remoteUrl = execSync('git config --get remote.origin.url', { encoding: 'utf-8' }).trim();

      // Parse owner/repo from URL
      // Handles: git@github.com:owner/repo.git or https://github.com/owner/repo.git
      const match = remoteUrl.match(/github\.com[:/]([^/]+)\/(.+?)(\.git)?$/);

      if (match) {
        return {
          owner: match[1],
          repo: match[2]
        };
      }
    } catch (error) {
      // Fallback if no remote
    }

    // Fallback: prompt user
    console.log('\n⚠️  Could not auto-detect repository from git remote.');
    console.log('   Using placeholder values. Update .claude/settings.local.json manually.\n');

    return {
      owner: 'your-github-username',
      repo: 'your-repo-name'
    };
  }

  static saveConfig(token, owner, repo) {
    const settingsPath = join(process.cwd(), '.claude', 'settings.local.json');
    const settingsDir = dirname(settingsPath);

    // Ensure directory exists
    if (!existsSync(settingsDir)) {
      mkdirSync(settingsDir, { recursive: true });
    }

    // Read existing settings or create new
    let settings = {};
    if (existsSync(settingsPath)) {
      try {
        settings = JSON.parse(readFileSync(settingsPath, 'utf-8'));
      } catch (e) {
        // Invalid JSON, start fresh
      }
    }

    // Update GitHub config
    settings.github = {
      enabled: true,
      autoCreate: true,
      autoUpdate: true,
      autoClose: true,
      token,
      owner,
      repo
    };

    // Write settings
    writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  }
}
