// ═══ DACEWAV Admin — Resize Handle ═══
import { g } from './helpers.js';

export function initResize() {
  const handle = g('resize-handle'); if (!handle) return;
  let dragging = false, startX, startPreviewW;
  handle.addEventListener('mousedown', e => {
    dragging = true; startX = e.clientX;
    const preview = g('preview-panel');
    startPreviewW = preview ? preview.offsetWidth : 380;
    handle.classList.add('active'); document.body.style.cursor = 'col-resize'; document.body.style.userSelect = 'none';
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    // Dragging left = smaller preview, dragging right = bigger preview
    // We invert: moving mouse left shrinks preview, moving right grows it
    const diff = startX - e.clientX;
    const newW = Math.max(280, Math.min(window.innerWidth - 400, startPreviewW + diff));
    const preview = g('preview-panel');
    if (preview) {
      preview.style.width = newW + 'px';
      preview.style.flexShrink = '0';
    }
    // Update viewport class based on width
    const frame = document.getElementById('preview-frame');
    if (frame) {
      if (newW < 450) frame.className = 'mobile';
      else if (newW < 800) frame.className = 'tablet';
      else frame.className = 'desktop';
    }
    // Update viewport buttons
    updateViewportBtns(newW);
  });
  document.addEventListener('mouseup', () => {
    if (!dragging) return; dragging = false;
    handle.classList.remove('active'); document.body.style.cursor = ''; document.body.style.userSelect = '';
  });
}

function updateViewportBtns(w) {
  const btns = document.querySelectorAll('.preview-bar-center .vp-btn');
  btns.forEach(b => b.classList.remove('on'));
  if (w < 450 && btns[0]) btns[0].classList.add('on');
  else if (w < 800 && btns[1]) btns[1].classList.add('on');
  else if (btns[2]) btns[2].classList.add('on');
}
