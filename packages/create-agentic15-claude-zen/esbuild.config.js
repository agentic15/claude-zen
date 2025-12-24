/**
 * Copyright 2024-2025 agentic15.com
 */

import * as esbuild from 'esbuild';
import * as fs from 'fs';

/**
 * Bundle main entry point
 */
async function bundleMain() {
  console.log('📦 Bundling main entry point...');

  await esbuild.build({
    entryPoints: ['src/index.js'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'esm',
    outfile: 'dist/index.js',
    minify: true,
    sourcemap: true,
    treeShaking: true,
  });

  console.log('✅ Bundled src/index.js to dist/index.js');
}

/**
 * Main build process
 */
async function build() {
  try {
    const distDirs = ['dist'];
    for (const dir of distDirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    await bundleMain();

    console.log('✅ Build complete!');
    console.log('Note: Scripts and hooks are pre-bundled in dist/ directory');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();

export { bundleMain, build };
