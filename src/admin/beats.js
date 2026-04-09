// ═══ DACEWAV Admin — Beats CRUD ═══
import { db, allBeats, setAllBeats, editId, setEditId, defLics, _edLics, setEdLics, _dragBeatId, setDragBeatId, _batchImgQueue, setBatchImgQueue } from './state.js';
import { g, val, setVal, checked, setChecked, showToast, showSaving } from './helpers.js';
import { showSection } from './nav.js';
import { autoSave } from './core.js';
import { R2_ENABLED, uploadToR2 } from './r2.js';

let _beatSearchQuery = '';
export function filterBeatList(q) { _beatSearchQuery = (q || '').trim().toLowerCase(); renderBeatList(); }

export function renderBeatList() {
  const list = g('beat-list');
  var beats = allBeats;
  if (_beatSearchQuery) beats = beats.filter(b => (b.name + ' ' + b.genre + ' ' + b.key + ' ' + (b.tags || []).join(' ')).toLowerCase().includes(_beatSearchQuery));
  if (!beats.length) { list.innerHTML = '<div style="color:var(--hi);padding:12px 0">' + (allBeats.length ? 'Sin resultados' : 'No hay beats') + '</div>'; const sc = g('beat-search-count'); if (sc) sc.textContent = allBeats.length ? '0 de ' + allBeats.length : ''; return; }
  const sc = g('beat-search-count'); if (sc) sc.textContent = _beatSearchQuery ? beats.length + ' de ' + allBeats.length : allBeats.length + ' beats';
  list.innerHTML = beats.map((b, i) => {
    const badges = []; if (b.featured) badges.push('TOP'); if (b.exclusive) badges.push('EXCL'); if (b.active === false) badges.push('OFF');
    const img = b.imageUrl ? '<img src="' + b.imageUrl + '">' : '♪';
    return '<div class="beat-row" draggable="true" data-id="' + b.id + '" ondragstart="dragStart(event)" ondragover="dragOver(event)" ondrop="dropBeat(event)" ondragend="dragEnd(event)" onclick="openEditor(\'' + b.id + '\')"><span class="drag-handle" onclick="event.stopPropagation()">⠿</span><div class="beat-row-thumb">' + img + '</div><div><div class="beat-row-name" data-editable ondblclick="event.stopPropagation();inlineEditName(this,\'' + b.id + '\')">' + b.name + (badges.length ? ' <span style="font-size:8px;color:var(--acc)">' + badges.join(' ') + '</span>' : '') + '</div><div class="beat-row-meta"><span data-editable ondblclick="event.stopPropagation();inlineEditBpm(this,\'' + b.id + '\')">' + b.bpm + ' BPM</span> · <span data-editable ondblclick="event.stopPropagation();inlineEditKey(this,\'' + b.id + '\')">' + b.key + '</span> · ' + b.genre + '</div></div><div class="beat-row-acts"><button class="btn" onclick="event.stopPropagation();openEditor(\'' + b.id + '\')" style="font-size:9px;padding:3px 8px">✎</button><button class="btn btn-del" onclick="event.stopPropagation();quickDel(\'' + b.id + '\')" style="font-size:9px;padding:3px 8px">✕</button></div></div>';
  }).join('');
}

// Drag & Drop
export function dragStart(e) { setDragBeatId(e.currentTarget.dataset.id); e.currentTarget.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; }
export function dragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; document.querySelectorAll('.beat-row.drag-over').forEach(r => r.classList.remove('drag-over')); e.currentTarget.classList.add('drag-over'); }
export function dropBeat(e) {
  e.preventDefault(); document.querySelectorAll('.beat-row.drag-over').forEach(r => r.classList.remove('drag-over'));
  const targetId = e.currentTarget.dataset.id; if (!_dragBeatId || _dragBeatId === targetId) return;
  const fromIdx = allBeats.findIndex(b => b.id === _dragBeatId); const toIdx = allBeats.findIndex(b => b.id === targetId);
  if (fromIdx < 0 || toIdx < 0) return;
  const moved = allBeats.splice(fromIdx, 1)[0]; allBeats.splice(toIdx, 0, moved);
  allBeats.forEach((b, i) => b.order = i); renderBeatList();
  const updates = {}; allBeats.forEach(b => { updates[b.id + '/order'] = b.order; });
  try { db.ref('beats').update(updates); showToast('Orden actualizado'); } catch (e) {}
}
export function dragEnd(e) { e.currentTarget.classList.remove('dragging'); setDragBeatId(null); }

// Editor
export function openEditor(id) {
  setEditId(id); showSection('add');
  g('editor-title').innerHTML = '<i class="fas fa-edit"></i> ' + (id ? 'Editar' : 'Nuevo') + ' beat';
  g('btn-del').style.display = id ? 'inline-flex' : 'none';
  const idField = g('f-id');
  if (idField) { idField.readOnly = !!id; idField.style.opacity = id ? '0.5' : '1'; idField.style.cursor = id ? 'not-allowed' : 'text'; }
  if (id) {
    const b = allBeats.find(x => x.id === id); if (!b) return;
    setVal('f-id', b.id); setVal('f-name', b.name); setVal('f-genre', b.genre || 'Trap'); setVal('f-genre-c', b.genreCustom || '');
    setVal('f-bpm', b.bpm || ''); setVal('f-key', b.key || ''); setVal('f-desc', b.description || ''); setVal('f-tags', (b.tags || []).join(', '));
    setVal('f-img', b.imageUrl || ''); setVal('f-audio', b.audioUrl || ''); setVal('f-prev', b.previewUrl || '');
    setVal('f-spotify', b.spotify || ''); setVal('f-youtube', b.youtube || ''); setVal('f-soundcloud', b.soundcloud || '');
    setVal('f-date', b.date || ''); setVal('f-order', b.order || 0); setVal('f-plays', b.plays || 0);
    setChecked('f-feat', b.featured); setChecked('f-excl', b.exclusive); setChecked('f-active', b.active !== false); setChecked('f-avail', b.available !== false);
    renderLicEditor(b.licenses || []);
  } else {
    ['f-id', 'f-name', 'f-genre-c', 'f-bpm', 'f-key', 'f-desc', 'f-tags', 'f-img', 'f-audio', 'f-prev', 'f-spotify', 'f-youtube', 'f-soundcloud', 'f-date'].forEach(id => setVal(id, ''));
    setVal('f-order', 0); setVal('f-plays', 0); setChecked('f-feat', false); setChecked('f-excl', false); setChecked('f-active', true); setChecked('f-avail', true);
    g('f-genre').value = 'Trap';
    renderLicEditor(defLics.length ? JSON.parse(JSON.stringify(defLics)) : []);
  }
  prevImg();
  document.querySelectorAll('#sec-add .et').forEach((t, i) => t.classList.toggle('on', i === 0));
  document.querySelectorAll('#sec-add .etp').forEach((p, i) => p.classList.toggle('on', i === 0));
}

// License Editor
function renderLicEditor(lics) {
  g('le-editor').innerHTML = lics.map((l, i) => '<div class="lic-ed-row" data-idx="' + i + '"><div class="lic-ed-grid"><input type="text" placeholder="Nombre" value="' + (l.name || '') + '" onchange="upLic(' + i + ',\'name\',this.value)"><input type="number" placeholder="MXN" value="' + (l.priceMXN || '') + '" onchange="upLic(' + i + ',\'mxn\',this.value)"><input type="number" placeholder="USD" value="' + (l.priceUSD || '') + '" onchange="upLic(' + i + ',\'usd\',this.value)"></div><input type="text" placeholder="Descripción" value="' + (l.description || '') + '" style="font-size:10px" onchange="upLic(' + i + ',\'desc\',this.value)"><button class="btn btn-del" style="margin-top:4px;font-size:9px" onclick="rmLic(' + i + ')">✕</button></div>').join('');
}
export function upLic(idx, field, value) { collectLics(); autoSave(); }
export function addLicRow() { collectLics(); _edLics.push({ name: '', priceMXN: 0, priceUSD: 0, description: '' }); renderLicEditor(_edLics); }
export function rmLic(idx) { collectLics(); _edLics.splice(idx, 1); renderLicEditor(_edLics); }
function collectLics() { const lics = []; g('le-editor').querySelectorAll('.lic-ed-row').forEach(row => { const inp = row.querySelectorAll('input'); lics.push({ name: inp[0].value, priceMXN: parseFloat(inp[1].value) || 0, priceUSD: parseFloat(inp[2].value) || 0, description: inp[3].value }); }); setEdLics(lics); }
export function loadDefaultLics() { renderLicEditor(JSON.parse(JSON.stringify(defLics))); showToast('Licencias base cargadas'); }

// Upload helpers
function prevImg() { const url = val('f-img'); g('img-prev').innerHTML = url ? '<img src="' + url + '" style="max-width:160px;max-height:100px;border-radius:6px;border:1px solid var(--b)">' : ''; }
export function uploadBeatImg(input) {
  const file = input.files[0]; if (!file) return;
  if (!R2_ENABLED) { showToast('R2 Worker no configurado.', true); input.value = ''; return; }
  const beatId = editId || ('beat_' + Date.now());
  const btn = input.parentElement.querySelector('button'); btn.disabled = true; btn.textContent = '⏳'; showSaving(true);
  uploadToR2(file, 'beats/' + beatId + '/cover-' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_'))
    .then(r => { setVal('f-img', r.url); prevImg(); showSaving(false); btn.disabled = false; btn.textContent = '📤'; showToast('Imagen subida ✓'); })
    .catch(err => { showSaving(false); btn.disabled = false; btn.textContent = '📤'; showToast('Error: ' + err.message, true); });
  input.value = '';
}
export function uploadBeatAudio(input) {
  const file = input.files[0]; if (!file) return;
  if (!R2_ENABLED) { showToast('R2 Worker no configurado.', true); input.value = ''; return; }
  const beatId = editId || ('beat_' + Date.now());
  const btn = input.parentElement.querySelector('button'); btn.disabled = true; btn.textContent = '⏳'; showSaving(true);
  const ext = file.name.split('.').pop().toLowerCase(); const folder = ext === 'wav' ? 'wavs' : 'audio';
  uploadToR2(file, 'beats/' + beatId + '/' + folder + '/' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_'))
    .then(r => { setVal('f-audio', r.url); showSaving(false); btn.disabled = false; btn.textContent = '📤'; showToast('Audio subido ✓'); })
    .catch(err => { showSaving(false); btn.disabled = false; btn.textContent = '📤'; showToast('Error: ' + err.message, true); });
  input.value = '';
}
export function uploadBeatPreview(input) {
  const file = input.files[0]; if (!file) return;
  if (!R2_ENABLED) { showToast('R2 Worker no configurado.', true); input.value = ''; return; }
  const beatId = editId || ('beat_' + Date.now());
  const btn = input.parentElement.querySelector('button'); btn.disabled = true; btn.textContent = '⏳'; showSaving(true);
  uploadToR2(file, 'beats/' + beatId + '/previews/' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_'))
    .then(r => { setVal('f-prev', r.url); updateMP(); showSaving(false); btn.disabled = false; btn.textContent = '📤'; showToast('Preview subido ✓'); })
    .catch(err => { showSaving(false); btn.disabled = false; btn.textContent = '📤'; showToast('Error: ' + err.message, true); });
  input.value = '';
}

// Save/Delete
export function saveBeat() {
  const id = val('f-id').trim(), name = val('f-name').trim();
  if (!id || !name) { showToast('ID y nombre requeridos', true); return; }
  collectLics();
  const beat = { id, name, genre: val('f-genre'), genreCustom: val('f-genre-c'), bpm: parseInt(val('f-bpm')) || 0, key: val('f-key'), description: val('f-desc'), tags: val('f-tags').split(',').map(t => t.trim()).filter(Boolean), imageUrl: val('f-img'), audioUrl: val('f-audio'), previewUrl: val('f-prev'), spotify: val('f-spotify'), youtube: val('f-youtube'), soundcloud: val('f-soundcloud'), date: val('f-date'), order: parseInt(val('f-order')) || 0, plays: parseInt(val('f-plays')) || 0, featured: checked('f-feat'), exclusive: checked('f-excl'), active: checked('f-active'), available: checked('f-avail'), licenses: _edLics.filter(l => l.name) };
  showSaving(true); db.ref('beats/' + id).set(beat).then(() => { showSaving(false); showToast('Beat guardado ✓'); showSection('beats'); }).catch(err => { showSaving(false); showToast('Error: ' + err.message, true); });
}
export function deleteBeat() {
  var delId = editId || val('f-id');
  if (!delId) { showToast('No hay beat seleccionado', true); return; }
  if (!confirm('¿Eliminar beat "' + delId + '"?')) return;
  showSaving(true); db.ref('beats/' + delId).remove().then(() => { showSaving(false); showToast('Eliminado ✓'); setEditId(null); showSection('beats'); }).catch(err => { showSaving(false); showToast('Error: ' + (err.message || err.code), true); });
}
export function quickDel(id) {
  if (!confirm('¿Eliminar este beat?')) return;
  showSaving(true); db.ref('beats/' + id).remove().then(() => { showSaving(false); showToast('Eliminado ✓'); }).catch(err => { showSaving(false); showToast('Error: ' + (err.message || err.code), true); });
}

// Inline Edit
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
      showSaving(true); db.ref('beats/' + id + '/' + field).set(val2).then(() => { showSaving(false); showToast('Actualizado ✓'); }).catch(err => { showSaving(false); showToast('Error', true); });
    }
    renderBeatList();
  }
  inp.addEventListener('blur', save);
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); save(); } if (e.key === 'Escape') { renderBeatList(); } });
}
export function inlineEditName(el, id) { _inlineEdit(el, id, 'name', v => { const s = v.trim(); return s ? s : null; }); }
export function inlineEditBpm(el, id) { _inlineEdit(el, id, 'bpm', v => { const n = parseInt(v); return (n > 0 && n < 400) ? n : null; }); }
export function inlineEditKey(el, id) { _inlineEdit(el, id, 'key', v => { const s = v.trim().toUpperCase(); return s ? s : null; }); }

// Batch
export function openBatchImg() { g('batch-img-overlay').classList.add('open'); setupBatchDrop(); }
export function closeBatchImg() { g('batch-img-overlay').classList.remove('open'); }
function setupBatchDrop() {
  const drop = g('batch-img-drop');
  drop.onclick = () => document.getElementById('batch-img-input').click();
  drop.ondragover = e => { e.preventDefault(); drop.classList.add('over'); };
  drop.ondragleave = () => drop.classList.remove('over');
  drop.ondrop = e => { e.preventDefault(); drop.classList.remove('over'); handleBatchImgFiles(e.dataTransfer.files); };
}
export function handleBatchImgFiles(files) {
  const arr = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, 20 - _batchImgQueue.length);
  arr.forEach(f => {
    const name = f.name.replace(/\.[^.]+$/, '');
    const match = allBeats.find(b => b.name.toLowerCase() === name.toLowerCase());
    _batchImgQueue.push({ file: f, name, beatId: match ? match.id : '', preview: null });
    const reader = new FileReader(); const idx = _batchImgQueue.length - 1;
    reader.onload = e => { _batchImgQueue[idx].preview = e.target.result; renderBatchImgList(); };
    reader.readAsDataURL(f);
  });
  renderBatchImgList();
}
function renderBatchImgList() {
  const el = g('batch-img-list'); const saveBtn = g('batch-img-save');
  if (!_batchImgQueue.length) { el.innerHTML = ''; saveBtn.style.display = 'none'; return; }
  saveBtn.style.display = '';
  el.innerHTML = _batchImgQueue.map((item, i) => {
    const img = item.preview ? '<img src="' + item.preview + '">' : '';
    const options = allBeats.map(b => '<option value="' + b.id + '"' + (item.beatId === b.id ? ' selected' : '') + '>' + b.name + '</option>').join('');
    return '<div class="batch-img-item">' + img + '<span class="batch-img-item-name">' + item.name + '</span><select onchange="_batchImgQueue[' + i + '].beatId=this.value"><option value="">— Asignar beat —</option>' + options + '</select><button class="remove-img" onclick="_batchImgQueue.splice(' + i + ',1);renderBatchImgList()">✕</button></div>';
  }).join('');
}
export function clearBatchImgQueue() { setBatchImgQueue([]); renderBatchImgList(); g('batch-img-input').value = ''; }
export function saveBatchImages() {
  const items = _batchImgQueue.filter(i => i.beatId);
  if (!items.length) { showToast('Asigna al menos una imagen', true); return; }
  showSaving(true); let done = 0; const total = items.length;
  items.forEach(item => {
    const dbPath = 'beats/' + item.beatId + '/imageUrl';
    if (R2_ENABLED && item.file) {
      uploadToR2(item.file, 'beats/' + item.beatId + '/cover-' + item.file.name.replace(/[^a-zA-Z0-9._-]/g, '_'))
        .then(r => db.ref(dbPath).set(r.url))
        .then(() => { done++; if (done >= total) { showSaving(false); showToast(total + ' subidas a R2 ✓'); clearBatchImgQueue(); closeBatchImg(); } })
        .catch(() => { done++; if (done >= total) { showSaving(false); showToast('Error', true); } });
    } else {
      db.ref(dbPath).set(item.preview).then(() => { done++; if (done >= total) { showSaving(false); showToast(total + ' asignadas ✓'); clearBatchImgQueue(); closeBatchImg(); } }).catch(() => { done++; if (done >= total) { showSaving(false); showToast('Error', true); } });
    }
  });
}
export function batchAddBeats() {
  var count = prompt('¿Cuántos beats? (máx 20)', '3'); if (!count) return;
  count = parseInt(count); if (isNaN(count) || count < 1 || count > 20) { showToast('Máximo 20', true); return; }
  var base = allBeats.length; showSaving(true); var promises = [];
  for (var i = 0; i < count; i++) {
    var id = 'beat_' + Date.now() + '_' + i;
    promises.push(db.ref('beats/' + id).set({ id, name: 'Beat ' + (base + i + 1), genre: 'Trap', bpm: 140, key: 'Am', active: false, order: base + i, tags: [], description: '', imageUrl: '', audioUrl: '', previewUrl: '', spotify: '', youtube: '', soundcloud: '', date: new Date().toISOString().split('T')[0], available: true, exclusive: false, featured: false, plays: 0, licenses: [{ name: 'Basic', description: 'MP3 sin tag', priceMXN: 350, priceUSD: 18 }, { name: 'Premium', description: 'WAV sin tag', priceMXN: 1500, priceUSD: 75 }, { name: 'Exclusive', description: 'Stems + exclusividad', priceMXN: 8000, priceUSD: 400 }] }));
  }
  Promise.all(promises).then(() => { showSaving(false); showToast(count + ' beats creados'); }).catch(() => { showSaving(false); showToast('Error', true); });
}

// MP3 Player
let mpAudio2 = null;
export function toggleMP() {
  const url = val('f-prev') || val('f-audio'); if (!url) return;
  if (mpAudio2 && !mpAudio2.paused) { mpAudio2.pause(); return; }
  if (mpAudio2) mpAudio2.pause();
  mpAudio2 = new Audio(url);
  mpAudio2.addEventListener('timeupdate', () => { if (!mpAudio2.duration) return; const pct = (mpAudio2.currentTime / mpAudio2.duration) * 100; g('mp-fill').style.width = pct + '%'; g('mp-t').textContent = fmt(mpAudio2.currentTime) + ' / ' + fmt(mpAudio2.duration); });
  mpAudio2.play().catch(() => {});
}
function fmt(s) { return Math.floor(s / 60) + ':' + Math.floor(s % 60).toString().padStart(2, '0'); }
export function seekMP(e) { if (!mpAudio2 || !mpAudio2.duration) return; const r = e.currentTarget.getBoundingClientRect(); mpAudio2.currentTime = ((e.clientX - r.left) / r.width) * mpAudio2.duration; }

export function updateMP() {
  if (mpAudio2) { mpAudio2.pause(); mpAudio2 = null; }
  const fill = g('mp-fill'); if (fill) fill.style.width = '0%';
  const t = g('mp-t'); if (t) t.textContent = '0:00 / 0:00';
}

Object.assign(window, {
  filterBeatList, renderBeatList, dragStart, dragOver, dropBeat, dragEnd,
  openEditor, upLic, addLicRow, rmLic, loadDefaultLics,
  uploadBeatImg, uploadBeatAudio, uploadBeatPreview,
  saveBeat, deleteBeat, quickDel,
  inlineEditName, inlineEditBpm, inlineEditKey,
  openBatchImg, closeBatchImg, handleBatchImgFiles, clearBatchImgQueue, saveBatchImages,
  batchAddBeats, toggleMP, seekMP, updateMP, prevImg
});
