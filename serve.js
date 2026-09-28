// Local static server that mimics Cloudflare Pages clean URLs, so audits and
// screenshots exercise the same paths production does (/brochure, not
// /brochure.html). Without this the tooling silently tests URLs that 308 in
// production — which is how a bad canonical reached the live site once.
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = fs.realpathSync(path.join(__dirname, 'dist'));
const PORT = Number(process.env.PORT) || 4399;
const TYPES = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8',
  '.js':'text/javascript; charset=utf-8', '.json':'application/json', '.xml':'application/xml',
  '.txt':'text/plain; charset=utf-8', '.webp':'image/webp', '.jpg':'image/jpeg',
  '.jpeg':'image/jpeg', '.png':'image/png', '.svg':'image/svg+xml', '.mp4':'video/mp4',
  '.webm':'video/webm', '.ico':'image/x-icon' };

// Every path that reaches the filesystem goes through here first.
// decodeURIComponent turns %2e%2e%2f into ../, and path.join happily
// normalises that out of ROOT, so containment has to be checked after
// resolution — and via realpath, so a symlink cannot step outside either.
function safeResolve(candidate) {
  let resolved;
  try { resolved = fs.realpathSync(path.resolve(candidate)); }
  catch { resolved = path.resolve(candidate); }          // not-yet-existing paths
  return resolved === ROOT || resolved.startsWith(ROOT + path.sep) ? resolved : null;
}

http.createServer((req, res) => {
  let p;
  try { p = decodeURIComponent(req.url.split('?')[0]); }
  catch { res.writeHead(400); return res.end('bad request'); }

  if (p.endsWith('/')) p += 'index.html';

  // Production 308s the .html form to the clean one; mirror that.
  if (path.extname(p) === '.html' && path.basename(p) !== 'index.html') {
    res.writeHead(308, { Location: p.replace(/\.html$/, '') });
    return res.end();
  }

  let file = safeResolve(path.join(ROOT, p));
  if (!file) { res.writeHead(403); return res.end('forbidden'); }

  // Clean URL: /brochure -> brochure.html
  if (!fs.existsSync(file) && !path.extname(file)) {
    const withExt = safeResolve(file + '.html');
    if (withExt && fs.existsSync(withExt)) file = withExt;
  }

  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(buf);
  });
}).listen(PORT, '127.0.0.1', () => console.log('serving dist on http://localhost:' + PORT + ' (clean URLs)'));
