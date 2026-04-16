// ═══ DACEWAV.STORE — Live Edit Bridge ═══
// Handles postMessage (admin iframe) and localStorage (cross-tab) live edit.
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

function applyLiveUpdate(beatId, data) {
  const bi = state.allBeats.findIndex(x => x.id === beatId);
  if (bi === -1) {
    // Beat not loaded yet — buffer for later
    _pendingBeatUpdates[beatId] = data;
    console.log('[LiveEdit] buffered update for', beatId, '(beats not loaded yet)');
    return;
  }
  if (data.cardStyle) {
    const cs = data.cardStyle;
    state.allBeats[bi].glowConfig = cs.glow || { enabled: false };
    state.allBeats[bi].cardAnim = cs.anim || null;
    state.allBeats[bi].accentColor = cs.style?.accentColor || '';
    state.allBeats[bi].cardBorder = cs.border || { enabled: false };
    state.allBeats[bi].shimmer = cs.style?.shimmer || false;
    console.log('[LiveEdit] cardStyle applied:', {
      glow: cs.glow?.enabled ? cs.glow.type : 'off',
      anim: cs.anim?.type || 'none',
      shimmer: !!cs.style?.shimmer,
      shadow: cs.shadow?.enabled ? 'on' : 'off',
      border: cs.border?.enabled ? 'on' : 'off',
      hover: Object.keys(cs.hover || {}).filter(k => cs.hover[k] && cs.hover[k] !== 1 && cs.hover[k] !== 0).length ? 'custom' : 'default'
    });
  }
  Object.assign(state.allBeats[bi], data);
  renderAll();
}

// Call this after Firebase beats load to apply any buffered updates
export function flushPendingUpdates() {
  const ids = Object.keys(_pendingBeatUpdates);
  if (!ids.length) return;
  console.log('[LiveEdit] flushing', ids.length, 'buffered updates');
  ids.forEach(beatId => {
    applyLiveUpdate(beatId, _pendingBeatUpdates[beatId]);
    delete _pendingBeatUpdates[beatId];
  });
}

function applyLiveRevert(beatId, original) {
  const bi = state.allBeats.findIndex(x => x.id === beatId);
  if (bi === -1) return;
  Object.assign(state.allBeats[bi], original);
  renderAll();
}

export function initLiveEditBridge() {
  // PostMessage bridge (admin iframe preview)
  window.addEventListener('message', (e) => {
    const own = window.location?.origin || '*';
    if (e.origin !== own && e.origin !== 'https://dacewav.store' && e.origin !== 'null') {
      if (e.source !== window.parent) return;
    }
    const d = e.data;
    if (!d || !d.type) return;

    if (d.type === 'admin-batch-update') {
      let changed = false;
      if (d.theme) { const j = JSON.stringify(d.theme); if (j !== _lastThemeJSON) { _lastThemeJSON = j; state.T = d.theme; applyTheme(state.T); changed = true; } }
      if (d.settings) { const j = JSON.stringify(d.settings); if (j !== _lastSettingsJSON) { _lastSettingsJSON = j; state.siteSettings = d.settings; applySettings(); changed = true; } }
      if (d.emojis) { const j = JSON.stringify(d.emojis); if (j !== _lastEmojisJSON) { _lastEmojisJSON = j; state.customEmojis = d.emojis; changed = true; } }
      if (d.elements) { const j = JSON.stringify(d.elements); if (j !== _lastFloatingJSON) { _lastFloatingJSON = j; state.floatingEls = d.elements; renderFloating(state.floatingEls); changed = true; } }
      // Handle beats array with cardStyle customizations from admin
      if (d.beats && Array.isArray(d.beats)) {
        const beatsJson = JSON.stringify(d.beats);
        if (beatsJson !== state._lastAdminBeatsJSON) {
          state._lastAdminBeatsJSON = beatsJson;
          // Merge admin beats with local state, preserving cardStyle customizations
          d.beats.forEach(adminBeat => {
            const bi = state.allBeats.findIndex(x => x.id === adminBeat.id);
            if (bi > -1) {
              // Merge cardStyle properties (glowConfig, cardAnim, accentColor, etc.)
              if (adminBeat.cardStyle) {
                const cs = adminBeat.cardStyle;
                state.allBeats[bi].glowConfig = cs.glow || { enabled: false };
                state.allBeats[bi].cardAnim = cs.anim || null;
                state.allBeats[bi].accentColor = cs.style?.accentColor || '';
                state.allBeats[bi].cardBorder = cs.border || { enabled: false };
                state.allBeats[bi].shimmer = cs.style?.shimmer || false;
              }
              // Merge other beat properties
              Object.assign(state.allBeats[bi], adminBeat);
            }
          });
          changed = true;
        }
      }
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
      applyLiveUpdate(d.beatId, d.data);
    } else if (d.type === 'beat-revert' && d.beatId && d.original) {
      applyLiveRevert(d.beatId, d.original);
    }
  });

  // localStorage bridge (cross-tab)
  window.addEventListener('storage', (e) => {
    if (e.key === 'dace-live-edit' && e.newValue) {
      try { const d = JSON.parse(e.newValue); if (d.beatId && d.data) applyLiveUpdate(d.beatId, d.data); } catch {}
    } else if (e.key === 'dace-live-edit-revert' && e.newValue) {
      try { const d = JSON.parse(e.newValue); if (d.beatId && d.original) applyLiveRevert(d.beatId, d.original); } catch {}
    }
  });
}
