#!/usr/bin/env node
import { build, context } from 'esbuild';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(__filename), '..');
const outdir = path.join(projectRoot, 'dist');

const isWatchMode = process.argv.includes('--watch');
const shouldGenerateSourcemap = process.argv.includes('--sourcemap') || isWatchMode;

const buildConfig = {
  absWorkingDir: projectRoot,
  entryPoints: ['bmoGame.js'],
  outdir,
  bundle: true,
  minify: true,
  sourcemap: shouldGenerateSourcemap,
  target: ['es2020'],
  format: 'esm',
  logLevel: 'info',
  legalComments: 'none',
  treeShaking: true,
  define: {
    'process.env.NODE_ENV': JSON.stringify(isWatchMode ? 'development' : 'production')
  }
};

async function ensureOutputDir() {
  await mkdir(outdir, { recursive: true });
}

async function run() {
  await ensureOutputDir();
  if (isWatchMode) {
    const ctx = await context(buildConfig);
    await ctx.watch();
    console.log('Watching for changes...');
  } else {
    await build(buildConfig);
    console.log(`Bundled assets written to ${path.relative(projectRoot, outdir)}`);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
