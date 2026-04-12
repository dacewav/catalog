// ═══ DACEWAV Admin — Theme Presets, Slots, Anim Controls ═══
import { ANIMS } from './config.js';
import { db, T, setT } from './state.js';
import { g, val, setVal, showToast, sv, confirmInline, promptInline } from './helpers.js';
import { renderSnapshots } from './snapshots.js';

let _collectTheme, _loadThemeUI, _autoSave, _broadcastThemeNow;

export function setPresetDeps({ collectTheme, loadThemeUI, autoSave, broadcastThemeNow }) {
  _collectTheme = collectTheme;
  _loadThemeUI = loadThemeUI;
  _autoSave = autoSave;
  _broadcastThemeNow = broadcastThemeNow;
}

export function buildAnimControls() {
  const els = [{ key: 'logo', label: 'Logo' }, { key: 'title', label: 'Título Hero' }, { key: 'cards', label: 'Tarjetas' }, { key: 'player', label: 'Player' }, { key: 'buttons', label: 'Botones' }, { key: 'waveform', label: 'Waveform' }];
  const sel = ANIMS.map(a => '<option value="' + a + '">' + (a === 'none' ? 'Ninguna' : a) + '</option>').join('');
  g('anim-controls').innerHTML = els.map(el => '<div class="anim-ed"><div class="anim-ed-title">' + el.label + '</div><div class="fg3"><div class="field"><label>Tipo</label><select data-ak="' + el.key + '" data-af="type" onchange="autoSave()">' + sel + '</select></div><div class="field"><label>Velocidad</label><div class="slider-wrap"><input type="range" min="0.5" max="8" step="0.1" value="2" data-ak="' + el.key + '" data-af="dur" oninput="this.nextElementSibling.textContent=parseFloat(this.value).toFixed(1)+\'s\';_autoSave()"><span class="slider-val">2.0s</span></div></div><div class="field"><label>Delay</label><div class="slider-wrap"><input type="range" min="0" max="5" step="0.1" value="0" data-ak="' + el.key + '" data-af="del" oninput="this.nextElementSibling.textContent=parseFloat(this.value).toFixed(1)+\'s\';_autoSave()"><span class="slider-val">0.0s</span></div></div></div></div>').join('');
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

// ═══ PRESETS ═══
const PRESETS = [
  { name: 'DACE DARK', bg: '#060404', surface: '#0f0808', surface2: '#1a0c0c', accent: '#dc2626', text: '#f5eeee', muted: 'rgba(245,238,238,0.5)', hint: 'rgba(245,238,238,0.2)', border: 'rgba(255,255,255,0.06)', border2: 'rgba(255,255,255,0.12)', red: '#7f1d1d', redL: '#991b1b', fontDisplay: 'Syne', fontBody: 'DM Mono', glowColor: '#dc2626', colors: ['#060404', '#0f0808', '#dc2626', '#f5eeee'] },
  { name: 'VINTAGE TAPE', bg: '#1a1510', surface: '#2a2218', surface2: '#3a3228', accent: '#c4954a', text: '#e8dcc8', muted: 'rgba(232,220,200,0.55)', hint: 'rgba(232,220,200,0.2)', border: 'rgba(255,240,200,0.08)', border2: 'rgba(255,240,200,0.15)', red: '#8b6914', redL: '#c4954a', fontDisplay: 'Bebas Neue', fontBody: 'Lora', glowColor: '#c4954a', colors: ['#1a1510', '#2a2218', '#c4954a', '#e8dcc8'] },
  { name: 'NEON PUNK', bg: '#0a0014', surface: '#160030', surface2: '#220050', accent: '#e040fb', text: '#f0e6ff', muted: 'rgba(240,230,255,0.5)', hint: 'rgba(240,230,255,0.2)', border: 'rgba(224,64,251,0.08)', border2: 'rgba(224,64,251,0.18)', red: '#7b1fa2', redL: '#e040fb', fontDisplay: 'Anton', fontBody: 'Space Mono', glowColor: '#e040fb', colors: ['#0a0014', '#160030', '#e040fb', '#f0e6ff'] },
  { name: 'CYBERPUNK', bg: '#0d0d0d', surface: '#1a1a1a', surface2: '#2a2a2a', accent: '#fcee09', text: '#e0e0e0', muted: 'rgba(224,224,224,0.5)', hint: 'rgba(224,224,224,0.2)', border: 'rgba(252,238,9,0.06)', border2: 'rgba(252,238,9,0.15)', red: '#b8a900', redL: '#fcee09', fontDisplay: 'Orbitron', fontBody: 'Share Tech Mono', glowColor: '#fcee09', colors: ['#0d0d0d', '#1a1a1a', '#fcee09', '#00fff5'] },
  { name: 'PASTEL WAVE', bg: '#1e1a2e', surface: '#2d2640', surface2: '#3d3656', accent: '#ff8fa3', text: '#f0e6ff', muted: 'rgba(240,230,255,0.5)', hint: 'rgba(240,230,255,0.2)', border: 'rgba(255,143,163,0.08)', border2: 'rgba(255,143,163,0.15)', red: '#9c2750', redL: '#ff8fa3', fontDisplay: 'Comfortaa', fontBody: 'Quicksand', glowColor: '#ff8fa3', colors: ['#1e1a2e', '#2d2640', '#ff8fa3', '#f0e6ff'] },
  { name: 'DARK ACADEMIA', bg: '#12100e', surface: '#1e1a16', surface2: '#2e2a24', accent: '#8b7355', text: '#d4c5a9', muted: 'rgba(212,197,169,0.55)', hint: 'rgba(212,197,169,0.2)', border: 'rgba(139,115,85,0.08)', border2: 'rgba(139,115,85,0.18)', red: '#5c4a2f', redL: '#8b7355', fontDisplay: 'Cinzel', fontBody: 'Lora', glowColor: '#8b7355', colors: ['#12100e', '#1e1a16', '#8b7355', '#d4c5a9'] },
  { name: 'VAPORWAVE', bg: '#1a0a2e', surface: '#2d1b4e', surface2: '#3d2b60', accent: '#ff6b9d', text: '#c4e0ff', muted: 'rgba(196,224,255,0.5)', hint: 'rgba(196,224,255,0.2)', border: 'rgba(255,107,157,0.08)', border2: 'rgba(255,107,157,0.15)', red: '#9c2750', redL: '#ff6b9d', fontDisplay: 'Rajdhani', fontBody: 'IBM Plex Mono', glowColor: '#ff6b9d', colors: ['#1a0a2e', '#2d1b4e', '#ff6b9d', '#c4e0ff'] },
  { name: 'MINIMAL WHITE', bg: '#f8f6f4', surface: '#ffffff', surface2: '#f0ece8', accent: '#1a1a1a', text: '#1a1a1a', muted: 'rgba(26,20,20,0.55)', hint: 'rgba(26,20,20,0.2)', border: 'rgba(0,0,0,0.07)', border2: 'rgba(0,0,0,0.14)', red: '#333333', redL: '#1a1a1a', fontDisplay: 'Sora', fontBody: 'Inter', glowColor: '#1a1a1a', colors: ['#f8f6f4', '#ffffff', '#1a1a1a', '#333333'] },
  { name: 'FOREST GLOW', bg: '#0a120a', surface: '#132013', surface2: '#1e301e', accent: '#4caf50', text: '#c8e6c9', muted: 'rgba(200,230,200,0.5)', hint: 'rgba(200,230,200,0.2)', border: 'rgba(76,175,80,0.08)', border2: 'rgba(76,175,80,0.15)', red: '#2e7d32', redL: '#4caf50', fontDisplay: 'Exo 2', fontBody: 'Fira Code', glowColor: '#4caf50', colors: ['#0a120a', '#132013', '#4caf50', '#c8e6c9'] },
  { name: 'BLOOD MOON', bg: '#0d0404', surface: '#1a0808', surface2: '#2a1010', accent: '#ff1744', text: '#ffcdd2', muted: 'rgba(255,205,210,0.5)', hint: 'rgba(255,205,210,0.2)', border: 'rgba(255,23,68,0.08)', border2: 'rgba(255,23,68,0.18)', red: '#b71c1c', redL: '#ff1744', fontDisplay: 'Archivo Black', fontBody: 'JetBrains Mono', glowColor: '#ff1744', colors: ['#0d0404', '#1a0808', '#ff1744', '#ffcdd2'] },
  { name: 'OCEAN DEEP', bg: '#040d14', surface: '#081a28', surface2: '#0e2838', accent: '#00bcd4', text: '#b2ebf2', muted: 'rgba(178,235,242,0.5)', hint: 'rgba(178,235,242,0.2)', border: 'rgba(0,188,212,0.08)', border2: 'rgba(0,188,212,0.15)', red: '#00838f', redL: '#00bcd4', fontDisplay: 'Unbounded', fontBody: 'Manrope', glowColor: '#00bcd4', colors: ['#040d14', '#081a28', '#00bcd4', '#b2ebf2'] },
  { name: 'RETRO ARCADE', bg: '#0a0a0a', surface: '#141414', surface2: '#222222', accent: '#ff5722', text: '#ffcc80', muted: 'rgba(255,204,128,0.5)', hint: 'rgba(255,204,128,0.2)', border: 'rgba(255,87,34,0.08)', border2: 'rgba(255,87,34,0.15)', red: '#bf360c', redL: '#ff5722', fontDisplay: 'Press Start 2P', fontBody: 'Fira Code', glowColor: '#ff5722', colors: ['#0a0a0a', '#141414', '#ff5722', '#ffcc80'] }
];
export function renderPresets() {
  g('preset-grid').innerHTML = PRESETS.map((p, i) => '<div class="preset-card' + (T._preset === i ? ' active' : '') + '" onclick="applyPreset(' + i + ')"><div class="preset-swatches">' + p.colors.map(c => '<span style="background:' + c + '"></span>').join('') + '</div><div class="preset-name">' + p.name + '</div><div class="preset-fonts">' + p.fontDisplay + ' + ' + p.fontBody + '</div></div>').join('');
}
export function applyPreset(idx) {
  const p = PRESETS[idx]; if (!p) return;
  const snaps = JSON.parse(localStorage.getItem('dace-snapshots') || '[]');
  snaps.push({ name: 'Auto-backup antes de ' + p.name, theme: _collectTheme(), date: new Date().toISOString() });
  if (snaps.length > 10) snaps.shift();
  localStorage.setItem('dace-snapshots', JSON.stringify(snaps));
  // Apply preset with complete theme override — keep user's effect/layout settings, override colors
  setT({ ...T, ...p, _preset: idx });
  _loadThemeUI(); _autoSave(); showToast('Tema: ' + p.name + ' (backup guardado)');
  renderPresets(); renderSnapshots();
  // Force broadcast to iframe
  _broadcastThemeNow();
}

// ═══ SAVE SLOTS ═══
export function renderSaveSlots() {
  g('save-slots').innerHTML = [1, 2, 3].map(i => {
    const s = localStorage.getItem('dace-slot-' + i); const name = s ? JSON.parse(s).name : 'Vacío';
    return '<div class="slot" onclick="slotAction(' + i + ')"><div class="slot-label">Slot ' + i + '</div><div class="slot-name">' + name + '</div></div>';
  }).join('');
}
export async function slotAction(i) {
  if (event.shiftKey) { const name = await promptInline('Nombre:', 'Tema ' + i); if (!name) return; localStorage.setItem('dace-slot-' + i, JSON.stringify({ name, theme: _collectTheme() })); showToast('Guardado slot ' + i); renderSaveSlots(); }
  else { const s = localStorage.getItem('dace-slot-' + i); if (!s) { showToast('Slot vacío', true); return; } setT(JSON.parse(s).theme); _loadThemeUI(); _autoSave(); showToast('Cargado slot ' + i); }
}

// ═══ CUSTOM THEMES ═══
export function saveCustomTheme() {
  const name = val('custom-theme-name').trim(); if (!name) { showToast('Ponle nombre', true); return; }
  const c = JSON.parse(localStorage.getItem('dace-custom-themes') || '[]');
  c.push({ name, theme: _collectTheme() }); localStorage.setItem('dace-custom-themes', JSON.stringify(c));
  showToast('Tema: ' + name); setVal('custom-theme-name', ''); renderCustomThemes();
}
export function renderCustomThemes() {
  const c = JSON.parse(localStorage.getItem('dace-custom-themes') || '[]');
  g('custom-themes-list').innerHTML = c.length ? c.map((t, i) => '<div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid var(--b)"><span style="flex:1;font-size:11px;font-weight:700">' + t.name + '</span><button class="btn btn-g" onclick="loadCustomTheme(' + i + ')" style="font-size:9px">Cargar</button><button class="btn btn-del" onclick="deleteCustomTheme(' + i + ')" style="font-size:9px">✕</button></div>').join('') : '<div style="color:var(--hi);font-size:10px">Sin temas personalizados</div>';
}
export function loadCustomTheme(i) {
  const c = JSON.parse(localStorage.getItem('dace-custom-themes') || '[]'); if (!c[i]) return;
  setT(c[i].theme); _loadThemeUI(); _autoSave(); showToast('Tema: ' + c[i].name);
}
export function deleteCustomTheme(i) {
  const c = JSON.parse(localStorage.getItem('dace-custom-themes') || '[]'); c.splice(i, 1);
  localStorage.setItem('dace-custom-themes', JSON.stringify(c)); renderCustomThemes();
}
export async function resetTheme() {
  if (!await confirmInline('¿Resetear a DACE DARK?')) return;
  setT({}); localStorage.removeItem('dace-theme');
  if (db) db.ref('theme').remove().then(() => location.reload()); else location.reload();
}

// ═══ PARTICLES ═══
// Particles → src/admin/particles.js

// Emoji system → src/admin/emojis.js

// ═══ TEXT COLORIZER ═══
// Text colorizer → src/admin/text-colorizer.js
// Export/Import/CSS → src/admin/export.js

// ═══ WINDOW ASSIGNMENTS (only functions defined in this file) ═══
Object.assign(window, {
  buildAnimControls, collectAnim, loadAnimValues,
  renderPresets, applyPreset,
  renderSaveSlots, slotAction,
  saveCustomTheme, renderCustomThemes, loadCustomTheme, deleteCustomTheme, resetTheme
});
