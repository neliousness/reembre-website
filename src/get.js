// /get: the one link for Instagram story stickers. An iPhone goes straight
// to the App Store and an Android phone straight to Google Play, each link
// carrying the visitor's utm_* attribution (App Store `ct`, Play `referrer`)
// via applyStoreAttribution. Desktop and unknown devices see both buttons.
import { initializeFirebase, trackEvent } from './shared-core.js';
import { captureAttribution, applyStoreAttribution, attributionEventParams } from './attribution.js';

const APP_STORE_FALLBACK = 'https://apps.apple.com/app/id6777085237';

function platform(ua = navigator.userAgent) {
  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  return 'other';
}

initializeFirebase();
captureAttribution();

const apple = document.querySelector('[data-get-store="ios"]');
const href = apple.getAttribute('href') || '';
if (!href || href.startsWith('%')) apple.setAttribute('href', APP_STORE_FALLBACK);   // env var unset in this build
applyStoreAttribution('[data-store-cta]');

const os = platform();
const target = document.querySelector(`[data-get-store="${os}"]`);
const status = document.querySelector('[data-get-status]');

if (target) {
  trackEvent('download_cta_clicked', {
    surface: 'get_redirect',
    store: os === 'ios' ? 'app_store' : 'google_play',
    ...attributionEventParams(),
  });
  // give the analytics beacon a moment, then hand over to the store
  setTimeout(() => window.location.replace(target.href), 350);
} else {
  status.textContent = 'Reembr is free on iPhone and Android.';
}
