// Shared page shell for every generated page. index.html and brochure.html stay
// hand-authored — they are bespoke — but everything else is emitted from here so
// the nav, head and footer can never drift apart across a dozen files.
const SITE = 'https://bollamrishithej.com';

const NAV_ITEMS = [
  ['/about', 'About'],
  ['/ventures', 'Ventures'],
  ['/journey', 'Journey'],
  ['/media', 'Media'],
  ['/contact', 'Contact'],
  ['/brochure', 'Dossier'],
];

function head({ title, description, path, image, imageAlt, jsonld, noindex }) {
  const url = SITE + path;
  const img = image || '/assets/bollam-rishithej-og-image.jpg';
  return `  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#f4f2ec" media="(prefers-color-scheme: light)">
  <meta name="color-scheme" content="light">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="author" content="Bollam Rishithej">
  <link rel="canonical" href="${url}">
  <meta name="robots" content="${noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1'}">
  <meta name="geo.region" content="IN-TG">
  <meta name="geo.placename" content="Hyderabad">
  <meta property="og:type" content="profile">
  <meta property="og:site_name" content="Bollam Rishithej">
  <meta property="og:locale" content="en_IN">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${SITE}${img}">
  <meta property="og:image:alt" content="${imageAlt || 'Bollam Rishithej, Founder and Managing Director of ML Dynamic Solutions'}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${SITE}${img}">
  <meta name="twitter:image:alt" content="${imageAlt || 'Bollam Rishithej'}">
  <link rel="icon" href="/favicon.ico?v=cd8db615" sizes="any">
  <link rel="icon" type="image/png" sizes="48x48" href="/assets/bollam-rishithej-icon-48.png?v=cd8db615">
  <link rel="icon" type="image/png" sizes="96x96" href="/assets/bollam-rishithej-icon-96.png?v=cd8db615">
  <link rel="icon" type="image/png" sizes="192x192" href="/assets/bollam-rishithej-icon-192.png?v=cd8db615">
  <link rel="apple-touch-icon" href="/assets/bollam-rishithej-apple-touch-icon.png?v=cd8db615">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="stylesheet" href="/styles.css">
  <script type="application/ld+json">
${JSON.stringify(jsonld, null, 2)}
  </script>
  <script>document.documentElement.classList.add('js');</script>`;
}

function nav(current) {
  const links = NAV_ITEMS.map(([href, label], i) =>
    `        <a href="${href}" class="nav-link${href === current ? ' active' : ''}"><span class="nav-idx">${String(i + 1).padStart(2, '0')}</span> ${label}</a>`
  ).join('\n');
  return `  <header class="nav" id="mainNav">
    <a class="mark" href="/" aria-label="Bollam Rishithej, home"><img src="/assets/bollam-rishithej-avatar.png?v=cd8db615" alt="Bollam Rishithej" class="mark-avatar" width="96" height="96" decoding="async"><span>Bollam Rishithej</span><i></i></a>
    <nav aria-label="Primary navigation" id="primaryNav">
      <div class="mobile-nav-top">
        <div class="mobile-nav-hud">
          <span><i class="pulse-dot"></i> HYDERABAD, IN</span>
          <span class="mobile-hud-time" id="mobileLiveTime">--:--:-- IST</span>
        </div>
        <button class="mobile-close-btn" id="mobileCloseBtn" aria-label="Close navigation menu"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="2" y1="2" x2="12" y2="12"></line><line x1="12" y1="2" x2="2" y2="12"></line></svg></button>
      </div>
      <div class="mobile-nav-links">
${links}
      </div>
      <div class="mobile-nav-footer">
        <span>&copy; 2026 Bollam Rishithej</span>
        <span>Hyderabad, India</span>
      </div>
    </nav>
    <div class="nav-actions">
      <button class="menu" aria-label="Open menu" aria-expanded="false" id="hamburgerBtn"><span></span><span></span></button>
    </div>
  </header>`;
}

function breadcrumbTrail(trail) {
  return `    <nav class="crumbs" aria-label="Breadcrumb">
${trail.map((c, i) => i === trail.length - 1
    ? `      <span aria-current="page">${c.name}</span>`
    : `      <a href="${c.path}">${c.name}</a><span class="crumb-sep" aria-hidden="true">/</span>`
  ).join('\n')}
    </nav>`;
}

function crumbJsonLd(trail) {
  return {
    "@type": "BreadcrumbList",
    "itemListElement": trail.map((c, i) => ({
      "@type": "ListItem", "position": i + 1, "name": c.name, "item": SITE + c.path
    }))
  };
}

function footer() {
  return `  <footer>
    <span>&copy; 2026 Bollam Rishithej</span>
    <span>Hyderabad, India</span>
    <a href="/">Home</a>
  </footer>`;
}

function page({ title, description, path, image, imageAlt, jsonld, noindex, trail, body }) {
  return `<!doctype html>
<html lang="en">
<head>
${head({ title, description, path, image, imageAlt, jsonld, noindex })}
</head>
<body class="subpage">
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="scroll-progress" id="scrollProgress" aria-hidden="true"></div>
  <div class="grain" aria-hidden="true"></div>
${nav(path)}
  <main id="main">
${trail ? breadcrumbTrail(trail) + '\n' : ''}${body}
  </main>
${footer()}
  <div class="toast" id="toast" role="status" aria-live="polite"><span class="toast-icon">&bull;</span><span id="toastMsg"></span></div>
  <script src="/script.js" defer></script>
</body>
</html>
`;
}

module.exports = { SITE, NAV_ITEMS, page, crumbJsonLd };
