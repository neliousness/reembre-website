// Campaign attribution for the store CTAs. A visitor arrives with
// ?utm_source=instagram&utm_campaign=... (a boosted post, a collab caption,
// an email), and this rewrites the App Store / Play Store buttons so the
// click carries that attribution into each store's own dashboard — plus
// tags our own `download_cta_clicked` event with it, since that fires in
// real time while both store dashboards are delayed and aggregate-only.
//
// No side effects at module scope (same rule as shared-core.js) — every
// export is a function the caller invokes explicitly.

const STORAGE_KEY = 'reembr:attribution';

// Apple-assigned identifiers for the Reembr App Store listing (App Store
// Connect > App Analytics > Campaigns). Fixed per app, not per campaign —
// only `ct` (the campaign token) varies.
const APPLE_PROVIDER_TOKEN = '128975432';
const APPLE_MEDIA_TYPE = '8';

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

// Reads utm_* off the current URL and persists it for the rest of the
// browser session (sessionStorage survives navigation to another page on
// the site, e.g. a blog post -> homepage, but not a new tab). A link
// without utm_source leaves any existing attribution alone rather than
// clearing it, so following an internal link mid-session doesn't erase how
// the visitor actually arrived.
export function captureAttribution() {
  const params = new URLSearchParams(window.location.search);
  const source = params.get('utm_source');
  if (!source) return;

  const attribution = {
    source: slugify(source),
    medium: slugify(params.get('utm_medium')),
    campaign: slugify(params.get('utm_campaign')),
    content: slugify(params.get('utm_content')),
  };

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // Private browsing / storage disabled — attribution just won't persist
    // past this page view, which still leaves the direct click tagged.
  }
}

export function getAttribution() {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Rewrites every matched CTA's href to carry the stored attribution into
// the destination store. No-ops (leaves the bare store link alone) when
// there's no attribution, so organic/direct traffic is unaffected, and
// skips any CTA that's still an unconfigured placeholder (empty, "#", or
// the literal %VITE_…% Vite leaves behind when the env var is unset) so it
// doesn't get flagged as "configured" by guardExternalCta afterwards.
export function applyStoreAttribution(selector = '[data-store-cta]') {
  const attribution = getAttribution();
  if (!attribution) return;

  document.querySelectorAll(selector).forEach((cta) => {
    const href = cta.getAttribute('href') || '';
    if (!href || href === '#' || href.startsWith('%')) return;

    let url;
    try {
      url = new URL(href, window.location.href);
    } catch {
      return;
    }

    const store = cta.dataset.analyticsStore;
    if (store === 'app_store') {
      const ct = slugify(`${attribution.source}-${attribution.campaign || attribution.medium || 'link'}`);
      url.searchParams.set('pt', APPLE_PROVIDER_TOKEN);
      url.searchParams.set('ct', ct);
      url.searchParams.set('mt', APPLE_MEDIA_TYPE);
    } else if (store === 'google_play') {
      // Play reads one opaque `referrer` param holding an inner query
      // string; build it unescaped and let URL/URLSearchParams percent-
      // encode it exactly once when the href is serialized below (encoding
      // it here first would double-encode when it's re-serialized).
      const referrer = [
        `utm_source=${attribution.source}`,
        attribution.medium && `utm_medium=${attribution.medium}`,
        attribution.campaign && `utm_campaign=${attribution.campaign}`,
        attribution.content && `utm_content=${attribution.content}`,
      ]
        .filter(Boolean)
        .join('&');
      url.searchParams.set('referrer', referrer);
    } else {
      return;
    }

    cta.setAttribute('href', url.toString());
  });
}

// Attribution fields to merge into an analytics event's parameters, or {}
// when nothing was captured this session.
export function attributionEventParams() {
  const attribution = getAttribution();
  if (!attribution) return {};
  return {
    utm_source: attribution.source,
    utm_medium: attribution.medium || undefined,
    utm_campaign: attribution.campaign || undefined,
    utm_content: attribution.content || undefined,
  };
}
