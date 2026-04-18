// ═══ DACEWAV Admin — Preview Sync ═══
// iframe communication, broadcast, viewport control

import { siteSettings, customEmojis, floatingEls, _iframeReady, setIframeReady } from './state.js';
import { g, showToast } from './helpers.js';
import { showSection } from './nav.js';

// Deps injected from core.js (circular import avoidance)
let _collectThemeFn;
export function setPreviewSyncDeps({ collectTheme }) { _collectThemeFn = collectTheme; }

let _broadcastTimer = null;
let _lastBroadcastJSON = '';

// Store URL: auto-detect or use known URL
const STORE_URL = (() => {
  // Known store URL — update if domain changes
  return 'https://dacewav.store/';
})();

const PM_ORIGIN = (() => {
  try { return new URL(STORE_URL).origin; } catch { return '*'; }
})();

// Initialize iframe with store URL (called on load)
export function initPreviewIframe() {
  const frame = g('preview-frame');
  if (!frame) return;
  // Don't reload if already loaded with correct URL
  if (frame.src && frame.src !== 'about:blank' && !frame.src.endsWith('about:blank')) return;
  frame.src = STORE_URL;
  // Also set the preview-url input
  const urlInput = g('preview-url');
  if (urlInput && !urlInput.value) urlInput.value = STORE_URL;
}

// Post to iframe with fallback: try specific origin first, then '*'
export function postToFrame(msg) {
  const frame = g('preview-frame');
  if (!frame || !frame.contentWindow) {
    console.warn('[PreviewSync] No frame found, message dropped:', msg.type);
    return;
  }
  try { frame.contentWindow.postMessage(msg, PM_ORIGIN); } catch {}
  if (PM_ORIGIN !== '*') { try { frame.contentWindow.postMessage(msg, '*'); } catch {} }
}

export function broadcastTheme() {
  clearTimeout(_broadcastTimer);
  _broadcastTimer = setTimeout(_doBroadcast, 150);
}

function _doBroadcast() {
  const theme = _collectThemeFn();
  const json = JSON.stringify(theme);
  if (json === _lastBroadcastJSON) return;
  _lastBroadcastJSON = json;
  postToFrame({
    type: 'admin-batch-update',
    theme,
    settings: siteSettings,
    emojis: customEmojis,
    elements: floatingEls
  });
}

export function broadcastThemeNow() {
  clearTimeout(_broadcastTimer);
  _lastBroadcastJSON = '';
  _doBroadcast();
}

export function broadcastHighlight(selector) { postToFrame({ type: 'highlight-element', selector }); }
export function clearHighlight() { if (_iframeReady) postToFrame({ type: 'clear-highlight' }); }

window.addEventListener('message', function (e) {
  // Accept messages from: same origin, store origin, or any origin when using '*'
  const own = window.location.origin;
  if (e.origin !== own && e.origin !== PM_ORIGIN && PM_ORIGIN !== '*' && own !== 'null') return;
  const d = e.data; if (!d || !d.type) return;
  if (d.type === 'index-ready') { setIframeReady(true); broadcastTheme(); showToast('Preview conectado ✓'); }
  if (d.type === 'element-clicked' && d.info) {
    const map = { 'hero-title': 'hero', 'hero-eyebrow': 'hero', 'hero-sub': 'hero', 'hero': 'hero', 'nav': 'layout', 'beat-card': 'elements', 'btn-lic': 'elements', 'wbar': 'elements', 'player-bar': 'layout' };
    for (const [sel, sec] of Object.entries(map)) { if (d.info.classes && d.info.classes.includes(sel)) { showSection(sec); break; } }
  }
});

export function refreshIframe() {
  setIframeReady(false);
  const f = g('preview-frame');
  if (f) { f.src = f.src; showToast('Recargando preview...'); }
}

export function loadPreviewURL() {
  const url = g('preview-url')?.value?.trim(); if (!url) return;
  const f = g('preview-frame'); if (f) f.src = url; showToast('Cargando: ' + url);
}

export function setViewport(mode) {
  var f = g('preview-frame'); if (!f) return;
  f.className = mode;
  var widths = { mobile: 375, tablet: 768, desktop: Math.max(400, Math.round(window.innerWidth * 0.5)) };
  var w = widths[mode] || 380;
  if (typeof window._syncPanel === 'function') window._syncPanel(w);
  else {
    var panel = g('preview-panel');
    if (panel) panel.style.width = w + 'px';
  }
  document.querySelectorAll('.preview-bar-center .vp-btn').forEach(b => b.classList.remove('on'));
  const btnMap = { mobile: 0, tablet: 1, desktop: 2 };
  document.querySelectorAll('.preview-bar-center .vp-btn')[btnMap[mode]]?.classList.add('on');
}
