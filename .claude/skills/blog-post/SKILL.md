---
name: blog-post
description: Write a new Reembr blog post, or refresh an existing one, aimed at ranking in Google and being cited by ChatGPT, Perplexity and AI Overviews. Picks a keyword from seo/keywords.yaml (or takes one), researches the live SERP, writes a brief, writes the markdown post, and runs the quality gate. Use when asked to "write a blog post", "next post", "refresh/improve a post", or "write about <keyword>".
argument-hint: "[keyword | slug to refresh]"
---

# Reembr blog post

Posts are markdown in `content/blog/` (format: `content/blog/README.md`). The build turns them into
pages, schema and the sitemap. This skill is the writing half of the SEO loop; the measuring half
writes to `seo/learnings.md`.

Ground rule, straight from Google's AI optimization guide: optimizing for AI search **is** SEO.
AI Overviews, AI Mode and ChatGPT search cite pages that already rank and that contain specific,
first-hand, quotable answers. There is no AI-only trick (no llms.txt, no "chunking for AI", no
keyword-variant rewriting). What wins is unique, non-commodity content from someone who actually
knows the subject. Reembr's edge is that we built a location-reminder app: we know exactly how
iOS and Android geofencing behave, where native reminders fail, and what people forget.

## 0. Read first (every time)

1. `seo/facts.md`: the only allowed source of product claims, plus banned phrases.
2. `seo/learnings.md`: what past posts taught us. Apply it.
3. `seo/keywords.yaml`: the backlog.
4. `content/blog/README.md`: frontmatter format.
5. Skim the titles of every post in `content/blog/` so you know what exists.

## 1. Pick the work

- **Argument is a keyword:** use it. If it is not in the backlog, add it first.
- **Argument is an existing slug, or the user says refresh/improve:** refresh mode (section 6).
- **No argument:** take the highest-priority `status: idea` entry. Ties: prefer the cluster with
  the fewest published posts, then commercial intent over informational.

Before writing anything new, check for **cannibalization**: if an existing post already targets
the same intent, refresh that post instead of creating a second page.

## 2. Research the live SERP

Use WebSearch (send the searches in one turn):

- The primary keyword, plus 2 or 3 of its `secondary` queries.
- Record the top results: who ranks (brand sites, Apple/Google support pages, listicles, Reddit,
  forums), what format wins (step list, comparison table, explainer), and People Also Ask
  questions.
- Read the 2 or 3 strongest real competitors with WebFetch. Note what they cover, what they get
  wrong or leave vague, and how dated they are.
- Reddit and forum threads are not competitors but are gold: they show the exact words people use
  and the problems they actually hit. Use the language, never copy the text.
- **SERP overlap test** for cannibalization: if 4 or more of the top 10 URLs also rank for an
  existing post's keyword, the topics belong together; 7 or more means it is the same page.

## 3. Write the brief

Save it to `seo/briefs/<slug>.md` (the loop uses these to explain later results):

```markdown
# Brief: <primary keyword>
Date: YYYY-MM-DD   Mode: new | refresh
## Search intent
<who searches this, what they want, what format Google rewards>
## SERP snapshot
<top results in one line each: domain, format, main gap>
## Information gain (required)
<what this post has that none of the top results have. Specific: tested steps on a named
iOS/Android version, real app screenshots, a checklist template, an honest limitation, a
first-hand explanation of how geofencing behaves. "More detail" or "better formatting" does
not count. If you cannot name real information gain, stop and tell the user.>
## Outline
<H2s (and H3s), each with the one question it answers>
## Internal links
<2 to 4 existing posts to link from the body, and 1 or 2 existing posts that should link back>
## Meta
seoTitle / description drafts
```

## 4. Write the post

Create `content/blog/<slug>.md`. Required frontmatter is in `content/blog/README.md`; always set
`keyword`. Use a new `surface` value: `blog_<short_name>`.

**Structure that gets ranked and cited:**

- **Answer first.** The `lede` answers the searcher's question directly in 2 or 3 sentences. AI
  answers quote mostly from the first third of a page.
- Each H2 opens with a one or two sentence direct answer, then the detail. Every section should
  make sense if quoted on its own: name the subject instead of saying "it" or "this".
- Phrase H2s the way people ask ("Why does my iPhone location reminder not go off?"), at least
  where it reads naturally. Use H3 for sub-steps.
- Paragraphs of 2 to 4 sentences. Numbered lists for steps, tables for comparisons.
- Specifics beat adjectives: OS versions, menu names, distances, settings, dates. Cite primary
  sources (Apple Support, Android docs, peer-reviewed studies) with outbound links when stating a
  fact that is not first-hand. Name the date for anything that changes ("as of iOS 26").
- `faq`: 2 to 4 real People Also Ask questions, answered in 40 to 60 words each. They render
  visibly as "Quick answers".
- Length is whatever fully answers the query better than the top results. There is no target word
  count; padding is a negative signal.

**Keyword placement** (natural, never stuffed): `seoTitle` near the front, `title` (H1), slug,
`description`, and the first 100 words. Use variants and synonyms elsewhere.

**Meta:** `seoTitle` 50 to 60 characters, no brand (the template appends " · Reembr").
`description` 120 to 160 characters, specific, active voice, no quotation marks.

**Reembr in the post:** mention it where it genuinely solves the reader's problem, usually once in
the body plus the `cta` box. Be fair to alternatives, including free native options; honesty is
what makes comparison content get cited. Every product claim must be in `seo/facts.md`.

**Voice:** plain, warm, specific, a little dry; a solo founder explaining something they know
well. No hype, no emoji, no em dashes (rewrite the sentence; do not swap in other punctuation).
Avoid the filler and AI-sounding phrases the checker flags.

**Images:** reuse screenshots in `public/blog/inline/` when they fit (figure markup in the
README). If the post needs a screenshot that does not exist, do not fake one: add an HTML comment
`<!-- TODO screenshot: ... -->` and list it for the founder.

**Internal links:** link 2 to 4 existing posts from the body with descriptive anchor text, set
`related` to the 3 closest posts, and add the new post to the `related` list (or body) of 1 or 2
existing posts so it is not orphaned.

## 5. Gate, then show

1. `npm run blog:check -- <slug>`: zero errors required. Fix warnings unless you can say why one
   does not apply.
2. `npm run build` must succeed.
3. Open the post in the preview (`landingpage` in `.claude/launch.json` at the workspace root,
   page `/blog/<slug>.html`) and check it renders: headings, lists, tables, figures, Quick answers.
4. Update the backlog entry: `status: drafted` (or `published` once the user approves and it
   ships), `slug`, `published` date, and a link to the brief.
5. Report to the user: the keyword, the information gain in one line, the word count, any
   checker warnings left, and any screenshot TODOs. Do not commit or push unless asked.

## 6. Refresh mode

For a post that is not performing, or is older than 6 months:

1. Read the post, its brief (if any) and its entry in `seo/learnings.md`.
2. Redo the SERP research. Find what the current top results answer that this post does not.
3. Keep what works, fix what is thin or outdated, add the missing sections. Do not rewrite a post
   from scratch when targeted changes will do. Keep the slug.
4. Set `updated` to today **only** for a meaningful content change. Bumping the date without real
   changes is a spam signal Google names explicitly.
5. Append a refresh note to the brief file, then run section 5.
