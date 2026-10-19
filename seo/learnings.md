# SEO learnings

What the blog has taught us, newest first. The blog-post skill reads this before every post;
the weekly measurement step (Phase 3, Search Console) appends to it. Keep entries short:
date, what we saw, what we will do differently. Delete rules that stop being true.

## Rules so far

- Write posts that answer the query in the first 2 or 3 sentences; AI answers quote mostly from
  the top of a page.
- Every post needs real information gain from first-hand product knowledge. Commodity tips do
  not rank for a new, low-authority domain.
- Bump `updated` only for real content changes.

- Re-verify every third-party product claim (other apps' features, OS menus) against a current
  source before reusing it. Platform features get removed: Google Keep's location reminders
  disappeared in 2025 and our how-to kept recommending them for weeks.

## Log

### 2026-10-20: indexing is the bottleneck, not ranking

- Search Console, last 3 months: 44 impressions, 1 click, average position 46. Almost every
  query is a misspelling of "Reembr". Only best-apps (position 3, 1 impression) and why-forget
  (position 7, 1 impression) showed up for a real query.
- Page indexing: 5 indexed, 11 not. Never crawled ("Discovered - currently not indexed"):
  /blog, how-to-set, how-to-stop, remind-me, ways-to-remember, what-is-a-geofence, plus
  privacy/support/terms. The Keep post was "unknown to Google". URL Inspection shows
  "Referring page: None detected": Google found them only through the sitemap, last read 10/12.
- Requested indexing for /blog and the 6 blog posts above, done 2026-10-20 in Search Console.
- Next measure run: check whether they moved to Indexed. If they are still not crawled after 2
  weeks, the fix is links: from the homepage to specific posts (not only to /blog), and
  external mentions (Reddit answers, directories, the Instagram bio). More posts will not help
  until existing ones get crawled.
- www.reembr.app redirects with a temporary 307. Change it to a permanent redirect in Vercel
  domain settings so Google consolidates www and bare-domain signals.

### 2026-10-19: first loop run (Keep post + how-to refresh)

- Confirmed Google Keep location reminders were removed in the Keep to Google Tasks move
  (rollout from 2025-10-14, all accounts by January 2026). Two live posts recommended Keep.
- Published `google-keep-location-reminders` (new) and refreshed
  `how-to-set-a-location-reminder-iphone-android`; corrected the Keep claim in `best-apps-...`.
- Kept them as two pages: the Keep query's SERP is news articles, the how-to query's SERP is
  guides, with no overlap in the top results. They link to each other.
- Measure from about 2026-11-16 (4 weeks): impressions and position for "google keep location
  reminder" queries and for the how-to page before vs after the refresh.
- Two screenshot TODOs left for the founder (Samsung Reminder, iPhone Reminders location screen).

### 2026-10-19: baseline

- 8 posts live (published 2026-08-24 and 2026-09-09). No Search Console data wired in yet, so
  there are no ranking numbers to learn from.
- Posts are short: 370 to 750 words of body. The how-to post (iPhone and Android location
  reminders) is the thinnest and may be out of date on Google Keep; flagged `refresh` in
  `keywords.yaml`.
- The quality gate shows most posts do not use their primary keyword in the meta description or
  the first 100 words. Fix during refreshes, not in a bulk edit.
- Seed SERP research: the weakest SERPs in our space are native-app troubleshooting queries
  (old Apple Community and forum threads rank) and app comparisons (only App Store listings
  rank). Start there.
