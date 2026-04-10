// ════════════════════════════════════════════════════════════
// DACEWAV.STORE — Player (js/store/player.js)
// ════════════════════════════════════════════════════════════

import { db } from '../firebase.js';
import { ref, get, update } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js';

let audio;
let beatsList = [];
let currentIndex = -1;
let hasPlayed30s = false;

// DOM refs
let bar, coverImg, titleEl, metaEl;
let btnPlay, btnPrev, btnNext, btnSkipBack, btnSkipFwd, playIcon;
let seekEl, seekFill, currentTimeEl, durationEl;
let volumeSlider;

export function initPlayer() {
  audio = new Audio();
  audio.preload = 'metadata';

  bar = document.getElementById('player-bar');
  coverImg = document.getElementById('player-cover-img');
  titleEl = document.getElementById('player-title');
  metaEl = document.getElementById('player-meta');
  btnPlay = document.getElementById('player-play');
  btnPrev = document.getElementById('player-prev');
  btnNext = document.getElementById('player-next');
  btnSkipBack = document.getElementById('player-skip-back');
  btnSkipFwd = document.getElementById('player-skip-fwd');
  playIcon = document.getElementById('player-play-icon');
  seekEl = document.getElementById('player-seek');
  seekFill = document.getElementById('player-seek-fill');
  currentTimeEl = document.getElementById('player-current');
  durationEl = document.getElementById('player-duration');
  volumeSlider = document.getElementById('player-volume');

  loadBeatsList();
  bindEvents();
}

async function loadBeatsList() {
  try {
    const snap = await get(ref(db, 'beats'));
    if (!snap.exists()) return;
    const raw = snap.val();
    beatsList = Object.entries(raw)
      .map(([id, beat]) => ({ id, ...beat }))
      .filter(b => b.status === 'active' && b.audioUrl)
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (err) {
    console.error('[DACEWAV] Failed to load beats list:', err);
  }
}

function bindEvents() {
  // Listen for play events from catalog
  document.addEventListener('beat:play', (e) => {
    const beat = e.detail;
    if (beat) playBeat(beat);
  });

  // Controls
  btnPlay.addEventListener('click', togglePlay);
  btnPrev.addEventListener('click', playPrev);
  btnNext.addEventListener('click', playNext);
  btnSkipBack.addEventListener('click', () => skip(-10));
  btnSkipFwd.addEventListener('click', () => skip(10));

  // Progress
  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('loadedmetadata', onMetadata);
  audio.addEventListener('ended', onEnded);
  audio.addEventListener('play', () => {
    updatePlayIcon(true);
    bar.querySelector('.pi-eq')?.classList.add('playing');
  });
  audio.addEventListener('pause', () => {
    updatePlayIcon(false);
    bar.querySelector('.pi-eq')?.classList.remove('playing');
  });

  // Seek
  seekEl.addEventListener('click', seek);

  // Volume
  volumeSlider.addEventListener('input', () => {
    audio.volume = parseFloat(volumeSlider.value);
  });
}

function playBeat(beat) {
  if (!beat.audioUrl) return;

  // Remove playing state from all cards
  document.querySelectorAll('.beat-card.is-playing').forEach(c => c.classList.remove('is-playing'));

  // Find index in list
  currentIndex = beatsList.findIndex(b => b.id === beat.id);

  // Add playing state to current card
  const currentCard = document.querySelector(`.beat-card[data-beat-id="${beat.id}"]`);
  if (currentCard) currentCard.classList.add('is-playing');

  // Show bar
  bar.classList.add('visible');

  // Update UI
  coverImg.src = beat.coverUrl || '';
  coverImg.alt = beat.title || '';
  titleEl.textContent = beat.title || 'Untitled';
  metaEl.textContent = formatMeta(beat);

  // Start equalizer
  const eq = bar.querySelector('.pi-eq');
  if (eq) eq.classList.add('playing');

  // Play
  audio.src = beat.audioUrl;
  audio.volume = parseFloat(volumeSlider.value);
  audio.play().catch(err => console.warn('[DACEWAV] Play failed:', err));

  hasPlayed30s = false;
}

function skip(seconds) {
  if (!audio.src || isNaN(audio.duration)) return;
  audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + seconds));
}

function togglePlay() {
  if (!audio.src) return;
  if (audio.paused) {
    audio.play().catch(() => {});
  } else {
    audio.pause();
  }
}

function playPrev() {
  if (beatsList.length === 0) return;
  currentIndex = currentIndex <= 0 ? beatsList.length - 1 : currentIndex - 1;
  playBeat(beatsList[currentIndex]);
}

function playNext() {
  if (beatsList.length === 0) return;
  currentIndex = currentIndex >= beatsList.length - 1 ? 0 : currentIndex + 1;
  playBeat(beatsList[currentIndex]);
}

function updateProgress() {
  if (!audio.duration || isNaN(audio.duration)) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  seekFill.style.width = `${pct}%`;
  currentTimeEl.textContent = formatTime(audio.currentTime);

  // 30s play count
  if (!hasPlayed30s && audio.currentTime >= 30) {
    hasPlayed30s = true;
    incrementPlays();
  }
}

function onMetadata() {
  durationEl.textContent = formatTime(audio.duration);
}

function onEnded() {
  playNext();
}

function seek(e) {
  if (!audio.duration || isNaN(audio.duration)) return;
  const rect = seekEl.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  audio.currentTime = pct * audio.duration;
}

async function incrementPlays() {
  const beat = beatsList[currentIndex];
  if (!beat || !beat.id) return;
  try {
    const beatRef = ref(db, `beats/${beat.id}`);
    const snap = await get(beatRef);
    if (snap.exists()) {
      const current = snap.val().plays || 0;
      await update(beatRef, { plays: current + 1 });
    }
  } catch (err) {
    console.warn('[DACEWAV] Play count update failed:', err);
  }
}

function updatePlayIcon(playing) {
  if (playing) {
    playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
  } else {
    playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
  }
}

function formatTime(s) {
  if (isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function formatMeta(beat) {
  const parts = [];
  if (beat.bpm) parts.push(`${beat.bpm} BPM`);
  if (beat.key) parts.push(beat.key);
  if (beat.genre) parts.push(beat.genre);
  return parts.join(' · ') || '—';
}
