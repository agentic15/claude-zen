import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export class SyncCommand {
  static execute() {
    console.log('\n🔄 Syncing with remote main branch...\n');

    // Step 1: Get current branch
    const currentBranch = this.getCurrentBranch();
    console.log(`📍 Current branch: ${currentBranch}\n`);

    // Step 2: Check if on feature branch
    const isFeatureBranch = currentBranch.startsWith('feature/');

    if (!isFeatureBranch && currentBranch !== 'main') {
      console.log(`⚠️  You're on branch '${currentBranch}', not a feature branch`);
      console.log(`   This command syncs feature branches with main\n`);
      process.exit(1);
    }

    // Step 3: Check for uncommitted changes
    if (this.hasUncommittedChanges()) {
      console.log('❌ You have uncommitted changes');
      console.log('   Commit or stash them first\n');
      process.exit(1);
    }

    // Step 4: Check PR status (CRITICAL: prevents data loss)
    if (isFeatureBranch) {
      this.checkPRStatus(currentBranch);
    }

    // Step 5: Get main branch name
    const mainBranch = this.getMainBranch();
    console.log(`🎯 Main branch: ${mainBranch}\n`);

    // Step 6: Switch to main
    console.log(`📦 Switching to ${mainBranch}...\n`);
    this.switchToMain(mainBranch);

    // Step 7: Pull latest changes
    console.log('⬇️  Pulling latest changes...\n');
    this.pullMain(mainBranch);

    // Step 8: Delete feature branch if we were on one
    if (isFeatureBranch) {
      console.log(`🗑️  Cleaning up feature branch: ${currentBranch}...\n`);
      this.deleteFeatureBranch(currentBranch);
    }

    // Step 9: Display summary
    this.displaySummary(mainBranch, currentBranch, isFeatureBranch);
  }

  static getCurrentBranch() {
    try {
      return execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
    } catch (error) {
      console.log(`\n❌ Failed to get current branch: ${error.message}\n`);
      process.exit(1);
    }
  }

  static getMainBranch() {
    try {
      // Try to detect main branch from remote
      const remotes = execSync('git branch -r', { encoding: 'utf-8' });

      if (remotes.includes('origin/main')) {
        return 'main';
      } else if (remotes.includes('origin/master')) {
        return 'master';
      }

      // Default to main
      return 'main';
    } catch (error) {
      return 'main';
    }
  }

  static hasUncommittedChanges() {
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf-8' });
      return status.trim().length > 0;
    } catch (error) {
      return false;
    }
  }

  static switchToMain(mainBranch) {
    try {
      execSync(`git checkout ${mainBranch}`, { stdio: 'inherit' });
    } catch (error) {
      console.log(`\n❌ Failed to switch to ${mainBranch}: ${error.message}\n`);
      process.exit(1);
    }
  }

  static pullMain(mainBranch) {
    try {
      execSync(`git pull origin ${mainBranch}`, { stdio: 'inherit' });
    } catch (error) {
      console.log(`\n❌ Failed to pull from ${mainBranch}: ${error.message}\n`);
      process.exit(1);
    }
  }

  static deleteFeatureBranch(branchName) {
    try {
      // Delete local branch
      execSync(`git branch -d ${branchName}`, { stdio: 'inherit' });
      console.log(`   ✓ Deleted local branch: ${branchName}`);
    } catch (error) {
      // Branch might have unmerged commits, try force delete
      try {
        console.log(`   ⚠️  Branch has unmerged commits, force deleting...`);
        execSync(`git branch -D ${branchName}`, { stdio: 'inherit' });
        console.log(`   ✓ Force deleted local branch: ${branchName}`);
      } catch (forceError) {
        console.log(`   ⚠️  Could not delete branch: ${forceError.message}`);
      }
    }
  }

  static checkPRStatus(branchName) {
    try {
      // Check if PR exists for this branch
      const prInfo = execSync(`gh pr view ${branchName} --json state,mergedAt`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      });

      const pr = JSON.parse(prInfo);

      // If PR exists but not merged, block sync
      if (pr.state === 'OPEN' || (pr.state === 'CLOSED' && !pr.mergedAt)) {
        console.log(`\n❌ Cannot sync: PR for ${branchName} is not merged\n`);
        console.log(`   PR must be merged before running sync\n`);
        console.log(`   Options:`);
        console.log(`   1. Merge the PR on GitHub`);
        console.log(`   2. Close PR and abandon changes\n`);
        console.log(`   Aborting sync to prevent data loss.\n`);
        process.exit(1);
      }

      // PR is merged, safe to proceed
      console.log(`✅ PR merged - safe to sync\n`);

    } catch (error) {
      // No PR found - check if branch has commits
      try {
        const commits = execSync(`git log origin/main..${branchName} --oneline`, {
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe']
        });

        if (commits.trim().length > 0) {
          console.log(`\n❌ Cannot sync: No PR found but ${branchName} has unpushed commits\n`);
          console.log(`   You have committed changes that were never pushed to a PR.\n`);
          console.log(`   Options:`);
          console.log(`   1. Create PR first: npx agentic15 commit`);
          console.log(`   2. Push manually: git push -u origin ${branchName}\n`);
          console.log(`   Aborting sync to prevent data loss.\n`);
          process.exit(1);
        }
      } catch (e) {
        // Error checking commits, be safe and block
        console.log(`\n⚠️  Could not verify PR status for ${branchName}`);
        console.log(`   Aborting sync for safety\n`);
        process.exit(1);
      }
    }
  }

  static displaySummary(mainBranch, previousBranch, wasFeatureBranch) {
    console.log('\n' + '='.repeat(60));
    console.log('✅ Sync complete!');
    console.log('='.repeat(60));
    console.log(`\n📍 Current branch: ${mainBranch}`);
    console.log(`📥 Latest changes pulled from origin/${mainBranch}`);

    if (wasFeatureBranch) {
      console.log(`🗑️  Deleted feature branch: ${previousBranch}`);
    }

    console.log('\n💡 Next steps:');
    console.log('   1. Start a new task: npx agentic15 task start TASK-XXX');
    console.log('   2. Check status: npx agentic15 status\n');
  }
}
