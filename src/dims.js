// Intrinsic dimensions for every asset, read once at build time. Images without
// width/height reflow when they land (CLS) and give crawlers no aspect ratio up
// front, so the generator must always emit them.
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'dist', 'assets');
const cache = {};

function pngSize(buf) {
  if (buf.length > 24 && buf.toString('ascii', 1, 4) === 'PNG')
    return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
  return null;
}
function jpegSize(buf) {
  if (buf[0] !== 0xFF || buf[1] !== 0xD8) return null;
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xFF) { i++; continue; }
    const m = buf[i + 1];
    if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC)
      return [buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5)];
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
}
function webpSize(buf) {
  if (buf.toString('ascii', 0, 4) !== 'RIFF') return null;
  const fmt = buf.toString('ascii', 12, 16);
  if (fmt === 'VP8X') return [1 + buf.readUIntLE(24, 3), 1 + buf.readUIntLE(27, 3)];
  if (fmt === 'VP8 ') return [buf.readUInt16LE(26) & 0x3FFF, buf.readUInt16LE(28) & 0x3FFF];
  if (fmt === 'VP8L') {
    const b = buf.readUInt32LE(21);
    return [(b & 0x3FFF) + 1, ((b >> 14) & 0x3FFF) + 1];
  }
  return null;
}
function svgSize(text) {
  const w = text.match(/\bwidth="(\d+(?:\.\d+)?)/);
  const h = text.match(/\bheight="(\d+(?:\.\d+)?)/);
  if (w && h) return [Math.round(+w[1]), Math.round(+h[1])];
  const vb = text.match(/viewBox="[\d.\-]+\s+[\d.\-]+\s+([\d.]+)\s+([\d.]+)"/);
  if (vb) return [Math.round(+vb[1]), Math.round(+vb[2])];
  return null;
}

function size(assetPath) {
  const name = path.basename(String(assetPath).split('?')[0]);
  if (name in cache) return cache[name];
  const f = path.join(DIR, name);
  let out = null;
  try {
    if (name.toLowerCase().endsWith('.svg')) out = svgSize(fs.readFileSync(f, 'utf8').slice(0, 4000));
    else {
      const buf = fs.readFileSync(f);
      out = pngSize(buf) || jpegSize(buf) || webpSize(buf);
    }
  } catch { out = null; }
  cache[name] = out;
  return out;
}

// Returns ` width="W" height="H"` or '' when the asset cannot be measured.
function attrs(assetPath) {
  const s = size(assetPath);
  return s ? ` width="${s[0]}" height="${s[1]}"` : '';
}

module.exports = { size, attrs };

if (require.main === module) {
  const fails = [];
  for (const f of fs.readdirSync(DIR)) if (!size(f)) fails.push(f);
  console.log('measured %d assets, unmeasurable: %s',
    fs.readdirSync(DIR).length - fails.length, fails.length ? fails.join(', ') : 'none');
}
