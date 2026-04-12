// ═══ DACEWAV Admin — Trash / Recycle Bin ═══
// Deleted images, audio, previews go here before permanent deletion.

import { db, allBeats } from './state.js';
import { g, showToast, showSaving, confirmInline } from './helpers.js';

// ═══ State ═══
let _trash = [];
let _trashFilter = 'all';

// Load from localStorage
function _loadTrash() {
  try { _trash = JSON.parse(localStorage.getItem('dace-trash') || '[]'); } catch { _trash = []; }
}

function _saveTrash() {
  localStorage.setItem('dace-trash', JSON.stringify(_trash));
}

// ═══ Public API ═══

// Move an item to trash
// type: 'image' | 'audio' | 'preview'
export function trashItem(beatId, beatName, type, url, fileName) {
  if (!url) return;
  _loadTrash();
  _trash.unshift({
    id: 't_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    beatId: beatId || '',
    beatName: beatName || '',
    type: type || 'image',
    url: url,
    fileName: fileName || '',
    deletedAt: new Date().toISOString()
  });
  _saveTrash();
  _updateTrashBadge();
  showToast('Movido a papelera');
}

// Remove from beat and move to trash
export async function trashBeatImage(beatId) {
  const beat = allBeats.find(b => b.id === beatId);
  if (!beat || !beat.imageUrl) { showToast('No hay imagen', true); return; }
  trashItem(beatId, beat.name, 'image', beat.imageUrl, 'cover');
  // Clear from beat
  beat.imageUrl = '';
  if (db) await db.ref('beats/' + beatId + '/imageUrl').set('').catch(() => {});
  showToast('Imagen eliminada ✓');
}

// Restore item to its beat
export async function restoreItem(itemId) {
  _loadTrash();
  const idx = _trash.findIndex(t => t.id === itemId);
  if (idx < 0) return;
  const item = _trash[idx];

  if (item.beatId && db) {
    const fieldMap = { image: 'imageUrl', audio: 'audioUrl', preview: 'previewUrl' };
    const field = fieldMap[item.type];
    if (field) {
      await db.ref('beats/' + item.beatId + '/' + field).set(item.url).catch(() => {});
    }
    showToast('Restaurado a ' + (item.beatName || item.beatId));
  } else {
    showToast('Restaurado (sin beat asociado)');
  }

  _trash.splice(idx, 1);
  _saveTrash();
  _updateTrashBadge();
  renderTrash();
}

// Permanently delete item
export async function permDeleteItem(itemId) {
  _loadTrash();
  const idx = _trash.findIndex(t => t.id === itemId);
  if (idx < 0) return;
  const item = _trash[idx];
  if (!await confirmInline('¿Eliminar definitivamente?\n' + (item.fileName || item.type))) return;
  _trash.splice(idx, 1);
  _saveTrash();
  _updateTrashBadge();
  renderTrash();
  showToast('Eliminado definitivamente');
}

// Empty entire trash
export async function emptyTrash() {
  _loadTrash();
  if (!_trash.length) { showToast('La papelera ya está vacía'); return; }
  if (!await confirmInline('¿Vaciar papelera? ' + _trash.length + ' elementos se eliminarán definitivamente')) return;
  _trash = [];
  _saveTrash();
  _updateTrashBadge();
  renderTrash();
  showToast('Papelera vaciada');
}

// Filter
export function filterTrash(filter, btn) {
  _trashFilter = filter;
  document.querySelectorAll('.trash-filter').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderTrash();
}

// ═══ Render ═══
export function renderTrash() {
  _loadTrash();
  const list = g('trash-list');
  if (!list) return;
  _updateTrashBadge();

  const filtered = _trashFilter === 'all' ? _trash : _trash.filter(t => t.type === _trashFilter);

  if (!filtered.length) {
    list.innerHTML = '<div style="color:var(--hi);font-size:10px;text-align:center;padding:20px 0">'
      + (_trash.length ? 'Sin resultados para este filtro' : '🗑️ La papelera está vacía') + '</div>';
    return;
  }

  list.innerHTML = filtered.map(item => {
    const typeIcon = { image: '🖼', audio: '🎵', preview: '🎧' }[item.type] || '📄';
    const date = new Date(item.deletedAt);
    const timeAgo = _timeAgo(date);
    const isImage = item.type === 'image';
    const thumb = isImage && item.url ? '<img src="' + item.url + '" style="width:40px;height:40px;border-radius:4px;object-fit:cover;border:1px solid var(--b)">' : '<div style="width:40px;height:40px;border-radius:4px;background:var(--as2);display:flex;align-items:center;justify-content:center;font-size:16px">' + typeIcon + '</div>';

    return '<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--b)">'
      + thumb
      + '<div style="flex:1;min-width:0">'
      + '<div style="font-size:10px;font-weight:600;color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + (item.beatName || item.beatId || 'Sin beat') + '</div>'
      + '<div style="font-size:8px;color:var(--mu)">' + typeIcon + ' ' + item.type + ' · ' + timeAgo + '</div>'
      + '</div>'
      + '<div style="display:flex;gap:4px;flex-shrink:0">'
      + '<button class="btn btn-g" onclick="restoreItem(\'' + item.id + '\')" title="Restaurar" style="font-size:9px;padding:3px 8px">♻️</button>'
      + '<button class="btn btn-del" onclick="permDeleteItem(\'' + item.id + '\')" title="Eliminar definitivamente" style="font-size:9px;padding:3px 8px">✕</button>'
      + '</div>'
      + '</div>';
  }).join('');
}

function _updateTrashBadge() {
  const el = g('trash-count');
  if (el) el.textContent = _trash.length ? _trash.length + ' elementos' : '';
  // Update sidebar badge
  const si = document.querySelector('.si[data-s="trash"]');
  if (si) {
    let badge = si.querySelector('.trash-badge');
    if (_trash.length) {
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'trash-badge';
        badge.style.cssText = 'position:absolute;top:2px;right:4px;background:var(--acc);color:#fff;font-size:7px;padding:1px 4px;border-radius:8px;font-weight:700;min-width:14px;text-align:center';
        si.style.position = 'relative';
        si.appendChild(badge);
      }
      badge.textContent = _trash.length;
    } else if (badge) {
      badge.remove();
    }
  }
}

function _timeAgo(date) {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return 'ahora';
  if (s < 3600) return Math.floor(s / 60) + 'm';
  if (s < 86400) return Math.floor(s / 3600) + 'h';
  return Math.floor(s / 86400) + 'd';
}

// Init badge on load
_loadTrash();

// ═══ Window assignments ═══
Object.assign(window, {
  trashItem, trashBeatImage, restoreItem, permDeleteItem,
  emptyTrash, filterTrash, renderTrash
});
