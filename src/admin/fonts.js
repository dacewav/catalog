// ═══ DACEWAV Admin — Font Picker ═══
import { FONT_DISPLAY, FONT_BODY } from './config.js';
import { _fpState } from './state.js';
import { g, val, setVal, loadFont, showToast } from './helpers.js';
import { updatePreview } from './core-preview.js';
import { autoSave } from './core-persistence.js';

const FP_CATS = {
  display: { all: 'Todas', sans: 'Sans', display: 'Display', serif: 'Serif', mono: 'Mono', custom: 'Custom' },
  body: { all: 'Todas', mono: 'Mono', sans: 'Sans', serif: 'Serif', custom: 'Custom' }
};
const FP_SANS_D = ['Syne','Oswald','Rajdhani','Exo 2','Barlow Condensed','Raleway','Montserrat','Poppins','Josefin Sans','Sora','Space Grotesk','Outfit','Plus Jakarta Sans','Figtree','Red Hat Display','Lexend','Manrope','Nunito Sans','Work Sans','Rubik','DM Sans','Urbanist'];
const FP_DISPLAY_D = ['Bebas Neue','Anton','Archivo Black','Unbounded','Righteous','Comfortaa','Major Mono Display','Bangers','Permanent Marker','Black Ops One','Bungee','Passion One','Alfa Slab One','Teko','Staatliches','Pathway Extreme'];
const FP_SERIF_D = ['Playfair Display','Cinzel','Cormorant Garamond','DM Serif Display','Libre Baskerville','Fraunces','Bricolage Grotesque'];
const FP_MONO_D = ['Press Start 2P','Space Mono','IBM Plex Mono'];
const FP_MONO_B = ['DM Mono','IBM Plex Mono','Space Mono','Share Tech Mono','Fira Code','JetBrains Mono','Ubuntu Mono','Courier Prime','Inconsolata','Source Code Pro','Anonymous Pro','Roboto Mono'];
const FP_SANS_B = ['Inter','Manrope','Nunito','Quicksand','Poppins','Montserrat','Raleway','Sora','DM Sans','Work Sans','Figtree','Plus Jakarta Sans','Outfit','Lexend','Nunito Sans','Rubik','Urbanist','Karla','Source Sans 3','Cabin'];
const FP_SERIF_B = ['Lora','Crimson Text','Merriweather','PT Serif','Libre Baskerville','EB Garamond','Playfair Display','Cormorant Garamond','Fraunces'];

function getFontList(type, cat) {
  const lists = type === 'display'
    ? { all: FONT_DISPLAY.map(f => f[0]), sans: FP_SANS_D, display: FP_DISPLAY_D, serif: FP_SERIF_D, mono: FP_MONO_D }
    : { all: FONT_BODY.map(f => f[0]), mono: FP_MONO_B, sans: FP_SANS_B, serif: FP_SERIF_B };
  if (cat === 'custom') return _fpState[type].gfonts;
  return lists[cat] || lists.all;
}

function getCatLabel(type, font) {
  if (type === 'display') {
    if (FP_SANS_D.includes(font)) return 'sans';
    if (FP_DISPLAY_D.includes(font)) return 'display';
    if (FP_SERIF_D.includes(font)) return 'serif';
    if (FP_MONO_D.includes(font)) return 'mono';
    if (_fpState.display.gfonts.includes(font)) return 'custom';
  } else {
    if (FP_MONO_B.includes(font)) return 'mono';
    if (FP_SANS_B.includes(font)) return 'sans';
    if (FP_SERIF_B.includes(font)) return 'serif';
    if (_fpState.body.gfonts.includes(font)) return 'custom';
  }
  return '';
}

export function buildFontPicker(type) {
  const state = _fpState[type];
  const cats = FP_CATS[type];
  const tabsEl = g('fp-' + type + '-tabs');
  const listEl = g('fp-' + type + '-list');
  if (!tabsEl || !listEl) return;
  tabsEl.innerHTML = Object.keys(cats).map(k =>
    '<div class="fp-tab' + (k === state.cat ? ' on' : '') + '" onclick="switchFPCat(\'' + type + '\',\'' + k + '\')">' + cats[k] + '</div>'
  ).join('');
  let fonts = getFontList(type, state.cat);
  if (state.query) { const q = state.query.toLowerCase(); fonts = fonts.filter(f => f.toLowerCase().includes(q)); }
  if (!fonts.length) { listEl.innerHTML = '<div class="fp-no-results">' + (state.cat === 'custom' ? 'Aún no has añadido fuentes custom' : 'Sin resultados') + '</div>'; return; }
  const currentVal = val('t-font-' + (type === 'display' ? 'd' : 'm'));
  listEl.innerHTML = fonts.map(f =>
    '<div class="fp-item' + (f === currentVal ? ' on' : '') + '" data-font="' + f + '" onmouseenter="previewFontHover(\'' + type + '\',\'' + f.replace(/'/g, "\\'") + '\')" onmouseleave="previewFontLeave(\'' + type + '\')" onclick="selectFont(\'' + type + '\',\'' + f.replace(/'/g, "\\'") + '\')"><span class="fp-item-name" style="font-family:\'' + f + '\',sans-serif">' + f + '</span><span class="fp-item-cat">' + getCatLabel(type, f) + '</span></div>'
  ).join('');
}

export function toggleFontPicker(type) {
  const dd = g('fp-' + type + '-dd'), btn = g('fp-' + type + '-btn');
  const isOpen = dd.classList.contains('open');
  document.querySelectorAll('.font-picker-dd').forEach(d => d.classList.remove('open'));
  document.querySelectorAll('.font-picker-btn').forEach(b => b.classList.remove('open'));
  if (!isOpen) { dd.classList.add('open'); btn.classList.add('open'); buildFontPicker(type); setTimeout(() => g('fp-' + type + '-search').focus(), 50); }
}
export function switchFPCat(type, cat) { _fpState[type].cat = cat; _fpState[type].query = ''; g('fp-' + type + '-search').value = ''; buildFontPicker(type); }
export function filterFontPicker(type, query) { _fpState[type].query = query; buildFontPicker(type); }
export function previewFontHover(type, font) { loadFont(font); const el = type === 'display' ? g('fp-display') : g('fp-body'); if (el) el.style.fontFamily = "'" + font + "',sans-serif"; }
export function previewFontLeave(type) { const hiddenVal = val('t-font-' + (type === 'display' ? 'd' : 'm')); const el = type === 'display' ? g('fp-display') : g('fp-body'); if (el && hiddenVal) el.style.fontFamily = "'" + hiddenVal + "',sans-serif"; }
export function selectFont(type, font) {
  const hiddenId = type === 'display' ? 't-font-d' : 't-font-m';
  setVal(hiddenId, font); g('fp-' + type + '-btn').textContent = font;
  loadFont(font); previewFontLeave(type);
  g('fp-' + type + '-dd').classList.remove('open'); g('fp-' + type + '-btn').classList.remove('open');
  updatePreview(); autoSave(); showToast('Fuente: ' + font);
}
export function applyCustomFont(type) {
  const input = g('fp-' + type + '-custom'); const font = (input.value || '').trim();
  if (!font) return;
  if (!_fpState[type].gfonts.includes(font)) _fpState[type].gfonts.push(font);
  selectFont(type, font); input.value = '';
}
export async function loadMoreFonts(type) {
  const btn = g('fp-' + type + '-more');
  if (_fpState[type].gfontsLoaded) { _fpState[type].cat = 'custom'; buildFontPicker(type); return; }
  btn.classList.add('loading'); btn.textContent = '⏳ Cargando fuentes...';
  try {
    const resp = await fetch('https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&key=AIzaSyCr2dekkLLifIg0_JlLfEleaV32b5XdvIQ');
    const data = await resp.json();
    if (data.items) {
      const existing = new Set([...FONT_DISPLAY.map(f => f[0]), ...FONT_BODY.map(f => f[0]), ..._fpState[type].gfonts]);
      const newFonts = data.items.map(f => f.family).filter(f => !existing.has(f)).slice(0, 200);
      _fpState[type].gfonts = _fpState[type].gfonts.concat(newFonts);
      _fpState[type].gfontsLoaded = true; _fpState[type].cat = 'custom';
      buildFontPicker(type);
      btn.textContent = '✅ ' + data.items.length + ' fuentes cargadas'; btn.classList.remove('loading');
      showToast('Google Fonts: ' + newFonts.length + ' nuevas fuentes');
    }
  } catch (e) { btn.textContent = '❌ Error. Reintentar'; btn.classList.remove('loading'); _fpState[type].gfontsLoaded = false; showToast('Error al conectar con Google Fonts'); }
}
export function populateFontSelects() {
  const fd = val('t-font-d'), fm = val('t-font-m');
  if (fd) g('fp-display-btn').textContent = fd;
  if (fm) g('fp-body-btn').textContent = fm;
  loadAndPreviewFont();
}
export function loadAndPreviewFont() {
  const fd = val('t-font-d'), fm = val('t-font-m');
  if (fd) loadFont(fd); if (fm) loadFont(fm);
  const fpd = g('fp-display'), fpb = g('fp-body');
  if (fpd && fd) fpd.style.fontFamily = "'" + fd + "',sans-serif";
  if (fpb && fm) fpb.style.fontFamily = "'" + fm + "',sans-serif";
  updatePreview();
}
export function applyTypo(name) {
  const p = { industrial: ['Oswald', 'DM Mono'], brutalista: ['Anton', 'Space Mono'], minimal: ['Sora', 'Inter'], scifi: ['Orbitron', 'Share Tech Mono'], elegant: ['Playfair Display', 'Crimson Text'], modern: ['Unbounded', 'Manrope'] }[name];
  if (!p) return; setVal('t-font-d', p[0]); setVal('t-font-m', p[1]);
  if (g('fp-display-btn')) g('fp-display-btn').textContent = p[0];
  if (g('fp-body-btn')) g('fp-body-btn').textContent = p[1];
  loadAndPreviewFont(); autoSave(); showToast('Typo: ' + name);
}

// Close font pickers on outside click
document.addEventListener('click', function (e) {
  if (!e.target.closest('.font-picker')) {
    document.querySelectorAll('.font-picker-dd.open').forEach(d => d.classList.remove('open'));
    document.querySelectorAll('.font-picker-btn.open').forEach(b => b.classList.remove('open'));
  }
});

Object.assign(window, {
  buildFontPicker, toggleFontPicker, switchFPCat, filterFontPicker,
  previewFontHover, previewFontLeave, selectFont, applyCustomFont,
  loadMoreFonts, populateFontSelects, loadAndPreviewFont, applyTypo
});
