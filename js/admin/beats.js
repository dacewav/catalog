// ════════════════════════════════════════════════════════════
// DACEWAV.STORE — Admin Beats CRUD (js/admin/beats.js)
// ════════════════════════════════════════════════════════════

import { db, auth } from '../firebase.js';
import {
  ref, onValue, push, update, remove, get
} from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js';
import { getIdToken } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js';

const GENRES = ['Trap', 'R&B', 'Drill', 'Reggaeton', 'Afro', 'Sample'];
const MOODS  = ['Dark', 'Chill', 'Hype', 'Romantic', 'Aggressive'];
const KEYS   = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MODES  = ['maj', 'min'];
const STATUSES = ['active', 'draft', 'sold'];

let container;
let editorEl;
let editingId = null;
let beatsUnsub = null;

export function initBeats() {
  container = document.getElementById('beats-container');
  if (!container) return;

  buildUI();
  listenBeats();
}

// ── Build static UI ──
function buildUI() {
  container.innerHTML = '';

  // Header
  const header = document.createElement('div');
  header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-lg)';

  const errorDiv = document.createElement('div');
  errorDiv.id = 'beats-error';
  errorDiv.style.cssText = 'color:var(--color-error);font-size:var(--text-sm)';

  const btnNew = document.createElement('button');
  btnNew.className = 'btn-action btn-action--new';
  btnNew.textContent = '+ Nuevo Beat';
  btnNew.addEventListener('click', () => openEditor());

  header.appendChild(errorDiv);
  header.appendChild(btnNew);
  container.appendChild(header);

  // Table
  const table = document.createElement('table');
  table.className = 'admin-table';
  table.id = 'beats-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th></th>
        <th>Título</th>
        <th>Género</th>
        <th>BPM</th>
        <th>Status</th>
        <th>Plays</th>
        <th></th>
      </tr>
    </thead>
    <tbody id="beats-tbody"></tbody>
  `;
  container.appendChild(table);

  // Editor panel
  buildEditor();
}

// ── Editor Panel ──
function buildEditor() {
  editorEl = document.createElement('div');
  editorEl.className = 'editor-panel';
  editorEl.id = 'beats-editor';

  const keyOptions = KEYS.flatMap(k => MODES.map(m => `<option value="${k} ${m}">${k} ${m}</option>`)).join('');

  editorEl.innerHTML = `
    <div class="editor-panel__header">
      <h3 class="editor-panel__title" id="editor-title">Nuevo Beat</h3>
      <button class="editor-panel__close" id="editor-close">✕</button>
    </div>
    <form id="editor-form">
      <div class="form-group">
        <label for="beat-title">Título</label>
        <input type="text" id="beat-title" required>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="beat-genre">Género</label>
          <select id="beat-genre">${GENRES.map(g => `<option value="${g}">${g}</option>`).join('')}</select>
        </div>
        <div class="form-group">
          <label for="beat-mood">Mood</label>
          <select id="beat-mood">${MOODS.map(m => `<option value="${m}">${m}</option>`).join('')}</select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="beat-bpm">BPM</label>
          <input type="number" id="beat-bpm" min="60" max="200" value="140">
        </div>
        <div class="form-group">
          <label for="beat-key">Key</label>
          <select id="beat-key">${keyOptions}</select>
        </div>
      </div>
      <div class="form-group">
        <label for="beat-tags">Tags (separados por coma)</label>
        <input type="text" id="beat-tags" placeholder="dark, trap, 808">
      </div>
      <div class="form-group">
        <label for="beat-cover">Cover URL</label>
        <input type="url" id="beat-cover" placeholder="https://...">
        <div id="cover-preview" style="margin-top:var(--space-sm)"></div>
      </div>
      <div class="form-group">
        <label for="beat-audio">Audio URL</label>
        <input type="url" id="beat-audio" placeholder="https://...">
      </div>
      <div class="form-group">
        <label>Subir audio</label>
        <input type="file" id="beat-upload" accept="audio/*" style="display:none">
        <button type="button" class="btn-secondary" id="btn-upload" style="width:100%">Seleccionar archivo</button>
        <div id="upload-status" style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:var(--space-xs)"></div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="beat-status">Status</label>
          <select id="beat-status">${STATUSES.map(s => `<option value="${s}">${s}</option>`).join('')}</select>
        </div>
        <div class="form-group">
          <label for="beat-featured">Featured</label>
          <select id="beat-featured">
            <option value="false">No</option>
            <option value="true">Sí</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label for="beat-exclusive">Exclusivo (vendido)</label>
        <select id="beat-exclusive">
          <option value="false">No</option>
          <option value="true">Sí</option>
        </select>
      </div>
      <div class="editor-panel__actions">
        <button type="submit" class="btn-primary" style="flex:1">Guardar</button>
        <button type="button" class="btn-secondary" id="btn-cancel">Cancelar</button>
      </div>
    </form>
  `;

  document.body.appendChild(editorEl);

  // Bind editor events
  document.getElementById('editor-close').addEventListener('click', closeEditor);
  document.getElementById('btn-cancel').addEventListener('click', closeEditor);
  document.getElementById('editor-form').addEventListener('submit', handleSave);

  // Cover preview
  const coverInput = document.getElementById('beat-cover');
  coverInput.addEventListener('input', () => {
    const preview = document.getElementById('cover-preview');
    if (coverInput.value) {
      preview.innerHTML = `<img src="${coverInput.value}" style="max-width:120px;border-radius:var(--radius-md);margin-top:var(--space-xs)" onerror="this.remove()">`;
    } else {
      preview.innerHTML = '';
    }
  });

  // Upload button
  document.getElementById('btn-upload').addEventListener('click', () => {
    document.getElementById('beat-upload').click();
  });
  document.getElementById('beat-upload').addEventListener('change', handleUpload);
}

// ── Firebase Listener ──
function listenBeats() {
  const beatsRef = ref(db, 'beats');
  beatsUnsub = onValue(beatsRef, (snap) => {
    const raw = snap.val();
    const tbody = document.getElementById('beats-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!raw) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="7" style="text-align:center;color:var(--color-text-dim);padding:var(--space-xl)">No hay beats. Crea el primero.</td>';
      tbody.appendChild(tr);
      return;
    }

    const beats = Object.entries(raw)
      .map(([id, beat]) => ({ id, ...beat }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    beats.forEach(beat => {
      tbody.appendChild(createBeatRow(beat));
    });
  });
}

function createBeatRow(beat) {
  const tr = document.createElement('tr');

  // Cover thumbnail
  const tdCover = document.createElement('td');
  if (beat.coverUrl) {
    const img = document.createElement('img');
    img.src = beat.coverUrl;
    img.style.cssText = 'width:40px;height:40px;border-radius:var(--radius-sm);object-fit:cover';
    img.onerror = () => { img.remove(); };
    tdCover.appendChild(img);
  }
  tr.appendChild(tdCover);

  // Title
  const tdTitle = document.createElement('td');
  tdTitle.textContent = beat.title || '—';
  tr.appendChild(tdTitle);

  // Genre
  const tdGenre = document.createElement('td');
  tdGenre.textContent = beat.genre || '—';
  tr.appendChild(tdGenre);

  // BPM
  const tdBpm = document.createElement('td');
  tdBpm.textContent = beat.bpm || '—';
  tr.appendChild(tdBpm);

  // Status badge
  const tdStatus = document.createElement('td');
  const badge = document.createElement('span');
  badge.className = `badge badge--${beat.status || 'draft'}`;
  badge.textContent = beat.status || 'draft';
  tdStatus.appendChild(badge);
  tr.appendChild(tdStatus);

  // Plays
  const tdPlays = document.createElement('td');
  tdPlays.textContent = beat.plays || 0;
  tr.appendChild(tdPlays);

  // Actions
  const tdActions = document.createElement('td');
  tdActions.style.cssText = 'display:flex;gap:var(--space-xs)';

  const btnEdit = document.createElement('button');
  btnEdit.className = 'btn-action btn-action--edit';
  btnEdit.textContent = 'Editar';
  btnEdit.addEventListener('click', () => openEditor(beat));
  tdActions.appendChild(btnEdit);

  const btnDelete = document.createElement('button');
  btnDelete.className = 'btn-action btn-action--delete';
  btnDelete.textContent = 'Eliminar';
  btnDelete.addEventListener('click', () => showDeleteConfirm(btnDelete, beat.id));
  tdActions.appendChild(btnDelete);

  tr.appendChild(tdActions);
  return tr;
}

// ── Delete with inline confirmation ──
function showDeleteConfirm(btn, beatId) {
  const parent = btn.parentElement;
  const originalContent = parent.innerHTML;

  parent.innerHTML = '';
  const confirmDiv = document.createElement('div');
  confirmDiv.className = 'confirm-inline';

  const span = document.createElement('span');
  span.textContent = '¿Eliminar? ';
  span.style.color = 'var(--color-text-muted)';

  const yes = document.createElement('button');
  yes.className = 'confirm-inline__yes';
  yes.textContent = 'Sí, eliminar';
  yes.addEventListener('click', async () => {
    try {
      await remove(ref(db, `beats/${beatId}`));
      window.__toast('Beat eliminado');
    } catch (err) {
      window.__toast('Error al eliminar', 'error');
    }
  });

  const no = document.createElement('button');
  no.className = 'confirm-inline__no';
  no.textContent = 'Cancelar';
  no.addEventListener('click', () => {
    parent.innerHTML = originalContent;
    // Re-bind events (trivial approach: just leave as-is, next render will fix)
  });

  confirmDiv.appendChild(span);
  confirmDiv.appendChild(yes);
  confirmDiv.appendChild(no);
  parent.appendChild(confirmDiv);
}

// ── Editor open/close ──
function openEditor(beat = null) {
  editingId = beat ? beat.id : null;
  const titleEl = document.getElementById('editor-title');
  titleEl.textContent = beat ? 'Editar Beat' : 'Nuevo Beat';

  // Populate fields
  document.getElementById('beat-title').value = beat?.title || '';
  document.getElementById('beat-genre').value = beat?.genre || GENRES[0];
  document.getElementById('beat-mood').value = beat?.mood || MOODS[0];
  document.getElementById('beat-bpm').value = beat?.bpm || 140;
  document.getElementById('beat-key').value = beat?.key || 'C min';
  document.getElementById('beat-tags').value = beat?.tags ? beat.tags.join(', ') : '';
  document.getElementById('beat-cover').value = beat?.coverUrl || '';
  document.getElementById('beat-audio').value = beat?.audioUrl || '';
  document.getElementById('beat-status').value = beat?.status || 'active';
  document.getElementById('beat-featured').value = beat?.featured ? 'true' : 'false';
  document.getElementById('beat-exclusive').value = beat?.exclusive ? 'true' : 'false';

  // Cover preview
  const preview = document.getElementById('cover-preview');
  preview.innerHTML = beat?.coverUrl
    ? `<img src="${beat.coverUrl}" style="max-width:120px;border-radius:var(--radius-md);margin-top:var(--space-xs)" onerror="this.remove()">`
    : '';

  // Clear upload status
  document.getElementById('upload-status').textContent = '';

  // Clear error
  const errorEl = document.getElementById('beats-error');
  if (errorEl) errorEl.textContent = '';

  editorEl.classList.add('visible');
}

function closeEditor() {
  editorEl.classList.remove('visible');
  editingId = null;
}

// ── Save (create or update) ──
async function handleSave(e) {
  e.preventDefault();
  const errorEl = document.getElementById('beats-error');
  if (errorEl) errorEl.textContent = '';

  const title = document.getElementById('beat-title').value.trim();
  if (!title) {
    if (errorEl) errorEl.textContent = 'Título es requerido';
    return;
  }

  const data = {
    title,
    slug: slugify(title),
    genre: document.getElementById('beat-genre').value,
    mood: document.getElementById('beat-mood').value,
    bpm: parseInt(document.getElementById('beat-bpm').value, 10) || 140,
    key: document.getElementById('beat-key').value,
    tags: document.getElementById('beat-tags').value
      .split(',')
      .map(t => t.trim())
      .filter(Boolean),
    coverUrl: document.getElementById('beat-cover').value.trim(),
    audioUrl: document.getElementById('beat-audio').value.trim(),
    status: document.getElementById('beat-status').value,
    featured: document.getElementById('beat-featured').value === 'true',
    exclusive: document.getElementById('beat-exclusive').value === 'true',
    updatedAt: Date.now(),
  };

  try {
    if (editingId) {
      await update(ref(db, `beats/${editingId}`), data);
      window.__toast('Beat actualizado');
    } else {
      data.createdAt = Date.now();
      data.plays = 0;
      // Default licenses
      data.licenses = {
        mp3:       { mxn: 299,  usd: 15  },
        wav:       { mxn: 499,  usd: 25  },
        premium:   { mxn: 999,  usd: 50  },
        ilimitada: { mxn: 1999, usd: 100 },
        exclusiva: { mxn: 4999, usd: 250 },
      };
      await push(ref(db, 'beats'), data);
      window.__toast('Beat creado');
    }
    closeEditor();
  } catch (err) {
    const msg = err.code === 'PERMISSION_DENIED'
      ? 'Sin permisos — verifica tu sesión'
      : 'Error al guardar';
    if (errorEl) errorEl.textContent = msg;
    window.__toast(msg, 'error');
  }
}

// ── Upload audio to R2 via Worker ──
async function handleUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const statusEl = document.getElementById('upload-status');
  statusEl.textContent = 'Subiendo...';
  statusEl.style.color = 'var(--color-text-muted)';

  try {
    const token = await getIdToken(auth.currentUser);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', `beats/${Date.now()}-${file.name}`);

    const resp = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });

    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({}));
      throw new Error(errData.error || `Upload failed (${resp.status})`);
    }

    const result = await resp.json();
    document.getElementById('beat-audio').value = result.url;
    statusEl.textContent = `✓ Subido: ${file.name}`;
    statusEl.style.color = 'var(--color-success)';
    window.__toast('Audio subido');
  } catch (err) {
    statusEl.textContent = `✗ Error: ${err.message}`;
    statusEl.style.color = 'var(--color-error)';
    window.__toast('Error al subir audio', 'error');
  }

  // Reset file input
  e.target.value = '';
}

// ── Helpers ──
function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    || 'beat';
}
