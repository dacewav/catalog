// ═══ DACEWAV.STORE — Live Edit Bridge ═══
// Handles postMessage (admin iframe) with ACK confirmation
// Single source of truth: Firebase + real-time sync

import { state } from './state.js';
import { applyTheme } from './theme.js';
import { applySettings, renderFloating } from './settings.js';
import { renderAll, applyWaveformToCard } from './cards.js';

let _lastThemeJSON = '';
let _lastSettingsJSON = '';
let _lastEmojisJSON = '';
let _lastFloatingJSON = '';

// Buffer for beat updates that arrive before beats are loaded from Firebase
const _pendingBeatUpdates = {};

function applyLiveUpdate(beatId, data, version) {
  const bi = state.allBeats.findIndex(x => x.id === beatId);
  if (bi === -1) {
    // Beat not loaded yet — buffer for later
    _pendingBeatUpdates[beatId] = { data, version };
    console.log('[LiveEdit] buffered update for', beatId, '(beats not loaded yet)');
    return false;
  }
  
  // Version check to prevent stale updates
  const currentVersion = state.allBeats[bi]._version || 0;
  if (version && version <= currentVersion) {
    console.log('[LiveEdit] skipping stale update for', beatId, '| version:', version, '≤', currentVersion);
    return false;
  }
  
  if (data.cardStyle) {
    const cs = data.cardStyle;
    state.allBeats[bi].glowConfig = cs.glow || { enabled: false };
    state.allBeats[bi].cardAnim = cs.anim || null;
    state.allBeats[bi].accentColor = cs.style?.accentColor || '';
    state.allBeats[bi].cardBorder = cs.border || { enabled: false };
    state.allBeats[bi].shimmer = cs.style?.shimmer || false;
    state.allBeats[bi].shimmerSpeed = cs.style?.shimmerSpeed || 3;
    state.allBeats[bi].shimmerOp = cs.style?.shimmerOp || 0.04;
    console.log('[LiveEdit] cardStyle applied:', {
      glow: cs.glow?.enabled ? cs.glow.type : 'off',
      anim: cs.anim?.type || 'none',
      shimmer: !!cs.style?.shimmer,
      shadow: cs.shadow?.enabled ? 'on' : 'off',
      border: cs.border?.enabled ? 'on' : 'off',
      hover: Object.keys(cs.hover || {}).filter(k => cs.hover[k] && cs.hover[k] !== 1 && cs.hover[k] !== 0).length ? 'custom' : 'default'
    });
  }
  
  // Migrate legacy properties if they exist (for backward compatibility)
  if (data.glowConfig && !data.cardStyle?.glow) state.allBeats[bi].glowConfig = data.glowConfig;
  if (data.cardAnim && !data.cardStyle?.anim) state.allBeats[bi].cardAnim = data.cardAnim;
  if (data.accentColor && !data.cardStyle?.style?.accentColor) state.allBeats[bi].accentColor = data.accentColor;
  if (data.shimmer != null && data.cardStyle?.style?.shimmer == null) state.allBeats[bi].shimmer = data.shimmer;
  if (data.shimmerSpeed && !data.cardStyle?.style?.shimmerSpeed) state.allBeats[bi].shimmerSpeed = data.shimmerSpeed;
  if (data.shimmerOp && !data.cardStyle?.style?.shimmerOp) state.allBeats[bi].shimmerOp = data.shimmerOp;
  if (data.cardBorder && !data.cardStyle?.border) state.allBeats[bi].cardBorder = data.cardBorder;
  
  // Update beat data with version tracking
  Object.assign(state.allBeats[bi], data);
  state.allBeats[bi]._version = version || Date.now();
  
  // Re-render all cards to apply new styles
  renderAll();
  
  // Re-apply waveform SVGs after render completes
  setTimeout(() => {
    state.allBeats.forEach((b) => { 
      if (b.previewUrl) {
        const card = document.getElementById('card-' + b.id);
        if (card && !card.querySelector('.waveform-svg')) {
          applyWaveformToCard(b.id);
        }
      }
    });
  }, 100);
  
  return true;
}

// Call this after Firebase beats load to apply any buffered updates
export function flushPendingUpdates() {
  const ids = Object.keys(_pendingBeatUpdates);
  if (!ids.length) return;
  console.log('[LiveEdit] flushing', ids.length, 'buffered updates');
  ids.forEach(beatId => {
    const { data, version } = _pendingBeatUpdates[beatId];
    const success = applyLiveUpdate(beatId, data, version);
    if (success) {
      // Send ACK for flushed updates
      sendAck(beatId, state.allBeats.find(b => b.id === beatId)?._version);
    }
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
      }, '*');
      console.log('[LiveEdit] ACK sent for', beatId, '| version:', version);
    } catch (e) {
      console.warn('[LiveEdit] failed to send ACK:', e.message);
    }
  }
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
      const success = applyLiveUpdate(d.beatId, d.data, d.version);
      if (success) {
        sendAck(d.beatId, state.allBeats.find(b => b.id === d.beatId)?._version);
      }
    } else if (d.type === 'beat-revert' && d.beatId && d.original) {
      applyLiveRevert(d.beatId, d.original);
    } else if (d.type === 'global-card-style-update' && d.cardStyle) {
      // Apply global card style to all beats
      const cs = d.cardStyle;
      state.allBeats.forEach((beat, idx) => {
        // Merge global style with beat-specific style
        if (cs) {
          state.allBeats[idx].glowConfig = cs.glow || { enabled: false };
          state.allBeats[idx].cardAnim = cs.anim || null;
          state.allBeats[idx].accentColor = cs.style?.accentColor || '';
          state.allBeats[idx].cardBorder = cs.border || { enabled: false };
          state.allBeats[idx].shimmer = cs.style?.shimmer || false;
          state.allBeats[idx].shimmerSpeed = cs.style?.shimmerSpeed || 3;
          state.allBeats[idx].shimmerOp = cs.style?.shimmerOp || 0.04;
          
          // Also update cardStyle directly for consistency
          state.allBeats[idx].cardStyle = cs;
        }
      });
      
      // Re-render all cards
      renderAll();
      
      // Re-apply waveform SVGs after render
      setTimeout(() => {
        state.allBeats.forEach((b) => { 
          if (b.previewUrl) {
            const card = document.getElementById('card-' + b.id);
            if (card && !card.querySelector('.waveform-svg')) {
              applyWaveformToCard(b.id);
            }
          }
        });
      }, 100);
      
      console.log('[GlobalStyle] applied to', state.allBeats.length, 'beats');
    }
  });

  // localStorage bridge removed - using only postMessage + Firebase as single source of truth
}
