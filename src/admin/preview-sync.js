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

// Store URL: auto-detect from current hostname or fallback to known URL
const STORE_URL = (() => {
  try {
    const host = window.location.hostname;
    // If admin is on a subdomain of dacewav.store, use the main store
    if (host.includes('dacewav.store')) return 'https://dacewav.store/';
    // If admin is on localhost, store is likely on localhost too (dev mode)
    if (host === 'localhost' || host === '127.0.0.1') return window.location.origin;
  } catch {}
  return 'https://dacewav.store/';
})();

const PM_ORIGIN = (() => {
  try { return new URL(STORE_URL).origin; } catch { return '*'; }
})();

let _iframeInited = false;

// Initialize iframe with store URL (called on load)
export function initPreviewIframe() {
  const frame = g('preview-frame');
  if (!frame) { console.warn('[PreviewSync] preview-frame not found'); return; }
  // Don't reload if already loaded with correct URL
  const currentSrc = frame.src || '';
  if (_iframeInited && currentSrc && !currentSrc.endsWith('about:blank')) return;
  _iframeInited = true;
  console.log('[PreviewSync] Loading store:', STORE_URL);

  // Detect iframe load errors (404, network issues, etc.)
  frame.addEventListener('error', function() {
    console.error('[PreviewSync] iframe failed to load:', STORE_URL);
    showToast('Preview: la tienda no cargó. Verifica el deploy de Cloudflare.', true);
  });

  // Detect successful load vs error page
  frame.addEventListener('load', function() {
    try {
      // If iframe loaded but shows a Cloudflare error page
      const frameDoc = frame.contentDocument;
      if (frameDoc) {
        const title = frameDoc.title || '';
        const body = frameDoc.body?.textContent || '';
        if (title.includes('Error') || body.includes('error code:') || body.includes('1926')) {
          console.warn('[PreviewSync] iframe loaded but shows error page');
          showToast('⚠️ Preview: la tienda muestra error ' + (body.match(/error code: (\d+)/)?.[1] || 'desconocido') + '. Verifica Cloudflare Pages.', true);
        }
      }
    } catch (e) {
      // Cross-origin — can't read content, which is normal (means store loaded)
      console.log('[PreviewSync] iframe loaded (cross-origin, OK)');
    }
  });

  frame.src = STORE_URL;
  // Also set the preview-url input
  const urlInput = g('preview-url');
  if (urlInput) urlInput.value = STORE_URL;
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
  const isOwnOrigin = e.origin === own;
  const isStoreOrigin = e.origin === PM_ORIGIN;
  const isWildcard = PM_ORIGIN === '*' || own === 'null';
  if (!isOwnOrigin && !isStoreOrigin && !isWildcard) return;
  const d = e.data; if (!d || !d.type) return;
  if (d.type === 'index-ready') {
    setIframeReady(true);
    broadcastTheme();
    showToast('Preview conectado ✓');
    console.log('[PreviewSync] Store connected, ver:', d.ver || 'unknown');
  }
  if (d.type === 'beat-update-ack') {
    // ACK from store — handled by beat-live-preview.js
    return;
  }
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
  // Update viewport buttons
  document.querySelectorAll('.preview-bar-center .vp-btn').forEach(b => b.classList.remove('on'));
  const btnMap = { mobile: 0, tablet: 1, desktop: 2 };
  const btns = document.querySelectorAll('.preview-bar-center .vp-btn');
  if (btns[btnMap[mode]]) btns[btnMap[mode]].classList.add('on');
}
