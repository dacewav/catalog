// ═══ DACEWAV Admin — Card Style Engine ═══
// SINGLE SOURCE OF TRUTH for all cardStyle operations.
// Shared between: beat editor (f-), global style (g-), preview, and store.
//
// This module replaces: duplicate code in beat-card-style.js, card-global.js, card-style-ui.js
// Functions: build, populate, apply to preview, check default, slider formats

// Pure logic module — no admin/store dependencies, only DOM access via getElementById
const g = (id) => document.getElementById(id);

// ═══ DEFAULT CARD STYLE ═══
export const DEFAULT_CARD_STYLE = Object.freeze({
  filter: Object.freeze({ brightness: 1, contrast: 1, saturate: 1, grayscale: 0, sepia: 0, hueRotate: 0, blur: 0, blurType: '', invert: 0, opacity: 1, dropShadowX: 0, dropShadowY: 0, dropShadowBlur: 0, dropShadowColor: '#000000', dropShadowOpacity: 0 }),
  glow: Object.freeze({ enabled: false, type: 'active', color: '#dc2626', speed: 3, intensity: 1, blur: 20, spread: 0, opacity: 1, hoverOnly: false }),
  anim: null,
  style: Object.freeze({ accentColor: '', shimmer: false, shimmerSpeed: 3, shimmerOp: 0.04, borderRadius: 0, opacity: 1 }),
  border: Object.freeze({ enabled: false, color: '#dc2626', width: 1, style: 'solid' }),
  shadow: Object.freeze({ enabled: false, color: '#000000', opacity: 0.35, x: 0, y: 4, blur: 12, spread: 0, inset: false }),
  hover: Object.freeze({ scale: 1, brightness: 1, saturate: 1, shadowBlur: 0, transition: 0.3, borderColor: '', glowIntensify: false, blur: 0, siblingsBlur: 0, hueRotate: 0, opacity: 1, enableAnim: false, animType: '', animDur: 1 }),
  transform: Object.freeze({ rotate: 0, scale: 1, skewX: 0, skewY: 0, x: 0, y: 0 })
});

// ═══ HELPERS ═══
function v(id) { const el = g(id); return el ? el.value : ''; }
function n(id) { return parseFloat(v(id)) || 0; }
function c(id) { const el = g(id); return el ? el.checked : false; }
function s(id, val) { const el = g(id); if (el) el.value = val; }
function ck(id, val) { const el = g(id); if (el) el.checked = !!val; }

function hexToRgba(hex, alpha) {
  hex = (hex || '#000000').replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const gv = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  return `rgba(${r},${gv},${b},${alpha != null ? alpha : 1})`;
}

// ═══ BUILD cardStyle from DOM inputs ═══
// p = prefix ('f-' for beat editor, 'g-' for global)
// includeAnimSub = true collects animation sub-settings (beat editor has them, global doesn't)
export function buildCardStyle(p, includeAnimSub) {
  const animType = v(p + 'anim-type');
  const anim = animType ? {
    type: animType,
    type2: v(p + 'anim-type2') || '',
    dur: n(p + 'anim-dur') || 2,
    del: n(p + 'anim-del') || 0,
    easing: v(p + 'anim-ease') || 'ease-in-out',
    direction: v(p + 'anim-dir') || 'normal',
    iterations: v(p + 'anim-iter') || 'infinite',
    intensity: parseInt(v(p + 'anim-int')) || 100,
  } : null;

  // Add sub-settings if present in DOM (beat editor panels)
  if (anim && includeAnimSub) {
    anim.hueStart = parseInt(v(p + 'anim-hue-start')) || 0;
    anim.hueEnd = parseInt(v(p + 'anim-hue-end')) || 360;
    // Holo colors from color picker list
    const holoList = document.getElementById('holo-colors-list');
    if (holoList) {
      anim.holoColors = Array.from(holoList.querySelectorAll('input[type=color]')).map(i => i.value);
      if (!anim.holoColors.length) anim.holoColors = ['#ff0080', '#00ff80', '#0080ff'];
    }
    anim.holoBrightMin = parseFloat(v(p + 'anim-holo-bright-min')) || 0.9;
    anim.holoBrightMax = parseFloat(v(p + 'anim-holo-bright-max')) || 1.4;
    anim.holoSatMin = parseFloat(v(p + 'anim-holo-sat-min')) || 0.8;
    anim.holoSatMax = parseFloat(v(p + 'anim-holo-sat-max')) || 2;
    anim.holoGlow = parseInt(v(p + 'anim-holo-glow')) || 0;
    anim.holoBlur = parseFloat(v(p + 'anim-holo-blur')) || 0;
    anim.holoDir = v(p + 'anim-holo-dir') || 'hue';
    anim.brilloMin = parseFloat(v(p + 'anim-brillo-min')) || 0.8;
    anim.brilloMax = parseFloat(v(p + 'anim-brillo-max')) || 1.5;
    anim.glitchX = parseInt(v(p + 'anim-glitch-x')) || 4;
    anim.glitchY = parseInt(v(p + 'anim-glitch-y')) || 4;
    anim.glitchRot = parseFloat(v(p + 'anim-glitch-rot')) || 0;
    anim.glitchChromatic = c(p + 'anim-glitch-chromatic');
    anim.translateX = parseInt(v(p + 'anim-translate-x')) || 0;
    anim.translateY = parseInt(v(p + 'anim-translate-y')) || 12;
    anim.translateRot = parseFloat(v(p + 'anim-translate-rot')) || 0;
    anim.neonMin = parseFloat(v(p + 'anim-neon-min')) || 0.4;
    anim.neonMax = parseFloat(v(p + 'anim-neon-max')) || 1;
    anim.neonBright = parseFloat(v(p + 'anim-neon-bright')) || 1;
    anim.parpadeoMin = parseFloat(v(p + 'anim-parpadeo-min')) || 0.3;
    anim.parpadeoMax = parseFloat(v(p + 'anim-parpadeo-max')) || 1;
    anim.rotateAngle = parseInt(v(p + 'anim-rotate-angle')) || 5;
    anim.rotateScale = parseFloat(v(p + 'anim-rotate-scale')) || 1;
    anim.scaleMin = parseFloat(v(p + 'anim-scale-min')) || 1;
    anim.scaleMax = parseFloat(v(p + 'anim-scale-max')) || 1.06;
    anim.scaleOpacity = parseFloat(v(p + 'anim-scale-opacity')) || 0.8;
    anim.shakeX = parseInt(v(p + 'anim-shake-x')) || 4;
    anim.shakeY = parseInt(v(p + 'anim-shake-y')) || 4;
    anim.csHueStart = parseInt(v(p + 'anim-cs-hue-start')) || 0;
    anim.csHueEnd = parseInt(v(p + 'anim-cs-hue-end')) || 360;
    anim.csSat = parseFloat(v(p + 'anim-cs-sat')) || 1;
  }

  return {
    filter: {
      brightness: n(p + 'cs-fb') || 1, contrast: n(p + 'cs-fc') || 1, saturate: n(p + 'cs-fs') || 1,
      grayscale: n(p + 'cs-fg'), sepia: n(p + 'cs-fse'), hueRotate: parseInt(v(p + 'cs-fh')) || 0,
      blur: n(p + 'cs-fbl'), blurType: v(p + 'cs-fbl-type') || '', invert: n(p + 'cs-fi'),
      opacity: n(p + 'cs-fo') || 1,
      dropShadowX: parseInt(v(p + 'cs-ds-x')) || 0, dropShadowY: parseInt(v(p + 'cs-ds-y')) || 0,
      dropShadowBlur: parseInt(v(p + 'cs-ds-bl')) || 0, dropShadowColor: v(p + 'cs-ds-clr') || '#000000',
      dropShadowOpacity: n(p + 'cs-ds-op') || 0
    },
    glow: {
      enabled: c(p + 'glow-on'), type: v(p + 'glow-type') || 'active',
      color: v(p + 'glow-color') || '#dc2626', speed: n(p + 'glow-speed') || 3,
      intensity: n(p + 'glow-int') || 1, blur: parseInt(v(p + 'glow-blur')) || 20,
      spread: parseInt(v(p + 'glow-spread')) || 0, opacity: n(p + 'glow-op') || 1,
      hoverOnly: c(p + 'glow-hover')
    },
    anim,
    style: {
      accentColor: v(p + 'accent-color') || '', shimmer: c(p + 'shimmer'),
      shimmerSpeed: parseFloat(v(p + 'shimmer-speed')) || 3,
      shimmerOp: parseFloat(v(p + 'shimmer-op')) || 0.04,
      borderRadius: parseInt(v(p + 'cs-radius')) || 0, opacity: n(p + 'cs-opacity') || 1
    },
    border: {
      enabled: c(p + 'border-on'), color: v(p + 'border-color') || '#dc2626',
      width: n(p + 'border-width') || 1, style: v(p + 'border-style') || 'solid'
    },
    shadow: {
      enabled: c(p + 'shadow-on'), color: v(p + 'shadow-color') || '#000000',
      opacity: n(p + 'shadow-op') || 0.35, x: parseInt(v(p + 'shadow-x')) || 0,
      y: parseInt(v(p + 'shadow-y')) || 4, blur: parseInt(v(p + 'shadow-blur')) || 12,
      spread: parseInt(v(p + 'shadow-spread')) || 0, inset: c(p + 'shadow-inset')
    },
    hover: {
      scale: n(p + 'hov-scale') || 1, brightness: n(p + 'hov-bright') || 1, saturate: n(p + 'hov-sat') || 1,
      shadowBlur: parseInt(v(p + 'hov-shadow')) || 0, transition: n(p + 'hov-trans') || 0.3,
      borderColor: v(p + 'hov-border') || '', glowIntensify: c(p + 'hov-glow'),
      blur: n(p + 'hov-blur'), siblingsBlur: n(p + 'hov-sib-blur'),
      hueRotate: parseInt(v(p + 'hov-hue')) || 0, opacity: n(p + 'hov-opacity') || 1,
      enableAnim: c(p + 'hov-anim-on'), animType: v(p + 'hov-anim-type') || '',
      animDur: parseFloat(v(p + 'hov-anim-dur')) || 1
    },
    transform: {
      rotate: parseFloat(v(p + 'tf-rotate')) || 0, scale: n(p + 'tf-scale') || 1,
      skewX: parseFloat(v(p + 'tf-skewX')) || 0, skewY: parseFloat(v(p + 'tf-skewY')) || 0,
      x: parseInt(v(p + 'tf-x')) || 0, y: parseInt(v(p + 'tf-y')) || 0
    }
  };
}

// ═══ POPULATE DOM inputs from cardStyle ═══
export function populateCardStyle(cs, p) {
  if (!cs) return;

  const f = cs.filter || {};
  s(p + 'cs-fb', f.brightness != null ? f.brightness : 1);
  s(p + 'cs-fc', f.contrast != null ? f.contrast : 1);
  s(p + 'cs-fs', f.saturate != null ? f.saturate : 1);
  s(p + 'cs-fo', f.opacity != null ? f.opacity : 1);
  s(p + 'cs-fg', f.grayscale || 0); s(p + 'cs-fse', f.sepia || 0);
  s(p + 'cs-fh', f.hueRotate || 0); s(p + 'cs-fbl', f.blur || 0); s(p + 'cs-fi', f.invert || 0);
  s(p + 'cs-fbl-type', f.blurType || '');
  s(p + 'cs-ds-x', f.dropShadowX || 0); s(p + 'cs-ds-y', f.dropShadowY || 0);
  s(p + 'cs-ds-bl', f.dropShadowBlur || 0);
  s(p + 'cs-ds-clr', f.dropShadowColor || '#000000'); s(p + 'cs-ds-clr-h', f.dropShadowColor || '#000000');
  s(p + 'cs-ds-op', f.dropShadowOpacity || 0);

  const gc = cs.glow || {};
  ck(p + 'glow-on', gc.enabled);
  s(p + 'glow-type', gc.type || 'active');
  s(p + 'glow-color', gc.color || '#dc2626'); s(p + 'glow-color-h', gc.color || '#dc2626');
  s(p + 'glow-speed', gc.speed || 3); s(p + 'glow-int', gc.intensity != null ? gc.intensity : 1);
  s(p + 'glow-blur', gc.blur != null ? gc.blur : 20); s(p + 'glow-spread', gc.spread || 0);
  s(p + 'glow-op', gc.opacity != null ? gc.opacity : 1); ck(p + 'glow-hover', gc.hoverOnly);

  const a = cs.anim || {};
  s(p + 'anim-type', a.type || ''); s(p + 'anim-dur', a.dur || 2); s(p + 'anim-del', a.del || 0);
  s(p + 'anim-ease', a.easing || 'ease-in-out'); s(p + 'anim-dir', a.direction || 'normal');
  s(p + 'anim-iter', a.iterations || 'infinite'); s(p + 'anim-int', a.intensity != null ? a.intensity : 100);

  // Animation sub-settings (gracefully skipped if elements don't exist)
  s(p + 'anim-type2', a.type2 || '');
  if (a.hueStart != null) s(p + 'anim-hue-start', a.hueStart);
  if (a.hueEnd != null) s(p + 'anim-hue-end', a.hueEnd);
  if (a.holoBrightMin != null) s(p + 'anim-holo-bright-min', a.holoBrightMin);
  if (a.holoBrightMax != null) s(p + 'anim-holo-bright-max', a.holoBrightMax);
  if (a.holoSatMin != null) s(p + 'anim-holo-sat-min', a.holoSatMin);
  if (a.holoSatMax != null) s(p + 'anim-holo-sat-max', a.holoSatMax);
  if (a.holoGlow != null) s(p + 'anim-holo-glow', a.holoGlow);
  if (a.holoBlur != null) s(p + 'anim-holo-blur', a.holoBlur);
  s(p + 'anim-holo-dir', a.holoDir || 'hue');
  if (a.brilloMin != null) s(p + 'anim-brillo-min', a.brilloMin);
  if (a.brilloMax != null) s(p + 'anim-brillo-max', a.brilloMax);
  if (a.glitchX != null) s(p + 'anim-glitch-x', a.glitchX);
  if (a.glitchY != null) s(p + 'anim-glitch-y', a.glitchY);
  if (a.glitchRot != null) s(p + 'anim-glitch-rot', a.glitchRot);
  ck(p + 'anim-glitch-chromatic', a.glitchChromatic);
  if (a.translateX != null) s(p + 'anim-translate-x', a.translateX);
  if (a.translateY != null) s(p + 'anim-translate-y', a.translateY);
  if (a.translateRot != null) s(p + 'anim-translate-rot', a.translateRot);
  if (a.neonMin != null) s(p + 'anim-neon-min', a.neonMin);
  if (a.neonMax != null) s(p + 'anim-neon-max', a.neonMax);
  if (a.neonBright != null) s(p + 'anim-neon-bright', a.neonBright);
  if (a.parpadeoMin != null) s(p + 'anim-parpadeo-min', a.parpadeoMin);
  if (a.parpadeoMax != null) s(p + 'anim-parpadeo-max', a.parpadeoMax);
  if (a.rotateAngle != null) s(p + 'anim-rotate-angle', a.rotateAngle);
  if (a.rotateScale != null) s(p + 'anim-rotate-scale', a.rotateScale);
  if (a.scaleMin != null) s(p + 'anim-scale-min', a.scaleMin);
  if (a.scaleMax != null) s(p + 'anim-scale-max', a.scaleMax);
  if (a.scaleOpacity != null) s(p + 'anim-scale-opacity', a.scaleOpacity);
  if (a.shakeX != null) s(p + 'anim-shake-x', a.shakeX);
  if (a.shakeY != null) s(p + 'anim-shake-y', a.shakeY);
  if (a.csHueStart != null) s(p + 'anim-cs-hue-start', a.csHueStart);
  if (a.csHueEnd != null) s(p + 'anim-cs-hue-end', a.csHueEnd);
  if (a.csSat != null) s(p + 'anim-cs-sat', a.csSat);

  const st = cs.style || {};
  s(p + 'accent-color', st.accentColor || ''); s(p + 'accent-color-h', st.accentColor || '');
  ck(p + 'shimmer', st.shimmer); s(p + 'cs-radius', st.borderRadius || 0);
  s(p + 'cs-opacity', st.opacity != null ? st.opacity : 1);
  s(p + 'shimmer-speed', st.shimmerSpeed || 3);
  s(p + 'shimmer-op', st.shimmerOp || 0.04);

  const bd = cs.border || {};
  ck(p + 'border-on', bd.enabled); s(p + 'border-color', bd.color || '#dc2626');
  s(p + 'border-width', bd.width || 1); s(p + 'border-style', bd.style || 'solid');

  const sh = cs.shadow || {};
  ck(p + 'shadow-on', sh.enabled); s(p + 'shadow-color', sh.color || '#000000');
  s(p + 'shadow-op', sh.opacity != null ? sh.opacity : 0.35);
  s(p + 'shadow-x', sh.x || 0); s(p + 'shadow-y', sh.y != null ? sh.y : 4);
  s(p + 'shadow-blur', sh.blur != null ? sh.blur : 12); s(p + 'shadow-spread', sh.spread || 0);
  ck(p + 'shadow-inset', sh.inset);

  const hv = cs.hover || {};
  s(p + 'hov-scale', hv.scale || 1); s(p + 'hov-bright', hv.brightness != null ? hv.brightness : 1);
  s(p + 'hov-sat', hv.saturate != null ? hv.saturate : 1); s(p + 'hov-shadow', hv.shadowBlur || 0);
  s(p + 'hov-trans', hv.transition != null ? hv.transition : 0.3);
  s(p + 'hov-border', hv.borderColor || ''); ck(p + 'hov-glow', hv.glowIntensify);
  s(p + 'hov-blur', hv.blur || 0); s(p + 'hov-sib-blur', hv.siblingsBlur || 0);
  s(p + 'hov-hue', hv.hueRotate || 0); s(p + 'hov-opacity', hv.opacity != null ? hv.opacity : 1);
  ck(p + 'hov-anim-on', hv.enableAnim);
  s(p + 'hov-anim-type', hv.animType || '');
  s(p + 'hov-anim-dur', hv.animDur || 1);

  const tf = cs.transform || {};
  s(p + 'tf-rotate', tf.rotate || 0); s(p + 'tf-scale', tf.scale || 1);
  s(p + 'tf-skewX', tf.skewX || 0); s(p + 'tf-skewY', tf.skewY || 0);
  s(p + 'tf-x', tf.x || 0); s(p + 'tf-y', tf.y || 0);
}

// ═══ RESET inputs to defaults ═══
export function resetCardStyle(p) {
  populateCardStyle(DEFAULT_CARD_STYLE, p);
  s(p + 'anim-type', '');
}

// ═══ CHECK if cardStyle is default/empty ═══
export function isCardStyleDefault(cs) {
  if (!cs || typeof cs !== 'object') return true;

  // Quick check: any enabled feature → not default
  if (cs.glow?.enabled) return false;
  if (cs.border?.enabled) return false;
  if (cs.shadow?.enabled) return false;
  if (cs.anim?.type) return false;
  if (cs.style?.shimmer) return false;
  if (cs.style?.accentColor) return false;

  // Check numeric deviations
  const f = cs.filter || {};
  if (f.brightness !== 1 || f.contrast !== 1 || f.saturate !== 1 || f.grayscale || f.sepia || f.hueRotate || f.blur || f.invert || f.opacity !== 1) return false;
  if (f.dropShadowOpacity || f.dropShadowBlur) return false;

  const hv = cs.hover || {};
  if (hv.scale !== 1 || hv.brightness !== 1 || hv.saturate !== 1 || hv.shadowBlur || hv.blur || hv.siblingsBlur || hv.hueRotate || hv.opacity !== 1) return false;
  if (hv.enableAnim) return false;

  const tf = cs.transform || {};
  if (tf.rotate || tf.scale !== 1 || tf.skewX || tf.skewY || tf.x || tf.y) return false;

  const st = cs.style || {};
  if (st.borderRadius || st.opacity !== 1) return false;

  return true;
}

// ═══ APPLY cardStyle to preview element (admin preview panel) ═══
// Unified function — replaces _applyCardStyleToPreview AND _applyStyleToPv
export function applyStyleToPreview(pv, cs) {
  if (!pv || !cs) return;

  const inner = pv.querySelector('.bcpv-inner');

  // Reset
  pv.className = 'bcpv';
  pv.style.cssText = '';
  if (inner) { inner.style.border = ''; inner.style.borderRadius = ''; }

  // ── Filters ──
  const f = cs.filter || {};
  const filters = [];
  if (f.brightness != null && f.brightness !== 1) filters.push(`brightness(${f.brightness})`);
  if (f.contrast != null && f.contrast !== 1) filters.push(`contrast(${f.contrast})`);
  if (f.saturate != null && f.saturate !== 1) filters.push(`saturate(${f.saturate})`);
  if (f.grayscale) filters.push(`grayscale(${f.grayscale})`);
  if (f.sepia) filters.push(`sepia(${f.sepia})`);
  if (f.hueRotate) filters.push(`hue-rotate(${f.hueRotate}deg)`);
  if (f.invert) filters.push(`invert(${f.invert})`);
  if (f.dropShadowOpacity) {
    const dsClr = f.dropShadowColor || '#000000';
    const hex = dsClr.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const gv = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    filters.push(`drop-shadow(${f.dropShadowX || 0}px ${f.dropShadowY || 0}px ${f.dropShadowBlur || 0}px rgba(${r},${gv},${b},${f.dropShadowOpacity}))`);
  }
  if (filters.length) pv.style.filter = filters.join(' ');

  // Blur FX (CSS class-based, same as store)
  if (f.blurType && f.blur) {
    pv.classList.add('blur-fx-' + f.blurType);
    const blurInt = Math.min(f.blur / 30, 1);
    pv.style.setProperty('--blur-int', blurInt.toFixed(2));
    if (f.blurType === 'aura') {
      const acHex = (cs.style?.accentColor || '#dc2626').replace('#', '');
      pv.style.setProperty('--blur-aura-clr', '#' + acHex);
    }
  }

  // Opacity from filter (separate from style.opacity)
  if (f.opacity != null && f.opacity < 1) pv.style.filter = (pv.style.filter || '') + ` opacity(${f.opacity})`;

  // ── Accent color ──
  const accentColor = cs.style?.accentColor;
  if (accentColor) {
    const hex = accentColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 220;
    const gv = parseInt(hex.substring(2, 4), 16) || 38;
    const b = parseInt(hex.substring(4, 6), 16) || 38;
    pv.style.setProperty('--accent', accentColor);
    pv.style.setProperty('--card-tint', `linear-gradient(135deg,${accentColor},transparent)`);
    pv.style.setProperty('--btn-lic-clr', accentColor);
    pv.style.setProperty('--btn-lic-bdr', `rgba(${r},${gv},${b},0.5)`);
    pv.style.setProperty('--btn-lic-bg', `rgba(${r},${gv},${b},0.1)`);
  }

  // ── Glow ──
  const gc = cs.glow || {};
  if (gc.enabled) {
    pv.classList.add('glow-' + (gc.type || 'active'));
    const hex = (gc.color || '#dc2626').replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 220;
    const gv = parseInt(hex.substring(2, 4), 16) || 38;
    const b = parseInt(hex.substring(4, 6), 16) || 38;
    pv.style.setProperty('--glow-clr', gc.color || '#dc2626');
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

  // ── Animation ──
  const ca = cs.anim;
  if (ca && ca.type) {
    let suffix = '';
    if (ca.type === 'holograma' && ca.holoDir) {
      if (ca.holoDir === 'gradient') suffix = '-gradient';
      else if (ca.holoDir === 'pulse') suffix = '-pulse';
    }
    pv.classList.add('anim-' + ca.type + suffix);
    const intVal = (ca.intensity != null ? ca.intensity : 100) / 100;
    const effectiveDur = intVal !== 1 ? (ca.dur || 2) / intVal : (ca.dur || 2);
    pv.style.setProperty('--ad', effectiveDur + 's');
    pv.style.setProperty('--adl', (ca.del || 0) + 's');
    if (intVal !== 1) pv.style.setProperty('--anim-int', intVal);
    pv.style.setProperty('--aease', ca.easing || 'ease-in-out');
    pv.style.setProperty('--adir', ca.direction || 'normal');
    pv.style.setProperty('--aiter', ca.iterations || 'infinite');

    // Per-type sub-settings
    if (ca.type === 'holograma') {
      pv.style.setProperty('--anim-hue-start', (ca.hueStart || 0) + 'deg');
      pv.style.setProperty('--anim-hue-end', (ca.hueEnd || 360) + 'deg');
      pv.style.setProperty('--anim-holo-bright-min', ca.holoBrightMin || 0.9);
      pv.style.setProperty('--anim-holo-bright-max', ca.holoBrightMax || 1.4);
      pv.style.setProperty('--anim-holo-sat-min', ca.holoSatMin || 0.8);
      pv.style.setProperty('--anim-holo-sat-max', ca.holoSatMax || 2);
      pv.style.setProperty('--anim-holo-glow', (ca.holoGlow || 0) + 'px');
      pv.style.setProperty('--anim-holo-blur', (ca.holoBlur || 0) + 'px');
      let hc = ca.holoColors;
      if (hc && typeof hc === 'object' && !Array.isArray(hc)) hc = Object.values(hc);
      if (hc && hc.length >= 2) {
        pv.style.setProperty('--holo-c0', hc[0]);
        pv.style.setProperty('--holo-c1', hc[1]);
        pv.style.setProperty('--holo-c2', hc[2] || hc[0]);
        pv.style.setProperty('--holo-c3', hc[3] || hc[1]);
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
    if (ca.type === 'flotar' || ca.type === 'rebotar' || ca.type === 'drift' || (ca.type && ca.type.startsWith('deslizar-'))) {
      pv.style.setProperty('--anim-translate-x', (ca.translateX || 0) + 'px');
      pv.style.setProperty('--anim-translate-y', (ca.translateY || 12) + 'px');
      pv.style.setProperty('--anim-translate-rot', (ca.translateRot || 0) + 'deg');
    }
    if (ca.type === 'sacudida' || ca.type === 'temblor' || ca.type === 'shake-x') {
      pv.style.setProperty('--anim-shake-x', (ca.shakeX || 4) + 'px');
      pv.style.setProperty('--anim-shake-y', (ca.shakeY || 4) + 'px');
    }
    if (ca.type2) {
      pv.classList.add('anim2-' + ca.type2);
    }
  }

  // ── Style ──
  const st = cs.style || {};
  if (st.shimmer) {
    pv.classList.add('shimmer-on');
    pv.style.setProperty('--shim-speed', (st.shimmerSpeed || 3) + 's');
    pv.style.setProperty('--shim-op', st.shimmerOp || 0.04);
  }
  if (st.borderRadius && inner) inner.style.borderRadius = st.borderRadius + 'px';
  if (st.borderRadius) pv.style.setProperty('--card-radius', st.borderRadius + 'px');
  if (st.opacity != null && st.opacity < 1) pv.style.opacity = st.opacity;

  // ── Border ──
  const bd = cs.border || {};
  if (bd.enabled && inner) {
    inner.style.border = `${bd.width || 1}px ${bd.style || 'solid'} ${bd.color || '#dc2626'}`;
  }

  // ── Shadow ──
  const sh = cs.shadow || {};
  if (sh.enabled) {
    const rgba = hexToRgba(sh.color || '#000000', sh.opacity != null ? sh.opacity : 0.35);
    const prefix = sh.inset ? 'inset ' : '';
    pv.style.boxShadow = `${prefix}${sh.x || 0}px ${sh.y != null ? sh.y : 4}px ${sh.blur != null ? sh.blur : 12}px ${sh.spread || 0}px ${rgba}`;
  }

  // ── Transform ──
  const tf = cs.transform || {};
  const tfParts = [];
  if (tf.rotate) tfParts.push(`rotate(${tf.rotate}deg)`);
  if (tf.scale && tf.scale !== 1) tfParts.push(`scale(${tf.scale})`);
  if (tf.skewX) tfParts.push(`skewX(${tf.skewX}deg)`);
  if (tf.skewY) tfParts.push(`skewY(${tf.skewY}deg)`);
  if (tf.x) tfParts.push(`translateX(${tf.x}px)`);
  if (tf.y) tfParts.push(`translateY(${tf.y}px)`);
  if (tfParts.length) pv.style.transform = tfParts.join(' ');

  // ── Hover vars ──
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
  if (hv.enableAnim && hv.animType) {
    pv.classList.add('has-hover-anim');
    pv.style.setProperty('--hov-anim-name', 'anim-' + hv.animType);
    pv.style.setProperty('--hov-anim-dur', (hv.animDur || 1) + 's');
  }
  const hasHover = (hv.scale && hv.scale !== 1) || (hv.brightness && hv.brightness !== 1) || (hv.saturate && hv.saturate !== 1) || hv.shadowBlur || hv.borderColor || hv.glowIntensify || hv.blur || hv.siblingsBlur || hv.hueRotate || (hv.opacity != null && hv.opacity !== 1) || (hv.enableAnim && hv.animType);
  if (hasHover) pv.classList.add('has-hover-fx');
}

// ═══ SLIDER DISPLAY FORMAT MAP ═══
// Single source of truth for how each slider displays its value.
// Used by syncSliderDisplay and syncSliderDisplays.
const SLIDER_FMT = {
  'dur': v => v.toFixed(1) + 's', 'del': v => v.toFixed(1) + 's',
  'speed': v => v.toFixed(1) + 's',
  'trans': v => v.toFixed(2) + 's',
  'int': v => v + '%',
  'hue': v => v + '°', 'fh': v => v + '°',
  'rotate': v => v.toFixed(1) + '°', 'skew': v => v.toFixed(1) + '°',
  'blur': v => v.toFixed(1) + 'px', 'bl': v => v + 'px',
  'spread': v => v + 'px', 'shadow': v => v + 'px',
  'x': v => v + 'px', 'y': v => v + 'px',
  'width': v => v.toFixed(1) + 'px', 'radius': v => v + 'px',
  'scale': v => v.toFixed(2) + 'x',
  'glow-int': v => v.toFixed(1) + 'x',
  'op': v => v.toFixed(2), 'opacity': v => v.toFixed(2),
  'bright': v => v.toFixed(2), 'sat': v => v.toFixed(2),
  'fb': v => v.toFixed(2), 'fc': v => v.toFixed(2), 'fs': v => v.toFixed(2),
  'fg': v => v.toFixed(2), 'fse': v => v.toFixed(2), 'fi': v => v.toFixed(2),
  'shimmer': v => v.toFixed(2),
  'brillo': v => v.toFixed(2), 'neon': v => v.toFixed(2),
  'parpadeo': v => v.toFixed(2),
  'holo-sat': v => v.toFixed(1),
  'cs-sat': v => v.toFixed(1),
};

export function syncSliderDisplay(inputId) {
  const el = g(inputId);
  if (!el) return;
  const sib = el.nextElementSibling;
  if (!sib) return;
  const val = parseFloat(el.value);
  // Find matching format by checking if id contains any key
  const shortId = inputId.replace(/^(f-|g-)/, '');
  for (const [key, fmt] of Object.entries(SLIDER_FMT)) {
    if (shortId === key || shortId.endsWith('-' + key) || shortId.includes(key)) {
      sib.textContent = fmt(val);
      return;
    }
  }
  sib.textContent = val.toFixed(2);
}

export function syncSliderDisplays(prefix) {
  const ids = [
    'cs-fb','cs-fc','cs-fs','cs-fg','cs-fse','cs-fi','cs-fo','cs-radius','cs-opacity',
    'cs-fh','cs-fbl',
    'cs-ds-x','cs-ds-y','cs-ds-bl','cs-ds-op',
    'glow-speed','glow-int','glow-blur','glow-spread','glow-op',
    'anim-dur','anim-del','anim-int',
    'border-width','shadow-op','shadow-x','shadow-y','shadow-blur','shadow-spread',
    'hov-scale','hov-bright','hov-sat','hov-shadow','hov-trans','hov-blur','hov-sib-blur','hov-hue','hov-opacity','hov-anim-dur',
    'tf-rotate','tf-scale','tf-skewX','tf-skewY','tf-x','tf-y',
    'shimmer-speed','shimmer-op',
    'anim-hue-start','anim-hue-end',
    'anim-holo-bright-min','anim-holo-bright-max','anim-holo-sat-min','anim-holo-sat-max','anim-holo-glow','anim-holo-blur',
    'anim-brillo-min','anim-brillo-max',
    'anim-glitch-x','anim-glitch-y','anim-glitch-rot',
    'anim-translate-x','anim-translate-y','anim-translate-rot',
    'anim-neon-min','anim-neon-max','anim-neon-bright',
    'anim-parpadeo-min','anim-parpadeo-max',
    'anim-rotate-angle','anim-rotate-scale',
    'anim-scale-min','anim-scale-max','anim-scale-opacity',
    'anim-shake-x','anim-shake-y',
    'anim-cs-hue-start','anim-cs-hue-end','anim-cs-sat',
  ];
  ids.forEach(id => syncSliderDisplay(prefix + id));
}

// ═══ MERGE global + beat cardStyle (store uses this) ═══
export function mergeCardStyles(globalCs, beatCs, beatHasCustom) {
  if (!globalCs) return beatCs || null;
  if (!beatCs || beatHasCustom === false) return globalCs;
  const merged = {};
  const allKeys = new Set([...Object.keys(globalCs), ...Object.keys(beatCs)]);
  allKeys.forEach(k => {
    const gv = globalCs[k];
    const bv = beatCs[k];
    // Beat value takes priority if it's not null/undefined
    if (bv != null && typeof bv === 'object' && !Array.isArray(bv) && typeof gv === 'object' && gv) {
      merged[k] = { ...gv, ...bv };
    } else if (bv != null) {
      merged[k] = bv;
    } else if (gv != null) {
      merged[k] = gv;
    }
  });
  return merged;
}

// ═══ VALIDATE glow type ═══
const VALID_GLOW_TYPES = ['active', 'rgb', 'pulse', 'breathe', 'neon'];
export function safeGlowType(type) {
  return VALID_GLOW_TYPES.includes(type) ? type : 'active';
}
