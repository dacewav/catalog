// ═══ DACEWAV.STORE — Admin Entry Point (v5.2) ═══
// This bundle replaces the inline <script> in admin.html

// Import config & constants
import './admin/config.js';

// Import core (helpers, undo, auto-save, preview, theme, presets, particles, etc.)
import './admin/helpers.js';
import './admin/core.js';

// Import feature modules (each assigns to window)
import './admin/colors.js';
import './admin/fonts.js';
import './admin/nav.js';
import './admin/qr.js';
import './admin/cmd-palette.js';
import './admin/resize.js';
import './admin/beat-preview.js';
import './admin/beats.js';
import './admin/card-global.js';
import './admin/r2.js';
import './admin/features.js';
import './admin/trash.js';
import { initGallery, handleGalleryUpload, renderGallery, closeGalleryPicker, openGalleryPicker, saveUrlToGallery, deleteFromGallery, uploadToGallery } from './admin/gallery.js';

// Expose gallery functions to window for inline onclick handlers
window.handleGalleryUpload = handleGalleryUpload;
window.renderGallery = renderGallery;
window.closeGalleryPicker = closeGalleryPicker;
window.openGalleryPicker = openGalleryPicker;
window.saveUrlToGallery = saveUrlToGallery;
window.deleteFromGallery = deleteFromGallery;
window.uploadToGallery = uploadToGallery;
window.renderPickerGrid = function() {
  // Re-render picker grid (called from inline script)
  const grid = document.getElementById('gallery-picker-grid');
  if (!grid) return;
  const search = (document.getElementById('gallery-picker-search')?.value || '').toLowerCase();
  // Access gallery array via the module
  import('./admin/gallery.js').then(m => {
    let items = m.gallery || [];
    if (search) {
      items = items.filter(img => 
        (img.name || '').toLowerCase().includes(search) ||
        (img.url || '').toLowerCase().includes(search)
      );
    }
    if (!items.length) {
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--hi);font-size:11px">
        ${items.length === 0 && (m.gallery || []).length === 0 ? 'Galería vacía. Sube una imagen.' : 'Sin resultados'}
      </div>`;
      return;
    }
    grid.innerHTML = items.map(img => {
      return `<div class="picker-item" onclick="window.__pickGalleryImg && window.__pickGalleryImg('${img.url.replace(/'/g, "\\'")}')">
        <img src="${img.url}" alt="${img.name || ''}" loading="lazy">
        <div class="picker-item-name">${img.name || ''}</div>
      </div>`;
    }).join('');
  });
};

// Import auth & firebase init (bootstraps everything)
import './admin/firebase-init.js';

console.log('[DACE Admin] v5.2 bundle loaded');
