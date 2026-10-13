// Regenerates sitemap.xml from the pages actually present in dist/, so a new
// page can never be added without appearing in the sitemap.
const fs = require('fs');
const path = require('path');
const SITE = 'https://bollamrishithej.com';
const OUT = path.join(__dirname, '..', 'dist');
const today = new Date().toISOString().slice(0, 10);

const IMAGES = {
  '/': [
    ['bollam-rishithej-founder-portrait.jpg', 'Bollam Rishithej — Founder and Managing Director, ML Dynamic Solutions',
     'Bollam Rishithej, Indian deep-tech founder and Managing Director of ML Dynamic Solutions, studio portrait lit in blue against a dark ground.'],
    ['bollam-rishithej-editorial-portrait.jpg', 'Bollam Rishithej — editorial portrait',
     'Black and white editorial portrait of Bollam Rishithej, seated against a white studio ground.'],
  ],
  '/about': [
    ['bollam-rishithej-editorial-portrait.jpg', 'Bollam Rishithej — editorial portrait',
     'Editorial portrait of Bollam Rishithej, Managing Director of ML Dynamic Solutions.'],
  ],
  '/media': [
    ['bollam-rishithej-founder-portrait.jpg', 'Bollam Rishithej — executive office portrait', 'Approved press photograph of Bollam Rishithej.'],
    ['bollam-rishithej-formal-portrait.jpg', 'Bollam Rishithej — formal portrait', 'Approved press photograph of Bollam Rishithej.'],
    ['bollam-rishithej-ml-group-headquarters.jpg', 'Bollam Rishithej at ML Group headquarters', 'Bollam Rishithej at the ML Group of Companies headquarters.'],
  ],
  '/brochure': [
    ['bollam-rishithej-formal-portrait.jpg', 'Bollam Rishithej — Executive Monograph', 'Executive monograph and venture dossier of Bollam Rishithej.'],
    ['bollam-rishithej-leicester-graduation-certificate.jpg', 'Bollam Rishithej — University of Leicester graduation',
     'Bollam Rishithej in cap and gown at his University of Leicester graduation, the Indian flag around his shoulders, holding his degree certificate.'],
    ['bollam-rishithej-leicester-graduation-indian-flag.jpg', 'Bollam Rishithej with the Indian flag at his Leicester graduation',
     'Bollam Rishithej holding the Indian national flag open at his University of Leicester graduation ceremony.'],
    ['bollam-rishithej-university-of-leicester-campus.jpg', 'Bollam Rishithej at the University of Leicester',
     'Bollam Rishithej beside the University of Leicester campus sign.'],
    ['bollam-rishithej-leicester-graduation-ceremony.jpg', 'Bollam Rishithej on graduation day, University of Leicester',
     'Bollam Rishithej in academic dress at the gates of the University of Leicester graduation venue.'],
    ['bollam-rishithej-leicester-graduation-memorial-arch.jpg', 'Bollam Rishithej in Victoria Park, Leicester',
     'Bollam Rishithej reading his graduation certificate in front of the memorial arch in Victoria Park, Leicester.'],
  ],
};

// Video sitemap entries, keyed the same way as IMAGES. Google discovers video
// from the sitemap AND from the VideoObject markup on the page, and the two
// have to agree, so both are written from the same facts. thumbnail_loc,
// title, description and content_loc are all required — an entry missing any
// one of them is dropped silently rather than reported.
const VIDEOS = {
  '/brochure': [
    ['bollam-rishithej-leicester-graduation-ceremony-video',
     'Bollam Rishithej at his University of Leicester graduation ceremony',
     'Bollam Rishithej at the University of Leicester graduation ceremony in Victoria Park, Leicester, after completing an MSc in Entrepreneurship and Innovation Management.', 18],
    ['bollam-rishithej-leicester-graduation-walk-video',
     'Bollam Rishithej walking out of his Leicester graduation',
     'Bollam Rishithej walking out of the University of Leicester graduation ceremony with his degree certificate.', 20],
    ['bollam-rishithej-leicester-graduation-campus-video',
     'Bollam Rishithej on the University of Leicester campus',
     'Bollam Rishithej on the University of Leicester campus on graduation day.', 8],
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
  const vids = (VIDEOS[r] || []).map(([f, title, desc, secs]) =>
`    <video:video>
      <video:thumbnail_loc>${SITE}/assets/${f}-poster.jpg</video:thumbnail_loc>
      <video:title>${esc(title)}</video:title>
      <video:description>${esc(desc)}</video:description>
      <video:content_loc>${SITE}/assets/${f}.mp4</video:content_loc>
      <video:duration>${secs}</video:duration>
      <video:family_friendly>yes</video:family_friendly>
      <video:live>no</video:live>
      <video:publication_date>${today}</video:publication_date>
    </video:video>`).join('\n');
  return `  <url>
    <loc>${SITE}${r}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${PRIORITY[r] || '0.6'}</priority>${imgs ? '\n' + imgs : ''}${vids ? '\n' + vids : ''}
  </url>`;
}).join('\n');

fs.writeFileSync(path.join(OUT, 'sitemap.xml'),
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${body}
</urlset>
`);
console.log('sitemap: %d urls', all.length);
all.forEach((r) => console.log('   %s  p=%s  images=%d', r, PRIORITY[r] || '0.6', (IMAGES[r] || []).length));
