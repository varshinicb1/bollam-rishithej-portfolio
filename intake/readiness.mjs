// Turns Rishithej's intake answers into a Wikipedia readiness report:
// which submission gates pass, and exactly what to change in the draft,
// on Wikidata (Q141734133) and on the site once he has answered.
//
// Usage:  node intake/pull.mjs && node intake/readiness.mjs
//         node intake/readiness.mjs path/to/answers.json
// Writes intake/received/readiness.md (git-ignored) and prints it.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = process.argv[2] || join(here, 'received', 'answers.json');
if (!existsSync(src)) {
  console.error(`No answers at ${src}. Run: node intake/pull.mjs`);
  process.exit(1);
}
const a = JSON.parse(readFileSync(src, 'utf8'));
const g = (path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), a);
const has = (v) => typeof v === 'string' ? v.trim() !== '' : v != null && v !== false;

// Sources that are his, or a company he holds a role in, never count as
// independent for Wikipedia's notability test, however good they look.
const CONNECTED = [
  'bollamrishithej.com', 'mldynamic.com', 'vidyuthlabs.co.in', 'predictera.com', 'firstsecure.ai',
  'denyfix.ai', 'cxoera.com', 'emergera.ai', 'linkedin.com', 'instagram.com', 'facebook.com',
  'x.com', 'twitter.com', 'youtube.com', 'medium.com', 'github.com', 'crunchbase.com', 'peekyou.com',
];
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, '').toLowerCase(); } catch { return ''; } };
const connected = (u) => { const h = host(u); return CONNECTED.some((d) => h === d || h.endsWith('.' + d)); };
// Press-release wires are paid placements even when they look like news.
const WIRE = ['prnewswire', 'businesswire', 'globenewswire', 'einpresswire', 'newswire', 'pr.com', 'openpr', 'prlog', 'issuewire'];
const wire = (u) => WIRE.some((w) => host(u).includes(w));

const gates = [];   // { name, status: 'PASS'|'BLOCKED'|'WAITING'|'INFO', detail[], actions[] }
const gate = (name, status, detail = [], actions = []) => gates.push({ name, status, detail, actions });

// 1. Independent coverage: the gate that decides whether the draft can be submitted at all.
{
  const rows = (Array.isArray(a.coverage) ? a.coverage : []).filter((c) => c && has(c.url));
  const usable = [], rejected = [];
  for (const c of rows) {
    const why = c.paid ? 'marked paid / sponsored / press release'
      : connected(c.url) ? `connected source (${host(c.url)})`
      : wire(c.url) ? `press-release wire (${host(c.url)})`
      : !/^https?:\/\//i.test(c.url) ? 'not a web link' : '';
    (why ? rejected : usable).push({ ...c, why });
  }
  const detail = [
    ...usable.map((c) => `usable (still read it before citing): ${c.publication || host(c.url)}, ${c.date || 'no date'} - ${c.url}`),
    ...rejected.map((c) => `not usable, ${c.why}: ${c.url}`),
  ];
  const n = usable.length;
  gate('Independent sources (need 2-3 substantial ones)', n >= 2 ? 'PASS' : rows.length ? 'BLOCKED' : 'WAITING',
    detail.length ? detail : ['none given yet'],
    n >= 2
      ? ['Read each source in full: it must discuss him in depth, not mention him in passing.',
         'Fill SOURCE-1..4 in security/wikipedia-draft.txt with {{cite news}} for the usable ones; drop any claim no source supports.']
      : ['Do NOT submit the draft. It would be declined and the decline stays on record.']);
  const le = g('coverageExtra.leicesterEmail');
  if (le) gate('University of Leicester alumni story', 'INFO', [`answer: ${le}`],
    le === 'yes' ? ['Follow up in two weeks; a le.ac.uk page would be the strongest single source.'] : []);
}

// 2. Date of birth: only publishable if he agrees AND a reliable source or his own publication carries it.
{
  const v = g('confirm.dobPublish');
  if (!v) gate('Date of birth (removed from the draft and Wikidata on 14 Oct 2026)', 'WAITING', ['no answer yet'],
    ['Leave it off both until he agrees AND a source publishes it.']);
  else if (v === 'no') gate('Date of birth', 'BLOCKED', ['he does not want it published'],
    ['Already removed from the draft and Wikidata. Ask a Wikimedia administrator to hide the old revisions that show it (revision deletion, privacy of a living person).']);
  else if (v === 'wrong') gate('Date of birth', 'BLOCKED', [`correction given: ${g('confirm.dobCorrection') || '(none typed)'}`],
    ['It is already off both pages; add the corrected date back only once a source carries it.']);
  else gate('Date of birth', 'INFO', ['he agrees to publication'],
    ['Re-add only with a source: one that prints it, or bollamrishithej.com/about once he publishes it there.',
     'Then restore birth_date in the draft infobox and P569 on Wikidata, each with that reference.']);
}

// 3. Titles, where company sites contradict the portfolio.
{
  const t = g('contradictions.mlDynamicTitle');
  const note = g('contradictions.mlDynamicTitleNote');
  const base = 'mldynamic.com says CEO (Founder: Rani Madhura Aknapuram; MD & CFO: Billa Sai Saketh Reddy); portfolio says Founder & MD';
  if (!t) gate('ML Dynamic Solutions title', 'WAITING', [base]);
  else if (t === 'ceo-as-company-site') gate('ML Dynamic Solutions title', 'BLOCKED', [base, 'he says: CEO, as the company site'],
    ['Draft lead + Career: "founder and managing director" -> "chief executive officer"; drop "founder" unless a source says so.',
     'src/register.js, og card, CLAUDE.md table, Wikidata description: Founder & MD -> CEO (CEO is still the sole s.203 KMP office).',
     'Emergera.ai /about says "Managing Director of ML Dynamic Solutions": ask Emergera to correct it.']);
  else if (t === 'founder-md-as-portfolio') gate('ML Dynamic Solutions title', 'BLOCKED', [base, 'he says: Founder & MD, as the portfolio'],
    ['Ask ML Dynamic to correct mldynamic.com/aboutus.html first; until it matches, Wikipedia reviewers will see the conflict.']);
  else gate('ML Dynamic Solutions title', 'BLOCKED', [base, `he says: ${note || '(explanation empty)'}`], ['Resolve with him directly before any edit.']);

  const what = g('contradictions.mlDynamicWhat');
  gate('What ML Dynamic does', what ? 'INFO' : 'WAITING',
    ['mldynamic.com: AI healthcare revenue-cycle management; portfolio: enterprise AI', ...(what ? [`he says: ${what}`] : [])],
    what ? ['Draft Career line currently says healthcare revenue-cycle management: align it with his answer.'] : []);

  const fs = g('contradictions.firstSecureTitle');
  gate('FirstSecure.ai title', fs ? 'INFO' : 'WAITING',
    ['firstsecure.ai: Co-Founder & CMO; portfolio: Co-Founder & Director', ...(fs ? [`he says: ${fs}`] : [])],
    fs ? ['Update src/register.js and the CLAUDE.md table to whichever is true; both can hold if he also has a board seat.'] : []);
}

// 4. Education.
{
  const e = a.education || {};
  const got = ['course', 'start', 'end', 'ceremony', 'dissertation', 'undergrad'].filter((k) => has(e[k]));
  gate('Education', got.length ? 'INFO' : 'WAITING', got.map((k) => `${k}: ${e[k]}`),
    got.length ? [
      ...(has(e.end) ? [`Wikidata: P69 University of Leicester (Q1333399) + P512 MSc (Q950900) + P582 end time ${e.end}.`] : []),
      ...(has(e.dissertation) ? ['Draft Education: the plastic-waste-to-fuel line must match the dissertation title, or go.'] : []),
    ] : []);
}

// 5. Smaller facts.
{
  const r = g('confirm.residence');
  gate('Residence (Wikidata P551 Hyderabad)', r ? 'INFO' : 'WAITING', r ? [`he says: ${r}`] : ['unconfirmed'],
    r ? [/hyderabad/i.test(r) ? 'Add P551 Hyderabad (Q1361) on Wikidata.' : `Draft lead says "based in Hyderabad": change to ${r}.`] : []);
  const ig = g('contradictions.instagram');
  gate('Instagram handle (Wikidata P2003)', ig ? 'INFO' : 'WAITING', ig ? [`he says: ${ig}`] : ['site: rishithej_bollam; PeekYou: bollam_rishithej'],
    ig ? ['Add P2003 with the confirmed handle only.'] : []);
  const dp = Object.entries(a.companies || {}).filter(([, c]) => c && c.dpiit).map(([s, c]) => `${s}: ${c.dpiit}`);
  gate('DPIIT recognition claims', dp.length ? 'INFO' : 'WAITING', dp.length ? dp : ['no answers'],
    ['Draft says "several of the companies are recognised" with a placeholder source: needs an independent or government (startupindia.gov.in) citation per company, or the sentence goes.']);
  const titles = Object.entries(a.companies || {}).filter(([, c]) => c && has(c.title)).map(([s, c]) => `${s}: ${c.title}`);
  if (titles.length) gate('Titles he corrected', 'INFO', titles,
    ['Check each against that company\'s own site, then update src/register.js and the CLAUDE.md table together.']);
}

// 6. Photographs for Wikimedia Commons.
{
  const removed = new Set(a.removedFiles || []);
  const files = Object.entries(a.files || {}).filter(([k]) => !removed.has(k));
  const free = files.filter(([, f]) => f.ccbysa === 'yes' || f.ccbysa === 'self');
  gate('Photo for Commons / infobox', free.length ? 'PASS' : files.length ? 'BLOCKED' : 'WAITING',
    files.map(([, f]) => `${f.name || '?'}: licence ${f.ccbysa || 'not answered'}, photographer ${f.photographer || 'not given'}`),
    free.length ? ['Upload to Commons under CC BY-SA 4.0. For a photographer\'s image they must send VRT permission (commons.wikimedia.org/wiki/Commons:VRT) themselves.',
      'Then add P18 on Wikidata and |image= in the draft infobox.'] : []);
}

// ---- report ---------------------------------------------------------------
const order = { BLOCKED: 0, WAITING: 1, PASS: 2, INFO: 3 };
gates.sort((x, y) => order[x.status] - order[y.status]);
const submittable = gates.every((x) => x.status !== 'BLOCKED' && !(x.status === 'WAITING' && /Independent|Date of birth|ML Dynamic Solutions title/.test(x.name)));
const lines = [
  `# Wikipedia readiness — ${new Date().toISOString().slice(0, 10)}`,
  '',
  `Answers saved ${a._savedAt || 'never'}; status: ${a.status || 'in progress'}.`,
  '',
  `**Draft can be submitted: ${submittable ? 'YES' : 'NO'}**`,
  '',
];
for (const x of gates) {
  lines.push(`## [${x.status}] ${x.name}`);
  for (const d of x.detail) lines.push(`- ${d}`);
  for (const ac of x.actions) lines.push(`- **Do:** ${ac}`);
  lines.push('');
}
const out = lines.join('\n');
const dest = join(here, 'received', 'readiness.md');
mkdirSync(dirname(dest), { recursive: true });
writeFileSync(dest, out);
console.log(out);
console.log(`(written to ${dest})`);
