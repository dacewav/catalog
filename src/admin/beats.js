// ═══ DACEWAV Admin — Beats CRUD ═══
import { db, allBeats, setAllBeats, editId, setEditId, defLics, _edLics, setEdLics, _dragBeatId, setDragBeatId, _batchImgQueue, setBatchImgQueue } from './state.js';
import { g, val, setVal, checked, setChecked, showToast, showSaving, confirmInline, promptInline, fmt } from './helpers.js';
import { showSection } from './nav.js';
import { autoSave, postToFrame } from './core.js';
import { R2_ENABLED, uploadToR2 } from './r2.js';

// ═══ STYLE PRESETS ═══
const STYLE_PRESETS = [
  {
    id: 'brutalist',
    name: 'Industrial Brutal',
    icon: '🏭',
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
    id: 'minimalist',
    name: 'Minimal Limpio',
    icon: '◽',
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
    id: 'luxury-glass',
    name: 'Luxury Glass',
    icon: '💎',
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
    id: 'editorial',
    name: 'Editorial Swiss',
    icon: '📰',
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

function renderHoverPresets() {
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
  // Sync slider displays
  ['f-hov-scale','f-hov-bright','f-hov-sat','f-hov-shadow','f-hov-trans','f-hov-blur','f-hov-sib-blur','f-hov-hue','f-hov-opacity','f-hov-anim-dur'].forEach(syncSliderDisplay);
  updateCardPreview();
  // Trigger live update to store — setVal() doesn't fire events, so force it
  if (typeof window._sendLiveUpdate === 'function') window._sendLiveUpdate();
  showToast('Hover preset "' + preset.name.replace(/[^\w\s]/g, '').trim() + '" aplicado ✓');
}

function renderPresets() {
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
  // Filters — all identity
  setVal('f-cs-fb', 1); setVal('f-cs-fc', 1); setVal('f-cs-fs', 1);
  setVal('f-cs-fg', 0); setVal('f-cs-fse', 0); setVal('f-cs-fh', 0);
  setVal('f-cs-fbl', 0); setVal('f-cs-fi', 0);
  // Glow — off
  setChecked('f-glow-on', false);
  const glowTypeEl = g('f-glow-type'); if (glowTypeEl) glowTypeEl.value = 'active';
  setVal('f-glow-color', '#dc2626'); setVal('f-glow-color-h', '#dc2626');
  setVal('f-glow-speed', 3); setVal('f-glow-int', 1);
  setVal('f-glow-blur', 20); setVal('f-glow-spread', 0);
  setVal('f-glow-op', 1); setChecked('f-glow-hover', false);
  // Animation — none
  const animTypeEl = g('f-anim-type'); if (animTypeEl) animTypeEl.value = '';
  const animType2El = g('f-anim-type2'); if (animType2El) animType2El.value = '';
  setVal('f-anim-dur', 2); setVal('f-anim-del', 0);
  const animEaseEl = g('f-anim-ease'); if (animEaseEl) animEaseEl.value = 'ease-in-out';
  const animDirEl = g('f-anim-dir'); if (animDirEl) animDirEl.value = 'normal';
  const animIterEl = g('f-anim-iter'); if (animIterEl) animIterEl.value = 'infinite';
  setVal('f-anim-int', 100);
  // Style — defaults
  setVal('f-accent-color', '#dc2626'); setVal('f-accent-color-h', '#dc2626');
  setChecked('f-shimmer', false);
  setVal('f-cs-radius', 0); setVal('f-cs-opacity', 1);
  // Border — off
  setChecked('f-border-on', false);
  setVal('f-border-color', '#dc2626'); setVal('f-border-width', 1);
  const borderStyleEl = g('f-border-style'); if (borderStyleEl) borderStyleEl.value = 'solid';
  // Shadow — off
  setChecked('f-shadow-on', false);
  setVal('f-shadow-color', '#000000'); setVal('f-shadow-op', 0.35);
  setVal('f-shadow-x', 0); setVal('f-shadow-y', 4);
  setVal('f-shadow-blur', 12); setVal('f-shadow-spread', 0);
  setChecked('f-shadow-inset', false);
  // Hover — defaults
  setVal('f-hov-scale', 1); setVal('f-hov-bright', 1); setVal('f-hov-sat', 1);
  setVal('f-hov-shadow', 0); setVal('f-hov-trans', 0.3);
  setVal('f-hov-border', '#dc2626'); setChecked('f-hov-glow', false);
  setVal('f-hov-blur', 0); setVal('f-hov-sib-blur', 0);
  setVal('f-hov-hue', 0); setVal('f-hov-opacity', 1);
  setChecked('f-hov-anim-on', false);
  const hovAnimTypeEl = g('f-hov-anim-type'); if (hovAnimTypeEl) hovAnimTypeEl.value = '';
  setVal('f-hov-anim-dur', 1);
  // Transform — identity
  setVal('f-tf-rotate', 0); setVal('f-tf-scale', 1);
  setVal('f-tf-skewX', 0); setVal('f-tf-skewY', 0);
  setVal('f-tf-x', 0); setVal('f-tf-y', 0);
  // Sync slider displays
  ['f-anim-dur','f-anim-del','f-border-width','f-glow-speed','f-glow-int','f-glow-blur','f-glow-spread','f-glow-op',
   'f-cs-fb','f-cs-fc','f-cs-fs','f-cs-fg','f-cs-fse','f-cs-fh','f-cs-fbl','f-cs-fi','f-cs-radius','f-cs-opacity',
   'f-shadow-op','f-shadow-x','f-shadow-y','f-shadow-blur','f-shadow-spread',
   'f-hov-scale','f-hov-bright','f-hov-sat','f-hov-shadow','f-hov-trans','f-hov-blur','f-hov-sib-blur','f-hov-hue','f-hov-opacity','f-hov-anim-dur',
   'f-tf-rotate','f-tf-scale','f-tf-skewX','f-tf-skewY','f-tf-x','f-tf-y'
  ].forEach(syncSliderDisplay);
  // Deselect preset cards
  document.querySelectorAll('.preset-card').forEach(c => c.classList.remove('active'));
  // Update preview + live
  updateCardPreview();
  if (typeof window._sendLiveUpdate === 'function') window._sendLiveUpdate();
  showToast('Parámetros restablecidos ✓');
}

export function applyPreset(id) {
  const preset = STYLE_PRESETS.find(p => p.id === id); if (!preset) return;
  const cs = preset.apply();

  // Highlight active preset
  document.querySelectorAll('.preset-card').forEach(c => c.classList.toggle('active', c.dataset.preset === id));

  // Filters
  const f = cs.filter || {};
  setVal('f-cs-fb', f.brightness || 1); setVal('f-cs-fc', f.contrast || 1); setVal('f-cs-fs', f.saturate || 1);
  setVal('f-cs-fg', f.grayscale || 0); setVal('f-cs-fse', f.sepia || 0); setVal('f-cs-fh', f.hueRotate || 0);
  setVal('f-cs-fbl', f.blur || 0); setVal('f-cs-fi', f.invert || 0);

  // Glow
  const gc = cs.glow || {};
  setChecked('f-glow-on', gc.enabled || false);
  const glowTypeEl = g('f-glow-type'); if (glowTypeEl) glowTypeEl.value = gc.type || 'active';
  setVal('f-glow-color', gc.color || '#dc2626'); setVal('f-glow-color-h', gc.color || '#dc2626');
  setVal('f-glow-speed', gc.speed || 3); setVal('f-glow-int', gc.intensity != null ? gc.intensity : 1);
  setVal('f-glow-blur', gc.blur != null ? gc.blur : 20); setVal('f-glow-spread', gc.spread || 0);
  setVal('f-glow-op', gc.opacity != null ? gc.opacity : 1); setChecked('f-glow-hover', gc.hoverOnly || false);

  // Animation
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
  // Per-type sub-settings
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
  // Show correct sub-panel
  _toggleAnimSubsettings(ca ? ca.type : '');

  // Style
  const st = cs.style || {};
  setVal('f-accent-color', st.accentColor || '#dc2626'); setVal('f-accent-color-h', st.accentColor || '#dc2626');
  setChecked('f-shimmer', st.shimmer || false);
  setVal('f-cs-radius', st.borderRadius || 0); setVal('f-cs-opacity', st.opacity != null ? st.opacity : 1);

  // Border
  const bd = cs.border || {};
  setChecked('f-border-on', bd.enabled || false);
  setVal('f-border-color', bd.color || '#dc2626'); setVal('f-border-width', bd.width || 1);
  const borderStyleEl = g('f-border-style'); if (borderStyleEl) borderStyleEl.value = bd.style || 'solid';

  // Shadow
  const sh = cs.shadow || {};
  setChecked('f-shadow-on', sh.enabled || false);
  setVal('f-shadow-color', sh.color || '#000000'); setVal('f-shadow-op', sh.opacity != null ? sh.opacity : 0.35);
  setVal('f-shadow-x', sh.x || 0); setVal('f-shadow-y', sh.y != null ? sh.y : 4);
  setVal('f-shadow-blur', sh.blur != null ? sh.blur : 12); setVal('f-shadow-spread', sh.spread || 0);
  setChecked('f-shadow-inset', sh.inset || false);

  // Hover
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

  // Transform
  const tf = cs.transform || {};
  setVal('f-tf-rotate', tf.rotate || 0); setVal('f-tf-scale', tf.scale || 1);
  setVal('f-tf-skewX', tf.skewX || 0); setVal('f-tf-skewY', tf.skewY || 0);
  setVal('f-tf-x', tf.x || 0); setVal('f-tf-y', tf.y || 0);

  // Sync all slider displays
  ['f-anim-dur','f-anim-del','f-border-width','f-glow-speed','f-glow-int','f-glow-blur','f-glow-spread','f-glow-op',
   'f-cs-fb','f-cs-fc','f-cs-fs','f-cs-fg','f-cs-fse','f-cs-fh','f-cs-fbl','f-cs-fi','f-cs-radius','f-cs-opacity',
   'f-shadow-op','f-shadow-x','f-shadow-y','f-shadow-blur','f-shadow-spread',
   'f-hov-scale','f-hov-bright','f-hov-sat','f-hov-shadow','f-hov-trans','f-hov-blur','f-hov-sib-blur','f-hov-hue','f-hov-opacity','f-hov-anim-dur',
   'f-tf-rotate','f-tf-scale','f-tf-skewX','f-tf-skewY','f-tf-x','f-tf-y'
  ].forEach(syncSliderDisplay);

  updateCardPreview();
  // Trigger live update to store — setVal() doesn't fire events, so force it
  if (typeof window._sendLiveUpdate === 'function') window._sendLiveUpdate();
  showToast('Preset "' + preset.name + '" aplicado ✓');
}

// Sync slider value display after programmatic setVal
function syncSliderDisplay(inputId) {
  const el = g(inputId); if (!el) return;
  const sib = el.nextElementSibling; if (!sib) return;
  const v = parseFloat(el.value);
  if (inputId.includes('dur') || inputId.includes('del') || inputId.includes('speed')) sib.textContent = v.toFixed(1) + 's';
  else if (inputId.includes('width') || inputId.includes('blur') || inputId.includes('spread') || inputId.includes('shadow') && !inputId.includes('hov')) sib.textContent = (inputId.includes('blur') || inputId.includes('spread') || inputId.includes('shadow')) ? v + 'px' : v.toFixed(1) + 'px';
  else if (inputId.includes('rotate') || inputId.includes('skew') || inputId.includes('hue') || inputId.includes('fh')) sib.textContent = v.toFixed(1) + '°';
  else if (inputId.includes('scale') || inputId.includes('hov-scale') || inputId.includes('tf-scale')) sib.textContent = v.toFixed(2) + 'x';
  else if (inputId.includes('radius')) sib.textContent = v + 'px';
  else if (inputId.includes('x') || inputId.includes('y')) sib.textContent = v + 'px';
  else if (inputId.includes('trans')) sib.textContent = v.toFixed(2) + 's';
  else sib.textContent = v.toFixed(2);
}

// Color picker ↔ hex input sync (bidirectional)
function syncAccentColor(source) {
  const picker = g('f-accent-color');
  const hex = g('f-accent-color-h');
  if (!picker || !hex) return;
  if (source === 'picker') hex.value = picker.value;
  else picker.value = hex.value;
}

// ═══ HELPER: toggle per-animation sub-settings panels ═══
function _toggleAnimSubsettings(type) {
  const container = document.getElementById('anim-subsettings');
  if (!container) return;
  const panels = container.querySelectorAll('.anim-sub-panel');
  panels.forEach(p => p.style.display = 'none');
  if (!type) { container.style.display = 'none'; return; }
  container.style.display = 'block';

  // Map animation types to sub-settings panels
  const map = {
    'holograma': 'sub-holograma',
    'cambio-color': 'sub-color-shift',
    'brillo': 'sub-brillo',
    'glitch': 'sub-glitch',
    'temblor': 'sub-shake',
    'flotar': 'sub-translate',
    'pulsar': 'sub-scale',
    'respirar': 'sub-scale',
    'latido': 'sub-scale',
    'rebotar': 'sub-translate',
    'deslizar-arriba': 'sub-translate',
    'deslizar-abajo': 'sub-translate',
    'deslizar-izq': 'sub-translate',
    'deslizar-der': 'sub-translate',
    'sacudida': 'sub-shake',
    'neon-flicker': 'sub-neon',
    'parpadeo': 'sub-parpadeo',
    'rotar': 'sub-rotate',
    'wobble': 'sub-rotate',
    'balanceo': 'sub-rotate',
    'swing': 'sub-rotate',
    'drift': 'sub-translate',
    'shake-x': 'sub-shake'
  };
  const panelId = map[type];
  if (panelId) {
    const panel = document.getElementById(panelId);
    if (panel) panel.style.display = 'block';
  }
}

// ═══ HELPER: add holograma color stop ═══
window.addHoloColor = function() {
  const list = document.getElementById('holo-colors-list');
  if (!list) return;
  const colors = ['#ffff00','#ff00ff','#00ffff','#ff8800','#8800ff'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const div = document.createElement('div');
  div.className = 'holo-cs';
  div.style.cssText = 'display:flex;align-items:center;gap:4px';
  div.innerHTML = `<input type="color" value="${randomColor}" oninput="updateCardPreview()" style="width:32px;height:24px;border:1px solid var(--b);border-radius:4px;background:none;cursor:pointer;padding:0"><button onclick="this.parentElement.remove();updateCardPreview()" style="background:none;border:none;color:var(--acc);cursor:pointer;font-size:12px">✕</button>`;
  list.appendChild(div);
  updateCardPreview();
};

// ═══ HELPER: get holograma colors from DOM ═══
function _getHoloColors() {
  const list = document.getElementById('holo-colors-list');
  if (!list) return ['#ff0080','#00ff80','#0080ff'];
  return Array.from(list.querySelectorAll('input[type=color]')).map(i => i.value);
}

// ═══ HELPER: set holograma colors in DOM ═══
function _setHoloColors(colors) {
  const list = document.getElementById('holo-colors-list');
  if (!list || !colors || !colors.length) return;
  list.innerHTML = colors.map(c => `<div class="holo-cs" style="display:flex;align-items:center;gap:4px"><input type="color" value="${c}" oninput="updateCardPreview()" style="width:32px;height:24px;border:1px solid var(--b);border-radius:4px;background:none;cursor:pointer;padding:0"><button onclick="this.parentElement.remove();updateCardPreview()" style="background:none;border:none;color:var(--acc);cursor:pointer;font-size:12px">✕</button></div>`).join('');
}

// ═══ HELPER: build cardStyle from inputs ═══
function _buildCardStyleFromInputs() {
  const animType = val('f-anim-type');
  return {
    filter: {
      brightness: parseFloat(val('f-cs-fb')) || 1,
      contrast: parseFloat(val('f-cs-fc')) || 1,
      saturate: parseFloat(val('f-cs-fs')) || 1,
      grayscale: parseFloat(val('f-cs-fg')) || 0,
      sepia: parseFloat(val('f-cs-fse')) || 0,
      hueRotate: parseInt(val('f-cs-fh')) || 0,
      blur: parseFloat(val('f-cs-fbl')) || 0,
      invert: parseFloat(val('f-cs-fi')) || 0
    },
    glow: {
      enabled: checked('f-glow-on'),
      type: val('f-glow-type') || 'active',
      color: val('f-glow-color') || '#dc2626',
      speed: parseFloat(val('f-glow-speed')) || 3,
      intensity: parseFloat(val('f-glow-int')) || 1,
      blur: parseInt(val('f-glow-blur')) || 20,
      spread: parseInt(val('f-glow-spread')) || 0,
      opacity: parseFloat(val('f-glow-op')) || 1,
      hoverOnly: checked('f-glow-hover')
    },
    anim: animType ? {
      type: animType,
      type2: val('f-anim-type2') || '',
      dur: parseFloat(val('f-anim-dur')) || 2,
      del: parseFloat(val('f-anim-del')) || 0,
      easing: val('f-anim-ease') || 'ease-in-out',
      direction: val('f-anim-dir') || 'normal',
      iterations: val('f-anim-iter') || 'infinite',
      intensity: parseInt(val('f-anim-int')) || 100,
      hueStart: parseInt(val('f-anim-hue-start')) || 0,
      hueEnd: parseInt(val('f-anim-hue-end')) || 360,
      // Holograma
      holoColors: _getHoloColors(),
      holoBrightMin: parseFloat(val('f-anim-holo-bright-min')) || 0.9,
      holoBrightMax: parseFloat(val('f-anim-holo-bright-max')) || 1.4,
      holoSatMin: parseFloat(val('f-anim-holo-sat-min')) || 0.8,
      holoSatMax: parseFloat(val('f-anim-holo-sat-max')) || 2,
      holoGlow: parseInt(val('f-anim-holo-glow')) || 0,
      holoBlur: parseFloat(val('f-anim-holo-blur')) || 0,
      holoDir: val('f-anim-holo-dir') || 'hue',
      // Brillo
      brilloMin: parseFloat(val('f-anim-brillo-min')) || 0.8,
      brilloMax: parseFloat(val('f-anim-brillo-max')) || 1.5,
      // Glitch
      glitchX: parseInt(val('f-anim-glitch-x')) || 4,
      glitchY: parseInt(val('f-anim-glitch-y')) || 4,
      glitchRot: parseFloat(val('f-anim-glitch-rot')) || 0,
      glitchChromatic: checked('f-anim-glitch-chromatic'),
      // Translate
      translateX: parseInt(val('f-anim-translate-x')) || 0,
      translateY: parseInt(val('f-anim-translate-y')) || 12,
      translateRot: parseFloat(val('f-anim-translate-rot')) || 0,
      // Neon
      neonMin: parseFloat(val('f-anim-neon-min')) || 0.4,
      neonMax: parseFloat(val('f-anim-neon-max')) || 1,
      neonBright: parseFloat(val('f-anim-neon-bright')) || 1,
      // Parpadeo
      parpadeoMin: parseFloat(val('f-anim-parpadeo-min')) || 0.3,
      parpadeoMax: parseFloat(val('f-anim-parpadeo-max')) || 1,
      // Rotate
      rotateAngle: parseInt(val('f-anim-rotate-angle')) || 5,
      rotateScale: parseFloat(val('f-anim-rotate-scale')) || 1,
      // Scale (pulsar/respirar/latido)
      scaleMin: parseFloat(val('f-anim-scale-min')) || 1,
      scaleMax: parseFloat(val('f-anim-scale-max')) || 1.06,
      scaleOpacity: parseFloat(val('f-anim-scale-opacity')) || 0.8,
      // Shake
      shakeX: parseInt(val('f-anim-shake-x')) || 4,
      shakeY: parseInt(val('f-anim-shake-y')) || 4,
      // Cambio-color
      csHueStart: parseInt(val('f-anim-cs-hue-start')) || 0,
      csHueEnd: parseInt(val('f-anim-cs-hue-end')) || 360,
      csSat: parseFloat(val('f-anim-cs-sat')) || 1
    } : null,
    style: {
      accentColor: val('f-accent-color') || '',
      shimmer: checked('f-shimmer'),
      borderRadius: parseInt(val('f-cs-radius')) || 0,
      opacity: parseFloat(val('f-cs-opacity')) || 1
    },
    border: {
      enabled: checked('f-border-on'),
      color: val('f-border-color') || '#dc2626',
      width: parseFloat(val('f-border-width')) || 1,
      style: val('f-border-style') || 'solid'
    },
    shadow: {
      enabled: checked('f-shadow-on'),
      color: val('f-shadow-color') || '#000000',
      opacity: parseFloat(val('f-shadow-op')) || 0.35,
      x: parseInt(val('f-shadow-x')) || 0,
      y: parseInt(val('f-shadow-y')) || 4,
      blur: parseInt(val('f-shadow-blur')) || 12,
      spread: parseInt(val('f-shadow-spread')) || 0,
      inset: checked('f-shadow-inset')
    },
    hover: {
      scale: parseFloat(val('f-hov-scale')) || 1,
      brightness: parseFloat(val('f-hov-bright')) || 1,
      saturate: parseFloat(val('f-hov-sat')) || 1,
      shadowBlur: parseInt(val('f-hov-shadow')) || 0,
      transition: parseFloat(val('f-hov-trans')) || 0.3,
      borderColor: val('f-hov-border') || '',
      glowIntensify: checked('f-hov-glow'),
      blur: parseFloat(val('f-hov-blur')) || 0,
      siblingsBlur: parseFloat(val('f-hov-sib-blur')) || 0,
      hueRotate: parseInt(val('f-hov-hue')) || 0,
      opacity: parseFloat(val('f-hov-opacity')) || 1,
      enableAnim: checked('f-hov-anim-on'),
      animType: val('f-hov-anim-type') || '',
      animDur: parseFloat(val('f-hov-anim-dur')) || 1
    },
    transform: {
      rotate: parseFloat(val('f-tf-rotate')) || 0,
      scale: parseFloat(val('f-tf-scale')) || 1,
      skewX: parseFloat(val('f-tf-skewX')) || 0,
      skewY: parseFloat(val('f-tf-skewY')) || 0,
      x: parseInt(val('f-tf-x')) || 0,
      y: parseInt(val('f-tf-y')) || 0
    }
  };
}

// ═══ HELPER: apply cardStyle to preview element ═══
function _applyCardStyleToPreview(pv, cs) {
  const inner = pv.querySelector('.bcpv-inner');

  // 1. CSS Filters — match store logic (skip undefined AND identity values)
  const f = cs.filter || {};
  const filters = [];
  if (f.brightness != null && f.brightness !== 1) filters.push('brightness(' + f.brightness + ')');
  if (f.contrast != null && f.contrast !== 1) filters.push('contrast(' + f.contrast + ')');
  if (f.saturate != null && f.saturate !== 1) filters.push('saturate(' + f.saturate + ')');
  if (f.grayscale) filters.push('grayscale(' + f.grayscale + ')');
  if (f.sepia) filters.push('sepia(' + f.sepia + ')');
  if (f.hueRotate) filters.push('hue-rotate(' + f.hueRotate + 'deg)');
  if (f.blur) filters.push('blur(' + f.blur + 'px)');
  if (f.invert) filters.push('invert(' + f.invert + ')');
  if (filters.length) pv.style.filter = filters.join(' ');
  else pv.style.filter = '';

  // 1.5 Accent color propagation to button, border, glow vars
  const accentColor = (cs.style || {}).accentColor;
  if (accentColor) {
    const hex = accentColor.replace('#','');
    const r = parseInt(hex.substring(0,2),16)||220;
    const gv = parseInt(hex.substring(2,4),16)||38;
    const b = parseInt(hex.substring(4,6),16)||38;
    pv.style.setProperty('--accent', accentColor);
    pv.style.setProperty('--btn-lic-clr', accentColor);
    pv.style.setProperty('--btn-lic-bdr', 'rgba('+r+','+gv+','+b+',0.5)');
    pv.style.setProperty('--btn-lic-bg', 'rgba('+r+','+gv+','+b+',0.1)');
  }

  // 2. Glow
  const gc = cs.glow || {};
  if (gc.enabled) {
    pv.classList.add('glow-' + (gc.type || 'active'));
    const hex = (gc.color || '#dc2626').replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 220;
    const gv = parseInt(hex.substring(2, 4), 16) || 38;
    const b = parseInt(hex.substring(4, 6), 16) || 38;
    pv.style.setProperty('--glow-r', r);
    pv.style.setProperty('--glow-g', gv);
    pv.style.setProperty('--glow-b', b);
    pv.style.setProperty('--glow-speed', (gc.speed || 3) + 's');
    pv.style.setProperty('--glow-int', gc.intensity || 1);
    pv.style.setProperty('--glow-blur', (gc.blur || 20) + 'px');
    pv.style.setProperty('--glow-spread', (gc.spread || 0) + 'px');
    pv.style.setProperty('--glow-op', gc.opacity != null ? gc.opacity : 1);
    if (gc.hoverOnly) pv.classList.add('glow-hover-only');
  }

  // 3. Card animation
  const ca = cs.anim;
  if (ca && ca.type) {
    var pvAnimSuffix = '';
    if (ca.type === 'holograma' && ca.holoDir) {
      if (ca.holoDir === 'gradient') pvAnimSuffix = '-gradient';
      else if (ca.holoDir === 'pulse') pvAnimSuffix = '-pulse';
    }
    pv.classList.add('anim-' + ca.type + pvAnimSuffix);
    pv.style.setProperty('--ad', (ca.dur || 2) + 's');
    pv.style.setProperty('--adl', (ca.del || 0) + 's');
    pv.style.setProperty('--aease', ca.easing || 'ease-in-out');
    pv.style.setProperty('--adir', ca.direction || 'normal');
    pv.style.setProperty('--aiter', ca.iterations || 'infinite');
    // Intensity (0-100% mapped to 0-1)
    const intVal = (ca.intensity != null ? ca.intensity : 100) / 100;
    pv.style.setProperty('--anim-int', intVal);
    // Per-type sub-settings as CSS vars
    if (ca.type === 'holograma') {
      pv.style.setProperty('--anim-hue-start', (ca.hueStart || 0) + 'deg');
      pv.style.setProperty('--anim-hue-end', (ca.hueEnd || 360) + 'deg');
      pv.style.setProperty('--anim-holo-bright-min', ca.holoBrightMin || 0.9);
      pv.style.setProperty('--anim-holo-bright-max', ca.holoBrightMax || 1.4);
      pv.style.setProperty('--anim-holo-sat-min', ca.holoSatMin || 0.8);
      pv.style.setProperty('--anim-holo-sat-max', ca.holoSatMax || 2);
      pv.style.setProperty('--anim-holo-glow', (ca.holoGlow || 0) + 'px');
      pv.style.setProperty('--anim-holo-blur', (ca.holoBlur || 0) + 'px');
      // Multi-color gradient vars
      var holoDir = ca.holoDir || 'hue';
      var holoColors = ca.holoColors || ['#ff0080','#00ff80','#0080ff'];
      if (holoDir === 'gradient' || holoDir === 'pulse') {
        pv.style.setProperty('--holo-c0', holoColors[0] || '#ff0080');
        pv.style.setProperty('--holo-c1', holoColors[1] || '#00ff80');
        pv.style.setProperty('--holo-c2', holoColors[2] || '#0080ff');
        if (holoColors[3]) pv.style.setProperty('--holo-c3', holoColors[3]);
      }
    }
    if (ca.type === 'cambio-color') {
      pv.style.setProperty('--anim-cs-hue-start', (ca.csHueStart || 0) + 'deg');
      pv.style.setProperty('--anim-cs-hue-end', (ca.csHueEnd || 360) + 'deg');
      pv.style.setProperty('--anim-cs-sat', ca.csSat || 1);
    }
    if (ca.type === 'brillo') {
      pv.style.setProperty('--anim-brillo-min', ca.brilloMin || 0.8);
      pv.style.setProperty('--anim-brillo-max', ca.brilloMax || 1.5);
    }
    if (ca.type === 'glitch') {
      pv.style.setProperty('--anim-glitch-x', (ca.glitchX || 4) + 'px');
      pv.style.setProperty('--anim-glitch-y', (ca.glitchY || 4) + 'px');
      pv.style.setProperty('--anim-glitch-rot', (ca.glitchRot || 0) + 'deg');
    }
    if (ca.type === 'neon-flicker') {
      pv.style.setProperty('--anim-neon-min', ca.neonMin || 0.4);
      pv.style.setProperty('--anim-neon-max', ca.neonMax || 1);
      pv.style.setProperty('--anim-neon-bright', ca.neonBright || 1);
    }
    if (ca.type === 'parpadeo') {
      pv.style.setProperty('--anim-parpadeo-min', ca.parpadeoMin || 0.3);
      pv.style.setProperty('--anim-parpadeo-max', ca.parpadeoMax || 1);
    }
    if (ca.type === 'rotar' || ca.type === 'wobble' || ca.type === 'balanceo' || ca.type === 'swing') {
      pv.style.setProperty('--anim-rotate-angle', (ca.rotateAngle || 5) + 'deg');
      pv.style.setProperty('--anim-rotate-scale', ca.rotateScale || 1);
    }
    if (ca.type === 'pulsar' || ca.type === 'respirar' || ca.type === 'latido') {
      pv.style.setProperty('--anim-scale-min', ca.scaleMin || 1);
      pv.style.setProperty('--anim-scale-max', ca.scaleMax || 1.06);
      pv.style.setProperty('--anim-scale-opacity', ca.scaleOpacity || 0.8);
    }
    if (ca.type === 'flotar' || ca.type === 'rebotar' || ca.type === 'drift' || ca.type.startsWith('deslizar-')) {
      pv.style.setProperty('--anim-translate-x', (ca.translateX || 0) + 'px');
      pv.style.setProperty('--anim-translate-y', (ca.translateY || 12) + 'px');
      pv.style.setProperty('--anim-translate-rot', (ca.translateRot || 0) + 'deg');
    }
    if (ca.type === 'sacudida' || ca.type === 'temblor' || ca.type === 'shake-x') {
      pv.style.setProperty('--anim-shake-x', (ca.shakeX || 4) + 'px');
      pv.style.setProperty('--anim-shake-y', (ca.shakeY || 4) + 'px');
    }
    // Secondary animation on ::before pseudo-element
    if (ca.type2) {
      pv.classList.add('anim2-' + ca.type2);
      pv.style.setProperty('--anim2', 'anim-' + ca.type2);
    }
  }

  // 4. Style
  const st = cs.style || {};
  if (st.accentColor) pv.style.setProperty('--card-tint', 'linear-gradient(135deg,' + st.accentColor + ',transparent)');
  if (st.shimmer) pv.classList.add('shimmer-on');
  if (st.borderRadius && inner) inner.style.borderRadius = st.borderRadius + 'px';
  if (st.opacity < 1) pv.style.opacity = st.opacity;

  // 5. Border
  const bd = cs.border || {};
  if (bd.enabled && inner) {
    inner.style.border = (bd.width || 1) + 'px ' + (bd.style || 'solid') + ' ' + (bd.color || '#dc2626');
  }

  // 6. Shadow
  const sh = cs.shadow || {};
  if (sh.enabled) {
    const rgba = _hexToRgba(sh.color || '#000000', sh.opacity != null ? sh.opacity : 0.35);
    const prefix = sh.inset ? 'inset ' : '';
    pv.style.boxShadow = prefix + (sh.x || 0) + 'px ' + (sh.y || 4) + 'px ' + (sh.blur || 12) + 'px ' + (sh.spread || 0) + 'px ' + rgba;
  }

  // 7. Transform
  const tf = cs.transform || {};
  const transforms = [];
  if (tf.rotate) transforms.push('rotate(' + tf.rotate + 'deg)');
  if (tf.scale && tf.scale !== 1) transforms.push('scale(' + tf.scale + ')');
  if (tf.skewX) transforms.push('skewX(' + tf.skewX + 'deg)');
  if (tf.skewY) transforms.push('skewY(' + tf.skewY + 'deg)');
  if (tf.x) transforms.push('translateX(' + tf.x + 'px)');
  if (tf.y) transforms.push('translateY(' + tf.y + 'px)');
  if (transforms.length) pv.style.transform = transforms.join(' ');

  // 8. Hover vars (for CSS to pick up)
  const hv = cs.hover || {};
  if (hv.scale && hv.scale !== 1) pv.style.setProperty('--hov-scale', hv.scale);
  if (hv.brightness && hv.brightness !== 1) pv.style.setProperty('--hov-bright', hv.brightness);
  if (hv.saturate && hv.saturate !== 1) pv.style.setProperty('--hov-sat', hv.saturate);
  if (hv.shadowBlur) pv.style.setProperty('--hov-shadow', hv.shadowBlur + 'px');
  if (hv.transition != null) pv.style.setProperty('--hov-trans', (hv.transition || 0.3) + 's');
  if (hv.borderColor) pv.style.setProperty('--hov-bdr', hv.borderColor);
  if (hv.glowIntensify) pv.classList.add('hov-glow-int');
  if (hv.blur) pv.style.setProperty('--hov-blur', hv.blur + 'px');
  if (hv.siblingsBlur) pv.style.setProperty('--hov-sib-blur', hv.siblingsBlur + 'px');
  if (hv.hueRotate) pv.style.setProperty('--hov-hue', hv.hueRotate + 'deg');
  if (hv.opacity != null && hv.opacity !== 1) pv.style.setProperty('--hov-opacity', hv.opacity);
  // Hover animation
  if (hv.enableAnim && hv.animType) {
    pv.classList.add('has-hover-anim');
    pv.style.setProperty('--hov-anim-name', 'anim-' + hv.animType);
    pv.style.setProperty('--hov-anim-dur', (hv.animDur || 1) + 's');
  }
  const hasHoverEffects = (hv.scale && hv.scale !== 1) || (hv.brightness && hv.brightness !== 1) || (hv.saturate && hv.saturate !== 1) || hv.shadowBlur || hv.borderColor || hv.glowIntensify || hv.blur || hv.siblingsBlur || hv.hueRotate || (hv.opacity != null && hv.opacity !== 1) || (hv.enableAnim && hv.animType);
  if (hasHoverEffects) pv.classList.add('has-hover-fx');
}

function _hexToRgba(hex, alpha) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  return 'rgba(' + r + ',' + g + ',' + b + ',' + (alpha != null ? alpha : 1) + ')';
}

// ═══ LIVE CARD PREVIEW ═══
function updateCardPreview() {
  const pv = g('beat-card-pv'); if (!pv) return;

  // Beat info
  const name = val('f-name') || 'Nombre del Beat';
  const bpm = val('f-bpm') || '140';
  const key = val('f-key') || 'Am';
  const genre = g('f-genre')?.value || 'Trap';
  const imgUrl = val('f-img');

  const nameEl = g('bcpv-name'); if (nameEl) nameEl.textContent = name;
  const bpmEl = g('bcpv-bpm'); if (bpmEl) bpmEl.textContent = bpm + ' BPM';
  const keyEl = g('bcpv-key'); if (keyEl) keyEl.textContent = key;
  const genreEl = g('bcpv-genre'); if (genreEl) genreEl.textContent = genre;

  // Image
  const imgWrap = g('bcpv-img');
  if (imgWrap) {
    if (imgUrl) imgWrap.innerHTML = '<img src="' + imgUrl + '" alt="">';
    else imgWrap.innerHTML = '<div class="bcpv-img-ph">♪</div>';
  }

  // Reset
  pv.className = 'bcpv';
  pv.style.cssText = '';
  if (inner = pv.querySelector('.bcpv-inner')) { inner.style.border = ''; inner.style.borderRadius = ''; }

  // Build and apply cardStyle
  const cs = _buildCardStyleFromInputs();
  _applyCardStyleToPreview(pv, cs);

  // Toggle per-animation sub-settings panel
  const animTypeVal = val('f-anim-type');
  _toggleAnimSubsettings(animTypeVal);

  // Update full card preview (in embedded container)
  if (typeof window.renderFullPvInCard === 'function') window.renderFullPvInCard();
}

// ═══ Render full beat card (store-style) in floating preview ═══
// ═══ Shared card HTML builder (DRY) ═══
window._buildCardHTML = function(cs, opts) {
  const { name, bpm, key, genre, imgUrl, tags, isExcl } = opts;
  const f = cs.filter || {};
  const gc = cs.glow || {};
  const ca = cs.anim || {};
  const csH = cs.hover || {};
  const csS = cs.style || {};
  const csSh = cs.shadow || {};
  const csTf = cs.transform || {};
  const csBd = cs.border || {};

  // Classes
  var animSuffix = '';
  if (ca.type === 'holograma' && ca.holoDir) {
    if (ca.holoDir === 'gradient') animSuffix = '-gradient';
    else if (ca.holoDir === 'pulse') animSuffix = '-pulse';
  }
  const animClass = ca.type ? 'anim-' + ca.type + animSuffix : '';
  const anim2Class = ca.type2 ? 'anim2-' + ca.type2 : '';
  const glowClass = gc.enabled ? 'glow-' + (gc.type || 'active') : '';
  const shimmerClass = csS.shimmer ? 'shimmer-on' : '';
  const hasHoverFx = ((csH.scale && csH.scale !== 1) || (csH.brightness && csH.brightness !== 1) || (csH.saturate && csH.saturate !== 1) || csH.shadowBlur || csH.borderColor || csH.glowIntensify || csH.blur || csH.siblingsBlur || csH.hueRotate || (csH.opacity != null && csH.opacity !== 1)) ? 'has-hover-fx' : '';
  const hovGlowInt = csH.glowIntensify ? 'hov-glow-int' : '';
  const hovAnimClass = (csH.enableAnim && csH.animType) ? 'has-hover-anim' : '';
  const allClasses = ['beat-card', glowClass, animClass, shimmerClass, anim2Class, hasHoverFx, hovGlowInt, hovAnimClass].filter(Boolean).join(' ');

  // Inline styles
  const s = [];
  const accentColor = csS.accentColor || '#dc2626';
  s.push('--card-tint:linear-gradient(135deg,' + accentColor + ',transparent)');
  // Propagate accent to button and glow vars
  const ach = accentColor.replace('#','');
  const ar = parseInt(ach.substring(0,2),16)||220, ag = parseInt(ach.substring(2,4),16)||38, ab = parseInt(ach.substring(4,6),16)||38;
  s.push('--accent:'+accentColor+';--btn-lic-clr:'+accentColor+';--btn-lic-bdr:rgba('+ar+','+ag+','+ab+',0.5);--btn-lic-bg:rgba('+ar+','+ag+','+ab+',0.1)');
  if (!gc.enabled) s.push('--glow-clr:'+accentColor);

  // Glow
  if (gc.enabled && gc.color) {
    const hex = gc.color.replace('#','');
    s.push('--glow-clr:'+gc.color+';--glow-r:'+(parseInt(hex.substring(0,2),16)||220)+';--glow-g:'+(parseInt(hex.substring(2,4),16)||38)+';--glow-b:'+(parseInt(hex.substring(4,6),16)||38)+';--glow-speed:'+(gc.speed||3)+'s');
    if (gc.intensity != null && gc.intensity !== 1) s.push('--glow-int:'+gc.intensity);
    if (gc.blur != null && gc.blur !== 20) s.push('--glow-blur:'+gc.blur+'px');
    if (gc.spread) s.push('--glow-spread:'+gc.spread+'px');
    if (gc.opacity != null && gc.opacity !== 1) s.push('--glow-op:'+gc.opacity);
  }

  // Animation vars
  if (ca.type) {
    s.push('--ad:'+(ca.dur||2)+'s;--adl:'+(ca.del||0)+'s');
    if (ca.easing && ca.easing !== 'ease-in-out') s.push('--aease:'+ca.easing);
    if (ca.direction && ca.direction !== 'normal') s.push('--adir:'+ca.direction);
    const animInt = (ca.intensity != null ? ca.intensity : 100) / 100;
    if (animInt !== 1) s.push('--anim-int:'+animInt);
    if (ca.type === 'holograma') {
      s.push('--anim-hue-start:'+(ca.hueStart||0)+'deg;--anim-hue-end:'+(ca.hueEnd||360)+'deg');
      s.push('--anim-holo-bright-min:'+(ca.holoBrightMin||0.9)+';--anim-holo-bright-max:'+(ca.holoBrightMax||1.4));
      s.push('--anim-holo-sat-min:'+(ca.holoSatMin||0.8)+';--anim-holo-sat-max:'+(ca.holoSatMax||2));
      if (ca.holoBlur) s.push('--anim-holo-blur:'+ca.holoBlur+'px');
      var holoDir = ca.holoDir || 'hue';
      var holoColors = ca.holoColors || ['#ff0080','#00ff80','#0080ff'];
      if (holoDir === 'gradient' && holoColors.length >= 2) {
        s.push('--holo-c0:'+holoColors[0]);
        s.push('--holo-c1:'+holoColors[1]);
        if (holoColors[2]) s.push('--holo-c2:'+holoColors[2]); else s.push('--holo-c2:'+holoColors[0]);
        if (holoColors[3]) s.push('--holo-c3:'+holoColors[3]); else s.push('--holo-c3:'+holoColors[1]);
      }
      if (holoDir === 'pulse' && holoColors.length >= 2) {
        s.push('--holo-c0:'+holoColors[0]);
        s.push('--holo-c1:'+holoColors[1]);
        if (holoColors[2]) s.push('--holo-c2:'+holoColors[2]); else s.push('--holo-c2:'+holoColors[0]);
      }
    }
    if (ca.type === 'brillo') s.push('--anim-brillo-min:'+(ca.brilloMin||0.8)+';--anim-brillo-max:'+(ca.brilloMax||1.5));
    if (ca.type === 'glitch') s.push('--anim-glitch-x:'+(ca.glitchX||4)+'px;--anim-glitch-y:'+(ca.glitchY||4)+'px;--anim-glitch-rot:'+(ca.glitchRot||0)+'deg');
    if (ca.type === 'pulsar' || ca.type === 'respirar' || ca.type === 'latido') s.push('--anim-scale-min:'+(ca.scaleMin||1)+';--anim-scale-max:'+(ca.scaleMax||1.06)+';--anim-scale-opacity:'+(ca.scaleOpacity||0.8));
    if (ca.type === 'flotar' || ca.type === 'rebotar' || ca.type === 'drift' || (ca.type && ca.type.startsWith('deslizar-'))) {
      s.push('--anim-translate-x:'+(ca.translateX||0)+'px;--anim-translate-y:'+(ca.translateY||12)+'px');
    }
    if (ca.type === 'neon-flicker') s.push('--anim-neon-min:'+(ca.neonMin||0.4)+';--anim-neon-max:'+(ca.neonMax||1)+';--anim-neon-bright:'+(ca.neonBright||1));
    if (ca.type === 'parpadeo') s.push('--anim-parpadeo-min:'+(ca.parpadeoMin||0.3)+';--anim-parpadeo-max:'+(ca.parpadeoMax||1));
    if (ca.type === 'rotar' || ca.type === 'wobble' || ca.type === 'balanceo' || ca.type === 'swing') s.push('--anim-rotate-angle:'+(ca.rotateAngle||5)+'deg;--anim-rotate-scale:'+(ca.rotateScale||1));
    if (ca.type === 'cambio-color') s.push('--anim-cs-hue-start:'+(ca.csHueStart||0)+'deg;--anim-cs-hue-end:'+(ca.csHueEnd||360)+'deg;--anim-cs-sat:'+(ca.csSat||1));
    if (ca.type === 'sacudida' || ca.type === 'temblor' || ca.type === 'shake-x') s.push('--anim-shake-x:'+(ca.shakeX||4)+'px;--anim-shake-y:'+(ca.shakeY||4)+'px');
    if (ca.iterations && ca.iterations !== 'infinite') s.push('--aiter:'+ca.iterations);
  }

  // Border
  if (csBd.enabled) s.push('border:'+(csBd.width||1)+'px '+(csBd.style||'solid')+' '+(csBd.color||'#dc2626'));

  // Filters
  const filters = [];
  if (f.brightness != null && f.brightness !== 1) filters.push('brightness('+f.brightness+')');
  if (f.contrast != null && f.contrast !== 1) filters.push('contrast('+f.contrast+')');
  if (f.saturate != null && f.saturate !== 1) filters.push('saturate('+f.saturate+')');
  if (f.grayscale) filters.push('grayscale('+f.grayscale+')');
  if (f.sepia) filters.push('sepia('+f.sepia+')');
  if (f.hueRotate) filters.push('hue-rotate('+f.hueRotate+'deg)');
  if (f.blur) filters.push('blur('+f.blur+'px)');
  if (f.invert) filters.push('invert('+f.invert+')');
  if (filters.length) s.push('filter:'+filters.join(' '));

  // Opacity
  if (csS.opacity != null && csS.opacity < 1) s.push('opacity:'+csS.opacity);

  // Shadow
  if (csSh.enabled) {
    const hex = (csSh.color||'#000000').replace('#','');
    s.push('box-shadow:'+(csSh.inset?'inset ':'')+(csSh.x||0)+'px '+(csSh.y!=null?csSh.y:4)+'px '+(csSh.blur!=null?csSh.blur:12)+'px '+(csSh.spread||0)+'px rgba('+(parseInt(hex.substring(0,2),16)||0)+','+(parseInt(hex.substring(2,4),16)||0)+','+(parseInt(hex.substring(4,6),16)||0)+','+(csSh.opacity!=null?csSh.opacity:0.35)+')');
  }

  // Transform
  const tf = [];
  if (csTf.rotate) tf.push('rotate('+csTf.rotate+'deg)');
  if (csTf.scale && csTf.scale !== 1) tf.push('scale('+csTf.scale+')');
  if (csTf.skewX) tf.push('skewX('+csTf.skewX+'deg)');
  if (csTf.skewY) tf.push('skewY('+csTf.skewY+'deg)');
  if (csTf.x) tf.push('translateX('+csTf.x+'px)');
  if (csTf.y) tf.push('translateY('+csTf.y+'px)');
  if (tf.length) s.push('transform:'+tf.join(' '));

  // Hover vars
  if (csH.scale && csH.scale !== 1) s.push('--hov-scale:'+csH.scale);
  if (csH.brightness && csH.brightness !== 1) s.push('--hov-bright:'+csH.brightness);
  if (csH.saturate && csH.saturate !== 1) s.push('--hov-sat:'+csH.saturate);
  if (csH.shadowBlur) s.push('--hov-shadow:'+csH.shadowBlur+'px');
  if (csH.transition != null) s.push('--hov-trans:'+csH.transition+'s');
  if (csH.borderColor) s.push('--hov-bdr:'+csH.borderColor);
  if (csH.blur) s.push('--hov-blur:'+csH.blur+'px');
  if (csH.siblingsBlur) s.push('--hov-sib-blur:'+csH.siblingsBlur+'px');
  if (csH.hueRotate) s.push('--hov-hue:'+csH.hueRotate+'deg');
  if (csH.opacity != null && csH.opacity !== 1) s.push('--hov-opacity:'+csH.opacity);
  if (csH.enableAnim && csH.animType) { s.push('--hov-anim-name:anim-'+csH.animType); s.push('--hov-anim-dur:'+(csH.animDur||1)+'s'); }
  if (csS.borderRadius) s.push('--card-radius:'+csS.borderRadius+'px');

  // Waveform bars
  const wfActive = gc.color || '#dc2626';
  const bars = Array.from({length: 20}, function(_, i) {
    const h = 4 + Math.random() * 16;
    return '<div class="wbar" style="height:'+h+'px;--wd:0.5s;animation-delay:'+((i*0.05).toFixed(2))+'s"></div>';
  }).join('');

  const tagsHtml = tags.map(function(t) { return '<span class="tag">'+t+'</span>'; }).join('');

  return '<div class="'+allClasses+'" style="'+s.join(';')+';cursor:default">'
    +'<div class="shimmer-overlay"></div>'
    +'<div class="beat-card-inner">'
    +'<div class="beat-img">'+(imgUrl ? '<img src="'+imgUrl+'" alt="" loading="lazy">' : '<div class="beat-img-ph">♪</div>')
    +'<div class="beat-wave-row">'+bars+'</div>'
    +'<div class="play-hint"><div class="play-circle"><svg width="16" height="16" viewBox="0 0 16 16" fill="white"><path d="M5 3l10 5-10 5V3z"/></svg></div></div>'
    +'</div>'
    +'<div class="beat-body">'
    +'<div class="beat-name">'+name+(isExcl ? '<span class="tag" style="border-color:rgba(185,28,28,.5);color:var(--accent);margin-left:6px">EXCL</span>' : '')+'</div>'
    +'<div class="beat-meta-row"><span>'+bpm+' BPM</span><span>'+key+'</span><span>'+genre+'</span></div>'
    +(tagsHtml ? '<div class="beat-tags-row">'+tagsHtml+'</div>' : '')
    +'<div class="beat-foot"><div><div class="price-from">desde</div><div class="price-main">$350 <span style="font-size:11px;color:var(--muted);font-weight:400">MXN</span><span class="price-usd">· $18 USD</span></div></div><div class="btn-lic">Ver licencias</div></div>'
    +'</div></div></div>';
};

// ═══ Render full beat card in floating preview ═══
window._renderFullPvCard = function() {
  var container = document.getElementById('float-pv-full-card');
  if (!container) return;
  var floatPv = document.getElementById('float-pv');
  if (!floatPv || floatPv.dataset.mode !== 'full') return;
  container.innerHTML = window._buildCardHTML(_buildCardStyleFromInputs(), {
    name: val('f-name') || 'Nombre del Beat',
    bpm: val('f-bpm') || '140',
    key: val('f-key') || 'Am',
    genre: g('f-genre') ? g('f-genre').value : 'Trap',
    imgUrl: val('f-img'),
    tags: (val('f-tags') || '').split(',').map(function(t) { return t.trim(); }).filter(Boolean),
    isExcl: checked('f-excl')
  });
};

// ═══ Render full card in embedded container (Extras tab) ═══
window.renderFullPvInCard = function() {
  var container = document.getElementById('pv-full-card-container');
  if (!container) return;
  container.innerHTML = window._buildCardHTML(_buildCardStyleFromInputs(), {
    name: val('f-name') || 'Nombre del Beat',
    bpm: val('f-bpm') || '140',
    key: val('f-key') || 'Am',
    genre: g('f-genre') ? g('f-genre').value : 'Trap',
    imgUrl: val('f-img'),
    tags: (val('f-tags') || '').split(',').map(function(t) { return t.trim(); }).filter(Boolean),
    isExcl: checked('f-excl')
  });
};

var pvDetached = false;
window.toggleDetachPv = function() {
  pvDetached = !pvDetached;
  const btn = document.getElementById('pv-detach-btn');
  const card = document.getElementById('pv-card-embed');
  if (pvDetached) {
    if (btn) btn.textContent = '📎 Desfijado';
    if (card) {
      card.style.position = 'fixed';
      card.style.zIndex = '9000';
      card.style.right = '20px';
      card.style.top = '60px';
      card.style.width = '420px';
      card.style.boxShadow = '0 20px 60px rgba(0,0,0,0.5)';
      card.style.left = 'auto';
      card.style.bottom = 'auto';
      card.style.marginTop = '0';
      card.style.resize = 'both';
      card.style.overflow = 'auto';
      card.style.minWidth = '280px';
      card.style.minHeight = '200px';
      makePvDraggable(card);
      addPvResizeHandles(card);
    }
  } else {
    if (btn) btn.textContent = '📌 Fijado';
    if (card) {
      card.style.position = '';
      card.style.zIndex = '';
      card.style.right = '';
      card.style.top = '';
      card.style.left = '';
      card.style.bottom = '';
      card.style.width = '';
      card.style.boxShadow = '';
      card.style.marginTop = '8px';
      card.style.cursor = '';
      card.style.resize = '';
      card.style.overflow = '';
      card.style.minWidth = '';
      card.style.minHeight = '';
      removePvResizeHandles(card);
    }
  }
};

function makePvDraggable(el) {
  const title = el.querySelector('.card-title');
  if (!title || title._draggable) return;
  title._draggable = true;
  title.style.cursor = 'grab';
  let dragging = false, sx, sy, oL, oT;
  title.addEventListener('pointerdown', function(e) {
    if (e.target.tagName === 'BUTTON' || e.target.closest('.pv-rz-handle')) return;
    dragging = true; sx = e.clientX; sy = e.clientY;
    oL = el.offsetLeft; oT = el.offsetTop;
    title.style.cursor = 'grabbing';
    el.style.left = oL + 'px'; el.style.top = oT + 'px'; el.style.right = 'auto';
    e.preventDefault();
  });
  window.addEventListener('pointermove', function(e) {
    if (!dragging) return;
    el.style.left = (oL + e.clientX - sx) + 'px';
    el.style.top = (oT + e.clientY - sy) + 'px';
  });
  var up = function() { if (dragging) { dragging = false; title.style.cursor = 'grab'; } };
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
}

// ═══ Resize handles for detached preview ═══
var _pvResizeHandles = [];
function addPvResizeHandles(card) {
  removePvResizeHandles(card);
  var handles = [
    { pos: 'right', css: 'top:0;right:-4px;width:8px;height:100%;cursor:col-resize' },
    { pos: 'bottom', css: 'bottom:-4px;left:0;width:100%;height:8px;cursor:row-resize' },
    { pos: 'corner-br', css: 'bottom:-4px;right:-4px;width:14px;height:14px;cursor:nwse-resize;border-radius:0 0 4px 0' }
  ];
  handles.forEach(function(h) {
    var el = document.createElement('div');
    el.className = 'pv-rz-handle';
    el.dataset.pos = h.pos;
    el.style.cssText = 'position:absolute;z-index:9001;background:rgba(220,38,38,0.3);opacity:0;transition:opacity .2s;' + h.css;
    card.appendChild(el);
    el.addEventListener('pointerdown', function(e) { startPvResize(card, el, h.pos, e); });
    _pvResizeHandles.push(el);
  });
  // Show on hover
  card.addEventListener('mouseenter', _pvShowHandles);
  card.addEventListener('mouseleave', _pvHideHandles);
}

function removePvResizeHandles(card) {
  _pvResizeHandles.forEach(function(h) { if (h.parentNode) h.parentNode.removeChild(h); });
  _pvResizeHandles = [];
  card.removeEventListener('mouseenter', _pvShowHandles);
  card.removeEventListener('mouseleave', _pvHideHandles);
}

function _pvShowHandles() { _pvResizeHandles.forEach(function(h) { h.style.opacity = '1'; }); }
function _pvHideHandles() { _pvResizeHandles.forEach(function(h) { h.style.opacity = '0'; }); }

function startPvResize(card, handle, pos, e) {
  e.preventDefault(); e.stopPropagation();
  var startX = e.clientX, startY = e.clientY;
  var startW = card.offsetWidth, startH = card.offsetHeight;
  handle.setPointerCapture(e.pointerId);
  document.body.style.userSelect = 'none';
  var onMove = function(e2) {
    if (pos === 'right' || pos === 'corner-br') card.style.width = Math.max(280, startW + (e2.clientX - startX)) + 'px';
    if (pos === 'bottom' || pos === 'corner-br') card.style.height = Math.max(200, startH + (e2.clientY - startY)) + 'px';
  };
  var onUp = function() {
    handle.releasePointerCapture(e.pointerId);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    document.body.style.userSelect = '';
  };
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
}

function syncBorderColor(source) {
  const picker = g('f-border-color');
  if (!picker) return;
  // border color has no hex text input, just the picker — but we could add one later
}

let _beatSearchQuery = '';
export function filterBeatList(q) { _beatSearchQuery = (q || '').trim().toLowerCase(); renderBeatList(); }

export function renderBeatList() {
  const list = g('beat-list');
  var beats = allBeats;
  if (_beatSearchQuery) beats = beats.filter(b => (b.name + ' ' + b.genre + ' ' + b.key + ' ' + (b.tags || []).join(' ')).toLowerCase().includes(_beatSearchQuery));
  if (!beats.length) { list.innerHTML = '<div style="color:var(--hi);padding:12px 0">' + (allBeats.length ? 'Sin resultados' : 'No hay beats') + '</div>'; const sc = g('beat-search-count'); if (sc) sc.textContent = allBeats.length ? '0 de ' + allBeats.length : ''; return; }
  const sc = g('beat-search-count'); if (sc) sc.textContent = _beatSearchQuery ? beats.length + ' de ' + allBeats.length : allBeats.length + ' beats';
  list.innerHTML = beats.map((b, i) => {
    const badges = []; if (b.featured) badges.push('TOP'); if (b.exclusive) badges.push('EXCL'); if (b.active === false) badges.push('OFF');
    const img = b.imageUrl ? '<img src="' + b.imageUrl + '">' : '♪';
    return '<div class="beat-row" draggable="true" data-id="' + b.id + '" ondragstart="dragStart(event)" ondragover="dragOver(event)" ondrop="dropBeat(event)" ondragend="dragEnd(event)" onclick="openEditor(\'' + b.id + '\')"><span class="drag-handle" onclick="event.stopPropagation()">⠿</span><div class="beat-row-thumb">' + img + '</div><div><div class="beat-row-name" data-editable ondblclick="event.stopPropagation();inlineEditName(this,\'' + b.id + '\')">' + b.name + (badges.length ? ' <span style="font-size:8px;color:var(--acc)">' + badges.join(' ') + '</span>' : '') + '</div><div class="beat-row-meta"><span data-editable ondblclick="event.stopPropagation();inlineEditBpm(this,\'' + b.id + '\')">' + b.bpm + ' BPM</span> · <span data-editable ondblclick="event.stopPropagation();inlineEditKey(this,\'' + b.id + '\')">' + b.key + '</span> · ' + b.genre + '</div></div><div class="beat-row-acts"><button class="btn" onclick="event.stopPropagation();openEditor(\'' + b.id + '\')" style="font-size:9px;padding:3px 8px">✎</button><button class="btn btn-del" onclick="event.stopPropagation();quickDel(\'' + b.id + '\')" style="font-size:9px;padding:3px 8px">✕</button></div></div>';
  }).join('');
}

// Drag & Drop
export function dragStart(e) { setDragBeatId(e.currentTarget.dataset.id); e.currentTarget.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; }
export function dragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; document.querySelectorAll('.beat-row.drag-over').forEach(r => r.classList.remove('drag-over')); e.currentTarget.classList.add('drag-over'); }
export function dropBeat(e) {
  e.preventDefault(); document.querySelectorAll('.beat-row.drag-over').forEach(r => r.classList.remove('drag-over'));
  const targetId = e.currentTarget.dataset.id; if (!_dragBeatId || _dragBeatId === targetId) return;
  const fromIdx = allBeats.findIndex(b => b.id === _dragBeatId); const toIdx = allBeats.findIndex(b => b.id === targetId);
  if (fromIdx < 0 || toIdx < 0) return;
  const moved = allBeats.splice(fromIdx, 1)[0]; allBeats.splice(toIdx, 0, moved);
  allBeats.forEach((b, i) => b.order = i); renderBeatList();
  const updates = {}; allBeats.forEach(b => { updates[b.id + '/order'] = b.order; });
  try { db.ref('beats').update(updates); showToast('Orden actualizado'); } catch (e) {}
}
export function dragEnd(e) { e.currentTarget.classList.remove('dragging'); setDragBeatId(null); }

// Editor
export function openEditor(id) {
  setEditId(id); showSection('add');
  // Attach live listeners on first open
  if (typeof window._attachLiveListeners === 'function') window._attachLiveListeners();
  g('editor-title').innerHTML = '<i class="fas fa-edit"></i> ' + (id ? 'Editar' : 'Nuevo') + ' beat';
  g('btn-del').style.display = id ? 'inline-flex' : 'none';
  const idField = g('f-id');
  if (idField) { idField.readOnly = !!id; idField.style.opacity = id ? '0.5' : '1'; idField.style.cursor = id ? 'not-allowed' : 'text'; }
  if (id) {
    const b = allBeats.find(x => x.id === id); if (!b) return;
    // Start live edit — snapshot for revert on cancel
    if (typeof window._startLiveEdit === 'function') window._startLiveEdit(b);
    setVal('f-id', b.id); setVal('f-name', b.name); setVal('f-genre', b.genre || 'Trap'); setVal('f-genre-c', b.genreCustom || '');
    setVal('f-bpm', b.bpm || ''); setVal('f-key', b.key || ''); setVal('f-desc', b.description || ''); setVal('f-tags', (b.tags || []).join(', '));
    setVal('f-img', b.imageUrl || ''); setVal('f-audio', b.audioUrl || ''); setVal('f-prev', b.previewUrl || '');
    setVal('f-spotify', b.spotify || ''); setVal('f-youtube', b.youtube || ''); setVal('f-soundcloud', b.soundcloud || '');
    setVal('f-date', b.date || ''); setVal('f-order', b.order || 0); setVal('f-plays', b.plays || 0);
    setChecked('f-feat', b.featured); setChecked('f-excl', b.exclusive); setChecked('f-active', b.active !== false); setChecked('f-avail', b.available !== false);
    // Load cardStyle (new mega schema) or fall back to legacy fields
    const cs = b.cardStyle || {};
    const csF = cs.filter || {};
    const csG = cs.glow || b.glowConfig || {};
    const csA = cs.anim || b.cardAnim || {};
    const csS = cs.style || {};
    const csB = cs.border || b.cardBorder || {};
    const csSh = cs.shadow || {};
    const csH = cs.hover || {};
    const csTf = cs.transform || {};

    // Filters
    setVal('f-cs-fb', csF.brightness != null ? csF.brightness : 1);
    setVal('f-cs-fc', csF.contrast != null ? csF.contrast : 1);
    setVal('f-cs-fs', csF.saturate != null ? csF.saturate : 1);
    setVal('f-cs-fg', csF.grayscale || 0);
    setVal('f-cs-fse', csF.sepia || 0);
    setVal('f-cs-fh', csF.hueRotate || 0);
    setVal('f-cs-fbl', csF.blur || 0);
    setVal('f-cs-fi', csF.invert || 0);

    // Glow
    setChecked('f-glow-on', csG.enabled || false);
    const glowTypeEl = g('f-glow-type'); if (glowTypeEl) glowTypeEl.value = csG.type || 'active';
    setVal('f-glow-color', csG.color || '#dc2626'); setVal('f-glow-color-h', csG.color || '#dc2626');
    setVal('f-glow-speed', csG.speed || 3);
    setVal('f-glow-int', csG.intensity != null ? csG.intensity : 1);
    setVal('f-glow-blur', csG.blur != null ? csG.blur : 20);
    setVal('f-glow-spread', csG.spread || 0);
    setVal('f-glow-op', csG.opacity != null ? csG.opacity : 1);
    setChecked('f-glow-hover', csG.hoverOnly || false);

    // Animation
    const animTypeEl = g('f-anim-type'); if (animTypeEl) animTypeEl.value = csA.type || '';
    const animType2El = g('f-anim-type2'); if (animType2El) animType2El.value = csA.type2 || '';
    setVal('f-anim-dur', csA.dur || 2);
    setVal('f-anim-del', csA.del || 0);
    const animEaseEl = g('f-anim-ease'); if (animEaseEl) animEaseEl.value = csA.easing || 'ease-in-out';
    const animDirEl = g('f-anim-dir'); if (animDirEl) animDirEl.value = csA.direction || 'normal';
    const animIterEl = g('f-anim-iter'); if (animIterEl) animIterEl.value = csA.iterations || 'infinite';

    // Style
    const accentClr = csS.accentColor || b.accentColor || '#dc2626';
    setVal('f-accent-color', accentClr); setVal('f-accent-color-h', accentClr);
    setChecked('f-shimmer', csS.shimmer != null ? csS.shimmer : (b.shimmer || false));
    setVal('f-cs-radius', csS.borderRadius || 0);
    setVal('f-cs-opacity', csS.opacity != null ? csS.opacity : 1);

    // Border
    setChecked('f-border-on', csB.enabled || false);
    setVal('f-border-color', csB.color || '#dc2626');
    setVal('f-border-width', csB.width || 1);
    const borderStyleEl = g('f-border-style'); if (borderStyleEl) borderStyleEl.value = csB.style || 'solid';

    // Shadow
    setChecked('f-shadow-on', csSh.enabled || false);
    setVal('f-shadow-color', csSh.color || '#000000');
    setVal('f-shadow-op', csSh.opacity != null ? csSh.opacity : 0.35);
    setVal('f-shadow-x', csSh.x || 0);
    setVal('f-shadow-y', csSh.y != null ? csSh.y : 4);
    setVal('f-shadow-blur', csSh.blur != null ? csSh.blur : 12);
    setVal('f-shadow-spread', csSh.spread || 0);
    setChecked('f-shadow-inset', csSh.inset || false);

    // Hover
    setVal('f-hov-scale', csH.scale || 1);
    setVal('f-hov-bright', csH.brightness != null ? csH.brightness : 1);
    setVal('f-hov-sat', csH.saturate != null ? csH.saturate : 1);
    setVal('f-hov-shadow', csH.shadowBlur || 0);
    setVal('f-hov-trans', csH.transition != null ? csH.transition : 0.3);
    setVal('f-hov-border', csH.borderColor || '#dc2626');
    setChecked('f-hov-glow', csH.glowIntensify || false);
    setVal('f-hov-blur', csH.blur || 0);
    setVal('f-hov-sib-blur', csH.siblingsBlur || 0);
    setVal('f-hov-hue', csH.hueRotate || 0);
    setVal('f-hov-opacity', csH.opacity != null ? csH.opacity : 1);
    setChecked('f-hov-anim-on', csH.enableAnim || false);
    const hovAnimTypeEl = g('f-hov-anim-type'); if (hovAnimTypeEl) hovAnimTypeEl.value = csH.animType || '';
    setVal('f-hov-anim-dur', csH.animDur || 1);

    // Transform
    setVal('f-tf-rotate', csTf.rotate || 0);
    setVal('f-tf-scale', csTf.scale || 1);
    setVal('f-tf-skewX', csTf.skewX || 0);
    setVal('f-tf-skewY', csTf.skewY || 0);
    setVal('f-tf-x', csTf.x || 0);
    setVal('f-tf-y', csTf.y || 0);

    // Sync all slider displays
    ['f-anim-dur','f-anim-del','f-border-width','f-glow-speed','f-glow-int','f-glow-blur','f-glow-spread','f-glow-op',
     'f-cs-fb','f-cs-fc','f-cs-fs','f-cs-fg','f-cs-fse','f-cs-fh','f-cs-fbl','f-cs-fi','f-cs-radius','f-cs-opacity',
     'f-shadow-op','f-shadow-x','f-shadow-y','f-shadow-blur','f-shadow-spread',
     'f-hov-scale','f-hov-bright','f-hov-sat','f-hov-shadow','f-hov-trans','f-hov-blur','f-hov-sib-blur','f-hov-hue','f-hov-opacity','f-hov-anim-dur',
     'f-tf-rotate','f-tf-scale','f-tf-skewX','f-tf-skewY','f-tf-x','f-tf-y'
    ].forEach(syncSliderDisplay);
    renderLicEditor(b.licenses || []);
  } else {
    ['f-id', 'f-name', 'f-genre-c', 'f-bpm', 'f-key', 'f-desc', 'f-tags', 'f-img', 'f-audio', 'f-prev', 'f-spotify', 'f-youtube', 'f-soundcloud', 'f-date'].forEach(id => setVal(id, ''));
    setVal('f-order', 0); setVal('f-plays', 0); setChecked('f-feat', false); setChecked('f-excl', false); setChecked('f-active', true); setChecked('f-avail', true);
    g('f-genre').value = 'Trap';
    // Reset all cardStyle fields to defaults
    const animTypeEl = g('f-anim-type'); if (animTypeEl) animTypeEl.value = '';
    const animType2El = g('f-anim-type2'); if (animType2El) animType2El.value = '';
    ['f-anim-dur','f-anim-del','f-glow-speed','f-glow-int','f-glow-blur','f-glow-spread','f-glow-op',
     'f-cs-fb','f-cs-fc','f-cs-fs','f-cs-fg','f-cs-fse','f-cs-fh','f-cs-fbl','f-cs-fi','f-cs-radius','f-cs-opacity',
     'f-shadow-op','f-shadow-x','f-shadow-y','f-shadow-blur','f-shadow-spread',
     'f-hov-scale','f-hov-bright','f-hov-sat','f-hov-shadow','f-hov-trans','f-hov-blur','f-hov-sib-blur','f-hov-hue','f-hov-opacity','f-hov-anim-dur',
     'f-tf-rotate','f-tf-scale','f-tf-skewX','f-tf-skewY','f-tf-x','f-tf-y'
    ].forEach(id => { const el = g(id); if (el) { el.value = el.defaultValue || (el.min != null ? el.min : 0); } });
    setChecked('f-glow-on', false); setChecked('f-glow-hover', false);
    setChecked('f-hov-glow', false); setChecked('f-hov-anim-on', false);
    const hovAnimTypeEl2 = g('f-hov-anim-type'); if (hovAnimTypeEl2) hovAnimTypeEl2.value = '';
    setVal('f-accent-color', '#dc2626'); setVal('f-accent-color-h', '#dc2626');
    setChecked('f-shimmer', false);
    setChecked('f-border-on', false); setVal('f-border-color', '#dc2626'); setVal('f-border-width', 1);
    setChecked('f-shadow-on', false); setVal('f-shadow-color', '#000000'); setChecked('f-shadow-inset', false);
    setChecked('f-hov-glow', false); setVal('f-hov-border', '#dc2626');
    renderLicEditor(defLics.length ? JSON.parse(JSON.stringify(defLics)) : []);
  }
  prevImg();
  updateCardPreview();
  // Render full card preview in container
  renderFullPvInCard();
  document.querySelectorAll('#sec-add .et').forEach((t, i) => t.classList.toggle('on', i === 0));
  document.querySelectorAll('#sec-add .etp').forEach((p, i) => p.classList.toggle('on', i === 0));
}

// License Editor
function renderLicEditor(lics) {
  g('le-editor').innerHTML = lics.map((l, i) => '<div class="lic-ed-row" data-idx="' + i + '"><div class="lic-ed-grid"><input type="text" placeholder="Nombre" value="' + (l.name || '') + '" onchange="upLic(' + i + ',\'name\',this.value)"><input type="number" placeholder="MXN" value="' + (l.priceMXN || '') + '" onchange="upLic(' + i + ',\'mxn\',this.value)"><input type="number" placeholder="USD" value="' + (l.priceUSD || '') + '" onchange="upLic(' + i + ',\'usd\',this.value)"></div><input type="text" placeholder="Descripción" value="' + (l.description || '') + '" style="font-size:10px" onchange="upLic(' + i + ',\'desc\',this.value)"><button class="btn btn-del" style="margin-top:4px;font-size:9px" onclick="rmLic(' + i + ')">✕</button></div>').join('');
}
export function upLic(idx, field, value) { collectLics(); autoSave(); }
export function addLicRow() { collectLics(); _edLics.push({ name: '', priceMXN: 0, priceUSD: 0, description: '' }); renderLicEditor(_edLics); }
export function rmLic(idx) { collectLics(); _edLics.splice(idx, 1); renderLicEditor(_edLics); }
function collectLics() { const lics = []; g('le-editor').querySelectorAll('.lic-ed-row').forEach(row => { const inp = row.querySelectorAll('input'); lics.push({ name: inp[0].value, priceMXN: parseFloat(inp[1].value) || 0, priceUSD: parseFloat(inp[2].value) || 0, description: inp[3].value }); }); setEdLics(lics); }
export function loadDefaultLics() { renderLicEditor(JSON.parse(JSON.stringify(defLics))); showToast('Licencias base cargadas'); }

// Upload helpers
function prevImg() { const url = val('f-img'); g('img-prev').innerHTML = url ? '<img src="' + url + '" style="max-width:160px;max-height:100px;border-radius:6px;border:1px solid var(--b)">' : ''; }
export function uploadBeatImg(input) {
  const file = input.files[0]; if (!file) return;
  if (!R2_ENABLED) { showToast('R2 Worker no configurado.', true); input.value = ''; return; }
  const beatId = editId || ('beat_' + Date.now());
  const btn = input.parentElement.querySelector('button'); btn.disabled = true; btn.textContent = '⏳'; showSaving(true);
  uploadToR2(file, 'beats/' + beatId + '/cover-' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_'))
    .then(r => { setVal('f-img', r.url); prevImg(); showSaving(false); btn.disabled = false; btn.textContent = '📤'; showToast('Imagen subida ✓'); })
    .catch(err => { showSaving(false); btn.disabled = false; btn.textContent = '📤'; showToast('Error: ' + err.message, true); });
  input.value = '';
}
export function uploadBeatAudio(input) {
  const file = input.files[0]; if (!file) return;
  if (!R2_ENABLED) { showToast('R2 Worker no configurado.', true); input.value = ''; return; }
  const beatId = editId || ('beat_' + Date.now());
  const btn = input.parentElement.querySelector('button'); btn.disabled = true; btn.textContent = '⏳'; showSaving(true);
  const ext = file.name.split('.').pop().toLowerCase(); const folder = ext === 'wav' ? 'wavs' : 'audio';
  uploadToR2(file, 'beats/' + beatId + '/' + folder + '/' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_'))
    .then(r => { setVal('f-audio', r.url); showSaving(false); btn.disabled = false; btn.textContent = '📤'; showToast('Audio subido ✓'); })
    .catch(err => { showSaving(false); btn.disabled = false; btn.textContent = '📤'; showToast('Error: ' + err.message, true); });
  input.value = '';
}
export function uploadBeatPreview(input) {
  const file = input.files[0]; if (!file) return;
  if (!R2_ENABLED) { showToast('R2 Worker no configurado.', true); input.value = ''; return; }
  const beatId = editId || ('beat_' + Date.now());
  const btn = input.parentElement.querySelector('button'); btn.disabled = true; btn.textContent = '⏳'; showSaving(true);
  uploadToR2(file, 'beats/' + beatId + '/previews/' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_'))
    .then(r => { setVal('f-prev', r.url); updateMP(); showSaving(false); btn.disabled = false; btn.textContent = '📤'; showToast('Preview subido ✓'); })
    .catch(err => { showSaving(false); btn.disabled = false; btn.textContent = '📤'; showToast('Error: ' + err.message, true); });
  input.value = '';
}

// Save/Delete
export function saveBeat() {
  const id = val('f-id').trim(), name = val('f-name').trim();
  if (!id || !name) { showToast('ID y nombre requeridos', true); return; }
  collectLics();
  const cardStyle = _buildCardStyleFromInputs();
  // Legacy fields for backwards compat
  const animType = val('f-anim-type');
  const beat = { name, genre: val('f-genre'), genreCustom: val('f-genre-c'), bpm: parseInt(val('f-bpm')) || 0, key: val('f-key'), description: val('f-desc'), tags: val('f-tags').split(',').map(t => t.trim()).filter(Boolean), imageUrl: val('f-img'), audioUrl: val('f-audio'), previewUrl: val('f-prev'), spotify: val('f-spotify'), youtube: val('f-youtube'), soundcloud: val('f-soundcloud'), date: val('f-date'), order: parseInt(val('f-order')) || 0, plays: parseInt(val('f-plays')) || 0, featured: checked('f-feat'), exclusive: checked('f-excl'), active: checked('f-active'), available: checked('f-avail'), licenses: _edLics.filter(l => l.name),
    // Legacy fields (backwards compat)
    glowConfig: cardStyle.glow, cardAnim: cardStyle.anim, accentColor: cardStyle.style.accentColor, shimmer: cardStyle.style.shimmer, cardBorder: cardStyle.border,
    // New mega schema
    cardStyle: cardStyle
  };
  showSaving(true); db.ref('beats/' + id).set(beat).then(() => { showSaving(false); if (typeof window._clearLiveEdit === 'function') window._clearLiveEdit(); showToast('Beat guardado ✓'); showSection('beats'); }).catch(err => { showSaving(false); showToast('Error: ' + err.message, true); });
}
export async function deleteBeat() {
  var delId = editId || val('f-id');
  if (!delId) { showToast('No hay beat seleccionado', true); return; }
  if (!await confirmInline('¿Eliminar beat "' + delId + '"?')) return;
  showSaving(true); db.ref('beats/' + delId).remove().then(() => { showSaving(false); showToast('Eliminado ✓'); setEditId(null); showSection('beats'); }).catch(err => { showSaving(false); showToast('Error: ' + (err.message || err.code), true); });
}
export async function quickDel(id) {
  if (!await confirmInline('¿Eliminar este beat?')) return;
  showSaving(true); db.ref('beats/' + id).remove().then(() => { showSaving(false); showToast('Eliminado ✓'); }).catch(err => { showSaving(false); showToast('Error: ' + (err.message || err.code), true); });
}

// Inline Edit
function _inlineEdit(el, id, field, parse) {
  if (el.querySelector('input')) return;
  const beat = allBeats.find(b => b.id === id); if (!beat) return;
  const orig = field === 'bpm' ? String(beat.bpm) : field === 'key' ? beat.key : beat.name;
  const inp = document.createElement('input'); inp.className = 'beat-inline-edit'; inp.value = orig;
  inp.style.maxWidth = field === 'name' ? '200px' : '80px';
  el.innerHTML = ''; el.appendChild(inp); inp.focus(); inp.select();
  function save() {
    const val2 = parse ? parse(inp.value) : inp.value.trim();
    if (val2 !== null && val2 !== orig) {
      beat[field] = val2;
      showSaving(true); db.ref('beats/' + id + '/' + field).set(val2).then(() => { showSaving(false); showToast('Actualizado ✓'); }).catch(err => { showSaving(false); showToast('Error', true); });
    }
    renderBeatList();
  }
  inp.addEventListener('blur', save);
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); save(); } if (e.key === 'Escape') { renderBeatList(); } });
}
export function inlineEditName(el, id) { _inlineEdit(el, id, 'name', v => { const s = v.trim(); return s ? s : null; }); }
export function inlineEditBpm(el, id) { _inlineEdit(el, id, 'bpm', v => { const n = parseInt(v); return (n > 0 && n < 400) ? n : null; }); }
export function inlineEditKey(el, id) { _inlineEdit(el, id, 'key', v => { const s = v.trim().toUpperCase(); return s ? s : null; }); }

// Batch
export function openBatchImg() { g('batch-img-overlay').classList.add('open'); setupBatchDrop(); }
export function closeBatchImg() { g('batch-img-overlay').classList.remove('open'); }
function setupBatchDrop() {
  const drop = g('batch-img-drop');
  drop.onclick = () => document.getElementById('batch-img-input').click();
  drop.ondragover = e => { e.preventDefault(); drop.classList.add('over'); };
  drop.ondragleave = () => drop.classList.remove('over');
  drop.ondrop = e => { e.preventDefault(); drop.classList.remove('over'); handleBatchImgFiles(e.dataTransfer.files); };
}
export function handleBatchImgFiles(files) {
  const arr = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, 20 - _batchImgQueue.length);
  arr.forEach(f => {
    const name = f.name.replace(/\.[^.]+$/, '');
    const match = allBeats.find(b => b.name.toLowerCase() === name.toLowerCase());
    _batchImgQueue.push({ file: f, name, beatId: match ? match.id : '', preview: null });
    const reader = new FileReader(); const idx = _batchImgQueue.length - 1;
    reader.onload = e => { _batchImgQueue[idx].preview = e.target.result; renderBatchImgList(); };
    reader.readAsDataURL(f);
  });
  renderBatchImgList();
}
function renderBatchImgList() {
  const el = g('batch-img-list'); const saveBtn = g('batch-img-save');
  if (!_batchImgQueue.length) { el.innerHTML = ''; saveBtn.style.display = 'none'; return; }
  saveBtn.style.display = '';
  el.innerHTML = _batchImgQueue.map((item, i) => {
    const img = item.preview ? '<img src="' + item.preview + '">' : '';
    const options = allBeats.map(b => '<option value="' + b.id + '"' + (item.beatId === b.id ? ' selected' : '') + '>' + b.name + '</option>').join('');
    return '<div class="batch-img-item">' + img + '<span class="batch-img-item-name">' + item.name + '</span><select onchange="_batchImgQueue[' + i + '].beatId=this.value"><option value="">— Asignar beat —</option>' + options + '</select><button class="remove-img" onclick="_batchImgQueue.splice(' + i + ',1);renderBatchImgList()">✕</button></div>';
  }).join('');
}
export function clearBatchImgQueue() { setBatchImgQueue([]); renderBatchImgList(); g('batch-img-input').value = ''; }
export function saveBatchImages() {
  const items = _batchImgQueue.filter(i => i.beatId);
  if (!items.length) { showToast('Asigna al menos una imagen', true); return; }
  showSaving(true); let done = 0; const total = items.length;
  items.forEach(item => {
    const dbPath = 'beats/' + item.beatId + '/imageUrl';
    if (R2_ENABLED && item.file) {
      uploadToR2(item.file, 'beats/' + item.beatId + '/cover-' + item.file.name.replace(/[^a-zA-Z0-9._-]/g, '_'))
        .then(r => db.ref(dbPath).set(r.url))
        .then(() => { done++; if (done >= total) { showSaving(false); showToast(total + ' subidas a R2 ✓'); clearBatchImgQueue(); closeBatchImg(); } })
        .catch(() => { done++; if (done >= total) { showSaving(false); showToast('Error', true); } });
    } else {
      db.ref(dbPath).set(item.preview).then(() => { done++; if (done >= total) { showSaving(false); showToast(total + ' asignadas ✓'); clearBatchImgQueue(); closeBatchImg(); } }).catch(() => { done++; if (done >= total) { showSaving(false); showToast('Error', true); } });
    }
  });
}
export async function batchAddBeats() {
  var count = await promptInline('¿Cuántos beats? (máx 20)', '3'); if (!count) return;
  count = parseInt(count); if (isNaN(count) || count < 1 || count > 20) { showToast('Máximo 20', true); return; }
  var base = allBeats.length; showSaving(true); var promises = [];
  for (var i = 0; i < count; i++) {
    var id = 'beat_' + Date.now() + '_' + i;
    promises.push(db.ref('beats/' + id).set({ name: 'Beat ' + (base + i + 1), genre: 'Trap', bpm: 140, key: 'Am', active: false, order: base + i, tags: [], description: '', imageUrl: '', audioUrl: '', previewUrl: '', spotify: '', youtube: '', soundcloud: '', date: new Date().toISOString().split('T')[0], available: true, exclusive: false, featured: false, plays: 0, licenses: [{ name: 'Basic', description: 'MP3 sin tag', priceMXN: 350, priceUSD: 18 }, { name: 'Premium', description: 'WAV sin tag', priceMXN: 1500, priceUSD: 75 }, { name: 'Exclusive', description: 'Stems + exclusividad', priceMXN: 8000, priceUSD: 400 }] }));
  }
  Promise.all(promises).then(() => { showSaving(false); showToast(count + ' beats creados'); }).catch(() => { showSaving(false); showToast('Error', true); });
}

// MP3 Player
let mpAudio2 = null;
export function toggleMP() {
  const url = val('f-prev') || val('f-audio'); if (!url) return;
  if (mpAudio2 && !mpAudio2.paused) { mpAudio2.pause(); return; }
  if (mpAudio2) mpAudio2.pause();
  mpAudio2 = new Audio(url);
  mpAudio2.addEventListener('timeupdate', () => { if (!mpAudio2.duration) return; const pct = (mpAudio2.currentTime / mpAudio2.duration) * 100; g('mp-fill').style.width = pct + '%'; g('mp-t').textContent = fmt(mpAudio2.currentTime) + ' / ' + fmt(mpAudio2.duration); });
  mpAudio2.play().catch(() => {});
}
export function seekMP(e) { if (!mpAudio2 || !mpAudio2.duration) return; const r = e.currentTarget.getBoundingClientRect(); mpAudio2.currentTime = ((e.clientX - r.left) / r.width) * mpAudio2.duration; }

Object.assign(window, {
  filterBeatList, renderBeatList, dragStart, dragOver, dropBeat, dragEnd,
  openEditor, upLic, addLicRow, rmLic, loadDefaultLics,
  uploadBeatImg, uploadBeatAudio, uploadBeatPreview,
  saveBeat, deleteBeat, quickDel,
  inlineEditName, inlineEditBpm, inlineEditKey,
  openBatchImg, closeBatchImg, handleBatchImgFiles, clearBatchImgQueue, saveBatchImages,
  batchAddBeats, toggleMP, seekMP,
  syncAccentColor, updateCardPreview, applyPreset, applyHoverPreset, resetCardStyle, renderPresets
});

// Initialize preset grids on load
renderPresets();
renderHoverPresets();

// ═══ REAL-TIME CARD PREVIEW ═══
// Debounced re-render of store card preview when beat fields change
(function() {
  var _pvTimer = null;
  var _liveListenersAttached = false;

  function _debouncedPv() {
    clearTimeout(_pvTimer);
    _pvTimer = setTimeout(function() {
      if (typeof window.renderFullPvInCard === 'function') window.renderFullPvInCard();
      _sendLiveUpdate();
    }, 250);
  }

  function _attachLiveListeners() {
    if (_liveListenersAttached) return;
    _liveListenersAttached = true;
    // Event delegation: catch ALL input/change events in the editor section
    // This covers every field (name, CSS filters, glow, anim, shadow, hover, transform…)
    var editor = document.getElementById('sec-add');
    if (!editor) { console.warn('[LiveEdit] #sec-add not found'); return; }
    editor.addEventListener('input', function(e) {
      if (e.target.matches('input, select, textarea')) _debouncedPv();
    });
    editor.addEventListener('change', function(e) {
      if (e.target.matches('input, select, textarea')) _debouncedPv();
    });
    console.log('[LiveEdit] delegation listeners attached');
  }

  // Attach when editor opens (section might not exist at page load)
  window._attachLiveListeners = _attachLiveListeners;

  // ═══ LIVE EDIT: localStorage → store iframe ═══
  var PM_ORIGIN = window.location.origin || '*';
  window._liveEditId = null;
  window._liveEditOriginal = null;

  function _sendLiveUpdate() {
    if (!window._liveEditId) return;
    var data = {
      name: val('f-name') || '',
      genre: val('f-genre') || 'Trap',
      genreCustom: val('f-genre-c') || '',
      bpm: parseInt(val('f-bpm')) || 0,
      key: val('f-key') || '',
      description: val('f-desc') || '',
      tags: (val('f-tags') || '').split(',').map(function(t) { return t.trim(); }).filter(Boolean),
      imageUrl: val('f-img') || '',
      audioUrl: val('f-audio') || '',
      previewUrl: val('f-prev') || '',
      featured: checked('f-feat'),
      exclusive: checked('f-excl'),
      active: checked('f-active'),
      available: checked('f-avail'),
      cardStyle: _buildCardStyleFromInputs()
    };
    var payload = { beatId: window._liveEditId, data: data, ts: Date.now() };
    // localStorage fallback (cross-tab)
    localStorage.setItem('dace-live-edit', JSON.stringify(payload));
    // postMessage to iframe (same-tab admin preview)
    postToFrame({ type: 'beat-update', beatId: payload.beatId, data: payload.data });
    // Firebase — reaches the live store at dacewav.store (separate window)
    var _db = window._db || (typeof db !== 'undefined' ? db : null);
    console.log('[LiveEdit] _db:', !!_db, 'id:', window._liveEditId);
    if (_db) {
      _db.ref('liveEdits/' + window._liveEditId).set(data)
        .then(function() { console.log('[LiveEdit] Firebase write OK'); })
        .catch(function(err) { console.error('[LiveEdit] Firebase write FAIL:', err); });
    } else {
      console.warn('[LiveEdit] No DB reference available');
    }
    console.log('[LiveEdit] sent:', window._liveEditId);
  }

  window._sendBeatRevert = function() {
    if (!window._liveEditId || !window._liveEditOriginal) return;
    var revertData = { beatId: window._liveEditId, original: window._liveEditOriginal, ts: Date.now() };
    // localStorage fallback (cross-tab)
    localStorage.setItem('dace-live-edit-revert', JSON.stringify(revertData));
    localStorage.removeItem('dace-live-edit');
    // postMessage to iframe (same-tab admin preview)
    postToFrame({ type: 'beat-revert', beatId: revertData.beatId, original: revertData.original });
    // Firebase cleanup
    var _db = window._db || (typeof db !== 'undefined' ? db : null);
    if (_db) {
      _db.ref('liveEdits/' + window._liveEditId).remove().catch(function(){});
    }
    console.log('[LiveEdit] revert sent:', window._liveEditId);
    window._liveEditId = null;
    window._liveEditOriginal = null;
  };

  window._startLiveEdit = function(beat) {
    window._liveEditId = beat.id;
    window._liveEditOriginal = JSON.parse(JSON.stringify(beat));
  };

  window._clearLiveEdit = function() {
    localStorage.removeItem('dace-live-edit');
    localStorage.removeItem('dace-live-edit-revert');
    // Firebase cleanup
    if (window._liveEditId) {
      var _db = window._db || (typeof db !== 'undefined' ? db : null);
      if (_db) _db.ref('liveEdits/' + window._liveEditId).remove().catch(function(){});
    }
    window._liveEditId = null;
    window._liveEditOriginal = null;
  };
})();
