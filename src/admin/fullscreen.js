// ═══ DACEWAV Admin — Hero Drag & Fullscreen ═══
// Extracted from core.js — draggable hero elements + fullscreen preview toggle.

import { g, showToast } from './helpers.js';

export function setupHeroDrag() {
  const pv = g('hero-pv');
  if (!pv) return;
  let heroDragEl = null,
    heroDragStart = {};
  [g('hpv-title'), g('hpv-eyebrow'), g('hpv-sub')].forEach((el) => {
    if (!el) return;
    el.style.cursor = 'move';
    el.style.position = 'relative';
    el.addEventListener('mousedown', (e) => {
      if (e.target.closest('input,select,button')) return;
      heroDragEl = el;
      heroDragStart = {
        x: e.clientX,
        y: e.clientY,
        top: parseFloat(el.style.top) || 0,
        left: parseFloat(el.style.left) || 0,
      };
      e.preventDefault();
    });
  });
  document.addEventListener('mousemove', (e) => {
    if (!heroDragEl) return;
    heroDragEl.style.top = heroDragStart.top + e.clientY - heroDragStart.y + 'px';
    heroDragEl.style.left = heroDragStart.left + e.clientX - heroDragStart.x + 'px';
  });
  document.addEventListener('mouseup', () => {
    heroDragEl = null;
  });
}

export function toggleFullscreenPreview() {
  const panel = g('preview-panel');
  if (!panel) return;
  const handle = g('resize-handle');
  const isFs = panel.classList.toggle('fullscreen');
  if (isFs) {
    panel.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#000';
    if (handle) handle.style.display = 'none';
    document.addEventListener('keydown', escFullscreen);
  } else {
    panel.style.cssText = '';
    if (handle) handle.style.display = '';
    document.removeEventListener('keydown', escFullscreen);
  }
  showToast(isFs ? 'Preview fullscreen \u2014 ESC para salir' : 'Preview normal');
}

function escFullscreen(e) {
  if (e.key === 'Escape') {
    const p = g('preview-panel');
    const h = g('resize-handle');
    if (p) {
      p.classList.remove('fullscreen');
      p.style.cssText = '';
    }
    if (h) h.style.display = '';
    document.removeEventListener('keydown', escFullscreen);
  }
}
Object.assign(window, { setupHeroDrag, toggleFullscreenPreview });
