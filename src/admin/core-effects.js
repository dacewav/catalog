// ═══ DACEWAV Admin — Core: Effects ═══
// Glow effects, animation controls, particles

import { ANIMS } from './config.js';
import {
  T, ppCtx, ppParts, ppAnim, setPpCtx, setPpParts, setPpAnim
} from './state.js';
import { g, val, checked, hexRgba, showToast } from './helpers.js';

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
