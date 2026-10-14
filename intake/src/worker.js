// Intake form: serves one HTML page and a small API over an R2 bucket.
//
//   data/latest.json            the current answers (field edits merged in)
//   data/history/<time>.json    snapshots, written on submit and periodically
//   uploads/<uuid>/<filename>   uploaded files, any type, any size
//
// Every /api/* call needs the access key. Uploads use R2 multipart so a file of
// any size streams through in parts, staying under the Worker request limit.

import FORM from './form.html';

const SEC = {
  'x-robots-tag': 'noindex, nofollow, noarchive, noimageindex',
  'referrer-policy': 'no-referrer',
  'x-content-type-options': 'nosniff',
  'cache-control': 'no-store',
};
const PAGE_CSP = [
  "default-src 'none'",
  "script-src 'unsafe-inline'",
  "style-src 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "connect-src 'self'",
  "form-action 'none'",
  "base-uri 'none'",
  "frame-ancestors 'none'",
].join('; ');

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json; charset=utf-8', ...SEC } });

async function authorised(req, env) {
  const given = req.headers.get('x-intake-key') || '';
  if (!env.ACCESS_KEY || !given) return false;
  const a = new TextEncoder().encode(given);
  const b = new TextEncoder().encode(env.ACCESS_KEY);
  if (a.byteLength !== b.byteLength) return false;
  return crypto.subtle.timingSafeEqual(a, b);
}

// Upload keys are only ever ones this Worker minted.
// ---- field-level edits ----------------------------------------------------
// Several people may have the form open at once, so clients send only the
// fields they changed, as ops, and the server merges them into the stored
// answers. A whole-document save would let the last writer erase everyone
// else's edits.
const BAD_SEG = new Set(['__proto__', 'prototype', 'constructor']);
function validPath(p) {
  return Array.isArray(p) && p.length >= 1 && p.length <= 8 &&
    p.every((s) => (typeof s === 'string' && s.length <= 300 && !BAD_SEG.has(s)) || (Number.isInteger(s) && s >= 0 && s <= 500));
}
function validValue(v) {
  return v === null || typeof v === 'boolean' || (typeof v === 'number' && Number.isFinite(v)) || (typeof v === 'string' && v.length <= 20000);
}
function applyOp(root, op) {
  if (!op || !validPath(op.path)) return false;
  let node = root;
  for (let i = 0; i < op.path.length - 1; i++) {
    const seg = op.path[i];
    const nextIsIndex = /^\d+$/.test(String(op.path[i + 1]));
    if (node[seg] === null || typeof node[seg] !== 'object') node[seg] = nextIsIndex ? [] : {};
    node = node[seg];
  }
  const last = op.path[op.path.length - 1];
  if ('add' in op) {            // set-union into an array, e.g. removedFiles
    if (!validValue(op.add)) return false;
    if (!Array.isArray(node[last])) node[last] = [];
    if (!node[last].includes(op.add)) node[last].push(op.add);
    return true;
  }
  if (!validValue(op.value)) return false;
  node[last] = op.value;
  return true;
}

const validUploadKey =(k) => typeof k === 'string' && /^uploads\/[0-9a-f-]{36}\/[^/]+$/.test(k) && !k.includes('..');
const safeName = (n) => (String(n || 'file').replace(/[^\w.\- ()]+/g, '_').replace(/^\.+/, '').slice(0, 180) || 'file');
const stamp = () => new Date().toISOString();

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;

    if (path === '/robots.txt') {
      return new Response('User-agent: *\nDisallow: /\n', { headers: { 'content-type': 'text/plain', ...SEC } });
    }
    if (!path.startsWith('/api/')) {
      return new Response(FORM, { headers: { 'content-type': 'text/html; charset=utf-8', 'content-security-policy': PAGE_CSP, ...SEC } });
    }
    if (!(await authorised(req, env))) return json({ error: 'This link is not valid.' }, 401);

    try {
      // ---- answers -------------------------------------------------------
      if (path === '/api/data' && req.method === 'GET') {
        const obj = await env.BUCKET.get('data/latest.json');
        if (!obj) return json({});
        return new Response(obj.body, { headers: { 'content-type': 'application/json; charset=utf-8', ...SEC } });
      }
      if (path === '/api/data' && req.method === 'PATCH') {
        let body;
        try { body = await req.json(); } catch { return json({ error: 'Invalid data.' }, 400); }
        const ops = body && Array.isArray(body.ops) ? body.ops : null;
        if (!ops || ops.length > 2000) return json({ error: 'Invalid data.' }, 400);
        const meta = { httpMetadata: { contentType: 'application/json' } };
        // Read, merge, and write back only if nobody else wrote in between
        // (R2 conditional put on the etag); otherwise re-read and merge again.
        // Exponential backoff with full jitter: under heavy contention real R2
        // needed more than a few short retries to let every writer through.
        for (let attempt = 0; attempt < 16; attempt++) {
          const cur = await env.BUCKET.get('data/latest.json');
          let data = {};
          if (cur) { try { data = JSON.parse(await cur.text()); } catch { data = {}; } }
          if (!data || typeof data !== 'object' || Array.isArray(data)) data = {};
          let applied = 0;
          for (const op of ops) if (applyOp(data, op)) applied++;
          const savedAt = stamp();
          data._savedAt = savedAt;
          const text = JSON.stringify(data, null, 2);
          const put = await env.BUCKET.put('data/latest.json', text, cur ? { ...meta, onlyIf: { etagMatches: cur.etag } } : meta);
          if (put === null) { await new Promise((r) => setTimeout(r, Math.random() * Math.min(1500, 60 * 2 ** attempt))); continue; }
          if (url.searchParams.get('snapshot') === '1') {
            await env.BUCKET.put(`data/history/${savedAt.replace(/[:.]/g, '-')}.json`, text, meta);
          }
          return json({ ok: true, savedAt, applied, rejected: ops.length - applied, data });
        }
        return json({ error: 'Busy, please retry.' }, 409);
      }

      // ---- uploads -------------------------------------------------------
      if (path === '/api/upload/start' && req.method === 'POST') {
        const { name, type, size } = await req.json();
        const key = `uploads/${crypto.randomUUID()}/${safeName(name)}`;
        const mpu = await env.BUCKET.createMultipartUpload(key, {
          httpMetadata: { contentType: type || 'application/octet-stream' },
          customMetadata: { originalName: String(name || '').slice(0, 300), declaredSize: String(size ?? ''), uploadedAt: stamp() },
        });
        return json({ key, uploadId: mpu.uploadId });
      }
      if (path === '/api/upload/part' && req.method === 'PUT') {
        const key = url.searchParams.get('key');
        const uploadId = url.searchParams.get('uploadId');
        const part = Number(url.searchParams.get('part'));
        const len = Number(req.headers.get('content-length'));
        if (!validUploadKey(key) || !uploadId || !(part >= 1 && part <= 10000) || !(len > 0)) {
          return json({ error: 'Bad upload request.' }, 400);
        }
        // Stream the part straight into R2 rather than buffering it in memory.
        const { readable, writable } = new FixedLengthStream(len);
        req.body.pipeTo(writable).catch(() => {});
        const done = await env.BUCKET.resumeMultipartUpload(key, uploadId).uploadPart(part, readable);
        return json({ partNumber: done.partNumber, etag: done.etag });
      }
      if (path === '/api/upload/complete' && req.method === 'POST') {
        const { key, uploadId, parts } = await req.json();
        if (!validUploadKey(key) || !uploadId || !Array.isArray(parts) || !parts.length) return json({ error: 'Bad upload request.' }, 400);
        const obj = await env.BUCKET.resumeMultipartUpload(key, uploadId).complete(
          parts.map((p) => ({ partNumber: Number(p.partNumber), etag: String(p.etag) })).sort((a, b) => a.partNumber - b.partNumber),
        );
        return json({ key, size: obj.size });
      }
      if (path === '/api/upload/abort' && req.method === 'POST') {
        const { key, uploadId } = await req.json();
        if (validUploadKey(key) && uploadId) await env.BUCKET.resumeMultipartUpload(key, uploadId).abort().catch(() => {});
        return json({ ok: true });
      }

      // ---- listing and retrieval ----------------------------------------
      if (path === '/api/files' && req.method === 'GET') {
        const files = [];
        let cursor;
        do {
          const page = await env.BUCKET.list({ prefix: 'uploads/', cursor, include: ['customMetadata', 'httpMetadata'] });
          for (const o of page.objects) {
            files.push({
              key: o.key,
              name: o.customMetadata?.originalName || o.key.split('/').pop(),
              size: o.size,
              type: o.httpMetadata?.contentType || '',
              uploadedAt: o.customMetadata?.uploadedAt || o.uploaded,
            });
          }
          cursor = page.truncated ? page.cursor : undefined;
        } while (cursor);
        files.sort((a, b) => String(a.uploadedAt).localeCompare(String(b.uploadedAt)));
        return json({ files });
      }
      if (path === '/api/file' && req.method === 'GET') {
        const key = url.searchParams.get('key');
        if (!validUploadKey(key)) return json({ error: 'Not found.' }, 404);
        const obj = await env.BUCKET.get(key);
        if (!obj) return json({ error: 'Not found.' }, 404);
        return new Response(obj.body, {
          headers: { 'content-type': obj.httpMetadata?.contentType || 'application/octet-stream', 'content-length': String(obj.size), ...SEC },
        });
      }

      return json({ error: 'Not found.' }, 404);
    } catch (err) {
      return json({ error: 'Server error: ' + (err && err.message ? err.message : String(err)) }, 500);
    }
  },
};
