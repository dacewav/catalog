// ═══ DACEWAV Admin — Beat Live Preview ═══
// Real-time card preview updates, live edit sync (localStorage, postMessage, Firebase)
// Extracted from beats.js IIFE
// OPTIMIZED: Smart debouncing, batching, change detection

import { val, checked } from './helpers.js';
import { postToFrame } from './preview-sync.js';

// ═══ REAL-TIME CARD PREVIEW — OPTIMIZED ═══
let _pvTimer = null;
let _liveListenersAttached = false;
let _lastCardStyleJSON = '';
let _pendingChanges = {};
let _batchUpdateScheduled = false;

// Track last values to avoid redundant updates
const _lastValues = new Map();

function _getValueSignature() {
  // Create a lightweight signature of current values
  const sig = {
    name: val('f-name'),
    genre: val('f-genre'),
    bpm: val('f-bpm'),
    glow: checked('f-glow-on'),
    anim: val('f-anim-type'),
    shimmer: checked('f-shimmer')
  };
  return JSON.stringify(sig);
}

function _debouncedPv(force = false) {
  // Check if values actually changed
  const currentSig = _getValueSignature();
  if (!force && currentSig === _lastCardStyleJSON) {
    return; // No meaningful changes
  }
  _lastCardStyleJSON = currentSig;
  
  clearTimeout(_pvTimer);
  _pvTimer = setTimeout(() => {
    window.updateCardPreview?.();
    window.renderFullPvInCard?.();
    window._sendLiveUpdate?.();
  }, 150); // Reduced from 250ms for snappier feel
}

function _attachLiveListeners() {
  if (_liveListenersAttached) return;
  _liveListenersAttached = true;
  if (typeof document === 'undefined' || !document.getElementById) return;
  const editor = document.getElementById('sec-add');
  if (!editor) return;
  
  // Use event delegation with smart filtering
  editor.addEventListener('input', e => {
    const target = e.target;
    if (!target.matches('input, select, textarea')) return;
    
    // Debounce based on input type
    const isSlider = target.type === 'range';
    const isColor = target.type === 'color';
    const isText = target.type === 'text' || target.tagName === 'TEXTAREA';
    
    // Sliders: faster debounce for smooth preview
    // Text inputs: slower debounce to avoid flickering during typing
    // Colors/checkboxes: immediate
    if (isSlider) {
      _debouncedPv();
    } else if (isColor || target.type === 'checkbox') {
      _debouncedPv(true); // Force update
    } else if (isText) {
      _debouncedPv();
    } else {
      _debouncedPv();
    }
  }, { passive: true });
  
  editor.addEventListener('change', e => {
    const target = e.target;
    if (target.matches('input, select, textarea')) {
      _debouncedPv(true); // Force update on change events
    }
  });
  
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
  const _db = window._db || (typeof db !== 'undefined' ? db : null);
  if (_db) {
    _db.ref('liveEdits/' + window._liveEditId).set(data).catch(() => {});
  }
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
