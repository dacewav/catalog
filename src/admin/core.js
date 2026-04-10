// ═══ DACEWAV Admin — Core Module ═══
// Undo/redo, auto-save, preview, theme collect/load, hero/banner preview,
// glow, animation controls, presets, particles, emojis, change log, export/import

import { ANIMS, EMOJIS } from './config.js';
import {
  db, T, setT, siteSettings, customEmojis, floatingEls,
  _undoStack, _redoStack, _lastSavedTheme, _undoDebounce,
  _iframeReady, setIframeReady, _ldTheme, _ldSettings, _ldBeats,
  setLdTheme, setLdSettings, setLdBeats,
  _changeLog, _lastChangeValues,
  ppCtx, ppParts, ppAnim, setPpCtx, setPpParts, setPpAnim,
  _gradStops, setGradStops, _gradRerenderTimer, setGradRerenderTimer
} from './state.js';
import {
  g, val, setVal, checked, setChecked, hexRgba, hexFromRgba, rgbaFromHex,
  loadFont, showToast, showSaving, fmt, sv, resetSlider, toggleCard, setAutoSaveRef,
  confirmInline, promptInline
} from './helpers.js';
import { loadColorValues } from './colors.js';

let _autoSaveTimer = null;

// ═══ UNDO/REDO ═══
export function pushUndo() {
  clearTimeout(_undoDebounce);
  // Use a simple timeout approach (the original used _undoDebounce but it was a let)
  const timer = setTimeout(() => {
    const snap = JSON.stringify(collectTheme());
    if (_lastSavedTheme === snap) return;
    _undoStack.push(snap);
    if (_undoStack.length > 50) _undoStack.shift();
    _redoStack.length = 0;
    // Note: can't reassign _lastSavedTheme from here, it's handled by the snapshot comparison
  }, 300);
}
export function undo() {
  if (_undoStack.length < 2) return;
  _redoStack.push(_undoStack.pop());
  const prev = _undoStack[_undoStack.length - 1];
  if (prev) { setT(JSON.parse(prev)); loadThemeUI(); broadcastTheme(); showToast('Deshacer ↩'); }
}
export function redo() {
  if (!_redoStack.length) return;
  const next = _redoStack.pop();
  _undoStack.push(next);
  setT(JSON.parse(next)); loadThemeUI(); broadcastTheme(); showToast('Rehacer ↪');
}

// ═══ AUTO-SAVE ═══
export function autoSave() {
  clearTimeout(_autoSaveTimer);
  pushUndo();
  logFieldChange();
  const theme = collectTheme();
  localStorage.setItem('dace-theme', JSON.stringify(theme));
  broadcastTheme();
  const dot = g('sdot'); dot.className = 'sdot';
  _autoSaveTimer = setTimeout(() => {
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

// ═══ IFRAME COMMUNICATION ═══
const PM_ORIGIN = (() => {
  try { return window.location.origin || '*'; } catch { return '*'; }
})();

// Post to iframe with fallback: try specific origin first, then '*'
function _postToFrame(msg) {
  const frame = g('preview-frame');
  if (!frame || !frame.contentWindow) return;
  try { frame.contentWindow.postMessage(msg, PM_ORIGIN); } catch {}
  if (PM_ORIGIN !== '*') { try { frame.contentWindow.postMessage(msg, '*'); } catch {} }
}

export function broadcastTheme() {
  const theme = collectTheme();
  _postToFrame({ type: 'theme-update', theme });
  _postToFrame({ type: 'settings-update', settings: siteSettings });
  _postToFrame({ type: 'emojis-update', emojis: customEmojis });
  _postToFrame({ type: 'floating-update', elements: floatingEls });
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
  const f = g('preview-frame'); if (!f) return;
  f.className = mode;
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

  const accent = v('h-stroke-clr') || v('tc-glow') || '#dc2626';
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
    pvt.style.textShadow = glowOn ? '0 0 ' + glowBlur + 'px ' + hexRgba(accent, glowInt) : 'none';

    // Build title HTML — only use glow-word when effects are active
    const useGlowWord = strokeOn || glowOn;
    let html = '';
    if (otherLines.length) {
      html += '<span style="color:' + textClr + '">' + otherLines.map(l => escapeHtml(l)).join('<br>') + '</span><br>';
    }
    if (lastLine) {
      const escapedLine = escapeHtml(lastLine);
      if (useGlowWord) {
        const classes = ['glow-word'];
        const styles = ['--hw-blur:' + wordBlur + 'px', '--hw-op:' + wordOp];
        if (strokeOn) {
          classes.push('stroke-mode');
          styles.push('color:transparent', '-webkit-text-stroke:' + strokeW + 'px ' + strokeClr);
        } else {
          styles.push('color:' + strokeClr);
        }
        html += '<span class="' + classes.join(' ') + '" data-t="' + escapedLine + '" style="' + styles.join(';') + '">' + escapedLine + '</span>';
      } else {
        html += '<span style="color:' + textClr + '">' + escapedLine + '</span>';
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
  'rainbow': 'Arcoíris: rota colores continuamente', 'wave': 'Onda: varía la intensidad como una onda sinusoidal'
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

// ═══ PREVIEW UPDATE ═══
export function updatePreview() {
  const accent = val('tc-glow') || val('tt-glow') || '#dc2626';
  const gType = val('t-glow-type') || 'text-shadow';
  const blur = parseInt(val('t-glow-blur')) || 20;
  const int = parseFloat(val('t-glow-int')) || 1;
  const gOp = parseFloat(val('t-glow-op')) || 1;
  const active = checked('t-glow');
  ['gp-box', 'gp-text', 'gp-btn'].forEach(id => {
    const el = g(id); if (!el) return;
    applyGlowTo(el, gType, blur, 0, int * gOp, accent, active);
    if (el.id === 'gp-box') { el.style.color = accent; }
  });
  const anim = val('t-glow-anim') || 'none';
  const speed = parseFloat(val('t-glow-anim-speed')) || 2;
  ['gp-box', 'gp-text', 'gp-btn'].forEach(id => {
    const el = g(id); if (!el) return;
    el.classList.remove('gap-anim-pulse', 'gap-anim-breathe', 'gap-anim-flicker', 'gap-anim-rainbow', 'gap-anim-wave');
    if (anim !== 'none') { el.classList.add('gap-anim-' + anim); el.style.setProperty('--ga-s', speed + 's'); }
  });
  updateHeroPv();
  broadcastTheme();
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
    glowSpread: 0, glowIntensity: parseFloat(val('t-glow-int')) || 1,
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
    heroGlowOn: checked('h-glow-on'), heroGlowInt: parseFloat(val('h-glow-int')) || 1, heroGlowBlur: parseInt(val('h-glow-blur')) || 20,
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
  s('h-glow-int', T.heroGlowInt); s('h-glow-blur', T.heroGlowBlur);
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
  s('t-glow-speed', T.glowAnimSpeed); s('t-wbar-h', T.wbarHeight); s('t-wbar-r', T.wbarRadius);
  if (T.fontWeight) { var fw = g('t-font-weight'); if (fw) fw.value = T.fontWeight; }
  document.querySelectorAll('.slider-wrap input[type=range]').forEach(el => sv(el));
  loadColorValues();
  const gs = g('gc-swatch'); if (gs) gs.style.background = T.glowColor || T.accent || '#dc2626';
  const ht = g('hpv-title'), he = g('hpv-eyebrow'), hs = g('hpv-sub');
  if (ht && T.heroDragTitleTop != null) { ht.style.top = T.heroDragTitleTop + 'px'; ht.style.left = (T.heroDragTitleLeft || 0) + 'px'; }
  if (he && T.heroDragEyebrowTop != null) { he.style.top = T.heroDragEyebrowTop + 'px'; he.style.left = (T.heroDragEyebrowLeft || 0) + 'px'; }
  if (hs && T.heroDragSubTop != null) { hs.style.top = T.heroDragSubTop + 'px'; hs.style.left = (T.heroDragSubLeft || 0) + 'px'; }
  loadAndPreviewFont(); updatePreview(); updateHeroPv(); updateBannerPv();
  renderSaveSlots(); buildAnimControls();
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
}

// ═══ ANIM CONTROLS ═══
export function buildAnimControls() {
  const els = [{ key: 'logo', label: 'Logo' }, { key: 'title', label: 'Título Hero' }, { key: 'cards', label: 'Tarjetas' }, { key: 'player', label: 'Player' }, { key: 'buttons', label: 'Botones' }, { key: 'waveform', label: 'Waveform' }];
  const sel = ANIMS.map(a => '<option value="' + a + '">' + (a === 'none' ? 'Ninguna' : a) + '</option>').join('');
  g('anim-controls').innerHTML = els.map(el => '<div class="anim-ed"><div class="anim-ed-title">' + el.label + '</div><div class="fg3"><div class="field"><label>Tipo</label><select data-ak="' + el.key + '" data-af="type" onchange="autoSave()">' + sel + '</select></div><div class="field"><label>Velocidad</label><div class="slider-wrap"><input type="range" min="0.5" max="3" step="0.1" value="2" data-ak="' + el.key + '" data-af="dur" oninput="this.nextElementSibling.textContent=parseFloat(this.value).toFixed(1)+\'s\';autoSave()"><span class="slider-val">2.0s</span></div></div><div class="field"><label>Delay</label><div class="slider-wrap"><input type="range" min="0" max="2" step="0.1" value="0" data-ak="' + el.key + '" data-af="del" oninput="this.nextElementSibling.textContent=parseFloat(this.value).toFixed(1)+\'s\';autoSave()"><span class="slider-val">0.0s</span></div></div></div></div>').join('');
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
  { name: 'DACE DARK', bg: '#060404', surface: '#0f0808', accent: '#dc2626', fontDisplay: 'Syne', fontBody: 'DM Mono', colors: ['#060404', '#0f0808', '#dc2626', '#f5eeee'] },
  { name: 'VINTAGE TAPE', bg: '#1a1510', surface: '#2a2218', accent: '#c4954a', fontDisplay: 'Bebas Neue', fontBody: 'Lora', colors: ['#1a1510', '#2a2218', '#c4954a', '#e8dcc8'] },
  { name: 'NEON PUNK', bg: '#0a0014', surface: '#160030', accent: '#e040fb', fontDisplay: 'Anton', fontBody: 'Space Mono', colors: ['#0a0014', '#160030', '#e040fb', '#f5eeee'] },
  { name: 'CYBERPUNK', bg: '#0d0d0d', surface: '#1a1a1a', accent: '#fcee09', fontDisplay: 'Orbitron', fontBody: 'Share Tech Mono', colors: ['#0d0d0d', '#1a1a1a', '#fcee09', '#00fff5'] },
  { name: 'PASTEL WAVE', bg: '#1e1a2e', surface: '#2d2640', accent: '#ff8fa3', fontDisplay: 'Comfortaa', fontBody: 'Quicksand', colors: ['#1e1a2e', '#2d2640', '#ff8fa3', '#f0e6ff'] },
  { name: 'DARK ACADEMIA', bg: '#12100e', surface: '#1e1a16', accent: '#8b7355', fontDisplay: 'Cinzel', fontBody: 'Lora', colors: ['#12100e', '#1e1a16', '#8b7355', '#d4c5a9'] },
  { name: 'VAPORWAVE', bg: '#1a0a2e', surface: '#2d1b4e', accent: '#ff6b9d', fontDisplay: 'Rajdhani', fontBody: 'IBM Plex Mono', colors: ['#1a0a2e', '#2d1b4e', '#ff6b9d', '#c4e0ff'] },
  { name: 'MINIMAL WHITE', bg: '#f8f6f4', surface: '#ffffff', accent: '#1a1a1a', fontDisplay: 'Sora', fontBody: 'Inter', colors: ['#f8f6f4', '#ffffff', '#1a1a1a', '#333333'] },
  { name: 'FOREST GLOW', bg: '#0a120a', surface: '#132013', accent: '#4caf50', fontDisplay: 'Exo 2', fontBody: 'Fira Code', colors: ['#0a120a', '#132013', '#4caf50', '#c8e6c9'] },
  { name: 'BLOOD MOON', bg: '#0d0404', surface: '#1a0808', accent: '#ff1744', fontDisplay: 'Archivo Black', fontBody: 'JetBrains Mono', colors: ['#0d0404', '#1a0808', '#ff1744', '#ffcdd2'] },
  { name: 'OCEAN DEEP', bg: '#040d14', surface: '#081a28', accent: '#00bcd4', fontDisplay: 'Unbounded', fontBody: 'Manrope', colors: ['#040d14', '#081a28', '#00bcd4', '#b2ebf2'] },
  { name: 'RETRO ARCADE', bg: '#0a0a0a', surface: '#141414', accent: '#ff5722', fontDisplay: 'Press Start 2P', fontBody: 'Fira Code', colors: ['#0a0a0a', '#141414', '#ff5722', '#ffcc80'] }
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
  setT({ ...T, ...p, _preset: idx });
  loadThemeUI(); autoSave(); showToast('Tema: ' + p.name + ' (backup guardado)');
  renderPresets(); renderSnapshots();
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

// ═══ EMOJIS ═══
export function renderEmojiGrid() { g('emoji-grid').innerHTML = EMOJIS.map(e => '<div class="emoji-btn" onclick="insertEmoji(\'' + e + '\')">' + e + '</div>').join(''); }
export function insertEmoji(e) { const b = g('b-text'); if (b) { b.value += e; updateBannerPv(); autoSave(); } }
export function renderCustomEmojis() {
  g('ce-list').innerHTML = customEmojis.length ? customEmojis.map((e, i) => '<div class="ce-item"><img src="' + e.url + '"><div class="ce-name">:' + e.name + ':</div><button class="btn btn-del" onclick="removeCE(' + i + ')" style="font-size:9px">✕</button></div>').join('') : '<div style="color:var(--hi);font-size:10px">Sin emojis personalizados</div>';
}
export function addCustomEmoji() {
  const name = val('ce-name').trim(), url = val('ce-url').trim();
  if (!name || !url) { showToast('Nombre y URL', true); return; }
  customEmojis.push({ name, url, width: parseInt(val('ce-w')) || 24, height: parseInt(val('ce-h')) || 24, anim: val('ce-anim') || 'none' });
  localStorage.setItem('dace-custom-emojis', JSON.stringify(customEmojis)); renderCustomEmojis(); updateBannerPv();
  setVal('ce-name', ''); setVal('ce-url', '');
  if (db) db.ref('customEmojis').set(customEmojis).catch(() => {});
}
export function removeCE(i) {
  customEmojis.splice(i, 1); localStorage.setItem('dace-custom-emojis', JSON.stringify(customEmojis));
  renderCustomEmojis(); updateBannerPv();
  if (db) db.ref('customEmojis').set(customEmojis).catch(() => {});
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
export function logChange(label, oldVal, newVal) {
  _changeLog.unshift({ label, oldVal, newVal, time: new Date().toLocaleTimeString() });
  if (_changeLog.length > 50) _changeLog.pop();
  renderChangeLog();
}
export function renderChangeLog() {
  const wrap = g('change-log'); if (!wrap) return;
  wrap.innerHTML = _changeLog.length ? _changeLog.slice(0, 20).map(c => '<div style="display:flex;gap:6px;padding:3px 0;border-bottom:1px solid var(--b);font-size:10px"><span style="color:var(--hi);min-width:50px">' + c.time + '</span><span style="flex:1">' + c.label + '</span><span style="color:var(--mu)">' + (c.oldVal || '—') + ' → ' + (c.newVal || '—') + '</span></div>').join('') : '<div style="color:var(--hi);font-size:10px">Sin cambios registrados</div>';
}
export function logFieldChange() {
  const fields = ['tc-bg', 'tc-surface', 'tc-accent', 'tc-text', 'tc-muted', 'tc-border', 't-font-d', 't-font-m', 't-font-size', 't-line-h', 't-glow', 't-glow-type', 't-glow-blur', 't-glow-int', 't-glow-op', 't-glow-anim', 't-blur', 't-card-op', 't-grain', 't-radius', 't-bg-op', 't-btn-op', 't-btn-hop', 'h-title', 'h-sub', 'h-eyebrow', 'h-title-size', 'h-ls', 'h-lh', 'h-pad-top', 'h-stroke-on', 'h-glow-on', 'h-grad-on', 'h-grad-clr', 'h-grad-w', 'h-grad-h', 'h-word-blur', 'h-word-op', 'p-on', 'p-type', 'p-count', 'p-color', 'p-speed', 'p-opacity', 'b-active', 'b-text', 'b-anim', 'b-speed', 'b-bg', 'b-txt-clr', 't-hero-top', 't-player-bot', 't-logo-ox', 't-logo-url', 't-logo-w', 't-logo-scale', 't-logo-rot', 'tt-wbar', 'tt-wbar-a', 'tt-btn-clr', 'tt-btn-bdr', 'tt-btn-bg', 's-name', 's-wa', 's-ig', 's-email', 's-hero', 's-sub'];
  fields.forEach(id => {
    const el = g(id); if (!el) return;
    const v = el.type === 'checkbox' ? el.checked : el.value;
    if (_lastChangeValues[id] !== undefined && _lastChangeValues[id] !== v) {
      const label = el.closest('.field,.color-wrap,.tog-row')?.querySelector('label')?.textContent || id;
      const fmtVal = v => String(v).length > 30 ? String(v).slice(0, 27) + '…' : v;
      logChange(label, fmtVal(_lastChangeValues[id]), fmtVal(v));
    }
    _lastChangeValues[id] = v;
  });
}

// ═══ TOOLTIPS ═══
export function addTooltips() {
  const tips = { 'tc-bg': 'Color de fondo principal', 'tc-surface': 'Color de superficie de tarjetas', 'tc-accent': 'Color de acento / resaltado', 't-font-d': 'Fuente para títulos', 't-font-m': 'Fuente para textos secundarios', 't-font-size': 'Tamaño base de toda la tienda', 't-line-h': 'Espacio entre líneas', 't-glow': 'Activa/desactiva glow global', 't-glow-type': 'Tipo de efecto glow', 't-glow-anim': 'Animación del glow', 't-blur': 'Desenfoque del fondo', 't-grain': 'Intensidad del grano', 't-radius': 'Radio de bordes', 'p-on': 'Partículas flotantes', 'p-type': 'Forma de partículas', 'p-count': 'Número de partículas', 'h-title': 'Título principal del hero', 'h-sub': 'Subtítulo', 'h-grad-on': 'Degradado radial', 'h-title-size': 'Tamaño del título', 'h-stroke-on': 'Outline última palabra', 'h-glow-on': 'Brillo del título', 't-logo-url': 'URL del logo', 't-logo-w': 'Ancho del logo', 's-name': 'Nombre del sitio', 's-wa': 'WhatsApp', 's-ig': 'Instagram' };
  Object.entries(tips).forEach(([id, text]) => {
    const el = g(id); if (!el) return;
    const label = el.closest('.field,.color-wrap,.tog-row')?.querySelector('label');
    if (label && !label.querySelector('.tip')) { const tip = document.createElement('span'); tip.className = 'tip'; tip.title = text; tip.textContent = '?'; label.appendChild(tip); }
  });
}

// ═══ FLOATING CANVAS EDITOR ═══
export function renderFloatingEditor() {
  const container = g('floating-editor'); if (!container) return;
  const els = Object.entries(floatingEls);
  container.innerHTML = els.length ? els.map(([k, el]) => {
    return '<div class="fe-ed-item" data-key="' + k + '" style="background:var(--as2);border:1px solid var(--b);border-radius:var(--rad);padding:8px;margin-bottom:6px">'
      + '<div class="fg3"><div class="field"><label>X</label><input type="number" value="' + (el.x || 0) + '" data-f="x"></div>'
      + '<div class="field"><label>Y</label><input type="number" value="' + (el.y || 0) + '" data-f="y"></div>'
      + '<div class="field"><label>Ancho</label><input type="number" value="' + (el.width || 100) + '" data-f="width"></div></div>'
      + '<div class="fg3"><div class="field"><label>Alto</label><input type="number" value="' + (el.height || 100) + '" data-f="height"></div>'
      + '<div class="field"><label>Opacidad</label><input type="number" min="0" max="1" step="0.05" value="' + (el.opacity != null ? el.opacity : 1) + '" data-f="opacity"></div>'
      + '<div class="field"><label>Visible</label><input type="checkbox" class="tog" ' + (el.visible !== false ? 'checked' : '') + ' data-f="visible"></div></div>'
      + '<div class="fg2"><div class="field"><label>Tipo</label><select data-f="type"><option value="image"' + (el.type === 'image' ? ' selected' : '') + '>Imagen</option><option value="text"' + (el.type === 'text' ? ' selected' : '') + '>Texto</option></select></div>'
      + '<div class="field"><label>Anim</label><select data-f="anim">' + ANIMS.map(a => '<option value="' + a + '"' + (el.anim === a ? ' selected' : '') + '>' + a + '</option>').join('') + '</select></div></div>'
      + '<div class="field"><label>Contenido (URL o texto)</label><input type="text" value="' + (el.content || '') + '" data-f="content"></div>'
      + '<div class="btn-row" style="margin-top:6px"><button class="btn btn-ok" onclick="saveFE(\'' + k + '\')" style="font-size:9px">Guardar</button><button class="btn btn-del" onclick="rmFE(\'' + k + '\')" style="font-size:9px">✕</button></div></div>';
  }).join('') : '<div style="color:var(--hi);font-size:10px">Sin elementos flotantes.</div>';
}
export function renderFloatingPreview() {
  const pv = g('floating-preview'); if (!pv) return; pv.innerHTML = '';
  Object.entries(floatingEls).forEach(([k, el]) => {
    if (!el || !el.visible) return;
    const d = document.createElement('div');
    const scaleX = pv.offsetWidth / 1200, scaleY = 120 / 800;
    d.style.cssText = 'position:absolute;left:' + ((el.x || 0) * scaleX) + 'px;top:' + ((el.y || 0) * scaleY) + 'px;width:' + ((el.width || 100) * scaleX) + 'px;height:' + ((el.height || 100) * scaleY) + 'px;opacity:' + (el.opacity || 1) + ';pointer-events:none';
    if (el.type === 'text') d.innerHTML = '<div style="font-size:' + Math.max(6, (el.fontSize || 16) * scaleX) + 'px;color:var(--tx);white-space:nowrap">' + (el.content || '') + '</div>';
    else if (el.content) d.innerHTML = '<img src="' + el.content + '" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display=\'none\'">';
    pv.appendChild(d);
  });
}
export function addFE() {
  const k = 'fe_' + Date.now();
  floatingEls[k] = { type: 'image', content: '', x: 100, y: 100, width: 100, height: 100, opacity: 1, visible: true, anim: 'none', animDur: 2, fontSize: 16 };
  renderFloatingEditor(); renderFloatingPreview();
}
export function saveFE(k) {
  const el = document.querySelector('.fe-ed-item[data-key="' + k + '"]'); if (!el) return;
  const f = {}; el.querySelectorAll('[data-f]').forEach(inp => { f[inp.dataset.f] = inp.type === 'checkbox' ? inp.checked : inp.value; });
  floatingEls[k] = { ...floatingEls[k], ...f, x: parseFloat(f.x) || 0, y: parseFloat(f.y) || 0, width: parseFloat(f.width) || 100, height: parseFloat(f.height) || 100, opacity: parseFloat(f.opacity) || 1, fontSize: parseInt(f.fontSize) || 16 };
  localStorage.setItem('dace-floating', JSON.stringify(floatingEls));
  if (db) db.ref('floatingElements/' + k).set(floatingEls[k]).catch(() => {});
  renderFloatingPreview(); showToast('Elemento guardado');
}
export function rmFE(k) {
  delete floatingEls[k]; localStorage.setItem('dace-floating', JSON.stringify(floatingEls));
  if (db) db.ref('floatingElements/' + k).remove().catch(() => {});
  renderFloatingEditor(); renderFloatingPreview(); showToast('Eliminado');
}

// ═══ GRADIENT EDITOR ═══
export function renderGradEditor() {
  const wrap = g('grad-stops'); if (!wrap) return;
  const gradCSS = buildGradCSS();
  wrap.innerHTML = '<div style="height:40px;border-radius:var(--rad);border:1px solid var(--b);margin-bottom:8px;position:relative;overflow:hidden;cursor:pointer" id="grad-bar" onclick="addGradStop(event)">'
    + '<div style="width:100%;height:100%;background:linear-gradient(90deg,' + gradCSS + ');transition:background .2s"></div>'
    + _gradStops.map((s, i) => '<div style="position:absolute;left:' + s.pos + '%;top:0;bottom:0;width:12px;margin-left:-6px;cursor:ew-resize;display:flex;flex-direction:column;align-items:center;padding-top:2px" onmousedown="startDragStop(event,' + i + ')"><div style="width:10px;height:10px;border-radius:50%;background:' + s.color + ';border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.5)"></div><div style="width:2px;flex:1;background:rgba(255,255,255,0.5)"></div></div>').join('')
    + '</div><div style="display:flex;flex-direction:column;gap:4px">'
    + _gradStops.map((s, i) => '<div style="display:flex;align-items:center;gap:6px;padding:4px 6px;background:var(--as2);border-radius:var(--rad)"><span style="font-size:9px;color:var(--mu);min-width:16px">' + i + '</span><input type="range" min="0" max="100" value="' + s.pos + '" style="width:70px" oninput="updateGradStop(' + i + ',\'pos\',this.value)"><input type="color" value="' + s.color + '" style="width:22px;height:18px;border:1px solid var(--b);border-radius:3px;padding:0" oninput="updateGradStop(' + i + ',\'color\',this.value)"><input type="range" min="0" max="0.5" step="0.01" value="' + s.opacity + '" style="width:50px" oninput="updateGradStop(' + i + ',\'opacity\',this.value)"><span style="font-size:9px;color:var(--acc);min-width:28px">' + s.opacity.toFixed(2) + '</span><button class="btn btn-del" onclick="rmGradStop(' + i + ')" style="font-size:8px;padding:2px 5px;margin-left:auto">✕</button></div>').join('')
    + '</div>';
}
export function buildGradCSS() {
  const sorted = [..._gradStops].sort((a, b) => a.pos - b.pos);
  return sorted.map(s => 'rgba(' + parseInt(s.color.slice(1, 3), 16) + ',' + parseInt(s.color.slice(3, 5), 16) + ',' + parseInt(s.color.slice(5, 7), 16) + ',' + s.opacity + ') ' + s.pos + '%').join(', ');
}
export function addGradStop(e) {
  const bar = g('grad-bar'); if (!bar) return; const r = bar.getBoundingClientRect();
  const pos = Math.round(((e.clientX - r.left) / r.width) * 100);
  _gradStops.push({ pos, color: '#dc2626', opacity: 0.1 }); renderGradEditor(); applyGradToHero();
}
export function updateGradStop(i, field, v) {
  if (!_gradStops[i]) return;
  _gradStops[i][field] = field === 'pos' ? parseInt(v) : field === 'opacity' ? parseFloat(v) : v;
  clearTimeout(_gradRerenderTimer);
  setGradRerenderTimer(setTimeout(() => { renderGradEditor(); applyGradToHero(); }, field === 'color' ? 300 : 0));
}
export function rmGradStop(i) { _gradStops.splice(i, 1); renderGradEditor(); applyGradToHero(); }
export function startDragStop(e, i) {
  e.preventDefault(); const bar = g('grad-bar'); if (!bar) return; const r = bar.getBoundingClientRect();
  function onMove(ev) { const pos = Math.round(Math.max(0, Math.min(100, ((ev.clientX - r.left) / r.width) * 100))); _gradStops[i].pos = pos; renderGradEditor(); applyGradToHero(); }
  function onUp() { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); }
  document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
}
export function applyGradToHero() {
  const css = buildGradCSS();
  const pvg = g('hpv-grad');
  if (pvg) pvg.style.background = 'radial-gradient(ellipse ' + (parseInt(val('h-grad-w')) || 80) + '% ' + (parseInt(val('h-grad-h')) || 60) + '% at 50% 0%, ' + css + ')';
}

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
  const isFs = panel.classList.toggle('fullscreen');
  if (isFs) { panel.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#000'; document.addEventListener('keydown', escFullscreen); }
  else { panel.style.cssText = ''; document.removeEventListener('keydown', escFullscreen); }
  showToast(isFs ? 'Preview fullscreen — ESC para salir' : 'Preview normal');
}
function escFullscreen(e) {
  if (e.key === 'Escape') { const p = g('preview-panel'); if (p) { p.classList.remove('fullscreen'); p.style.cssText = ''; } document.removeEventListener('keydown', escFullscreen); }
}

// ═══ SNAPSHOTS ═══
export function takeSnapshot() {
  const snaps = JSON.parse(localStorage.getItem('dace-snapshots') || '[]');
  snaps.push({ name: val('snap-name') || 'Snapshot ' + (snaps.length + 1), theme: collectTheme(), date: new Date().toISOString() });
  if (snaps.length > 10) snaps.shift();
  localStorage.setItem('dace-snapshots', JSON.stringify(snaps));
  setVal('snap-name', ''); renderSnapshots(); showToast('Snapshot guardado');
}
export function renderSnapshots() {
  const wrap = g('snapshots-list'); if (!wrap) return;
  const snaps = JSON.parse(localStorage.getItem('dace-snapshots') || '[]');
  wrap.innerHTML = snaps.length ? snaps.map((s, i) => '<div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid var(--b)"><div style="flex:1"><div style="font-size:11px;font-weight:700">' + s.name + '</div><div style="font-size:9px;color:var(--hi)">' + new Date(s.date).toLocaleString() + '</div></div><button class="btn btn-g" onclick="loadSnapshot(' + i + ')" style="font-size:9px">Cargar</button><button class="btn btn-del" onclick="rmSnapshot(' + i + ')" style="font-size:9px">✕</button></div>').join('') : '<div style="color:var(--hi);font-size:10px">Sin snapshots</div>';
  populateDiffSelects();
}
export function loadSnapshot(i) {
  const snaps = JSON.parse(localStorage.getItem('dace-snapshots') || '[]'); if (!snaps[i]) return;
  setT(snaps[i].theme); loadThemeUI(); autoSave(); showToast('Snapshot: ' + snaps[i].name);
}
export function rmSnapshot(i) {
  const snaps = JSON.parse(localStorage.getItem('dace-snapshots') || '[]'); snaps.splice(i, 1);
  localStorage.setItem('dace-snapshots', JSON.stringify(snaps)); renderSnapshots();
}

// ═══ VISUAL DIFF ═══
export function populateDiffSelects() {
  const snaps = JSON.parse(localStorage.getItem('dace-snapshots') || '[]');
  const opts = '<option value="">— Seleccionar —</option>' + snaps.map((s, i) => '<option value="' + i + '">' + s.name + '</option>').join('');
  const da = g('diff-a'), db2 = g('diff-b');
  if (da) da.innerHTML = opts; if (db2) db2.innerHTML = opts;
}
export function updateDiff() {
  const aIdx = val('diff-a'), bIdx = val('diff-b');
  const wrap = g('diff-result'); if (!wrap) return;
  if (aIdx === '' || bIdx === '') { wrap.innerHTML = '<div style="color:var(--hi);font-size:10px">Selecciona dos snapshots</div>'; return; }
  const snaps = JSON.parse(localStorage.getItem('dace-snapshots') || '[]');
  const a = snaps[aIdx], b = snaps[bIdx]; if (!a || !b) { wrap.innerHTML = ''; return; }
  const themeA = a.theme || {}, themeB = b.theme || {};
  const allKeys = [...new Set([...Object.keys(themeA), ...Object.keys(themeB)])].sort();
  const diffs = allKeys.filter(k => JSON.stringify(themeA[k]) !== JSON.stringify(themeB[k]));
  if (!diffs.length) { wrap.innerHTML = '<div style="color:var(--gn);font-size:10px">✓ Sin diferencias</div>'; return; }
  const labels = { bg: 'Fondo', surface: 'Surface', accent: 'Acento', text: 'Texto', fontDisplay: 'Font Display', fontBody: 'Font Body', glowColor: 'Glow', glowType: 'Glow Type', glowBlur: 'Glow Blur', glowIntensity: 'Glow Int', radiusGlobal: 'Border Radius', heroTitleSize: 'Hero Title', particlesOn: 'Partículas', beatGap: 'Beat Gap', padSection: 'Pad', blurBg: 'Blur', cardOpacity: 'Card Op' };
  wrap.innerHTML = '<div style="font-size:10px;color:var(--acc);font-weight:700;margin-bottom:6px">' + diffs.length + ' cambios</div>' + diffs.map(k => {
    const label = labels[k] || k;
    const va = themeA[k] !== undefined ? String(themeA[k]).slice(0, 40) : '—';
    const vb = themeB[k] !== undefined ? String(themeB[k]).slice(0, 40) : '—';
    return '<div style="display:flex;align-items:center;gap:6px;padding:3px 0;border-bottom:1px solid var(--b);font-size:10px"><span style="min-width:80px;font-weight:600">' + label + '</span><span style="color:var(--mu);text-decoration:line-through">' + va + '</span><span style="color:var(--mu)">→</span><span style="color:var(--acc);font-weight:600">' + vb + '</span></div>';
  }).join('');
}

// ═══ IMPORT URL ═══
export async function promptImportURL() {
  const url = await promptInline('URL del tema JSON (Ej: https://mi-servidor.com/tema.json)');
  if (!url || !url.trim()) return; importThemeFromURL(url.trim());
}
export function importThemeFromURL(url) {
  showSaving(true);
  fetch(url).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).then(data => {
    showSaving(false);
    let theme = null;
    if (data.theme) theme = data.theme; else if (data.bg || data.accent || data.fontDisplay) theme = data;
    else { showToast('Formato no reconocido', true); return; }
    const snaps = JSON.parse(localStorage.getItem('dace-snapshots') || '[]');
    snaps.push({ name: 'Backup antes de import URL', theme: collectTheme(), date: new Date().toISOString() });
    if (snaps.length > 10) snaps.shift(); localStorage.setItem('dace-snapshots', JSON.stringify(snaps));
    setT({ ...T, ...theme }); loadThemeUI(); autoSave(); showToast('Tema importado desde URL ✓'); renderSnapshots();
  }).catch(err => { showSaving(false); showToast('Error: ' + err.message, true); });
}

// ═══ WINDOW ASSIGNMENTS ═══
Object.assign(window, {
  pushUndo, undo, redo, autoSave, saveAll,
  broadcastTheme, broadcastHighlight, clearHighlight,
  refreshIframe, loadPreviewURL, setViewport,
  toggleInspector, toggleAdminTheme,
  updateHeroPv, updateBannerPv,
  updateGlowDesc, updateGlowAnimDesc, computeGlowCSS, applyGlowTo,
  updatePreview, collectTheme, loadThemeUI, setupHeroSync, loadSettingsUI,
  buildAnimControls, collectAnim, loadAnimValues,
  renderPresets, applyPreset,
  renderSaveSlots, slotAction,
  saveCustomTheme, renderCustomThemes, loadCustomTheme, deleteCustomTheme, resetTheme,
  togglePFields, initParticlesPreview, animPP,
  renderEmojiGrid, insertEmoji, renderCustomEmojis, addCustomEmoji, removeCE,
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
