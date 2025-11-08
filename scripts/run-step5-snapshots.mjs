import { build } from 'esbuild';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { mkdirSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.join(__dirname, '../.snapshots-temp');
const outFile = path.join(outDir, 'step5Snapshots.mjs');

mkdirSync(outDir, { recursive: true });

await build({
  entryPoints: [path.join(__dirname, '../tests/step5SnapshotsEntry.tsx')],
  outfile: outFile,
  bundle: true,
  format: 'esm',
  platform: 'node',
  sourcemap: false,
  jsx: 'automatic',
  target: ['node18'],
  external: ['react', 'react-dom', 'react-dom/server'],
});

const moduleUrl = pathToFileURL(outFile).href;
const { runSnapshots } = await import(moduleUrl);
runSnapshots();
