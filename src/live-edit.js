// ═══ DACEWAV.STORE — Live Edit Bridge ═══
// Handles postMessage (admin iframe) with ACK confirmation
// Single source of truth: Firebase + real-time sync

import { state } from './state.js';
import { applyTheme } from './theme.js';
import { applySettings, renderFloating } from './settings.js';
import { renderAll } from './cards.js';

let _lastThemeJSON = '';
let _lastSettingsJSON = '';
let _lastEmojisJSON = '';
let _lastFloatingJSON = '';

// Buffer for beat updates that arrive before beats are loaded from Firebase
const _pendingBeatUpdates = {};

function applyLiveUpdate(beatId, data, version) {
  const bi = state.allBeats.findIndex(x => x.id === beatId);
  if (bi === -1) {
    _pendingBeatUpdates[beatId] = { data, version };
    return false;
  }
  
  const currentVersion = state.allBeats[bi]._version || 0;
  if (version && version <= currentVersion) return false;
  
  // Direct assignment — cardStyle is single source of truth
  Object.assign(state.allBeats[bi], data);
  state.allBeats[bi]._version = version || Date.now();
  
  renderAll();
  return true;
}

// Call this after Firebase beats load to apply any buffered updates
export function flushPendingUpdates() {
  const ids = Object.keys(_pendingBeatUpdates);
  if (!ids.length) return;
  console.log('[LiveEdit] flushing', ids.length, 'buffered updates');
  ids.forEach(beatId => {
    const { data, version } = _pendingBeatUpdates[beatId];
    applyLiveUpdate(beatId, data, version);
    delete _pendingBeatUpdates[beatId];
  });
}

function applyLiveRevert(beatId, original) {
  const bi = state.allBeats.findIndex(x => x.id === beatId);
  if (bi === -1) return;
  Object.assign(state.allBeats[bi], original);
  state.allBeats[bi]._version = Date.now();
  renderAll();
  sendAck(beatId, state.allBeats[bi]._version);
}

// Send ACK back to admin to confirm update received
function sendAck(beatId, version) {
  if (window.parent && window.parent !== window) {
    try {
      window.parent.postMessage({ 
        type: 'beat-update-ack', 
        beatId, 
        version,
        ts: Date.now() 
      }, window.location.origin);
    } catch {}
  }
}

export function initLiveEditBridge() {
  // PostMessage bridge (admin iframe preview)
  window.addEventListener('message', (e) => {
    // Accept messages from: own origin, parent window (admin iframe), or 'null' origin
    const own = window.location?.origin || '*';
    const isParent = e.source === window.parent;
    const isOwnOrigin = e.origin === own;
    const isNull = e.origin === 'null';
    // In production, admin is on same origin or cross-origin iframe
    // In dev, admin could be on localhost:PORT
    if (!isParent && !isOwnOrigin && !isNull) return;
    const d = e.data;
    if (!d || !d.type) return;

    if (d.type === 'admin-batch-update') {
      let changed = false;
      if (d.theme) { const j = JSON.stringify(d.theme); if (j !== _lastThemeJSON) { _lastThemeJSON = j; state.T = d.theme; applyTheme(state.T); changed = true; } }
      if (d.settings) { const j = JSON.stringify(d.settings); if (j !== _lastSettingsJSON) { _lastSettingsJSON = j; state.siteSettings = d.settings; applySettings(); changed = true; } }
      if (d.emojis) { const j = JSON.stringify(d.emojis); if (j !== _lastEmojisJSON) { _lastEmojisJSON = j; state.customEmojis = d.emojis; changed = true; } }
      if (d.elements) { const j = JSON.stringify(d.elements); if (j !== _lastFloatingJSON) { _lastFloatingJSON = j; state.floatingEls = d.elements; renderFloating(state.floatingEls); changed = true; } }
      if (changed) renderAll();
      return;
    }

    if (d.type === 'theme-update' && d.theme) {
      const j = JSON.stringify(d.theme); if (j === _lastThemeJSON) return; _lastThemeJSON = j;
      state.T = d.theme; applyTheme(state.T); renderAll();
    } else if (d.type === 'settings-update' && d.settings) {
      const j = JSON.stringify(d.settings); if (j === _lastSettingsJSON) return; _lastSettingsJSON = j;
      state.siteSettings = d.settings; applySettings(); renderAll();
    } else if (d.type === 'emojis-update' && d.emojis) {
      const j = JSON.stringify(d.emojis); if (j === _lastEmojisJSON) return; _lastEmojisJSON = j;
      state.customEmojis = d.emojis;
    } else if (d.type === 'floating-update' && d.elements) {
      const j = JSON.stringify(d.elements); if (j === _lastFloatingJSON) return; _lastFloatingJSON = j;
      state.floatingEls = d.elements; renderFloating(state.floatingEls);
    } else if (d.type === 'beat-update' && d.beatId && d.data) {
      const success = applyLiveUpdate(d.beatId, d.data, d.version);
      if (success) {
        sendAck(d.beatId, state.allBeats.find(b => b.id === d.beatId)?._version);
      }
    } else if (d.type === 'beat-revert' && d.beatId && d.original) {
      applyLiveRevert(d.beatId, d.original);
    } else if (d.type === 'global-card-style-update' && d.cardStyle) {
      // Store global card style in siteSettings — beatCard() merges it with individual styles
      // DON'T overwrite individual beat cardStyles (they have _customStyle flag)
      state.siteSettings = state.siteSettings || {};
      state.siteSettings.globalCardStyle = d.cardStyle;
      renderAll();
    }
  });

  // localStorage bridge removed - using only postMessage + Firebase as single source of truth
}
