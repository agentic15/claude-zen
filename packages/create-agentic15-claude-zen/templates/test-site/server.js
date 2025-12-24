#!/usr/bin/env node

/**
 * Test site development server with port management
 *
 * Features:
 * - Uses PortManager for fixed port allocation (3000-3009 range)
 * - Auto-cleanup of stale processes on restart
 * - Port reuse for consistent URLs
 * - Graceful shutdown handling
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try to load PortManager from parent project
let PortManager;
try {
  // Check if running from installed package
  const parentPackagePath = join(__dirname, '../../node_modules/.gl-life-claude/utils/port-manager.js');
  if (existsSync(parentPackagePath)) {
    const module = await import(parentPackagePath);
    PortManager = module.PortManager;
  } else {
    // Fallback: Check workspace root
    const workspacePackagePath = join(__dirname, '../../../utils/port-manager.js');
    if (existsSync(workspacePackagePath)) {
      const module = await import(workspacePackagePath);
      PortManager = module.PortManager;
    }
  }
} catch (err) {
  console.warn('⚠️  Port manager not available, using default port 3000');
}

/**
 * Start Vite dev server with port management
 */
async function startServer() {
  let port = 3000;
  let portManager = null;

  if (PortManager) {
    try {
      portManager = new PortManager();

      // Allocate port for test-site
      const allocation = await portManager.allocate('test-site-dev', {
        service: 'vite',
        range: [3000, 3009],
        autoCleanup: true
      });

      port = allocation.port;
      console.log(`✓ Port ${port} allocated for test-site`);

    } catch (err) {
      console.warn(`⚠️  Port allocation failed: ${err.message}`);
      console.warn('   Using default port 3000');
      port = 3000;
    }
  }

  // Start Vite server
  console.log(`🚀 Starting Vite dev server on port ${port}...`);

  const vite = spawn('npx', ['vite', '--port', port.toString(), '--host'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname
  });

  // Graceful shutdown
  const cleanup = async () => {
    console.log('\n🛑 Shutting down server...');

    if (vite && !vite.killed) {
      vite.kill('SIGTERM');

      // Force kill after 5 seconds
      setTimeout(() => {
        if (!vite.killed) {
          vite.kill('SIGKILL');
        }
      }, 5000);
    }

    if (portManager) {
      try {
        await portManager.release('test-site-dev');
        console.log('✓ Port released');
      } catch (err) {
        // Ignore release errors on shutdown
      }
    }

    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  vite.on('error', (err) => {
    console.error('❌ Server error:', err.message);
    cleanup();
  });

  vite.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`❌ Server exited with code ${code}`);
    }
    cleanup();
  });
}

// Run server
startServer().catch(err => {
  console.error('❌ Failed to start server:', err.message);
  process.exit(1);
});
