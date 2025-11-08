import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import ts from 'typescript';

const extensions = ['.ts', '.tsx'];

const shouldHandle = (specifier) => extensions.some(ext => specifier.endsWith(ext));

export async function resolve(specifier, context, defaultResolve) {
  if (shouldHandle(specifier)) {
    const resolved = await defaultResolve(specifier, context, defaultResolve);
    return { ...resolved, shortCircuit: true };
  }

  if (specifier.startsWith('.') && !path.extname(specifier)) {
    for (const ext of extensions) {
      try {
        const resolved = await defaultResolve(specifier + ext, context, defaultResolve);
        return { ...resolved, shortCircuit: true };
      } catch {}
    }
  }

  return defaultResolve(specifier, context, defaultResolve);
}

export async function load(url, context, defaultLoad) {
  if (!shouldHandle(url)) {
    return defaultLoad(url, context, defaultLoad);
  }

  const filePath = fileURLToPath(url);
  const source = await readFile(filePath, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      moduleResolution: ts.ModuleResolutionKind.Bundler
    },
    fileName: filePath
  });

  return {
    format: 'module',
    shortCircuit: true,
    source: output.outputText
  };
}
