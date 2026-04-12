// ═══ DACEWAV.STORE — Utilities ═══

/**
 * Convert hex color to rgba string.
 */
export function hexRgba(h, a) {
  h = (h || '#000').replace('#', '');
  if (h.length < 6) return h;
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
}

/**
 * Load a Google Font into the page (idempotent).
 */
export function loadFont(family, id) {
  if (!family) return;
  const lid = id || 'gf-' + family.replace(/\s+/g, '-').toLowerCase();
  if (document.getElementById(lid)) return;
  const l = document.createElement('link');
  l.id = lid;
  l.rel = 'stylesheet';
  l.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;700;800&display=swap`;
  document.head.appendChild(l);
}

/**
 * Apply animation class to element.
 */
export function applyAnim(el, cfg, ANIMS) {
  if (!el || !cfg || cfg.type === 'none') {
    if (el) ANIMS.forEach((a) => { if (a !== 'none') el.classList.remove('anim-' + a); });
    return;
  }
  ANIMS.forEach((a) => { if (a !== 'none') el.classList.remove('anim-' + a); });
  el.classList.add('anim-' + cfg.type);
  el.style.setProperty('--ad', (cfg.dur || 2) + 's');
  el.style.setProperty('--adl', (cfg.del || 0) + 's');
}

/**
 * Format seconds to M:SS.
 */
export function formatTime(s) {
  return Math.floor(s / 60) + ':' + Math.floor(s % 60).toString().padStart(2, '0');
}

/**
 * Safe JSON parse with fallback.
 */
export function safeJSON(str, fallback = null) {
  try {
    if (str == null) return fallback;
    const parsed = JSON.parse(str);
    return parsed != null ? parsed : fallback;
  } catch { return fallback; }
}

/**
 * Debounce a function.
 */
export function debounce(fn, ms) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}
