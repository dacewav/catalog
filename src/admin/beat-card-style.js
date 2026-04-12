// ═══ DACEWAV Admin — Beat Card Style ═══
// Card style building, preview application, slider sync, color pickers,
// animation sub-settings, holograma helpers, and live preview update.

import { db, allBeats, siteSettings } from './state.js';
import { g, val, setVal, checked, setChecked, showToast } from './helpers.js';

// ═══ Slider display sync ═══
// Uses exact-format map matching the HTML oninput attributes for each slider.
export const SD_FMT = {
  'f-anim-dur': v => v.toFixed(1)+'s', 'f-anim-del': v => v.toFixed(1)+'s',
  'f-glow-speed': v => v.toFixed(1)+'s', 'f-shimmer-speed': v => v.toFixed(1)+'s',
  'f-hov-anim-dur': v => v.toFixed(1)+'s',
  'f-hov-trans': v => v.toFixed(2)+'s',
  'f-anim-int': v => v+'%',
  'f-cs-fh': v => v+'°',
  'f-anim-hue-start': v => v+'°', 'f-anim-hue-end': v => v+'°',
  'f-anim-glitch-rot': v => v.toFixed(1)+'°', 'f-anim-translate-rot': v => v.toFixed(1)+'°',
  'f-anim-rotate-angle': v => v+'°',
  'f-anim-cs-hue-start': v => v+'°', 'f-anim-cs-hue-end': v => v+'°',
  'f-hov-hue': v => v+'°',
  'f-tf-rotate': v => v.toFixed(1)+'°', 'f-tf-skewX': v => v.toFixed(1)+'°', 'f-tf-skewY': v => v.toFixed(1)+'°',
  'f-cs-fbl': v => v.toFixed(1)+'px',
  'f-cs-ds-x': v => v+'px', 'f-cs-ds-y': v => v+'px',
  'f-cs-ds-bl': v => v+'px',
  'f-glow-blur': v => v+'px', 'f-glow-spread': v => v+'px',
  'f-cs-radius': v => v+'px',
  'f-shadow-x': v => v+'px', 'f-shadow-y': v => v+'px',
  'f-shadow-blur': v => v+'px', 'f-shadow-spread': v => v+'px',
  'f-border-width': v => v.toFixed(1)+'px',
  'f-hov-shadow': v => v+'px', 'f-hov-blur': v => v.toFixed(1)+'px', 'f-hov-sib-blur': v => v.toFixed(1)+'px',
  'f-tf-x': v => v+'px', 'f-tf-y': v => v+'px',
  'f-anim-glitch-x': v => v+'px', 'f-anim-glitch-y': v => v+'px',
  'f-anim-translate-x': v => v+'px', 'f-anim-translate-y': v => v+'px',
  'f-anim-shake-x': v => v+'px', 'f-anim-shake-y': v => v+'px',
  'f-anim-holo-glow': v => v+'px', 'f-anim-holo-blur': v => v.toFixed(1)+'px',
  'f-glow-int': v => v.toFixed(1)+'x',
  'f-hov-scale': v => v.toFixed(2)+'x',
  'f-tf-scale': v => v.toFixed(2)+'x',
  'f-anim-rotate-scale': v => v.toFixed(2)+'x',
  'f-anim-scale-min': v => v.toFixed(2)+'x', 'f-anim-scale-max': v => v.toFixed(2)+'x',
  'f-shimmer-op': v => v.toFixed(2),
  'f-cs-opacity': v => v.toFixed(2), 'f-shadow-op': v => v.toFixed(2),
  'f-glow-op': v => v.toFixed(2), 'f-hov-opacity': v => v.toFixed(2),
  'f-cs-fo': v => v.toFixed(2), 'f-cs-ds-op': v => v.toFixed(2),
  'f-anim-brillo-min': v => v.toFixed(2), 'f-anim-brillo-max': v => v.toFixed(2),
  'f-anim-neon-min': v => v.toFixed(2), 'f-anim-neon-max': v => v.toFixed(2), 'f-anim-neon-bright': v => v.toFixed(2),
  'f-anim-parpadeo-min': v => v.toFixed(2), 'f-anim-parpadeo-max': v => v.toFixed(2),
  'f-anim-scale-opacity': v => v.toFixed(2),
  'f-anim-holo-bright-min': v => v.toFixed(2), 'f-anim-holo-bright-max': v => v.toFixed(2),
  'f-anim-holo-sat-min': v => v.toFixed(1), 'f-anim-holo-sat-max': v => v.toFixed(1),
  'f-anim-cs-sat': v => v.toFixed(1),
  'f-cs-fb': v => v.toFixed(2), 'f-cs-fc': v => v.toFixed(2), 'f-cs-fs': v => v.toFixed(2),
  'f-cs-fg': v => v.toFixed(2), 'f-cs-fse': v => v.toFixed(2), 'f-cs-fi': v => v.toFixed(2),
  'f-hov-bright': v => v.toFixed(2), 'f-hov-sat': v => v.toFixed(2),
};

export function syncSliderDisplay(inputId) {
  const el = g(inputId); if (!el) return;
  const sib = el.nextElementSibling; if (!sib) return;
  const v = parseFloat(el.value);
  if (SD_FMT[inputId]) { sib.textContent = SD_FMT[inputId](v); return; }
  sib.textContent = v.toFixed(2);
}

// ═══ Color picker ↔ hex input sync ═══
export function syncAccentColor(source) {
  const picker = g('f-accent-color');
  const hex = g('f-accent-color-h');
  if (!picker || !hex) return;
  if (source === 'picker') hex.value = picker.value;
  else picker.value = hex.value;
}

export function syncBeatGlowColor(source) {
  const picker = g('f-glow-color');
  const hex = g('f-glow-color-h');
  if (!picker || !hex) return;
  if (source === 'picker') hex.value = picker.value;
  else picker.value = hex.value;
}

export function syncBorderColor(source) {
  const picker = g('f-border-color');
  if (!picker) return;
}

// ═══ Toggle per-animation sub-settings panels ═══
export function _toggleAnimSubsettings(type) {
  const container = document.getElementById('anim-subsettings');
  if (!container) return;
  const panels = container.querySelectorAll('.anim-sub-panel');
  panels.forEach(p => p.style.display = 'none');
  if (!type) { container.style.display = 'none'; return; }
  container.style.display = 'block';
  const map = {
    'holograma': 'sub-holograma', 'cambio-color': 'sub-color-shift', 'brillo': 'sub-brillo',
    'glitch': 'sub-glitch', 'temblor': 'sub-shake', 'flotar': 'sub-translate',
    'pulsar': 'sub-scale', 'respirar': 'sub-scale', 'latido': 'sub-scale',
    'rebotar': 'sub-translate', 'deslizar-arriba': 'sub-translate', 'deslizar-abajo': 'sub-translate',
    'deslizar-izq': 'sub-translate', 'deslizar-der': 'sub-translate', 'sacudida': 'sub-shake',
    'neon-flicker': 'sub-neon', 'parpadeo': 'sub-parpadeo', 'rotar': 'sub-rotate',
    'wobble': 'sub-rotate', 'balanceo': 'sub-rotate', 'swing': 'sub-rotate',
    'drift': 'sub-translate', 'shake-x': 'sub-shake'
  };
  const panelId = map[type];
  if (panelId) { const panel = document.getElementById(panelId); if (panel) panel.style.display = 'block'; }
}

// ═══ Holograma color helpers ═══
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

export function _getHoloColors() {
  const list = document.getElementById('holo-colors-list');
  if (!list) return ['#ff0080','#00ff80','#0080ff'];
  return Array.from(list.querySelectorAll('input[type=color]')).map(i => i.value);
}

export function _setHoloColors(colors) {
  const list = document.getElementById('holo-colors-list');
  if (!list || !colors || !colors.length) return;
  list.innerHTML = colors.map(c => `<div class="holo-cs" style="display:flex;align-items:center;gap:4px"><input type="color" value="${c}" oninput="updateCardPreview()" style="width:32px;height:24px;border:1px solid var(--b);border-radius:4px;background:none;cursor:pointer;padding:0"><button onclick="this.parentElement.remove();updateCardPreview()" style="background:none;border:none;color:var(--acc);cursor:pointer;font-size:12px">✕</button></div>`).join('');
}

// ═══ Check if cardStyle is default ═══
export function _isCardStyleDefault(cs) {
  if (!cs) return true;
  const f = cs.filter || {};
  if ((f.brightness || 1) !== 1 || (f.contrast || 1) !== 1 || (f.saturate || 1) !== 1 || f.grayscale || f.sepia || f.hueRotate || f.blur || f.invert) return false;
  if (cs.glow && cs.glow.enabled) return false;
  if (cs.anim && cs.anim.type) return false;
  if (cs.border && cs.border.enabled) return false;
  if (cs.shadow && cs.shadow.enabled) return false;
  const hv = cs.hover || {};
  if ((hv.scale || 1) !== 1 || (hv.brightness || 1) !== 1 || (hv.saturate || 1) !== 1 || hv.shadowBlur || hv.blur || hv.siblingsBlur || hv.hueRotate || (hv.opacity || 1) !== 1) return false;
  const tf = cs.transform || {};
  if (tf.rotate || (tf.scale || 1) !== 1 || tf.skewX || tf.skewY || tf.x || tf.y) return false;
  const st = cs.style || {};
  if (st.shimmer || (st.borderRadius || 0) !== 0 || (st.opacity || 1) !== 1) return false;
  return true;
}

// ═══ Build cardStyle from inputs ═══
export function _buildCardStyleFromInputs() {
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
      invert: parseFloat(val('f-cs-fi')) || 0,
      opacity: parseFloat(val('f-cs-fo')) || 1,
      dropShadowX: parseInt(val('f-cs-ds-x')) || 0,
      dropShadowY: parseInt(val('f-cs-ds-y')) || 0,
      dropShadowBlur: parseInt(val('f-cs-ds-bl')) || 0,
      dropShadowColor: val('f-cs-ds-clr') || '#000000',
      dropShadowOpacity: parseFloat(val('f-cs-ds-op')) || 0
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
      holoColors: _getHoloColors(),
      holoBrightMin: parseFloat(val('f-anim-holo-bright-min')) || 0.9,
      holoBrightMax: parseFloat(val('f-anim-holo-bright-max')) || 1.4,
      holoSatMin: parseFloat(val('f-anim-holo-sat-min')) || 0.8,
      holoSatMax: parseFloat(val('f-anim-holo-sat-max')) || 2,
      holoGlow: parseInt(val('f-anim-holo-glow')) || 0,
      holoBlur: parseFloat(val('f-anim-holo-blur')) || 0,
      holoDir: val('f-anim-holo-dir') || 'hue',
      brilloMin: parseFloat(val('f-anim-brillo-min')) || 0.8,
      brilloMax: parseFloat(val('f-anim-brillo-max')) || 1.5,
      glitchX: parseInt(val('f-anim-glitch-x')) || 4,
      glitchY: parseInt(val('f-anim-glitch-y')) || 4,
      glitchRot: parseFloat(val('f-anim-glitch-rot')) || 0,
      glitchChromatic: checked('f-anim-glitch-chromatic'),
      translateX: parseInt(val('f-anim-translate-x')) || 0,
      translateY: parseInt(val('f-anim-translate-y')) || 12,
      translateRot: parseFloat(val('f-anim-translate-rot')) || 0,
      neonMin: parseFloat(val('f-anim-neon-min')) || 0.4,
      neonMax: parseFloat(val('f-anim-neon-max')) || 1,
      neonBright: parseFloat(val('f-anim-neon-bright')) || 1,
      parpadeoMin: parseFloat(val('f-anim-parpadeo-min')) || 0.3,
      parpadeoMax: parseFloat(val('f-anim-parpadeo-max')) || 1,
      rotateAngle: parseInt(val('f-anim-rotate-angle')) || 5,
      rotateScale: parseFloat(val('f-anim-rotate-scale')) || 1,
      scaleMin: parseFloat(val('f-anim-scale-min')) || 1,
      scaleMax: parseFloat(val('f-anim-scale-max')) || 1.06,
      scaleOpacity: parseFloat(val('f-anim-scale-opacity')) || 0.8,
      shakeX: parseInt(val('f-anim-shake-x')) || 4,
      shakeY: parseInt(val('f-anim-shake-y')) || 4,
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

// ═══ HEX to RGBA helper ═══
function _hexToRgba(hex, alpha) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const gv = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  return 'rgba(' + r + ',' + gv + ',' + b + ',' + (alpha != null ? alpha : 1) + ')';
}

// ═══ Apply cardStyle to preview element ═══
export function _applyCardStyleToPreview(pv, cs) {
  const inner = pv.querySelector('.bcpv-inner');

  // 1. CSS Filters
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

  // 1.5 Accent color propagation
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
    pv.style.setProperty('--glow-clr', gc.color || '#dc2626');
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
    const intVal = (ca.intensity != null ? ca.intensity : 100) / 100;
    const effectiveDur = intVal !== 1 ? (ca.dur || 2) / intVal : (ca.dur || 2);
    pv.style.setProperty('--ad', effectiveDur + 's');
    pv.style.setProperty('--adl', (ca.del || 0) + 's');
    if (intVal !== 1) pv.style.setProperty('--anim-int', intVal);
    pv.style.setProperty('--aease', ca.easing || 'ease-in-out');
    pv.style.setProperty('--adir', ca.direction || 'normal');
    pv.style.setProperty('--aiter', ca.iterations || 'infinite');
    if (ca.type === 'holograma') {
      pv.style.setProperty('--anim-hue-start', (ca.hueStart || 0) + 'deg');
      pv.style.setProperty('--anim-hue-end', (ca.hueEnd || 360) + 'deg');
      pv.style.setProperty('--anim-holo-bright-min', ca.holoBrightMin || 0.9);
      pv.style.setProperty('--anim-holo-bright-max', ca.holoBrightMax || 1.4);
      pv.style.setProperty('--anim-holo-sat-min', ca.holoSatMin || 0.8);
      pv.style.setProperty('--anim-holo-sat-max', ca.holoSatMax || 2);
      pv.style.setProperty('--anim-holo-glow', (ca.holoGlow || 0) + 'px');
      pv.style.setProperty('--anim-holo-blur', (ca.holoBlur || 0) + 'px');
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
    if (ca.type2) {
      pv.classList.add('anim2-' + ca.type2);
      pv.style.setProperty('--anim2', 'anim-' + ca.type2);
    }
  }

  // 4. Style
  const st = cs.style || {};
  if (st.accentColor) pv.style.setProperty('--card-tint', 'linear-gradient(135deg,' + st.accentColor + ',transparent)');
  if (st.shimmer) {
    pv.classList.add('shimmer-on');
    var shimSpeed = parseFloat(val('f-shimmer-speed')) || 3;
    var shimOp = parseFloat(val('f-shimmer-op')) || 0.04;
    pv.style.setProperty('--shim-speed', shimSpeed + 's');
    pv.style.setProperty('--shim-op', shimOp);
  }
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

  // 8. Hover vars
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
  const hasHoverEffects = (hv.scale && hv.scale !== 1) || (hv.brightness && hv.brightness !== 1) || (hv.saturate && hv.saturate !== 1) || hv.shadowBlur || hv.borderColor || hv.glowIntensify || hv.blur || hv.siblingsBlur || hv.hueRotate || (hv.opacity != null && hv.opacity !== 1) || (hv.enableAnim && hv.animType);
  if (hasHoverEffects) pv.classList.add('has-hover-fx');
}

// ═══ Live card preview update ═══
export function updateCardPreview() {
  const pv = g('beat-card-pv'); if (!pv) return;

  const name = val('f-name') || 'Nombre del Beat';
  const bpm = val('f-bpm') || '140';
  const key = val('f-key') || 'Am';
  const genre = g('f-genre')?.value || 'Trap';
  const imgUrl = val('f-img');

  const nameEl = g('bcpv-name'); if (nameEl) nameEl.textContent = name;
  const bpmEl = g('bcpv-bpm'); if (bpmEl) bpmEl.textContent = bpm + ' BPM';
  const keyEl = g('bcpv-key'); if (keyEl) keyEl.textContent = key;
  const genreEl = g('bcpv-genre'); if (genreEl) genreEl.textContent = genre;

  const imgWrap = g('bcpv-img');
  if (imgWrap) {
    if (imgUrl) imgWrap.innerHTML = '<img src="' + imgUrl + '" alt="">';
    else imgWrap.innerHTML = '<div class="bcpv-img-ph">♪</div>';
  }

  pv.className = 'bcpv';
  pv.style.cssText = '';
  var inner;
  if (inner = pv.querySelector('.bcpv-inner')) { inner.style.border = ''; inner.style.borderRadius = ''; }

  const cs = _buildCardStyleFromInputs();
  _applyCardStyleToPreview(pv, cs);

  const animTypeVal = val('f-anim-type');
  _toggleAnimSubsettings(animTypeVal);

  if (typeof window.renderFullPvInCard === 'function') window.renderFullPvInCard();
}

// ═══ Window assignments ═══
Object.assign(window, {
  syncAccentColor, syncBeatGlowColor, syncBorderColor,
  updateCardPreview, _buildCardStyleFromInputs, _applyCardStyleToPreview,
  _toggleAnimSubsettings, _getHoloColors, _setHoloColors, _isCardStyleDefault,
  _hexToRgba, syncSliderDisplay
});
