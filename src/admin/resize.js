// ═══ DACEWAV Admin — Resize Handle ═══
import { g } from './helpers.js';

function syncPanel(w) {
  var preview = g('preview-panel');
  var handle = g('resize-handle');
  if (preview) preview.style.width = w + 'px';
  if (handle) handle.style.right = w + 'px';
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
  var handle = g('resize-handle'); if (!handle) return;
  var dragging = false, startX, startW;

  function onDown(e) {
    dragging = true;
    startX = e.clientX;
    var preview = g('preview-panel');
    startW = preview ? preview.offsetWidth : 380;
    handle.classList.add('active');
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    if (e.pointerId != null && handle.setPointerCapture) {
      handle.setPointerCapture(e.pointerId);
    }
    e.preventDefault();
  }

  function onMove(e) {
    if (!dragging) return;
    // handle is at left edge of panel; drag left → panel wider
    var diff = startX - e.clientX;
    var newW = Math.max(280, Math.min(window.innerWidth - 400, startW + diff));
    syncPanel(newW);
  }

  function onUp() {
    if (!dragging) return;
    dragging = false;
    handle.classList.remove('active');
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }

  handle.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);
  document.addEventListener('mouseleave', onUp);
}

// Export for core.js to use
window._syncPanel = syncPanel;
window._updateViewportBtns = updateViewportBtns;

// Self-initialize on DOM ready
function initHandlePos() {
  var preview = g('preview-panel');
  var handle = g('resize-handle');
  if (preview && handle) {
    var w = preview.offsetWidth || Math.round(window.innerWidth * 0.5);
    handle.style.right = w + 'px';
    document.documentElement.style.setProperty('--pw', w + 'px');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() { initResize(); initHandlePos(); });
} else {
  initResize();
  initHandlePos();
}
