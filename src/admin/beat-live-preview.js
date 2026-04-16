// ═══ DACEWAV Admin — Beat Live Preview ═══
// Real-time card preview updates, live edit sync (localStorage, postMessage, Firebase)
// Extracted from beats.js IIFE

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

// ═══ LIVE EDIT: localStorage → store iframe ═══
window._liveEditId = null;
window._liveEditOriginal = null;

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
    cardStyle: window._buildCardStyleFromInputs?.() || {}
  };
  const payload = { beatId: window._liveEditId, data, ts: Date.now() };

  // localStorage fallback (cross-tab)
  localStorage.setItem('dace-live-edit', JSON.stringify(payload));

  // postMessage to iframe (same-tab admin preview)
  const frame = document.getElementById('preview-frame');
  if (frame?.contentWindow) {
    try {
      frame.contentWindow.postMessage({ type: 'beat-update', beatId: payload.beatId, data: payload.data }, '*');
    } catch (e) { /* iframe may be cross-origin */ }
  } else {
    postToFrame({ type: 'beat-update', beatId: payload.beatId, data: payload.data });
  }

  // Firebase — reaches the live store at dacewav.store
  // Debounce rapid updates to avoid rate limiting
  clearTimeout(window._liveEditFirebaseTimer);
  window._liveEditFirebaseTimer = setTimeout(() => {
    const _db = window._db || (typeof db !== 'undefined' ? db : null);
    if (_db) {
      _db.ref('liveEdits/' + window._liveEditId).set(data)
        .then(() => console.log('[LiveEdit] Firebase write OK'))
        .catch(err => console.error('[LiveEdit] Firebase write error:', err.code, err.message));
    } else {
      console.warn('[LiveEdit] Firebase DB not ready, update queued in localStorage only');
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
