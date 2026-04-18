// ═══ DACEWAV Admin — Viewport Sync ═══
// Syncs the iframe viewport class (mobile/tablet/desktop) based on panel width.
// The actual panel width is controlled by CSS grid, not JS.
import { g } from './helpers.js';

export function syncViewport() {
  var preview = g('preview-panel');
  if (!preview) return;
  var w = preview.offsetWidth;
  var frame = document.getElementById('preview-frame');
  if (frame) {
    if (w < 450) frame.className = 'mobile';
    else if (w < 800) frame.className = 'tablet';
    else frame.className = 'desktop';
  }
  updateViewportBtns(w);
}

function updateViewportBtns(w) {
  var btns = document.querySelectorAll('.preview-bar-center .vp-btn');
  btns.forEach(function(b) { b.classList.remove('on'); });
  if (w < 450 && btns[0]) btns[0].classList.add('on');
  else if (w < 800 && btns[1]) btns[1].classList.add('on');
  else if (btns[2]) btns[2].classList.add('on');
}

// Export for other modules
window._syncViewport = syncViewport;
window._updateViewportBtns = updateViewportBtns;

// Auto-sync on load and resize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() { syncViewport(); });
} else {
  syncViewport();
}
window.addEventListener('resize', syncViewport);
