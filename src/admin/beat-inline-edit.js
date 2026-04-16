// ═══ DACEWAV Admin — Beat Inline Edit ═══
// Click-to-edit fields directly in the beat list

import { db, allBeats } from './state.js';
import { showToast, showSaving } from './helpers.js';

function _inlineEdit(el, id, field, parse) {
  if (el.querySelector('input')) return;
  const beat = allBeats.find(b => b.id === id); if (!beat) return;
  const orig = field === 'bpm' ? String(beat.bpm) : field === 'key' ? beat.key : beat.name;
  const inp = document.createElement('input'); inp.className = 'beat-inline-edit'; inp.value = orig;
  inp.style.maxWidth = field === 'name' ? '200px' : '80px';
  el.innerHTML = ''; el.appendChild(inp); inp.focus(); inp.select();
  function save() {
    const val2 = parse ? parse(inp.value) : inp.value.trim();
    if (val2 !== null && val2 !== orig) {
      beat[field] = val2;
      showSaving(true);
      db.ref('beats/' + id + '/' + field).set(val2)
        .then(() => { showSaving(false); showToast('Actualizado ✓'); })
        .catch(err => { showSaving(false); showToast('Error', true); });
    }
    window.renderBeatList();
  }
  inp.addEventListener('blur', save);
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); save(); }
    if (e.key === 'Escape') { window.renderBeatList(); }
  });
}

export function inlineEditName(el, id) { _inlineEdit(el, id, 'name', v => { const s = v.trim(); return s ? s : null; }); }
export function inlineEditBpm(el, id) { _inlineEdit(el, id, 'bpm', v => { const n = parseInt(v); return (n > 0 && n < 400) ? n : null; }); }
export function inlineEditKey(el, id) { _inlineEdit(el, id, 'key', v => { const s = v.trim().toUpperCase(); return s ? s : null; }); }
