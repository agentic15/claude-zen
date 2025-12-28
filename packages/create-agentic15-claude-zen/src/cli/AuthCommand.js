import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class AuthCommand {
  static async setup() {
    console.log('\n🔐 GitHub Authentication Setup\n');

    // Step 1: Check if gh CLI is installed
    if (!this.isGhInstalled()) {
      console.log('❌ GitHub CLI (gh) is not installed\n');
      console.log('Please install GitHub CLI first:');
      console.log('  - macOS: brew install gh');
      console.log('  - Windows: winget install --id GitHub.cli');
      console.log('  - Linux: https://github.com/cli/cli/blob/trunk/docs/install_linux.md\n');
      console.log('Or visit: https://cli.github.com/\n');
      process.exit(1);
    }

    // Step 2: Check if already authenticated with gh
    if (!this.isGhAuthenticated()) {
      console.log('📝 You need to authenticate with GitHub CLI\n');
      console.log('Running: gh auth login\n');

      try {
        execSync('gh auth login', { stdio: 'inherit' });
      } catch (error) {
        console.log('\n❌ GitHub authentication failed\n');
        process.exit(1);
      }
    } else {
      console.log('✓ Already authenticated with GitHub CLI\n');
    }

    // Step 3: Display current git configuration
    this.displayGitConfig();

    // Step 4: Confirm configuration
    const configOk = await this.confirmConfig();
    if (!configOk) {
      this.showConfigCommands();
      console.log('\n❌ Setup cancelled. Please configure git first.\n');
      process.exit(1);
    }

    // Step 5: Auto-detect owner/repo
    const { owner, repo } = this.detectRepo();

    // Step 6: Save configuration (no token needed, gh CLI handles auth)
    this.saveConfig(owner, repo);

    console.log('\n✅ GitHub authentication configured successfully!\n');
    console.log(`   Owner: ${owner}`);
    console.log(`   Repo: ${repo}`);
    console.log(`   Auth: Using gh CLI credentials`);
    console.log(`   Config: .claude/settings.local.json\n`);
  }

  static isGhInstalled() {
    try {
      execSync('gh --version', { stdio: 'pipe' });
      return true;
    } catch (error) {
      return false;
    }
  }

  static isGhAuthenticated() {
    try {
      execSync('gh auth status', { stdio: 'pipe' });
      return true;
    } catch (error) {
      return false;
    }
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

  static saveConfig(owner, repo) {
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

    // Update GitHub config (no token needed, gh CLI handles auth)
    settings.github = {
      enabled: true,
      autoCreate: true,
      autoUpdate: true,
      autoClose: true,
      owner,
      repo,
      comment: "Authentication handled by gh CLI (no token needed)"
    };

    // Write settings
    writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  }
}
