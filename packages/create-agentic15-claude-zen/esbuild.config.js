/**
 * Copyright 2024-2025 Agentic15
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as esbuild from 'esbuild';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import JavaScriptObfuscator from 'javascript-obfuscator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceRoot = path.resolve(__dirname, '..');

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
    minify: false,
    sourcemap: false,
    treeShaking: true,
  });

  console.log('✅ Bundled src/index.js to dist/index.js');
}

/**
 * Bundle workflow scripts into protected distributable
 */
async function bundleScripts() {
  console.log('📦 Bundling workflow scripts...');

  const scriptsDir = path.join(sourceRoot, 'scripts');
  const scripts = fs.readdirSync(scriptsDir).filter(f => f.endsWith('.js'));

  for (const script of scripts) {
    const scriptPath = path.join(scriptsDir, script);
    const outfile = path.join('dist', 'scripts', script);
    const tempFile = outfile + '.temp';

    await esbuild.build({
      entryPoints: [scriptPath],
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'esm',
      outfile: tempFile,
      minify: true,
      sourcemap: false,
      treeShaking: true,
      external: ['better-sqlite3'],
    });

    let code = fs.readFileSync(tempFile, 'utf8');
    code = code.replace(/^#!.*\n/, '');

    const obfuscated = JavaScriptObfuscator.obfuscate(code, {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.75,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.4,
      debugProtection: false,
      disableConsoleOutput: false,
      identifierNamesGenerator: 'hexadecimal',
      rotateStringArray: true,
      selfDefending: true,
      stringArray: true,
      stringArrayThreshold: 0.75,
      transformObjectKeys: true,
      unicodeEscapeSequence: false
    });

    fs.writeFileSync(outfile, '#!/usr/bin/env node\n' + obfuscated.getObfuscatedCode());
    fs.unlinkSync(tempFile);
  }

  console.log(`✅ Bundled and obfuscated ${scripts.length} scripts to dist/scripts/`);
}

/**
 * Bundle enforcement hooks into protected module
 */
async function bundleHooks() {
  console.log('📦 Bundling enforcement hooks...');

  const hooksDir = path.join(sourceRoot, '.claude/hooks');
  const hooks = fs.readdirSync(hooksDir).filter(f => f.endsWith('.js'));

  for (const hook of hooks) {
    const hookPath = path.join(hooksDir, hook);
    const outfile = path.join('dist', 'hooks', hook);
    const tempFile = outfile + '.temp';

    await esbuild.build({
      entryPoints: [hookPath],
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'esm',
      outfile: tempFile,
      minify: true,
      sourcemap: false,
      treeShaking: true,
    });

    let code = fs.readFileSync(tempFile, 'utf8');

    const obfuscated = JavaScriptObfuscator.obfuscate(code, {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.75,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.4,
      debugProtection: false,
      disableConsoleOutput: false,
      identifierNamesGenerator: 'hexadecimal',
      rotateStringArray: true,
      selfDefending: true,
      stringArray: true,
      stringArrayThreshold: 0.75,
      transformObjectKeys: true,
      unicodeEscapeSequence: false
    });

    fs.writeFileSync(outfile, obfuscated.getObfuscatedCode());
    fs.unlinkSync(tempFile);
  }

  console.log(`✅ Bundled and obfuscated ${hooks.length} hooks to dist/hooks/`);
}

/**
 * Main build process
 */
async function build() {
  try {
    const distDirs = ['dist', 'dist/scripts', 'dist/hooks'];
    for (const dir of distDirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    await Promise.all([
      bundleMain(),
      bundleScripts(),
      bundleHooks()
    ]);

    console.log('✅ Build complete!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();

export { bundleMain, bundleScripts, bundleHooks, build };
