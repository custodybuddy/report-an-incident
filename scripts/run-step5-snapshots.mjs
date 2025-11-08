import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const tempDir = path.join(rootDir, '.snapshots-temp');
const entryPath = path.join(rootDir, 'tests/step5SnapshotsEntry.tsx');
const outputFile = path.join(tempDir, 'step5Snapshots.mjs');

mkdirSync(tempDir, { recursive: true });

await build({
  configFile: false,
  root: rootDir,
  logLevel: 'error',
  esbuild: { jsx: 'automatic' },
  build: {
    outDir: tempDir,
    emptyOutDir: false,
    sourcemap: false,
    minify: false,
    rollupOptions: {
      input: entryPath,
      external: [
        'react',
        'react-dom',
        'react-dom/server',
        'node:fs',
        'node:path',
        'node:url',
        'node:assert/strict',
      ],
      output: {
        entryFileNames: () => 'step5Snapshots.mjs',
        preserveModules: false,
      },
    },
    lib: {
      entry: entryPath,
      formats: ['es'],
      fileName: () => 'step5Snapshots.mjs',
    },
    target: 'node20',
  },
});

const moduleUrl = pathToFileURL(outputFile).href;
const { runSnapshots } = await import(moduleUrl);
await runSnapshots();
