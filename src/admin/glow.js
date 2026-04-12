// ═══ DACEWAV Admin — Glow System ═══
// Extracted from core.js — glow effects, presets, preview update.

import { g, val, setVal, checked, hexRgba, sv, setChecked, showToast } from './helpers.js';

// Dependencies injected by core.js
let _autoSave = null;
let _updateHeroPv = null;

export function setGlowDeps({ autoSave, updateHeroPv }) {
  _autoSave = autoSave;
  _updateHeroPv = updateHeroPv;
}

// ═══ GLOW DESCRIPTIONS ═══
const _glowDescs = {
  'text-shadow': 'Resplandor suave alrededor del texto. El m\xE1s com\xFAn y ligero.',
  'box-shadow': 'Sombra rectangular detr\xE1s del elemento. Ideal para tarjetas y contenedores.',
  'drop-shadow': 'Sombra que sigue la forma del texto/imagen. Bueno para logos con transparencia.',
  'neon-blur': 'Efecto ne\xF3n difuminado. Intenso, como un letrero de ne\xF3n visto de lejos.',
  'neon-sign': 'Ne\xF3n n\xEDtido con borde definido. Parece un letrero de ne\xF3n real.',
  'outer-glow': 'Resplandor externo uniforme. Suave y elegante, buen fondo oscuro.',
  'inner-glow': 'Brillo desde dentro del elemento. Da sensaci\xF3n de iluminaci\xF3n interna.',
};
const _glowAnimDescs = {
  none: 'Sin animaci\xF3n',
  pulse: 'Palpita: se intensifica y aten\xFAa r\xEDtmicamente',
  breathe: 'Respira: crece y decrece suavemente como respiraci\xF3n',
  flicker: 'Parpadeo: imita ne\xF3n con fallas el\xE9ctricas aleatorias',
  rainbow: 'Arco\xEDris: rota colores continuamente',
  wave: 'Onda: var\xEDa la intensidad como una onda sinusoidal',
  'neon-flicker': 'Ne\xF3n cl\xE1sico: parpadeo r\xE1pido como tubo de ne\xF3n real',
  holograma: 'Holograma: rota brillo y tono como una tarjeta hologr\xE1fica',
};

export function updateGlowDesc() {
  const el = g('glow-desc');
  if (el) el.textContent = _glowDescs[val('t-glow-type')] || '';
}

export function updateGlowAnimDesc() {
  const el = g('glow-anim-desc');
  if (el) el.textContent = _glowAnimDescs[val('t-glow-anim')] || '';
}

// ═══ GLOW COMPUTE ═══
export function computeGlowCSS(type, blur, spread, int, color) {
  const c = hexRgba(color, int);
  switch (type) {
    case 'text-shadow':
      return { textShadow: '0 0 ' + blur + 'px ' + c, boxShadow: 'none', filter: 'none' };
    case 'box-shadow':
      return { textShadow: 'none', boxShadow: '0 0 ' + blur + 'px ' + spread + 'px ' + c, filter: 'none' };
    case 'drop-shadow':
      return { textShadow: 'none', boxShadow: 'none', filter: 'drop-shadow(0 0 ' + blur + 'px ' + c + ')' };
    case 'neon-blur':
      return { textShadow: '0 0 ' + (blur * 0.3) + 'px ' + c + ',0 0 ' + blur + 'px ' + hexRgba(color, int * 0.6), boxShadow: 'none', filter: 'none' };
    case 'neon-sign':
      return { textShadow: '0 0 ' + (blur * 0.2) + 'px ' + hexRgba(color, 0.9) + ',0 0 ' + (blur * 0.5) + 'px ' + hexRgba(color, 0.7) + ',0 0 ' + blur + 'px ' + hexRgba(color, 0.4), boxShadow: '0 0 ' + (blur * 0.3) + 'px ' + spread + 'px ' + hexRgba(color, 0.3), filter: 'none' };
    case 'outer-glow':
      return { textShadow: 'none', boxShadow: '0 0 ' + (blur * 0.5) + 'px ' + spread + 'px ' + hexRgba(color, 0.4) + ',0 0 ' + blur + 'px ' + (spread * 2) + 'px ' + hexRgba(color, 0.2), filter: 'none' };
    case 'inner-glow':
      return { textShadow: 'none', boxShadow: 'inset 0 0 ' + (blur * 0.5) + 'px ' + spread + 'px ' + hexRgba(color, 0.5), filter: 'none' };
    default:
      return { textShadow: '0 0 ' + blur + 'px ' + c, boxShadow: 'none', filter: 'none' };
  }
}

export function applyGlowTo(el, type, blur, spread, int, color, active) {
  if (!el) return;
  if (!active) {
    el.style.textShadow = 'none';
    el.style.boxShadow = 'none';
    el.style.filter = 'none';
    return;
  }
  const css = computeGlowCSS(type, blur, spread, int, color);
  el.style.textShadow = css.textShadow;
  el.style.boxShadow = css.boxShadow;
  el.style.filter = css.filter;
}

// ═══ GLOW PRESETS ═══
const GLOW_PRESETS = {
  soft:   { type: 'text-shadow', blur: 30, int: 0.6, op: 0.8, anim: 'breathe', speed: 3 },
  neon:   { type: 'neon-sign', blur: 25, int: 1.5, op: 1, anim: 'neon-flicker', speed: 4 },
  fire:   { type: 'neon-blur', blur: 20, int: 1.2, op: 0.9, anim: 'pulse', speed: 1.5 },
  ice:    { type: 'outer-glow', blur: 35, int: 0.8, op: 0.7, anim: 'breathe', speed: 4 },
  toxic:  { type: 'neon-sign', blur: 22, int: 1.3, op: 1, anim: 'flicker', speed: 2 },
  sunset: { type: 'text-shadow', blur: 28, int: 1, op: 0.85, anim: 'wave', speed: 3 },
  royal:  { type: 'neon-blur', blur: 18, int: 1.1, op: 0.95, anim: 'pulse', speed: 2.5 },
  disco:  { type: 'neon-sign', blur: 30, int: 1.8, op: 1, anim: 'rainbow', speed: 2 },
};

export function applyGlowPreset(name) {
  const p = GLOW_PRESETS[name];
  if (!p) return;
  setVal('t-glow-type', p.type);
  setVal('t-glow-blur', p.blur);
  setVal('t-glow-int', p.int);
  setVal('t-glow-op', p.op);
  setVal('t-glow-anim', p.anim);
  setVal('t-glow-speed', p.speed);
  setChecked('t-glow', true);
  document.querySelectorAll('#t-glow-blur, #t-glow-int, #t-glow-op, #t-glow-speed').forEach((el) => sv(el));
  updatePreview();
  updateGlowDesc();
  updateGlowAnimDesc();
  if (_autoSave) _autoSave();
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
  ['gp-box', 'gp-text', 'gp-btn'].forEach((id) => {
    const el = g(id);
    if (!el) return;
    applyGlowTo(el, gType, blur, spread, int * gOp, accent, active);
    if (el.id === 'gp-box') {
      el.style.color = accent;
    }
  });
  const anim = val('t-glow-anim') || 'none';
  const speed = parseFloat(val('t-glow-speed')) || 2;
  ['gp-box', 'gp-text', 'gp-btn'].forEach((id) => {
    const el = g(id);
    if (!el) return;
    el.classList.remove(
      'gap-anim-pulse', 'gap-anim-breathe', 'gap-anim-flicker',
      'gap-anim-rainbow', 'gap-anim-wave', 'gap-anim-neon-flicker', 'gap-anim-holograma'
    );
    if (anim !== 'none') {
      el.classList.add('gap-anim-' + anim);
      el.style.setProperty('--ga-s', speed + 's');
    }
  });
  if (_updateHeroPv) _updateHeroPv();
}
