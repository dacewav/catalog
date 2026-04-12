// ═══ DACEWAV Admin — Beat Presets ═══
// Style presets, hover presets, apply/reset functions for beat card styling.

import { g, val, setVal, checked, setChecked, showToast } from './helpers.js';
import { db, allBeats, siteSettings, editId } from './state.js';
import { syncSliderDisplay, _buildCardStyleFromInputs, _setHoloColors, _toggleAnimSubsettings } from './beat-card-style.js';

// ═══ Complete list of all beat editor slider IDs ═══
export const ALL_SLIDER_IDS = [
  'f-anim-brillo-max','f-anim-brillo-min','f-anim-cs-hue-end','f-anim-cs-hue-start','f-anim-cs-sat',
  'f-anim-del','f-anim-dur','f-anim-glitch-rot','f-anim-glitch-x','f-anim-glitch-y',
  'f-anim-holo-blur','f-anim-holo-bright-max','f-anim-holo-bright-min','f-anim-holo-glow',
  'f-anim-holo-sat-max','f-anim-holo-sat-min','f-anim-hue-end','f-anim-hue-start','f-anim-int',
  'f-anim-neon-bright','f-anim-neon-max','f-anim-neon-min',
  'f-anim-parpadeo-max','f-anim-parpadeo-min','f-anim-rotate-angle','f-anim-rotate-scale',
  'f-anim-scale-max','f-anim-scale-min','f-anim-scale-opacity',
  'f-anim-shake-x','f-anim-shake-y','f-anim-translate-rot','f-anim-translate-x','f-anim-translate-y',
  'f-border-width','f-cs-fb','f-cs-fbl','f-cs-fc','f-cs-fg','f-cs-fh','f-cs-fi','f-cs-fs','f-cs-fse','f-cs-fo',
  'f-cs-ds-x','f-cs-ds-y','f-cs-ds-bl','f-cs-ds-op',
  'f-cs-opacity','f-cs-radius','f-glow-blur','f-glow-int','f-glow-op','f-glow-speed','f-glow-spread',
  'f-hov-anim-dur','f-hov-blur','f-hov-bright','f-hov-hue','f-hov-opacity','f-hov-sat','f-hov-scale',
  'f-hov-shadow','f-hov-sib-blur','f-hov-trans',
  'f-shadow-blur','f-shadow-op','f-shadow-spread','f-shadow-x','f-shadow-y',
  'f-shimmer-op','f-shimmer-speed',
  'f-tf-rotate','f-tf-scale','f-tf-skewX','f-tf-skewY','f-tf-x','f-tf-y'
];

// Helper to trigger live update + preview
function _triggerLiveUpdate() {
  if (typeof window.updateCardPreview === 'function') window.updateCardPreview();
  if (typeof window._sendLiveUpdate === 'function') window._sendLiveUpdate();
}

// ═══ STYLE PRESETS ═══
const STYLE_PRESETS = [
  {
    id: 'brutalist', name: 'Industrial Brutal', icon: '🏭',
    desc: 'Crudo, monospace, alto contraste, sin redondeo. Estética militar/terminal.',
    colors: ['#dc2626', '#1a1a1a', '#f5f5f0'],
    apply: () => ({
      filter: { brightness: 1.1, contrast: 1.3, saturate: 0.3, grayscale: 0.4, sepia: 0, hueRotate: 0, blur: 0, invert: 0 },
      glow: { enabled: false, type: 'active', color: '#dc2626', speed: 3, intensity: 1, blur: 20, spread: 0, opacity: 1, hoverOnly: false },
      anim: null,
      style: { accentColor: '#dc2626', shimmer: false, borderRadius: 0, opacity: 1 },
      border: { enabled: true, color: '#444444', width: 2, style: 'solid' },
      shadow: { enabled: true, color: '#000000', opacity: 0.6, x: 4, y: 4, blur: 0, spread: 0, inset: false },
      hover: { scale: 1, brightness: 1.2, saturate: 0.8, shadowBlur: 0, transition: 0.15, borderColor: '#dc2626', glowIntensify: false, blur: 0, siblingsBlur: 2, hueRotate: 0, opacity: 1, enableAnim: false, animType: '', animDur: 1 },
      transform: { rotate: 0, scale: 1, skewX: 0, skewY: 0, x: 0, y: 0 }
    })
  },
  {
    id: 'minimalist', name: 'Minimal Limpio', icon: '◽',
    desc: 'Líneas suaves, monocromo cálido, sin efectos agresivos. Editorial premium.',
    colors: ['#f5f0eb', '#2f3437', '#b8a99a'],
    apply: () => ({
      filter: { brightness: 1, contrast: 1.05, saturate: 0.85, grayscale: 0, sepia: 0.08, hueRotate: 0, blur: 0, invert: 0 },
      glow: { enabled: false, type: 'active', color: '#b8a99a', speed: 3, intensity: 1, blur: 20, spread: 0, opacity: 1, hoverOnly: false },
      anim: null,
      style: { accentColor: '#b8a99a', shimmer: false, borderRadius: 12, opacity: 1 },
      border: { enabled: true, color: '#e0d8d0', width: 1, style: 'solid' },
      shadow: { enabled: true, color: '#000000', opacity: 0.06, x: 0, y: 2, blur: 8, spread: 0, inset: false },
      hover: { scale: 1.02, brightness: 1, saturate: 1, shadowBlur: 16, transition: 0.4, borderColor: '#c8bfb5', glowIntensify: false, blur: 0, siblingsBlur: 0, hueRotate: 0, opacity: 1, enableAnim: false, animType: '', animDur: 1 },
      transform: { rotate: 0, scale: 1, skewX: 0, skewY: 0, x: 0, y: 0 }
    })
  },
  {
    id: 'luxury-glass', name: 'Luxury Glass', icon: '💎',
    desc: 'Glassmorphism oscuro, glow neón, shimmer, blur. Estética Awwwards/SaaS premium.',
    colors: ['#7c3aed', '#050505', '#a78bfa'],
    apply: () => ({
      filter: { brightness: 0.95, contrast: 1.1, saturate: 1.3, grayscale: 0, sepia: 0, hueRotate: 0, blur: 0, invert: 0 },
      glow: { enabled: true, type: 'active', color: '#7c3aed', speed: 4, intensity: 2, blur: 30, spread: 5, opacity: 0.8, hoverOnly: false },
      anim: { type: 'respirar', type2: '', dur: 4, del: 0, easing: 'ease-in-out', direction: 'normal', iterations: 'infinite' },
      style: { accentColor: '#7c3aed', shimmer: true, borderRadius: 16, opacity: 0.92 },
      border: { enabled: true, color: 'rgba(255,255,255,0.08)', width: 1, style: 'solid' },
      shadow: { enabled: true, color: '#000000', opacity: 0.4, x: 0, y: 8, blur: 32, spread: 0, inset: false },
      hover: { scale: 1.04, brightness: 1.1, saturate: 1.4, shadowBlur: 24, transition: 0.35, borderColor: '#a78bfa', glowIntensify: true, blur: 0, siblingsBlur: 3, hueRotate: 15, opacity: 1, enableAnim: false, animType: '', animDur: 1 },
      transform: { rotate: 0, scale: 1, skewX: 0, skewY: 0, x: 0, y: 0 }
    })
  },
  {
    id: 'editorial', name: 'Editorial Swiss', icon: '📰',
    desc: 'Tipográfico suizo, bordes marcados, grid visible. Sin animaciones, puro contenido.',
    colors: ['#111111', '#ffffff', '#e63946'],
    apply: () => ({
      filter: { brightness: 1, contrast: 1.15, saturate: 1, grayscale: 0, sepia: 0, hueRotate: 0, blur: 0, invert: 0 },
      glow: { enabled: false, type: 'active', color: '#e63946', speed: 3, intensity: 1, blur: 20, spread: 0, opacity: 1, hoverOnly: false },
      anim: null,
      style: { accentColor: '#e63946', shimmer: false, borderRadius: 2, opacity: 1 },
      border: { enabled: true, color: '#111111', width: 2, style: 'solid' },
      shadow: { enabled: false, color: '#000000', opacity: 0.15, x: 0, y: 3, blur: 6, spread: 0, inset: false },
      hover: { scale: 1, brightness: 1, saturate: 1, shadowBlur: 0, transition: 0.2, borderColor: '#e63946', glowIntensify: false, blur: 0, siblingsBlur: 1, hueRotate: 0, opacity: 0.85, enableAnim: false, animType: '', animDur: 1 },
      transform: { rotate: 0, scale: 1, skewX: 0, skewY: 0, x: 0, y: 0 }
    })
  }
];

// ═══ HOVER PRESETS ═══
const HOVER_PRESETS = [
  { id: 'none', name: '🚫 Ninguno', desc: 'Sin efecto hover',
    hover: { scale: 1, brightness: 1, saturate: 1, shadowBlur: 0, transition: 0.3, borderColor: '#dc2626', glowIntensify: false, blur: 0, siblingsBlur: 0, hueRotate: 0, opacity: 1, enableAnim: false, animType: '', animDur: 1 }
  },
  { id: 'sutil', name: '✨ Sutil', desc: 'Escala sutil + brillo',
    hover: { scale: 1.03, brightness: 1.15, saturate: 1, shadowBlur: 12, transition: 0.35, borderColor: '#dc2626', glowIntensify: false, blur: 0, siblingsBlur: 0, hueRotate: 0, opacity: 1, enableAnim: false, animType: '', animDur: 1 }
  },
  { id: 'glow', name: '🔥 Glow', desc: 'Borde glow + elevación',
    hover: { scale: 1.02, brightness: 1.05, saturate: 1, shadowBlur: 24, transition: 0.3, borderColor: '#dc2626', glowIntensify: true, blur: 0, siblingsBlur: 0, hueRotate: 0, opacity: 1, enableAnim: false, animType: '', animDur: 1 }
  },
  { id: 'blur', name: '🌫️ Blur', desc: 'La tarjeta se blurrea',
    hover: { scale: 1, brightness: 1, saturate: 1, shadowBlur: 0, transition: 0.4, borderColor: '#dc2626', glowIntensify: false, blur: 2, siblingsBlur: 0, hueRotate: 0, opacity: 0.9, enableAnim: false, animType: '', animDur: 1 }
  },
  { id: 'spotlight', name: '🔦 Spotlight', desc: 'Hermanos blur + opacidad',
    hover: { scale: 1.04, brightness: 1.1, saturate: 1.2, shadowBlur: 20, transition: 0.35, borderColor: '#dc2626', glowIntensify: false, blur: 0, siblingsBlur: 3, hueRotate: 0, opacity: 1, enableAnim: false, animType: '', animDur: 1 }
  },
  { id: 'holograma', name: '🌈 Holograma', desc: 'Hue rotate + saturación',
    hover: { scale: 1.02, brightness: 1.1, saturate: 1.5, shadowBlur: 16, transition: 0.3, borderColor: '#a78bfa', glowIntensify: false, blur: 0, siblingsBlur: 0, hueRotate: 25, opacity: 1, enableAnim: false, animType: '', animDur: 1 }
  },
  { id: 'pop', name: '💥 Pop', desc: 'Escala grande + respirar',
    hover: { scale: 1.08, brightness: 1.05, saturate: 1, shadowBlur: 16, transition: 0.25, borderColor: '#dc2626', glowIntensify: false, blur: 0, siblingsBlur: 1, hueRotate: 0, opacity: 1, enableAnim: true, animType: 'respirar', animDur: 1.5 }
  },
  { id: 'zen', name: '🧘 Zen', desc: 'Fade out + scale down',
    hover: { scale: 0.98, brightness: 0.9, saturate: 0.8, shadowBlur: 0, transition: 0.5, borderColor: '#dc2626', glowIntensify: false, blur: 0, siblingsBlur: 0, hueRotate: 0, opacity: 0.75, enableAnim: false, animType: '', animDur: 1 }
  }
];

export function renderHoverPresets() {
  const grid = document.getElementById('hover-presets-grid');
  if (!grid) return;
  grid.innerHTML = HOVER_PRESETS.map(p => `
    <button onclick="applyHoverPreset('${p.id}')" title="${p.desc}"
      style="font-family:var(--fm);font-size:9px;padding:4px 8px;border-radius:var(--rad);border:1px solid var(--b);background:var(--abg);color:var(--tx);cursor:pointer;transition:border-color .2s,background .2s;white-space:nowrap"
      onmouseenter="this.style.borderColor='var(--acc)'" onmouseleave="this.style.borderColor='var(--b)'">${p.name}</button>
  `).join('');
}

export function applyHoverPreset(id) {
  const preset = HOVER_PRESETS.find(p => p.id === id); if (!preset) return;
  const hv = preset.hover;
  setVal('f-hov-scale', hv.scale); setVal('f-hov-bright', hv.brightness);
  setVal('f-hov-sat', hv.saturate); setVal('f-hov-shadow', hv.shadowBlur);
  setVal('f-hov-trans', hv.transition); setVal('f-hov-border', hv.borderColor);
  setChecked('f-hov-glow', hv.glowIntensify);
  setVal('f-hov-blur', hv.blur); setVal('f-hov-sib-blur', hv.siblingsBlur);
  setVal('f-hov-hue', hv.hueRotate); setVal('f-hov-opacity', hv.opacity);
  setChecked('f-hov-anim-on', hv.enableAnim);
  const hovAnimEl = g('f-hov-anim-type'); if (hovAnimEl) hovAnimEl.value = hv.animType || '';
  setVal('f-hov-anim-dur', hv.animDur || 1);
  ALL_SLIDER_IDS.forEach(syncSliderDisplay);
  _triggerLiveUpdate();
  showToast('Hover preset "' + preset.name.replace(/[^\w\s]/g, '').trim() + '" aplicado ✓');
}

export function renderPresets() {
  const grid = g('style-presets-grid'); if (!grid) return;
  grid.innerHTML =
    '<button class="btn btn-g" onclick="resetCardStyle()" style="width:100%;margin-bottom:8px;font-size:10px;padding:6px">' +
    '↺ Restablecer todos los parámetros</button>' +
    STYLE_PRESETS.map(p => {
    const swatches = p.colors.map(c => '<span style="background:' + c + '"></span>').join('');
    return '<div class="preset-card" data-preset="' + p.id + '" onclick="applyPreset(\'' + p.id + '\')"><div class="preset-header"><span class="preset-icon">' + p.icon + '</span><span class="preset-name">' + p.name + '</span></div><div class="preset-desc">' + p.desc + '</div><div class="preset-swatches">' + swatches + '</div></div>';
  }).join('');
}

// Reset all card style parameters to defaults
export function resetCardStyle() {
  setVal('f-cs-fb', 1); setVal('f-cs-fc', 1); setVal('f-cs-fs', 1);
  setVal('f-cs-fg', 0); setVal('f-cs-fse', 0); setVal('f-cs-fh', 0);
  setVal('f-cs-fbl', 0); setVal('f-cs-fbl-type', ''); setVal('f-cs-fi', 0);
  setVal('f-cs-fo', 1);
  setVal('f-cs-ds-x', 0); setVal('f-cs-ds-y', 0); setVal('f-cs-ds-bl', 0); setVal('f-cs-ds-op', 0); setVal('f-cs-ds-clr', '#000000'); setVal('f-cs-ds-clr-h', '#000000');
  setChecked('f-glow-on', false);
  const glowTypeEl = g('f-glow-type'); if (glowTypeEl) glowTypeEl.value = 'active';
  setVal('f-glow-color', '#dc2626'); setVal('f-glow-color-h', '#dc2626');
  setVal('f-glow-speed', 3); setVal('f-glow-int', 1);
  setVal('f-glow-blur', 20); setVal('f-glow-spread', 0);
  setVal('f-glow-op', 1); setChecked('f-glow-hover', false);
  const animTypeEl = g('f-anim-type'); if (animTypeEl) animTypeEl.value = '';
  const animType2El = g('f-anim-type2'); if (animType2El) animType2El.value = '';
  setVal('f-anim-dur', 2); setVal('f-anim-del', 0);
  const animEaseEl = g('f-anim-ease'); if (animEaseEl) animEaseEl.value = 'ease-in-out';
  const animDirEl = g('f-anim-dir'); if (animDirEl) animDirEl.value = 'normal';
  const animIterEl = g('f-anim-iter'); if (animIterEl) animIterEl.value = 'infinite';
  setVal('f-anim-int', 100); setVal('f-anim-hue-start', 0); setVal('f-anim-hue-end', 360);
  _setHoloColors(['#ff0080','#00ff80','#0080ff']);
  setVal('f-anim-holo-bright-min', 0.9); setVal('f-anim-holo-bright-max', 1.4);
  setVal('f-anim-holo-sat-min', 0.8); setVal('f-anim-holo-sat-max', 2);
  setVal('f-anim-holo-glow', 0); setVal('f-anim-holo-blur', 0);
  const holoDirEl = g('f-anim-holo-dir'); if (holoDirEl) holoDirEl.value = 'hue';
  setVal('f-anim-brillo-min', 0.8); setVal('f-anim-brillo-max', 1.5);
  setVal('f-anim-glitch-x', 4); setVal('f-anim-glitch-y', 4); setVal('f-anim-glitch-rot', 0);
  setChecked('f-anim-glitch-chromatic', false);
  setVal('f-anim-translate-x', 0); setVal('f-anim-translate-y', 12); setVal('f-anim-translate-rot', 0);
  setVal('f-anim-neon-min', 0.4); setVal('f-anim-neon-max', 1); setVal('f-anim-neon-bright', 1);
  setVal('f-anim-parpadeo-min', 0.3); setVal('f-anim-parpadeo-max', 1);
  setVal('f-anim-rotate-angle', 5); setVal('f-anim-rotate-scale', 1);
  setVal('f-anim-scale-min', 1); setVal('f-anim-scale-max', 1.06); setVal('f-anim-scale-opacity', 0.8);
  setVal('f-anim-shake-x', 4); setVal('f-anim-shake-y', 4);
  setVal('f-anim-cs-hue-start', 0); setVal('f-anim-cs-hue-end', 360); setVal('f-anim-cs-sat', 1);
  _toggleAnimSubsettings('');
  setVal('f-accent-color', '#dc2626'); setVal('f-accent-color-h', '#dc2626');
  setChecked('f-shimmer', false); setVal('f-shimmer-speed', 3); setVal('f-shimmer-op', 0.04);
  setVal('f-cs-radius', 0); setVal('f-cs-opacity', 1);
  setChecked('f-border-on', false);
  setVal('f-border-color', '#dc2626'); setVal('f-border-width', 1);
  const borderStyleEl = g('f-border-style'); if (borderStyleEl) borderStyleEl.value = 'solid';
  setChecked('f-shadow-on', false);
  setVal('f-shadow-color', '#000000'); setVal('f-shadow-op', 0.35);
  setVal('f-shadow-x', 0); setVal('f-shadow-y', 4);
  setVal('f-shadow-blur', 12); setVal('f-shadow-spread', 0);
  setChecked('f-shadow-inset', false);
  setVal('f-hov-scale', 1); setVal('f-hov-bright', 1); setVal('f-hov-sat', 1);
  setVal('f-hov-shadow', 0); setVal('f-hov-trans', 0.3);
  setVal('f-hov-border', '#dc2626'); setChecked('f-hov-glow', false);
  setVal('f-hov-blur', 0); setVal('f-hov-sib-blur', 0);
  setVal('f-hov-hue', 0); setVal('f-hov-opacity', 1);
  setChecked('f-hov-anim-on', false);
  const hovAnimTypeEl = g('f-hov-anim-type'); if (hovAnimTypeEl) hovAnimTypeEl.value = '';
  setVal('f-hov-anim-dur', 1);
  setVal('f-tf-rotate', 0); setVal('f-tf-scale', 1);
  setVal('f-tf-skewX', 0); setVal('f-tf-skewY', 0);
  setVal('f-tf-x', 0); setVal('f-tf-y', 0);
  ALL_SLIDER_IDS.forEach(syncSliderDisplay);
  document.querySelectorAll('.preset-card').forEach(c => c.classList.remove('active'));
  _triggerLiveUpdate();
  showToast('Parámetros restablecidos ✓');
}

// Reset beat style to use global defaults
export function resetBeatToGlobal() {
  var globalCs = (typeof siteSettings !== 'undefined' && siteSettings.globalCardStyle) || null;
  if (!globalCs) { showToast('No hay estilo global configurado', true); return; }
  var cs = globalCs;
  var f = cs.filter || {};
  setVal('f-cs-fb', f.brightness != null ? f.brightness : 1); setVal('f-cs-fc', f.contrast != null ? f.contrast : 1);
  setVal('f-cs-fs', f.saturate != null ? f.saturate : 1); setVal('f-cs-fg', f.grayscale || 0);
  setVal('f-cs-fse', f.sepia || 0); setVal('f-cs-fh', f.hueRotate || 0);
  setVal('f-cs-fbl', f.blur || 0); setVal('f-cs-fbl-type', f.blurType || ''); setVal('f-cs-fi', f.invert || 0);
  setVal('f-cs-fo', f.opacity != null ? f.opacity : 1);
  setVal('f-cs-ds-x', f.dropShadowX || 0); setVal('f-cs-ds-y', f.dropShadowY || 0);
  setVal('f-cs-ds-bl', f.dropShadowBlur || 0); setVal('f-cs-ds-op', f.dropShadowOpacity || 0);
  setVal('f-cs-ds-clr', f.dropShadowColor || '#000000'); setVal('f-cs-ds-clr-h', f.dropShadowColor || '#000000');
  var gc = cs.glow || {};
  setChecked('f-glow-on', gc.enabled || false);
  var glowTypeEl = g('f-glow-type'); if (glowTypeEl) glowTypeEl.value = gc.type || 'active';
  setVal('f-glow-color', gc.color || '#dc2626'); setVal('f-glow-color-h', gc.color || '#dc2626');
  setVal('f-glow-speed', gc.speed || 3); setVal('f-glow-int', gc.intensity != null ? gc.intensity : 1);
  setVal('f-glow-blur', gc.blur != null ? gc.blur : 20); setVal('f-glow-spread', gc.spread || 0);
  setVal('f-glow-op', gc.opacity != null ? gc.opacity : 1); setChecked('f-glow-hover', gc.hoverOnly || false);
  var ca = cs.anim;
  var animTypeEl = g('f-anim-type'); if (animTypeEl) animTypeEl.value = ca ? (ca.type || '') : '';
  setVal('f-anim-dur', ca ? (ca.dur || 2) : 2); setVal('f-anim-del', ca ? (ca.del || 0) : 0);
  var animEaseEl = g('f-anim-ease'); if (animEaseEl) animEaseEl.value = ca ? (ca.easing || 'ease-in-out') : 'ease-in-out';
  var animDirEl = g('f-anim-dir'); if (animDirEl) animDirEl.value = ca ? (ca.direction || 'normal') : 'normal';
  var animIterEl = g('f-anim-iter'); if (animIterEl) animIterEl.value = ca ? (ca.iterations || 'infinite') : 'infinite';
  setVal('f-anim-int', ca ? (ca.intensity != null ? ca.intensity : 100) : 100);
  setVal('f-anim-hue-start', ca ? (ca.hueStart != null ? ca.hueStart : 0) : 0);
  setVal('f-anim-hue-end', ca ? (ca.hueEnd != null ? ca.hueEnd : 360) : 360);
  _setHoloColors(ca ? (ca.holoColors || ['#ff0080','#00ff80','#0080ff']) : ['#ff0080','#00ff80','#0080ff']);
  setVal('f-anim-holo-bright-min', ca ? (ca.holoBrightMin || 0.9) : 0.9);
  setVal('f-anim-holo-bright-max', ca ? (ca.holoBrightMax || 1.4) : 1.4);
  setVal('f-anim-holo-sat-min', ca ? (ca.holoSatMin || 0.8) : 0.8);
  setVal('f-anim-holo-sat-max', ca ? (ca.holoSatMax || 2) : 2);
  setVal('f-anim-holo-glow', ca ? (ca.holoGlow || 0) : 0);
  setVal('f-anim-holo-blur', ca ? (ca.holoBlur || 0) : 0);
  var holoDirElR = g('f-anim-holo-dir'); if (holoDirElR) holoDirElR.value = ca ? (ca.holoDir || 'hue') : 'hue';
  setVal('f-anim-brillo-min', ca ? (ca.brilloMin || 0.8) : 0.8);
  setVal('f-anim-brillo-max', ca ? (ca.brilloMax || 1.5) : 1.5);
  setVal('f-anim-glitch-x', ca ? (ca.glitchX || 4) : 4);
  setVal('f-anim-glitch-y', ca ? (ca.glitchY || 4) : 4);
  setVal('f-anim-glitch-rot', ca ? (ca.glitchRot || 0) : 0);
  setChecked('f-anim-glitch-chromatic', ca ? (ca.glitchChromatic || false) : false);
  setVal('f-anim-translate-x', ca ? (ca.translateX || 0) : 0);
  setVal('f-anim-translate-y', ca ? (ca.translateY || 12) : 12);
  setVal('f-anim-translate-rot', ca ? (ca.translateRot || 0) : 0);
  setVal('f-anim-neon-min', ca ? (ca.neonMin || 0.4) : 0.4);
  setVal('f-anim-neon-max', ca ? (ca.neonMax || 1) : 1);
  setVal('f-anim-neon-bright', ca ? (ca.neonBright || 1) : 1);
  setVal('f-anim-parpadeo-min', ca ? (ca.parpadeoMin || 0.3) : 0.3);
  setVal('f-anim-parpadeo-max', ca ? (ca.parpadeoMax || 1) : 1);
  setVal('f-anim-rotate-angle', ca ? (ca.rotateAngle || 5) : 5);
  setVal('f-anim-rotate-scale', ca ? (ca.rotateScale || 1) : 1);
  setVal('f-anim-scale-min', ca ? (ca.scaleMin || 1) : 1);
  setVal('f-anim-scale-max', ca ? (ca.scaleMax || 1.06) : 1.06);
  setVal('f-anim-scale-opacity', ca ? (ca.scaleOpacity || 0.8) : 0.8);
  setVal('f-anim-shake-x', ca ? (ca.shakeX || 4) : 4);
  setVal('f-anim-shake-y', ca ? (ca.shakeY || 4) : 4);
  setVal('f-anim-cs-hue-start', ca ? (ca.csHueStart || 0) : 0);
  setVal('f-anim-cs-hue-end', ca ? (ca.csHueEnd || 360) : 360);
  setVal('f-anim-cs-sat', ca ? (ca.csSat || 1) : 1);
  var animType2ElR = g('f-anim-type2'); if (animType2ElR) animType2ElR.value = ca ? (ca.type2 || '') : '';
  _toggleAnimSubsettings(ca ? ca.type : '');
  var st = cs.style || {};
  setVal('f-accent-color', st.accentColor || '#dc2626'); setVal('f-accent-color-h', st.accentColor || '#dc2626');
  setChecked('f-shimmer', st.shimmer || false); setVal('f-shimmer-speed', st.shimmerSpeed || 3); setVal('f-shimmer-op', st.shimmerOp || 0.04); setVal('f-cs-radius', st.borderRadius || 0);
  setVal('f-cs-opacity', st.opacity != null ? st.opacity : 1);
  var bd = cs.border || {};
  setChecked('f-border-on', bd.enabled || false); setVal('f-border-color', bd.color || '#dc2626');
  setVal('f-border-width', bd.width || 1);
  var borderStyleEl = g('f-border-style'); if (borderStyleEl) borderStyleEl.value = bd.style || 'solid';
  var sh = cs.shadow || {};
  setChecked('f-shadow-on', sh.enabled || false); setVal('f-shadow-color', sh.color || '#000000');
  setVal('f-shadow-op', sh.opacity != null ? sh.opacity : 0.35);
  setVal('f-shadow-x', sh.x || 0); setVal('f-shadow-y', sh.y != null ? sh.y : 4);
  setVal('f-shadow-blur', sh.blur != null ? sh.blur : 12); setVal('f-shadow-spread', sh.spread || 0);
  setChecked('f-shadow-inset', sh.inset || false);
  var hv = cs.hover || {};
  setVal('f-hov-scale', hv.scale || 1); setVal('f-hov-bright', hv.brightness != null ? hv.brightness : 1);
  setVal('f-hov-sat', hv.saturate != null ? hv.saturate : 1); setVal('f-hov-shadow', hv.shadowBlur || 0);
  setVal('f-hov-trans', hv.transition != null ? hv.transition : 0.3);
  setVal('f-hov-border', hv.borderColor || '#dc2626'); setChecked('f-hov-glow', hv.glowIntensify || false);
  setVal('f-hov-blur', hv.blur || 0); setVal('f-hov-sib-blur', hv.siblingsBlur || 0);
  setVal('f-hov-hue', hv.hueRotate || 0); setVal('f-hov-opacity', hv.opacity != null ? hv.opacity : 1);
  setChecked('f-hov-anim-on', hv.enableAnim || false);
  var hovAnimTypeElR = g('f-hov-anim-type'); if (hovAnimTypeElR) hovAnimTypeElR.value = hv.animType || '';
  setVal('f-hov-anim-dur', hv.animDur || 1);
  var tf = cs.transform || {};
  setVal('f-tf-rotate', tf.rotate || 0); setVal('f-tf-scale', tf.scale || 1);
  setVal('f-tf-skewX', tf.skewX || 0); setVal('f-tf-skewY', tf.skewY || 0);
  setVal('f-tf-x', tf.x || 0); setVal('f-tf-y', tf.y || 0);
  ALL_SLIDER_IDS.forEach(syncSliderDisplay);
  document.querySelectorAll('.preset-card').forEach(c => c.classList.remove('active'));
  _triggerLiveUpdate();
  showToast('Usando estilo global ✓');
}

export function applyPreset(id) {
  const preset = STYLE_PRESETS.find(p => p.id === id); if (!preset) return;
  const cs = preset.apply();
  // RESET ALL FIELDS FIRST
  setVal('f-cs-fb', 1); setVal('f-cs-fc', 1); setVal('f-cs-fs', 1);
  setVal('f-cs-fg', 0); setVal('f-cs-fse', 0); setVal('f-cs-fh', 0);
  setVal('f-cs-fbl', 0); setVal('f-cs-fbl-type', ''); setVal('f-cs-fi', 0);
  setVal('f-cs-fo', 1);
  setVal('f-cs-ds-x', 0); setVal('f-cs-ds-y', 0); setVal('f-cs-ds-bl', 0); setVal('f-cs-ds-op', 0); setVal('f-cs-ds-clr', '#000000'); setVal('f-cs-ds-clr-h', '#000000');
  setChecked('f-glow-on', false); setChecked('f-glow-hover', false);
  (function(){ var e = g('f-glow-type'); if (e) e.value = 'active'; })();
  setVal('f-glow-color', '#dc2626'); setVal('f-glow-color-h', '#dc2626');
  setVal('f-glow-speed', 3); setVal('f-glow-int', 1);
  setVal('f-glow-blur', 20); setVal('f-glow-spread', 0); setVal('f-glow-op', 1);
  (function(){ var e = g('f-anim-type'); if (e) e.value = ''; })();
  (function(){ var e = g('f-anim-type2'); if (e) e.value = ''; })();
  setVal('f-anim-dur', 2); setVal('f-anim-del', 0);
  (function(){ var e = g('f-anim-ease'); if (e) e.value = 'ease-in-out'; })();
  (function(){ var e = g('f-anim-dir'); if (e) e.value = 'normal'; })();
  (function(){ var e = g('f-anim-iter'); if (e) e.value = 'infinite'; })();
  setVal('f-anim-int', 100); setVal('f-anim-hue-start', 0); setVal('f-anim-hue-end', 360);
  _setHoloColors(['#ff0080','#00ff80','#0080ff']);
  setVal('f-anim-holo-bright-min', 0.9); setVal('f-anim-holo-bright-max', 1.4);
  setVal('f-anim-holo-sat-min', 0.8); setVal('f-anim-holo-sat-max', 2);
  setVal('f-anim-holo-glow', 0); setVal('f-anim-holo-blur', 0);
  (function(){ var e = g('f-anim-holo-dir'); if (e) e.value = 'hue'; })();
  setVal('f-anim-brillo-min', 0.8); setVal('f-anim-brillo-max', 1.5);
  setVal('f-anim-glitch-x', 4); setVal('f-anim-glitch-y', 4); setVal('f-anim-glitch-rot', 0);
  setChecked('f-anim-glitch-chromatic', false);
  setVal('f-anim-translate-x', 0); setVal('f-anim-translate-y', 12); setVal('f-anim-translate-rot', 0);
  setVal('f-anim-neon-min', 0.4); setVal('f-anim-neon-max', 1); setVal('f-anim-neon-bright', 1);
  setVal('f-anim-parpadeo-min', 0.3); setVal('f-anim-parpadeo-max', 1);
  setVal('f-anim-rotate-angle', 5); setVal('f-anim-rotate-scale', 1);
  setVal('f-anim-scale-min', 1); setVal('f-anim-scale-max', 1.06); setVal('f-anim-scale-opacity', 0.8);
  setVal('f-anim-shake-x', 4); setVal('f-anim-shake-y', 4);
  setVal('f-anim-cs-hue-start', 0); setVal('f-anim-cs-hue-end', 360); setVal('f-anim-cs-sat', 1);
  setVal('f-accent-color', '#dc2626'); setVal('f-accent-color-h', '#dc2626');
  setChecked('f-shimmer', false); setVal('f-shimmer-speed', 3); setVal('f-shimmer-op', 0.04); setVal('f-cs-radius', 0); setVal('f-cs-opacity', 1);
  setChecked('f-border-on', false); setVal('f-border-color', '#dc2626'); setVal('f-border-width', 1);
  (function(){ var e = g('f-border-style'); if (e) e.value = 'solid'; })();
  setChecked('f-shadow-on', false); setChecked('f-shadow-inset', false);
  setVal('f-shadow-color', '#000000'); setVal('f-shadow-op', 0.35);
  setVal('f-shadow-x', 0); setVal('f-shadow-y', 4); setVal('f-shadow-blur', 12); setVal('f-shadow-spread', 0);
  setVal('f-hov-scale', 1); setVal('f-hov-bright', 1); setVal('f-hov-sat', 1);
  setVal('f-hov-shadow', 0); setVal('f-hov-trans', 0.3);
  setVal('f-hov-border', '#dc2626'); setChecked('f-hov-glow', false);
  setVal('f-hov-blur', 0); setVal('f-hov-sib-blur', 0); setVal('f-hov-hue', 0); setVal('f-hov-opacity', 1);
  setChecked('f-hov-anim-on', false);
  (function(){ var e = g('f-hov-anim-type'); if (e) e.value = ''; })();
  setVal('f-hov-anim-dur', 1);
  setVal('f-tf-rotate', 0); setVal('f-tf-scale', 1);
  setVal('f-tf-skewX', 0); setVal('f-tf-skewY', 0); setVal('f-tf-x', 0); setVal('f-tf-y', 0);

  // NOW APPLY PRESET VALUES
  document.querySelectorAll('.preset-card').forEach(c => c.classList.toggle('active', c.dataset.preset === id));

  const f = cs.filter || {};
  setVal('f-cs-fb', f.brightness || 1); setVal('f-cs-fc', f.contrast || 1); setVal('f-cs-fs', f.saturate || 1);
  setVal('f-cs-fg', f.grayscale || 0); setVal('f-cs-fse', f.sepia || 0); setVal('f-cs-fh', f.hueRotate || 0);
  setVal('f-cs-fbl', f.blur || 0); setVal('f-cs-fbl-type', f.blurType || ''); setVal('f-cs-fi', f.invert || 0);
  setVal('f-cs-fo', f.opacity != null ? f.opacity : 1);
  setVal('f-cs-ds-x', f.dropShadowX || 0); setVal('f-cs-ds-y', f.dropShadowY || 0);
  setVal('f-cs-ds-bl', f.dropShadowBlur || 0); setVal('f-cs-ds-op', f.dropShadowOpacity || 0);
  setVal('f-cs-ds-clr', f.dropShadowColor || '#000000'); setVal('f-cs-ds-clr-h', f.dropShadowColor || '#000000');

  const gc = cs.glow || {};
  setChecked('f-glow-on', gc.enabled || false);
  const glowTypeEl = g('f-glow-type'); if (glowTypeEl) glowTypeEl.value = gc.type || 'active';
  setVal('f-glow-color', gc.color || '#dc2626'); setVal('f-glow-color-h', gc.color || '#dc2626');
  setVal('f-glow-speed', gc.speed || 3); setVal('f-glow-int', gc.intensity != null ? gc.intensity : 1);
  setVal('f-glow-blur', gc.blur != null ? gc.blur : 20); setVal('f-glow-spread', gc.spread || 0);
  setVal('f-glow-op', gc.opacity != null ? gc.opacity : 1); setChecked('f-glow-hover', gc.hoverOnly || false);

  const ca = cs.anim;
  const animTypeEl = g('f-anim-type'); if (animTypeEl) animTypeEl.value = ca ? (ca.type || '') : '';
  const animType2El = g('f-anim-type2'); if (animType2El) animType2El.value = ca ? (ca.type2 || '') : '';
  setVal('f-anim-dur', ca ? (ca.dur || 2) : 2);
  setVal('f-anim-del', ca ? (ca.del || 0) : 0);
  const animEaseEl = g('f-anim-ease'); if (animEaseEl) animEaseEl.value = ca ? (ca.easing || 'ease-in-out') : 'ease-in-out';
  const animDirEl = g('f-anim-dir'); if (animDirEl) animDirEl.value = ca ? (ca.direction || 'normal') : 'normal';
  const animIterEl = g('f-anim-iter'); if (animIterEl) animIterEl.value = ca ? (ca.iterations || 'infinite') : 'infinite';
  setVal('f-anim-int', ca ? (ca.intensity != null ? ca.intensity : 100) : 100);
  setVal('f-anim-hue-start', ca ? (ca.hueStart != null ? ca.hueStart : 0) : 0);
  setVal('f-anim-hue-end', ca ? (ca.hueEnd != null ? ca.hueEnd : 360) : 360);
  _setHoloColors(ca ? (ca.holoColors || ['#ff0080','#00ff80','#0080ff']) : ['#ff0080','#00ff80','#0080ff']);
  setVal('f-anim-holo-bright-min', ca ? (ca.holoBrightMin || 0.9) : 0.9);
  setVal('f-anim-holo-bright-max', ca ? (ca.holoBrightMax || 1.4) : 1.4);
  setVal('f-anim-holo-sat-min', ca ? (ca.holoSatMin || 0.8) : 0.8);
  setVal('f-anim-holo-sat-max', ca ? (ca.holoSatMax || 2) : 2);
  setVal('f-anim-holo-glow', ca ? (ca.holoGlow || 0) : 0);
  setVal('f-anim-holo-blur', ca ? (ca.holoBlur || 0) : 0);
  const holoDirEl = g('f-anim-holo-dir'); if (holoDirEl) holoDirEl.value = ca ? (ca.holoDir || 'hue') : 'hue';
  setVal('f-anim-brillo-min', ca ? (ca.brilloMin || 0.8) : 0.8);
  setVal('f-anim-brillo-max', ca ? (ca.brilloMax || 1.5) : 1.5);
  setVal('f-anim-glitch-x', ca ? (ca.glitchX || 4) : 4);
  setVal('f-anim-glitch-y', ca ? (ca.glitchY || 4) : 4);
  setVal('f-anim-glitch-rot', ca ? (ca.glitchRot || 0) : 0);
  setChecked('f-anim-glitch-chromatic', ca ? (ca.glitchChromatic || false) : false);
  setVal('f-anim-translate-x', ca ? (ca.translateX || 0) : 0);
  setVal('f-anim-translate-y', ca ? (ca.translateY || 12) : 12);
  setVal('f-anim-translate-rot', ca ? (ca.translateRot || 0) : 0);
  setVal('f-anim-neon-min', ca ? (ca.neonMin || 0.4) : 0.4);
  setVal('f-anim-neon-max', ca ? (ca.neonMax || 1) : 1);
  setVal('f-anim-neon-bright', ca ? (ca.neonBright || 1) : 1);
  setVal('f-anim-parpadeo-min', ca ? (ca.parpadeoMin || 0.3) : 0.3);
  setVal('f-anim-parpadeo-max', ca ? (ca.parpadeoMax || 1) : 1);
  setVal('f-anim-rotate-angle', ca ? (ca.rotateAngle || 5) : 5);
  setVal('f-anim-rotate-scale', ca ? (ca.rotateScale || 1) : 1);
  setVal('f-anim-scale-min', ca ? (ca.scaleMin || 1) : 1);
  setVal('f-anim-scale-max', ca ? (ca.scaleMax || 1.06) : 1.06);
  setVal('f-anim-scale-opacity', ca ? (ca.scaleOpacity || 0.8) : 0.8);
  setVal('f-anim-shake-x', ca ? (ca.shakeX || 4) : 4);
  setVal('f-anim-shake-y', ca ? (ca.shakeY || 4) : 4);
  setVal('f-anim-cs-hue-start', ca ? (ca.csHueStart || 0) : 0);
  setVal('f-anim-cs-hue-end', ca ? (ca.csHueEnd || 360) : 360);
  setVal('f-anim-cs-sat', ca ? (ca.csSat || 1) : 1);
  // Show/hide anim sub-settings panel based on preset's animation type
  _toggleAnimSubsettings(ca ? ca.type : '');

  const st = cs.style || {};
  setVal('f-accent-color', st.accentColor || '#dc2626'); setVal('f-accent-color-h', st.accentColor || '#dc2626');
  setChecked('f-shimmer', st.shimmer || false); setVal('f-shimmer-speed', st.shimmerSpeed || 3); setVal('f-shimmer-op', st.shimmerOp || 0.04);
  setVal('f-cs-radius', st.borderRadius || 0); setVal('f-cs-opacity', st.opacity != null ? st.opacity : 1);

  const bd = cs.border || {};
  setChecked('f-border-on', bd.enabled || false);
  setVal('f-border-color', bd.color || '#dc2626'); setVal('f-border-width', bd.width || 1);
  const borderStyleEl = g('f-border-style'); if (borderStyleEl) borderStyleEl.value = bd.style || 'solid';

  const sh = cs.shadow || {};
  setChecked('f-shadow-on', sh.enabled || false);
  setVal('f-shadow-color', sh.color || '#000000'); setVal('f-shadow-op', sh.opacity != null ? sh.opacity : 0.35);
  setVal('f-shadow-x', sh.x || 0); setVal('f-shadow-y', sh.y != null ? sh.y : 4);
  setVal('f-shadow-blur', sh.blur != null ? sh.blur : 12); setVal('f-shadow-spread', sh.spread || 0);
  setChecked('f-shadow-inset', sh.inset || false);

  const hv = cs.hover || {};
  setVal('f-hov-scale', hv.scale || 1); setVal('f-hov-bright', hv.brightness != null ? hv.brightness : 1);
  setVal('f-hov-sat', hv.saturate != null ? hv.saturate : 1); setVal('f-hov-shadow', hv.shadowBlur || 0);
  setVal('f-hov-trans', hv.transition != null ? hv.transition : 0.3);
  setVal('f-hov-border', hv.borderColor || '#dc2626'); setChecked('f-hov-glow', hv.glowIntensify || false);
  setVal('f-hov-blur', hv.blur || 0); setVal('f-hov-sib-blur', hv.siblingsBlur || 0);
  setVal('f-hov-hue', hv.hueRotate || 0); setVal('f-hov-opacity', hv.opacity != null ? hv.opacity : 1);
  setChecked('f-hov-anim-on', hv.enableAnim || false);
  const hovAnimTypeEl = g('f-hov-anim-type'); if (hovAnimTypeEl) hovAnimTypeEl.value = hv.animType || '';
  setVal('f-hov-anim-dur', hv.animDur || 1);

  const tf = cs.transform || {};
  setVal('f-tf-rotate', tf.rotate || 0); setVal('f-tf-scale', tf.scale || 1);
  setVal('f-tf-skewX', tf.skewX || 0); setVal('f-tf-skewY', tf.skewY || 0);
  setVal('f-tf-x', tf.x || 0); setVal('f-tf-y', tf.y || 0);

  ALL_SLIDER_IDS.forEach(syncSliderDisplay);
  _triggerLiveUpdate();
  showToast('Preset "' + preset.name + '" aplicado ✓');
}

// ═══ Window assignments ═══
Object.assign(window, {
  applyPreset, applyHoverPreset, resetCardStyle, resetBeatToGlobal,
  renderPresets, renderHoverPresets
});

// Initialize preset grids on load
renderPresets();
renderHoverPresets();
