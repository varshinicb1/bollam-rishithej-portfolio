// Builds /blog, /blog/<slug> and /feed.xml from src/posts/*.md.
// Called by src/build.js; nothing here is hand-edited in dist/.
const { loadPosts, esc, human } = require('./blog');
const { SITE, page, crumbJsonLd } = require('./shell');

const PERSON = { '@id': SITE + '/#person' };

function postCard(p) {
  return '        <article class="post-card">\n' +
    '          <p class="post-meta"><time datetime="' + p.meta.date + '">' + human(p.meta.date) + '</time>' +
      '<span class="post-dot" aria-hidden="true">&bull;</span>' + p.minutes + ' min read</p>\n' +
    '          <h2><a href="/blog/' + p.slug + '">' + esc(p.meta.title) + '</a></h2>\n' +
    '          <p class="post-standfirst">' + esc(p.meta.description) + '</p>\n' +
    (p.tags.length ? '          <div class="tags">' +
      p.tags.map((t) => '<span>' + esc(t) + '</span>').join('') + '</div>\n' : '') +
    '        </article>';
}

function build(write) {
  const all = loadPosts();
  const live = all.filter((p) => !p.draft);
  const trailFor = (extra) => [{ name: 'Home', path: '/' }, { name: 'Writing', path: '/blog' }].concat(extra || []);

  /* ---------------------------------------------------------- index */
  const blogTrail = trailFor();
  write('blog.html', page({
    title: 'Writing — Bollam Rishithej',
    description: 'Notes on deep technology, company building and corporate governance from Bollam Rishithej, founder and Managing Director of ML Dynamic Solutions.',
    path: '/blog',
    trail: blogTrail,
    jsonld: { '@context': 'https://schema.org', '@graph': [
      crumbJsonLd(blogTrail),
      { '@type': 'Blog', '@id': SITE + '/blog#blog', url: SITE + '/blog',
        name: 'Writing — Bollam Rishithej', author: PERSON, publisher: PERSON,
        inLanguage: 'en',
        blogPost: live.map((p) => ({ '@type': 'BlogPosting',
          '@id': SITE + '/blog/' + p.slug + '#post',
          headline: p.meta.title, url: SITE + '/blog/' + p.slug,
          datePublished: p.meta.date, author: PERSON })) },
    ] },
    body: '    <section class="page-head">\n' +
      '      <p class="section-no">[ WRITING ]</p>\n' +
      '      <h1>Writing</h1>\n' +
      '      <p class="page-lead">Notes on deep technology, company building and the governance that holds it together.</p>\n' +
      '    </section>\n' +
      (live.length
        ? '    <section class="post-list-section">\n      <div class="post-grid">\n' +
          live.map(postCard).join('\n') + '\n      </div>\n    </section>'
        : '    <section class="post-list-section">\n      <p class="page-lead">First pieces are in preparation.</p>\n    </section>'),
  }));

  /* ----------------------------------------------------------- posts */
  all.forEach((p) => {
    const url = SITE + '/blog/' + p.slug;
    const trail = trailFor([{ name: p.meta.title, path: '/blog/' + p.slug }]);
    write('blog/' + p.slug + '.html', page({
      title: esc(p.meta.title) + ' — Bollam Rishithej',
      description: p.meta.description.replace(/"/g, ''),
      path: '/blog/' + p.slug,
      noindex: p.draft,
      trail: trail,
      jsonld: { '@context': 'https://schema.org', '@graph': [
        crumbJsonLd(trail),
        { '@type': 'BlogPosting', '@id': url + '#post', url: url,
          headline: p.meta.title, description: p.meta.description,
          datePublished: p.meta.date, dateModified: p.meta.updated || p.meta.date,
          // The author IS the site's Person entity, by @id. That link is the
          // point: it ties every article back to one identity rather than
          // minting a fresh unconnected author node per post.
          author: PERSON, publisher: PERSON,
          inLanguage: 'en', isPartOf: { '@id': SITE + '/blog#blog' },
          mainEntityOfPage: { '@type': 'WebPage', '@id': url },
          keywords: p.tags.join(', ') || undefined,
          wordCount: p.body.split(/\s+/).filter(Boolean).length },
      ] },
      body: '    <section class="post-head">\n' +
        '      <p class="section-no">[ WRITING ]</p>\n' +
        '      <h1>' + esc(p.meta.title) + '</h1>\n' +
        '      <p class="post-standfirst">' + esc(p.meta.description) + '</p>\n' +
        '      <p class="post-meta"><time datetime="' + p.meta.date + '">' + human(p.meta.date) + '</time>' +
          '<span class="post-dot" aria-hidden="true">&bull;</span>' + p.minutes + ' min read' +
          '<span class="post-dot" aria-hidden="true">&bull;</span>Bollam Rishithej</p>\n' +
        (p.tags.length ? '      <div class="tags">' + p.tags.map((t) => '<span>' + esc(t) + '</span>').join('') + '</div>\n' : '') +
        '    </section>\n' +
        '    <article class="post-body">\n' + p.html + '\n    </article>\n' +
        '    <section class="venture-foot">\n' +
        '      <p class="venture-foot-note">More in <a href="/blog">writing</a>, the portfolio under <a href="/ventures">ventures</a>, and the full record in the <a href="/brochure">executive dossier</a>.</p>\n' +
        '    </section>',
    }));
  });

  /* ------------------------------------------------------------ feed */
  // A real feed is how writing travels: readers, aggregators and several
  // answer engines all consume it.
  const latest = live[0] ? live[0].meta.date : new Date().toISOString().slice(0, 10);
  const rfc = (d) => new Date(d + 'T09:00:00Z').toUTCString();
  write('feed.xml',
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n' +
    '  <channel>\n' +
    '    <title>Bollam Rishithej — Writing</title>\n' +
    '    <link>' + SITE + '/blog</link>\n' +
    '    <description>Notes on deep technology, company building and corporate governance.</description>\n' +
    '    <language>en</language>\n' +
    '    <lastBuildDate>' + rfc(latest) + '</lastBuildDate>\n' +
    '    <atom:link href="' + SITE + '/feed.xml" rel="self" type="application/rss+xml"/>\n' +
    live.map((p) =>
      '    <item>\n' +
      '      <title>' + esc(p.meta.title) + '</title>\n' +
      '      <link>' + SITE + '/blog/' + p.slug + '</link>\n' +
      '      <guid isPermaLink="true">' + SITE + '/blog/' + p.slug + '</guid>\n' +
      '      <pubDate>' + rfc(p.meta.date) + '</pubDate>\n' +
      '      <description>' + esc(p.meta.description) + '</description>\n' +
      '    </item>').join('\n') +
    (live.length ? '\n' : '') +
    '  </channel>\n</rss>\n');

  return { total: all.length, live: live.length, drafts: all.length - live.length };
}

module.exports = { build };
