// Generates the site's interior pages. Content comes from the hand-authored
// brochure via extract.js, or from the register on index.html — nothing here is
// invented. Run: node src/build.js
const fs = require('fs');
const path = require('path');
const { pages: dossier } = require('./extract');
const { SITE, page, crumbJsonLd } = require('./shell');
const { attrs, size } = require('./dims');
const { VENTURES, detailFor, renderRegister } = require('./register');

const OUT = path.join(__dirname, '..', 'dist');
const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const byId = (id) => dossier.find((p) => p.id === id);
const PERSON = { '@id': SITE + '/#person' };

// The register itself (VENTURES) now lives in src/register.js, because its
// markup ships in two documents — this generator's /ventures and the
// hand-authored homepage — and the two had already drifted.

const INDUSTRIAL = [
  ['Akshara Groups Bullion', 'Director', 'Spot bullion trading, vaulting and wholesale liquidity.', 'assets/akshara-logo.svg'],
  ['Jenani Infra', 'Director', 'Heavy civil infrastructure contracting, logistics hubs and EPC.', 'assets/jenani-infra-logo.svg'],
  ['Aditya Trading Company', 'Director', 'Wholesale agricultural commodity supply chain and inter-state grain logistics.', 'assets/aditya-trading-logo.svg'],
  ['RS Food Products', 'Director', 'High-throughput staple milling, packaged consumer foods and regional distribution.', 'assets/rs-foods-logo.svg'],
];

const CAREER = [
  ['2024 — Present', 'Director', 'Akshara Groups', 'Strategy, operations and growth across the gold industry.', 'assets/akshara-logo.svg'],
  ['2022 — 2025', 'Director', 'Jenani Infra', 'Infrastructure growth, project execution and operational improvement.', 'assets/jenani-infra-logo.svg'],
  ['2021 — Present', 'Director', 'Aditya Trading Company', 'Business development, financial oversight and sustainable profitability.', 'assets/aditya-trading-logo.svg'],
  ['2019 — 2021', 'Director', 'RS Food Products', 'Growth, operations and product excellence.', 'assets/rs-foods-logo.svg'],
];

const PRESS_IMAGES = [
  ['bollam-rishithej-founder-portrait', 'jpg', 'Studio portrait, blue key light', '1152 x 1536'],
  ['bollam-rishithej-editorial-portrait', 'jpg', 'Black and white editorial portrait', '1147 x 1536'],
  ['bollam-rishithej-director-portrait', 'jpg', 'Grey-suit studio portrait', '1024 x 1536'],
  ['bollam-rishithej-formal-portrait', 'jpg', 'Formal studio portrait', '1152 x 1536'],
  ['bollam-rishithej-ml-group-headquarters', 'jpg', 'At ML Group headquarters', '1280 x 960'],
];

const written = [];
function write(rel, html) {
  const f = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, html);
  written.push(rel);
}

const head = (label, heading, sub) => '    <section class="page-head">\n' +
  '      <p class="section-no">[ ' + label + ' ]</p>\n' +
  '      <h1>' + heading + '</h1>\n' +
  (sub ? '      <p class="page-lead">' + sub + '</p>\n' : '') +
  '    </section>';

/* ------------------------------------------------------------- ventures index */
// The register IS this page, so each company name takes the h2 and carries its
// own deep link. The homepage renders the same rows at h3 from the same module
// (see the foot of this file), so the two can no longer drift apart.
const ventureRows = renderRegister(dossier, { heading: 'h2', linked: true });

const industrialCards = INDUSTRIAL.map(function (row) {
  return '        <article class="industrial-card">\n' +
    '          <img src="/' + row[3] + '" alt="' + esc(row[0]) + ' logo" class="industrial-logo" loading="lazy" decoding="async"' + attrs(row[3]) + '>\n' +
    '          <h3>' + esc(row[0]) + '</h3>\n' +
    '          <p class="row-role">' + esc(row[1]) + '</p>\n' +
    '          <p>' + esc(row[2]) + '</p>\n        </article>';
}).join('\n');

const venturesTrail = [{ name: 'Home', path: '/' }, { name: 'Ventures', path: '/ventures' }];
write('ventures.html', page({
  title: 'Ventures &amp; Directorships — Bollam Rishithej',
  description: 'The twelve entities Bollam Rishithej holds office in, across deep technology, autonomous AI, capital management and industrial operations.',
  path: '/ventures',
  trail: venturesTrail,
  jsonld: { '@context': 'https://schema.org', '@graph': [
    crumbJsonLd(venturesTrail),
    { '@type': 'CollectionPage', '@id': SITE + '/ventures#page', url: SITE + '/ventures',
      name: 'Ventures & Directorships — Bollam Rishithej', about: PERSON,
      mainEntity: { '@type': 'ItemList', itemListElement: VENTURES.map(function (v, i) {
        return { '@type': 'ListItem', position: i + 1, name: v.name, url: SITE + '/ventures/' + v.slug };
      }) } },
  ] },
  body: head('THE PORTFOLIO', 'Ventures &amp; <em>directorships</em>',
    'Twelve entities across deep technology, autonomous AI, capital and industrial operations. Statutory designations are stated under the Companies Act, 2013.') +
    '\n    <section class="venture-list tone-dark" aria-label="Ventures">\n      <div class="venture-register">\n' +
    ventureRows + '\n      </div>\n    </section>\n' +
    '    <section class="industrial">\n      <p class="section-no">[ INDUSTRIAL OPERATIONS ]</p>\n' +
    '      <h2>Ground operations.</h2>\n      <div class="industrial-grid">\n' + industrialCards +
    '\n      </div>\n    </section>',
}));

/* --------------------------------------------------------- per-venture pages */
VENTURES.forEach(function (v) {
  // Same source as the expanding panel on the register, so a row that opens in
  // place and the page it links to can never state different facts. detailFor()
  // also carries the s.203 attribution rule for the three ML entities.
  const d = detailFor(v, dossier);
  const lead = d.lead, prose = d.prose, cards = d.cards, specs = d.specs, pills = d.pills;

  const trail = [{ name: 'Home', path: '/' }, { name: 'Ventures', path: '/ventures' },
    { name: v.name, path: '/ventures/' + v.slug }];

  let body = '    <section class="venture-head">\n' +
    '      <img src="/' + v.logo + '" alt="' + esc(v.name) + ' logo" class="venture-head-logo" decoding="async"' + attrs(v.logo) + '>\n' +
    '      <p class="section-no">[ ' + esc(v.sector.toUpperCase()) + ' ]</p>\n' +
    '      <h1>' + esc(v.name) + '</h1>\n' +
    '      <p class="venture-head-role">' + esc(v.role) +
    (v.site ? ' &bull; <a href="' + v.site + '" target="_blank" rel="noopener">' + v.site.replace('https://', '') + '</a>' : '') +
    '</p>\n' +
    (v.dpiit ? '      <p class="row-gov">DPIIT Recognized Startup, Government of India</p>\n' : '') +
    '      <p class="page-lead">' + esc(lead) + '</p>\n' +
    (pills.length ? '      <div class="tags">' + pills.map(function (p) { return '<span>' + esc(p) + '</span>'; }).join('') + '</div>\n' : '') +
    '    </section>';

  if (prose.length) {
    body += '\n    <section class="venture-prose">\n' +
      prose.map(function (p) { return '      <p>' + esc(p) + '</p>'; }).join('\n') + '\n    </section>';
  }
  if (cards.length) {
    body += '\n    <section class="venture-capability">\n      <p class="section-no">[ CAPABILITIES ]</p>\n      <div class="capability-grid">\n' +
      cards.map(function (c) {
        return '        <article class="capability-card">\n' +
          '          <span class="capability-num">' + esc(c.num) + '</span>\n' +
          '          <h2>' + esc(c.title) + '</h2>\n' +
          '          <p>' + esc(c.body) + '</p>\n        </article>';
      }).join('\n') + '\n      </div>\n    </section>';
  }
  if (specs.length) {
    body += '\n    <section class="venture-specs">\n      <p class="section-no">[ SPECIFICATIONS ]</p>\n      <dl class="spec-list">\n' +
      specs.map(function (s) {
        return '        <div class="spec-row"><dt>' + esc(s.label) + '</dt><dd>' + esc(s.value) + '</dd></div>';
      }).join('\n') + '\n      </dl>\n    </section>';
  }
  body += '\n    <section class="venture-foot">\n      <p class="section-no">[ RELATED ]</p>\n      <div class="related-grid">\n' +
    VENTURES.filter(function (o) { return o.slug !== v.slug; }).slice(0, 4).map(function (o) {
      return '        <a class="related-card" href="/ventures/' + o.slug + '"><span>' + esc(o.sector) + '</span><strong>' + esc(o.name) + '</strong></a>';
    }).join('\n') +
    '\n      </div>\n      <p class="venture-foot-note">Full detail appears in the <a href="/brochure">executive dossier</a>.</p>\n    </section>';

  write('ventures/' + v.slug + '.html', page({
    title: esc(v.name) + ' — ' + esc(v.role) + ' | Bollam Rishithej',
    description: (v.name + ': ' + lead).slice(0, 155).replace(/"/g, ''),
    path: '/ventures/' + v.slug,
    trail: trail,
    jsonld: { '@context': 'https://schema.org', '@graph': [
      crumbJsonLd(trail),
      { '@type': 'Organization', '@id': SITE + '/ventures/' + v.slug + '#org', name: v.name,
        url: v.site || SITE + '/ventures/' + v.slug, description: lead,
        logo: SITE + '/' + v.logo, founder: PERSON,
        member: { '@type': 'OrganizationRole', roleName: v.role, member: PERSON } },
      { '@type': 'WebPage', '@id': SITE + '/ventures/' + v.slug + '#page',
        url: SITE + '/ventures/' + v.slug, name: v.name + ' — ' + v.role,
        about: { '@id': SITE + '/ventures/' + v.slug + '#org' }, mentions: PERSON },
    ] },
    body: body,
  }));
});

/* ---------------------------------------------------------------------- about */
const p02 = byId('page-02') || { prose: [], specs: [], cards: [] };
const aboutTrail = [{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }];
let aboutBody = head('PROFILE', 'About <em>Bollam Rishithej</em>',
  'Indian deep-tech founder and operator. Managing Director of ML Dynamic Solutions, and a director and co-founder across ventures in agentic AI security, computer vision, electrochemical sensing, healthcare revenue intelligence, capital management and industrial operations.') +
  '\n    <section class="about-body">\n' +
  '      <figure class="about-portrait">\n' +
  '        <img src="/assets/bollam-rishithej-editorial-portrait-1147.webp" alt="Editorial portrait of Bollam Rishithej" width="1147" height="1536" loading="lazy" decoding="async">\n' +
  '      </figure>\n      <div class="about-prose">\n' +
  p02.prose.map(function (p) { return '        <p>' + esc(p) + '</p>'; }).join('\n') +
  '\n      </div>\n    </section>';
if (p02.specs.length) {
  aboutBody += '\n    <section class="about-specs">\n      <p class="section-no">[ CREDENTIALS ]</p>\n      <dl class="spec-list">\n' +
    p02.specs.map(function (s) {
      return '        <div class="spec-row"><dt>' + esc(s.label) + '</dt><dd>' + esc(s.value) + '</dd></div>';
    }).join('\n') + '\n      </dl>\n    </section>';
}
if (p02.cards.length) {
  aboutBody += '\n    <section class="about-doctrine">\n      <p class="section-no">[ DOCTRINE ]</p>\n      <div class="capability-grid">\n' +
    p02.cards.map(function (c) {
      return '        <article class="capability-card">\n' +
        '          <span class="capability-num">' + esc(c.num) + '</span>\n' +
        '          <h2>' + esc(c.title) + '</h2>\n' +
        '          <p>' + esc(c.body) + '</p>\n        </article>';
    }).join('\n') + '\n      </div>\n    </section>';
}
aboutBody += '\n    <section class="venture-foot">\n      <p class="venture-foot-note">His ventures are listed in the <a href="/ventures">portfolio</a>, his career in the <a href="/journey">journey</a>, and the full record in the <a href="/brochure">executive dossier</a>.</p>\n    </section>';

write('about.html', page({
  title: 'About Bollam Rishithej — Founder &amp; Managing Director',
  description: 'Biography of Bollam Rishithej (Rishithej Bollam): MSc Entrepreneurship and Innovation Management, University of Leicester; Managing Director of ML Dynamic Solutions; director across deep-tech and industrial ventures.',
  path: '/about',
  image: '/assets/bollam-rishithej-editorial-portrait.jpg',
  imageAlt: 'Executive portrait of Bollam Rishithej',
  trail: aboutTrail,
  jsonld: { '@context': 'https://schema.org', '@graph': [
    crumbJsonLd(aboutTrail),
    { '@type': 'AboutPage', '@id': SITE + '/about#page', url: SITE + '/about',
      name: 'About Bollam Rishithej', mainEntity: PERSON },
  ] },
  body: aboutBody,
}));

/* -------------------------------------------------------------------- journey */
const journeyTrail = [{ name: 'Home', path: '/' }, { name: 'Journey', path: '/journey' }];
write('journey.html', page({
  title: 'Journey &amp; Track Record — Bollam Rishithej',
  description: 'The career of Bollam Rishithej: directorships across bullion, infrastructure, agricultural commodities and food processing, and an MSc from the University of Leicester.',
  path: '/journey',
  trail: journeyTrail,
  jsonld: { '@context': 'https://schema.org', '@graph': [
    crumbJsonLd(journeyTrail),
    { '@type': 'WebPage', '@id': SITE + '/journey#page', url: SITE + '/journey',
      name: 'Journey & Track Record', about: PERSON },
  ] },
  body: head('JOURNEY', 'Built through <em>real operations</em>',
    'Board positions across bullion, heavy infrastructure, agricultural commodities and food processing, alongside the deep-tech portfolio.') +
    '\n    <section class="journey">\n      <div class="timeline">\n' +
    CAREER.map(function (row) {
      return '        <article>\n          <time>' + row[0] + '</time>\n' +
        '          <div class="timeline-body">\n' +
        '            <img src="/' + row[4] + '" alt="' + esc(row[2]) + ' logo" class="timeline-brand-logo" width="28" height="28" loading="lazy">\n' +
        '            <div>\n              <h2>' + esc(row[1]) + ' &middot; ' + esc(row[2]) + '</h2>\n' +
        '              <p>' + esc(row[3]) + '</p>\n            </div>\n          </div>\n        </article>';
    }).join('\n') +
    '\n        <article class="education">\n          <time>2022 — 2024</time>\n' +
    '          <div class="timeline-body">\n' +
    '            <img src="/assets/university-of-leicester.svg" alt="University of Leicester" class="timeline-brand-logo" width="32" height="32" loading="lazy">\n' +
    '            <div>\n              <h2>University of Leicester</h2>\n' +
    '              <p>MSc Entrepreneurship and Innovation Management.</p>\n' +
    '            </div>\n          </div>\n        </article>\n      </div>\n    </section>\n' +
    '    <section class="venture-foot">\n      <p class="venture-foot-note">The current portfolio is listed under <a href="/ventures">ventures</a>.</p>\n    </section>',
}));

/* ---------------------------------------------------------------------- media */
const mediaTrail = [{ name: 'Home', path: '/' }, { name: 'Media', path: '/media' }];
write('media.html', page({
  title: 'Media Kit &amp; Photographs — Bollam Rishithej',
  description: 'Approved photographs, biography and designation of Bollam Rishithej for press, conference and publication use.',
  path: '/media',
  trail: mediaTrail,
  jsonld: { '@context': 'https://schema.org', '@graph': [
    crumbJsonLd(mediaTrail),
    { '@type': 'WebPage', '@id': SITE + '/media#page', url: SITE + '/media',
      name: 'Media Kit — Bollam Rishithej', about: PERSON,
      image: PRESS_IMAGES.map(function (row) {
        const d = size(row[0] + '.' + row[1]) || [];
        return { '@type': 'ImageObject', contentUrl: SITE + '/assets/' + row[0] + '.' + row[1],
          url: SITE + '/assets/' + row[0] + '.' + row[1],
          name: 'Bollam Rishithej — ' + row[2],
          caption: 'Bollam Rishithej, Founder and Managing Director of ML Dynamic Solutions. ' + row[2] + '.',
          description: 'Bollam Rishithej (Rishithej Bollam), Indian deep-tech founder and Managing Director of ML Dynamic Solutions, Hyderabad. ' + row[2] + '.',
          width: d[0], height: d[1],
          about: PERSON, creator: PERSON,
          creditText: 'Bollam Rishithej',
          copyrightNotice: '(c) Bollam Rishithej',
          // license + acquireLicensePage are what qualify an image for the
          // "Licensable" badge in Google Images, which is a real visibility lift.
          license: SITE + '/media',
          acquireLicensePage: SITE + '/contact',
          representativeOfPage: row[0].indexOf('founder-portrait') > -1 };
      }) },
  ] },
  body: head('MEDIA', 'Media kit',
    'Approved photographs and biography for press, conference programmes and publication use. Please credit Bollam Rishithej.') +
    '\n    <section class="media-bio">\n      <p class="section-no">[ BIOGRAPHY ]</p>\n' +
    '      <h2>Short form</h2>\n' +
    '      <p class="media-copy">Bollam Rishithej is an Indian deep-tech founder and operator, and Managing Director of ML Dynamic Solutions. He is a director and co-founder across VidyuthLabs, Predictera, FirstSecure.ai and DenyFix.ai, and holds board positions across ML Capital, CXOera and four industrial companies. He holds an MSc in Entrepreneurship and Innovation Management from the University of Leicester.</p>\n' +
    '      <h2>Designation</h2>\n      <p class="media-copy">Founder &amp; Managing Director, ML Dynamic Solutions.</p>\n' +
    '      <h2>Location</h2>\n      <p class="media-copy">Hyderabad, Telangana, India.</p>\n    </section>\n' +
    '    <section class="media-images">\n      <p class="section-no">[ PHOTOGRAPHS ]</p>\n      <div class="media-grid">\n' +
    PRESS_IMAGES.map(function (row) {
      return '        <figure class="media-item">\n' +
        '          <img src="/assets/' + row[0] + '.' + row[1] + '" alt="Bollam Rishithej — ' + esc(row[2]) + '" loading="lazy" decoding="async"' + attrs(row[0] + '.' + row[1]) + '>\n' +
        '          <figcaption>\n            <span>' + esc(row[2]) + '</span>\n' +
        '            <a href="/assets/' + row[0] + '.' + row[1] + '" download>Download ' + row[3] + '</a>\n' +
        '          </figcaption>\n        </figure>';
    }).join('\n') +
    '\n      </div>\n    </section>\n' +
    '    <section class="venture-foot">\n      <p class="venture-foot-note">For interviews and speaking requests, use the <a href="/contact">contact page</a>.</p>\n    </section>',
}));

/* -------------------------------------------------------------------- contact */
const contactTrail = [{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }];
write('contact.html', page({
  title: 'Contact — Bollam Rishithej',
  description: 'Direct contact for ventures, partnerships, board enquiries and speaking requests with Bollam Rishithej, Hyderabad, India.',
  path: '/contact',
  trail: contactTrail,
  jsonld: { '@context': 'https://schema.org', '@graph': [
    crumbJsonLd(contactTrail),
    { '@type': 'ContactPage', '@id': SITE + '/contact#page', url: SITE + '/contact',
      name: 'Contact Bollam Rishithej', about: PERSON },
  ] },
  body: head('CONNECT', 'Let&rsquo;s build <em>what&rsquo;s next</em>',
    'For ventures, partnerships, board enquiries and conversations that deserve momentum.') +
    '\n    <section class="contact">\n      <div class="contact-actions">\n' +
    '        <a href="mailto:rishi@mldynamic.com" class="contact-link">\n' +
    '          <span class="contact-email-text">rishi@mldynamic.com</span>\n' +
    '          <span class="contact-badge">DIRECT CHANNEL &#8599;</span>\n        </a>\n' +
    '        <a href="https://www.linkedin.com/in/rishithej-bollam-5b7638362/" target="_blank" rel="noopener" class="contact-link">\n' +
    '          <span class="contact-email-text">linkedin.com/in/rishithej-bollam</span>\n' +
    '          <span class="contact-badge">LINKEDIN &#8599;</span>\n        </a>\n' +
    '        <a href="/brochure" class="contact-link">\n' +
    '          <span class="contact-email-text">Executive Dossier &amp; Monograph</span>\n' +
    '          <span class="contact-badge">VIEW DOSSIER &#8599;</span>\n        </a>\n' +
    '      </div>\n' +
    '      <p class="contact-note">Office of Bollam Rishithej &bull; Hyderabad, Telangana, India</p>\n' +
    '    </section>',
}));

/* ------------------------------------------------- the homepage register too */
// index.html is hand-authored and stays that way — this rewrites ONE region of
// it, between the two marker comments, and refuses to touch the file if they
// have gone missing rather than quietly leaving a stale register behind.
(function injectHomeRegister() {
  const f = path.join(OUT, 'index.html');
  const src = fs.readFileSync(f, 'utf8');
  const START = '<!-- register:start';
  const END = '<!-- register:end -->';
  const a = src.indexOf(START);
  const b = src.indexOf(END, a);
  if (a < 0 || b < 0) {
    throw new Error('index.html: register markers missing — refusing to write. ' +
      'Restore the <!-- register:start --> / <!-- register:end --> pair inside .venture-register.');
  }
  const headEnd = src.indexOf('-->', a) + 3;
  // The homepage keeps the h3 (it sits under the section's own h2) and the
  // plain name (the deep link is already in the actions row). `reveal` is the
  // scroll-entrance class the rest of the page uses.
  const rows = renderRegister(dossier, { heading: 'h3', rowClass: 'reveal' });
  const nl = src.indexOf('\r\n') > -1 ? '\r\n' : '\n';
  const out = src.slice(0, headEnd) + nl + rows.split('\n').join(nl) + nl + '        ' + src.slice(b);
  if (out !== src) fs.writeFileSync(f, out);
  written.push('index.html (register region)');
})();

console.log('generated ' + written.length + ' pages:');
written.forEach(function (w) { console.log('   ' + w); });
