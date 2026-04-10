// ════════════════════════════════════════════════════════════
// DACEWAV.STORE — Wishlist (js/store/wishlist.js)
// ════════════════════════════════════════════════════════════

import { ref, get } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js';

let db;
let wishlist = [];
let whatsappNumber = '';

const STORAGE_KEY = 'dace-wishlist';

export function initWishlist(dbRef) {
  db = dbRef;
  loadWishlist();
  setupPanel();
  loadConfig();
}

// ── Persistence ──
function loadWishlist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    wishlist = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(wishlist)) wishlist = [];
  } catch {
    wishlist = [];
  }
  updateBadge();
}

function saveWishlist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
  updateBadge();
}

// ── Toggle heart on a beat ──
export function toggleWish(beatId) {
  const idx = wishlist.indexOf(beatId);
  if (idx > -1) {
    wishlist.splice(idx, 1);
  } else {
    wishlist.push(beatId);
  }
  saveWishlist();
  syncHearts(beatId);
  renderPanel();
}

export function isWished(beatId) {
  return wishlist.includes(beatId);
}

function syncHearts(beatId) {
  document.querySelectorAll(`.wish-btn[data-id="${beatId}"]`).forEach(btn => {
    const active = wishlist.includes(beatId);
    btn.classList.toggle('wish-btn--active', active);
    btn.textContent = active ? '♥' : '♡';
    if (active) {
      btn.classList.add('wish-btn--pop');
      setTimeout(() => btn.classList.remove('wish-btn--pop'), 300);
    }
  });
}

// ── Badge ──
function updateBadge() {
  const badge = document.getElementById('wish-badge');
  if (!badge) return;
  badge.textContent = wishlist.length;
  badge.style.display = wishlist.length ? 'flex' : 'none';
  badge.classList.remove('wish-badge--pop');
  void badge.offsetWidth;
  badge.classList.add('wish-badge--pop');
}

// ── Panel ──
function setupPanel() {
  const toggleBtn = document.getElementById('wish-toggle');
  const panel = document.getElementById('wish-panel');
  const overlay = document.getElementById('wish-overlay');
  const closeBtn = document.getElementById('wish-close');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      panel?.classList.toggle('wish-panel--open');
      overlay?.classList.toggle('wish-overlay--visible');
      if (panel?.classList.contains('wish-panel--open')) renderPanel();
    });
  }

  if (overlay) {
    overlay.addEventListener('click', closePanel);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closePanel);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePanel();
  });

  const waBtn = document.getElementById('wish-whatsapp');
  if (waBtn) {
    waBtn.addEventListener('click', sendWhatsApp);
  }
}

function closePanel() {
  document.getElementById('wish-panel')?.classList.remove('wish-panel--open');
  document.getElementById('wish-overlay')?.classList.remove('wish-overlay--visible');
}

function renderPanel() {
  const list = document.getElementById('wish-list');
  const countEl = document.getElementById('wish-count');
  if (!list) return;

  if (countEl) countEl.textContent = wishlist.length;

  if (wishlist.length === 0) {
    list.innerHTML = '';
    const empty = document.createElement('div');
    empty.className = 'wish-empty';
    empty.innerHTML = '<div class="wish-empty__icon">❤️</div><div class="wish-empty__text">Aún no tienes favoritos.<br>Haz click en ♡ para guardar beats.</div>';
    list.appendChild(empty);
    return;
  }

  list.innerHTML = '';

  wishlist.forEach(id => {
    const beat = findBeat(id);
    if (!beat) return;

    const item = document.createElement('div');
    item.className = 'wish-item';

    const img = document.createElement('div');
    img.className = 'wish-item__cover';
    if (beat.coverUrl) {
      const coverImg = document.createElement('img');
      coverImg.src = beat.coverUrl;
      coverImg.alt = '';
      coverImg.loading = 'lazy';
      img.appendChild(coverImg);
    } else {
      img.textContent = '♪';
    }
    item.appendChild(img);

    const info = document.createElement('div');
    info.className = 'wish-item__info';

    const name = document.createElement('div');
    name.className = 'wish-item__name';
    name.textContent = beat.title || 'Untitled';
    info.appendChild(name);

    const meta = document.createElement('div');
    meta.className = 'wish-item__meta';
    const parts = [];
    if (beat.bpm) parts.push(`${beat.bpm} BPM`);
    if (beat.key) parts.push(beat.key);
    const minP = getMinPrice(beat);
    if (minP) parts.push(minP);
    meta.textContent = parts.join(' · ');
    info.appendChild(meta);

    item.appendChild(info);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'wish-item__remove';
    removeBtn.textContent = '✕';
    removeBtn.title = 'Quitar';
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleWish(id);
    });
    item.appendChild(removeBtn);

    item.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('beat:play', { detail: beat, bubbles: true }));
      closePanel();
    });

    list.appendChild(item);
  });
}

// ── WhatsApp ──
function sendWhatsApp() {
  if (wishlist.length === 0) return;

  const lines = wishlist.map((id, i) => {
    const beat = findBeat(id);
    if (!beat) return null;
    const parts = [beat.title || 'Untitled'];
    if (beat.bpm) parts.push(`${beat.bpm} BPM`);
    if (beat.key) parts.push(beat.key);
    const minP = getMinPrice(beat);
    if (minP) parts.push(minP);
    return `${i + 1}. ${parts.join(' · ')}`;
  }).filter(Boolean);

  const msg = encodeURIComponent(
    `Hola DACE, me interesan estos beats:\n\n${lines.join('\n')}\n\n¿Podemos hablar de licencias?`
  );

  const url = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${msg}`
    : `https://wa.me/?text=${msg}`;

  window.open(url, '_blank');
}

// ── Config ──
async function loadConfig() {
  try {
    const snap = await get(ref(db, 'config/site'));
    if (!snap.exists()) return;
    const cfg = snap.val();
    whatsappNumber = cfg.whatsapp || '';
  } catch {
    // silent
  }
}

// ── Helpers ──
// Local copy synced from catalog
let localBeats = [];

export function syncBeats(beats) {
  localBeats = beats;
}

function findBeat(id) {
  return localBeats.find(b => b.id === id) || window.__daceBeats?.find(b => b.id === id) || null;
}

function getMinPrice(beat) {
  if (!beat.licenses) return '';
  const tiers = Object.values(beat.licenses);
  const min = tiers.reduce((m, t) => {
    const p = typeof t === 'object' ? (t.mxn || Infinity) : Infinity;
    return p < m ? p : m;
  }, Infinity);
  return min === Infinity ? '' : `$${min} MXN`;
}

export { wishlist };
