// Local static server that mimics Cloudflare Pages clean URLs, so audits and
// screenshots exercise the same paths production does (/brochure, not
// /brochure.html). Without this the tooling silently tests URLs that 308 in
// production.
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, 'dist');
const PORT = Number(process.env.PORT) || 4399;
const TYPES = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8',
  '.js':'text/javascript; charset=utf-8', '.json':'application/json', '.xml':'application/xml',
  '.txt':'text/plain; charset=utf-8', '.webp':'image/webp', '.jpg':'image/jpeg',
  '.jpeg':'image/jpeg', '.png':'image/png', '.svg':'image/svg+xml', '.mp4':'video/mp4',
  '.webm':'video/webm', '.ico':'image/x-icon' };

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  let file = path.join(ROOT, p);
  // clean URL: /brochure -> brochure.html
  if (!fs.existsSync(file) && !path.extname(file) && fs.existsSync(file + '.html')) file += '.html';
  // production 308s the .html form to the clean one; mirror that
  if (path.extname(p) === '.html' && path.basename(p) !== 'index.html') {
    res.writeHead(308, { Location: p.replace(/\.html$/, '') }); return res.end();
  }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(buf);
  });
}).listen(PORT, '127.0.0.1', () => console.log('serving dist on http://localhost:' + PORT + ' (clean URLs)'));
