// ═══ DACEWAV Admin — Resize Handle (Viewport Sync) ═══
// Viewport sync utilities for the preview panel.
// The actual resize/drag/collapse/fullscreen is handled by preview-resize.js
import { g } from './helpers.js';

function syncPanel(w) {
  var preview = g('preview-panel');
  if (preview) preview.style.width = w + 'px';
  document.documentElement.style.setProperty('--pw', w + 'px');
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

// Export for core.js and preview-resize.js
window._syncPanel = syncPanel;
window._updateViewportBtns = updateViewportBtns;
