// ═══ DACEWAV Admin — Theme I/O ═══
// collectTheme (read UI → object) + loadThemeUI (object → write UI)

import { T } from './state.js';
import { g, val, checked, setChecked, sv, loadFont } from './helpers.js';
import { loadColorValues } from './colors.js';
import { togglePFields } from './particles.js';
import { tczGetSegments } from './text-colorizer.js';
import { updatePreview } from './glow.js';
import { updateHeroPv, updateBannerPv, updateDividerPv } from './hero-preview.js';
import { initTextColorizers } from './text-colorizer.js';
import { renderSaveSlots, buildAnimControls, collectAnim } from './theme-presets.js';
import { pushUndoInitial } from './undo.js';
import { _undoStack } from './state.js';

// Deps injected from core.js (circular import avoidance)
let _autoSaveRef;
export function setThemeIODeps({ autoSave }) { _autoSaveRef = autoSave; }

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

function loadAndPreviewFont() {
  loadFont(T.fontDisplay || 'Syne');
  loadFont(T.fontBody || 'DM Mono');
}
