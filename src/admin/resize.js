// ═══ DACEWAV Admin — Resize Handle ═══
import { g } from './helpers.js';

export function initResize() {
  const handle = g('resize-handle'); if (!handle) return;
  let dragging = false, startX, startW;
  handle.addEventListener('mousedown', e => {
    dragging = true; startX = e.clientX;
    const controls = g('controls-area'); startW = controls.offsetWidth;
    handle.classList.add('active'); document.body.style.cursor = 'col-resize'; document.body.style.userSelect = 'none';
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const controls = g('controls-area');
    controls.style.width = Math.max(240, Math.min(600, startW + e.clientX - startX)) + 'px';
  });
  document.addEventListener('mouseup', () => {
    if (!dragging) return; dragging = false;
    handle.classList.remove('active'); document.body.style.cursor = ''; document.body.style.userSelect = '';
  });
}
