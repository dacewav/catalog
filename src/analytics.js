// ═══ DACEWAV.STORE — Analytics ═══
import { state } from './state.js';
import { logError } from './error-handler.js';

function getDate() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function trackEvent(category, action, label, value) {
  if (!state.db) return;
  const date = getDate();
  const eventId = genId();
  const event = {
    ts: state.db.ServerValue?.TIMESTAMP || Date.now(),
    cat: category,
    act: action,
    lbl: label || '',
    val: value || 0,
  };

  state.db.ref(`analytics/events/${date}/${eventId}`).set(event)
    .catch((err) => logError('Analytics/trackEvent', err));

  if (label && (action === 'beat_click' || action === 'beat_modal_open' || action === 'whatsapp_click')) {
    const field = action === 'beat_click' ? 'clicks' : action === 'beat_modal_open' ? 'views' : 'waClicks';
    state.db.ref(`analytics/counts/${label}`).child(field).transaction((c) => (c || 0) + 1);
  }

  state.db.ref(`analytics/daily/${date}/total`).transaction((c) => (c || 0) + 1);
  state.db.ref(`analytics/daily/${date}/actions/${action}`).transaction((c) => (c || 0) + 1);
}

export function initAnalytics() {
  if (!state.db) return;
  trackEvent('engagement', 'page_view', document.title);

  // Track search queries
  const si = document.getElementById('search-input');
  if (si) {
    let st;
    si.addEventListener('input', function () {
      clearTimeout(st);
      const q = this.value.trim();
      if (q.length >= 2) {
        st = setTimeout(() => trackEvent('engagement', 'search_query', q), 800);
      }
    });
  }

  // Auto-track WhatsApp clicks
  document.addEventListener('click', (e) => {
    const wa = e.target.closest('a[href*="wa.me"]');
    if (wa) trackEvent('beats', 'whatsapp_click', 'modal');
  });
}
