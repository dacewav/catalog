// ═══ DACEWAV Admin — Core: Persistence ═══
// Undo/redo, auto-save, saveAll, collectSiteSettings, snapshots, save slots, custom themes, presets, gradient editor

import {
  db, T, setT, siteSettings, customEmojis, floatingEls,
  _undoStack, _redoStack, _lastSavedTheme, _undoDebounce,
  _gradStops
} from './state.js';
import {
  g, val, setVal, checked, setChecked,
  showToast, showSaving, sv, setAutoSaveRef
} from './helpers.js';
import { collectAnim } from './core-effects.js';

// Lazy ref to avoid circular dep with core-ui.js
let _loadThemeUI = () => {};
export function setLoadThemeUIRef(fn) { _loadThemeUI = fn; }

// Lazy ref to avoid circular dep: broadcastTheme lives in core-preview
let _broadcastTheme = () => {};
export function setBroadcastThemeRef(fn) { _broadcastTheme = fn; }

// ═══ UNDO/REDO ═══
let _autoSaveTimer = null;

export function pushUndo() {
  clearTimeout(_undoDebounce);
  const timer = setTimeout(() => {
    const snap = JSON.stringify(collectTheme());
    if (_lastSavedTheme === snap) return;
    _undoStack.push(snap);
    if (_undoStack.length > 50) _undoStack.shift();
    _redoStack.length = 0;
  }, 300);
}
export function undo() {
  if (_undoStack.length < 2) return;
  _redoStack.push(_undoStack.pop());
  const prev = _undoStack[_undoStack.length - 1];
  if (prev) { setT(JSON.parse(prev)); _loadThemeUI(); _broadcastTheme(); showToast('Deshacer ↩'); }
}
export function redo() {
  if (!_redoStack.length) return;
  const next = _redoStack.pop();
  _undoStack.push(next);
  setT(JSON.parse(next)); _loadThemeUI(); _broadcastTheme(); showToast('Rehacer ↪');
}

// ═══ AUTO-SAVE ═══
export function autoSave() {
  clearTimeout(_autoSaveTimer);
  pushUndo();
  // Lazy import to avoid circular with core-export (which imports from us)
  import('./core-export.js').then(m => { if (m.logFieldChange) m.logFieldChange(); });
  const theme = collectTheme();
  localStorage.setItem('dace-theme', JSON.stringify(theme));
  _broadcastTheme();
  const dot = g('sdot'); dot.className = 'sdot';
  _autoSaveTimer = setTimeout(() => {
    if (!db) { dot.className = 'sdot ok'; return; }
    _collectSiteSettings();
    const p1 = db.ref('theme').update(theme).catch(() => {});
    const p2 = db.ref('settings').update(siteSettings).catch(() => {});
    Promise.all([p1, p2]).then(() => { dot.className = 'sdot ok'; setTimeout(() => dot.className = 'sdot', 2000); }).catch(() => { dot.className = 'sdot err' });
  }, 2000);
}
export function saveAll() {
  const theme = collectTheme(); pushUndo();
  localStorage.setItem('dace-theme', JSON.stringify(theme));
  _collectSiteSettings();
  localStorage.setItem('dace-settings', JSON.stringify(siteSettings));
  showSaving(true);
  if (db) {
    Promise.all([db.ref('theme').set(theme), db.ref('settings').update(siteSettings)])
      .then(() => { showSaving(false); showToast('Todo guardado ✓') })
      .catch(() => { showSaving(false); showToast('Error al guardar', true) });
  } else { showSaving(false); showToast('Guardado local ✓'); }
}
export function _collectSiteSettings() {
  siteSettings.siteName = val('s-name') || 'DACE';
  siteSettings.whatsapp = val('s-wa') || '';
  siteSettings.instagram = val('s-ig') || '';
  siteSettings.email = val('s-email') || '';
  siteSettings.heroTitle = val('s-hero') || '';
  siteSettings.heroSubtitle = val('s-sub') || '';
  siteSettings.dividerTitle = val('s-div-title') || '';
  siteSettings.dividerSub = val('s-div-sub') || '';
  siteSettings.testimonialsActive = checked('s-testi');
  siteSettings.bannerActive = checked('b-active');
  siteSettings.bannerText = val('b-text') || '';
  siteSettings.bannerBg = val('b-bg') || '#7f1d1d';
  siteSettings.bannerSpeed = parseInt(val('b-speed')) || 20;
  siteSettings.bannerAnim = val('b-anim') || 'scroll';
  siteSettings.bannerEasing = val('b-easing') || 'linear';
  siteSettings.bannerDir = val('b-dir') || 'normal';
  siteSettings.bannerDelay = parseFloat(val('b-delay')) || 0;
  siteSettings.bannerTxtClr = val('b-txt-clr') || '#ffffff';
}

// Wire up helpers autoSave reference
setAutoSaveRef(autoSave);

// ═══ COLLECT THEME ═══
export function collectTheme() {
  return {
    bg: val('tc-bg-h') || '#060404', surface: val('tc-surface-h') || '#0f0808', surface2: val('tc-surface2-h') || '#1a0c0c',
    text: val('tc-text-h') || '#f5eeee', muted: val('tc-muted-h') || 'rgba(245,238,238,0.5)', hint: val('tc-hint-h') || 'rgba(245,238,238,0.2)',
    border: val('tc-border-h') || 'rgba(255,255,255,0.06)', border2: val('tc-border2-h') || 'rgba(255,255,255,0.12)',
    accent: val('tc-accent-h') || '#dc2626', red: val('tc-red-h') || '#7f1d1d', redL: val('tc-red-l-h') || '#991b1b',
    fontDisplay: val('t-font-d') || 'Syne', fontBody: val('t-font-m') || 'DM Mono',
    fontSize: parseInt(val('t-font-size')) || 14, lineHeight: parseFloat(val('t-line-h')) || 1.7,
    logoUrl: val('t-logo-url'), logoWidth: parseInt(val('t-logo-w')) || 80, logoHeight: 0,
    logoRotation: parseInt(val('t-logo-rot')) || 0, logoScale: parseFloat(val('t-logo-scale')) || 1,
    logoTextGap: parseInt(val('t-logo-gap')) || 12, showLogoText: checked('t-logo-text'),
    glowActive: checked('t-glow'), glowColor: val('tt-glow') || '#dc2626',
    glowType: val('t-glow-type') || 'text-shadow', glowBlur: parseInt(val('t-glow-blur')) || 20,
    glowSpread: 0, glowIntensity: parseFloat(val('t-glow-int')) || 1,
    glowOpacity: parseFloat(val('t-glow-op')) || 1, glowAnim: val('t-glow-anim') || 'none',
    blurBg: parseFloat(val('t-blur')) || 24, cardOpacity: parseFloat(val('t-card-op')) || 1,
    grainOpacity: parseFloat(val('t-grain')) || 0.3, radiusGlobal: parseInt(val('t-radius')) || 10,
    bgOpacity: parseFloat(val('t-bg-op')) || 1, btnOpacityNormal: parseFloat(val('t-btn-op')) || 1,
    btnOpacityHover: parseFloat(val('t-btn-hop')) || 0.85, waveOpacityOff: parseFloat(val('t-wbar-op')) || 0.18,
    waveOpacityOn: parseFloat(val('t-wbar-aop')) || 1, wbarColor: val('tt-wbar') || 'rgba(255,255,255,0.18)',
    wbarActive: val('tt-wbar-a') || '#dc2626', btnLicBg: val('tt-btn-bg') || 'rgba(185,28,28,0.1)',
    btnLicClr: val('tt-btn-clr') || '#dc2626', btnLicBdr: val('tt-btn-bdr') || 'rgba(185,28,28,0.5)',
    padSection: parseFloat(val('t-pad')) || 4, beatGap: parseInt(val('t-gap')) || 16,
    cardShadowColor: val('tc-shadow') || '#000000', cardShadowIntensity: parseFloat(val('t-shadow-int')) || 0.5,
    particlesOn: checked('p-on'), particlesColor: val('p-color') || '#dc2626',
    particlesCount: parseInt(val('p-count')) || 40, particlesMin: parseInt(val('p-min')) || 2,
    particlesMax: parseInt(val('p-max')) || 6, particlesSpeed: parseFloat(val('p-speed')) || 1,
    particlesType: val('p-type') || 'circle', particlesOpacity: parseFloat(val('p-opacity')) || 0.5,
    particlesText: val('p-text') || '♪', particlesImgUrl: val('p-img-url') || '',
    bannerText: val('b-text') || '', bannerBg: val('b-bg') || '#7f1d1d', bannerSpeed: parseInt(val('b-speed')) || 20,
    bannerEasing: val('b-easing') || 'linear', bannerDir: val('b-dir') || 'normal', bannerDelay: parseFloat(val('b-delay')) || 0, bannerTxtClr: val('b-txt-clr') || '#ffffff',
    animLogo: collectAnim('logo'), animTitle: collectAnim('title'), animPlayer: collectAnim('player'),
    animCards: collectAnim('cards'), animButtons: collectAnim('buttons'), animWaveform: collectAnim('waveform'),
    layout: { heroMarginTop: parseFloat(val('t-hero-top')) || 7, playerBottom: parseInt(val('t-player-bot')) || 0, logoOffsetX: parseInt(val('t-logo-ox')) || 0 },
    heroTitleCustom: val('h-title') || '', heroSubCustom: val('h-sub') || '', heroEyebrow: val('h-eyebrow') || '',
    heroGlowOn: checked('h-glow-on'), heroGlowInt: parseFloat(val('h-glow-int')) || 1, heroGlowBlur: parseInt(val('h-glow-blur')) || 20,
    heroStrokeOn: checked('h-stroke-on'), heroStrokeW: parseFloat(val('h-stroke-w')) || 1, heroWordBlur: parseInt(val('h-word-blur')) || 10, heroWordOp: parseFloat(val('h-word-op')) || 0.35, heroStrokeClr: val('h-stroke-clr') || '#dc2626',
    heroGradOn: checked('h-grad-on'), heroGradClr: val('h-grad-clr') || '#dc2626', heroGradOp: parseFloat(val('h-grad-op')) || 0.14, heroGradW: parseInt(val('h-grad-w')) || 80, heroGradH: parseInt(val('h-grad-h')) || 60,
    heroTitleSize: parseFloat(val('h-title-size')) || 2.8, heroPadTop: parseFloat(val('h-pad-top')) || 7, heroLetterSpacing: parseFloat(val('h-ls')) || -0.04, heroLineHeight: parseFloat(val('h-lh')) || 1,
    heroEyebrowOn: checked('h-eyebrow-on'), heroEyebrowClr: val('h-eyebrow-clr') || '#dc2626', heroEyebrowSize: parseInt(val('h-eyebrow-size')) || 10,
    navOpacity: parseFloat(val('t-nav-op')) || 0.88,
    beatImgOpacity: parseFloat(val('t-beat-img-op')) || 1,
    textOpacity: parseFloat(val('t-text-op')) || 1,
    heroBgOpacity: parseFloat(val('t-hero-bg-op')) || 1,
    sectionOpacity: parseFloat(val('t-section-op')) || 1,
    orbBlendMode: val('t-orb-blend') || 'normal',
    grainBlendMode: val('t-grain-blend') || 'overlay',
    glowAnimSpeed: parseFloat(val('t-glow-speed')) || 2,
    wbarHeight: parseInt(val('t-wbar-h')) || 12,
    wbarRadius: parseInt(val('t-wbar-r')) || 2,
    fontWeight: val('t-font-weight') || '800'
  };
}

// ═══ PRESETS ═══
const PRESETS = [
  { name: 'DACE DARK', bg: '#060404', surface: '#0f0808', accent: '#dc2626', fontDisplay: 'Syne', fontBody: 'DM Mono', colors: ['#060404', '#0f0808', '#dc2626', '#f5eeee'] },
  { name: 'VINTAGE TAPE', bg: '#1a1510', surface: '#2a2218', accent: '#c4954a', fontDisplay: 'Bebas Neue', fontBody: 'Lora', colors: ['#1a1510', '#2a2218', '#c4954a', '#e8dcc8'] },
  { name: 'NEON PUNK', bg: '#0a0014', surface: '#160030', accent: '#e040fb', fontDisplay: 'Anton', fontBody: 'Space Mono', colors: ['#0a0014', '#160030', '#e040fb', '#f5eeee'] },
  { name: 'CYBERPUNK', bg: '#0d0d0d', surface: '#1a1a1a', accent: '#fcee09', fontDisplay: 'Orbitron', fontBody: 'Share Tech Mono', colors: ['#0d0d0d', '#1a1a1a', '#fcee09', '#00fff5'] },
  { name: 'PASTEL WAVE', bg: '#1e1a2e', surface: '#2d2640', accent: '#ff8fa3', fontDisplay: 'Comfortaa', fontBody: 'Quicksand', colors: ['#1e1a2e', '#2d2640', '#ff8fa3', '#f0e6ff'] },
  { name: 'DARK ACADEMIA', bg: '#12100e', surface: '#1e1a16', accent: '#8b7355', fontDisplay: 'Cinzel', fontBody: 'Lora', colors: ['#12100e', '#1e1a16', '#8b7355', '#d4c5a9'] },
  { name: 'VAPORWAVE', bg: '#1a0a2e', surface: '#2d1b4e', accent: '#ff6b9d', fontDisplay: 'Rajdhani', fontBody: 'IBM Plex Mono', colors: ['#1a0a2e', '#2d1b4e', '#ff6b9d', '#c4e0ff'] },
  { name: 'MINIMAL WHITE', bg: '#f8f6f4', surface: '#ffffff', accent: '#1a1a1a', fontDisplay: 'Sora', fontBody: 'Inter', colors: ['#f8f6f4', '#ffffff', '#1a1a1a', '#333333'] },
  { name: 'FOREST GLOW', bg: '#0a120a', surface: '#132013', accent: '#4caf50', fontDisplay: 'Exo 2', fontBody: 'Fira Code', colors: ['#0a120a', '#132013', '#4caf50', '#c8e6c9'] },
  { name: 'BLOOD MOON', bg: '#0d0404', surface: '#1a0808', accent: '#ff1744', fontDisplay: 'Archivo Black', fontBody: 'JetBrains Mono', colors: ['#0d0404', '#1a0808', '#ff1744', '#ffcdd2'] },
  { name: 'OCEAN DEEP', bg: '#040d14', surface: '#081a28', accent: '#00bcd4', fontDisplay: 'Unbounded', fontBody: 'Manrope', colors: ['#040d14', '#081a28', '#00bcd4', '#b2ebf2'] },
  { name: 'RETRO ARCADE', bg: '#0a0a0a', surface: '#141414', accent: '#ff5722', fontDisplay: 'Press Start 2P', fontBody: 'Fira Code', colors: ['#0a0a0a', '#141414', '#ff5722', '#ffcc80'] }
];
export function renderPresets() {
  g('preset-grid').innerHTML = PRESETS.map((p, i) => '<div class="preset-card' + (T._preset === i ? ' active' : '') + '" onclick="applyPreset(' + i + ')"><div class="preset-swatches">' + p.colors.map(c => '<span style="background:' + c + '"></span>').join('') + '</div><div class="preset-name">' + p.name + '</div><div class="preset-fonts">' + p.fontDisplay + ' + ' + p.fontBody + '</div></div>').join('');
}
export function applyPreset(idx) {
  const p = PRESETS[idx]; if (!p) return;
  const snaps = JSON.parse(localStorage.getItem('dace-snapshots') || '[]');
  snaps.push({ name: 'Auto-backup antes de ' + p.name, theme: collectTheme(), date: new Date().toISOString() });
  if (snaps.length > 10) snaps.shift();
  localStorage.setItem('dace-snapshots', JSON.stringify(snaps));
  setT({ ...T, ...p, _preset: idx });
  _loadThemeUI(); autoSave(); showToast('Tema: ' + p.name + ' (backup guardado)');
  renderPresets();
  import('./core-ui.js').then(m => { if (m.renderSnapshots) m.renderSnapshots(); });
}

// ═══ SAVE SLOTS ═══
export function renderSaveSlots() {
  g('save-slots').innerHTML = [1, 2, 3].map(i => {
    const s = localStorage.getItem('dace-slot-' + i); const name = s ? JSON.parse(s).name : 'Vacío';
    return '<div class="slot" onclick="slotAction(' + i + ')"><div class="slot-label">Slot ' + i + '</div><div class="slot-name">' + name + '</div></div>';
  }).join('');
}
export function slotAction(i) {
  if (event.shiftKey) { const name = prompt('Nombre:', 'Tema ' + i); if (!name) return; localStorage.setItem('dace-slot-' + i, JSON.stringify({ name, theme: collectTheme() })); showToast('Guardado slot ' + i); renderSaveSlots(); }
  else { const s = localStorage.getItem('dace-slot-' + i); if (!s) { showToast('Slot vacío', true); return; } setT(JSON.parse(s).theme); _loadThemeUI(); autoSave(); showToast('Cargado slot ' + i); }
}

// ═══ CUSTOM THEMES ═══
export function saveCustomTheme() {
  const name = val('custom-theme-name').trim(); if (!name) { showToast('Ponle nombre', true); return; }
  const c = JSON.parse(localStorage.getItem('dace-custom-themes') || '[]');
  c.push({ name, theme: collectTheme() }); localStorage.setItem('dace-custom-themes', JSON.stringify(c));
  showToast('Tema: ' + name); setVal('custom-theme-name', ''); renderCustomThemes();
}
export function renderCustomThemes() {
  const c = JSON.parse(localStorage.getItem('dace-custom-themes') || '[]');
  g('custom-themes-list').innerHTML = c.length ? c.map((t, i) => '<div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid var(--b)"><span style="flex:1;font-size:11px;font-weight:700">' + t.name + '</span><button class="btn btn-g" onclick="loadCustomTheme(' + i + ')" style="font-size:9px">Cargar</button><button class="btn btn-del" onclick="deleteCustomTheme(' + i + ')" style="font-size:9px">✕</button></div>').join('') : '<div style="color:var(--hi);font-size:10px">Sin temas personalizados</div>';
}
export function loadCustomTheme(i) {
  const c = JSON.parse(localStorage.getItem('dace-custom-themes') || '[]'); if (!c[i]) return;
  setT(c[i].theme); _loadThemeUI(); autoSave(); showToast('Tema: ' + c[i].name);
}
export function deleteCustomTheme(i) {
  const c = JSON.parse(localStorage.getItem('dace-custom-themes') || '[]'); c.splice(i, 1);
  localStorage.setItem('dace-custom-themes', JSON.stringify(c)); renderCustomThemes();
}
export function resetTheme() {
  if (!confirm('¿Resetear a DACE DARK?')) return;
  setT({}); localStorage.removeItem('dace-theme');
  if (db) db.ref('theme').remove().then(() => location.reload()); else location.reload();
}

// ═══ GRADIENT EDITOR ═══
let _gradRerenderTimer = 0;
export function renderGradEditor() {
  const wrap = g('grad-stops'); if (!wrap) return;
  const gradCSS = buildGradCSS();
  wrap.innerHTML = '<div style="height:40px;border-radius:var(--rad);border:1px solid var(--b);margin-bottom:8px;position:relative;overflow:hidden;cursor:pointer" id="grad-bar" onclick="addGradStop(event)">'
    + '<div style="width:100%;height:100%;background:linear-gradient(90deg,' + gradCSS + ');transition:background .2s"></div>'
    + _gradStops.map((s, i) => '<div style="position:absolute;left:' + s.pos + '%;top:0;bottom:0;width:12px;margin-left:-6px;cursor:ew-resize;display:flex;flex-direction:column;align-items:center;padding-top:2px" onmousedown="startDragStop(event,' + i + ')"><div style="width:10px;height:10px;border-radius:50%;background:' + s.color + ';border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.5)"></div><div style="width:2px;flex:1;background:rgba(255,255,255,0.5)"></div></div>').join('')
    + '</div><div style="display:flex;flex-direction:column;gap:4px">'
    + _gradStops.map((s, i) => '<div style="display:flex;align-items:center;gap:6px;padding:4px 6px;background:var(--as2);border-radius:var(--rad)"><span style="font-size:9px;color:var(--mu);min-width:16px">' + i + '</span><input type="range" min="0" max="100" value="' + s.pos + '" style="width:70px" oninput="updateGradStop(' + i + ',\'pos\',this.value)"><input type="color" value="' + s.color + '" style="width:22px;height:18px;border:1px solid var(--b);border-radius:3px;padding:0" oninput="updateGradStop(' + i + ',\'color\',this.value)"><input type="range" min="0" max="0.5" step="0.01" value="' + s.opacity + '" style="width:50px" oninput="updateGradStop(' + i + ',\'opacity\',this.value)"><span style="font-size:9px;color:var(--acc);min-width:28px">' + s.opacity.toFixed(2) + '</span><button class="btn btn-del" onclick="rmGradStop(' + i + ')" style="font-size:8px;padding:2px 5px;margin-left:auto">✕</button></div>').join('')
    + '</div>';
}
export function buildGradCSS() {
  const sorted = [..._gradStops].sort((a, b) => a.pos - b.pos);
  return sorted.map(s => 'rgba(' + parseInt(s.color.slice(1, 3), 16) + ',' + parseInt(s.color.slice(3, 5), 16) + ',' + parseInt(s.color.slice(5, 7), 16) + ',' + s.opacity + ') ' + s.pos + '%').join(', ');
}
export function addGradStop(e) {
  const bar = g('grad-bar'); if (!bar) return; const r = bar.getBoundingClientRect();
  const pos = Math.round(((e.clientX - r.left) / r.width) * 100);
  _gradStops.push({ pos, color: '#dc2626', opacity: 0.1 }); renderGradEditor(); applyGradToHero();
}
export function updateGradStop(i, field, v) {
  if (!_gradStops[i]) return;
  _gradStops[i][field] = field === 'pos' ? parseInt(v) : field === 'opacity' ? parseFloat(v) : v;
  clearTimeout(_gradRerenderTimer);
  _gradRerenderTimer = setTimeout(() => { renderGradEditor(); applyGradToHero(); }, field === 'color' ? 300 : 0);
}
export function rmGradStop(i) { _gradStops.splice(i, 1); renderGradEditor(); applyGradToHero(); }
export function startDragStop(e, i) {
  e.preventDefault(); const bar = g('grad-bar'); if (!bar) return; const r = bar.getBoundingClientRect();
  function onMove(ev) { const pos = Math.round(Math.max(0, Math.min(100, ((ev.clientX - r.left) / r.width) * 100))); _gradStops[i].pos = pos; renderGradEditor(); applyGradToHero(); }
  function onUp() { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); }
  document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
}
export function applyGradToHero() {
  const css = buildGradCSS();
  const pvg = g('hpv-grad');
  if (pvg) pvg.style.background = 'radial-gradient(ellipse ' + (parseInt(val('h-grad-w')) || 80) + '% ' + (parseInt(val('h-grad-h')) || 60) + '% at 50% 0%, ' + css + ')';
}
