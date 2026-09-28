// Pulls the venture content out of the hand-authored brochure so the generated
// pages restate the same facts. Nothing here invents content: every field is
// lifted verbatim from dist/brochure.html.
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'brochure.html'), 'utf8');
const strip = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const decode = (s) => s
  .replace(/&amp;/g, '&').replace(/&bull;/g, '\u2022').replace(/&mdash;/g, '\u2014')
  .replace(/&ndash;/g, '\u2013').replace(/&nbsp;/g, ' ').replace(/&#8212;/g, '\u2014')
  .replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const clean = (s) => decode(strip(s));

const pages = html.split(/(?=<section class="dossier-page" id="page-\d+")/).slice(1);

function parsePage(part) {
  const id = (part.match(/id="(page-\d+)"/) || [])[1];
  const name = (part.match(/<div class="company-title-meta">\s*<h3>([^<]+)</) || [])[1];
  const role = (part.match(/<div class="company-title-meta">[\s\S]*?<span>([^<]+)</) || [])[1];
  const classification = (part.match(/class="page-classification">([^<]+)</) || [])[1];
  const lead = (part.match(/class="lead-thesis">([\s\S]*?)<\/p>/) || [])[1];
  const prose = [...part.matchAll(/class="prose-block">([\s\S]*?)<\/p>/g)].map(m => clean(m[1]));
  // `dossier-pill[^"]*` also matches the CONTAINER, dossier-pill-row, and
  // captures the whitespace inside it as an empty pill. Anchor on the class
  // ending, and drop anything blank regardless.
  const pills = [...part.matchAll(/class="dossier-pill(?: highlight)?">([^<]+)</g)]
    .map(m => clean(m[1])).filter(Boolean);
  const cards = [...part.matchAll(
    /<div class="spec-card">\s*<span class="spec-card-num">([^<]+)<\/span>\s*<h4>([^<]+)<\/h4>\s*<p>([\s\S]*?)<\/p>/g
  )].map(m => ({ num: clean(m[1]), title: clean(m[2]), body: clean(m[3]) }));
  const specs = [...part.matchAll(
    /<span class="spec-label">([^<]+)<\/span>\s*<span class="spec-value">([\s\S]*?)<\/span>/g
  )].map(m => ({ label: clean(m[1]), value: clean(m[2]) }));
  const highlight = (part.match(/class="panel-highlight-box[^"]*">\s*<strong>([^<]+)<\/strong>\s*<p>([\s\S]*?)<\/p>/) || []);
  const logo = (part.match(/<img src="(assets\/[^"]*logo[^"]*)"/) || [])[1];
  const photo = (part.match(/<img src="(assets\/bollam-rishithej[^"]+)"/) || [])[1];
  return {
    id, name: name && clean(name), role: role && clean(role),
    classification: classification && clean(classification),
    lead: lead && clean(lead), prose, pills, cards, specs, logo, photo,
    highlight: highlight[1] ? { title: clean(highlight[1]), body: clean(highlight[2]) } : null
  };
}

module.exports = { pages: pages.map(parsePage), clean };

if (require.main === module) {
  for (const p of module.exports.pages) {
    console.log(`${p.id}  ${p.name || '(no company)'}`);
    console.log(`   role=${p.role || '-'}  pills=${p.pills.length} cards=${p.cards.length} specs=${p.specs.length} prose=${p.prose.length}`);
    console.log(`   lead=${(p.lead || '').slice(0, 78)}...`);
    console.log(`   logo=${p.logo || '-'}  photo=${p.photo || '-'}`);
  }
}
