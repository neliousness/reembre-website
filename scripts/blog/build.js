// Builds the blog from content/blog/*.md:
//   blog/<slug>.html     one page per post
//   blog/index.html      the listing
//   public/sitemap.xml   static pages + every post
//
// All three outputs are generated and gitignored; edit the markdown instead.
// Runs automatically from vite.config.js (dev and build). `npm run blog`
// runs it on its own.

import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { marked } from 'marked';
import { parse as parseYaml } from 'yaml';
import { escapeHtml, renderIndex, renderPost, SITE } from './templates.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const CONTENT_DIR = join(ROOT, 'content/blog');
const OUT_DIR = join(ROOT, 'blog');
const SITEMAP = join(ROOT, 'public/sitemap.xml');

// Non-blog pages, in sitemap order.
const STATIC_PAGES = [
  { path: '/', lastmod: '2026-09-09', changefreq: 'weekly', priority: '1.0' },
  { path: '/privacy', changefreq: 'monthly', priority: '0.3' },
  { path: '/terms', changefreq: 'monthly', priority: '0.3' },
  { path: '/support', changefreq: 'monthly', priority: '0.3' },
  { path: '/checklist', lastmod: '2026-09-09', changefreq: 'monthly', priority: '0.7' },
];

const REQUIRED = ['title', 'seoTitle', 'description', 'socialDescription', 'summary', 'tag', 'published', 'lede', 'cta', 'surface'];
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function parsePost(file, source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error(`${file}: missing --- frontmatter --- block`);
  const data = parseYaml(match[1]) ?? {};
  const slug = file.replace(/\.md$/, '');

  const missing = REQUIRED.filter((key) => !data[key]);
  if (missing.length) throw new Error(`${file}: missing frontmatter ${missing.join(', ')}`);
  for (const key of ['published', 'updated']) {
    if (data[key] !== undefined && !DATE.test(String(data[key]))) {
      throw new Error(`${file}: ${key} must be YYYY-MM-DD, got ${data[key]}`);
    }
  }

  return {
    ...data,
    slug,
    published: String(data.published),
    updated: String(data.updated ?? data.published),
    related: data.related ?? [],
    faq: data.faq ?? [],
    draft: data.draft === true,
    body: match[2],
  };
}

// FAQ entries are rendered on the page as well as in FAQPage schema: Google's
// structured data policy requires marked-up Q&A to be visible.
function renderFaq(faq) {
  if (!faq.length) return '';
  return [
    '<h2>Quick answers</h2>',
    ...faq.map(({ q, a }) => `<h3>${escapeHtml(q)}</h3>\n<p>${escapeHtml(a)}</p>`),
  ].join('\n');
}

function renderSitemap(posts) {
  const entry = ({ loc, lastmod, changefreq, priority }) =>
    [
      '  <url>',
      `    <loc>${loc}</loc>`,
      lastmod && `    <lastmod>${lastmod}</lastmod>`,
      `    <changefreq>${changefreq}</changefreq>`,
      `    <priority>${priority}</priority>`,
      '  </url>',
    ]
      .filter(Boolean)
      .join('\n');

  const newest = posts.map((p) => p.updated).sort().at(-1);
  const urls = [
    ...STATIC_PAGES.map((p) => ({ ...p, loc: `${SITE}${p.path}` })),
    { loc: `${SITE}/blog`, lastmod: newest, changefreq: 'weekly', priority: '0.8' },
    ...posts.map((p) => ({ loc: `${SITE}/blog/${p.slug}`, lastmod: p.updated, changefreq: 'monthly', priority: '0.6' })),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(entry).join('\n')}
</urlset>
`;
}

/** Generates every blog page and the sitemap. Returns the generated page paths. */
export async function buildBlog() {
  const files = (await readdir(CONTENT_DIR)).filter((f) => f.endsWith('.md') && f !== 'README.md');
  const all = await Promise.all(
    files.map(async (f) => parsePost(f, await readFile(join(CONTENT_DIR, f), 'utf8'))),
  );
  const posts = all
    .filter((p) => !p.draft)
    .sort((a, b) => b.published.localeCompare(a.published) || a.slug.localeCompare(b.slug));
  const bySlug = new Map(posts.map((p) => [p.slug, p]));

  await mkdir(OUT_DIR, { recursive: true });
  for (const stale of (await readdir(OUT_DIR)).filter((f) => f.endsWith('.html'))) {
    await rm(join(OUT_DIR, stale));
  }

  const pages = [];
  for (const post of posts) {
    const related = post.related.map((slug) => {
      const target = bySlug.get(slug);
      if (!target) throw new Error(`${post.slug}.md: related post "${slug}" does not exist`);
      return target;
    });
    const html = renderPost(post, marked.parse(post.body), renderFaq(post.faq), related);
    const out = join(OUT_DIR, `${post.slug}.html`);
    await writeFile(out, html);
    pages.push(out);
  }

  const index = join(OUT_DIR, 'index.html');
  await writeFile(index, renderIndex(posts));
  pages.push(index);

  await writeFile(SITEMAP, renderSitemap(posts));
  return pages;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const pages = await buildBlog();
  console.log(`blog: generated ${pages.length} pages and public/sitemap.xml`);
}
