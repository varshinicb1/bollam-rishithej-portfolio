// Notifies the IndexNow network (Bing, Yandex, Seznam, Naver, and therefore
// DuckDuckGo and the engines behind Copilot/ChatGPT search) that these URLs
// changed. Google does NOT participate in IndexNow, and its sitemap ping
// endpoint was deprecated in 2023 — Google can only be reached via Search
// Console, which needs an account login.
const fs = require('fs');
const path = require('path');

const HOST = 'bollamrishithej.com';
const SITE = 'https://' + HOST;
const key = fs.readdirSync(path.join(__dirname, '..', 'dist'))
  .find((f) => /^[0-9a-f]{32,}\.txt$/.test(f));
if (!key) { console.error('no IndexNow key file in dist/'); process.exit(1); }
const KEY = key.replace(/\.txt$/, '');

// Routes straight from the sitemap, so the two can never disagree.
const sitemap = fs.readFileSync(path.join(__dirname, '..', 'dist', 'sitemap.xml'), 'utf8');
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

(async () => {
  const body = { host: HOST, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList };
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });
  console.log('submitted %d urls -> HTTP %d %s', urlList.length, res.status, res.statusText);
  const text = await res.text();
  if (text.trim()) console.log('response:', text.slice(0, 300));
  urlList.forEach((u) => console.log('   ' + u.replace(SITE, '') || '/'));
})();
