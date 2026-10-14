// Downloads everything Rishithej has entered into intake/received/:
//   received/answers.json          his latest answers
//   received/files/<name>          every uploaded file, original names kept
//   received/files.json            file list with captions, photographer, licence
//
// Usage:  node intake/pull.mjs
// Reads the access link from intake/.access-link.txt (git-ignored).

import { readFileSync, mkdirSync, writeFileSync, createWriteStream, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const here = dirname(fileURLToPath(import.meta.url));
const link = new URL(readFileSync(join(here, '.access-link.txt'), 'utf8').trim());
const BASE = link.origin;
const H = { 'x-intake-key': link.searchParams.get('k') };
const out = join(here, 'received');
mkdirSync(join(out, 'files'), { recursive: true });

const get = async (path) => {
  const r = await fetch(BASE + path, { headers: H });
  if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
  return r;
};

const answers = await (await get('/api/data')).json();
writeFileSync(join(out, 'answers.json'), JSON.stringify(answers, null, 2));
console.log('answers:', answers._savedAt ? `saved ${answers._savedAt}, status ${answers.status || 'in-progress'}` : 'nothing entered yet');

const { files } = await (await get('/api/files')).json();
const removed = new Set(answers.removedFiles || []);
const index = [];
const used = new Set();
for (const f of files) {
  // Keep the original name; prefix a counter only when two files share one.
  let name = f.name.replace(/[\\/:*?"<>|]+/g, '_');
  for (let i = 2; used.has(name.toLowerCase()); i++) name = `${i}-${f.name.replace(/[\\/:*?"<>|]+/g, '_')}`;
  used.add(name.toLowerCase());
  const dest = join(out, 'files', name);
  if (!existsSync(dest)) {
    const r = await get('/api/file?key=' + encodeURIComponent(f.key));
    await pipeline(Readable.fromWeb(r.body), createWriteStream(dest));
  }
  index.push({ file: name, size: f.size, type: f.type, uploadedAt: f.uploadedAt, removedByHim: removed.has(f.key), ...(answers.files?.[f.key] || {}) });
  console.log(`${removed.has(f.key) ? 'removed ' : 'file    '} ${name} (${(f.size / 1048576).toFixed(1)} MB)`);
}
writeFileSync(join(out, 'files.json'), JSON.stringify(index, null, 2));
console.log(`\n${files.length} file(s) -> ${join(out, 'files')}`);
