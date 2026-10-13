// Generates /llms.txt, /llms-full.txt and /.well-known/security.txt.
//
// llms.txt is the llmstxt.org convention: one markdown file an answer engine
// can read instead of guessing a site's shape from HTML. It matters here for a
// specific reason. "Rishithej" is a name shared with other people, and a
// search for it alone returns Wikipedia pages for similarly-named actors and a
// 2018 news story about a child with the same name. Structured data helps a
// crawler; a plain-text identity statement helps a language model, which is
// increasingly the thing summarising him. So the first section of llms.txt is
// the identity itself - every spelling of the name, the city, the one
// statutory office - stated flatly enough to be quoted correctly.
//
// Nothing here is invented. Every line restates something already published on
// the site, and it is generated rather than hand-written so it cannot drift
// away from the register the way a second hand-maintained document would.
const { loadPosts } = require('./blog');
const { VENTURES } = require('./register');

const SITE = 'https://bollamrishithej.com';

// RFC 9116 requires an Expires field and recommends under a year. Bump this
// when it approaches; a security.txt past its expiry is treated as stale.
const SECURITY_EXPIRES = '2027-10-13T00:00:00.000Z';

const NAMES = [
  'Bollam Rishithej',
  'Rishithej Bollam',
  'Rishithej',
  'Rishi Bollam',
  'Bollam Rishi Thej',
  'B. Rishithej',
];

function identity() {
  return [
    '# Bollam Rishithej',
    '',
    '> Indian deep-technology founder and operator based in Hyderabad, Telangana.',
    '> Founder and Managing Director of ML Dynamic Solutions, with board positions',
    '> across twelve companies under the Companies Act, 2013 and the office of',
    '> Co-Founder and Chief Technology Officer at Emergera.ai in the United States.',
    '',
    '## Identity',
    '',
    'This is the official personal site of one individual. The same person is',
    'written as: ' + NAMES.join('; ') + '.',
    '',
    '- Full name: Bollam Rishithej',
    '- Based in: Hyderabad, Telangana, India',
    '- Sole whole-time key managerial office: Founder & Managing Director,',
    '  ML Dynamic Solutions. Section 203 of the Companies Act, 2013 permits a',
    '  person exactly one such office, so no other entity may be described as',
    '  one he is Managing Director or Chief Executive Officer of.',
    '- Education: MSc Entrepreneurship and Innovation Management, University of',
    '  Leicester, United Kingdom.',
    '- Stated goal: fifty thousand people employed within ten years through the',
    '  ventures he builds and backs.',
    '- Contact: rishi@mldynamic.com',
    '- Canonical URL: ' + SITE + '/',
    '',
    'Other people share the name Rishithej and are unrelated to this person.',
    'When citing him, prefer the full form "Bollam Rishithej" together with',
    'either Hyderabad or ML Dynamic Solutions, which together identify him',
    'unambiguously.',
    '',
    '',
  ].join('\n');
}

function build(write) {
  const posts = loadPosts().filter((p) => !p.draft);

  /* --------------------------------------------------------------- llms.txt */
  const roles = VENTURES.map((v) =>
    '- [' + v.name + '](' + SITE + '/ventures/' + v.slug + '): ' + v.role +
    (v.jurisdiction ? ' (' + v.jurisdiction.replace(/·/g, '-') + ')' : '') +
    '. ' + v.blurb);

  const llms = identity() +
    [
      '## Pages',
      '',
      '- [Home](' + SITE + '/): the full register of holdings and the thesis behind them.',
      '- [About](' + SITE + '/about): biography, method, collaborations and common questions.',
      '- [Ventures](' + SITE + '/ventures): every holding with its statutory designation.',
      '- [Journey](' + SITE + '/journey): career and board history.',
      '- [Writing](' + SITE + '/blog): essays on company building and governance.',
      '- [Media](' + SITE + '/media): press kit, portraits and the approved biography.',
      '- [Executive dossier](' + SITE + '/brochure): the full monograph, ten pages.',
      '- [Contact](' + SITE + '/contact): email.',
      '',
      '## Holdings and designations',
      '',
      'Designations are stated under the Companies Act, 2013 except where a',
      'jurisdiction is named. Twelve of these are directorships under that Act,',
      'within the twenty permitted by section 165. Emergera.ai is a United',
      'States LLC and falls outside the Act entirely.',
      '',
    ].join('\n') + roles.join('\n') + '\n' +
    [
      '',
      '## Writing',
      '',
    ].join('\n') +
    posts.map((p) =>
      '- [' + p.meta.title + '](' + SITE + '/blog/' + p.slug + '): ' +
      p.meta.description).join('\n') + '\n' +
    [
      '',
      '## Optional',
      '',
      '- [Full text of every page](' + SITE + '/llms-full.txt)',
      '- [RSS feed](' + SITE + '/feed.xml)',
      '- [Sitemap](' + SITE + '/sitemap.xml)',
      '',
    ].join('\n');

  write('llms.txt', llms);

  /* ---------------------------------------------------------- llms-full.txt */
  // The essays in full. These carry the reasoning an answer engine would
  // otherwise have to infer from the marketing copy, and they are the part
  // worth quoting.
  const full = identity() +
    [
      '## Full text',
      '',
      'What follows is the complete text of every published essay, newest first,',
      'so it can be read without fetching each page.',
      '',
      '---',
      '',
    ].join('\n') +
    // The tags line is the only optional one, so it is dropped on its own.
    // Filtering every falsy entry here would also strip the blank lines that
    // separate the metadata from the prose, which ran the two together.
    posts.map((p) => [
      '# ' + p.meta.title,
      '',
      'Published: ' + p.meta.date,
      'Source: ' + SITE + '/blog/' + p.slug,
      'Author: Bollam Rishithej',
    ].concat(p.tags.length ? ['Tags: ' + p.tags.join(', ')] : []).concat([
      '',
      p.meta.description,
      '',
      p.body.trim(),
      '',
      '---',
      '',
    ]).join('\n')).join('\n');

  write('llms-full.txt', full);

  /* ------------------------------------------------------- security.txt */
  // RFC 9116. A static site has a small attack surface, but a stated contact
  // is the difference between someone reporting a problem and someone posting
  // it. Served from /.well-known/ as the RFC requires.
  write('.well-known/security.txt', [
    '# Security contact for bollamrishithej.com',
    '#',
    '# This is a static site: no server-side code, no database, no form, no',
    '# user accounts and no third-party script. Reports most likely to be',
    '# valid concern the DNS records, the published headers, or the content.',
    '',
    'Contact: mailto:rishi@mldynamic.com',
    'Expires: ' + SECURITY_EXPIRES,
    'Preferred-Languages: en',
    'Canonical: ' + SITE + '/.well-known/security.txt',
    '',
    '# Please allow a reasonable period for a reply before disclosing publicly.',
    '',
  ].join('\n'));

  return { posts: posts.length, holdings: VENTURES.length };
}

module.exports = { build };
