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
const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, 'posts');

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

// --- Block Markdown -------------------------------------------------------
function renderBody(src) {
  const out = [];
  const blocks = src.replace(/\r\n/g, '\n').split(/\n{2,}/);
  for (const raw of blocks) {
    const block = raw.trim();
    if (!block) continue;

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
        minutes: readingTime(body),
      };
    })
    // newest first; stable by slug so two posts sharing a date keep an order
    .sort((a, b) => b.meta.date.localeCompare(a.meta.date) || a.slug.localeCompare(b.slug));
}

module.exports = { loadPosts, esc, human, renderBody, readingTime };
