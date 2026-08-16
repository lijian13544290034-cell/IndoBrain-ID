import fs from 'node:fs';
import Module from 'node:module';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = process.cwd();
const require = createRequire(import.meta.url);
const ts = require('typescript');

const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function resolveIndobrainAlias(request, parent, isMain, options) {
  if (request.startsWith('@/')) {
    return originalResolveFilename.call(this, path.join(root, request.slice(2)), parent, isMain, options);
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
    },
    fileName: filename,
  }).outputText;
  module._compile(output, filename);
};

const { getExperienceCatalog } = require(path.join(root, 'lib', 'experience-catalog.ts'));
const { harvestMeaning, harvestTerm } = require(path.join(root, 'lib', 'harvest.ts'));

const catalog = getExperienceCatalog();
const seenScenes = new Set();
const harvestItems = [];

for (const scene of catalog) {
  if (!scene?.id || seenScenes.has(scene.id)) continue;
  seenScenes.add(scene.id);
  for (const entry of scene.harvest ?? []) {
    const term = harvestTerm(entry);
    const meaning = harvestMeaning(entry);
    harvestItems.push({
      sceneId: scene.id,
      href: scene.href,
      term,
      meaning,
      raw: entry,
    });
  }
}

const missing = harvestItems.filter((item) => !item.meaning || item.meaning === '印尼语短语');
const total = harvestItems.length;
const withChinese = total - missing.length;
const coverage = total === 0 ? 100 : (withChinese / total) * 100;

console.log(`TOTAL VOCAB ITEMS: ${total}`);
console.log(`WITH CHINESE: ${withChinese}`);
console.log(`MISSING CHINESE: ${missing.length}`);
console.log(`COVERAGE: ${coverage.toFixed(2)}%`);

if (missing.length) {
  console.error('\nVOCABULARY CHINESE COVERAGE: FAIL');
  for (const item of missing.slice(0, 50)) {
    console.error(`${item.sceneId}\t${item.term}\t${item.href}`);
  }
  if (missing.length > 50) console.error(`...and ${missing.length - 50} more`);
  process.exit(1);
}

console.log('VOCABULARY CHINESE COVERAGE: PASS');
