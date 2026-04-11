// ═══ DACEWAV Admin — Resize Handle ═══
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

export function initResize() {
  var strip = g('resize-handle'); if (!strip) return;
  var dragging = false, startX, startW;

  function onDown(e) {
    dragging = true;
    startX = e.clientX;
    var preview = g('preview-panel');
    startW = preview ? preview.offsetWidth : Math.round(window.innerWidth * 0.5);
    strip.classList.add('active');
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    if (e.pointerId != null && strip.setPointerCapture) {
      strip.setPointerCapture(e.pointerId);
    }
    e.preventDefault();
  }

  function onMove(e) {
    if (!dragging) return;
    // strip is at left edge of panel; drag left → panel wider
    var diff = startX - e.clientX;
    var newW = Math.max(280, Math.min(window.innerWidth - 200, startW + diff));
    syncPanel(newW);
  }

  function onUp() {
    if (!dragging) return;
    dragging = false;
    strip.classList.remove('active');
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }

  strip.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);
  document.addEventListener('mouseleave', onUp);
}

// Init panel width + --pw on load
function initPanelSize() {
  var preview = g('preview-panel');
  if (preview) {
    var w = preview.offsetWidth || Math.round(window.innerWidth * 0.5);
    document.documentElement.style.setProperty('--pw', w + 'px');
  }
}

// Export for core.js
window._syncPanel = syncPanel;
window._updateViewportBtns = updateViewportBtns;

// Self-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() { initResize(); initPanelSize(); });
} else {
  initResize();
  initPanelSize();
}
