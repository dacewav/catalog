// ════════════════════════════════════════════════════════════
// DACEWAV.STORE — Catalog (js/store/catalog.js)
// ════════════════════════════════════════════════════════════

import { ref, onValue } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js';

let db;
let beatsData = [];
let gridEl;

const PLACEHOLDER_COVER = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><rect fill="#1A1A1A" width="300" height="300"/><text x="150" y="160" text-anchor="middle" fill="#554E47" font-family="sans-serif" font-size="48">♪</text></svg>'
);

let activeGenre = 'Todos';
let searchQuery = '';
let sortBy = 'recent';

const GENRES = ['Todos', 'Trap', 'R&B', 'Drill', 'Reggaeton', 'Afro', 'Sample'];

export async function initCatalog(dbRef) {
  db = dbRef;
  gridEl = document.getElementById('beats-grid');
  if (!gridEl) return;

  buildFilters();
  showSkeletons(6);
  listenBeats();
}

// ── Filters UI ──
function buildFilters() {
  const header = document.querySelector('.catalog__header');
  if (!header) return;

  // Filter bar
  const filterBar = document.createElement('div');
  filterBar.className = 'catalog__filters';

  // Genre buttons
  const genreGroup = document.createElement('div');
  genreGroup.className = 'catalog__genres';
  GENRES.forEach(genre => {
    const btn = document.createElement('button');
    btn.className = 'genre-btn';
    btn.textContent = genre;
    if (genre === activeGenre) btn.classList.add('active');
    btn.addEventListener('click', () => {
      activeGenre = genre;
      genreGroup.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterAndRender();
    });
    genreGroup.appendChild(btn);
  });
  filterBar.appendChild(genreGroup);

  // Search + Sort row
  const controls = document.createElement('div');
  controls.className = 'catalog__controls';

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.className = 'catalog__search';
  searchInput.placeholder = 'Buscar beats...';
  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value.trim().toLowerCase();
    filterAndRender();
  });
  controls.appendChild(searchInput);

  const sortSelect = document.createElement('select');
  sortSelect.className = 'catalog__sort';
  const sortOptions = [
    { value: 'recent', label: 'Recientes' },
    { value: 'plays', label: 'Más escuchados' },
    { value: 'alpha', label: 'A → Z' },
  ];
  sortOptions.forEach(o => {
    const opt = document.createElement('option');
    opt.value = o.value;
    opt.textContent = o.label;
    sortSelect.appendChild(opt);
  });
  sortSelect.addEventListener('change', () => {
    sortBy = sortSelect.value;
    filterAndRender();
  });
  controls.appendChild(sortSelect);

  filterBar.appendChild(controls);
  header.after(filterBar);
}

function listenBeats() {
  const beatsRef = ref(db, 'beats');
  onValue(beatsRef, (snap) => {
    const raw = snap.val();
    if (!raw) {
      beatsData = [];
      showEmpty();
      return;
    }

    beatsData = Object.entries(raw)
      .map(([id, beat]) => ({ id, ...beat }))
      .filter(b => b.status === 'active')
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    if (beatsData.length === 0) {
      showEmpty();
      return;
    }

    filterAndRender();
  }, (err) => {
    console.error('[DACEWAV] Beats listen error:', err);
    gridEl.innerHTML = '<p class="catalog__empty">Error al cargar beats</p>';
  });
}

// ── Filter + Sort ──
function filterAndRender() {
  let filtered = [...beatsData];

  // Genre filter
  if (activeGenre !== 'Todos') {
    filtered = filtered.filter(b => b.genre === activeGenre);
  }

  // Search filter
  if (searchQuery) {
    filtered = filtered.filter(b => {
      const title = (b.title || '').toLowerCase();
      const tags = (b.tags || []).join(' ').toLowerCase();
      return title.includes(searchQuery) || tags.includes(searchQuery);
    });
  }

  // Sort
  if (sortBy === 'plays') {
    filtered.sort((a, b) => (b.plays || 0) - (a.plays || 0));
  } else if (sortBy === 'alpha') {
    filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  } else {
    filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }

  if (filtered.length === 0) {
    gridEl.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--color-text-dim);padding:var(--space-3xl) 0;">Sin beats con ese filtro</p>';
    return;
  }

  renderGrid(filtered);
}

function renderGrid(beats) {
  gridEl.innerHTML = '';

  beats.forEach((beat, i) => {
    const card = createBeatCard(beat);
    card.style.animationDelay = `${i * 60}ms`;
    gridEl.appendChild(card);
  });
}

function createBeatCard(beat) {
  const card = document.createElement('div');
  card.className = 'beat-card';
  card.dataset.beatId = beat.id;

  const minPrice = getMinPrice(beat);
  const meta = formatMeta(beat);

  // Cover
  const coverDiv = document.createElement('div');
  coverDiv.className = 'beat-card__cover';

  const coverImg = document.createElement('img');
  coverImg.src = beat.coverUrl || PLACEHOLDER_COVER;
  coverImg.alt = beat.title || 'Beat cover';
  coverImg.loading = 'lazy';
  coverImg.onerror = () => { coverImg.src = PLACEHOLDER_COVER; };
  coverDiv.appendChild(coverImg);

  // Play overlay
  const overlay = document.createElement('div');
  overlay.className = 'beat-card__cover-actions';

  const btnPlay = document.createElement('button');
  btnPlay.className = 'btn-play';
  btnPlay.setAttribute('aria-label', `Reproducir ${beat.title}`);
  btnPlay.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
  btnPlay.addEventListener('click', (e) => {
    e.stopPropagation();
    dispatchPlay(beat);
  });
  overlay.appendChild(btnPlay);
  coverDiv.appendChild(overlay);
  card.appendChild(coverDiv);

  // Info
  const info = document.createElement('div');
  info.className = 'beat-card__info';

  const title = document.createElement('h3');
  title.className = 'beat-card__title';
  title.textContent = beat.title || 'Untitled';
  info.appendChild(title);

  const metaSpan = document.createElement('span');
  metaSpan.className = 'beat-card__meta';
  metaSpan.textContent = meta;
  info.appendChild(metaSpan);

  // Footer
  const footer = document.createElement('div');
  footer.className = 'beat-card__footer';

  const price = document.createElement('span');
  price.className = 'beat-card__price';
  price.textContent = minPrice;
  footer.appendChild(price);

  const btnLicenses = document.createElement('button');
  btnLicenses.className = 'btn-licenses';
  btnLicenses.textContent = 'Licencias';
  btnLicenses.addEventListener('click', (e) => {
    e.stopPropagation();
    dispatchShowLicenses(beat);
  });
  footer.appendChild(btnLicenses);

  info.appendChild(footer);
  card.appendChild(info);

  // Click card → play
  card.addEventListener('click', () => dispatchPlay(beat));

  return card;
}

function getMinPrice(beat) {
  if (!beat.licenses) return '$—';
  const tiers = Object.values(beat.licenses);
  const minMxn = tiers.reduce((min, t) => {
    const p = typeof t === 'object' ? (t.mxn || Infinity) : Infinity;
    return p < min ? p : min;
  }, Infinity);
  return minMxn === Infinity ? '$—' : `$${minMxn} MXN`;
}

function formatMeta(beat) {
  const parts = [];
  if (beat.bpm) parts.push(`${beat.bpm} BPM`);
  if (beat.key) parts.push(beat.key);
  if (beat.genre) parts.push(beat.genre);
  return parts.join(' · ') || '—';
}

function dispatchPlay(beat) {
  document.dispatchEvent(new CustomEvent('beat:play', { detail: beat, bubbles: true }));
}

function dispatchShowLicenses(beat) {
  document.dispatchEvent(new CustomEvent('beat:showLicenses', { detail: beat, bubbles: true }));
}

function showSkeletons(count) {
  gridEl.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const skel = document.createElement('div');
    skel.className = 'skeleton-card';

    const cover = document.createElement('div');
    cover.className = 'skeleton-card__cover skeleton';
    skel.appendChild(cover);

    const info = document.createElement('div');
    info.className = 'skeleton-card__info';

    const t = document.createElement('div');
    t.className = 'skeleton-card__title skeleton';
    info.appendChild(t);

    const m = document.createElement('div');
    m.className = 'skeleton-card__meta skeleton';
    info.appendChild(m);

    skel.appendChild(info);
    gridEl.appendChild(skel);
  }
}

function showEmpty() {
  gridEl.innerHTML = '<p class="catalog__empty" style="grid-column:1/-1;text-align:center;color:var(--color-text-dim);padding:var(--space-3xl) 0;">Sin beats disponibles</p>';
}

// Export for potential external use
export { beatsData };
