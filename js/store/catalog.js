// ════════════════════════════════════════════════════════════
// DACEWAV.STORE — Catalog (js/store/catalog.js)
// ════════════════════════════════════════════════════════════

import { ref, onValue } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js';
import { isWished, toggleWish, syncBeats } from './wishlist.js';

let db;
let beatsData = [];
let gridEl;

const PLACEHOLDER_COVER = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><rect fill="#1A1A1A" width="300" height="300"/><text x="150" y="160" text-anchor="middle" fill="#554E47" font-family="sans-serif" font-size="48">♪</text></svg>'
);

let activeGenre = 'Todos';
let searchQuery = '';
let sortBy = 'recent';
let activeKey = '';
let activeMood = '';
let activeTags = [];
const TAG_CLOUD_MAX = 15;

let genreGroupEl;
let keySelectEl;
let moodSelectEl;
let searchInputEl;
let sortSelectEl;
let activeFiltersEl;
let tagCloudEl;
let countBadgeEl;

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

  // Count badge
  countBadgeEl = document.createElement('span');
  countBadgeEl.className = 'catalog__count';
  countBadgeEl.textContent = '0 beats';
  header.appendChild(countBadgeEl);

  // Filter bar
  const filterBar = document.createElement('div');
  filterBar.className = 'catalog__filters';

  // Genre buttons
  genreGroupEl = document.createElement('div');
  genreGroupEl.className = 'catalog__genres';
  filterBar.appendChild(genreGroupEl);

  // Controls row: search + key + mood + sort
  const controls = document.createElement('div');
  controls.className = 'catalog__controls';

  searchInputEl = document.createElement('input');
  searchInputEl.type = 'text';
  searchInputEl.className = 'catalog__search';
  searchInputEl.placeholder = 'Buscar beats...';
  searchInputEl.addEventListener('input', filterAndRender);
  controls.appendChild(searchInputEl);

  keySelectEl = document.createElement('select');
  keySelectEl.className = 'catalog__sort';
  keySelectEl.addEventListener('change', filterAndRender);
  controls.appendChild(keySelectEl);

  moodSelectEl = document.createElement('select');
  moodSelectEl.className = 'catalog__sort';
  moodSelectEl.addEventListener('change', filterAndRender);
  controls.appendChild(moodSelectEl);

  sortSelectEl = document.createElement('select');
  sortSelectEl.className = 'catalog__sort';
  const sortOptions = [
    { value: 'recent', label: 'Recientes' },
    { value: 'oldest', label: 'Antiguos' },
    { value: 'plays', label: 'Más escuchados' },
    { value: 'alpha', label: 'A → Z' },
    { value: 'alpha-za', label: 'Z → A' },
    { value: 'bpm-asc', label: 'BPM ↑' },
    { value: 'bpm-desc', label: 'BPM ↓' },
    { value: 'price-asc', label: 'Precio ↑' },
    { value: 'price-desc', label: 'Precio ↓' },
  ];
  sortOptions.forEach(o => {
    const opt = document.createElement('option');
    opt.value = o.value;
    opt.textContent = o.label;
    sortSelectEl.appendChild(opt);
  });
  sortSelectEl.addEventListener('change', filterAndRender);
  controls.appendChild(sortSelectEl);

  filterBar.appendChild(controls);

  // Active filters pills
  activeFiltersEl = document.createElement('div');
  activeFiltersEl.className = 'active-filters';
  filterBar.appendChild(activeFiltersEl);

  // Tag cloud
  tagCloudEl = document.createElement('div');
  tagCloudEl.className = 'tag-cloud';
  filterBar.appendChild(tagCloudEl);

  header.after(filterBar);
}

function populateFilterOptions() {
  // Genre buttons
  const genres = ['Todos', ...new Set(beatsData.map(b => b.genre).filter(Boolean))];
  genreGroupEl.innerHTML = '';
  genres.forEach(genre => {
    const btn = document.createElement('button');
    btn.className = 'genre-btn';
    btn.textContent = genre;
    if (genre === activeGenre) btn.classList.add('active');
    btn.addEventListener('click', () => {
      activeGenre = genre;
      genreGroupEl.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterAndRender();
    });
    genreGroupEl.appendChild(btn);
  });

  // Key dropdown
  const keys = [...new Set(beatsData.map(b => b.key).filter(Boolean))].sort();
  const curKey = keySelectEl.value;
  keySelectEl.innerHTML = '<option value="">🎹 Key</option>';
  keys.forEach(k => {
    const opt = document.createElement('option');
    opt.value = k;
    opt.textContent = k;
    keySelectEl.appendChild(opt);
  });
  if (keys.includes(curKey)) keySelectEl.value = curKey;

  // Mood dropdown (from tags)
  const moods = new Set();
  beatsData.forEach(b => (b.tags || []).forEach(t => moods.add(t.toLowerCase())));
  const moodList = [...moods].sort();
  const curMood = moodSelectEl.value;
  moodSelectEl.innerHTML = '<option value="">✨ Mood</option>';
  moodList.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m;
    opt.textContent = m.charAt(0).toUpperCase() + m.slice(1);
    moodSelectEl.appendChild(opt);
  });
  if (moodList.includes(curMood)) moodSelectEl.value = curMood;

  // Tag cloud
  buildTagCloud();
}

function buildTagCloud() {
  const tagCount = {};
  beatsData.forEach(b => (b.tags || []).forEach(t => {
    const tl = t.toLowerCase();
    tagCount[tl] = (tagCount[tl] || 0) + 1;
  }));

  const sorted = Object.keys(tagCount).sort((a, b) =>
    tagCount[b] !== tagCount[a] ? tagCount[b] - tagCount[a] : a.localeCompare(b)
  );

  if (sorted.length === 0) {
    tagCloudEl.innerHTML = '';
    return;
  }

  tagCloudEl.innerHTML = '';

  const labelRow = document.createElement('div');
  labelRow.className = 'tag-cloud__label';
  labelRow.innerHTML = '<span>🏷️ Tags populares</span>';

  if (sorted.length > TAG_CLOUD_MAX) {
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'tag-cloud__toggle';
    toggleBtn.textContent = `ver más (${sorted.length})`;
    toggleBtn.addEventListener('click', () => {
      const items = tagCloudEl.querySelectorAll('.tag-cloud-item');
      const expanded = tagCloudEl.classList.toggle('tag-cloud--expanded');
      items.forEach((el, i) => {
        if (i >= TAG_CLOUD_MAX) el.classList.toggle('tag-cloud-item--hidden', !expanded);
      });
      toggleBtn.textContent = expanded ? 'ver menos' : `ver más (${sorted.length})`;
    });
    labelRow.appendChild(toggleBtn);
  }
  tagCloudEl.appendChild(labelRow);

  const itemsDiv = document.createElement('div');
  itemsDiv.className = 'tag-cloud__items';

  sorted.forEach((tag, i) => {
    const btn = document.createElement('button');
    btn.className = 'tag-cloud-item';
    if (i >= TAG_CLOUD_MAX) btn.classList.add('tag-cloud-item--hidden');
    if (activeTags.includes(tag)) btn.classList.add('tag-cloud-item--active');
    btn.dataset.tag = tag;
    btn.innerHTML = `${tag.charAt(0).toUpperCase() + tag.slice(1)} <span class="tag-cloud-item__count">${tagCount[tag]}</span>`;
    btn.addEventListener('click', () => {
      const idx = activeTags.indexOf(tag);
      if (idx > -1) activeTags.splice(idx, 1);
      else activeTags.push(tag);
      btn.classList.toggle('tag-cloud-item--active');
      filterAndRender();
    });
    itemsDiv.appendChild(btn);
  });

  tagCloudEl.appendChild(itemsDiv);
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
      .map(([id, beat]) => normalizeBeat(id, beat))
      .filter(b => b.status === 'active');

    // Expose for wishlist module
    window.__daceBeats = beatsData;
    syncBeats(beatsData);

    if (beatsData.length === 0) {
      showEmpty();
      return;
    }

    populateFilterOptions();
    renderFeatured();
    filterAndRender();
    animateCounters();
  }, (err) => {
    console.error('[DACEWAV] Beats listen error:', err);
    gridEl.innerHTML = '<p class="catalog__empty">Error al cargar beats</p>';
  });
}

// ── Filter + Sort ──
function filterAndRender() {
  searchQuery = (searchInputEl?.value || '').trim().toLowerCase();
  activeKey = keySelectEl?.value || '';
  activeMood = moodSelectEl?.value || '';
  sortBy = sortSelectEl?.value || 'recent';

  let filtered = beatsData.filter(b => {
    if (activeGenre !== 'Todos' && b.genre !== activeGenre) return false;
    if (activeKey && b.key !== activeKey) return false;
    if (activeMood) {
      const hasMood = (b.tags || []).some(t => t.toLowerCase() === activeMood);
      if (!hasMood) return false;
    }
    if (activeTags.length > 0) {
      const beatTags = (b.tags || []).map(t => t.toLowerCase());
      if (!activeTags.every(at => beatTags.includes(at))) return false;
    }
    if (searchQuery) {
      const title = (b.title || '').toLowerCase();
      const tags = (b.tags || []).join(' ').toLowerCase();
      const desc = (b.description || '').toLowerCase();
      const genre = (b.genre || '').toLowerCase();
      const key = (b.key || '').toLowerCase();
      if (!title.includes(searchQuery) && !tags.includes(searchQuery) && !desc.includes(searchQuery) && !genre.includes(searchQuery) && !key.includes(searchQuery)) return false;
    }
    return true;
  });

  // Sort
  const sorters = {
    'recent': (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
    'oldest': (a, b) => (a.createdAt || 0) - (b.createdAt || 0),
    'plays': (a, b) => (b.plays || 0) - (a.plays || 0),
    'alpha': (a, b) => (a.title || '').localeCompare(b.title || ''),
    'alpha-za': (a, b) => (b.title || '').localeCompare(a.title || ''),
    'bpm-asc': (a, b) => (a.bpm || 0) - (b.bpm || 0),
    'bpm-desc': (a, b) => (b.bpm || 0) - (a.bpm || 0),
    'price-asc': (a, b) => getMinPriceNum(a) - getMinPriceNum(b),
    'price-desc': (a, b) => getMinPriceNum(b) - getMinPriceNum(a),
  };
  if (sorters[sortBy]) filtered.sort(sorters[sortBy]);

  // Update count badge
  if (countBadgeEl) countBadgeEl.textContent = `${filtered.length} beat${filtered.length !== 1 ? 's' : ''}`;

  // Update active filter pills
  renderActivePills();

  // Update tag cloud active state
  tagCloudEl?.querySelectorAll('.tag-cloud-item').forEach(el => {
    el.classList.toggle('tag-cloud-item--active', activeTags.includes(el.dataset.tag));
  });

  if (filtered.length === 0) {
    gridEl.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--color-text-dim);padding:var(--space-3xl) 0;">Sin beats con ese filtro</p>';
    return;
  }

  renderGrid(filtered);
}

function renderActivePills() {
  if (!activeFiltersEl) return;
  activeFiltersEl.innerHTML = '';

  const pills = [];
  if (searchQuery) pills.push({ label: `🔍 "${searchQuery}"`, clear: () => { searchInputEl.value = ''; } });
  if (activeGenre !== 'Todos') pills.push({ label: `🎵 ${activeGenre}`, clear: () => { activeGenre = 'Todos'; } });
  if (activeKey) pills.push({ label: `🎹 ${activeKey}`, clear: () => { keySelectEl.value = ''; } });
  if (activeMood) pills.push({ label: `✨ ${activeMood.charAt(0).toUpperCase() + activeMood.slice(1)}`, clear: () => { moodSelectEl.value = ''; } });
  if (sortBy !== 'recent') pills.push({ label: `📊 ${sortSelectEl?.selectedOptions?.[0]?.text || sortBy}`, clear: () => { sortSelectEl.value = 'recent'; } });
  activeTags.forEach(tag => {
    pills.push({ label: `🏷️ ${tag.charAt(0).toUpperCase() + tag.slice(1)}`, clear: () => { activeTags = activeTags.filter(t => t !== tag); } });
  });

  if (pills.length === 0) return;

  pills.forEach(p => {
    const pill = document.createElement('span');
    pill.className = 'active-filter-pill';

    const text = document.createTextNode(p.label);
    pill.appendChild(text);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'active-filter-pill__close';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      p.clear();
      if (activeGenre === 'Todos') {
        genreGroupEl.querySelectorAll('.genre-btn').forEach(b => b.classList.toggle('active', b.textContent === 'Todos'));
      }
      filterAndRender();
    });
    pill.appendChild(closeBtn);
    activeFiltersEl.appendChild(pill);
  });

  // "Limpiar todo" button
  if (pills.length > 1) {
    const clearAll = document.createElement('button');
    clearAll.className = 'active-filter-pill active-filter-pill--clear';
    clearAll.textContent = 'Limpiar todo';
    clearAll.addEventListener('click', resetAllFilters);
    activeFiltersEl.appendChild(clearAll);
  }
}

function resetAllFilters() {
  activeGenre = 'Todos';
  activeKey = '';
  activeMood = '';
  activeTags = [];
  if (searchInputEl) searchInputEl.value = '';
  if (keySelectEl) keySelectEl.value = '';
  if (moodSelectEl) moodSelectEl.value = '';
  if (sortSelectEl) sortSelectEl.value = 'recent';

  genreGroupEl.querySelectorAll('.genre-btn').forEach(b => b.classList.toggle('active', b.textContent === 'Todos'));
  tagCloudEl?.querySelectorAll('.tag-cloud-item').forEach(el => el.classList.remove('tag-cloud-item--active'));
  filterAndRender();
}

function renderFeatured() {
  const section = document.getElementById('featured');
  const grid = document.getElementById('featured-grid');
  if (!section || !grid) return;

  const featured = beatsData.filter(b => b.featured);
  if (featured.length === 0) {
    section.style.display = 'none';
    return;
  }

  grid.innerHTML = '';
  featured.forEach((beat, i) => {
    const card = createBeatCard(beat);
    card.style.animationDelay = `${i * 60}ms`;
    grid.appendChild(card);
  });

  section.style.display = 'block';
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

  // Accent color per beat
  if (beat.accentColor) {
    card.style.setProperty('--card-tint', `linear-gradient(135deg, ${beat.accentColor}, transparent)`);
  }

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

  const btnWish = document.createElement('button');
  btnWish.className = 'wish-btn';
  btnWish.dataset.id = beat.id;
  btnWish.textContent = isWished(beat.id) ? '♥' : '♡';
  if (isWished(beat.id)) btnWish.classList.add('wish-btn--active');
  btnWish.setAttribute('aria-label', `Favorito ${beat.title}`);
  btnWish.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleWish(beat.id);
  });
  overlay.appendChild(btnWish);

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

  // EXCL badge
  if (beat.exclusive) {
    const excl = document.createElement('span');
    excl.className = 'beat-card__excl';
    excl.textContent = 'EXCL';
    title.appendChild(excl);
  }
  info.appendChild(title);

  const metaSpan = document.createElement('span');
  metaSpan.className = 'beat-card__meta';
  metaSpan.textContent = meta;
  info.appendChild(metaSpan);

  // Play count
  if (beat.plays && beat.plays > 0) {
    const plays = document.createElement('span');
    plays.className = 'beat-card__plays';
    plays.textContent = `▶ ${beat.plays}`;
    info.appendChild(plays);
  }

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

function getMinPriceNum(beat) {
  if (!beat.licenses) return Infinity;
  const tiers = Object.values(beat.licenses);
  return tiers.reduce((min, t) => {
    const p = typeof t === 'object' ? (t.mxn || Infinity) : Infinity;
    return p < min ? p : min;
  }, Infinity);
}

function normalizeBeat(id, b) {
  return {
    id,
    title: b.title || b.name || 'Untitled',
    slug: b.slug || '',
    bpm: b.bpm || 0,
    key: b.key || '',
    genre: b.genre || '',
    mood: b.mood || '',
    tags: b.tags || [],
    description: b.description || '',
    audioUrl: b.audioUrl || b.previewUrl || '',
    coverUrl: b.coverUrl || b.imageUrl || '',
    duration: b.duration || 0,
    plays: b.plays || 0,
    featured: b.featured || false,
    status: b.status || (b.active ? 'active' : 'draft'),
    exclusive: b.exclusive || false,
    accentColor: b.accentColor || '',
    spotify: b.spotify || '',
    youtube: b.youtube || '',
    soundcloud: b.soundcloud || '',
    licenses: b.licenses || {},
    createdAt: b.createdAt || b.date || 0,
    updatedAt: b.updatedAt || 0,
  };
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

// ── Counter Animation ──
function animateCounters() {
  const totalBeats = beatsData.length;
  const totalGenres = new Set(beatsData.map(b => b.genre).filter(Boolean)).size;
  const totalPlays = beatsData.reduce((sum, b) => sum + (b.plays || 0), 0);

  animateValue('stat-beats', totalBeats);
  animateValue('stat-genres', totalGenres);
  animateValue('stat-plays', totalPlays);
}

function animateValue(id, target) {
  const el = document.getElementById(id);
  if (!el || target === 0) {
    if (el) el.textContent = '0';
    return;
  }

  const duration = 1200;
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);
    el.textContent = current.toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

// Export for potential external use
export { beatsData };
