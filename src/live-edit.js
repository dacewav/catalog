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

function applyLiveUpdate(beatId, data) {
  const bi = state.allBeats.findIndex(x => x.id === beatId);
  if (bi === -1) return;
  if (data.cardStyle) {
    state.allBeats[bi].glowConfig = data.cardStyle.glow || { enabled: false };
    state.allBeats[bi].cardAnim = data.cardStyle.anim || null;
    state.allBeats[bi].accentColor = data.cardStyle.style?.accentColor || '';
    state.allBeats[bi].cardBorder = data.cardStyle.border || { enabled: false };
    state.allBeats[bi].shimmer = data.cardStyle.style?.shimmer || false;
  }
  Object.assign(state.allBeats[bi], data);
  renderAll();
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
