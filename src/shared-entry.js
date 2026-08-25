// Lightweight entry point for every page except the homepage: legal/support
// pages and blog posts. No GSAP, no Three.js, no Lenis — just the analytics
// plumbing, CTA guarding, Firebase init, and the support form handler, all
// sourced from shared-core.js so there's a single implementation shared
// with the full homepage bundle (homepage.js).
import './style.css';
import { initializeFirebase, initAnalyticsListeners, guardExternalCta, initSupportForm } from './shared-core.js';
import { captureAttribution, applyStoreAttribution } from './attribution.js';

initializeFirebase();
initAnalyticsListeners();
captureAttribution();
applyStoreAttribution('[data-store-cta]');
guardExternalCta('[data-store-cta]', 'VITE_APP_STORE_URL');
guardExternalCta('[data-beta-cta]', 'VITE_BETA_URL');
initSupportForm();
