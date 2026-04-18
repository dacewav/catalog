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

let _savedPanelWidth = '';

export function toggleFullscreenPreview() {
  const panel = g('preview-panel');
  if (!panel) return;
  const handle = g('resize-handle');
  const isFs = panel.classList.toggle('fullscreen');
  if (isFs) {
    // Save current width so we can restore it
    _savedPanelWidth = panel.style.width || '';
    panel.style.position = 'fixed';
    panel.style.inset = '0';
    panel.style.zIndex = '9999';
    panel.style.background = '#000';
    if (handle) handle.style.display = 'none';
    document.addEventListener('keydown', escFullscreen);
  } else {
    // Restore saved width — don't nuke all inline styles
    panel.style.position = '';
    panel.style.inset = '';
    panel.style.zIndex = '';
    panel.style.background = '';
    panel.style.width = _savedPanelWidth;
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
      p.style.position = '';
      p.style.inset = '';
      p.style.zIndex = '';
      p.style.background = '';
      p.style.width = _savedPanelWidth;
    }
    if (h) h.style.display = '';
    document.removeEventListener('keydown', escFullscreen);
  }
}
Object.assign(window, { setupHeroDrag, toggleFullscreenPreview });
