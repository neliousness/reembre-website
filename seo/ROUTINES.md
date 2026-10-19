# Reembr SEO routines

Every scheduled SEO run starts here. Each scheduled task's prompt is a one-line pointer
("read seo/ROUTINES.md and run routine X"), so improving the loop means editing this folder,
never the schedule.

`<site>` below is the landing page repo: the folder that contains this `seo/` directory
(`apps/landingpage` in the DontForget workspace, its own git repo, remote
`neliousness/reembre-website`, deploys to reembr.app via Vercel on push to `main`).

**Ground rules for every routine**

- Nobody is watching. Never stop to ask: make the call, write down why, and report it.
- Product claims come only from `seo/facts.md`. Never invent quotes, reviews or numbers.
- Never fake freshness: only change a post's `updated` for a real content change.
- Never touch the app repo, accounts, Search Console settings, or anything outside `<site>`.
- `seo/config.json` → `publishMode` decides how new content ships:
  - `review` (default): content goes to a branch and a pull request; the founder merges it.
  - `auto`: content is committed to `main` and pushed, then submitted to IndexNow.

## The routines

| Routine | Scheduled task | When (local) | Writes to |
|---|---|---|---|
| **SEO measure** | `reembr-seo-measure` | Mondays 04:30 | `seo/reports/`, `seo/data/`, `seo/learnings.md`, `seo/keywords.yaml` |
| **SEO post** | `reembr-seo-post` | Tuesdays 04:30 | `content/blog/`, `seo/briefs/`, `seo/keywords.yaml` |

Order matters: measure on Monday decides what Tuesday's post run works on.
One post or refresh a week is deliberate. For a young site, quality and real information gain
beat volume, and Google treats mass-produced pages as spam. Raise the cadence only when
`seo/learnings.md` shows posts are getting indexed and earning impressions.

---

## Step 0 for every routine

1. `cd <site>`, `git checkout main`, `git pull --ff-only`. If the tree has uncommitted
   changes, stash them with a message naming the routine and mention it in the summary.
2. `npm install` if `node_modules` is missing.

## Routine: SEO measure

1. Step 0.
2. Run `npm run seo:gsc`.
   - If it fails with `GSC_KEY_FILE is not set` or an auth/permission error, Search Console is
     not connected yet (see `seo/SETUP.md`). Skip to step 6 and say so in the summary.
3. Read the new report in `seo/reports/`, the previous report, `seo/learnings.md`, and the
   briefs of any post published or refreshed in the last 8 weeks.
4. Append a dated entry to the Log in `seo/learnings.md`:
   - what moved (impressions, positions, clicks, index status), per post where it matters;
   - for posts published or refreshed 4+ weeks ago, whether the brief's bet paid off, and why
     you think so;
   - if a pattern holds across 2+ posts, add or edit a line under "Rules so far" (and delete
     rules the data contradicts).
5. Update `seo/keywords.yaml`:
   - striking-distance and low-CTR posts from the report: set `status: refresh` on the
     published entry with a `notes:` line saying what to fix;
   - posts not indexed after 3 weeks: `status: refresh`, note "indexing", and add internal
     links to them from 1 or 2 stronger posts in the same run (small edit, no `updated` bump);
   - queries from "Queries not in the backlog" that fit the product: add as `ideas` with the
     report as the signal;
   - re-rank `priority` if the data says a cluster is working.
6. Run `npm run seo:indexnow` (submits URLs whose sitemap `lastmod` changed since last time,
   including anything the founder merged this week).
7. Commit `seo/` (and any internal-link edits in `content/blog/`) to `main` with message
   `chore(seo): weekly measure <date>` and push. These files are not part of the built site
   except link edits, which are small and safe.
8. Summary: the headline numbers vs last week, what the loop learned, what Tuesday's post run
   should work on, any open SEO pull requests waiting for the founder, and whether Search
   Console is connected.

## Routine: SEO post

1. Step 0.
2. Check open pull requests: `gh pr list --label seo --state open`. If 2 or more are waiting,
   do not add a third: instead improve one of the open ones if the latest report suggests it,
   otherwise stop and report that review is the bottleneck.
3. Pick the work as the `blog-post` skill says (`.claude/skills/blog-post/SKILL.md` section 1):
   a `status: refresh` entry first, otherwise the best `idea`. Prefer what the latest
   `seo/learnings.md` entry recommends.
4. Run the `blog-post` skill end to end (research, brief, write, gate). Skip its preview step
   if no browser is available, but `npm run blog:check` (zero errors) and `npm run build` are
   mandatory. If the information gain can't be made real (for example it needs screenshots or
   testing on a device you don't have), pick the next item instead and note why in the backlog.
5. Ship according to `publishMode`:
   - `review`: `git checkout -b seo/<date>-<slug>`, commit the post, brief and backlog
     changes, `git push -u origin HEAD`, then
     `gh pr create --label seo --title "<New post|Refresh>: <title>" --body <summary>`.
     Create the `seo` label first if it doesn't exist. The body lists the keyword, the
     information gain, sources used, checker warnings left, and screenshot TODOs.
     Set the backlog entry to `status: drafted` with the PR URL in `notes`.
   - `auto`: commit to `main`, push, wait until the post URL returns 200 on reembr.app
     (poll every 15 seconds, up to 10 minutes), run `npm run seo:indexnow`, and move the
     backlog entry to `published`.
6. Return to `main`. Summary: what was written or refreshed, the keyword, the information gain
   in one line, the PR link or live URL, warnings left, and screenshot TODOs for the founder.

## Prompts for the scheduler

**SEO measure:**
> You are Reembr's weekly SEO measure routine. Read /Users/neliolucas/Desktop/Developer/Projects/DontForget/apps/landingpage/seo/ROUTINES.md and run the "SEO measure" routine exactly as it describes, starting with Step 0.

**SEO post:**
> You are Reembr's weekly SEO post routine. Read /Users/neliolucas/Desktop/Developer/Projects/DontForget/apps/landingpage/seo/ROUTINES.md and run the "SEO post" routine exactly as it describes, starting with Step 0.
