// ═══ DACEWAV Admin — Core Module ═══
// Undo/redo, auto-save, preview, theme collect/load, hero/banner preview,
// glow, animation controls, presets, particles, emojis, change log, export/import

import { ANIMS } from './config.js';
import {
  db, T, setT, siteSettings, customEmojis, floatingEls,
  _undoStack,
  _iframeReady, setIframeReady, _ldTheme, _ldSettings, _ldBeats,
  setLdTheme, setLdSettings, setLdBeats
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
  initTextColorizers, renderTextColorizer, tczGetSegments, segmentsToHTML, tczSetColor,
  tczMarkPreset, tczWordClick, tczClearColors, tczSplitAtCursor
} from './text-colorizer.js';
import {
  updateGlowDesc, updateGlowAnimDesc, computeGlowCSS, applyGlowTo,
  applyGlowPreset, updatePreview, setGlowDeps
} from './glow.js';
import { togglePFields, initParticlesPreview, animPP } from './particles.js';
import { setupHeroDrag, toggleFullscreenPreview } from './fullscreen.js';
import { exportAll, importAll, exportCSS, setExportDeps } from './export.js';
import {
  buildAnimControls, collectAnim, loadAnimValues,
  renderPresets, applyPreset, renderSaveSlots, slotAction,
  saveCustomTheme, renderCustomThemes, loadCustomTheme, deleteCustomTheme, resetTheme,
  setPresetDeps
} from './theme-presets.js';
import {
  setShowSectionNav, toggleInspector, toggleAdminTheme,
  setupHeroSync, loadSettingsUI, setToggleDeps
} from './toggles.js';

// Re-export for modules that import from core.js
export { updatePreview } from './glow.js';
export { updateHeroPv, updateBannerPv, updateDividerPv } from './hero-preview.js';
export { initParticlesPreview } from './particles.js';
export { loadSettingsUI } from './toggles.js';
import {
  g, val, setVal, checked, setChecked, hexRgba, hexFromRgba, rgbaFromHex,
  loadFont, showToast, showSaving, fmt, sv, resetSlider, toggleCard, setAutoSaveRef,
  confirmInline, promptInline, escapeHtml
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

// Wire up glow dependencies
setGlowDeps({ autoSave, updateHeroPv });

// Wire up export dependencies
setExportDeps({ collectTheme });

// Wire up preset/slot dependencies
setPresetDeps({ collectTheme, loadThemeUI, autoSave, broadcastThemeNow });

// Wire up toggle/setup dependencies
setToggleDeps({ postToFrame, PM_ORIGIN });

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
// Toggle + inspector → src/admin/toggles.js

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
// Setup hero sync + load settings → src/admin/toggles.js

// Theme presets, slots, anim controls → src/admin/theme-presets.js

// Emoji system → src/admin/emojis.js

// ═══ TEXT COLORIZER ═══
// Text colorizer → src/admin/text-colorizer.js
// Export/Import/CSS → src/admin/export.js

// ═══ WINDOW ASSIGNMENTS ═══
Object.assign(window, {
  pushUndo, pushUndoInitial, undo, redo, autoSave, saveAll,
  broadcastTheme, broadcastThemeNow, broadcastHighlight, clearHighlight,
  refreshIframe, loadPreviewURL, setViewport,
  updateGlowDesc, updateGlowAnimDesc, computeGlowCSS, applyGlowTo, applyGlowPreset,
  updatePreview, collectTheme, loadThemeUI,
  renderEmojiGrid, insertEmoji, renderCustomEmojis, addCustomEmoji, uploadEmojiFile, removeCE,
  logChange, renderChangeLog, logFieldChange,
  addTooltips,
  renderFloatingEditor, renderFloatingPreview, addFE, saveFE, rmFE,
  renderGradEditor, buildGradCSS, addGradStop, updateGradStop, rmGradStop, startDragStop, applyGradToHero,
  takeSnapshot, renderSnapshots, loadSnapshot, rmSnapshot,
  populateDiffSelects, updateDiff,
  promptImportURL, importThemeFromURL
});
