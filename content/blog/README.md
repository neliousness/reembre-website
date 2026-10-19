# Blog posts

One markdown file per post. The filename is the URL slug:
`content/blog/what-is-a-geofence-reminder.md` → `https://reembr.app/blog/what-is-a-geofence-reminder`.

`scripts/blog/build.js` turns these into `blog/<slug>.html`, `blog/index.html` and
`public/sitemap.xml`. Those outputs are generated and gitignored: edit the markdown, never the HTML.
`npm run dev` rebuilds on save; `npm run blog` builds once; `npm run blog:check` runs the quality gate.
Writing a new post or refreshing one: follow `.claude/skills/blog-post/SKILL.md`.

## Frontmatter

```yaml
---
title: What is a geofence reminder? A plain-English guide   # H1, blog card title, "Keep reading" link label
seoTitle: What Is a Geofence Reminder? A Plain-English Guide # <title> (+ " · Reembr"), og/twitter title. Keep under ~60 chars.
headline: Optional longer schema headline                   # BlogPosting headline; defaults to seoTitle
description: Meta description, ~150 chars.                  # also the schema description
socialDescription: Shorter og/twitter description.
summary: One or two sentences for the card on /blog.
keyword: what is a geofence reminder                        # primary keyword from seo/keywords.yaml; checked by npm run blog:check
tag: Explainer                                              # Explainer, Guide, How-to, Comparison, Privacy
published: 2026-08-24                                       # YYYY-MM-DD
updated: 2026-09-30                                         # optional; set when the post is meaningfully revised
image: /blog/og-geofence-explainer.jpg                      # optional 1200x630 JPEG in public/blog/; defaults to /og-image.png
lede: Intro paragraph under the H1.
cta: Paragraph in the download box at the end.
surface: blog_geofence_explainer                            # analytics surface for the store buttons
related:                                                    # slugs of other posts, shown under "Keep reading"
  - does-a-geofence-app-track-your-location
faq:                                                        # optional; rendered visibly as "Quick answers" + FAQPage schema
  - q: Is a geofence reminder the same as location tracking?
    a: No. ...
draft: true                                                 # optional; skipped by the build
---
```

## Body

Plain markdown starting at `##` (the H1 comes from `title`). Use `###` for subsections.
GitHub-style tables work and are styled.
For screenshots, use a raw HTML figure so width and height are set:

```html
<figure class="article-figure">
  <img
    src="/blog/inline/inline-trigger-mode.jpg"
    alt="Describe what the screenshot shows"
    loading="lazy"
    decoding="async"
    width="560"
    height="819"
  />
  <figcaption>Caption.</figcaption>
</figure>
```

No emoji and no em dashes in copy.
