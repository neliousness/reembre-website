// Tells Bing (and the other IndexNow engines: Yandex, Seznam, Naver) about new
// or changed pages so they recrawl within hours instead of weeks. ChatGPT
// search leans on Bing's index, so this is the cheapest lever for showing up there.
//
//   npm run seo:indexnow              submit URLs whose sitemap lastmod changed since the last run
//   npm run seo:indexnow -- --all     submit every URL in the sitemap
//   npm run seo:indexnow -- --dry-run show what would be submitted
//
// Run it after a deploy is live, never before: engines fetch the URLs soon after.
// The key file public/<indexNowKey>.txt must be deployed for submissions to count.

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const STATE = join(ROOT, 'seo/data/indexnow.json');

const args = new Set(process.argv.slice(2));
const config = JSON.parse(await readFile(join(ROOT, 'seo/config.json'), 'utf8'));
const { host } = new URL(config.site);
const keyLocation = `${config.site}/${config.indexNowKey}.txt`;

// Read the live sitemap so only deployed URLs are submitted.
const sitemap = await (await fetch(`${config.site}/sitemap.xml`, { cache: 'no-store' })).text();
const entries = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, block]) => ({
  url: block.match(/<loc>([^<]+)<\/loc>/)[1],
  lastmod: block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] ?? '',
}));

let state = {};
try {
  state = JSON.parse(await readFile(STATE, 'utf8'));
} catch {
  // first run
}

const changed = entries.filter((e) => args.has('--all') || state[e.url] !== e.lastmod);
if (!changed.length) {
  console.log('indexnow: nothing changed since the last submission');
  process.exit(0);
}
console.log(`indexnow: ${changed.length} URL(s)\n${changed.map((e) => `  ${e.url}`).join('\n')}`);
if (args.has('--dry-run')) process.exit(0);

const key = await (await fetch(keyLocation, { cache: 'no-store' })).text();
if (key.trim() !== config.indexNowKey) {
  throw new Error(`${keyLocation} is not live yet (or has the wrong content). Deploy first.`);
}

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key: config.indexNowKey, keyLocation, urlList: changed.map((e) => e.url) }),
});
// 200 = accepted, 202 = accepted, key validation pending.
if (response.status !== 200 && response.status !== 202) {
  throw new Error(`indexnow: HTTP ${response.status} ${await response.text()}`);
}
for (const e of changed) state[e.url] = e.lastmod;
await writeFile(STATE, `${JSON.stringify(state, null, 2)}\n`);
console.log(`indexnow: submitted (HTTP ${response.status})`);
