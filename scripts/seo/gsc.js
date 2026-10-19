// Pulls Google Search Console data and writes the weekly SEO report.
//
//   npm run seo:gsc                   last 28 days vs the 28 before, plus index status
//   npm run seo:gsc -- --no-inspect   skip the URL Inspection calls
//   npm run seo:gsc -- --from seo/data/gsc/2026-10-16.json   re-render a saved snapshot
//
// Needs GSC_KEY_FILE (path to a service-account JSON key, kept outside the
// repo) in the environment or .env.local. Setup: seo/SETUP.md.
//
// Writes seo/data/gsc/<end-date>.json (raw rows) and seo/reports/<end-date>.md.

import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { loadPosts } from '../blog/build.js';
import { getAccessToken, googleApi } from './google.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const DATA_DIR = join(ROOT, 'seo/data/gsc');
const REPORT_DIR = join(ROOT, 'seo/reports');
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';

// Thresholds sized for a small, young site. Raise them as traffic grows.
const STRIKING = { minPosition: 4, maxPosition: 20, minImpressions: 10 };
const LOW_CTR = { maxPosition: 10, minImpressions: 50, maxCtr: 0.02 };
const NEW_QUERY_MIN_IMPRESSIONS = 5;
const BRAND = /re+mbr|reembr|dont ?forget app/i;
const SILENT_AFTER_DAYS = 21;
const WINDOW_DAYS = 28;
const DATA_LAG_DAYS = 3;

const day = (date) => date.toISOString().slice(0, 10);
const addDays = (iso, n) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return day(d);
};

async function fetchSnapshot(config, inspect) {
  const keyFile = process.env.GSC_KEY_FILE;
  if (!keyFile) throw new Error('GSC_KEY_FILE is not set. See seo/SETUP.md.');
  const { token, email } = await getAccessToken(keyFile, SCOPE);
  const property = encodeURIComponent(config.gscProperty);

  const end = addDays(day(new Date()), -DATA_LAG_DAYS);
  const start = addDays(end, -(WINDOW_DAYS - 1));
  const prevEnd = addDays(start, -1);
  const prevStart = addDays(prevEnd, -(WINDOW_DAYS - 1));

  const query = async (startDate, endDate) => {
    const body = await googleApi(
      token,
      `https://www.googleapis.com/webmasters/v3/sites/${property}/searchAnalytics/query`,
      { startDate, endDate, dimensions: ['page', 'query'], rowLimit: 25000 },
    ).catch((error) => {
      if (/403|permission/i.test(error.message)) {
        throw new Error(`${error.message}\nAdd ${email} as a user on ${config.gscProperty} in Search Console.`);
      }
      throw error;
    });
    return (body.rows ?? []).map((r) => ({
      page: r.keys[0],
      query: r.keys[1],
      clicks: r.clicks,
      impressions: r.impressions,
      position: r.position,
    }));
  };

  const snapshot = {
    property: config.gscProperty,
    generatedAt: new Date().toISOString(),
    current: { start, end, rows: await query(start, end) },
    previous: { start: prevStart, end: prevEnd, rows: await query(prevStart, prevEnd) },
    inspections: [],
  };

  if (inspect) {
    const posts = (await loadPosts()).filter((p) => !p.draft);
    const urls = [`${config.site}/`, `${config.site}/blog`, ...posts.map((p) => `${config.site}/blog/${p.slug}`)];
    for (const url of urls) {
      const body = await googleApi(token, 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
        inspectionUrl: url,
        siteUrl: config.gscProperty,
      });
      const r = body.inspectionResult?.indexStatusResult ?? {};
      snapshot.inspections.push({
        url,
        verdict: r.verdict,
        coverageState: r.coverageState,
        lastCrawlTime: r.lastCrawlTime,
        googleCanonical: r.googleCanonical,
      });
    }
  }
  return snapshot;
}

// --- analysis ---------------------------------------------------------------

const slugOf = (page) => {
  const path = new URL(page).pathname.replace(/\.html$/, '').replace(/\/$/, '');
  return path.startsWith('/blog/') ? path.slice(6) : null;
};

function aggregate(rows, keyFn) {
  const groups = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    if (key == null) continue;
    const g = groups.get(key) ?? { clicks: 0, impressions: 0, weightedPosition: 0, rows: [] };
    g.clicks += row.clicks;
    g.impressions += row.impressions;
    g.weightedPosition += row.position * row.impressions;
    g.rows.push(row);
    groups.set(key, g);
  }
  for (const g of groups.values()) {
    g.position = g.impressions ? g.weightedPosition / g.impressions : null;
    g.ctr = g.impressions ? g.clicks / g.impressions : 0;
  }
  return groups;
}

const totals = (rows) => aggregate(rows, () => 'all').get('all') ?? { clicks: 0, impressions: 0, ctr: 0, position: null };
const pct = (v) => `${(v * 100).toFixed(1)}%`;
const pos = (v) => (v == null ? '-' : v.toFixed(1));
const delta = (now, before) => {
  if (!before) return now ? 'new' : '-';
  const change = ((now - before) / before) * 100;
  return `${change >= 0 ? '+' : ''}${change.toFixed(0)}%`;
};
const tokens = (text) => new Set(text.toLowerCase().match(/[a-z0-9]+/g) ?? []);

function matchesKnownKeyword(query, keywords) {
  const q = tokens(query);
  return keywords.some((k) => {
    const kt = tokens(k);
    const shared = [...q].filter((t) => kt.has(t)).length;
    return shared / Math.min(q.size, kt.size) >= 0.6;
  });
}

function renderReport(snapshot, posts, backlog, today) {
  const { current, previous } = snapshot;
  const nowTotals = totals(current.rows);
  const prevTotals = totals(previous.rows);
  const bySlug = aggregate(current.rows, (r) => slugOf(r.page));
  const prevBySlug = aggregate(previous.rows, (r) => slugOf(r.page));
  const lines = [];
  const push = (...l) => lines.push(...l);

  push(
    `# SEO report ${current.end}`,
    '',
    `Search Console property \`${snapshot.property}\`. Window ${current.start} to ${current.end}, compared with ${previous.start} to ${previous.end}.`,
    'Positions are impression-weighted averages. Data lags about 3 days.',
    '',
    '## Totals',
    '',
    '| | This window | Previous | Change |',
    '|---|---|---|---|',
    `| Clicks | ${nowTotals.clicks} | ${prevTotals.clicks} | ${delta(nowTotals.clicks, prevTotals.clicks)} |`,
    `| Impressions | ${nowTotals.impressions} | ${prevTotals.impressions} | ${delta(nowTotals.impressions, prevTotals.impressions)} |`,
    `| CTR | ${pct(nowTotals.ctr)} | ${pct(prevTotals.ctr)} | |`,
    `| Avg position | ${pos(nowTotals.position)} | ${pos(prevTotals.position)} | |`,
    '',
    '## Blog posts',
    '',
    '| Post | Live since | Impr. | Change | Clicks | CTR | Pos. | Top query |',
    '|---|---|---|---|---|---|---|---|',
  );
  for (const post of [...posts].sort((a, b) => (bySlug.get(b.slug)?.impressions ?? 0) - (bySlug.get(a.slug)?.impressions ?? 0))) {
    const g = bySlug.get(post.slug);
    const p = prevBySlug.get(post.slug);
    const top = g ? aggregate(g.rows, (r) => r.query) : new Map();
    const topQuery = [...top.entries()].sort((a, b) => b[1].impressions - a[1].impressions)[0]?.[0] ?? '-';
    const since = post.updated !== post.published ? `${post.published} (upd. ${post.updated})` : post.published;
    push(
      `| ${post.slug} | ${since} | ${g?.impressions ?? 0} | ${delta(g?.impressions ?? 0, p?.impressions ?? 0)} | ${g?.clicks ?? 0} | ${pct(g?.ctr ?? 0)} | ${pos(g?.position)} | ${topQuery} |`,
    );
  }

  if (snapshot.inspections.length) {
    push('', '## Index status', '', '| URL | Verdict | Coverage | Last crawl |', '|---|---|---|---|');
    for (const i of snapshot.inspections) {
      push(`| ${i.url.replace(/^https:\/\/[^/]+/, '') || '/'} | ${i.verdict ?? '-'} | ${i.coverageState ?? '-'} | ${i.lastCrawlTime?.slice(0, 10) ?? 'never'} |`);
    }
  }

  push('', '## Opportunities', '');

  const pageQuery = aggregate(current.rows, (r) => `${r.page}\t${r.query}`);
  const striking = [...pageQuery.entries()]
    .filter(([, g]) => g.position >= STRIKING.minPosition && g.position <= STRIKING.maxPosition && g.impressions >= STRIKING.minImpressions)
    .sort((a, b) => b[1].impressions - a[1].impressions)
    .slice(0, 15);
  push(`### Striking distance (position ${STRIKING.minPosition} to ${STRIKING.maxPosition}, ${STRIKING.minImpressions}+ impressions)`, '');
  push(...(striking.length
    ? striking.map(([key, g]) => {
      const [page, query] = key.split('\t');
      return `- "${query}" on ${slugOf(page) ?? new URL(page).pathname}: position ${pos(g.position)}, ${g.impressions} impressions. Refresh: answer this query directly in its own section.`;
    })
    : ['- None yet.']));

  const lowCtr = [...bySlug.entries()]
    .filter(([, g]) => g.position <= LOW_CTR.maxPosition && g.impressions >= LOW_CTR.minImpressions && g.ctr < LOW_CTR.maxCtr)
    .sort((a, b) => b[1].impressions - a[1].impressions);
  push('', `### Low click-through (top ${LOW_CTR.maxPosition}, ${LOW_CTR.minImpressions}+ impressions, CTR under ${pct(LOW_CTR.maxCtr)})`, '');
  push(...(lowCtr.length
    ? lowCtr.map(([slug, g]) => `- ${slug}: ${g.impressions} impressions, CTR ${pct(g.ctr)}, position ${pos(g.position)}. Rewrite seoTitle and description to match the top queries.`)
    : ['- None yet.']));

  const known = [...(backlog.published ?? []), ...(backlog.ideas ?? [])].flatMap((e) => [e.keyword, ...(e.secondary ?? [])]);
  const byQuery = aggregate(current.rows, (r) => r.query);
  const uncovered = [...byQuery.entries()]
    .filter(([q, g]) => g.impressions >= NEW_QUERY_MIN_IMPRESSIONS && !BRAND.test(q) && !matchesKnownKeyword(q, known))
    .sort((a, b) => b[1].impressions - a[1].impressions)
    .slice(0, 15);
  push('', `### Queries not in the backlog (${NEW_QUERY_MIN_IMPRESSIONS}+ impressions)`, '');
  push(...(uncovered.length
    ? uncovered.map(([q, g]) => `- "${q}": ${g.impressions} impressions, position ${pos(g.position)}, landing on ${[...new Set(g.rows.map((r) => slugOf(r.page) ?? new URL(r.page).pathname))].join(', ')}. Consider adding to seo/keywords.yaml.`)
    : ['- None.']));

  const silent = posts.filter((p) => {
    const age = (today - new Date(`${p.published}T00:00:00Z`)) / 86_400_000;
    return age > SILENT_AFTER_DAYS && !bySlug.get(p.slug)?.impressions;
  });
  push('', `### Posts with no impressions after ${SILENT_AFTER_DAYS} days`, '');
  push(...(silent.length
    ? silent.map((p) => `- ${p.slug}: check index status above, add internal links from stronger posts, or rethink the keyword.`)
    : ['- None.']));

  return `${lines.join('\n')}\n`;
}

// --- main -------------------------------------------------------------------

const args = process.argv.slice(2);
const fromIndex = args.indexOf('--from');
const config = JSON.parse(await readFile(join(ROOT, 'seo/config.json'), 'utf8'));
const backlog = parseYaml(await readFile(join(ROOT, 'seo/keywords.yaml'), 'utf8'));
const posts = (await loadPosts()).filter((p) => !p.draft);

let snapshot;
if (fromIndex >= 0) {
  snapshot = JSON.parse(await readFile(resolve(args[fromIndex + 1]), 'utf8'));
} else {
  snapshot = await fetchSnapshot(config, !args.includes('--no-inspect'));
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(join(DATA_DIR, `${snapshot.current.end}.json`), `${JSON.stringify(snapshot, null, 1)}\n`);
}

await mkdir(REPORT_DIR, { recursive: true });
const reportPath = join(REPORT_DIR, `${snapshot.current.end}.md`);
await writeFile(reportPath, renderReport(snapshot, posts, backlog, new Date()));

const previousReports = (await readdir(REPORT_DIR)).filter((f) => f.endsWith('.md') && f !== `${snapshot.current.end}.md`).sort();
console.log(`seo: wrote ${reportPath.replace(`${ROOT}/`, '')}`);
if (previousReports.length) console.log(`seo: previous report seo/reports/${previousReports.at(-1)}`);
