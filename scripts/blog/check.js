// Quality gate for blog posts. Run before publishing:
//   npm run blog:check                 every post
//   npm run blog:check -- <slug> ...   only these posts
//
// Errors (exit code 1) are hard rules: banned claims from seo/facts.md, em
// dashes, emoji, broken internal links or images, missing alt text, titles far
// over SERP limits. Warnings are judgement calls for the writer to look at.
//
// The filler and AI-pattern phrase lists are adapted from claude-seo's
// scripts/content_quality.py (MIT, https://github.com/AgriciDaniel/claude-seo).

import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPosts } from './build.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const STATIC_PATHS = new Set(['/', '/checklist', '/privacy', '/terms', '/support', '/get', '/blog']);
const REFRESH_AFTER_DAYS = 180;

const FILLER = [
  "it's important to note that", 'in this article', "in today's fast-paced world", "in today's digital age",
  'needless to say', 'at the end of the day', 'when it comes to', 'in the realm of', 'the bottom line is',
  'without further ado', 'first and foremost', 'last but not least', 'it goes without saying', 'as we all know',
  'the truth is that', 'the fact of the matter is', 'more often than not', "let's dive in", "let's take a closer look",
];
const AI_PATTERNS = [
  'delve', 'ever-evolving', 'ever-changing landscape', 'navigate the complexities', 'tapestry', 'embark on',
  'a testament to', 'a beacon of', 'cornerstone of', 'at the heart of', 'at its core', 'in essence,',
  'in conclusion,', 'ultimately,', 'moreover,', 'furthermore,', "it's worth noting", 'leverage', 'leveraging',
  'harness the power', 'unlock the potential', 'unlock the full potential', 'a world of possibilities',
  'elevate your', 'transform your', 'revolutionize', 'game-changer', 'game-changing', 'cutting-edge',
  'state-of-the-art', 'in summary,', 'to summarize,', 'in a nutshell', 'seamless', 'seamlessly',
];

async function bannedPhrases() {
  const facts = await readFile(join(ROOT, 'seo/facts.md'), 'utf8');
  const block = facts.match(/```banned\n([\s\S]*?)```/);
  if (!block) throw new Error('seo/facts.md: missing ```banned block');
  return block[1].split('\n').map((l) => l.trim().toLowerCase()).filter(Boolean);
}

const words = (text) => (text.match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) ?? []).length;

function plainText(markdown) {
  return markdown
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#*_`>]/g, ' ');
}

function findPhrases(text, phrases) {
  const lower = text.toLowerCase();
  return phrases.filter((p) => new RegExp(`(^|[^a-z])${p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(lower));
}

function checkPost(post, slugs, banned, today) {
  const errors = [];
  const warnings = [];
  const body = post.body;
  const copy = [
    post.title, post.seoTitle, post.headline, post.description, post.socialDescription,
    post.summary, post.lede, post.cta, ...post.faq.flatMap(({ q, a }) => [q, a]), body,
  ].filter(Boolean).join('\n');

  // Hard rules
  for (const phrase of findPhrases(copy, banned)) errors.push(`banned claim: "${phrase}" (seo/facts.md)`);
  if (copy.includes('—')) errors.push('em dash found; rewrite the sentence');
  if (/\p{Extended_Pictographic}/u.test(copy)) errors.push('emoji found');
  if (post.seoTitle.length > 70) errors.push(`seoTitle is ${post.seoTitle.length} chars; Google truncates past ~60`);
  if (post.description.length > 180) errors.push(`description is ${post.description.length} chars; keep under 160`);

  const links = [...body.matchAll(/(?<!!)\[[^\]]*\]\((\/[^)\s]*)\)|href="(\/[^"]*)"/g)].map((m) => m[1] ?? m[2]);
  for (const link of links) {
    const path = link.replace(/[#?].*$/, '') || '/';
    const ok = STATIC_PATHS.has(path) || (path.startsWith('/blog/') && slugs.has(path.slice(6)));
    if (!ok) errors.push(`broken internal link: ${link}`);
  }
  const images = [
    ...[...body.matchAll(/<img\b[^>]*>/g)].map((m) => ({
      src: m[0].match(/src="([^"]*)"/)?.[1],
      alt: m[0].match(/alt="([^"]*)"/)?.[1],
    })),
    ...[...body.matchAll(/!\[([^\]]*)\]\(([^)\s]+)/g)].map((m) => ({ src: m[2], alt: m[1] })),
  ];
  for (const { src, alt } of images) {
    if (src?.startsWith('/') && !existsSync(join(ROOT, 'public', src))) errors.push(`missing image: public${src}`);
    if (!alt) errors.push(`image without alt text: ${src}`);
  }
  if (post.image && !existsSync(join(ROOT, 'public', post.image))) errors.push(`missing og image: public${post.image}`);

  // Judgement calls
  if (post.seoTitle.length > 60 && post.seoTitle.length <= 70) warnings.push(`seoTitle is ${post.seoTitle.length} chars (aim for 50 to 60)`);
  if (post.description.length < 110 || (post.description.length > 160 && post.description.length <= 180)) {
    warnings.push(`description is ${post.description.length} chars (aim for 120 to 160)`);
  }
  if (copy.includes('–')) warnings.push('en dash found; use "to" or a hyphen');
  const filler = findPhrases(copy, FILLER);
  if (filler.length) warnings.push(`filler phrases: ${filler.join(', ')}`);
  const ai = findPhrases(copy, AI_PATTERNS);
  if (ai.length) warnings.push(`AI-sounding phrases: ${ai.join(', ')}`);

  if (post.keyword) {
    const kw = post.keyword.toLowerCase();
    const first100 = plainText(`${post.lede}\n${body}`).split(/\s+/).slice(0, 100).join(' ').toLowerCase();
    const missing = [
      ['seoTitle', post.seoTitle.toLowerCase().includes(kw)],
      ['title', post.title.toLowerCase().includes(kw)],
      ['description', post.description.toLowerCase().includes(kw)],
      ['first 100 words', first100.includes(kw)],
    ].filter(([, ok]) => !ok).map(([where]) => where);
    if (missing.length) warnings.push(`keyword "${post.keyword}" not in: ${missing.join(', ')} (fine if a close variant reads better)`);
  } else {
    warnings.push('no `keyword` in frontmatter; add the primary keyword from seo/keywords.yaml');
  }

  const paragraphs = body.split(/\n{2,}/).filter((p) => !/^\s*(#|-|\d+\.|<|!\[)/.test(p));
  const long = paragraphs.filter((p) => words(plainText(p)) > 120).length;
  if (long) warnings.push(`${long} paragraph(s) over 120 words; split so each passage stands alone`);

  const h2s = [...body.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
  if (h2s.length < 3) warnings.push(`only ${h2s.length} H2 sections`);
  if (!h2s.some((h) => h.trim().endsWith('?')) && !post.faq.length) {
    warnings.push('no question-style H2 and no faq; add at least one heading phrased the way people ask');
  }
  if (post.related.length + links.filter((l) => l.startsWith('/blog/')).length < 2) {
    warnings.push('fewer than 2 internal links to other posts');
  }
  if (!images.length) warnings.push('no screenshots or images in the body');

  const ageDays = Math.floor((today - new Date(`${post.updated}T00:00:00Z`)) / 86_400_000);
  if (ageDays > REFRESH_AFTER_DAYS) warnings.push(`last updated ${ageDays} days ago; refresh candidate`);

  return { errors, warnings, words: words(plainText(`${post.lede}\n${body}`)) };
}

const only = new Set(process.argv.slice(2));
const posts = await loadPosts();
const slugs = new Set(posts.map((p) => p.slug));
for (const slug of only) if (!slugs.has(slug)) throw new Error(`no post named ${slug}`);

const banned = await bannedPhrases();
const today = new Date();
let errorCount = 0;
let warningCount = 0;
for (const post of posts.filter((p) => !only.size || only.has(p.slug)).sort((a, b) => a.slug.localeCompare(b.slug))) {
  const { errors, warnings, words: count } = checkPost(post, slugs, banned, today);
  errorCount += errors.length;
  warningCount += warnings.length;
  const status = errors.length ? 'FAIL' : warnings.length ? 'warn' : 'ok';
  console.log(`\n${status}  ${post.slug}${post.draft ? ' (draft)' : ''}  ${count} words`);
  for (const e of errors) console.log(`  error  ${e}`);
  for (const w of warnings) console.log(`  warn   ${w}`);
}
console.log(`\n${errorCount} error(s), ${warningCount} warning(s)`);
process.exitCode = errorCount ? 1 : 0;
