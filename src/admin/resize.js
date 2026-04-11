// ═══ DACEWAV Admin — Resize Handle ═══
import { g } from './helpers.js';

export function initResize() {
  const handle = g('resize-handle'); if (!handle) return;
  let dragging = false, startX, startPreviewW;

  function onDown(e) {
    dragging = true;
    startX = e.clientX;
    const preview = g('preview-panel');
    startPreviewW = preview ? preview.offsetWidth : 380;
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
    const diff = e.clientX - startX;
    const newW = Math.max(280, Math.min(window.innerWidth - 400, startPreviewW + diff));
    const preview = g('preview-panel');
    if (preview) {
      preview.style.width = newW + 'px';
      preview.style.flexShrink = '0';
    }
    const frame = document.getElementById('preview-frame');
    if (frame) {
      if (newW < 450) frame.className = 'mobile';
      else if (newW < 800) frame.className = 'tablet';
      else frame.className = 'desktop';
    }
    updateViewportBtns(newW);
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

function updateViewportBtns(w) {
  const btns = document.querySelectorAll('.preview-bar-center .vp-btn');
  btns.forEach(b => b.classList.remove('on'));
  if (w < 450 && btns[0]) btns[0].classList.add('on');
  else if (w < 800 && btns[1]) btns[1].classList.add('on');
  else if (btns[2]) btns[2].classList.add('on');
}

// Self-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initResize);
} else {
  initResize();
}
