// ═══ DACEWAV.STORE — Filters, Search & Tag Cloud ═══
import { state } from './state.js';
import { beatCard } from './cards.js';
import { setupCardTilt, observeStagger } from './effects.js';

const TAG_CLOUD_MAX = 20;

export function buildFilterOptions() {
  const keys = [...new Set(state.allBeats.map((b) => b.key).filter(Boolean))].sort();
  const ks = document.getElementById('filter-key');
  if (!ks) return;
  const kv = ks.value;
  ks.innerHTML = '<option value="">Key</option>' + keys.map((k) => `<option value="${k}">${k}</option>`).join('');
  if (keys.includes(kv)) ks.value = kv;

  const moods = new Set();
  state.allBeats.forEach((b) => (b.tags || []).forEach((t) => moods.add(t.toLowerCase())));
  const moodList = [...moods].sort();
  const ms = document.getElementById('filter-mood');
  if (!ms) return;
  const mv = ms.value;
  ms.innerHTML = '<option value="">Mood</option>' + moodList.map((m) => `<option value="${m}">${m.charAt(0).toUpperCase() + m.slice(1)}</option>`).join('');
  if (moodList.includes(mv)) ms.value = mv;
}

export function buildFilters() {
  const genres = ['Todos', ...new Set(state.allBeats.map((b) => b.genre))];
  const filters = document.getElementById('filters');
  if (!filters) return;
  filters.innerHTML = genres.map((g) =>
    `<button class="filter${g === state.activeGenre ? ' active' : ''}" onclick="setGenre('${g}')">${g}</button>`
  ).join('');
}

export function setGenre(g) {
  state.activeGenre = g;
  buildFilters();
  applyFilters();
}

export function clearSearch() {
  const si = document.getElementById('search-input');
  if (si) si.value = '';
  const sc = document.getElementById('search-clear');
  if (sc) sc.classList.remove('show');
  applyFilters();
}

export function applyFilters() {
  const si = document.getElementById('search-input');
  const query = (si?.value || '').trim().toLowerCase();
  const keyF = document.getElementById('filter-key')?.value || '';
  const moodF = document.getElementById('filter-mood')?.value || '';
  const sortF = document.getElementById('filter-sort')?.value || '';

  const sc = document.getElementById('search-clear');
  if (sc) sc.classList.toggle('show', query.length > 0);

  let filtered = state.allBeats.filter((b) => {
    if (state.activeGenre !== 'Todos' && b.genre !== state.activeGenre) return false;
    if (query) {
      const nameMatch = b.name?.toLowerCase().includes(query);
      const tagMatch = (b.tags || []).some((t) => t.toLowerCase().includes(query));
      const genreMatch = b.genre?.toLowerCase().includes(query);
      const descMatch = b.description?.toLowerCase().includes(query);
      const keyMatch = b.key?.toLowerCase().includes(query);
      if (!nameMatch && !tagMatch && !genreMatch && !descMatch && !keyMatch) return false;
    }
    if (keyF && b.key !== keyF) return false;
    if (moodF) {
      const hasMood = (b.tags || []).some((t) => t.toLowerCase() === moodF);
      if (!hasMood) return false;
    }
    if (state.activeTags.length > 0) {
      const beatTagsLower = (b.tags || []).map((t) => t.toLowerCase());
      if (!state.activeTags.every((at) => beatTagsLower.includes(at))) return false;
    }
    return true;
  });

  // Sort
  const sorters = {
    newest: (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
    oldest: (a, b) => (a.createdAt || 0) - (b.createdAt || 0),
    'name-az': (a, b) => a.name.localeCompare(b.name),
    'name-za': (a, b) => b.name.localeCompare(a.name),
    'bpm-asc': (a, b) => (a.bpm || 0) - (b.bpm || 0),
    'bpm-desc': (a, b) => (b.bpm || 0) - (a.bpm || 0),
    'price-asc': (a, b) => ((a.licenses?.[0]?.priceMXN) || 0) - ((b.licenses?.[0]?.priceMXN) || 0),
    'price-desc': (a, b) => ((b.licenses?.[0]?.priceMXN) || 0) - ((a.licenses?.[0]?.priceMXN) || 0),
  };
  if (sortF && sorters[sortF]) filtered.sort(sorters[sortF]);
  else filtered.sort((a, b) => (a.order || 0) - (b.order || 0));

  const ctBadge = document.getElementById('ct-badge');
  if (ctBadge) ctBadge.textContent = filtered.length + ' beats';

  // Active filter tags
  let tagsHtml = '';
  if (query) tagsHtml += `<span class="active-filter-tag">🔍 "${query}" <button onclick="clearSearch()">✕</button></span>`;
  if (state.activeGenre !== 'Todos') tagsHtml += `<span class="active-filter-tag">🎵 ${state.activeGenre} <button onclick="window.setGenre('Todos')">✕</button></span>`;
  if (keyF) tagsHtml += `<span class="active-filter-tag">🎹 ${keyF} <button onclick="document.getElementById('filter-key').value='';applyFilters()">✕</button></span>`;
  if (moodF) tagsHtml += `<span class="active-filter-tag">✨ ${moodF.charAt(0).toUpperCase() + moodF.slice(1)} <button onclick="document.getElementById('filter-mood').value='';applyFilters()">✕</button></span>`;
  if (sortF && sortF !== 'order') {
    const sortSel = document.getElementById('filter-sort');
    tagsHtml += `<span class="active-filter-tag">📊 ${sortSel?.selectedOptions?.[0]?.text || sortF} <button onclick="document.getElementById('filter-sort').value='order';applyFilters()">✕</button></span>`;
  }
  state.activeTags.forEach((at) => {
    const label = at.charAt(0).toUpperCase() + at.slice(1);
    tagsHtml += `<span class="active-filter-tag">🏷️ ${label} <button onclick="removeActiveTag('${at.replace(/'/g, "\\'")}')">✕</button></span>`;
  });

  const hasActiveFilters = query || state.activeGenre !== 'Todos' || keyF || moodF || (sortF && sortF !== 'order') || state.activeTags.length > 0;
  if (hasActiveFilters) tagsHtml += '<button class="filter" onclick="resetAllFilters()" style="font-size:9px;padding:3px 10px">Limpiar todo</button>';

  const af = document.getElementById('active-filters');
  if (af) af.innerHTML = tagsHtml;

  updateTagCloudState();

  const grid = document.getElementById('main-grid');
  if (grid) {
    if (filtered.length === 0) {
      grid.innerHTML = '<div class="no-results" style="grid-column:1/-1"><div class="no-results-icon">🎵</div><div class="no-results-text">No se encontraron beats</div><div class="no-results-sub">Prueba con otros filtros o busca otro nombre</div></div>';
    } else {
      grid.innerHTML = filtered.map((b) => beatCard(b, state.allBeats.indexOf(b))).join('');
    }
  }

  document.querySelectorAll('.beat-card').forEach((c) => {
    if (state.T.animCards) {
      // Re-apply animation
    }
  });
  setTimeout(() => { setupCardTilt(); observeStagger(); }, 50);
}

export function resetAllFilters() {
  const si = document.getElementById('search-input');
  if (si) si.value = '';
  const sc = document.getElementById('search-clear');
  if (sc) sc.classList.remove('show');
  const fk = document.getElementById('filter-key');
  if (fk) fk.value = '';
  const fm = document.getElementById('filter-mood');
  if (fm) fm.value = '';
  const fs = document.getElementById('filter-sort');
  if (fs) fs.value = 'order';
  state.activeGenre = 'Todos';
  state.activeTags = [];
  buildFilters();
  buildTagCloud();
  applyFilters();
}

// ─── Tag Cloud ───
export function buildTagCloud() {
  const tagCount = {};
  state.allBeats.forEach((b) => (b.tags || []).forEach((t) => {
    const tl = t.toLowerCase();
    tagCount[tl] = (tagCount[tl] || 0) + 1;
  }));

  const sortedTags = Object.keys(tagCount).sort((a, b) => {
    if (tagCount[b] !== tagCount[a]) return tagCount[b] - tagCount[a];
    return a.localeCompare(b);
  });

  const tc = document.getElementById('tag-cloud');
  if (!tc) return;
  if (!sortedTags.length) { tc.innerHTML = ''; return; }

  let html = `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
    <span style="font-size:11px;color:var(--hint);font-weight:600;text-transform:uppercase;letter-spacing:.5px">🏷️ Tags populares</span>`;
  if (sortedTags.length > TAG_CLOUD_MAX) {
    html += `<button style="font-size:10px;color:var(--accent);background:none;border:none;cursor:pointer;font-family:var(--font-m);padding:2px 6px;border-radius:4px" id="tag-cloud-toggle" onclick="toggleTagCloudExpand()">ver más (${sortedTags.length})</button>`;
  }
  html += '</div><div class="tag-cloud-items" id="tag-cloud-items">';

  sortedTags.forEach((tag, i) => {
    const hidden = i >= TAG_CLOUD_MAX ? ' tag-cloud-item--hidden' : '';
    const active = state.activeTags.includes(tag) ? ' tag-cloud-item--active' : '';
    const label = tag.charAt(0).toUpperCase() + tag.slice(1);
    html += `<button class="tag-cloud-item${hidden}${active}" data-tag="${tag}" onclick="toggleTagFilter('${tag.replace(/'/g, "\\'")}')">${label} <span style="font-size:9px;opacity:.6">${tagCount[tag]}</span></button>`;
  });

  html += '</div>';
  tc.innerHTML = html;
}

export function toggleTagFilter(tag) {
  const idx = state.activeTags.indexOf(tag);
  if (idx > -1) state.activeTags.splice(idx, 1);
  else state.activeTags.push(tag);
  updateTagCloudState();
  applyFilters();
}

export function removeActiveTag(tag) {
  const idx = state.activeTags.indexOf(tag);
  if (idx > -1) state.activeTags.splice(idx, 1);
  updateTagCloudState();
  applyFilters();
}

export function updateTagCloudState() {
  document.querySelectorAll('.tag-cloud-item').forEach((el) => {
    const tag = el.getAttribute('data-tag');
    el.classList.toggle('tag-cloud-item--active', state.activeTags.includes(tag));
  });
}

export function toggleTagCloudExpand() {
  const c = document.getElementById('tag-cloud-items');
  const t = document.getElementById('tag-cloud-toggle');
  if (!c || !t) return;
  if (c.classList.contains('tag-cloud-items--expanded')) {
    c.classList.remove('tag-cloud-items--expanded');
    t.textContent = 'ver más';
  } else {
    c.classList.add('tag-cloud-items--expanded');
    t.textContent = 'ver menos';
  }
}
