// Regenerates sitemap.xml from the pages actually present in dist/, so a new
// page can never be added without appearing in the sitemap.
const fs = require('fs');
const path = require('path');
const SITE = 'https://bollamrishithej.com';
const OUT = path.join(__dirname, '..', 'dist');
const today = new Date().toISOString().slice(0, 10);

const IMAGES = {
  '/': [
    ['bollam-rishithej-founder-managing-director.jpg', 'Bollam Rishithej — Founder and Managing Director, ML Dynamic Solutions',
     'Bollam Rishithej, Indian deep-tech founder and Managing Director of ML Dynamic Solutions, at a city-facing executive office in Hyderabad.'],
    ['bollam-rishithej-editorial-portrait.jpg', 'Bollam Rishithej — editorial portrait',
     'Black and white editorial portrait of Bollam Rishithej, seated against a white studio ground.'],
    ['bollam-rishithej-director-portrait.jpg', 'Bollam Rishithej — studio portrait',
     'Bollam Rishithej, Rishithej Bollam, studio portrait in a grey suit against a charcoal ground.'],
  ],
  '/about': [
    ['bollam-rishithej-editorial-portrait.jpg', 'Bollam Rishithej — editorial portrait',
     'Editorial portrait of Bollam Rishithej, Managing Director of ML Dynamic Solutions.'],
  ],
  '/media': [
    ['bollam-rishithej-founder-managing-director.jpg', 'Bollam Rishithej — executive office portrait', 'Approved press photograph of Bollam Rishithej.'],
    ['bollam-rishithej-formal-portrait.jpg', 'Bollam Rishithej — formal portrait', 'Approved press photograph of Bollam Rishithej.'],
    ['bollam-rishithej-director-portrait.jpg', 'Bollam Rishithej — studio portrait', 'Approved press photograph of Bollam Rishithej.'],
    ['bollam-rishithej-ml-group-headquarters.jpg', 'Bollam Rishithej at ML Group headquarters', 'Bollam Rishithej at the ML Group of Companies headquarters.'],
  ],
  '/brochure': [
    ['bollam-rishithej-formal-portrait.jpg', 'Bollam Rishithej — Executive Monograph', 'Executive monograph and venture dossier of Bollam Rishithej.'],
  ],
};

const PRIORITY = { '/': '1.0', '/about': '0.9', '/ventures': '0.9', '/brochure': '0.8', '/contact': '0.7', '/journey': '0.7', '/media': '0.7' };

// Discover routes from the filesystem rather than a hand-kept list.
function routes(dir, base) {
  let out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (e.name === 'assets') continue;
      out = out.concat(routes(path.join(dir, e.name), base + '/' + e.name));
    } else if (e.name === 'index.html') {
      out.push(base === '' ? '/' : base);
    } else if (e.name.endsWith('.html') && e.name !== '404.html') {
      out.push(base + '/' + e.name.replace(/\.html$/, ''));
    }
  }
  return out;
}

const all = [...new Set(routes(OUT, ''))].sort((a, b) => {
  const pa = parseFloat(PRIORITY[a] || '0.6'), pb = parseFloat(PRIORITY[b] || '0.6');
  return pb - pa || a.localeCompare(b);
});

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const body = all.map((r) => {
  const imgs = (IMAGES[r] || []).map(([f, title, caption]) =>
`    <image:image>
      <image:loc>${SITE}/assets/${f}</image:loc>
      <image:title>${esc(title)}</image:title>
      <image:caption>${esc(caption)}</image:caption>
    </image:image>`).join('\n');
  return `  <url>
    <loc>${SITE}${r}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${PRIORITY[r] || '0.6'}</priority>${imgs ? '\n' + imgs : ''}
  </url>`;
}).join('\n');

fs.writeFileSync(path.join(OUT, 'sitemap.xml'),
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${body}
</urlset>
`);
console.log('sitemap: %d urls', all.length);
all.forEach((r) => console.log('   %s  p=%s  images=%d', r, PRIORITY[r] || '0.6', (IMAGES[r] || []).length));
