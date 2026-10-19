// HTML shells for the generated blog pages. Everything a post varies on comes
// from its markdown frontmatter (see content/blog/README.md); everything else
// lives here once.
//
// %VITE_...% placeholders are left untouched for Vite to substitute at build.

export const SITE = 'https://reembr.app';
const DEFAULT_IMAGE = '/og-image.png';

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function jsonLd(data) {
  const json = JSON.stringify(data, null, 2)
    .replace(/</g, '\\u003c')
    .split('\n')
    .map((line) => `      ${line}`)
    .join('\n');
  return `    <script type="application/ld+json">\n${json}\n    </script>`;
}

export function formatDate(iso) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

const PUBLISHER = {
  '@type': 'Organization',
  name: 'Reembr',
  logo: { '@type': 'ImageObject', url: `${SITE}/icon-512.png` },
};

function head({ title, description, canonical, ogType, ogTitle, ogDescription, image, extraMeta = '', schemas, style }) {
  const e = escapeHtml;
  const imageUrl = `${SITE}${image.path}`;
  const imageMeta = image.card
    ? `
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />`
    : '';
  return `<!doctype html>
<html lang="en" data-launch="%VITE_LAUNCH_MODE%" style="--header-bg: 1">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${e(title)}</title>
    <meta name="description" content="${e(description)}" />
    <link rel="canonical" href="${canonical}" />
    <meta name="robots" content="index, follow" />
    <meta name="theme-color" content="#fbf8f3" />

    <link rel="icon" type="image/svg+xml" href="/logo.svg" />
    <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/site.webmanifest" />

    <meta property="og:site_name" content="Reembr" />
    <meta property="og:type" content="${ogType}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:title" content="${e(ogTitle)}" />
    <meta property="og:description" content="${e(ogDescription)}" />
    <meta property="og:image" content="${imageUrl}" />${imageMeta}${extraMeta}
    <meta property="og:locale" content="en_US" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${e(ogTitle)}" />
    <meta name="twitter:description" content="${e(ogDescription)}" />
    <meta name="twitter:image" content="${imageUrl}" />

${schemas.map(jsonLd).join('\n')}

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="../src/style.css" />
    <style>${style}    </style>
  </head>
  <body>
    <header class="site-header">
      <a class="site-logo" href="/" aria-label="Reembr home">
        <img class="site-logo__mark" src="../logo.svg" alt="" width="31" height="30" />
        <span class="site-logo__word">reembr</span>
      </a>
      <nav class="site-nav" aria-label="Primary">
        <a href="/#how">How it works</a>
        <a href="/#try">Try it</a>
        <a href="/checklist">Free checklist</a>
        <a href="/blog">Blog</a>
      </nav>
      <a class="site-header__button" href="/#download">
        <span>Get the app</span>
      </a>
    </header>
`;
}

const FOOT = `
    <footer class="footer">
      <a class="site-logo" href="/" aria-label="Reembr home">
        <img class="site-logo__mark" src="../logo.svg" alt="" width="27" height="26" />
        <span class="site-logo__word">reembr</span>
      </a>
      <p>For everyone who has ever done the doorway pat-down. &copy; 2026 Reembr.</p>
      <nav aria-label="Footer">
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
      </nav>
    </footer>

    <script type="module" src="../src/shared-entry.js"></script>
  </body>
</html>
`;

const POST_STYLE = `
      .article-main { max-width: 680px; margin: 0 auto; padding: clamp(120px, 16vh, 160px) clamp(20px, 5vw, 24px) 100px; }
      .legal-back { display: inline-flex; align-items: center; gap: 6px; color: var(--muted); font-size: 0.9rem; font-weight: 600; margin-bottom: 28px; }
      .legal-back:hover { color: var(--brand); }
      .article-meta { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
      .article-tag {
        font-family: var(--display);
        font-weight: 700;
        font-size: 0.72rem;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--brand);
        background: var(--brand-faint);
        padding: 3px 10px;
        border-radius: 999px;
      }
      .article-date { color: var(--muted); font-size: 0.85rem; }
      .article-main h1 { font-family: var(--display); font-weight: 800; font-size: clamp(1.9rem, 4.6vw, 2.5rem); letter-spacing: -0.03em; line-height: 1.14; margin-bottom: 18px; }
      .article-lede { font-size: 1.08rem; color: var(--secondary); line-height: 1.6; margin-bottom: 34px; }
      .article-body h2 {
        font-family: var(--display);
        font-weight: 700;
        font-size: clamp(1.2rem, 2.8vw, 1.45rem);
        letter-spacing: -0.015em;
        margin-top: 40px;
        margin-bottom: 12px;
        color: var(--text);
      }
      .article-body h3 {
        font-family: var(--display);
        font-weight: 700;
        font-size: clamp(1.05rem, 2.4vw, 1.2rem);
        letter-spacing: -0.01em;
        margin-top: 28px;
        margin-bottom: 10px;
        color: var(--text);
      }
      .article-body p { color: var(--secondary); font-size: 1rem; line-height: 1.68; margin-bottom: 16px; }
      .article-body ol, .article-body ul { margin: 0 0 16px 1.3em; color: var(--secondary); font-size: 1rem; line-height: 1.68; }
      .article-body li { margin-bottom: 6px; }
      .article-cta {
        margin-top: 44px;
        padding: 28px;
        border-radius: 20px;
        background: var(--brand-faint);
        border: 1.5px solid var(--brand-soft);
      }
      .article-cta p { color: var(--text); font-size: 0.98rem; margin-bottom: 16px; }
      .article-cta .store-row { justify-content: flex-start; margin-top: 0; }
      .article-cta .store { min-height: 52px; padding: 8px 18px; }
      .article-cta .store svg { width: 20px; height: 20px; }
      .article-cta .store strong { font-size: 0.98rem; }
      .related { margin-top: 48px; padding-top: 28px; border-top: 1.5px solid var(--border); display: flex; flex-direction: column; gap: 6px; }
      .related p { color: var(--muted); font-size: 0.82rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px; }
      .related a { color: var(--brand); font-weight: 600; }
      .article-figure { margin: 28px 0; text-align: center; }
      .article-figure img {
        max-width: 100%;
        height: auto;
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(26, 26, 31, 0.14);
      }
      .article-figure figcaption {
        margin-top: 12px;
        color: var(--muted);
        font-size: 0.85rem;
      }
`;

const APPLE_ICON = `<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>`;
const PLAY_ICON = `<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M325.3 234.3 104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/></svg>`;

function storeRow(surface) {
  return `        <div class="store-row">
          <a class="store store--apple" href="%VITE_APP_STORE_URL%" target="_blank" rel="noopener" data-store-cta data-squish data-analytics-event="download_cta_clicked" data-analytics-surface="${surface}" data-analytics-store="app_store" aria-label="Download Reembr on the App Store">
            ${APPLE_ICON}
            <span><small>Download on the</small><strong>App Store</strong></span>
          </a>
          <a class="store store--google" href="https://play.google.com/store/apps/details?id=dev.dicemz.reembrapp" target="_blank" rel="noopener" data-store-cta data-squish data-analytics-event="download_cta_clicked" data-analytics-surface="${surface}" data-analytics-store="google_play" aria-label="Get Reembr on Google Play">
            ${PLAY_ICON}
            <span><small>Get it on</small><strong>Google Play</strong></span>
          </a>
        </div>`;
}

function indent(html, spaces) {
  const pad = ' '.repeat(spaces);
  return html
    .trim()
    .split('\n')
    .map((line) => (line ? pad + line : line))
    .join('\n');
}

export function renderPost(post, bodyHtml, faqHtml, relatedPosts) {
  const e = escapeHtml;
  const canonical = `${SITE}/blog/${post.slug}`;
  const image = post.image ? { path: post.image, card: true } : { path: DEFAULT_IMAGE, card: false };

  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.headline ?? post.seoTitle,
      description: post.description,
      image: `${SITE}${image.path}`,
      datePublished: post.published,
      dateModified: post.updated,
      author: { '@type': 'Organization', name: 'Reembr' },
      publisher: PUBLISHER,
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    },
  ];
  if (post.faq.length) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: post.faq.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    });
  }

  const related = relatedPosts.length
    ? `

      <div class="related">
        <p>Keep reading</p>
${relatedPosts.map((r) => `        <a href="/blog/${r.slug}">${e(r.title)} &rarr;</a>`).join('\n')}
      </div>`
    : '';

  return (
    head({
      title: `${post.seoTitle} · Reembr`,
      description: post.description,
      canonical,
      ogType: 'article',
      ogTitle: post.seoTitle,
      ogDescription: post.socialDescription,
      image,
      extraMeta: `
    <meta property="article:published_time" content="${post.published}" />${
      post.updated !== post.published
        ? `
    <meta property="article:modified_time" content="${post.updated}" />`
        : ''
    }`,
      schemas,
      style: POST_STYLE,
    }) +
    `
    <main class="article-main">
      <a class="legal-back" href="/blog">&larr; Back to the blog</a>
      <div class="article-meta">
        <span class="article-tag">${e(post.tag)}</span>
        <span class="article-date">${formatDate(post.published)}</span>
      </div>
      <h1>${e(post.title)}</h1>
      <p class="article-lede">${e(post.lede)}</p>

      <div class="article-body">
${indent(bodyHtml, 8)}${faqHtml ? `\n\n${indent(faqHtml, 8)}` : ''}
      </div>

      <div class="article-cta">
        <p>${e(post.cta)}</p>
${storeRow(post.surface)}
      </div>${related}
    </main>
` +
    FOOT
  );
}

const INDEX_STYLE = `
      .blog-main { max-width: 760px; margin: 0 auto; padding: clamp(120px, 16vh, 160px) clamp(20px, 5vw, 24px) 100px; }
      .blog-main h1 { font-family: var(--display); font-weight: 800; font-size: clamp(2.1rem, 5vw, 2.8rem); letter-spacing: -0.03em; margin-bottom: 10px; }
      .blog-main > p.blog-intro { color: var(--secondary); font-size: 1.02rem; line-height: 1.55; margin-bottom: 40px; max-width: 56ch; }
      .legal-back { display: inline-flex; align-items: center; gap: 6px; color: var(--muted); font-size: 0.9rem; font-weight: 600; margin-bottom: 28px; }
      .legal-back:hover { color: var(--brand); }
      .blog-list { display: flex; flex-direction: column; gap: 4px; }
      .blog-card {
        display: block;
        padding: 26px 4px;
        border-top: 1.5px solid var(--border);
        transition: transform 160ms ease;
      }
      .blog-list .blog-card:last-child { border-bottom: 1.5px solid var(--border); }
      .blog-card:hover { transform: translateX(4px); }
      .blog-card__meta { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
      .blog-card__tag {
        font-family: var(--display);
        font-weight: 700;
        font-size: 0.72rem;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--brand);
        background: var(--brand-faint);
        padding: 3px 10px;
        border-radius: 999px;
      }
      .blog-card__date { color: var(--muted); font-size: 0.82rem; }
      .blog-card h2 {
        font-family: var(--display);
        font-weight: 700;
        font-size: clamp(1.15rem, 2.6vw, 1.4rem);
        letter-spacing: -0.015em;
        margin-bottom: 6px;
        color: var(--text);
      }
      .blog-card p { color: var(--secondary); font-size: 0.95rem; line-height: 1.5; max-width: 62ch; }
      .blog-card__arrow { color: var(--brand); font-weight: 700; margin-left: 4px; }
`;

export function renderIndex(posts) {
  const e = escapeHtml;
  const canonical = `${SITE}/blog`;
  const cards = posts
    .map(
      (p) => `        <a class="blog-card" href="/blog/${p.slug}">
          <div class="blog-card__meta">
            <span class="blog-card__tag">${e(p.tag)}</span>
            <span class="blog-card__date">${formatDate(p.published)}</span>
          </div>
          <h2>${e(p.title)}<span class="blog-card__arrow">&rarr;</span></h2>
          <p>${e(p.summary)}</p>
        </a>`,
    )
    .join('\n\n');

  return (
    head({
      title: 'Blog · Reembr',
      description:
        'Practical, no-nonsense advice on remembering your keys, wallet, and everything else before you walk out the door, from the team behind Reembr.',
      canonical,
      ogType: 'website',
      ogTitle: 'Blog · Reembr',
      ogDescription:
        'Practical, no-nonsense advice on remembering your keys, wallet, and everything else before you walk out the door.',
      image: { path: DEFAULT_IMAGE, card: false },
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: 'Reembr Blog',
          url: canonical,
          description:
            'Practical advice on remembering your keys, wallet, and everything else before you walk out the door.',
          publisher: PUBLISHER,
          blogPost: posts.map((p) => ({
            '@type': 'BlogPosting',
            headline: p.headline ?? p.seoTitle,
            url: `${SITE}/blog/${p.slug}`,
            datePublished: p.published,
            dateModified: p.updated,
          })),
        },
      ],
      style: INDEX_STYLE,
    }) +
    `
    <main class="blog-main">
      <a class="legal-back" href="/">&larr; Back to reembr.app</a>
      <h1>The Reembr blog</h1>
      <p class="blog-intro">Notes on remembering your stuff before you're out the door, and why it's harder than it should be.</p>

      <div class="blog-list">
${cards}
      </div>
    </main>
` +
    FOOT
  );
}
