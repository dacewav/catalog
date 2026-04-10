// ═══ DACEWAV Admin — Core: Preview ═══
// Iframe communication, preview update, hero preview, banner preview, hero sync, hero drag, fullscreen preview

import { T, customEmojis, floatingEls, siteSettings, _iframeReady, setIframeReady } from './state.js';
import { g, val, checked, hexRgba, showToast } from './helpers.js';
import { collectTheme } from './core-persistence.js';
import { applyGlowTo } from './core-effects.js';

// ═══ IFRAME COMMUNICATION ═══
export function broadcastTheme() {
  const frame = g('preview-frame');
  if (frame && frame.contentWindow) {
    frame.contentWindow.postMessage({ type: 'theme-update', theme: collectTheme() }, '*');
    frame.contentWindow.postMessage({ type: 'settings-update', settings: siteSettings }, '*');
    frame.contentWindow.postMessage({ type: 'emojis-update', emojis: customEmojis }, '*');
    frame.contentWindow.postMessage({ type: 'floating-update', elements: floatingEls }, '*');
  }
}
export function broadcastHighlight(selector) {
  const frame = g('preview-frame');
  if (frame && frame.contentWindow) frame.contentWindow.postMessage({ type: 'highlight-element', selector }, '*');
}
export function clearHighlight() {
  const frame = g('preview-frame');
  if (frame && _iframeReady) frame.contentWindow.postMessage({ type: 'clear-highlight' }, '*');
}
window.addEventListener('message', function (e) {
  const d = e.data; if (!d || !d.type) return;
  if (d.type === 'index-ready') { setIframeReady(true); broadcastTheme(); }
  if (d.type === 'element-clicked' && d.info) {
    const map = { 'hero-title': 'hero', 'hero-eyebrow': 'hero', 'hero-sub': 'hero', 'hero': 'hero', 'nav': 'layout', 'beat-card': 'elements', 'btn-lic': 'elements', 'wbar': 'elements', 'player-bar': 'layout' };
    for (const [sel, sec] of Object.entries(map)) { if (d.info.classes && d.info.classes.includes(sel)) { showSectionNav(sec); break; } }
  }
});
export function refreshIframe() { const f = g('preview-frame'); if (f) f.src = f.src; }
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
let showSectionNav = () => {};
export function setShowSectionNav(fn) { showSectionNav = fn; }

// ═══ HERO PREVIEW ═══
export function updateHeroPv() {
  const accent = val('h-stroke-clr') || val('tc-glow') || '#dc2626';
  const titleRaw = val('h-title') || 'Beats que\ndefinen géneros.';
  const lines = titleRaw.split('\n');
  const lastLine = lines[lines.length - 1] || 'definen géneros.';
  const otherLines = lines.slice(0, -1);
  const strokeOn = checked('h-stroke-on');
  const strokeW = parseFloat(val('h-stroke-w')) || 1;
  const wordBlur = parseInt(val('h-word-blur')) || 10;
  const wordOp = parseFloat(val('h-word-op')) || 0.35;
  const strokeClr = val('h-stroke-clr') || accent;
  const glowOn = checked('h-glow-on');
  const glowInt = parseFloat(val('h-glow-int')) || 1;
  const glowBlur = parseInt(val('h-glow-blur')) || 20;
  const titleSize = parseFloat(val('h-title-size')) || 2.8;
  const ls = parseFloat(val('h-ls')) || -0.04;
  const lh = parseFloat(val('h-lh')) || 1;
  const fd = val('t-font-d') || 'Syne';
  const gradOn = checked('h-grad-on');
  const gradClr = val('h-grad-clr') || accent;
  const gradOp = parseFloat(val('h-grad-op')) || 0.14;
  const gradW = parseInt(val('h-grad-w')) || 80;
  const gradH = parseInt(val('h-grad-h')) || 60;
  const eyebrowOn = checked('h-eyebrow-on');
  const eyebrowText = val('h-eyebrow') || 'En vivo · Puebla, MX';
  const eyebrowClr = val('h-eyebrow-clr') || accent;
  const eyebrowSize = parseInt(val('h-eyebrow-size')) || 10;

  const pv = g('hero-pv'); if (!pv) return;
  const pvg = g('hpv-grad');
  if (pvg) pvg.style.background = gradOn ? 'radial-gradient(ellipse ' + gradW + '% ' + gradH + '% at 50% 0%, ' + hexRgba(gradClr, gradOp) + ', transparent)' : 'none';
  const pve = g('hpv-eyebrow');
  if (pve) {
    pve.style.display = eyebrowOn ? 'inline-flex' : 'none';
    pve.style.color = eyebrowClr;
    pve.style.borderColor = hexRgba(eyebrowClr, .3);
    pve.style.background = hexRgba(eyebrowClr, .08);
    pve.style.fontSize = eyebrowSize + 'px';
    const dot = pve.querySelector('.hero-pv-eyebrow-dot');
    if (dot) dot.style.background = eyebrowClr;
  }
  const pvet = g('hpv-eyebrow-text'); if (pvet) pvet.textContent = eyebrowText;
  const pvt = g('hpv-title');
  if (pvt) {
    pvt.style.fontFamily = "'" + fd + "',sans-serif";
    pvt.style.fontSize = titleSize + 'rem';
    pvt.style.letterSpacing = ls + 'em';
    pvt.style.lineHeight = lh;
    if (glowOn) pvt.style.textShadow = '0 0 ' + glowBlur + 'px ' + hexRgba(accent, glowInt);
    else pvt.style.textShadow = 'none';
    let html = '';
    if (otherLines.length) html += otherLines.join('<br>') + '<br>';
    if (strokeOn) {
      html += '<span class="glow-word" data-t="' + lastLine + '" style="color:transparent;-webkit-text-stroke:' + strokeW + 'px ' + strokeClr + ';--hw-blur:' + wordBlur + 'px;--hw-op:' + wordOp + '">' + lastLine + '</span>';
    } else {
      html += '<span class="glow-word" data-t="' + lastLine + '" style="color:' + strokeClr + ';--hw-blur:' + wordBlur + 'px;--hw-op:' + wordOp + '">' + lastLine + '</span>';
    }
    pvt.innerHTML = html;
  }
  const pvs = g('hpv-sub'); if (pvs) pvs.textContent = val('h-sub') || 'Puebla, MX · Trap · R&B · Drill';
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

// ═══ SYNC s-hero ↔ h-title ═══
export function setupHeroSync() {
  const sHero = g('s-hero'), hTitle = g('h-title');
  if (sHero) sHero.addEventListener('input', function () { if (hTitle && hTitle.value !== sHero.value) { hTitle.value = sHero.value; updateHeroPv(); } });
  if (hTitle) hTitle.addEventListener('input', function () { if (sHero && sHero.value !== hTitle.value) sHero.value = hTitle.value; });
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
