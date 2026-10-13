// The venture register — the ruled list of holdings that appears BOTH on the
// homepage and on /ventures. It lived in two documents and had already drifted
// once; it is rendered from here now so the two cannot disagree.
//
// The expandable panel is progressive enhancement, deliberately built the
// "wrong" way round: the panel ships OPEN in the markup, and CSS collapses it
// only under `.js` (set inline in <head>, before first paint). So the detail is
// in the crawled HTML, it is readable with scripting off, and there is no
// expand/collapse flash on load. The toggle button is likewise hidden until
// `.js` exists, because without script it would do nothing.
//
// The deep link to /ventures/<slug> stays in every row alongside the panel.
// Those pages are the indexable surface for each company and must not lose
// their inbound links to an in-page accordion.
const { attrs } = require('./dims');

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const VENTURES = [
  { slug: 'ml-dynamic-solutions', name: 'ML Dynamic Solutions', role: 'Founder & Managing Director',
    sector: 'Technology', dpiit: true, logo: 'assets/ml-dynamic-logo.png', src: 'page-07',
    blurb: 'Enterprise AI and technology solutions spanning intelligent automation, digital transformation, and sovereign platforms.' },
  { slug: 'ml-group-of-companies', name: 'ML Group of Companies', role: 'Promoter & Director',
    sector: 'Group', dpiit: false, logo: 'assets/ml-group-logo.svg', src: 'page-07',
    blurb: 'Leading a diversified group built around technology, capital, operations and long-term enterprise value.' },
  { slug: 'ml-capital', name: 'ML Capital', role: 'Director',
    sector: 'Capital', dpiit: false, logo: 'assets/ml-capital-logo.svg', src: 'page-07',
    blurb: 'Capital management shaped by disciplined financial thinking, opportunity evaluation and sustainable growth.' },
  // `inkArt` marks a logo supplied as DARK artwork on transparency. It is
  // correct as-is on paper and has to be inverted on dark grounds, which the
  // register is. See `.is-ink-art` in the stylesheet.
  { slug: 'vidyuthlabs', name: 'VidyuthLabs', role: 'Co-Founder & Director',
    sector: 'Deep Tech', dpiit: false, logo: 'assets/vidyuthlabs-logo.png', src: 'page-03',
    inkArt: true,
    site: 'https://vidyuthlabs.co.in',
    blurb: 'Making lab-grade electrochemistry portable through handheld analyzers and interchangeable sensors for water, food, soil and industry.' },
  { slug: 'predictera', name: 'Predictera', role: 'Co-Founder & Director',
    sector: 'Vision AI', dpiit: true, logo: 'assets/predictera-logo.svg', logoOnDark: 'assets/predictera-logo-on-dark.svg', src: 'page-04',
    site: 'https://predictera.com',
    blurb: 'Computer vision intelligence platform transforming passive visual infrastructure into real-time operational perception.' },
  { slug: 'firstsecure-ai', name: 'FirstSecure.ai', role: 'Co-Founder & Director',
    sector: 'Agentic Cyber', dpiit: false, logo: 'assets/firstsecure-logo.svg', src: 'page-05',
    // site: 'https://firstsecure.ai',  // domain parked, no DNS - restore when live
    blurb: 'Autonomous agentic AI security platform engineering real-time threat detection, investigation, and automated neutralization.' },
  { slug: 'denyfix-ai', name: 'DenyFix.ai', role: 'Co-Founder & Director',
    sector: 'Healthcare AI', dpiit: false, logo: 'assets/denyfix-logo.png', logoOnDark: 'assets/denyfix-logo-on-dark.png', src: 'page-06',
    blurb: 'An AI-driven platform focused on intelligent denial management and touchless revenue cycle recovery in healthcare.' },
  { slug: 'cxoera', name: 'CXOera', role: 'Director',
    sector: 'Enterprise', dpiit: false, logo: 'assets/cxoera-logo.png', logoOnDark: 'assets/cxoera-logo-on-dark.png', src: 'page-08',
    blurb: 'A next-generation ecosystem designed around executive leadership and enterprise enablement.' },
  // The only entity here that is NOT an MCA company. `jurisdiction` marks that:
  // it keeps the register's "designations under the Companies Act, 2013" claim
  // true, and this office must NOT be counted toward the s.165 directorship cap.
  // The title matches emergera.ai's own leadership listing. CTO is not one of
  // the five whole-time KMP offices under s.203 (MD, WTD, CEO, CFO, CS), so it
  // does not touch the sole KMP office at ML Dynamic Solutions.
  // It has no brochure page, so detailFor() falls back to the blurb.
  { slug: 'emergera-ai', name: 'Emergera.ai', role: 'Co-Founder & Chief Technology Officer',
    sector: 'AI Education', dpiit: false,
    jurisdiction: 'United States · LLC',
    logo: 'assets/emergera-logo.svg',
    // Supplied as two artworks rather than one inverted file, so no filter is
    // needed: a dark wordmark for paper, a light one for the register.
    logoOnDark: 'assets/emergera-logo-on-dark.svg',
    site: 'https://emergera.ai',
    blurb: 'Live, practitioner-taught AI programs where learners build and deploy working agents rather than watch recorded lectures.' },
];

// What each holding may say about itself.
//
// ML Dynamic, ML Group and ML Capital share brochure page-07, so its lead and
// prose speak for the GROUP and cannot be reused verbatim by the subsidiaries.
// Its two capability cards are the exception: they are titled per arm ("ML
// Dynamic Enterprise Architecture", "ML Capital Venture Investments"), so each
// one can be attributed to the company it names. Everything else on that page
// stays with ML Group, which is the page's actual subject.
function detailFor(v, dossier) {
  const d = dossier.find((p) => p.id === v.src) || {};
  const cards = d.cards || [];
  const arm = (needle) => cards.filter((c) => c.title.toLowerCase().indexOf(needle) > -1);

  if (v.slug === 'ml-dynamic-solutions') {
    return { lead: v.blurb, prose: [], cards: arm('ml dynamic'), specs: [], pills: [] };
  }
  if (v.slug === 'ml-capital') {
    return { lead: v.blurb, prose: [], cards: arm('ml capital'), specs: [], pills: [] };
  }
  return {
    lead: d.lead || v.blurb,
    prose: d.prose || [],
    cards: cards,
    specs: d.specs || [],
    // The DPIIT recognition already has its own marked-up row badge; repeating
    // it as a plain tag reads as a duplicate.
    pills: (d.pills || []).filter((p) => p.toLowerCase() !== 'dpiit recognized startup'),
  };
}

// `heading` is the element the company name takes — h3 under the homepage's
// section h2, h2 on /ventures where the register IS the page. `linked` turns
// the name itself into the deep link, which /ventures wants and the homepage,
// which repeats the link in the actions row, does not.
function renderRegister(dossier, opts) {
  const o = opts || {};
  const h = o.heading || 'h3';
  const cls = o.rowClass ? ' ' + o.rowClass : '';

  return VENTURES.map(function (v, i) {
    const d = detailFor(v, dossier);
    const panelId = 'venture-panel-' + v.slug;
    const name = esc(v.name);

    // The panel is a genuine SUBSET of /ventures/<slug>: lead and capabilities
    // only. Prose, specifications and related holdings stay on the page, so
    // "Full profile" is always a step up rather than a step sideways.
    let panel = '';
    if (d.lead && d.lead !== v.blurb) {
      panel += '              <p class="row-panel-lead">' + esc(d.lead) + '</p>\n';
    }
    if (d.cards.length) {
      panel += '              <ul class="row-cap-list">\n' + d.cards.map(function (c, n) {
        return '                <li class="row-cap">\n' +
          '                  <span class="row-cap-num" aria-hidden="true">' + String(n + 1).padStart(2, '0') + '</span>\n' +
          '                  <p class="row-cap-title">' + esc(c.title) + '</p>\n' +
          '                  <p class="row-cap-body">' + esc(c.body) + '</p>\n                </li>';
      }).join('\n') + '\n              </ul>\n';
    }
    if (d.pills.length) {
      panel += '              <div class="tags">' +
        d.pills.map(function (p) { return '<span>' + esc(p) + '</span>'; }).join('') + '</div>\n';
    }
    // Whether there is anything worth opening. A holding with no brochure page
    // yields a panel containing nothing but the link back out, and a toggle
    // that expands onto a single link is worse than no toggle: the reader pays
    // a click to learn there was nothing there. Those rows keep the plain
    // "Full profile" link only.
    const hasDetail = panel !== '';

    if (hasDetail) {
      panel += '              <p class="row-panel-more"><a href="/ventures/' + v.slug + '">' +
        'Full profile, specifications and related holdings<span class="sr-only"> for ' + name +
        '</span></a></p>\n';
    }

    const title = o.linked
      ? '<a href="/ventures/' + v.slug + '">' + name + '</a>'
      : name;

    return '        <article class="venture-row' +
      (v.role.indexOf('Managing Director') > -1 ? ' is-principal' : '') + cls + '">\n' +
      '          <p class="row-index" aria-hidden="true">' + String(i + 1).padStart(2, '0') + '</p>\n' +
      '          <div class="row-identity">\n' +
      // The logo is optional. A holding can be added before its mark exists,
      // and emitting `src="/undefined"` would be a broken image on the most
      // scrutinised page on the site.
      // The register always sits on a dark ground, so a holding that ships a
      // purpose-made light artwork uses it here in preference to inverting.
      (function () {
        const mark = v.logoOnDark || v.logo;
        if (!mark) return '';
        return '            <img src="/' + mark + '" alt="' + name + ' logo" class="row-logo' +
          (v.inkArt ? ' is-ink-art' : '') + '" loading="lazy" decoding="async"' + attrs(mark) + '>\n';
      })() +
      '            <' + h + '>' + title + '</' + h + '>\n' +
      '            <p class="row-role">' + esc(v.role) + '</p>\n' +
      '            <p class="row-sector">' + esc(v.sector) + '</p>\n' +
      (v.dpiit ? '            <span class="row-gov">DPIIT Recognized</span>\n' : '') +
      // Marks a holding that sits OUTSIDE the Companies Act, 2013. Without it
      // the register's own standfirst — "statutory designations are stated
      // under the Companies Act, 2013" — would be claiming something untrue of
      // this row. Deliberately not the accent badge: it is a qualifier, not a
      // credential.
      (v.jurisdiction ? '            <span class="row-juris">' + esc(v.jurisdiction) + '</span>\n' : '') +
      '          </div>\n' +
      '          <div class="row-detail">\n' +
      '            <p class="row-blurb">' + esc(v.blurb) + '</p>\n' +
      '            <div class="row-actions">\n' +
      (hasDetail
        ? '              <button class="row-link row-expand is-primary" type="button" aria-expanded="true" aria-controls="' + panelId + '">\n' +
          '                <span class="row-expand-label">Read more</span><span class="sr-only"> about ' + name + '</span>\n' +
          '              </button>\n'
        : '') +
      '              <a class="row-link' + (hasDetail ? '' : ' is-primary') + '" href="/ventures/' + v.slug + '">Full profile<span class="sr-only"> of ' + name + '</span></a>\n' +
      (v.site ? '              <a class="row-link" href="' + v.site + '" target="_blank" rel="noopener">Visit site<span class="sr-only"> for ' + name + '</span></a>\n' : '') +
      '            </div>\n' +
      '          </div>\n' +
      // The panel is a sibling of `.row-detail`, not a child of it, so it can
      // span the row's grid columns. Left inside, it inherited the narrow
      // account column and a four-card capability grid stacked two-up beside a
      // column of empty space — over a thousand pixels tall for one holding.
      (hasDetail
        ? '          <div class="row-panel" id="' + panelId + '">\n' +
          '            <div class="row-panel-inner">\n' + panel.replace(/^ {14}/gm, '            ') +
          '            </div>\n          </div>\n'
        : '') +
      '        </article>';
  }).join('\n');
}

module.exports = { VENTURES, detailFor, renderRegister, esc };
