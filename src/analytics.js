// ═══ DACEWAV.STORE — Analytics ═══
import { state } from './state.js';
import { logError } from './error-handler.js';

const _eventQueue = [];
let _flushTimer = null;
const FLUSH_MS = 2000;

function getDate() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function _flushQueue() {
  if (!state.db || !_eventQueue.length) return;
  const batch = _eventQueue.splice(0, 20); // max 20 per flush
  const date = getDate();
  const updates = {};
  batch.forEach(ev => {
    const eventId = genId();
    updates[`analytics/events/${date}/${eventId}`] = ev;
    if (ev.lbl && (ev.act === 'beat_click' || ev.act === 'beat_modal_open' || ev.act === 'whatsapp_click')) {
      const field = ev.act === 'beat_click' ? 'clicks' : ev.act === 'beat_modal_open' ? 'views' : 'waClicks';
      state.db.ref(`analytics/counts/${ev.lbl}`).child(field).transaction((c) => (c || 0) + 1);
    }
  });
  state.db.ref().update(updates).catch((err) => logError('Analytics/flush', err));
  // Increment daily counters once per batch
  state.db.ref(`analytics/daily/${date}/total`).transaction((c) => (c || 0) + batch.length);
}

export function trackEvent(category, action, label, value) {
  if (!state.db) return;
  _eventQueue.push({
    ts: state.db.ServerValue?.TIMESTAMP || Date.now(),
    cat: category,
    act: action,
    lbl: label || '',
    val: value || 0,
  });
  // Debounce: batch events, flush after 2s of inactivity
  clearTimeout(_flushTimer);
  _flushTimer = setTimeout(_flushQueue, FLUSH_MS);
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
