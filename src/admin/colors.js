// ═══ DACEWAV Admin — Color Editor ═══
import { COLOR_DEFS } from './config.js';
import { g } from './helpers.js';
import { hexFromRgba, rgbaFromHex } from './helpers.js';
import { updatePreview, updateHeroPv, autoSave } from './core.js';

export function buildColorEditor() {
  const el = g('color-editor'); if (!el) return;
  el.innerHTML = COLOR_DEFS.map(c => {
    const isAlpha = c.alpha;
    const hexVal = isAlpha ? hexFromRgba(c.def) : c.def;
    let alphaVal = 1;
    if (isAlpha) { const m = c.def.match(/,\s*([\d.]+)\)$/); if (m) alphaVal = parseFloat(m[1]); }
    return '<div class="ce-row"><label>' + c.label + '</label><input type="color" id="' + c.id + '-p" value="' + hexVal + '" oninput="syncColor(\'' + c.prop + '\',\'' + c.id + '\',this.value)"><input type="text" id="' + c.id + '-h" value="' + (isAlpha ? c.def : hexVal) + '" oninput="syncColorText(\'' + c.prop + '\',\'' + c.id + '\',this.value)">' + (isAlpha ? '<input type="range" min="0" max="1" step="0.05" value="' + alphaVal + '" style="width:40px" oninput="syncColorAlpha(\'' + c.prop + '\',\'' + c.id + '\',this.value)">' : '') + '</div>';
  }).join('');
}

export function syncColor(prop, id, hex) {
  const h = g(id + '-h'); if (h) h.value = hex;
  const as = document.querySelector('#' + id + '-h ~ input[type=range]');
  if (as) { const rgba = rgbaFromHex(hex, parseFloat(as.value)); if (h) h.value = rgba; applyColor(prop, rgba); }
  else applyColor(prop, hex);
}
export function syncColorText(prop, id, text) {
  const p = g(id + '-p');
  if (/^#[0-9a-fA-F]{6}$/.test(text)) { if (p) p.value = text; applyColor(prop, text); }
  else if (/^rgba/.test(text)) {
    const hex = hexFromRgba(text); if (p) p.value = hex;
    const m = text.match(/,\s*([\d.]+)\)$/);
    const as = document.querySelector('#' + id + '-h ~ input[type=range]');
    if (m && as) as.value = parseFloat(m[1]);
    applyColor(prop, text);
  }
}
export function syncColorAlpha(prop, id, alpha) {
  const p = g(id + '-p'), h = g(id + '-h');
  const hex = p ? p.value : '#dc2626';
  const rgba = rgbaFromHex(hex, parseFloat(alpha));
  if (h) h.value = rgba; applyColor(prop, rgba);
}
export function applyColor(prop, hex) {
  const syncMap = { glowColor: ['tc-glow', 'tt-glow', 'h-stroke-clr'], accent: ['tc-glow'], particlesColor: ['p-color'], bannerBg: ['b-bg'], btnLicClr: ['tc-btn-clr', 'tt-btn-clr'], btnLicBdr: ['tc-btn-bdr', 'tt-btn-bdr'], btnLicBg: ['tc-btn-bg', 'tt-btn-bg'], wbarColor: ['tc-wbar', 'tt-wbar'], wbarActive: ['tc-wbar-a', 'tt-wbar-a'], cardShadowColor: ['tc-shadow'] };
  const ids = syncMap[prop]; if (ids) ids.forEach(fid => { const el = g(fid); if (el) el.value = hex; });
  updatePreview(); autoSave();
}
export function loadColorValues() {
  COLOR_DEFS.forEach(c => {
    const v = (window.T && window.T[c.prop]) || c.def;
    const hex = hexFromRgba(v);
    const p = g(c.id + '-p'); if (p) p.value = hex;
    const h = g(c.id + '-h'); if (h) h.value = v;
  });
}
export function initPColors() {}
export function syncGlowColor(v) { const s = g('gc-swatch'); if (s) s.style.background = v; const t = g('tt-glow'); if (t) t.value = v; const c = g('tc-glow'); if (c) c.value = v; applyColor('glowColor', v); }
export function syncWB(v) { const t = g('tt-wbar'); if (t) t.value = v; applyColor('wbarColor', v); }
export function syncWBA(v) { const t = g('tt-wbar-a'); if (t) t.value = v; applyColor('wbarActive', v); }
export function syncBtnColor(v) { const t = g('tt-btn-clr'); if (t) t.value = v; applyColor('btnLicClr', v); }
export function syncBtnBdr(v) { const t = g('tt-btn-bdr'); if (t) t.value = v; applyColor('btnLicBdr', v); }
export function syncBtnBg(v) { const t = g('tt-btn-bg'); if (t) t.value = v; applyColor('btnLicBg', v); }
export function syncHeroTextColor(v) { const h = g('h-text-clr-h'); if (h) h.value = v; const c = g('h-text-clr'); if (c) c.value = v; updateHeroPv(); autoSave(); }

Object.assign(window, {
  buildColorEditor, syncColor, syncColorText, syncColorAlpha, applyColor,
  loadColorValues, initPColors, syncGlowColor, syncWB, syncWBA, syncBtnColor, syncBtnBdr, syncBtnBg,
  syncHeroTextColor
});
