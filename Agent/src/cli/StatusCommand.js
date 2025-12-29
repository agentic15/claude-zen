import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

export class StatusCommand {
  static show() {
    console.log('\n📊 Project Status\n');

    // Load tracker
    const tracker = this.loadTracker();

    if (!tracker) {
      console.log('❌ No active plan found\n');
      process.exit(1);
    }

    // Calculate statistics
    const completed = tracker.taskFiles.filter(t => t.status === 'completed');
    const inProgress = tracker.taskFiles.filter(t => t.status === 'in_progress');
    const pending = tracker.taskFiles.filter(t => t.status === 'pending');
    const blocked = tracker.taskFiles.filter(t => t.status === 'blocked');
    const total = tracker.taskFiles.length;

    // Display plan info
    console.log(`   Plan: ${tracker.planId}`);
    console.log(`   Total Tasks: ${total}\n`);

    // Progress bar
    const completedPercent = Math.round((completed.length / total) * 100);
    const barLength = 30;
    const filledLength = Math.round((completedPercent / 100) * barLength);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);

    console.log(`   Progress: [${bar}] ${completedPercent}%\n`);

    // Status breakdown
    console.log('   Status Breakdown:');
    console.log(`   ✅ Completed:   ${completed.length}`);
    console.log(`   🔄 In Progress: ${inProgress.length}`);
    console.log(`   ⏳ Pending:     ${pending.length}`);

    if (blocked.length > 0) {
      console.log(`   🚫 Blocked:     ${blocked.length}`);
    }

    console.log('');

    // Current task
    if (inProgress.length > 0) {
      const current = inProgress[0];
      console.log('   🔄 Current Task:');
      console.log(`      ${current.id}: ${current.title}`);

      // Show changed files
      try {
        const diff = execSync('git diff --name-only', { encoding: 'utf-8' });
        const staged = execSync('git diff --cached --name-only', { encoding: 'utf-8' });

        const allChanges = new Set([
          ...diff.trim().split('\n').filter(Boolean),
          ...staged.trim().split('\n').filter(Boolean)
        ]);

        if (allChanges.size > 0) {
          console.log(`\n      📝 Modified files (${allChanges.size}):`);
          Array.from(allChanges).slice(0, 10).forEach(file => {
            console.log(`         - ${file}`);
          });

          if (allChanges.size > 10) {
            console.log(`         ... and ${allChanges.size - 10} more`);
          }
        }
      } catch (e) {
        // Ignore git errors
      }

      console.log('');
      console.log('      💡 Next step: agentic15 commit');
    } else if (pending.length > 0) {
      console.log('   📌 Next Task:');
      const next = pending[0];
      console.log(`      ${next.id}: ${next.title}`);
      console.log('');
      console.log('      💡 Next step: agentic15 task next');
    } else if (blocked.length > 0) {
      console.log('   🚫 Blocked Tasks:');
      blocked.slice(0, 3).forEach(task => {
        console.log(`      ${task.id}: ${task.title}`);
      });

      if (blocked.length > 3) {
        console.log(`      ... and ${blocked.length - 3} more`);
      }
    } else {
      console.log('   🎉 All tasks completed!');
    }

    console.log('');

    // Recent activity
    const recentCompleted = completed
      .filter(t => t.completedAt)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 3);

    if (recentCompleted.length > 0) {
      console.log('   📜 Recently Completed:');
      recentCompleted.forEach(task => {
        const date = new Date(task.completedAt);
        const timeAgo = this.getTimeAgo(date);
        console.log(`      ✓ ${task.id}: ${task.title} (${timeAgo})`);
      });
      console.log('');
    }
  }

  static loadTracker() {
    const activePlanPath = join(process.cwd(), '.claude', 'ACTIVE-PLAN');

    if (!existsSync(activePlanPath)) {
      return null;
    }

    const planId = readFileSync(activePlanPath, 'utf-8').trim();
    const trackerPath = join(process.cwd(), '.claude', 'plans', planId, 'TASK-TRACKER.json');

    if (!existsSync(trackerPath)) {
      return null;
    }

    return JSON.parse(readFileSync(trackerPath, 'utf-8'));
  }

  static getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
      }
    }

    return 'just now';
  }
}
