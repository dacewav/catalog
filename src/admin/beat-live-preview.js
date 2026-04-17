// ═══ DACEWAV Admin — Beat Live Preview ═══
// Real-time card preview updates with ACK sync
// Single source of truth: Firebase + postMessage confirmation

import { val, checked } from './helpers.js';
import { postToFrame } from './preview-sync.js';

// ═══ REAL-TIME CARD PREVIEW ═══
let _pvTimer = null;
let _liveListenersAttached = false;

function _debouncedPv() {
  clearTimeout(_pvTimer);
  _pvTimer = setTimeout(() => {
    window.updateCardPreview?.();
    window.renderFullPvInCard?.();
    window._sendLiveUpdate?.();
  }, 250);
}

function _attachLiveListeners() {
  if (_liveListenersAttached) return;
  _liveListenersAttached = true;
  if (typeof document === 'undefined' || !document.getElementById) return;
  const editor = document.getElementById('sec-add');
  if (!editor) return;
  editor.addEventListener('input', e => { if (e.target.matches('input, select, textarea')) _debouncedPv(); });
  editor.addEventListener('change', e => { if (e.target.matches('input, select, textarea')) _debouncedPv(); });
  window._initPvImgUpload?.();
}

window._attachLiveListeners = _attachLiveListeners;

// ═══ LIVE EDIT: Single Source of Truth (Firebase) ═══
window._liveEditId = null;
window._liveEditOriginal = null;
window._liveEditPending = new Map(); // Track pending updates for ACK

// Listen for ACK from store
window.addEventListener('message', (e) => {
  const d = e.data;
  if (!d || d.type !== 'beat-update-ack') return;
  const pending = window._liveEditPending.get(d.beatId);
  if (pending) {
    console.log('[LiveEdit] ACK received for', d.beatId, '| Store version:', d.version);
    window._liveEditPending.delete(d.beatId);
    // Update UI to show sync complete
    const statusEl = document.getElementById('live-edit-status');
    if (statusEl) {
      statusEl.textContent = 'Sincronizado ✓';
      statusEl.style.color = '#22c55e';
      setTimeout(() => { statusEl.textContent = ''; }, 2000);
    }
  }
});

window._sendLiveUpdate = function () {
  if (!window._liveEditId) return;
  const data = {
    name: val('f-name') || '',
    genre: val('f-genre') || 'Trap',
    genreCustom: val('f-genre-c') || '',
    bpm: parseInt(val('f-bpm')) || 0,
    key: val('f-key') || '',
    description: val('f-desc') || '',
    tags: (val('f-tags') || '').split(',').map(t => t.trim()).filter(Boolean),
    imageUrl: val('f-img') || '',
    audioUrl: val('f-audio') || '',
    previewUrl: val('f-prev') || '',
    featured: checked('f-feat'),
    exclusive: checked('f-excl'),
    active: checked('f-active'),
    available: checked('f-avail'),
    cardStyle: window._buildCardStyleFromInputs?.() || {},
    _version: Date.now() // Version timestamp for conflict resolution
  };
  const payload = { beatId: window._liveEditId, data, ts: Date.now() };

  // Mark as pending (waiting for ACK)
  window._liveEditPending.set(window._liveEditId, { ts: Date.now(), data });
  
  // Show syncing state
  const statusEl = document.getElementById('live-edit-status');
  if (statusEl) {
    statusEl.textContent = 'Sincronizando...';
    statusEl.style.color = '#f59e0b';
  }

  // postMessage to iframe (primary channel with ACK)
  const frame = document.getElementById('preview-frame');
  if (frame?.contentWindow) {
    try {
      frame.contentWindow.postMessage({ 
        type: 'beat-update', 
        beatId: payload.beatId, 
        data: payload.data,
        version: data._version 
      }, '*');
    } catch (e) { /* iframe may be cross-origin */ }
  } else {
    postToFrame({ 
      type: 'beat-update', 
      beatId: payload.beatId, 
      data: payload.data,
      version: data._version 
    });
  }

  // Firebase — persistent storage (fallback + multi-admin sync)
  clearTimeout(window._liveEditFirebaseTimer);
  window._liveEditFirebaseTimer = setTimeout(() => {
    const _db = window._db || (typeof db !== 'undefined' ? db : null);
    if (_db) {
      _db.ref('liveEdits/' + window._liveEditId).set(data)
        .then(() => console.log('[LiveEdit] Firebase write OK'))
        .catch(err => {
          console.error('[LiveEdit] Firebase write error:', err.code, err.message);
          // If Firebase fails, rely on postMessage only
          window._liveEditPending.delete(window._liveEditId);
          if (statusEl) {
            statusEl.textContent = 'Error Firebase - usando solo preview';
            statusEl.style.color = '#ef4444';
          }
        });
    } else {
      console.warn('[LiveEdit] Firebase DB not ready, using postMessage only');
    }
  }, 150);
};

window._sendBeatRevert = function () {
  if (!window._liveEditId || !window._liveEditOriginal) return;
  const revertData = { beatId: window._liveEditId, original: window._liveEditOriginal, ts: Date.now() };
  localStorage.setItem('dace-live-edit-revert', JSON.stringify(revertData));
  localStorage.removeItem('dace-live-edit');
  postToFrame({ type: 'beat-revert', beatId: revertData.beatId, original: revertData.original });
  const _db = window._db || (typeof db !== 'undefined' ? db : null);
  if (_db) _db.ref('liveEdits/' + window._liveEditId).remove().catch(() => {});
  window._liveEditId = null;
  window._liveEditOriginal = null;
};

window._startLiveEdit = function (beat) {
  window._liveEditId = beat.id;
  window._liveEditOriginal = JSON.parse(JSON.stringify(beat));
};

window._clearLiveEdit = function () {
  localStorage.removeItem('dace-live-edit');
  localStorage.removeItem('dace-live-edit-revert');
  if (window._liveEditId) {
    const _db = window._db || (typeof db !== 'undefined' ? db : null);
    if (_db) _db.ref('liveEdits/' + window._liveEditId).remove().catch(() => {});
  }
  window._liveEditId = null;
  window._liveEditOriginal = null;
};

// ═══ GLOBAL CARD STYLE LIVE UPDATE ═══
// Send global card style changes to store in real-time
window._sendGlobalStyleUpdate = function(cardStyle) {
  // PostMessage to iframe (primary channel)
  const frame = document.getElementById('preview-frame');
  if (frame?.contentWindow) {
    try {
      frame.contentWindow.postMessage({ 
        type: 'global-card-style-update', 
        cardStyle,
        ts: Date.now() 
      }, '*');
      console.log('[GlobalStyle] sent to store:', {
        glow: cardStyle.glow?.enabled ? cardStyle.glow.type : 'off',
        anim: cardStyle.anim?.type || 'none',
        shimmer: !!cardStyle.style?.shimmer,
        shadow: cardStyle.shadow?.enabled ? 'on' : 'off',
        border: cardStyle.border?.enabled ? 'on' : 'off'
      });
    } catch (e) { /* iframe may be cross-origin */ }
  } else {
    postToFrame({ 
      type: 'global-card-style-update', 
      cardStyle,
      ts: Date.now() 
    });
  }

  // Firebase — persistent storage
  clearTimeout(window._globalStyleFirebaseTimer);
  window._globalStyleFirebaseTimer = setTimeout(() => {
    const _db = window._db || (typeof db !== 'undefined' ? db : null);
    if (_db) {
      _db.ref('settings/globalCardStyle').set(cardStyle)
        .then(() => console.log('[GlobalStyle] Firebase write OK'))
        .catch(err => console.error('[GlobalStyle] Firebase write error:', err.message));
    }
  }, 150);
};
