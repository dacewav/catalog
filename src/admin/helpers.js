// ═══ DACEWAV Admin — DOM Helpers ═══
import { hexRgba as _hexRgba, loadFont as _loadFont } from '../utils.js';

export function g(id) { return document.getElementById(id); }
export function val(id) { const el = g(id); return el ? el.value : ''; }
export function setVal(id, v) { const el = g(id); if (el) el.value = v; }
export function checked(id) { const el = g(id); return el ? el.checked : false; }
export function setChecked(id, v) { const el = g(id); if (el) el.checked = !!v; }

export function hexRgba(h, a) { return _hexRgba(h, a); }
export function hexFromRgba(rgba) {
  if (!rgba || !rgba.startsWith('rgba')) return rgba || '#dc2626';
  const m = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return '#dc2626';
  return '#' + [m[1], m[2], m[3]].map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
}
export function rgbaFromHex(hex, a) {
  if (!hex || !hex.startsWith('#')) return hex;
  const r = parseInt(hex.slice(1, 3), 16), g2 = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return 'rgba(' + r + ',' + g2 + ',' + b + ',' + (a != null ? a : 1) + ')';
}
export function loadFont(family, id) { return _loadFont(family, id); }

export function showToast(msg, err) {
  const t = g('toast');
  t.textContent = msg;
  t.className = 'toast show' + (err ? ' err' : '');
  setTimeout(() => t.className = 'toast', 3000);
}
export function showSaving(show) {
  g('saving-ind').className = show ? 'saving show' : 'saving';
}
export function fmt(s) {
  return Math.floor(s / 60) + ':' + Math.floor(s % 60).toString().padStart(2, '0');
}

// Slider value display
const SLIDER_REM = ['h-pad-top', 't-hero-top', 't-pad'];
const SLIDER_PX = ['t-blur', 't-glow-blur', 't-glow-spread', 't-gap', 't-radius', 't-logo-w', 't-logo-ox', 't-player-bot', 'h-glow-blur', 'h-word-blur', 'h-stroke-w', 'h-eyebrow-size', 'tc-shadow', 'p-min', 'p-max', 'b-speed'];
const SLIDER_SIZE = ['h-title-size'];

export function sv(input) {
  const sib = input.nextElementSibling; if (!sib) return;
  const v = parseFloat(input.value);
  const id = input.id;
  if (id.includes('scale') || id === 't-logo-scale') sib.textContent = v.toFixed(2) + 'x';
  else if (id === 't-line-h' || id === 'h-lh') sib.textContent = v.toFixed(2);
  else if (id === 'h-ls') sib.textContent = v.toFixed(2);
  else if (id.includes('speed') || id.includes('delay')) sib.textContent = v.toFixed(1) + 's';
  else if (id.includes('int') && !id.includes('shadow')) sib.textContent = v.toFixed(1) + 'x';
  else if (SLIDER_REM.includes(id)) sib.textContent = v.toFixed(1) + 'rem';
  else if (SLIDER_SIZE.includes(id)) sib.textContent = v.toFixed(1) + 'rem';
  else if (SLIDER_PX.includes(id)) sib.textContent = v + 'px';
  else if (/op|grain|grad-op|word-op/.test(id)) sib.textContent = v.toFixed(2);
  else sib.textContent = v;
}

export function resetSlider(input, def) {
  if (!input) return;
  input.value = def;
  sv(input);
  autoSavePlaceholder();
}

// Placeholder — will be replaced by core.js after import
let autoSavePlaceholder = () => {};
export function setAutoSaveRef(fn) { autoSavePlaceholder = fn; }

export function toggleCard(title) {
  const body = title.nextElementSibling;
  if (!body) return;
  const collapsed = body.classList.toggle('collapsed');
  title.classList.toggle('collapsed', collapsed);
}

// ─── Inline Confirm/Prompt (replaces native confirm/prompt) ───
export function confirmInline(msg) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'inline-modal-overlay';
    overlay.innerHTML = '<div class="inline-modal"><p>' + msg + '</p><div class="inline-modal-btns"><button class="btn btn-g" id="ic-ok">Confirmar</button><button class="btn btn-del" id="ic-cancel">Cancelar</button></div></div>';
    document.body.appendChild(overlay);
    overlay.querySelector('#ic-ok').onclick = () => { overlay.remove(); resolve(true); };
    overlay.querySelector('#ic-cancel').onclick = () => { overlay.remove(); resolve(false); };
  });
}

export function promptInline(msg, defVal) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'inline-modal-overlay';
    overlay.innerHTML = '<div class="inline-modal"><p>' + msg + '</p><input type="text" class="inline-modal-input" value="' + (defVal || '') + '"><div class="inline-modal-btns"><button class="btn btn-g" id="ip-ok">Aceptar</button><button class="btn btn-del" id="ip-cancel">Cancelar</button></div></div>';
    document.body.appendChild(overlay);
    const inp = overlay.querySelector('.inline-modal-input');
    inp.focus(); inp.select();
    const submit = () => { const v = inp.value; overlay.remove(); resolve(v || null); };
    overlay.querySelector('#ip-ok').onclick = submit;
    overlay.querySelector('#ip-cancel').onclick = () => { overlay.remove(); resolve(null); };
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') { overlay.remove(); resolve(null); } });
  });
}

// Assign to window for onclick handlers
Object.assign(window, {
  g, val, setVal, checked, setChecked,
  hexRgba, hexFromRgba, rgbaFromHex, loadFont,
  showToast, showSaving, fmt, sv, resetSlider, toggleCard,
  confirmInline, promptInline
});
