// ═══ DACEWAV Admin — Command Palette & Keyboard Shortcuts ═══
import { g } from './helpers.js';
import { showSection } from './nav.js';
import { saveAll, undo, redo, toggleFullscreenPreview } from './core.js';
import { openBatchImg } from './beats.js';

const CMD_ITEMS = [];
export function buildCmdIndex() {
  CMD_ITEMS.length = 0;
  const fields = [
    { label: 'Fondo principal', section: 'global', id: 'tc-bg' }, { label: 'Surface', section: 'global', id: 'tc-surface' },
    { label: 'Acento / Color glow', section: 'global', id: 'tc-glow' }, { label: 'Fuente display', section: 'global', id: 't-font-d' },
    { label: 'Fuente cuerpo', section: 'global', id: 't-font-m' }, { label: 'Tamaño fuente', section: 'global', id: 't-font-size' },
    { label: 'Glow activar', section: 'global', id: 't-glow' }, { label: 'Glow tipo', section: 'global', id: 't-glow-type' },
    { label: 'Glow difuminado', section: 'global', id: 't-glow-blur' }, { label: 'Glow intensidad', section: 'global', id: 't-glow-int' },
    { label: 'Glow opacidad', section: 'global', id: 't-glow-op' }, { label: 'Glow animación', section: 'global', id: 't-glow-anim' },
    { label: 'Blur fondo', section: 'global', id: 't-blur' }, { label: 'Opacidad tarjetas', section: 'global', id: 't-card-op' },
    { label: 'Grano', section: 'global', id: 't-grain' }, { label: 'Border radius', section: 'global', id: 't-radius' },
    { label: 'Espaciado secciones', section: 'global', id: 't-pad' }, { label: 'Gap beats', section: 'global', id: 't-gap' },
    { label: 'Hero título', section: 'hero', id: 'h-title' }, { label: 'Hero subtítulo', section: 'hero', id: 'h-sub' },
    { label: 'Hero eyebrow', section: 'hero', id: 'h-eyebrow' }, { label: 'Hero degradado', section: 'hero', id: 'h-grad-on' },
    { label: 'Hero tamaño título', section: 'hero', id: 'h-title-size' }, { label: 'Hero glow palabra', section: 'hero', id: 'h-stroke-on' },
    { label: 'Partículas activar', section: 'hero', id: 'p-on' }, { label: 'Partículas color', section: 'hero', id: 'p-color' },
    { label: 'Partículas cantidad', section: 'hero', id: 'p-count' }, { label: 'Partículas tipo', section: 'hero', id: 'p-type' },
    { label: 'Banner activar', section: 'hero', id: 'b-active' }, { label: 'Banner texto', section: 'hero', id: 'b-text' },
    { label: 'Banner animación', section: 'hero', id: 'b-anim' },
    { label: 'Logo URL', section: 'layout', id: 't-logo-url' }, { label: 'Logo ancho', section: 'layout', id: 't-logo-w' },
    { label: 'Logo escala', section: 'layout', id: 't-logo-scale' }, { label: 'Hero top', section: 'layout', id: 't-hero-top' },
    { label: 'Player bottom', section: 'layout', id: 't-player-bot' },
    { label: 'Waveform color', section: 'elements', id: 'tt-wbar' }, { label: 'Waveform activo', section: 'elements', id: 'tt-wbar-a' },
    { label: 'Botón color', section: 'elements', id: 'tt-btn-clr' }, { label: 'Botón borde', section: 'elements', id: 'tt-btn-bdr' },
    { label: 'Botón fondo', section: 'elements', id: 'tt-btn-bg' },
    { label: 'Nombre sitio', section: 'settings', id: 's-name' }, { label: 'WhatsApp', section: 'settings', id: 's-wa' },
    { label: 'Instagram', section: 'settings', id: 's-ig' }, { label: 'Email', section: 'settings', id: 's-email' },
    { label: '🖼️ Batch subir imágenes', section: 'actions', id: '__batchImg', action: () => openBatchImg() },
    { label: '💾 Guardar todo', section: 'actions', id: '__save', action: () => saveAll() },
    { label: '📤 Exportar datos', section: 'actions', id: '__export', action: () => window.exportAll && window.exportAll() }
  ];
  fields.forEach(f => CMD_ITEMS.push(f));
}
export function openCmdPalette() { g('cmd-overlay').classList.add('open'); g('cmd-input').value = ''; g('cmd-input').focus(); filterCmds(''); }
export function closeCmdPalette() { g('cmd-overlay').classList.remove('open'); }
export function filterCmds(q) {
  const results = g('cmd-results'); q = q.toLowerCase();
  const matches = q ? CMD_ITEMS.filter(c => c.label.toLowerCase().includes(q)) : CMD_ITEMS.slice(0, 15);
  results.innerHTML = matches.length ? matches.map(c => {
    const icons = { global: 'fa-globe', hero: 'fa-star', layout: 'fa-th-large', elements: 'fa-shopping-bag', settings: 'fa-cog', actions: 'fa-bolt' };
    if (c.action) return '<div class="cmd-item" onclick="execCmdAction(' + CMD_ITEMS.indexOf(c) + ')"><div class="cmd-item-icon"><i class="fas ' + (icons[c.section] || 'fa-cog') + '"></i></div><div><div class="cmd-item-label">' + c.label + '</div><div class="cmd-item-section">' + c.section + '</div></div></div>';
    return '<div class="cmd-item" onclick="jumpToCmd(\'' + c.section + '\',\'' + c.id + '\')"><div class="cmd-item-icon"><i class="fas ' + (icons[c.section] || 'fa-cog') + '"></i></div><div><div class="cmd-item-label">' + c.label + '</div><div class="cmd-item-section">' + c.section + '</div></div></div>';
  }).join('') : '<div class="cmd-empty">Sin resultados</div>';
}
export function execCmdAction(idx) { closeCmdPalette(); if (CMD_ITEMS[idx] && CMD_ITEMS[idx].action) CMD_ITEMS[idx].action(); }
export function jumpToCmd(section, id) {
  closeCmdPalette(); showSection(section); const el = g(id);
  if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.focus(); setTimeout(() => { el.style.outline = '2px solid var(--acc)'; setTimeout(() => el.style.outline = '', 1500); }, 300); }
}
export function openKbdPanel() { g('kbd-overlay').classList.add('open'); }
export function closeKbdPanel() { g('kbd-overlay').classList.remove('open'); }

document.addEventListener('keydown', e => {
  var inInput = e.target.matches('input,textarea,select,[contenteditable]');
  if (e.ctrlKey && e.key === 'k') { e.preventDefault(); openCmdPalette(); }
  if (e.ctrlKey && e.key === '/') { e.preventDefault(); openKbdPanel(); }
  if (e.key === 'Escape') { closeCmdPalette(); closeKbdPanel(); if (window.closeQRPanel) window.closeQRPanel(); }
  if (e.ctrlKey && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
  if (e.ctrlKey && e.shiftKey && e.key === 'Z') { e.preventDefault(); redo(); }
  if (e.ctrlKey && e.key === 's') { e.preventDefault(); saveAll(); }
  if (!inInput && !e.ctrlKey && !e.altKey) {
    if (e.key === '1') { e.preventDefault(); showSection('global'); }
    if (e.key === '2') { e.preventDefault(); showSection('hero'); }
    if (e.key === '3') { e.preventDefault(); showSection('beats'); }
    if (e.key === '4') { e.preventDefault(); showSection('themes'); }
    if (e.key === '5') { e.preventDefault(); showSection('settings'); }
  }
  if (e.ctrlKey && !e.shiftKey && !e.altKey) {
    const map = { '1': 'global', '2': 'hero', '3': 'layout', '4': 'beats', '5': 'elements', '6': 'animations', '7': 'themes', '8': 'settings' };
    if (map[e.key]) { e.preventDefault(); showSection(map[e.key]); }
  }
  if (e.ctrlKey && e.key === 'i' && !e.target.matches('input,textarea,select')) { e.preventDefault(); if (window.openBatchImg) window.openBatchImg(); }
  if (e.key === 'f' && !e.ctrlKey && !e.target.matches('input,textarea,select')) { toggleFullscreenPreview(); }
});

Object.assign(window, {
  buildCmdIndex, openCmdPalette, closeCmdPalette, filterCmds, execCmdAction, jumpToCmd,
  openKbdPanel, closeKbdPanel
});
