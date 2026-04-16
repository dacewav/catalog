// ═══ DACEWAV Admin — Global Image Gallery ═══
// Centralized image storage: upload once, use everywhere.
// Similar to BeatStars media library.

import { showSaving, showToast } from './helpers.js';
import { uploadToR2, R2_ENABLED } from './r2.js';

let gallery = []; // { id, url, name, type, size, width, height, createdAt, tags[] }
let galleryLoaded = false;
let pickerCallback = null; // function(url) called when user picks an image
let pickerFilter = 'all'; // 'all' | 'cover' | 'avatar' | 'banner' | 'other'

// ═══ INIT ═══
export function initGallery(db) {
  db.ref('imageGallery').on('value', (snap) => {
    const raw = snap.val() || {};
    gallery = Object.keys(raw).map(k => {
      raw[k].id = raw[k].id || k;
      return raw[k];
    }).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    galleryLoaded = true;
    renderGallery();
    updateGalleryBadge();
  });
}

// ═══ UPLOAD & SAVE ═══
export async function uploadToGallery(file, type, tags) {
  if (!file) return null;
  if (!R2_ENABLED) {
    showToast('R2 Worker no configurado', true);
    return null;
  }
  
  type = type || 'other';
  tags = tags || [];
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `gallery/${Date.now()}-${cleanName}`;
  
  showSaving(true);
  try {
    const result = await uploadToR2(file, path);
    const url = result.url;
    
    // Get image dimensions
    const dims = await getImageDimensions(url);
    
    const entry = {
      id: 'img_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      url: url,
      name: file.name.replace(/\.[^.]+$/, ''),
      type: type,
      size: file.size,
      width: dims.w,
      height: dims.h,
      mimeType: file.type,
      createdAt: Date.now(),
      tags: tags
    };
    
    // Save to Firebase
    const db = window._db;
    if (db) {
      await db.ref('imageGallery/' + entry.id).set(entry);
    }
    
    showSaving(false);
    showToast('Imagen guardada en galería ✓');
    return url;
  } catch (e) {
    showSaving(false);
    showToast('Error: ' + e.message, true);
    return null;
  }
}

// Save an existing URL to gallery (for images already in CDN)
export async function saveUrlToGallery(url, name, type, tags) {
  if (!url || url.length < 10) return;
  
  // Check if already in gallery
  if (gallery.some(img => img.url === url)) return;
  
  type = type || 'other';
  tags = tags || [];
  const dims = await getImageDimensions(url);
  
  const entry = {
    id: 'img_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    url: url,
    name: name || 'image',
    type: type,
    size: 0,
    width: dims.w,
    height: dims.h,
    mimeType: '',
    createdAt: Date.now(),
    tags: tags
  };
  
  const db = window._db;
  if (db) {
    await db.ref('imageGallery/' + entry.id).set(entry);
  }
}

// Delete from gallery
export async function deleteFromGallery(id) {
  const db = window._db;
  if (db) {
    await db.ref('imageGallery/' + id).remove();
  }
  showToast('Imagen eliminada de galería');
}

// Update gallery entry tags/name
export async function updateGalleryEntry(id, updates) {
  const db = window._db;
  if (db) {
    await db.ref('imageGallery/' + id).update(updates);
  }
}

// ═══ PICKER ═══
export function openGalleryPicker(callback, filter) {
  pickerCallback = callback;
  pickerFilter = filter || 'all';
  renderPickerGrid();
  const overlay = document.getElementById('gallery-picker-overlay');
  if (overlay) overlay.classList.add('open');
}

export function closeGalleryPicker() {
  pickerCallback = null;
  const overlay = document.getElementById('gallery-picker-overlay');
  if (overlay) overlay.classList.remove('open');
}

function pickImage(url) {
  if (pickerCallback) pickerCallback(url);
  closeGalleryPicker();
}

// ═══ RENDER: GALLERY SECTION ═══
export function renderGallery() {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;
  
  const filter = document.getElementById('gallery-filter');
  const currentFilter = filter ? filter.value : 'all';
  const search = (document.getElementById('gallery-search')?.value || '').toLowerCase();
  
  let items = gallery;
  if (currentFilter !== 'all') {
    items = items.filter(img => img.type === currentFilter);
  }
  if (search) {
    items = items.filter(img => 
      (img.name || '').toLowerCase().includes(search) ||
      (img.tags || []).some(t => t.toLowerCase().includes(search))
    );
  }
  
  if (!items.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem 1rem;color:var(--hi)">
      <div style="font-size:2.5rem;margin-bottom:.75rem;opacity:.4">🖼️</div>
      <div style="font-size:12px">${gallery.length ? 'Sin resultados para este filtro' : 'Galería vacía. Sube tu primera imagen.'}</div>
    </div>`;
    return;
  }
  
  grid.innerHTML = items.map(img => {
    const date = new Date(img.createdAt || 0).toLocaleDateString();
    const size = img.size ? formatSize(img.size) : '';
    const dims = img.width && img.height ? `${img.width}×${img.height}` : '';
    const typeLabel = { cover: 'Cover', avatar: 'Avatar', banner: 'Banner', other: 'Otro' }[img.type] || img.type;
    
    return `<div class="gallery-item" data-id="${img.id}">
      <div class="gallery-item-img">
        <img src="${img.url}" alt="${img.name || ''}" loading="lazy" onerror="this.parentElement.innerHTML='❌'">
        <div class="gallery-item-overlay">
          <button onclick="window.__galleryUse && window.__galleryUse('${img.url}')" title="Usar en beat actual">📌 Usar</button>
          <button onclick="window.__galleryCopy && window.__galleryCopy('${img.url}')" title="Copiar URL">📋</button>
          <button onclick="window.__galleryDelete && window.__galleryDelete('${img.id}')" title="Eliminar">🗑</button>
        </div>
      </div>
      <div class="gallery-item-info">
        <div class="gallery-item-name" title="${img.name || ''}">${img.name || 'Sin nombre'}</div>
        <div class="gallery-item-meta">${typeLabel} ${dims ? '· ' + dims : ''} ${size ? '· ' + size : ''}</div>
        <div class="gallery-item-date">${date}</div>
      </div>
    </div>`;
  }).join('');
}

// ═══ RENDER: PICKER MODAL ═══
function renderPickerGrid() {
  const grid = document.getElementById('gallery-picker-grid');
  if (!grid) return;
  
  const search = (document.getElementById('gallery-picker-search')?.value || '').toLowerCase();
  let items = pickerFilter === 'all' ? gallery : gallery.filter(img => img.type === pickerFilter);
  if (search) {
    items = items.filter(img => 
      (img.name || '').toLowerCase().includes(search) ||
      (img.url || '').toLowerCase().includes(search)
    );
  }
  
  if (!items.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--hi);font-size:11px">
      ${gallery.length ? 'Sin resultados' : 'Galería vacía. Sube una imagen primero.'}
    </div>`;
    return;
  }
  
  grid.innerHTML = items.map(img => {
    return `<div class="picker-item" data-action="pickGalleryItem" data-url="${img.url.replace(/"/g, '&quot;')}">
      <img src="${img.url}" alt="${img.name || ''}" loading="lazy">
      <div class="picker-item-name">${img.name || ''}</div>
    </div>`;
  }).join('');
}

// ═══ UPLOAD UI (in gallery section) ═══
export function handleGalleryUpload(input) {
  const files = Array.from(input.files || []);
  if (!files.length) return;
  
  const typeSelect = document.getElementById('gallery-upload-type');
  const type = typeSelect ? typeSelect.value : 'other';
  const tagsInput = document.getElementById('gallery-upload-tags');
  const tags = tagsInput ? tagsInput.value.split(',').map(t => t.trim()).filter(Boolean) : [];
  
  let done = 0;
  files.forEach(file => {
    if (!file.type.startsWith('image/')) return;
    uploadToGallery(file, type, tags).then(() => {
      done++;
      if (done >= files.length) {
        input.value = '';
        showToast(`${done} imagen(es) subida(s) ✓`);
      }
    });
  });
}

// ═══ UTILITY ═══
function getImageDimensions(url) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve({ w: 0, h: 0 });
    img.src = url;
    setTimeout(() => resolve({ w: 0, h: 0 }), 5000);
  });
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + 'B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
  return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
}

function updateGalleryBadge() {
  const badge = document.getElementById('gallery-count');
  if (badge) badge.textContent = gallery.length || '';
}

// ═══ WINDOW GLOBALS (for onclick handlers) ═══
window.__galleryUse = function(url) {
  // Fill the beat editor image field if open
  const fImg = document.getElementById('f-img');
  if (fImg) {
    fImg.value = url;
    if (typeof window.prevImg === 'function') window.prevImg();
    if (typeof window.updateCardPreview === 'function') window.updateCardPreview();
    if (typeof window._sendLiveUpdate === 'function') window._sendLiveUpdate();
    showToast('Imagen aplicada al beat ✓');
  } else {
    // Copy to clipboard
    navigator.clipboard.writeText(url).then(() => showToast('URL copiada'));
  }
};

window.__galleryCopy = function(url) {
  navigator.clipboard.writeText(url).then(() => showToast('URL copiada'));
};

window.__galleryDelete = function(id) {
  if (confirm('¿Eliminar esta imagen de la galería?')) {
    deleteFromGallery(id);
  }
};

window.__pickGalleryImg = function(url) {
  pickImage(url);
};

// Export for use in other modules
export { gallery, galleryLoaded };
