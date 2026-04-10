// ═══ DACEWAV.STORE — Main Entry Point ═══
import { FC, DACE_VER, ANIMS } from './config.js';
import { state } from './state.js';
import { logError, fbCatch } from './error-handler.js';
import { safeJSON } from './utils.js';
import { initThemeSync, applyLightMode, applyTheme } from './theme.js';
import { initAllEffects, observeStagger } from './effects.js';
import { AP } from './player.js';
import { updateWishBadge } from './wishlist.js';
import { renderAll, closeModal, openModal, playModalBeat, selLic, showToast } from './cards.js';
import {
  buildFilterOptions, buildFilters, buildTagCloud, applyFilters,
  setGenre, clearSearch, resetAllFilters, toggleTagFilter,
  removeActiveTag, toggleTagCloudExpand,
} from './filters.js';
import { applySettings, renderCustomLinks, renderFloating } from './settings.js';
import { initAnalytics, trackEvent } from './analytics.js';

// ─── Expose globals for inline onclick handlers ───
// The HTML uses onclick="" so we need these on window.
// IMPORTANT: hash-router.js patches window.openModal/window.closeModal,
// so we expose them FIRST, then import hash-router which patches on top.

// 1) Expose base functions from modules
window.openModal = openModal;
window.closeModal = closeModal;
window.playModalBeat = playModalBeat;
window.selLic = selLic;
window.showToast = showToast;
window.AP = AP;
window.renderAll = renderAll;

// Filters
window.buildFilterOptions = buildFilterOptions;
window.buildFilters = buildFilters;
window.buildTagCloud = buildTagCloud;
window.applyFilters = applyFilters;
window.setGenre = setGenre;
window.clearSearch = clearSearch;
window.resetAllFilters = resetAllFilters;
window.toggleTagFilter = toggleTagFilter;
window.removeActiveTag = removeActiveTag;
window.toggleTagCloudExpand = toggleTagCloudExpand;

// Wishlist (lazy-loaded to avoid circular deps)
window.toggleWish = (id, e) => {
  import('./wishlist.js').then((m) => m.toggleWish(id, e));
};
window.toggleWishlist = () => {
  import('./wishlist.js').then((m) => m.toggleWishlist());
};
window.sendWishlistWhatsApp = () => {
  import('./wishlist.js').then((m) => m.sendWishlistWhatsApp());
};

// Theme
window.toggleTheme = () => {
  import('./theme.js').then((m) => m.toggleTheme());
};

// Cards
window.handleCardClick = (id, idx) => {
  import('./cards.js').then((m) => m.handleCardClick(id, idx));
};

// Analytics
window.trackEvent = trackEvent;

// 2) NOW import hash-router — it will patch window.openModal on top of our base
import './hash-router.js';

// ─── Keyboard shortcuts ───
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const si = document.getElementById('search-input');
    if (si && document.activeElement === si) {
      si.blur();
      si.value = '';
      applyFilters();
      return;
    }
    closeModal();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    const si = document.getElementById('search-input');
    if (si) si.focus();
  }
  if (e.key === ' ' && !e.target.matches('input,textarea,button')) {
    e.preventDefault();
    AP.toggle();
  }
});

// ─── Cross-tab sync ───
window.addEventListener('storage', (e) => {
  if (e.key === 'dace-theme' && e.newValue) {
    state.T = JSON.parse(e.newValue);
    applyTheme(state.T);
  }
  if (e.key === 'dace-theme-broadcast' && e.newValue) {
    try {
      const d = JSON.parse(e.newValue);
      if (d.theme) { state.T = d.theme; applyTheme(state.T); }
    } catch {}
  }
  if (e.key === 'dace-custom-emojis' && e.newValue) {
    state.customEmojis = JSON.parse(e.newValue);
    applySettings();
  }
  if (e.key === 'dace-floating' && e.newValue) {
    state.floatingEls = JSON.parse(e.newValue);
    renderFloating(state.floatingEls);
  }
});

// ─── PostMessage bridge (admin iframe) ───
window.addEventListener('message', (e) => {
  const own = window.location?.origin || '*';
  // Accept from same origin, dacewav.store, or null (file://)
  if (e.origin !== own && e.origin !== 'https://dacewav.store' && e.origin !== 'null') return;
  const d = e.data;
  if (!d || !d.type) return;
  switch (d.type) {
    case 'theme-update': if (d.theme) { state.T = d.theme; applyTheme(state.T); } break;
    case 'settings-update': if (d.settings) { state.siteSettings = d.settings; applySettings(); } break;
    case 'emojis-update': if (d.emojis) { state.customEmojis = d.emojis; applySettings(); } break;
    case 'floating-update': if (d.elements) { state.floatingEls = d.elements; renderFloating(state.floatingEls); } break;
  }
});

// ─── Audio error recovery ───
(function initAudioErrorRecovery() {
  const RETRY_DELAY = 2000;
  const TIMEOUT = 10000;
  const retryMap = {};

  function flashErr() {
    const c = document.querySelector('.beat-card.is-playing,.beat-card:hover');
    if (!c) return;
    c.style.transition = 'box-shadow .15s';
    c.style.boxShadow = '0 0 0 3px rgba(255,50,50,.8)';
    setTimeout(() => { c.style.boxShadow = ''; }, 1500);
  }

  function scheduleRetry(audio) {
    const src = audio.src;
    const count = retryMap[src] || 0;
    if (count >= 1) {
      delete retryMap[src];
      showToast('No se pudo reproducir este beat');
      flashErr();
      return;
    }
    retryMap[src] = count + 1;
    setTimeout(() => {
      try { audio.load(); audio.play().catch(() => {}); }
      catch { showToast('No se pudo reproducir este beat'); flashErr(); }
    }, RETRY_DELAY);
  }

  // Patch AP.play to add error handling
  const origPlay = AP.playIdx.bind(AP);
  AP.playIdx = function (idx) {
    retryMap.clear?.();
    try { origPlay(idx); } catch (e) { showToast('Error al reproducir'); return; }
    requestAnimationFrame(() => {
      const audio = AP.audio;
      if (!audio || audio._ep) return;
      audio._ep = true;
      audio.addEventListener('error', () => scheduleRetry(audio));
      audio.addEventListener('canplay', () => { retryMap[audio.src] = 0; });
      const to = setTimeout(() => { if (audio.readyState < 2) scheduleRetry(audio); }, TIMEOUT);
      audio.addEventListener('canplay', () => clearTimeout(to), { once: true });
    });
  };
})();

// ─── Inspector ───
function setupInspector() {
  document.addEventListener('click', (e) => {
    if (!state.inspectorMode) return;
    e.preventDefault();
    e.stopPropagation();
    const el = e.target;
    let selector = '';
    if (el.id) selector = '#' + el.id;
    else if (el.className && typeof el.className === 'string') selector = el.tagName.toLowerCase() + '.' + el.className.split(' ')[0];
    else selector = el.tagName.toLowerCase();

    const hl = document.getElementById('inspector-hl');
    if (hl) {
      const r = el.getBoundingClientRect();
      hl.style.display = 'block';
      hl.style.left = r.left + 'px';
      hl.style.top = r.top + 'px';
      hl.style.width = r.width + 'px';
      hl.style.height = r.height + 'px';
    }
    const label = document.getElementById('inspector-label');
    if (label) label.textContent = selector;

    if (window.parent !== window) {
      window.parent.postMessage({ type: 'element-clicked', info: { tag: el.tagName, id: el.id, classes: el.className, text: (el.textContent || '').substring(0, 50) }, selector }, window.location?.origin || '*');
    }
  }, true);
}

// ─── Boot ───
window.addEventListener('load', () => {
  setupInspector();
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'index-ready', ver: DACE_VER }, window.location?.origin || '*');
  }

  initAllEffects();
  initThemeSync();

  const loaderTimeout = setTimeout(() => {
    state.ldTheme = state.ldSettings = state.ldBeats = true;
    _checkReady();
  }, 5000);

  function _checkReady() {
    if (!state.ldTheme || !state.ldSettings || !state.ldBeats) return;
    const l = document.getElementById('loader');
    if (l) {
      l.style.opacity = '0';
      setTimeout(() => { l.style.display = 'none'; }, 500);
    }
  }

  try {
    firebase.initializeApp(FC);
    state.db = firebase.database();

    // Load cached theme first
    const lt = localStorage.getItem('dace-theme');
    if (lt) {
      state.T = JSON.parse(lt);
      applyTheme(state.T);
      state.ldTheme = true;
      _checkReady();
    }

    // Firebase listeners
    state.db.ref('theme').on('value', (snap) => {
      const t = snap.val() || {};
      state.T = t;
      applyTheme(t);
      localStorage.setItem('dace-theme', JSON.stringify(t));
      state.ldTheme = true;
      _checkReady();
    });

    const ce = localStorage.getItem('dace-custom-emojis');
    if (ce) state.customEmojis = JSON.parse(ce);
    const fl = localStorage.getItem('dace-floating');
    if (fl) state.floatingEls = JSON.parse(fl);
    renderFloating(state.floatingEls);

    state.db.ref('settings').on('value', (snap) => {
      state.siteSettings = snap.val() || {};
      applySettings();
      state.ldSettings = true;
      _checkReady();
    });

    state.db.ref('beats').on('value', (snap) => {
      const raw = snap.val() || {};
      state.allBeats = Object.keys(raw)
        .map((k) => { raw[k].id = raw[k].id || k; return raw[k]; })
        .filter((b) => b.active !== false && b.id && b.id !== 'undefined')
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      renderAll();
      state.ldBeats = true;
      _checkReady();
      clearTimeout(loaderTimeout);
    });

    state.db.ref('floatingElements').on('value', (snap) => renderFloating(snap.val() || {}));
    state.db.ref('customLinks').on('value', (snap) => renderCustomLinks(snap.val() || {}));

    initAnalytics();
  } catch (e) {
    logError('Firebase/init', e, {}, true);
    clearTimeout(loaderTimeout);
    state.ldTheme = state.ldSettings = state.ldBeats = true;
    _checkReady();
    const lt2 = localStorage.getItem('dace-theme');
    if (lt2) { state.T = JSON.parse(lt2); applyTheme(state.T); }
    const ls = localStorage.getItem('dace-settings');
    if (ls) { state.siteSettings = JSON.parse(ls); applySettings(); }
  }

  observeStagger();
  updateWishBadge();
});
