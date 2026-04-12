// ═══ DACEWAV Admin — Core Module ═══
// Undo/redo, auto-save, preview, theme collect/load, hero/banner preview,
// glow, animation controls, presets, particles, emojis, change log, export/import

import { ANIMS } from './config.js';
import {
  db, T, setT, siteSettings, customEmojis, floatingEls,
  _undoStack,
  _iframeReady, setIframeReady, _ldTheme, _ldSettings, _ldBeats,
  setLdTheme, setLdSettings, setLdBeats,
  ppCtx, ppParts, ppAnim, setPpCtx, setPpParts, setPpAnim
} from './state.js';
import { pushUndo, pushUndoInitial, undo, redo, setUndoDeps } from './undo.js';
import {
  renderGradEditor, buildGradCSS, addGradStop, updateGradStop,
  rmGradStop, startDragStop, applyGradToHero
} from './gradient.js';
import {
  logChange, renderChangeLog, logFieldChange, addTooltips
} from './changelog.js';
import {
  renderFloatingEditor, renderFloatingPreview, addFE, saveFE, rmFE
} from './floating.js';
import {
  takeSnapshot, renderSnapshots, loadSnapshot, rmSnapshot,
  populateDiffSelects, updateDiff, promptImportURL, importThemeFromURL,
  setSnapshotDeps
} from './snapshots.js';
import {
  renderEmojiGrid, insertEmoji, renderCustomEmojis, addCustomEmoji,
  uploadEmojiFile, removeCE, setEmojiDeps
} from './emojis.js';
import {
  g, val, setVal, checked, setChecked, hexRgba, hexFromRgba, rgbaFromHex,
  loadFont, showToast, showSaving, fmt, sv, resetSlider, toggleCard, setAutoSaveRef,
  confirmInline, promptInline
} from './helpers.js';
import { loadColorValues } from './colors.js';

let _autoSaveTimer = null;
let _broadcastTimer = null;
let _lastBroadcastJSON = '';

// Undo/redo → src/admin/undo.js

// ═══ AUTO-SAVE ═══
export function autoSave() {
  clearTimeout(_autoSaveTimer);
  pushUndo();
  logFieldChange();
  // broadcastTheme() is debounced — don't collect here, let _doBroadcast handle it
  broadcastTheme();
  const dot = g('sdot'); dot.className = 'sdot';
  _autoSaveTimer = setTimeout(() => {
    const theme = collectTheme();
    localStorage.setItem('dace-theme', JSON.stringify(theme));
    if (!db) { dot.className = 'sdot ok'; return; }
    _collectSiteSettings();
    const p1 = db.ref('theme').update(theme).catch(() => {});
    const p2 = db.ref('settings').update(siteSettings).catch(() => {});
    Promise.all([p1, p2]).then(() => { dot.className = 'sdot ok'; setTimeout(() => dot.className = 'sdot', 2000); }).catch(() => { dot.className = 'sdot err' });
  }, 2000);
}
export function saveAll() {
  const theme = collectTheme(); pushUndo();
  localStorage.setItem('dace-theme', JSON.stringify(theme));
  _collectSiteSettings();
  localStorage.setItem('dace-settings', JSON.stringify(siteSettings));
  showSaving(true);
  if (db) {
    Promise.all([db.ref('theme').set(theme), db.ref('settings').update(siteSettings)])
      .then(() => { showSaving(false); showToast('Todo guardado ✓') })
      .catch(() => { showSaving(false); showToast('Error al guardar', true) });
  } else { showSaving(false); showToast('Guardado local ✓'); }
}
export function _collectSiteSettings() {
  siteSettings.siteName = val('s-name') || 'DACE';
  siteSettings.whatsapp = val('s-wa') || '';
  siteSettings.instagram = val('s-ig') || '';
  siteSettings.email = val('s-email') || '';
  siteSettings.heroTitle = val('s-hero') || '';
  siteSettings.heroSubtitle = val('s-sub') || '';
  siteSettings.dividerTitle = val('s-div-title') || '';
  siteSettings.dividerSub = val('s-div-sub') || '';
  siteSettings.dividerTitleSegments = tczGetSegments('div-tcz');
  siteSettings.dividerTitleSize = parseFloat(val('d-title-size')) || 3;
  siteSettings.dividerLetterSpacing = parseFloat(val('d-ls')) || -0.04;
  siteSettings.dividerSubColor = val('d-sub-clr') || '';
  siteSettings.dividerSubSize = parseInt(val('d-sub-size')) || 13;
  siteSettings.dividerGlowOn = checked('d-glow-on');
  siteSettings.dividerGlowInt = parseFloat(val('d-glow-int')) || 1;
  siteSettings.dividerGlowBlur = parseInt(val('d-glow-blur')) || 20;
  siteSettings.testimonialsActive = checked('s-testi');
  siteSettings.bannerActive = checked('b-active');
  siteSettings.bannerText = val('b-text') || '';
  siteSettings.bannerBg = val('b-bg') || '#7f1d1d';
  siteSettings.bannerSpeed = parseInt(val('b-speed')) || 20;
  siteSettings.bannerAnim = val('b-anim') || 'scroll';
  siteSettings.bannerEasing = val('b-easing') || 'linear';
  siteSettings.bannerDir = val('b-dir') || 'normal';
  siteSettings.bannerDelay = parseFloat(val('b-delay')) || 0;
  siteSettings.bannerTxtClr = val('b-txt-clr') || '#ffffff';
  // R2 config — auto-save alongside other settings
  const r2Url = val('r2-worker-url') || '';
  const r2Token = val('r2-upload-token') || '';
  if (r2Url || r2Token) {
    siteSettings.r2Config = { workerUrl: r2Url, uploadToken: r2Token };
  }
}

// Wire up helpers autoSave reference
setAutoSaveRef(autoSave);

// Wire up undo/redo dependencies (breaks circular import with undo.js)
setUndoDeps({ collectTheme, loadThemeUI, broadcastThemeNow });

// Wire up snapshot dependencies
setSnapshotDeps({ collectTheme, loadThemeUI, autoSave });

// Wire up emoji dependencies
setEmojiDeps({ updateBannerPv, autoSave });

// ═══ IFRAME COMMUNICATION ═══
const PM_ORIGIN = (() => {
  try { return window.location.origin || '*'; } catch { return '*'; }
})();

// Post to iframe with fallback: try specific origin first, then '*'
// Exported — any module can import this to send messages to the store iframe.
export function postToFrame(msg) {
  const frame = g('preview-frame');
  if (!frame || !frame.contentWindow) return;
  try { frame.contentWindow.postMessage(msg, PM_ORIGIN); } catch {}
  if (PM_ORIGIN !== '*') { try { frame.contentWindow.postMessage(msg, '*'); } catch {} }
}
// Internal alias for backwards compat
const _postToFrame = postToFrame;

export function broadcastTheme() {
  // Debounce: only broadcast after 150ms of no calls (smooth slider dragging)
  // Increased from 80ms to batch more aggressively and reduce iframe thrashing
  clearTimeout(_broadcastTimer);
  _broadcastTimer = setTimeout(_doBroadcast, 150);
}

function _doBroadcast() {
  const theme = collectTheme();
  const json = JSON.stringify(theme);
  // Dedup: skip if nothing changed
  if (json === _lastBroadcastJSON) return;
  _lastBroadcastJSON = json;
  // Batch: single postMessage instead of 4 separate calls
  _postToFrame({
    type: 'admin-batch-update',
    theme,
    settings: siteSettings,
    emojis: customEmojis,
    elements: floatingEls
  });
}

// Force broadcast immediately (for undo/redo, preset changes, etc.)
export function broadcastThemeNow() {
  clearTimeout(_broadcastTimer);
  _lastBroadcastJSON = ''; // force send
  _doBroadcast();
}
export function broadcastHighlight(selector) { _postToFrame({ type: 'highlight-element', selector }); }
export function clearHighlight() { if (_iframeReady) _postToFrame({ type: 'clear-highlight' }); }
window.addEventListener('message', function (e) {
  // Accept messages from same origin OR from the iframe's origin
  const frame = g('preview-frame');
  const frameOrigin = frame?.contentWindow ? '*' : PM_ORIGIN;
  if (e.origin !== PM_ORIGIN && PM_ORIGIN !== '*' && e.origin !== 'null') return;
  const d = e.data; if (!d || !d.type) return;
  if (d.type === 'index-ready') { setIframeReady(true); broadcastTheme(); showToast('Preview conectado ✓'); }
  if (d.type === 'element-clicked' && d.info) {
    const map = { 'hero-title': 'hero', 'hero-eyebrow': 'hero', 'hero-sub': 'hero', 'hero': 'hero', 'nav': 'layout', 'beat-card': 'elements', 'btn-lic': 'elements', 'wbar': 'elements', 'player-bar': 'layout' };
    for (const [sel, sec] of Object.entries(map)) { if (d.info.classes && d.info.classes.includes(sel)) { showSectionNav(sec); break; } }
  }
});
export function refreshIframe() {
  setIframeReady(false);
  const f = g('preview-frame');
  if (f) { f.src = f.src; showToast('Recargando preview...'); }
}
export function loadPreviewURL() {
  const url = g('preview-url')?.value?.trim(); if (!url) return;
  const f = g('preview-frame'); if (f) f.src = url; showToast('Cargando: ' + url);
}
export function setViewport(mode) {
  var f = g('preview-frame'); if (!f) return;
  f.className = mode;
  var widths = { mobile: 375, tablet: 768, desktop: Math.max(400, Math.round(window.innerWidth * 0.5)) };
  var w = widths[mode] || 380;
  if (typeof window._syncPanel === 'function') window._syncPanel(w);
  else {
    var panel = g('preview-panel');
    if (panel) panel.style.width = w + 'px';
  }
  document.querySelectorAll('.preview-bar-center .vp-btn').forEach(b => b.classList.remove('on'));
  const btnMap = { mobile: 0, tablet: 1, desktop: 2 };
  document.querySelectorAll('.preview-bar-center .vp-btn')[btnMap[mode]]?.classList.add('on');
}
// Circular dep workaround: nav showSection called from message handler
let showSectionNav = () => {};
export function setShowSectionNav(fn) { showSectionNav = fn; }

// ═══ INSPECTOR ═══
export function toggleInspector() {
  const btn = g('inspector-btn');
  const isActive = btn.classList.toggle('acc');
  const frame = g('preview-frame');
  if (frame && frame.contentWindow) frame.contentWindow.postMessage({ type: 'inspector-mode', enabled: isActive }, PM_ORIGIN);
  showToast(isActive ? 'Inspector ON — haz clic en el preview' : 'Inspector OFF');
}

// ═══ ADMIN THEME ═══
export function toggleAdminTheme() {
  document.body.classList.toggle('light');
  const isLight = document.body.classList.contains('light');
  g('theme-toggle').innerHTML = isLight ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  localStorage.setItem('dace-admin-theme', isLight ? 'light' : 'dark');
}

// ═══ HERO PREVIEW ═══
// ═══ HERO PREVIEW — Clean rewrite ═══
// Reads all hero-related inputs and renders the preview in #hero-pv
export function updateHeroPv() {
  // Collect values with safe fallbacks
  const $ = (id) => document.getElementById(id);
  const v = (id, def) => { const el = $(id); return el ? el.value : def; };
  const c = (id) => { const el = $(id); return el ? el.checked : false; };

  const accent = v('tc-glow') || '#dc2626';
  const fd = v('t-font-d', 'Syne');

  // Title
  const titleRaw = v('h-title', 'Beats que\ndefinen géneros.');
  const lines = titleRaw.split('\n');
  const lastLine = lines[lines.length - 1] || '';
  const otherLines = lines.slice(0, -1);

  // Glow/stroke on last word
  const strokeOn = c('h-stroke-on');
  const strokeW = parseFloat(v('h-stroke-w', '1')) || 1;
  const wordBlur = parseInt(v('h-word-blur', '10')) || 10;
  const wordOp = parseFloat(v('h-word-op', '0.35'));
  const strokeClr = v('h-stroke-clr', accent);
  const glowClr = v('h-glow-clr', accent);

  // Title glow
  const glowOn = c('h-glow-on');
  const glowInt = parseFloat(v('h-glow-int', '1'));
  const glowBlur = parseInt(v('h-glow-blur', '20')) || 20;

  // Typography
  const titleSize = parseFloat(v('h-title-size', '2.8'));
  const ls = parseFloat(v('h-ls', '-0.04'));
  const lh = parseFloat(v('h-lh', '1'));

  // Gradient background
  const gradOn = c('h-grad-on');
  const gradClr = v('h-grad-clr', accent);
  const gradOp = parseFloat(v('h-grad-op', '0.14'));
  const gradW = parseInt(v('h-grad-w', '80')) || 80;
  const gradH = parseInt(v('h-grad-h', '60')) || 60;

  // Eyebrow
  const eyebrowOn = c('h-eyebrow-on');
  const eyebrowText = v('h-eyebrow', 'En vivo · Puebla, MX');
  const eyebrowClr = v('h-eyebrow-clr', accent);
  const eyebrowSize = parseInt(v('h-eyebrow-size', '10')) || 10;

  // Text color
  const textClr = v('h-text-clr', '#f0f0f2');

  // Subtitle
  const subText = v('h-sub', 'Puebla, MX · Trap · R&B · Drill');

  // ── Apply to preview ──
  const pv = $('hero-pv');
  if (!pv) return;

  // Gradient
  const pvg = $('hpv-grad');
  if (pvg) {
    pvg.style.background = gradOn
      ? 'radial-gradient(ellipse ' + gradW + '% ' + gradH + '% at 50% 0%, ' + hexRgba(gradClr, gradOp) + ', transparent)'
      : 'none';
  }

  // Eyebrow
  const pve = $('hpv-eyebrow');
  if (pve) {
    if (eyebrowOn && eyebrowText) {
      pve.style.display = 'inline-flex';
      pve.style.color = eyebrowClr;
      pve.style.borderColor = hexRgba(eyebrowClr, 0.3);
      pve.style.background = hexRgba(eyebrowClr, 0.08);
      pve.style.fontSize = eyebrowSize + 'px';
      const dot = pve.querySelector('.hero-pv-eyebrow-dot');
      if (dot) dot.style.background = eyebrowClr;
      const pvet = $('hpv-eyebrow-text');
      if (pvet) pvet.textContent = eyebrowText;
    } else {
      pve.style.display = 'none';
    }
  }

  // Title
  const pvt = $('hpv-title');
  if (pvt) {
    pvt.style.fontFamily = "'" + fd + "', sans-serif";
    pvt.style.fontSize = titleSize + 'rem';
    pvt.style.letterSpacing = ls + 'em';
    pvt.style.lineHeight = String(lh);
    pvt.style.textShadow = glowOn ? '0 0 ' + glowBlur + 'px ' + hexRgba(glowClr, glowInt) : 'none';

    // Build title HTML
    let html = '';
    const heroSegs = tczGetSegments('hero-tcz');
    const hasColoredSegs = heroSegs.length && heroSegs.some(s => s.c);

    if (hasColoredSegs) {
      // Use colorizer segments - each word rendered with its color
      // Still apply glow/stroke to the last visual line
      const segHTML = segmentsToHTML(heroSegs);
      // For glow/stroke, wrap the whole thing
      if (strokeOn || glowOn) {
        const classes = ['glow-word'];
        const styles = ['--hw-blur:' + wordBlur + 'px', '--hw-op:' + wordOp];
        if (strokeOn) {
          classes.push('stroke-mode');
          styles.push('-webkit-text-stroke:' + strokeW + 'px ' + strokeClr);
        }
        html = '<span class="' + classes.join(' ') + '" style="' + styles.join(';') + '">' + segHTML + '</span>';
      } else {
        html = segHTML;
      }
    } else {
      // Original logic: split by lines, last line gets glow/stroke
      if (otherLines.length) {
        html += '<span style="color:' + textClr + '">' + otherLines.map(l => escapeHtml(l)).join('<br>') + '</span><br>';
      }
      if (lastLine) {
        const escapedLine = escapeHtml(lastLine);
        const classes = ['glow-word'];
        const styles = ['--hw-blur:' + wordBlur + 'px', '--hw-op:' + wordOp];
        if (strokeOn) {
          classes.push('stroke-mode');
          styles.push('color:transparent', '-webkit-text-stroke:' + strokeW + 'px ' + strokeClr);
        } else {
          styles.push('color:' + textClr);
        }
        html += '<span class="' + classes.join(' ') + '" data-t="' + escapedLine + '" style="' + styles.join(';') + '">' + escapedLine + '</span>';
      }
    }
    pvt.innerHTML = html;
  }

  // Subtitle
  const pvs = $('hpv-sub');
  if (pvs) pvs.textContent = subText;
}

// Safe HTML escape for user input
function escapeHtml(s) {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ═══ BANNER PREVIEW ═══
export function updateBannerPv() {
  let text = val('b-text') || 'Preview del banner...';
  (customEmojis || []).forEach(e => { if (e.name && e.url) text = text.split(':' + e.name + ':').join('<img src="' + e.url + '" style="height:' + (e.height || 24) + 'px;vertical-align:middle">') });
  const bp = g('banner-pv'); if (!bp) return;
  bp.style.background = val('b-bg') || '#7f1d1d';
  const anim = val('b-anim') || 'scroll';
  const speed = val('b-speed') || 20;
  const easing = val('b-easing') || 'linear';
  const dir = val('b-dir') || 'normal';
  const delay = parseFloat(val('b-delay')) || 0;
  const txtClr = val('b-txt-clr') || '#ffffff';
  const durMap = { 'scroll': speed + 's', 'fade-pulse': (speed / 5) + 's', 'bounce': (speed / 10) + 's', 'glow-pulse': (speed / 5) + 's', 'static': '' };
  const dur = durMap[anim] || speed + 's';
  const animCss = anim === 'static' ? '' : 'animation:bp-' + anim + ' ' + dur + ' ' + easing + ' ' + delay + 's infinite ' + dir;
  bp.innerHTML = '<span style="display:inline-block;white-space:nowrap;color:' + txtClr + ';' + animCss + '">' + text + '</span>';
}

// ═══ DIVIDER PREVIEW ═══
export function updateDividerPv() {
  const pvTitle = g('div-pv-title'); if (!pvTitle) return;
  const segments = tczGetSegments('div-tcz');
  if (segments.length) {
    pvTitle.innerHTML = segmentsToHTML(segments);
  }
  // Apply styles
  const titleSize = parseFloat(val('d-title-size')) || 3;
  const ls = parseFloat(val('d-ls')) || -0.04;
  const glowOn = checked('d-glow-on');
  const glowInt = parseFloat(val('d-glow-int')) || 1;
  const glowBlur = parseInt(val('d-glow-blur')) || 20;
  const accent = val('tc-glow') || '#dc2626';

  pvTitle.style.fontSize = titleSize + 'rem';
  pvTitle.style.letterSpacing = ls + 'em';
  pvTitle.style.textShadow = glowOn ? '0 0 ' + glowBlur + 'px ' + hexRgba(accent, glowInt * 0.5) : 'none';

  const pvSub = g('div-pv-sub');
  if (pvSub) {
    pvSub.textContent = val('s-div-sub') || '';
    pvSub.style.color = val('d-sub-clr') || 'var(--mu)';
    pvSub.style.fontSize = (parseInt(val('d-sub-size')) || 13) + 'px';
  }
}

// ═══ INIT TEXT COLORIZERS ═══
export function initTextColorizers() {
  // Divider colorizer
  const divTitle = val('s-div-title') || 'Todo fire. Zero filler.';
  const divSegments = _tczParseHTML(divTitle);
  renderTextColorizer('div-tcz', 's-div-title', divSegments);

  // Hero colorizer
  const heroTitle = val('h-title') || 'Beats que\ndefinen géneros.';
  const heroSegments = _tczParseHTML(heroTitle.replace(/\n/g, '\n'));
  renderTextColorizer('hero-tcz', 'h-title', heroSegments);
}

// ═══ GLOW EFFECTS ═══
const _glowDescs = {
  'text-shadow': 'Resplandor suave alrededor del texto. El más común y ligero.',
  'box-shadow': 'Sombra rectangular detrás del elemento. Ideal para tarjetas y contenedores.',
  'drop-shadow': 'Sombra que sigue la forma del texto/imagen. Bueno para logos con transparencia.',
  'neon-blur': 'Efecto neón difuminado. Intenso, como un letrero de neón visto de lejos.',
  'neon-sign': 'Neón nítido con borde definido. Parece un letrero de neón real.',
  'outer-glow': 'Resplandor externo uniforme. Suave y elegante, buen fondo oscuro.',
  'inner-glow': 'Brillo desde dentro del elemento. Da sensación de iluminación interna.'
};
const _glowAnimDescs = {
  'none': 'Sin animación', 'pulse': 'Palpita: se intensifica y atenúa rítmicamente',
  'breathe': 'Respira: crece y decrece suavemente como respiración',
  'flicker': 'Parpadeo: imita neón con fallas eléctricas aleatorias',
  'rainbow': 'Arcoíris: rota colores continuamente', 'wave': 'Onda: varía la intensidad como una onda sinusoidal',
  'neon-flicker': 'Neón clásico: parpadeo rápido como tubo de neón real',
  'holograma': 'Holograma: rota brillo y tono como una tarjeta holográfica'
};
export function updateGlowDesc() { const el = g('glow-desc'); if (el) el.textContent = _glowDescs[val('t-glow-type')] || ''; }
export function updateGlowAnimDesc() { const el = g('glow-anim-desc'); if (el) el.textContent = _glowAnimDescs[val('t-glow-anim')] || ''; }
export function computeGlowCSS(type, blur, spread, int, color) {
  const c = hexRgba(color, int);
  switch (type) {
    case 'text-shadow': return { textShadow: '0 0 ' + blur + 'px ' + c, boxShadow: 'none', filter: 'none' };
    case 'box-shadow': return { textShadow: 'none', boxShadow: '0 0 ' + blur + 'px ' + spread + 'px ' + c, filter: 'none' };
    case 'drop-shadow': return { textShadow: 'none', boxShadow: 'none', filter: 'drop-shadow(0 0 ' + blur + 'px ' + c + ')' };
    case 'neon-blur': return { textShadow: '0 0 ' + (blur * .3) + 'px ' + c + ',0 0 ' + blur + 'px ' + hexRgba(color, int * .6), boxShadow: 'none', filter: 'none' };
    case 'neon-sign': return { textShadow: '0 0 ' + (blur * .2) + 'px ' + hexRgba(color, .9) + ',0 0 ' + (blur * .5) + 'px ' + hexRgba(color, .7) + ',0 0 ' + blur + 'px ' + hexRgba(color, .4), boxShadow: '0 0 ' + (blur * .3) + 'px ' + spread + 'px ' + hexRgba(color, .3), filter: 'none' };
    case 'outer-glow': return { textShadow: 'none', boxShadow: '0 0 ' + (blur * .5) + 'px ' + spread + 'px ' + hexRgba(color, .4) + ',0 0 ' + blur + 'px ' + (spread * 2) + 'px ' + hexRgba(color, .2), filter: 'none' };
    case 'inner-glow': return { textShadow: 'none', boxShadow: 'inset 0 0 ' + (blur * .5) + 'px ' + spread + 'px ' + hexRgba(color, .5), filter: 'none' };
    default: return { textShadow: '0 0 ' + blur + 'px ' + c, boxShadow: 'none', filter: 'none' };
  }
}
export function applyGlowTo(el, type, blur, spread, int, color, active) {
  if (!el) return;
  if (!active) { el.style.textShadow = 'none'; el.style.boxShadow = 'none'; el.style.filter = 'none'; return; }
  const css = computeGlowCSS(type, blur, spread, int, color);
  el.style.textShadow = css.textShadow; el.style.boxShadow = css.boxShadow; el.style.filter = css.filter;
}

// ═══ GLOW PRESETS ═══
const GLOW_PRESETS = {
  soft:    { type: 'text-shadow', blur: 30, int: 0.6, op: 0.8, anim: 'breathe', speed: 3 },
  neon:    { type: 'neon-sign', blur: 25, int: 1.5, op: 1, anim: 'neon-flicker', speed: 4 },
  fire:    { type: 'neon-blur', blur: 20, int: 1.2, op: 0.9, anim: 'pulse', speed: 1.5 },
  ice:     { type: 'outer-glow', blur: 35, int: 0.8, op: 0.7, anim: 'breathe', speed: 4 },
  toxic:   { type: 'neon-sign', blur: 22, int: 1.3, op: 1, anim: 'flicker', speed: 2 },
  sunset:  { type: 'text-shadow', blur: 28, int: 1, op: 0.85, anim: 'wave', speed: 3 },
  royal:   { type: 'neon-blur', blur: 18, int: 1.1, op: 0.95, anim: 'pulse', speed: 2.5 },
  disco:   { type: 'neon-sign', blur: 30, int: 1.8, op: 1, anim: 'rainbow', speed: 2 },
};
export function applyGlowPreset(name) {
  const p = GLOW_PRESETS[name]; if (!p) return;
  setVal('t-glow-type', p.type);
  setVal('t-glow-blur', p.blur);
  setVal('t-glow-int', p.int);
  setVal('t-glow-op', p.op);
  setVal('t-glow-anim', p.anim);
  setVal('t-glow-speed', p.speed);
  setChecked('t-glow', true);
  // Update slider displays
  document.querySelectorAll('#t-glow-blur, #t-glow-int, #t-glow-op, #t-glow-speed').forEach(el => sv(el));
  updatePreview();
  updateGlowDesc();
  updateGlowAnimDesc();
  autoSave();
  showToast('Glow preset: ' + name);
}

// ═══ PREVIEW UPDATE ═══
export function updatePreview() {
  const accent = val('tc-glow') || val('tt-glow') || '#dc2626';
  const gType = val('t-glow-type') || 'text-shadow';
  const blur = parseInt(val('t-glow-blur')) || 20;
  const spread = parseInt(val('t-glow-spread')) || 0;
  const int = parseFloat(val('t-glow-int')) || 1;
  const gOp = parseFloat(val('t-glow-op')) || 1;
  const active = checked('t-glow');
  ['gp-box', 'gp-text', 'gp-btn'].forEach(id => {
    const el = g(id); if (!el) return;
    applyGlowTo(el, gType, blur, spread, int * gOp, accent, active);
    if (el.id === 'gp-box') { el.style.color = accent; }
  });
  const anim = val('t-glow-anim') || 'none';
  const speed = parseFloat(val('t-glow-speed')) || 2;
  ['gp-box', 'gp-text', 'gp-btn'].forEach(id => {
    const el = g(id); if (!el) return;
    el.classList.remove('gap-anim-pulse', 'gap-anim-breathe', 'gap-anim-flicker', 'gap-anim-rainbow', 'gap-anim-wave', 'gap-anim-neon-flicker', 'gap-anim-holograma');
    if (anim !== 'none') { el.classList.add('gap-anim-' + anim); el.style.setProperty('--ga-s', speed + 's'); }
  });
  updateHeroPv();
  // Note: broadcast handled by autoSave() caller — don't duplicate here
}

// ═══ COLLECT THEME ═══
export function collectTheme() {
  return {
    bg: val('tc-bg-h') || '#060404', surface: val('tc-surface-h') || '#0f0808', surface2: val('tc-surface2-h') || '#1a0c0c',
    text: val('tc-text-h') || '#f5eeee', muted: val('tc-muted-h') || 'rgba(245,238,238,0.5)', hint: val('tc-hint-h') || 'rgba(245,238,238,0.2)',
    border: val('tc-border-h') || 'rgba(255,255,255,0.06)', border2: val('tc-border2-h') || 'rgba(255,255,255,0.12)',
    accent: val('tc-accent-h') || '#dc2626', red: val('tc-red-h') || '#7f1d1d', redL: val('tc-red-l-h') || '#991b1b',
    fontDisplay: val('t-font-d') || 'Syne', fontBody: val('t-font-m') || 'DM Mono',
    fontSize: parseInt(val('t-font-size')) || 14, lineHeight: parseFloat(val('t-line-h')) || 1.7,
    logoUrl: val('t-logo-url'), logoWidth: parseInt(val('t-logo-w')) || 80, logoHeight: 0,
    logoRotation: parseInt(val('t-logo-rot')) || 0, logoScale: parseFloat(val('t-logo-scale')) || 1,
    logoTextGap: parseInt(val('t-logo-gap')) || 12, showLogoText: checked('t-logo-text'),
    glowActive: checked('t-glow'), glowColor: val('tt-glow') || '#dc2626',
    glowType: val('t-glow-type') || 'text-shadow', glowBlur: parseInt(val('t-glow-blur')) || 20,
    glowSpread: parseInt(val('t-glow-spread')) || 0, glowIntensity: parseFloat(val('t-glow-int')) || 1,
    glowOpacity: parseFloat(val('t-glow-op')) || 1, glowAnim: val('t-glow-anim') || 'none',
    blurBg: parseFloat(val('t-blur')) || 24, cardOpacity: parseFloat(val('t-card-op')) || 1,
    grainOpacity: parseFloat(val('t-grain')) || 0.3, radiusGlobal: parseInt(val('t-radius')) || 10,
    bgOpacity: parseFloat(val('t-bg-op')) || 1, btnOpacityNormal: parseFloat(val('t-btn-op')) || 1,
    btnOpacityHover: parseFloat(val('t-btn-hop')) || 0.85, waveOpacityOff: parseFloat(val('t-wbar-op')) || 0.18,
    waveOpacityOn: parseFloat(val('t-wbar-aop')) || 1, wbarColor: val('tt-wbar') || 'rgba(255,255,255,0.18)',
    wbarActive: val('tt-wbar-a') || '#dc2626', btnLicBg: val('tt-btn-bg') || 'rgba(185,28,28,0.1)',
    btnLicClr: val('tt-btn-clr') || '#dc2626', btnLicBdr: val('tt-btn-bdr') || 'rgba(185,28,28,0.5)',
    padSection: parseFloat(val('t-pad')) || 4, beatGap: parseInt(val('t-gap')) || 16,
    cardShadowColor: val('tc-shadow') || '#000000', cardShadowIntensity: parseFloat(val('t-shadow-int')) || 0.5,
    particlesOn: checked('p-on'), particlesColor: val('p-color') || '#dc2626',
    particlesCount: parseInt(val('p-count')) || 40, particlesMin: parseInt(val('p-min')) || 2,
    particlesMax: parseInt(val('p-max')) || 6, particlesSpeed: parseFloat(val('p-speed')) || 1,
    particlesType: val('p-type') || 'circle', particlesOpacity: parseFloat(val('p-opacity')) || 0.5,
    particlesText: val('p-text') || '♪', particlesImgUrl: val('p-img-url') || '',
    bannerText: val('b-text') || '', bannerBg: val('b-bg') || '#7f1d1d', bannerSpeed: parseInt(val('b-speed')) || 20,
    bannerEasing: val('b-easing') || 'linear', bannerDir: val('b-dir') || 'normal', bannerDelay: parseFloat(val('b-delay')) || 0, bannerTxtClr: val('b-txt-clr') || '#ffffff',
    animLogo: collectAnim('logo'), animTitle: collectAnim('title'), animPlayer: collectAnim('player'),
    animCards: collectAnim('cards'), animButtons: collectAnim('buttons'), animWaveform: collectAnim('waveform'),
    layout: { heroMarginTop: parseFloat(val('t-hero-top')) || 7, playerBottom: parseInt(val('t-player-bot')) || 0, logoOffsetX: parseInt(val('t-logo-ox')) || 0 },
    heroTitleCustom: val('h-title') || '', heroSubCustom: val('h-sub') || '', heroEyebrow: val('h-eyebrow') || '',
    heroTitleSegments: tczGetSegments('hero-tcz'),
    heroGlowOn: checked('h-glow-on'), heroGlowInt: parseFloat(val('h-glow-int')) || 1, heroGlowBlur: parseInt(val('h-glow-blur')) || 20, heroGlowClr: val('h-glow-clr') || '#dc2626',
    heroStrokeOn: checked('h-stroke-on'), heroStrokeW: parseFloat(val('h-stroke-w')) || 1, heroWordBlur: parseInt(val('h-word-blur')) || 10, heroWordOp: parseFloat(val('h-word-op')) || 0.35, heroStrokeClr: val('h-stroke-clr') || '#dc2626',
    heroGradOn: checked('h-grad-on'), heroGradClr: val('h-grad-clr') || '#dc2626', heroGradOp: parseFloat(val('h-grad-op')) || 0.14, heroGradW: parseInt(val('h-grad-w')) || 80, heroGradH: parseInt(val('h-grad-h')) || 60,
    heroTitleSize: parseFloat(val('h-title-size')) || 2.8, heroPadTop: parseFloat(val('h-pad-top')) || 7, heroLetterSpacing: parseFloat(val('h-ls')) || -0.04, heroLineHeight: parseFloat(val('h-lh')) || 1,
    heroEyebrowOn: checked('h-eyebrow-on'), heroEyebrowClr: val('h-eyebrow-clr') || '#dc2626', heroEyebrowSize: parseInt(val('h-eyebrow-size')) || 10,
    heroTextClr: val('h-text-clr') || '#f0f0f2',
    navOpacity: parseFloat(val('t-nav-op')) || 0.88,
    beatImgOpacity: parseFloat(val('t-beat-img-op')) || 1,
    textOpacity: parseFloat(val('t-text-op')) || 1,
    heroBgOpacity: parseFloat(val('t-hero-bg-op')) || 1,
    sectionOpacity: parseFloat(val('t-section-op')) || 1,
    orbBlendMode: val('t-orb-blend') || 'normal',
    grainBlendMode: val('t-grain-blend') || 'overlay',
    glowAnimSpeed: parseFloat(val('t-glow-speed')) || 2,
    wbarHeight: parseInt(val('t-wbar-h')) || 12,
    wbarRadius: parseInt(val('t-wbar-r')) || 2,
    fontWeight: val('t-font-weight') || '800'
  };
}

// ═══ LOAD THEME UI ═══
export function loadThemeUI() {
  if (!T || !Object.keys(T).length) return;
  const s = (id, v) => { const el = g(id); if (el && v != null) el.value = v; };
  s('tc-bg-h', T.bg); s('tc-surface-h', T.surface); s('tc-surface2-h', T.surface2);
  s('tc-text-h', T.text); s('tc-muted-h', T.muted); s('tc-hint-h', T.hint);
  s('tc-border-h', T.border); s('tc-border2-h', T.border2);
  s('tc-accent-h', T.accent); s('tc-red-h', T.red); s('tc-red-l-h', T.redL);
  s('t-font-d', T.fontDisplay); s('t-font-m', T.fontBody);
  if (g('fp-display-btn')) g('fp-display-btn').textContent = T.fontDisplay || 'Syne';
  if (g('fp-body-btn')) g('fp-body-btn').textContent = T.fontBody || 'DM Mono';
  s('t-font-size', T.fontSize); s('t-line-h', T.lineHeight);
  s('t-logo-url', T.logoUrl); s('t-logo-w', T.logoWidth);
  s('t-logo-rot', T.logoRotation || 0); s('t-logo-scale', T.logoScale || 1); s('t-logo-gap', T.logoTextGap || 12);
  setChecked('t-logo-text', T.showLogoText);
  s('tc-glow', T.glowColor || T.accent); s('tt-glow', T.glowColor || T.accent);
  s('t-glow-type', T.glowType || 'text-shadow'); s('t-glow-blur', T.glowBlur); s('t-glow-int', T.glowIntensity); s('t-glow-op', T.glowOpacity); s('t-glow-anim', T.glowAnim || 'none');
  setChecked('t-glow', T.glowActive);
  s('t-blur', T.blurBg); s('t-card-op', T.cardOpacity); s('t-grain', T.grainOpacity); s('t-radius', T.radiusGlobal);
  s('t-bg-op', T.bgOpacity); s('t-btn-op', T.btnOpacityNormal); s('t-btn-hop', T.btnOpacityHover);
  s('t-wbar-op', T.waveOpacityOff); s('t-wbar-aop', T.waveOpacityOn);
  s('tt-wbar', T.wbarColor); s('tt-wbar-a', T.wbarActive);
  s('tt-btn-bg', T.btnLicBg); s('tt-btn-clr', T.btnLicClr); s('tt-btn-bdr', T.btnLicBdr);
  s('t-pad', T.padSection); s('t-gap', T.beatGap);
  s('tc-shadow', T.cardShadowColor); s('t-shadow-int', T.cardShadowIntensity);
  s('p-color', T.particlesColor); s('p-count', T.particlesCount); s('p-min', T.particlesMin); s('p-max', T.particlesMax); s('p-speed', T.particlesSpeed);
  s('p-type', T.particlesType || 'circle'); s('p-opacity', T.particlesOpacity); s('p-text', T.particlesText || '♪'); s('p-img-url', T.particlesImgUrl || '');
  setChecked('p-on', T.particlesOn);
  togglePFields();
  s('b-text', T.bannerText); s('b-bg', T.bannerBg); s('b-speed', T.bannerSpeed); s('b-anim', T.bannerAnim || 'scroll');
  if (T.layout) { s('t-hero-top', T.layout.heroMarginTop); s('t-player-bot', T.layout.playerBottom); s('t-logo-ox', T.layout.logoOffsetX); }
  if (T.heroTitleCustom) s('h-title', T.heroTitleCustom);
  if (T.heroSubCustom) s('h-sub', T.heroSubCustom);
  if (T.heroEyebrow) s('h-eyebrow', T.heroEyebrow);
  s('h-glow-int', T.heroGlowInt); s('h-glow-blur', T.heroGlowBlur); s('h-glow-clr', T.heroGlowClr);
  setChecked('h-glow-on', T.heroGlowOn); setChecked('h-stroke-on', T.heroStrokeOn);
  s('h-stroke-w', T.heroStrokeW); s('h-word-blur', T.heroWordBlur); s('h-word-op', T.heroWordOp); s('h-stroke-clr', T.heroStrokeClr);
  setChecked('h-grad-on', T.heroGradOn); s('h-grad-clr', T.heroGradClr); s('h-grad-op', T.heroGradOp); s('h-grad-w', T.heroGradW); s('h-grad-h', T.heroGradH);
  s('h-title-size', T.heroTitleSize); s('h-pad-top', T.heroPadTop); s('h-ls', T.heroLetterSpacing); s('h-lh', T.heroLineHeight);
  setChecked('h-eyebrow-on', T.heroEyebrowOn); s('h-eyebrow-clr', T.heroEyebrowClr); s('h-eyebrow-size', T.heroEyebrowSize);
  s('h-text-clr', T.heroTextClr || '#f0f0f2');
  s('t-nav-op', T.navOpacity); s('t-beat-img-op', T.beatImgOpacity); s('t-text-op', T.textOpacity);
  s('t-hero-bg-op', T.heroBgOpacity); s('t-section-op', T.sectionOpacity);
  if (T.orbBlendMode) { var ob = g('t-orb-blend'); if (ob) ob.value = T.orbBlendMode; }
  if (T.grainBlendMode) { var gb = g('t-grain-blend'); if (gb) gb.value = T.grainBlendMode; }
  s('t-glow-speed', T.glowAnimSpeed); s('t-glow-spread', T.glowSpread || 0); s('t-wbar-h', T.wbarHeight); s('t-wbar-r', T.wbarRadius);
  if (T.fontWeight) { var fw = g('t-font-weight'); if (fw) fw.value = T.fontWeight; }
  document.querySelectorAll('.slider-wrap input[type=range]').forEach(el => sv(el));
  loadColorValues();
  const gs = g('gc-swatch'); if (gs) gs.style.background = T.glowColor || T.accent || '#dc2626';
  const ht = g('hpv-title'), he = g('hpv-eyebrow'), hs = g('hpv-sub');
  if (ht && T.heroDragTitleTop != null) { ht.style.top = T.heroDragTitleTop + 'px'; ht.style.left = (T.heroDragTitleLeft || 0) + 'px'; }
  if (he && T.heroDragEyebrowTop != null) { he.style.top = T.heroDragEyebrowTop + 'px'; he.style.left = (T.heroDragEyebrowLeft || 0) + 'px'; }
  if (hs && T.heroDragSubTop != null) { hs.style.top = T.heroDragSubTop + 'px'; hs.style.left = (T.heroDragSubLeft || 0) + 'px'; }
  loadAndPreviewFont(); updatePreview(); updateHeroPv(); updateBannerPv();
  initTextColorizers(); updateDividerPv();
  renderSaveSlots(); buildAnimControls();
  // Save initial state for undo (only if stack is empty — don't reset on undo/redo reloads)
  if (!_undoStack.length) pushUndoInitial();
}

// ═══ SYNC s-hero ↔ h-title ═══
export function setupHeroSync() {
  const sHero = g('s-hero'), hTitle = g('h-title');
  if (sHero && hTitle) {
    sHero.addEventListener('input', function () {
      if (hTitle.value !== sHero.value) { hTitle.value = sHero.value; updateHeroPv(); }
    });
    hTitle.addEventListener('input', function () {
      if (sHero.value !== hTitle.value) sHero.value = hTitle.value;
    });
  }
  // Also sync subtitle
  const sSub = g('s-sub'), hSub = g('h-sub');
  if (sSub && hSub) {
    sSub.addEventListener('input', function () {
      if (hSub.value !== sSub.value) { hSub.value = sSub.value; updateHeroPv(); }
    });
    hSub.addEventListener('input', function () {
      if (sSub.value !== hSub.value) sSub.value = hSub.value;
    });
  }
}

// ═══ LOAD SETTINGS UI ═══
export function loadSettingsUI() {
  setVal('s-name', siteSettings.siteName || 'DACE'); setVal('s-wa', siteSettings.whatsapp || '');
  setVal('s-ig', siteSettings.instagram || ''); setVal('s-email', siteSettings.email || '');
  setVal('s-hero', siteSettings.heroTitle || ''); setVal('s-sub', siteSettings.heroSubtitle || '');
  setVal('s-div-title', siteSettings.dividerTitle || ''); setVal('s-div-sub', siteSettings.dividerSub || '');
  // Divider extra settings
  if (siteSettings.dividerTitleSize) setVal('d-title-size', siteSettings.dividerTitleSize);
  if (siteSettings.dividerLetterSpacing != null) setVal('d-ls', siteSettings.dividerLetterSpacing);
  if (siteSettings.dividerSubColor) setVal('d-sub-clr', siteSettings.dividerSubColor);
  if (siteSettings.dividerSubSize) setVal('d-sub-size', siteSettings.dividerSubSize);
  if (siteSettings.dividerGlowOn) setChecked('d-glow-on', true);
  if (siteSettings.dividerGlowInt != null) setVal('d-glow-int', siteSettings.dividerGlowInt);
  if (siteSettings.dividerGlowBlur) setVal('d-glow-blur', siteSettings.dividerGlowBlur);
  setChecked('s-testi', siteSettings.testimonialsActive);
  setChecked('b-active', siteSettings.bannerActive);
  setVal('b-text', siteSettings.bannerText || '');
  setVal('b-bg', siteSettings.bannerBg || '#7f1d1d');
  setVal('b-speed', siteSettings.bannerSpeed || 20);
  setVal('b-anim', siteSettings.bannerAnim || 'scroll');
  setVal('b-easing', siteSettings.bannerEasing || 'linear');
  setVal('b-dir', siteSettings.bannerDir || 'normal');
  setVal('b-delay', siteSettings.bannerDelay || 0);
  setVal('b-txt-clr', siteSettings.bannerTxtClr || '#ffffff');
  // Init text colorizers after settings are loaded
  initTextColorizers();
  updateDividerPv();
}

// ═══ ANIM CONTROLS ═══
export function buildAnimControls() {
  const els = [{ key: 'logo', label: 'Logo' }, { key: 'title', label: 'Título Hero' }, { key: 'cards', label: 'Tarjetas' }, { key: 'player', label: 'Player' }, { key: 'buttons', label: 'Botones' }, { key: 'waveform', label: 'Waveform' }];
  const sel = ANIMS.map(a => '<option value="' + a + '">' + (a === 'none' ? 'Ninguna' : a) + '</option>').join('');
  g('anim-controls').innerHTML = els.map(el => '<div class="anim-ed"><div class="anim-ed-title">' + el.label + '</div><div class="fg3"><div class="field"><label>Tipo</label><select data-ak="' + el.key + '" data-af="type" onchange="autoSave()">' + sel + '</select></div><div class="field"><label>Velocidad</label><div class="slider-wrap"><input type="range" min="0.5" max="8" step="0.1" value="2" data-ak="' + el.key + '" data-af="dur" oninput="this.nextElementSibling.textContent=parseFloat(this.value).toFixed(1)+\'s\';autoSave()"><span class="slider-val">2.0s</span></div></div><div class="field"><label>Delay</label><div class="slider-wrap"><input type="range" min="0" max="5" step="0.1" value="0" data-ak="' + el.key + '" data-af="del" oninput="this.nextElementSibling.textContent=parseFloat(this.value).toFixed(1)+\'s\';autoSave()"><span class="slider-val">0.0s</span></div></div></div></div>').join('');
  loadAnimValues();
}
export function collectAnim(key) {
  const t = document.querySelector('[data-ak="' + key + '"][data-af="type"]');
  const d = document.querySelector('[data-ak="' + key + '"][data-af="dur"]');
  const l = document.querySelector('[data-ak="' + key + '"][data-af="del"]');
  return { type: t?.value || 'none', dur: parseFloat(d?.value) || 2, del: parseFloat(l?.value) || 0 };
}
export function loadAnimValues() {
  if (!T) return;
  ['logo', 'title', 'player', 'cards', 'buttons', 'waveform'].forEach(key => {
    const a = T['anim' + key.charAt(0).toUpperCase() + key.slice(1)];
    if (!a) return;
    const t = document.querySelector('[data-ak="' + key + '"][data-af="type"]');
    const d = document.querySelector('[data-ak="' + key + '"][data-af="dur"]');
    const l = document.querySelector('[data-ak="' + key + '"][data-af="del"]');
    if (t && a.type) t.value = a.type;
    if (d && a.dur) { d.value = a.dur; d.nextElementSibling.textContent = parseFloat(a.dur).toFixed(1) + 's'; }
    if (l && a.del != null) { l.value = a.del; l.nextElementSibling.textContent = parseFloat(a.del).toFixed(1) + 's'; }
  });
}

// ═══ PRESETS ═══
const PRESETS = [
  { name: 'DACE DARK', bg: '#060404', surface: '#0f0808', surface2: '#1a0c0c', accent: '#dc2626', text: '#f5eeee', muted: 'rgba(245,238,238,0.5)', hint: 'rgba(245,238,238,0.2)', border: 'rgba(255,255,255,0.06)', border2: 'rgba(255,255,255,0.12)', red: '#7f1d1d', redL: '#991b1b', fontDisplay: 'Syne', fontBody: 'DM Mono', glowColor: '#dc2626', colors: ['#060404', '#0f0808', '#dc2626', '#f5eeee'] },
  { name: 'VINTAGE TAPE', bg: '#1a1510', surface: '#2a2218', surface2: '#3a3228', accent: '#c4954a', text: '#e8dcc8', muted: 'rgba(232,220,200,0.55)', hint: 'rgba(232,220,200,0.2)', border: 'rgba(255,240,200,0.08)', border2: 'rgba(255,240,200,0.15)', red: '#8b6914', redL: '#c4954a', fontDisplay: 'Bebas Neue', fontBody: 'Lora', glowColor: '#c4954a', colors: ['#1a1510', '#2a2218', '#c4954a', '#e8dcc8'] },
  { name: 'NEON PUNK', bg: '#0a0014', surface: '#160030', surface2: '#220050', accent: '#e040fb', text: '#f0e6ff', muted: 'rgba(240,230,255,0.5)', hint: 'rgba(240,230,255,0.2)', border: 'rgba(224,64,251,0.08)', border2: 'rgba(224,64,251,0.18)', red: '#7b1fa2', redL: '#e040fb', fontDisplay: 'Anton', fontBody: 'Space Mono', glowColor: '#e040fb', colors: ['#0a0014', '#160030', '#e040fb', '#f0e6ff'] },
  { name: 'CYBERPUNK', bg: '#0d0d0d', surface: '#1a1a1a', surface2: '#2a2a2a', accent: '#fcee09', text: '#e0e0e0', muted: 'rgba(224,224,224,0.5)', hint: 'rgba(224,224,224,0.2)', border: 'rgba(252,238,9,0.06)', border2: 'rgba(252,238,9,0.15)', red: '#b8a900', redL: '#fcee09', fontDisplay: 'Orbitron', fontBody: 'Share Tech Mono', glowColor: '#fcee09', colors: ['#0d0d0d', '#1a1a1a', '#fcee09', '#00fff5'] },
  { name: 'PASTEL WAVE', bg: '#1e1a2e', surface: '#2d2640', surface2: '#3d3656', accent: '#ff8fa3', text: '#f0e6ff', muted: 'rgba(240,230,255,0.5)', hint: 'rgba(240,230,255,0.2)', border: 'rgba(255,143,163,0.08)', border2: 'rgba(255,143,163,0.15)', red: '#9c2750', redL: '#ff8fa3', fontDisplay: 'Comfortaa', fontBody: 'Quicksand', glowColor: '#ff8fa3', colors: ['#1e1a2e', '#2d2640', '#ff8fa3', '#f0e6ff'] },
  { name: 'DARK ACADEMIA', bg: '#12100e', surface: '#1e1a16', surface2: '#2e2a24', accent: '#8b7355', text: '#d4c5a9', muted: 'rgba(212,197,169,0.55)', hint: 'rgba(212,197,169,0.2)', border: 'rgba(139,115,85,0.08)', border2: 'rgba(139,115,85,0.18)', red: '#5c4a2f', redL: '#8b7355', fontDisplay: 'Cinzel', fontBody: 'Lora', glowColor: '#8b7355', colors: ['#12100e', '#1e1a16', '#8b7355', '#d4c5a9'] },
  { name: 'VAPORWAVE', bg: '#1a0a2e', surface: '#2d1b4e', surface2: '#3d2b60', accent: '#ff6b9d', text: '#c4e0ff', muted: 'rgba(196,224,255,0.5)', hint: 'rgba(196,224,255,0.2)', border: 'rgba(255,107,157,0.08)', border2: 'rgba(255,107,157,0.15)', red: '#9c2750', redL: '#ff6b9d', fontDisplay: 'Rajdhani', fontBody: 'IBM Plex Mono', glowColor: '#ff6b9d', colors: ['#1a0a2e', '#2d1b4e', '#ff6b9d', '#c4e0ff'] },
  { name: 'MINIMAL WHITE', bg: '#f8f6f4', surface: '#ffffff', surface2: '#f0ece8', accent: '#1a1a1a', text: '#1a1a1a', muted: 'rgba(26,20,20,0.55)', hint: 'rgba(26,20,20,0.2)', border: 'rgba(0,0,0,0.07)', border2: 'rgba(0,0,0,0.14)', red: '#333333', redL: '#1a1a1a', fontDisplay: 'Sora', fontBody: 'Inter', glowColor: '#1a1a1a', colors: ['#f8f6f4', '#ffffff', '#1a1a1a', '#333333'] },
  { name: 'FOREST GLOW', bg: '#0a120a', surface: '#132013', surface2: '#1e301e', accent: '#4caf50', text: '#c8e6c9', muted: 'rgba(200,230,200,0.5)', hint: 'rgba(200,230,200,0.2)', border: 'rgba(76,175,80,0.08)', border2: 'rgba(76,175,80,0.15)', red: '#2e7d32', redL: '#4caf50', fontDisplay: 'Exo 2', fontBody: 'Fira Code', glowColor: '#4caf50', colors: ['#0a120a', '#132013', '#4caf50', '#c8e6c9'] },
  { name: 'BLOOD MOON', bg: '#0d0404', surface: '#1a0808', surface2: '#2a1010', accent: '#ff1744', text: '#ffcdd2', muted: 'rgba(255,205,210,0.5)', hint: 'rgba(255,205,210,0.2)', border: 'rgba(255,23,68,0.08)', border2: 'rgba(255,23,68,0.18)', red: '#b71c1c', redL: '#ff1744', fontDisplay: 'Archivo Black', fontBody: 'JetBrains Mono', glowColor: '#ff1744', colors: ['#0d0404', '#1a0808', '#ff1744', '#ffcdd2'] },
  { name: 'OCEAN DEEP', bg: '#040d14', surface: '#081a28', surface2: '#0e2838', accent: '#00bcd4', text: '#b2ebf2', muted: 'rgba(178,235,242,0.5)', hint: 'rgba(178,235,242,0.2)', border: 'rgba(0,188,212,0.08)', border2: 'rgba(0,188,212,0.15)', red: '#00838f', redL: '#00bcd4', fontDisplay: 'Unbounded', fontBody: 'Manrope', glowColor: '#00bcd4', colors: ['#040d14', '#081a28', '#00bcd4', '#b2ebf2'] },
  { name: 'RETRO ARCADE', bg: '#0a0a0a', surface: '#141414', surface2: '#222222', accent: '#ff5722', text: '#ffcc80', muted: 'rgba(255,204,128,0.5)', hint: 'rgba(255,204,128,0.2)', border: 'rgba(255,87,34,0.08)', border2: 'rgba(255,87,34,0.15)', red: '#bf360c', redL: '#ff5722', fontDisplay: 'Press Start 2P', fontBody: 'Fira Code', glowColor: '#ff5722', colors: ['#0a0a0a', '#141414', '#ff5722', '#ffcc80'] }
];
export function renderPresets() {
  g('preset-grid').innerHTML = PRESETS.map((p, i) => '<div class="preset-card' + (T._preset === i ? ' active' : '') + '" onclick="applyPreset(' + i + ')"><div class="preset-swatches">' + p.colors.map(c => '<span style="background:' + c + '"></span>').join('') + '</div><div class="preset-name">' + p.name + '</div><div class="preset-fonts">' + p.fontDisplay + ' + ' + p.fontBody + '</div></div>').join('');
}
export function applyPreset(idx) {
  const p = PRESETS[idx]; if (!p) return;
  const snaps = JSON.parse(localStorage.getItem('dace-snapshots') || '[]');
  snaps.push({ name: 'Auto-backup antes de ' + p.name, theme: collectTheme(), date: new Date().toISOString() });
  if (snaps.length > 10) snaps.shift();
  localStorage.setItem('dace-snapshots', JSON.stringify(snaps));
  // Apply preset with complete theme override — keep user's effect/layout settings, override colors
  setT({ ...T, ...p, _preset: idx });
  loadThemeUI(); autoSave(); showToast('Tema: ' + p.name + ' (backup guardado)');
  renderPresets(); renderSnapshots();
  // Force broadcast to iframe
  broadcastThemeNow();
}

// ═══ SAVE SLOTS ═══
export function renderSaveSlots() {
  g('save-slots').innerHTML = [1, 2, 3].map(i => {
    const s = localStorage.getItem('dace-slot-' + i); const name = s ? JSON.parse(s).name : 'Vacío';
    return '<div class="slot" onclick="slotAction(' + i + ')"><div class="slot-label">Slot ' + i + '</div><div class="slot-name">' + name + '</div></div>';
  }).join('');
}
export async function slotAction(i) {
  if (event.shiftKey) { const name = await promptInline('Nombre:', 'Tema ' + i); if (!name) return; localStorage.setItem('dace-slot-' + i, JSON.stringify({ name, theme: collectTheme() })); showToast('Guardado slot ' + i); renderSaveSlots(); }
  else { const s = localStorage.getItem('dace-slot-' + i); if (!s) { showToast('Slot vacío', true); return; } setT(JSON.parse(s).theme); loadThemeUI(); autoSave(); showToast('Cargado slot ' + i); }
}

// ═══ CUSTOM THEMES ═══
export function saveCustomTheme() {
  const name = val('custom-theme-name').trim(); if (!name) { showToast('Ponle nombre', true); return; }
  const c = JSON.parse(localStorage.getItem('dace-custom-themes') || '[]');
  c.push({ name, theme: collectTheme() }); localStorage.setItem('dace-custom-themes', JSON.stringify(c));
  showToast('Tema: ' + name); setVal('custom-theme-name', ''); renderCustomThemes();
}
export function renderCustomThemes() {
  const c = JSON.parse(localStorage.getItem('dace-custom-themes') || '[]');
  g('custom-themes-list').innerHTML = c.length ? c.map((t, i) => '<div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid var(--b)"><span style="flex:1;font-size:11px;font-weight:700">' + t.name + '</span><button class="btn btn-g" onclick="loadCustomTheme(' + i + ')" style="font-size:9px">Cargar</button><button class="btn btn-del" onclick="deleteCustomTheme(' + i + ')" style="font-size:9px">✕</button></div>').join('') : '<div style="color:var(--hi);font-size:10px">Sin temas personalizados</div>';
}
export function loadCustomTheme(i) {
  const c = JSON.parse(localStorage.getItem('dace-custom-themes') || '[]'); if (!c[i]) return;
  setT(c[i].theme); loadThemeUI(); autoSave(); showToast('Tema: ' + c[i].name);
}
export function deleteCustomTheme(i) {
  const c = JSON.parse(localStorage.getItem('dace-custom-themes') || '[]'); c.splice(i, 1);
  localStorage.setItem('dace-custom-themes', JSON.stringify(c)); renderCustomThemes();
}
export async function resetTheme() {
  if (!await confirmInline('¿Resetear a DACE DARK?')) return;
  setT({}); localStorage.removeItem('dace-theme');
  if (db) db.ref('theme').remove().then(() => location.reload()); else location.reload();
}

// ═══ PARTICLES ═══
export function togglePFields() {
  const t = val('p-type') || 'circle'; const tw = g('p-text-wrap'), iw = g('p-img-wrap');
  if (tw) tw.style.display = t === 'text' ? 'block' : 'none';
  if (iw) iw.style.display = t === 'image' ? 'block' : 'none';
}
export function initParticlesPreview() {
  const c = g('particles-pv'); if (!c) return; c.innerHTML = '';
  const canvas = document.createElement('canvas'); canvas.width = c.offsetWidth || 300; canvas.height = 100;
  canvas.style.cssText = 'width:100%;height:100%'; c.appendChild(canvas);
  setPpCtx(canvas.getContext('2d'));
  const parts = []; const count = parseInt(val('p-count')) || 40;
  for (let i = 0; i < count; i++) parts.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: (parseInt(val('p-min')) || 2) + Math.random() * ((parseInt(val('p-max')) || 6) - (parseInt(val('p-min')) || 2)), vx: (Math.random() - .5) * (parseFloat(val('p-speed')) || 1), vy: (Math.random() - .5) * (parseFloat(val('p-speed')) || 1), o: .1 + Math.random() * .4, rot: Math.random() * Math.PI * 2, rv: (Math.random() - .5) * .02 });
  setPpParts(parts);
  if (ppAnim) cancelAnimationFrame(ppAnim);
  animPP(canvas);
}
export function animPP(canvas) {
  if (!ppCtx) return; ppCtx.clearRect(0, 0, canvas.width, canvas.height);
  const col = val('p-color') || '#dc2626', type = val('p-type') || 'circle', text = val('p-text') || '♪', baseOp = parseFloat(val('p-opacity')) || 0.5;
  ppParts.forEach(p => {
    p.x += p.vx; p.y += p.vy; if (p.rot != null) p.rot += p.rv || 0;
    if (p.x < -p.r * 2) p.x = canvas.width + p.r; if (p.x > canvas.width + p.r) p.x = -p.r;
    if (p.y < -p.r * 2) p.y = canvas.height + p.r; if (p.y > canvas.height + p.r) p.y = -p.r;
    ppCtx.save(); ppCtx.globalAlpha = (p.o || 0.3) * baseOp; ppCtx.fillStyle = col;
    if (type === 'square') { ppCtx.translate(p.x, p.y); ppCtx.rotate(p.rot || 0); ppCtx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2); }
    else if (type === 'text') { ppCtx.font = Math.max(8, p.r * 3) + 'px sans-serif'; ppCtx.textAlign = 'center'; ppCtx.textBaseline = 'middle'; ppCtx.fillText(text, p.x, p.y); }
    else { ppCtx.beginPath(); ppCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ppCtx.fill(); }
    ppCtx.restore();
  });
  setPpAnim(requestAnimationFrame(() => animPP(canvas)));
}

// Emoji system → src/admin/emojis.js

// ═══ TEXT COLORIZER ═══
// Visual text editor: click words to color them. Replaces <em> tag workflow.
// Stores data as segments: [{text:"Hello", c:""}, {text:" World", c:"#ff0000"}]
let _tczState = {};

export function renderTextColorizer(containerId, inputId, segments) {
  const wrap = g(containerId); if (!wrap) return;
  // Default color picker presets
  const accent = val('tc-glow') || '#dc2626';
  const presets = [accent, '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f0f0f2', ''];
  _tczState[containerId] = { segments: segments || [], activeColor: accent };

  wrap.innerHTML =
    '<div class="tcz-toolbar">' +
      '<label>Color:</label>' +
      '<input type="color" class="tcz-color-pick" id="' + containerId + '-pick" value="' + accent + '" oninput="tczSetColor(\'' + containerId + '\',this.value)">' +
      '<div class="tcz-presets">' +
        presets.map((c, i) =>
          '<div class="tcz-preset' + (i === 0 ? ' on' : '') + '"' +
          ' style="background:' + (c || 'transparent') + ';' + (!c ? 'border:1px dashed var(--mu)' : '') + '"' +
          ' onclick="tczSetColor(\'' + containerId + '\',\'' + c + '\');tczMarkPreset(this,\'' + containerId + '\')"' +
          ' title="' + (c || 'Quitar color') + '"></div>'
        ).join('') +
      '</div>' +
    '</div>' +
    '<div class="tcz-text" id="' + containerId + '-text">' + _tczRenderWords(containerId, segments) + '</div>' +
    '<div class="tcz-actions">' +
      '<button onclick="tczClearColors(\'' + containerId + '\')">🗑 Quitar colores</button>' +
      '<button onclick="tczSplitAtCursor(\'' + containerId + '\',\'' + inputId + '\')">✂ Dividir texto</button>' +
    '</div>' +
    '<div class="tcz-hint">Click en una palabra para aplicar el color seleccionado. Click de nuevo para quitarlo.</div>';

  // Hide the raw input
  const rawInput = g(inputId);
  if (rawInput) rawInput.style.display = 'none';
}

function _tczRenderWords(containerId, segments) {
  let html = '';
  let idx = 0;
  segments.forEach(seg => {
    const words = seg.text.split(/(\s+)/); // split but keep whitespace
    words.forEach(w => {
      if (/^\s+$/.test(w)) {
        html += w; // keep whitespace as-is
      } else if (w.length > 0) {
        const style = seg.c ? 'color:' + seg.c : '';
        const cls = 'tcz-w' + (seg.c ? ' tcz-colored' : '');
        html += '<span class="' + cls + '" style="' + style + '" data-idx="' + idx + '" onclick="tczWordClick(\'' + containerId + '\',' + idx + ')">' + w + '</span>';
        idx++;
      }
    });
  });
  return html || '<span style="color:var(--hi);font-style:italic">Escribe texto arriba...</span>';
}

export function tczSetColor(containerId, color) {
  if (!_tczState[containerId]) return;
  _tczState[containerId].activeColor = color;
  const pick = g(containerId + '-pick');
  if (pick) pick.value = color || '#ffffff';
}

export function tczMarkPreset(el, containerId) {
  const wrap = el.closest('.tcz-presets');
  if (wrap) wrap.querySelectorAll('.tcz-preset').forEach(p => p.classList.remove('on'));
  el.classList.add('on');
}

export function tczWordClick(containerId, wordIdx) {
  const state = _tczState[containerId]; if (!state) return;
  const color = state.activeColor;

  // Find which segment and word this index belongs to
  let globalIdx = 0;
  let newSegments = [];
  state.segments.forEach(seg => {
    const words = seg.text.split(/(\s+)/);
    words.forEach(w => {
      if (/^\s+$/.test(w)) {
        // whitespace - attach to previous or next word segment
        if (newSegments.length > 0) {
          newSegments[newSegments.length - 1].text += w;
        } else {
          newSegments.push({ text: w, c: seg.c });
        }
      } else if (w.length > 0) {
        if (globalIdx === wordIdx) {
          // Toggle: if same color, remove; otherwise apply new color
          newSegments.push({ text: w, c: (seg.c === color && color) ? '' : color });
        } else {
          newSegments.push({ text: w, c: seg.c });
        }
        globalIdx++;
      }
    });
  });

  // Merge adjacent segments with same color
  state.segments = _tczMergeSegments(newSegments);

  // Re-render
  const textEl = g(containerId + '-text');
  if (textEl) textEl.innerHTML = _tczRenderWords(containerId, state.segments);

  // Sync to raw input
  _tczSyncToInput(containerId);
}

function _tczMergeSegments(segments) {
  if (segments.length < 2) return segments;
  const merged = [segments[0]];
  for (let i = 1; i < segments.length; i++) {
    const prev = merged[merged.length - 1];
    const curr = segments[i];
    // Merge if same color AND prev ends with whitespace or curr starts with whitespace
    if (prev.c === curr.c) {
      prev.text += curr.text;
    } else {
      merged.push(curr);
    }
  }
  return merged;
}

export function tczClearColors(containerId) {
  const state = _tczState[containerId]; if (!state) return;
  const fullText = state.segments.map(s => s.text).join('');
  state.segments = [{ text: fullText, c: '' }];
  const textEl = g(containerId + '-text');
  if (textEl) textEl.innerHTML = _tczRenderWords(containerId, state.segments);
  _tczSyncToInput(containerId);
}

export function tczSplitAtCursor(containerId, inputId) {
  // Opens a prompt to let user type raw text, then parses <em> tags into segments
  const state = _tczState[containerId]; if (!state) return;
  const rawInput = g(inputId); if (!rawInput) return;
  // Show input temporarily
  rawInput.style.display = '';
  rawInput.focus();
  rawInput.addEventListener('input', function handler() {
    const html = rawInput.value;
    state.segments = _tczParseHTML(html);
    const textEl = g(containerId + '-text');
    if (textEl) textEl.innerHTML = _tczRenderWords(containerId, state.segments);
    _tczSyncToInput(containerId);
  }, { once: false });
  showToast('Edita el texto raw. Los <em> se convierten en colores.');
}

function _tczParseHTML(html) {
  // Parse "Hello <em>World</em> !" into segments
  const segments = [];
  const parts = html.split(/(<em>.*?<\/em>)/);
  const accent = val('tc-glow') || '#dc2626';
  parts.forEach(part => {
    const emMatch = part.match(/^<em>(.*?)<\/em>$/);
    if (emMatch) {
      segments.push({ text: emMatch[1], c: accent });
    } else if (part.length > 0) {
      segments.push({ text: part, c: '' });
    }
  });
  return segments.length ? segments : [{ text: html, c: '' }];
}

function _tczSyncToInput(containerId) {
  const state = _tczState[containerId]; if (!state) return;
  // Find the associated input by convention: containerId + '-raw' or search nearby
  const container = g(containerId);
  if (!container) return;
  const rawInput = container.closest('.card-body')?.querySelector('input[id^="s-div"], textarea[id^="s-div"], input[id^="h-"], textarea[id^="h-"]');
  // Also store in a hidden data attribute
  container.dataset.segments = JSON.stringify(state.segments);
}

export function tczGetSegments(containerId) {
  const state = _tczState[containerId];
  return state ? state.segments : [];
}

// Render segments to HTML string (for the store)
export function segmentsToHTML(segments) {
  if (!segments || !segments.length) return '';
  return segments.map(s => {
    const text = escapeHtml(s.text).replace(/\n/g, '<br>');
    if (s.c) return '<span style="color:' + s.c + '">' + text + '</span>';
    return text;
  }).join('');
}

// ═══ EXPORT/IMPORT ═══
export function exportAll() {
  const data = { beats: allBeats, theme: collectTheme(), settings: siteSettings, defaultLicenses: defLics, customLinks, customEmojis, floatingEls };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'dace-backup-' + new Date().toISOString().slice(0, 10) + '.json'; a.click(); showToast('Exportado ✓');
}
export function importAll(e) {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = async ev => {
    try {
      const data = JSON.parse(ev.target.result); if (!await confirmInline('¿Importar? Sobreescribirá todo.')) return;
      showSaving(true); const updates = {};
      if (data.beats) data.beats.forEach(b => updates['beats/' + b.id] = b);
      if (data.theme) updates['theme'] = data.theme;
      if (data.settings) updates['settings'] = data.settings;
      if (data.defaultLicenses) updates['defaultLicenses'] = data.defaultLicenses;
      if (data.customLinks) updates['customLinks'] = data.customLinks;
      if (data.customEmojis) updates['customEmojis'] = data.customEmojis;
      if (data.floatingEls) updates['floatingElements'] = data.floatingEls;
      db.ref().update(updates).then(() => { showSaving(false); showToast('Importado ✓'); setTimeout(() => location.reload(), 500); }).catch(err => { showSaving(false); showToast('Error al importar: ' + (err.message || 'sin permisos'), true); });
    } catch (err) { showToast('Archivo inválido', true); }
  };
  r.readAsText(f); e.target.value = '';
}

// ═══ EXPORT CSS ═══
export function exportCSS() {
  const t = collectTheme();
  let css = ':root {\n';
  const colorMap = { bg: '--bg', surface: '--surface', surface2: '--surface2', accent: '--accent', text: '--text', muted: '--muted', hint: '--hint', border: '--border', border2: '--border2', red: '--red', redL: '--red-l', glowColor: '--glow-color', wbarColor: '--wbar-color', wbarActive: '--wbar-active', btnLicBg: '--btn-lic-bg', btnLicClr: '--btn-lic-clr', btnLicBdr: '--btn-lic-bdr', cardShadowColor: '--card-shadow-color', bannerBg: '--banner-bg', particlesColor: '--particles-color' };
  Object.entries(colorMap).forEach(([k, cssVar]) => { if (t[k]) css += '  ' + cssVar + ': ' + t[k] + ';\n'; });
  css += "  --font-d: '" + (t.fontDisplay || 'Syne') + "', sans-serif;\n";
  css += "  --font-m: '" + (t.fontBody || 'DM Mono') + "', monospace;\n";
  css += '  --font-size: ' + (t.fontSize || 14) + 'px;\n';
  css += '  --line-height: ' + (t.lineHeight || 1.7) + ';\n';
  css += '  --r: ' + (t.radiusGlobal || 10) + 'px;\n';
  css += '  --blur-bg: ' + (t.blurBg || 24) + 'px;\n';
  css += '  --grain-opacity: ' + (t.grainOpacity || 0.3) + ';\n';
  css += '  --card-opacity: ' + (t.cardOpacity || 1) + ';\n';
  css += '  --bg-opacity: ' + (t.bgOpacity || 1) + ';\n';
  css += '  --pad-section: ' + (t.padSection || 4) + 'rem;\n';
  css += '  --beat-gap: ' + (t.beatGap || 16) + 'px;\n';
  css += '  --glow-type: ' + (t.glowType || 'text-shadow') + ';\n';
  css += '  --glow-blur: ' + (t.glowBlur || 20) + 'px;\n';
  css += '  --glow-intensity: ' + (t.glowIntensity || 1) + ';\n';
  css += '  --glow-opacity: ' + (t.glowOpacity || 1) + ';\n';
  css += '  --glow-anim: ' + (t.glowAnim || 'none') + ';\n';
  css += '  --hero-margin-top: ' + (t.heroPadTop || 7) + 'rem;\n';
  css += '  --hero-title-size: ' + (t.heroTitleSize || 2.8) + 'rem;\n';
  css += '  --hero-letter-spacing: ' + (t.heroLetterSpacing || -0.04) + 'em;\n';
  css += '  --hero-line-height: ' + (t.heroLineHeight || 1) + ';\n';
  css += '  --particles-on: ' + (t.particlesOn ? '1' : '0') + ';\n';
  css += '  --particles-count: ' + (t.particlesCount || 40) + ';\n';
  css += '  --particles-speed: ' + (t.particlesSpeed || 1) + ';\n';
  css += '  --particles-opacity: ' + (t.particlesOpacity || 0.5) + ';\n';
  css += '  --btn-opacity: ' + (t.btnOpacityNormal || 1) + ';\n';
  css += '  --btn-opacity-hover: ' + (t.btnOpacityHover || 1) + ';\n';
  css += '  --wave-opacity-off: ' + (t.waveOpacityOff || 0.18) + ';\n';
  css += '  --wave-opacity-on: ' + (t.waveOpacityOn || 1) + ';\n';
  if (t.logoUrl) css += "  --logo-url: url('" + t.logoUrl + "');\n";
  css += '  --logo-width: ' + (t.logoWidth || 80) + 'px;\n';
  css += '  --logo-scale: ' + (t.logoScale || 1) + ';\n';
  css += '  --logo-rotation: ' + (t.logoRotation || 0) + 'deg;\n';
  css += '  --logo-gap: ' + (t.logoTextGap || 12) + 'px;\n';
  css += '  --shadow-intensity: ' + (t.cardShadowIntensity || 0.5) + ';\n';
  css += '  --hero-stroke-w: ' + (t.heroStrokeW || 1) + 'px;\n';
  css += '  --hero-word-blur: ' + (t.heroWordBlur || 10) + 'px;\n';
  css += '  --hero-word-opacity: ' + (t.heroWordOp || 0.35) + ';\n';
  css += '  --hero-glow-int: ' + (t.heroGlowInt || 1) + ';\n';
  css += '  --hero-glow-blur: ' + (t.heroGlowBlur || 20) + 'px;\n';
  css += '  --hero-grad-opacity: ' + (t.heroGradOp || 0.14) + ';\n';
  css += '  --hero-grad-w: ' + (t.heroGradW || 80) + '%;\n';
  css += '  --hero-grad-h: ' + (t.heroGradH || 60) + '%;\n';
  css += '  --hero-eyebrow-size: ' + (t.heroEyebrowSize || 10) + 'px;\n';
  ['logo', 'title', 'player', 'cards', 'buttons', 'waveform'].forEach(k => {
    const a = t['anim' + k.charAt(0).toUpperCase() + k.slice(1)];
    if (a) css += '  --anim-' + k + ': ' + a.type + ' ' + a.dur + 's ' + a.del + 's;\n';
  });
  css += '}';
  const blob = new Blob([css], { type: 'text/css' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'dace-theme.css'; a.click();
  showToast('CSS exportado ✓');
}

// ═══ CHANGE LOG ═══
// Change log + tooltips → src/admin/changelog.js

// Floating elements → src/admin/floating.js


// ═══ GRADIENT EDITOR ═══
// Gradient editor → src/admin/gradient.js

// ═══ HERO DRAG ═══
export function setupHeroDrag() {
  const pv = g('hero-pv'); if (!pv) return;
  let heroDragEl = null, heroDragStart = {};
  [g('hpv-title'), g('hpv-eyebrow'), g('hpv-sub')].forEach(el => {
    if (!el) return; el.style.cursor = 'move'; el.style.position = 'relative';
    el.addEventListener('mousedown', e => {
      if (e.target.closest('input,select,button')) return;
      heroDragEl = el; heroDragStart = { x: e.clientX, y: e.clientY, top: parseFloat(el.style.top) || 0, left: parseFloat(el.style.left) || 0 };
      e.preventDefault();
    });
  });
  document.addEventListener('mousemove', e => {
    if (!heroDragEl) return;
    heroDragEl.style.top = (heroDragStart.top + e.clientY - heroDragStart.y) + 'px';
    heroDragEl.style.left = (heroDragStart.left + e.clientX - heroDragStart.x) + 'px';
  });
  document.addEventListener('mouseup', () => { heroDragEl = null; });
}

// ═══ FULLSCREEN PREVIEW ═══
export function toggleFullscreenPreview() {
  const panel = g('preview-panel'); if (!panel) return;
  const handle = g('resize-handle');
  const isFs = panel.classList.toggle('fullscreen');
  if (isFs) { panel.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#000'; if (handle) handle.style.display = 'none'; document.addEventListener('keydown', escFullscreen); }
  else { panel.style.cssText = ''; if (handle) handle.style.display = ''; document.removeEventListener('keydown', escFullscreen); }
  showToast(isFs ? 'Preview fullscreen — ESC para salir' : 'Preview normal');
}
function escFullscreen(e) {
  if (e.key === 'Escape') { const p = g('preview-panel'); const h = g('resize-handle'); if (p) { p.classList.remove('fullscreen'); p.style.cssText = ''; } if (h) h.style.display = ''; document.removeEventListener('keydown', escFullscreen); }
}

// ═══ SNAPSHOTS ═══
// Snapshots, diff, import URL → src/admin/snapshots.js

// ═══ WINDOW ASSIGNMENTS ═══
Object.assign(window, {
  pushUndo, pushUndoInitial, undo, redo, autoSave, saveAll,
  broadcastTheme, broadcastThemeNow, broadcastHighlight, clearHighlight,
  refreshIframe, loadPreviewURL, setViewport,
  toggleInspector, toggleAdminTheme,
  updateHeroPv, updateBannerPv, updateDividerPv, initTextColorizers,
  updateGlowDesc, updateGlowAnimDesc, computeGlowCSS, applyGlowTo, applyGlowPreset,
  updatePreview, collectTheme, loadThemeUI, setupHeroSync, loadSettingsUI,
  buildAnimControls, collectAnim, loadAnimValues,
  renderPresets, applyPreset,
  renderSaveSlots, slotAction,
  saveCustomTheme, renderCustomThemes, loadCustomTheme, deleteCustomTheme, resetTheme,
  togglePFields, initParticlesPreview, animPP,
  renderEmojiGrid, insertEmoji, renderCustomEmojis, addCustomEmoji, uploadEmojiFile, removeCE,
  renderTextColorizer, tczSetColor, tczMarkPreset, tczWordClick, tczClearColors, tczSplitAtCursor, tczGetSegments, segmentsToHTML,
  exportAll, importAll, exportCSS,
  logChange, renderChangeLog, logFieldChange,
  addTooltips,
  renderFloatingEditor, renderFloatingPreview, addFE, saveFE, rmFE,
  renderGradEditor, buildGradCSS, addGradStop, updateGradStop, rmGradStop, startDragStop, applyGradToHero,
  setupHeroDrag, toggleFullscreenPreview,
  takeSnapshot, renderSnapshots, loadSnapshot, rmSnapshot,
  populateDiffSelects, updateDiff,
  promptImportURL, importThemeFromURL,
  setShowSectionNav
});
