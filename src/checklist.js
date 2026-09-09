// Entry point for /checklist, the free leaving-checklist builder. This is a
// static, no-backend tool: everything the visitor adds lives in this
// browser's localStorage only, never sent anywhere. Still wires the same
// analytics/CTA-guarding plumbing every other page uses, from shared-core.js,
// so store-CTA clicks and attribution are tracked consistently site-wide.
import './style.css';
import { initializeFirebase, initAnalyticsListeners, guardExternalCta, trackEvent } from './shared-core.js';
import { captureAttribution, applyStoreAttribution } from './attribution.js';

initializeFirebase();
initAnalyticsListeners();
captureAttribution();
applyStoreAttribution('[data-store-cta]');
guardExternalCta('[data-store-cta]', 'VITE_APP_STORE_URL');

const STORAGE_KEY = 'reembr_checklist_items';

const DEFAULT_ITEMS = [
  { id: 'keys', label: 'Keys', checked: false },
  { id: 'wallet', label: 'Wallet', checked: false },
  { id: 'phone', label: 'Phone', checked: false },
  { id: 'charger', label: 'Charger', checked: false },
];

const CHECKMARK_SVG =
  '<svg viewBox="0 0 24 24"><path d="M5 12.5 10 17.5 19 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function loadItems() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ITEMS.map((item) => ({ ...item }));
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_ITEMS.map((item) => ({ ...item }));
    }
    return parsed;
  } catch (error) {
    // Private browsing, blocked storage, or corrupt JSON: fall back to the
    // defaults rather than breaking the page.
    return DEFAULT_ITEMS.map((item) => ({ ...item }));
  }
}

function saveItems(items) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    // Storage unavailable: the list still works for this page view, it just
    // won't persist across visits. Nothing to surface to the user for this.
  }
}

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

function render(items, list) {
  list.innerHTML = '';
  items.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'checklist-row';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = `check-row${item.checked ? ' is-checked' : ''}`;
    button.innerHTML = `<span class="check-row__box">${CHECKMARK_SVG}</span><b>${escapeHtml(item.label)}</b>`;
    button.addEventListener('click', () => {
      items[index].checked = !items[index].checked;
      saveItems(items);
      render(items, list);
    });

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'checklist-remove';
    remove.setAttribute('aria-label', `Remove ${item.label}`);
    remove.textContent = '×';
    remove.addEventListener('click', () => {
      items.splice(index, 1);
      saveItems(items);
      render(items, list);
    });

    row.append(button, remove);
    list.append(row);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const list = document.querySelector('[data-checklist-list]');
  if (!list) return;

  const form = document.querySelector('[data-checklist-form]');
  const input = document.querySelector('[data-checklist-input]');
  const printButton = document.querySelector('[data-checklist-print]');

  const items = loadItems();
  render(items, list);

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const label = (input?.value || '').trim();
    if (!label) return;
    items.push({ id: `custom-${Date.now()}`, label, checked: false });
    saveItems(items);
    render(items, list);
    input.value = '';
    input.focus();
    trackEvent('ui_click', { element: 'checklist_item_added' });
  });

  printButton?.addEventListener('click', () => {
    trackEvent('ui_click', { element: 'checklist_print' });
    window.print();
  });
});
