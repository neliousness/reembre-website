# SEO loop setup (one time, founder)

Two connections need a person signed in to Google and Microsoft. Everything else is automated.

## 1. Google Search Console data (about 10 minutes)

The weekly measure routine reads Search Console with a read-only service account.

1. Open https://console.cloud.google.com/ and create a project (any name, e.g. `reembr-seo`).
2. **APIs & Services → Library**: enable **Google Search Console API**.
3. **IAM & Admin → Service Accounts → Create service account** (name `seo-reader`). Skip the
   optional role and user steps.
4. Open the new service account → **Keys → Add key → Create new key → JSON**. A file downloads.
5. Move it outside every repo:
   ```bash
   mkdir -p ~/.config/reembr && mv ~/Downloads/<the-file>.json ~/.config/reembr/gsc-key.json
   ```
6. Open https://search.google.com/search-console, pick the reembr.app property →
   **Settings → Users and permissions → Add user**. Paste the service account email
   (`seo-reader@<project>.iam.gserviceaccount.com`, shown in the key file as `client_email`)
   with **Restricted** permission.
7. Tell the scripts where the key is. In `apps/landingpage/.env.local` add:
   ```
   GSC_KEY_FILE=/Users/neliolucas/.config/reembr/gsc-key.json
   ```
   (`.env.local` is gitignored, and Vite only exposes `VITE_` variables to the site.)
8. If the property is a URL-prefix property rather than a domain property, change
   `gscProperty` in `seo/config.json` to `https://reembr.app/`.
9. Test: `npm run seo:gsc`. It writes `seo/reports/<date>.md`.

## 2. Bing Webmaster Tools (about 3 minutes)

ChatGPT search, Copilot and DuckDuckGo lean on Bing's index, and Bing is where IndexNow
submissions are reported.

1. Open https://www.bing.com/webmasters and sign in.
2. Choose **Import from Google Search Console** and pick reembr.app. This verifies the site and
   submits the sitemap.
3. Under **IndexNow** you will see the URLs our script submits (key file:
   `public/<indexNowKey>.txt`, already deployed).

## 3. Already done (no action)

- IndexNow key generated and deployed; `npm run seo:indexnow` submits changed URLs.
- `robots.txt` allows all crawlers, including OAI-SearchBot (ChatGPT search) and PerplexityBot.
- Weekly scheduled tasks: `reembr-seo-measure` (Mon 04:30) and `reembr-seo-post` (Tue 04:30).
  They run while the Claude app is open; a missed run starts the next time it opens.
