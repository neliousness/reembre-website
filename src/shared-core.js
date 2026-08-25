// Logic shared by every page: the full homepage experience (homepage.js)
// and the lightweight entry every other page loads (shared-entry.js) both
// import from here so there's one source of truth for analytics, CTA
// guarding, and the support form instead of two forks of the same code.
//
// This module has zero GSAP/Three.js/Lenis imports and no side effects at
// module scope — every export is a function (or config value) the caller
// invokes explicitly, so importing this file alone never touches the DOM.
import { initializeFirebase, trackFirebaseEvent } from './firebase.js';
import { resolveSupportEndpoint, validateSupportFields } from './support-form.js';
import { attributionEventParams } from './attribution.js';

// Where signups land: the waitlist forms and the /support endpoint mirrored
// from it. Swap via VITE_WAITLIST_ENDPOINT — own backend (e.g.
// /api/waitlist) or a third-party form URL. Left unset, forms work as a
// no-op success so the page is still demoable in dev.
export const waitlistEndpoint = import.meta.env.VITE_WAITLIST_ENDPOINT || '';
// Dedicated anti-abuse key sent as X-API-Key on both the waitlist and
// support endpoints. Baked into the public bundle by design — it only
// filters casual bots and is separate from the mobile app's key.
export const waitlistApiKey = import.meta.env.VITE_WAITLIST_API_KEY || '';

/* ---------------- analytics ---------------- */
export function trackEvent(name, parameters = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...parameters });
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, parameters);
  }
  if (typeof window.plausible === 'function') {
    window.plausible(name, { props: parameters });
  }
  void trackFirebaseEvent(name, parameters);
  window.dispatchEvent(new CustomEvent('reembr:analytics', {
    detail: { name, parameters },
  }));
}

// Wires the generic analytics click listener (data-analytics-event) and the
// delegated data-track UI-click logger. Needed on every page.
export function initAnalyticsListeners() {
  document.querySelectorAll('[data-analytics-event]').forEach((element) => {
    element.addEventListener('click', () => {
      trackEvent(element.dataset.analyticsEvent, {
        surface: element.dataset.analyticsSurface || 'unknown',
        store: element.dataset.analyticsStore || 'unknown',
        ...attributionEventParams(),
      });
    });
  });

  // Delegated UI-click logging: anything tagged with data-track logs a
  // `ui_click` (with its label) to analytics — incl. Firebase via trackEvent —
  // so we can see what people actually press. Works for elements added later.
  document.addEventListener(
    'click',
    (event) => {
      const el = event.target.closest('[data-track]');
      if (!el) return;
      trackEvent('ui_click', { element: el.dataset.track });
    },
    { passive: true },
  );
}

/* ---------------- store / beta CTA guard ---------------- */
// The store and beta URLs are baked into their hrefs at build time. If one
// is unset (empty, "#", or the literal %VITE_…% placeholder Vite leaves
// behind), stop the button from silently reloading the page and flag it
// clearly rather than shipping a dead link.
export function guardExternalCta(selector, envVar) {
  document.querySelectorAll(selector).forEach((cta) => {
    const href = cta.getAttribute('href') || '';
    const configured = href && href !== '#' && !href.startsWith('%');
    if (configured) return;
    cta.setAttribute('aria-disabled', 'true');
    cta.addEventListener('click', (event) => {
      event.preventDefault();
      console.warn(`[reembr] ${envVar} is not set — link is a placeholder.`);
    });
  });
}

/* ---------------- support form ---------------- */
// Shares the site's waitlist key; support lives at /api/support. Guarded on
// the form existing (it's currently a homepage-only modal), so calling this
// on a page without one is a safe no-op.
export function initSupportForm() {
  const supportForm = document.querySelector('[data-support-form]');
  if (!supportForm) return;

  const supportEndpoint = resolveSupportEndpoint({
    supportEndpoint: import.meta.env.VITE_SUPPORT_ENDPOINT || '',
    waitlistEndpoint,
  });

  const status = supportForm.querySelector('[data-support-status]');
  const button = supportForm.querySelector('button[type="submit"]');
  const setStatus = (message, kind) => {
    status.textContent = message;
    if (kind) status.dataset.kind = kind;
    else delete status.dataset.kind;
  };

  supportForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const topic = supportForm.topic.value;
    const email = supportForm.email.value.trim();
    const message = supportForm.message.value.trim();
    const validation = validateSupportFields({ topic, message });

    if (!validation.ok) {
      setStatus(validation.message, 'error');
      supportForm[validation.field]?.focus();
      return;
    }

    button.disabled = true;
    setStatus('Sending…', 'pending');
    trackEvent('support_submitted', { topic });

    try {
      if (supportEndpoint) {
        const response = await fetch(supportEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(waitlistApiKey ? { 'X-API-Key': waitlistApiKey } : {}),
          },
          body: JSON.stringify({ topic, email, message }),
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error?.message || `HTTP ${response.status}`);
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 400));
      }
      supportForm.reset();
      setStatus("Thanks, we got your message and will take a look.", 'success');
      trackEvent('support_succeeded', { topic });
    } catch (error) {
      button.disabled = false;
      setStatus('Something went wrong. Try again in a sec.', 'error');
      trackEvent('support_failed', { topic, message: String(error) });
    }
  });
}

export { initializeFirebase };
