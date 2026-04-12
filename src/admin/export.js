// ═══ DACEWAV Admin — Export/Import/CSS ═══
// Extracted from core.js — data export, import, CSS generation.

import { db, siteSettings, customEmojis, floatingEls, allBeats, defLics, customLinks } from './state.js';
import { showToast, showSaving, confirmInline } from './helpers.js';

// Dependency injected by core.js (circular)
let _collectTheme = null;

export function setExportDeps({ collectTheme }) {
  _collectTheme = collectTheme;
}

export function exportAll() {
  if (!_collectTheme) return;
  const data = {
    beats: allBeats || [],
    theme: _collectTheme(),
    settings: siteSettings,
    defaultLicenses: defLics,
    customLinks: customLinks,
    customEmojis,
    floatingEls,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'dace-backup-' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
  showToast('Exportado \u2713');
}

export function importAll(e) {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = async (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!(await confirmInline('\u00BFImportar? Sobreescribir\u00E1 todo.'))) return;
      showSaving(true);
      const updates = {};
      if (data.beats) data.beats.forEach((b) => (updates['beats/' + b.id] = b));
      if (data.theme) updates['theme'] = data.theme;
      if (data.settings) updates['settings'] = data.settings;
      if (data.defaultLicenses) updates['defaultLicenses'] = data.defaultLicenses;
      if (data.customLinks) updates['customLinks'] = data.customLinks;
      if (data.customEmojis) updates['customEmojis'] = data.customEmojis;
      if (data.floatingEls) updates['floatingElements'] = data.floatingEls;
      db.ref()
        .update(updates)
        .then(() => {
          showSaving(false);
          showToast('Importado \u2713');
          setTimeout(() => location.reload(), 500);
        })
        .catch((err) => {
          showSaving(false);
          showToast('Error al importar: ' + (err.message || 'sin permisos'), true);
        });
    } catch (err) {
      showToast('Archivo inv\u00E1lido', true);
    }
  };
  r.readAsText(f);
  e.target.value = '';
}

export function exportCSS() {
  if (!_collectTheme) return;
  const t = _collectTheme();
  let css = ':root {\n';
  const colorMap = {
    bg: '--bg', surface: '--surface', surface2: '--surface2', accent: '--accent',
    text: '--text', muted: '--muted', hint: '--hint', border: '--border',
    border2: '--border2', red: '--red', redL: '--red-l', glowColor: '--glow-color',
    wbarColor: '--wbar-color', wbarActive: '--wbar-active', btnLicBg: '--btn-lic-bg',
    btnLicClr: '--btn-lic-clr', btnLicBdr: '--btn-lic-bdr',
    cardShadowColor: '--card-shadow-color', bannerBg: '--banner-bg',
    particlesColor: '--particles-color',
  };
  Object.entries(colorMap).forEach(([k, cssVar]) => {
    if (t[k]) css += '  ' + cssVar + ': ' + t[k] + ';\n';
  });
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
  // Banner
  if (t.bannerOn) {
    css += '  --banner-bg: ' + (t.bannerBg || '#7f1d1d') + ';\n';
    css += '  --banner-text-clr: ' + (t.bannerTextClr || '#ffffff') + ';\n';
  }
  // Hero gradient
  css += '  --hero-grad-opacity: ' + (t.heroGradOp || 0.14) + ';\n';
  css += '  --hero-grad-w: ' + (t.heroGradW || 80) + '%;\n';
  css += '  --hero-grad-h: ' + (t.heroGradH || 60) + '%;\n';
  css += '}\n';
  // Glow animation keyframes
  if (t.glowAnim && t.glowAnim !== 'none') {
    const speed = t.glowSpeed || 2;
    css += '\n@keyframes glow-anim {\n';
    switch (t.glowAnim) {
      case 'pulse':
        css += '  0%,100% { filter: brightness(1); }\n  50% { filter: brightness(1.4); }\n';
        break;
      case 'breathe':
        css += '  0%,100% { opacity: 1; }\n  50% { opacity: 0.7; }\n';
        break;
      case 'flicker':
        css += '  0%,19%,21%,23%,25%,54%,56%,100% { opacity: 1; }\n  20%,24%,55% { opacity: 0.5; }\n';
        break;
      case 'rainbow':
        css += '  0% { filter: hue-rotate(0deg); }\n  100% { filter: hue-rotate(360deg); }\n';
        break;
    }
    css += '}\n';
  }
  const blob = new Blob([css], { type: 'text/css' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'dace-theme.css';
  a.click();
  showToast('CSS exportado \u2713');
}
Object.assign(window, { exportAll, importAll, exportCSS });
