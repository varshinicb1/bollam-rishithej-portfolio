// Intake form: serves one HTML page and a small API over an R2 bucket.
//
//   data/latest.json            the current answers (overwritten on every save)
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
const validUploadKey = (k) => typeof k === 'string' && /^uploads\/[0-9a-f-]{36}\/[^/]+$/.test(k) && !k.includes('..');
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
      if (path === '/api/data' && req.method === 'PUT') {
        let data;
        try { data = JSON.parse(await req.text()); } catch { return json({ error: 'Invalid data.' }, 400); }
        if (!data || typeof data !== 'object' || Array.isArray(data)) return json({ error: 'Invalid data.' }, 400);
        const savedAt = stamp();
        data._savedAt = savedAt;
        const body = JSON.stringify(data, null, 2);
        const meta = { httpMetadata: { contentType: 'application/json' } };
        await env.BUCKET.put('data/latest.json', body, meta);
        if (url.searchParams.get('snapshot') === '1') {
          await env.BUCKET.put(`data/history/${savedAt.replace(/[:.]/g, '-')}.json`, body, meta);
        }
        return json({ ok: true, savedAt });
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
