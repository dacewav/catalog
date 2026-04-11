// ═══ DACEWAV.STORE — Audio Player ═══
import { state } from './state.js';
import { formatTime } from './utils.js';
import { startEQ, stopEQ } from './effects.js';
import { logError } from './error-handler.js';

let _audio = null;
let _idx = -1;
let _playing = false;
let _modalMode = false;
let _countedPlays = {};

function _create(url) {
  if (_audio) { _audio.pause(); _audio.src = ''; _audio.load(); }
  _audio = new Audio(url);
  const vol = document.getElementById('vol');
  _audio.volume = vol ? parseFloat(vol.value) : 1;
  _audio.addEventListener('timeupdate', _onTime);
  _audio.addEventListener('ended', _next);
  _audio.addEventListener('error', () => { _playing = false; stopEQ(); _updateIcons(); });
}

function _onTime() {
  if (!_audio || !_audio.duration) return;
  const pct = (_audio.currentTime / _audio.duration) * 100;

  const trackFill = document.getElementById('track-fill');
  if (trackFill) trackFill.style.width = pct + '%';

  const tc = document.getElementById('tc');
  if (tc) tc.textContent = formatTime(_audio.currentTime);

  const td = document.getElementById('td');
  if (td) td.textContent = formatTime(_audio.duration);

  const mFill = document.getElementById('m-fill');
  if (mFill) mFill.style.width = pct + '%';

  const mTc = document.getElementById('m-tc');
  if (mTc) mTc.textContent = formatTime(_audio.currentTime);

  const mTd = document.getElementById('m-td');
  if (mTd) mTd.textContent = formatTime(_audio.duration);

  _updateWaveProgress(pct);
}

function _updateWaveProgress(pct) {
  const playing = document.querySelector('.beat-card.is-playing');
  if (!playing) return;
  const rect = playing.querySelector('.wf-clip-rect');
  if (rect) rect.setAttribute('width', (pct / 100) * 200);
}

function trackPlay(beatId) {
  if (!beatId || beatId === 'undefined' || _countedPlays[beatId]) return;
  _countedPlays[beatId] = true;
  if (state.db) {
    state.db.ref(`beats/${beatId}/plays`).transaction((c) => (c || 0) + 1)
      .catch((err) => logError('Player/trackPlay', err));
  }
}

function _next() {
  if (!_modalMode && _idx < state.allBeats.length - 1) {
    _playIdx(_idx + 1);
  } else {
    _playing = false;
    stopEQ();
    _updateIcons();
  }
}

function _updateIcons() {
  const pauseSVG14 = '<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2h2v12H4zM10 2h2v12h-2z"/></svg>';
  const playSVG14 = '<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M5 3l10 5-10 5V3z"/></svg>';
  const pauseSVG12 = '<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2h2v12H4zM10 2h2v12h-2z"/></svg>';
  const playSVG12 = '<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M5 3l10 5-10 5V3z"/></svg>';

  const bb = document.getElementById('bar-play-btn');
  const mb = document.getElementById('m-play-btn');
  if (bb) bb.innerHTML = _playing ? pauseSVG14 : playSVG14;
  if (mb) mb.innerHTML = _playing ? pauseSVG12 : playSVG12;

  if (_playing) startEQ();
  else stopEQ();

  // Update playing state on cards WITHOUT re-rendering (prevents animation restart)
  _updatePlayingState();
}

// Update is-playing class on cards without rebuilding DOM (avoids animation restart)
function _updatePlayingState() {
  const currentBeat = _idx >= 0 ? state.allBeats[_idx] : null;
  const currentId = currentBeat ? currentBeat.id : null;

  const cards = document.querySelectorAll('.beat-card');
  cards.forEach((card) => {
    const cardId = card.dataset.id;
    const isCurrent = cardId === currentId;
    const wasPlaying = card.classList.contains('is-playing');

    if (isCurrent && _playing) {
      if (!wasPlaying) {
        card.classList.add('is-playing');
        // Trigger play-pulse effect (non-disruptive, separate from main animation)
        card.classList.remove('play-pulse');
        void card.offsetWidth; // force reflow to restart pulse
        card.classList.add('play-pulse');
        setTimeout(() => card.classList.remove('play-pulse'), 600);
      }
      // Update play icon to pause
      const playHint = card.querySelector('.play-hint svg');
      if (playHint) playHint.innerHTML = '<path d="M4 2h2v12H4zM10 2h2v12h-2z"/>';
    } else {
      if (wasPlaying) card.classList.remove('is-playing');
      // Update play icon
      const playHint = card.querySelector('.play-hint svg');
      if (playHint) playHint.innerHTML = '<path d="M5 3l10 5-10 5V3z"/>';
    }
  });

  // Update waveform bars only in the currently playing card
  document.querySelectorAll('.beat-card:not(.is-playing) .wbar.anim').forEach(bar => {
    bar.classList.remove('anim');
    bar.style.transform = 'scaleY(1)';
  });
  const playingCard = document.querySelector('.beat-card.is-playing');
  if (playingCard && _playing) {
    playingCard.querySelectorAll('.wbar').forEach(bar => bar.classList.add('anim'));
  }
}

function _playIdx(idx) {
  const b = state.allBeats[idx];
  if (!b) return;
  _idx = idx;
  _modalMode = false;
  const url = b.previewUrl || b.audioUrl || '';
  if (!url) {
    if (typeof window.openModal === 'function') window.openModal(b.id);
    return;
  }
  _create(url);
  _audio.play().catch((err) => logError('Player/play', err));
  _playing = true;
  trackPlay(b.id);

  const piName = document.getElementById('pi-name');
  if (piName) piName.textContent = b.name;

  const piMeta = document.getElementById('pi-meta');
  if (piMeta) piMeta.textContent = `${b.bpm} BPM · ${b.key} · ${b.genre}`;

  const th = document.getElementById('pi-thumb');
  if (th) {
    th.innerHTML = b.imageUrl
      ? `<img src="${b.imageUrl}" alt="" loading="lazy">`
      : '♦';
  }

  const bar = document.getElementById('player-bar');
  if (bar) bar.classList.add('up');

  _updateIcons();
}

// ─── Public API ───
export const AP = {
  playIdx(i) { _playIdx(i); },

  openForModal(beat) {
    _modalMode = true;
    const url = beat.previewUrl || beat.audioUrl || '';
    const isSame = _idx !== -1 && state.allBeats[_idx] && state.allBeats[_idx].id === beat.id;

    if (!isSame && url) {
      const bi = state.allBeats.findIndex((b) => b.id === beat.id);
      _create(url);
      _audio.play().catch((err) => logError('Player/modalPlay', err));
      _playing = true;
      _idx = bi;
      trackPlay(beat.id);

      const bar = document.getElementById('player-bar');
      if (bar) bar.classList.add('up');

      const piName = document.getElementById('pi-name');
      if (piName) piName.textContent = beat.name;

      const piMeta = document.getElementById('pi-meta');
      if (piMeta) piMeta.textContent = `${beat.bpm} BPM · ${beat.key} · ${beat.genre}`;

      const th = document.getElementById('pi-thumb');
      if (th) {
        th.innerHTML = beat.imageUrl
          ? `<img src="${beat.imageUrl}" alt="" loading="lazy">`
          : '♦';
      }
    }
    _updateIcons();
  },

  toggle() {
    if (!_audio || !_audio.src) return;
    if (_playing) { _audio.pause(); _playing = false; }
    else { _audio.play().catch((err) => logError('Player/toggle', err)); _playing = true; }
    _updateIcons();
  },

  prev() { if (_idx > 0 && !_modalMode) _playIdx(_idx - 1); },

  next() { if (_idx < state.allBeats.length - 1 && !_modalMode) _playIdx(_idx + 1); },

  skip(s) {
    if (!_audio) return;
    _audio.currentTime = Math.max(0, Math.min(_audio.duration || 0, _audio.currentTime + s));
  },

  seek(e) {
    if (!_audio || !_audio.duration) return;
    const r = document.getElementById('track').getBoundingClientRect();
    _audio.currentTime = ((e.clientX - r.left) / r.width) * _audio.duration;
  },

  seekEl(e, el) {
    if (!_audio || !_audio.duration) return;
    const r = el.getBoundingClientRect();
    _audio.currentTime = ((e.clientX - r.left) / r.width) * _audio.duration;
  },

  setVol(v) { if (_audio) _audio.volume = parseFloat(v); },

  exitModal() { _modalMode = false; _updateIcons(); },

  playModalBeat(beat) {
    // Play a beat from modal context — uses global player with modal tracking
    _modalMode = true;
    const bi = state.allBeats.findIndex((b) => b.id === beat.id);
    const url = beat.previewUrl || beat.audioUrl || '';
    if (!url) return;
    const isSame = _idx === bi && _audio && _audio.src;

    if (!isSame) {
      _create(url);
      _audio.play().catch((err) => logError('Player/modalPlay', err));
      _playing = true;
      _idx = bi;
      trackPlay(beat.id);

      const bar = document.getElementById('player-bar');
      if (bar) bar.classList.add('up');

      const piName = document.getElementById('pi-name');
      if (piName) piName.textContent = beat.name;

      const piMeta = document.getElementById('pi-meta');
      if (piMeta) piMeta.textContent = `${beat.bpm} BPM · ${beat.key} · ${beat.genre}`;

      const th = document.getElementById('pi-thumb');
      if (th) {
        th.innerHTML = beat.imageUrl
          ? `<img src="${beat.imageUrl}" alt="" loading="lazy">`
          : '♦';
      }
    } else {
      // Same beat, just resume
      _audio.play().catch((err) => logError('Player/toggle', err));
      _playing = true;
    }
    _updateIcons();
  },

  get currentBeatIdx() { return _idx; },
  get playing() { return _playing; },
  get audio() { return _audio; },
};
