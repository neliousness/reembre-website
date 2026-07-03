import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Draggable } from 'gsap/Draggable';
import Lenis from 'lenis';
import { createWorld } from './world.js';
import { initializeFirebase, trackFirebaseEvent } from './firebase.js';
import { resolveSupportEndpoint, validateSupportFields } from './support-form.js';

gsap.registerPlugin(ScrollTrigger, Draggable);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;
document.documentElement.classList.toggle('reduced', reduced);
document.documentElement.classList.toggle('js-anim', !reduced);

createWorld(document.querySelector('#scene'), { reducedMotion: reduced });
initializeFirebase();

/* ---------------- analytics ---------------- */
function trackEvent(name, parameters = {}) {
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

document.querySelectorAll('[data-analytics-event]').forEach((element) => {
  element.addEventListener('click', () => {
    trackEvent(element.dataset.analyticsEvent, {
      surface: element.dataset.analyticsSurface || 'unknown',
      store: element.dataset.analyticsStore || 'unknown',
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

/* ---------------- waitlist ---------------- */
// Where signups land. Swap via VITE_WAITLIST_ENDPOINT — own backend
// (e.g. /api/waitlist) or a third-party form URL. Left unset, the form
// works as a no-op success so the page is still demoable in dev.
const waitlistEndpoint = import.meta.env.VITE_WAITLIST_ENDPOINT || '';
// Dedicated anti-abuse key for the signup endpoint. Sent as X-API-Key. This is
// baked into the public bundle by design — it only filters casual bots and is
// separate from the mobile app's key.
const waitlistApiKey = import.meta.env.VITE_WAITLIST_API_KEY || '';

document.querySelectorAll('[data-waitlist]').forEach((form) => {
  const input = form.querySelector('input[name="email"]');
  const button = form.querySelector('button[type="submit"]');
  const status = form.querySelector('[data-waitlist-status]');
  const surface = form.dataset.surface || 'unknown';
  const platform = form.dataset.platform || 'unknown';

  function setStatus(message, kind) {
    status.textContent = message;
    if (kind) status.dataset.kind = kind;
    else delete status.dataset.kind;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = input.value.trim();
    if (!email || !input.checkValidity()) {
      setStatus('Hmm, that email looks off — mind checking it?', 'error');
      input.focus();
      return;
    }

    button.disabled = true;
    setStatus('Saving your spot…', 'pending');
    trackEvent('waitlist_signup_submitted', { surface, platform });

    try {
      if (waitlistEndpoint) {
        const response = await fetch(waitlistEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(waitlistApiKey ? { 'X-API-Key': waitlistApiKey } : {}),
          },
          body: JSON.stringify({ email, surface, platform }),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 450));
      }
      form.classList.add('is-done');
      setStatus("You're on the list. We'll email you the day it lands.", 'success');
      trackEvent('waitlist_signup_succeeded', { surface, platform });
    } catch (error) {
      button.disabled = false;
      setStatus('Something hiccuped — give it another try in a sec.', 'error');
      trackEvent('waitlist_signup_failed', { surface, platform, message: String(error) });
    }
  });
});

/* ---------------- beta CTA guard ---------------- */
// VITE_BETA_URL is baked into the href at build time. If it's unset (empty
// or the literal placeholder), stop the button from silently reloading the
// page and flag it clearly rather than shipping a dead link.
document.querySelectorAll('[data-beta-cta]').forEach((cta) => {
  const href = cta.getAttribute('href') || '';
  const configured = href && href !== '#' && !href.startsWith('%');
  if (!configured) {
    cta.setAttribute('aria-disabled', 'true');
    cta.addEventListener('click', (event) => {
      event.preventDefault();
      console.warn('[reembr] VITE_BETA_URL is not set — beta link is a placeholder.');
    });
  }
});

/* ---------------- modals (support + privacy) ---------------- */
let lastFocusedBeforeModal = null;
function openModal(name) {
  const modal = document.getElementById(`modal-${name}`);
  if (!modal) return;
  lastFocusedBeforeModal = document.activeElement;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  window.lenis?.stop();
  trackEvent('modal_opened', { modal: name });
  modal.querySelector('select, input, textarea, button:not([data-close-modal])')?.focus();
}
function closeModal(modal) {
  if (!modal) return;
  modal.hidden = true;
  document.body.style.overflow = '';
  window.lenis?.start();
  lastFocusedBeforeModal?.focus?.();
}
document.querySelectorAll('[data-open-modal]').forEach((btn) => {
  btn.addEventListener('click', () => openModal(btn.dataset.openModal));
});
document.querySelectorAll('[data-close-modal]').forEach((el) => {
  el.addEventListener('click', () => closeModal(el.closest('.modal')));
});
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  const open = document.querySelector('.modal:not([hidden])');
  if (open) closeModal(open);
});

/* ---------------- support form ---------------- */
// Shares the site's waitlist key; support lives at /api/support.
const supportEndpoint = resolveSupportEndpoint({
  supportEndpoint: import.meta.env.VITE_SUPPORT_ENDPOINT || '',
  waitlistEndpoint,
});

const supportForm = document.querySelector('[data-support-form]');
if (supportForm) {
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
      setStatus("Thanks — we got your message and will take a look.", 'success');
      trackEvent('support_succeeded', { topic });
    } catch (error) {
      button.disabled = false;
      setStatus('Something went wrong — try again in a sec.', 'error');
      trackEvent('support_failed', { topic, message: String(error) });
    }
  });
}

/* ---------------- smooth scroll + anchors ---------------- */
let lenis = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.95 });
  window.lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (event) => {
    const href = anchor.getAttribute('href');
    if (href === '#') {
      // placeholder links (store badge, footer legal) — don't jump the page
      event.preventDefault();
      return;
    }
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    if (lenis) lenis.scrollTo(target, { duration: 1.1, offset: -76 });
    else target.scrollIntoView({ behavior: 'smooth' });
  });
});

/* ---------------- char splitter ---------------- */
function splitChars(element) {
  const text = element.textContent;
  element.textContent = '';
  element.setAttribute('aria-label', text);
  const chars = [];
  text.split(' ').forEach((word, index, words) => {
    const wordSpan = document.createElement('span');
    wordSpan.className = 'word';
    wordSpan.setAttribute('aria-hidden', 'true');
    [...word].forEach((char) => {
      const charSpan = document.createElement('span');
      charSpan.className = 'char';
      charSpan.textContent = char;
      wordSpan.appendChild(charSpan);
      chars.push(charSpan);
    });
    element.appendChild(wordSpan);
    if (index < words.length - 1) element.appendChild(document.createTextNode(' '));
  });
  return chars;
}

/* ---------------- springy intro ---------------- */
if (!reduced) {
  const heroChars = [];
  document.querySelectorAll('.hero [data-bounce]').forEach((line) => {
    heroChars.push(...splitChars(line));
  });
  gsap.set(heroChars, { scale: 0, rotation: () => gsap.utils.random(-24, 24), transformOrigin: '50% 80%' });

  const intro = gsap.timeline({ defaults: { ease: 'back.out(1.9)' } });
  intro
    .to(heroChars, { scale: 1, rotation: 0, duration: 0.7, stagger: 0.018 }, 0.1)
    .fromTo(
      '.hero [data-intro]',
      { opacity: 0, y: 22, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08 },
      0.45
    )
    .fromTo(
      '.chip',
      { opacity: 0, scale: 0 },
      { opacity: 1, scale: 1, duration: 0.65, stagger: 0.07, ease: 'back.out(2.4)' },
      0.55
    );

  // header backdrop blur once you scroll
  gsap.to('.site-header', {
    '--header-bg': 1,
    scrollTrigger: { trigger: '.hero', start: '60px top', end: '180px top', scrub: true },
  });
}

/* other bouncing section titles split + pop on scroll */
if (!reduced) {
  document.querySelectorAll('[data-bounce]').forEach((line) => {
    if (line.closest('.hero')) return;
    const chars = splitChars(line);
    gsap.set(chars, { scale: 0, rotation: () => gsap.utils.random(-18, 18), transformOrigin: '50% 80%' });
    ScrollTrigger.create({
      trigger: line,
      start: 'top 84%',
      once: true,
      onEnter: () =>
        gsap.to(chars, { scale: 1, rotation: 0, duration: 0.65, stagger: 0.016, ease: 'back.out(1.9)' }),
    });
  });

  gsap.utils.toArray('[data-pop]').forEach((element, index) => {
    gsap.fromTo(
      element,
      { opacity: 0, y: 36, scale: 0.92 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        delay: (index % 3) * 0.09,
        ease: 'back.out(1.7)',
        scrollTrigger: { trigger: element, start: 'top 88%', once: true },
      }
    );
  });
}

/* ---------------- grabbable floating chips ---------------- */
const chips = gsap.utils.toArray('.chip');
chips.forEach((chip, index) => {
  // --x/--y mark the chip's center; Draggable owns x/y on top of this.
  gsap.set(chip, { xPercent: -50, yPercent: -50 });

  let float = null;
  if (!reduced) {
    float = gsap.to(chip, {
      y: () => gsap.utils.random(-14, 14),
      x: () => gsap.utils.random(-8, 8),
      duration: () => gsap.utils.random(2.4, 3.6),
      delay: index * 0.2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  }

  Draggable.create(chip, {
    type: 'x,y',
    onPress() {
      float?.pause();
      gsap.to(chip, { scale: 1.15, duration: 0.2, ease: 'back.out(3)' });
    },
    onRelease() {
      // spring home like it's on a rubber band, then resume floating
      gsap.to(chip, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
      gsap.to(chip, {
        x: 0,
        y: 0,
        duration: 1.1,
        ease: 'elastic.out(1, 0.32)',
        onComplete: () => float?.restart(true),
      });
    },
  });
});

/* ---------------- squishy buttons ---------------- */
if (finePointer && !reduced) {
  document.querySelectorAll('[data-squish]').forEach((element) => {
    element.addEventListener('mouseenter', () =>
      gsap.to(element, { scale: 1.06, rotation: gsap.utils.random(-2, 2), duration: 0.35, ease: 'back.out(2.5)' })
    );
    element.addEventListener('mouseleave', () =>
      gsap.to(element, { scale: 1, rotation: 0, duration: 0.4, ease: 'back.out(2)' })
    );
    element.addEventListener('pointerdown', () =>
      gsap.to(element, { scale: 0.94, duration: 0.12, ease: 'power2.out' })
    );
    element.addEventListener('pointerup', () =>
      gsap.to(element, { scale: 1.06, duration: 0.3, ease: 'back.out(3)' })
    );
  });
}

/* ---------------- marquee ---------------- */
if (!reduced) {
  gsap.to('.marquee__track', { xPercent: -50, duration: 26, ease: 'none', repeat: -1 });
}

/* ---------------- phone: cursor tilt + scroll float ---------------- */
const phoneTilt = document.querySelector('.phone-tilt');
if (phoneTilt && finePointer && !reduced) {
  const section = document.querySelector('.try');
  section.addEventListener('mousemove', (event) => {
    const rect = section.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    gsap.to(phoneTilt, {
      rotationY: nx * 10,
      rotationX: -ny * 8,
      transformPerspective: 900,
      duration: 0.5,
      ease: 'power2.out',
    });
  });
  section.addEventListener('mouseleave', () => {
    gsap.to(phoneTilt, { rotationX: 0, rotationY: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
  });
}

/* =====================================================================
   Interactive phone mock — the real leaving flow:
   prompt -> running (tap to check) -> done (+ confetti), then reset.
   Mirrors LeavingPromptSheet stages from the Flutter app.
   ===================================================================== */
const CONFETTI = ['#d77226', '#f4a024', '#f7c272', '#fde2b6', '#e69a66'];

function confettiBurst(host, { count = 30, spread = 130, fall = 130 } = {}) {
  for (let i = 0; i < count; i += 1) {
    const piece = document.createElement('b');
    piece.style.background = CONFETTI[i % CONFETTI.length];
    host.appendChild(piece);
    const angle = Math.random() * Math.PI * 2;
    const distance = 70 + Math.random() * spread;
    gsap.fromTo(
      piece,
      { x: 0, y: 0, scale: 1, opacity: 1, rotation: 0 },
      {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance * 0.7 + fall,
        rotation: (Math.random() - 0.5) * 540,
        scale: 0.5,
        opacity: 0,
        duration: 1.1 + Math.random() * 0.5,
        ease: 'power1.out',
        onComplete: () => piece.remove(),
      }
    );
  }
}

const sheet = document.querySelector('.sheet');
const stages = {
  prompt: sheet.querySelector('.stage--prompt'),
  running: sheet.querySelector('.stage--running'),
  done: sheet.querySelector('.stage--done'),
};
const rows = [...sheet.querySelectorAll('[data-item]')];
const counter = sheet.querySelector('[data-counter]');
const completeBtn = sheet.querySelector('[data-complete]');
const confettiHost = document.querySelector('.confetti-host');
let resetTimer = null;

function showStage(name) {
  Object.entries(stages).forEach(([key, element]) => {
    element.hidden = key !== name;
  });
  sheet.dataset.stage = name;
  if (!reduced) {
    gsap.fromTo(stages[name], { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.28, ease: 'back.out(1.6)' });
  }
}

function syncRunning() {
  const checked = rows.filter((row) => row.classList.contains('is-checked')).length;
  counter.textContent = `${checked} of ${rows.length}`;
  const all = checked === rows.length;
  completeBtn.disabled = !all;
  completeBtn.textContent = all ? 'All set' : 'Mark as done';
}

function resetFlow() {
  clearTimeout(resetTimer);
  rows.forEach((row) => row.classList.remove('is-checked'));
  syncRunning();
  showStage('prompt');
}

sheet.querySelector('[data-start]').addEventListener('click', () => showStage('running'));

sheet.querySelector('[data-notnow]').addEventListener('click', () => {
  if (reduced) return;
  gsap
    .timeline()
    .to(sheet, { y: 26, duration: 0.22, ease: 'power2.in' })
    .to(sheet, { y: 0, duration: 0.55, ease: 'back.out(1.8)', delay: 0.3 });
});

rows.forEach((row) => {
  row.addEventListener('click', () => {
    row.classList.toggle('is-checked');
    if (!reduced && row.classList.contains('is-checked')) {
      gsap.fromTo(row, { scale: 0.96 }, { scale: 1, duration: 0.3, ease: 'back.out(2.6)' });
    }
    syncRunning();
  });
});

completeBtn.addEventListener('click', () => {
  if (completeBtn.disabled) return;
  showStage('done');
  confettiBurst(confettiHost);
  resetTimer = setTimeout(resetFlow, 6000);
});

sheet.querySelector('[data-close]').addEventListener('click', resetFlow);
syncRunning();

/* ---------------- one more confetti, please ---------------- */
const confettiBtn = document.querySelector('.confetti-btn');
const downloadConfettiHost = document.querySelector('.download__confetti');
confettiBtn?.addEventListener('click', () => {
  const rect = confettiBtn.getBoundingClientRect();
  const hostRect = downloadConfettiHost.getBoundingClientRect();
  downloadConfettiHost.style.setProperty('--ox', `${rect.left - hostRect.left + rect.width / 2}px`);
  for (let i = 0; i < 36; i += 1) {
    const piece = document.createElement('b');
    piece.style.background = CONFETTI[i % CONFETTI.length];
    piece.style.left = `${rect.left - hostRect.left + rect.width / 2}px`;
    piece.style.top = `${rect.top - hostRect.top}px`;
    downloadConfettiHost.appendChild(piece);
    const angle = Math.PI * (1 + Math.random()); // upward fan
    const distance = 90 + Math.random() * 180;
    gsap.fromTo(
      piece,
      { x: 0, y: 0, scale: 1, opacity: 1 },
      {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance + 230,
        rotation: (Math.random() - 0.5) * 640,
        scale: 0.5,
        opacity: 0,
        duration: 1.3 + Math.random() * 0.6,
        ease: 'power1.out',
        onComplete: () => piece.remove(),
      }
    );
  }
});
