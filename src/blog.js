// The writing section. Posts are Markdown files in src/posts/ with a small
// front-matter block, so a new piece is a new file and nothing here needs
// editing. Same rule as the rest of the generator: dist/blog/* is built, never
// hand-edited.
//
//   src/posts/<slug>.md
//   ---
//   title:       Headline, sentence case
//   description: One sentence for search results and the card. ~150 chars.
//   date:        2026-10-13
//   updated:     2026-10-13            (optional)
//   tags:        Deep tech, Governance (optional, comma separated)
//   draft:       true                  (optional - built but noindex, and left
//                                       out of the index, feed and sitemap)
//   ---
//   Body in a deliberately small Markdown subset: ## and ### headings, blank-
//   line paragraphs, - bullets, > blockquote, **bold**, *italic*, `code` and
//   [text](url). No raw HTML — everything is escaped first, so a post can never
//   break the page or inject markup.
//
//   A photograph is a block of its own:   ![alt text](/assets/name.jpg "Caption")
//   The source must be a .jpg in /assets/. WebP siblings named <name>-<width>.webp
//   are picked up automatically at their real widths.
const fs = require('fs');
const path = require('path');
const { size, attrs } = require('./dims');

const POSTS_DIR = path.join(__dirname, 'posts');
const IMAGE_BLOCK = /^!\[([^\]]*)\]\((\/assets\/[a-z0-9-]+\.jpg)(?:\s+"([^"]*)")?\)$/;

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// --- Front matter ---------------------------------------------------------
function parseFrontMatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error('missing front matter');
  const meta = {};
  m[1].split(/\r?\n/).forEach((line) => {
    if (!line.trim()) return;
    const i = line.indexOf(':');
    if (i < 0) throw new Error('bad front-matter line: ' + line);
    meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  });
  return { meta, body: m[2] };
}

// --- Inline Markdown ------------------------------------------------------
// Escaped FIRST, so any HTML in a post is inert text. Links are restricted to
// http(s), mailto and site-relative targets; anything else keeps its text and
// loses the href rather than emitting javascript: or data: into the page.
function inline(s) {
  let t = esc(s);
  t = t.replace(/`([^`]+)`/g, (_, c) => '<code>' + c + '</code>');
  t = t.replace(/\*\*([^*]+)\*\*/g, (_, c) => '<strong>' + c + '</strong>');
  t = t.replace(/(^|[^*])\*([^*]+)\*/g, (_, p, c) => p + '<em>' + c + '</em>');
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) => {
    const safe = /^(https?:\/\/|mailto:|\/)/i.test(href);
    if (!safe) return text;
    const ext = /^https?:\/\//i.test(href) && href.indexOf('bollamrishithej.com') < 0;
    return '<a href="' + esc(href) + '"' +
      (ext ? ' target="_blank" rel="noopener"' : '') + '>' + text + '</a>';
  });
  return t;
}

// --- Figures --------------------------------------------------------------
// One writer for every post photograph, lead or inline: WebP sources listed at
// their measured widths (never a width that does not exist), JPEG fallback,
// intrinsic dimensions so nothing shifts while it loads.
function figure(src, alt, caption, indent) {
  const pad = indent || '    ';
  const base = src.replace(/\.jpg$/, '');
  const webp = [480, 768, 960, 1280, 1600]
    .map((w) => base + '-' + w + '.webp')
    .filter((f) => size(f.replace(/^\/assets\//, '')))
    .map((f) => f + ' ' + size(f.replace(/^\/assets\//, ''))[0] + 'w');
  return pad + '<figure class="post-figure">\n' +
    pad + '  <picture>\n' +
    (webp.length ? pad + '    <source type="image/webp" srcset="' + webp.join(', ') + '" sizes="(max-width: 900px) 100vw, 68ch">\n' : '') +
    pad + '    <img src="' + src + '" alt="' + esc(alt) + '"' + attrs(src.replace(/^\//, '')) + ' loading="lazy" decoding="async">\n' +
    pad + '  </picture>\n' +
    (caption ? pad + '  <figcaption>' + esc(caption) + '</figcaption>\n' : '') +
    pad + '</figure>';
}

// Every photograph in a post body, in order, for structured data and the sitemap.
function bodyImages(src) {
  return src.replace(/\r\n/g, '\n').split(/\n{2,}/).map((b) => b.trim().match(IMAGE_BLOCK))
    .filter(Boolean).map((m) => ({ src: m[2], alt: m[1], caption: m[3] || '' }));
}

// --- Block Markdown -------------------------------------------------------
function renderBody(src) {
  const out = [];
  const blocks = src.replace(/\r\n/g, '\n').split(/\n{2,}/);
  for (const raw of blocks) {
    const block = raw.trim();
    if (!block) continue;

    const img = block.match(IMAGE_BLOCK);
    if (img) {
      if (!size(img[2].replace(/^\/assets\//, ''))) throw new Error('image not found in dist: ' + img[2]);
      out.push(figure(img[2], img[1], img[3], '        '));
      continue;
    }

    if (/^###\s+/.test(block)) { out.push('        <h3>' + inline(block.replace(/^###\s+/, '')) + '</h3>'); continue; }
    if (/^##\s+/.test(block))  { out.push('        <h2>' + inline(block.replace(/^##\s+/, '')) + '</h2>'); continue; }

    if (/^>\s?/.test(block)) {
      const text = block.split('\n').map((l) => l.replace(/^>\s?/, '')).join(' ');
      out.push('        <blockquote><p>' + inline(text) + '</p></blockquote>');
      continue;
    }

    if (/^-\s+/.test(block)) {
      const items = block.split('\n').filter((l) => /^-\s+/.test(l))
        .map((l) => '          <li>' + inline(l.replace(/^-\s+/, '')) + '</li>');
      out.push('        <ul class="post-list">\n' + items.join('\n') + '\n        </ul>');
      continue;
    }

    out.push('        <p>' + inline(block.split('\n').join(' ')) + '</p>');
  }
  return out.join('\n');
}

// Reading time from the body text only, at 200 wpm — the figure readers and
// search snippets both expect.
function readingTime(src) {
  const words = src.replace(/[#>*`\-\[\]()]/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

const human = (iso) => {
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
};

function loadPosts() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs.readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const slug = f.replace(/\.md$/, '');
      let parsed;
      try { parsed = parseFrontMatter(fs.readFileSync(path.join(POSTS_DIR, f), 'utf8')); }
      catch (e) { throw new Error('src/posts/' + f + ': ' + e.message); }
      const { meta, body } = parsed;
      for (const req of ['title', 'description', 'date']) {
        if (!meta[req]) throw new Error('src/posts/' + f + ': missing "' + req + '"');
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.date)) {
        throw new Error('src/posts/' + f + ': date must be YYYY-MM-DD');
      }
      return {
        slug, meta, body,
        draft: String(meta.draft).toLowerCase() === 'true',
        tags: meta.tags ? meta.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        html: renderBody(body),
        minutes: readingTime(body.replace(/^!\[.*$/gm, '')),
        // Lead photograph first, then the inline ones.
        images: [
          ...(meta.image ? [{ src: meta.image, alt: meta.imageAlt || meta.title, caption: meta.imageCaption || '' }] : []),
          ...bodyImages(body),
        ],
      };
    })
    // newest first; stable by slug so two posts sharing a date keep an order
    .sort((a, b) => b.meta.date.localeCompare(a.meta.date) || a.slug.localeCompare(b.slug));
}

module.exports = { loadPosts, esc, human, renderBody, readingTime, figure };
