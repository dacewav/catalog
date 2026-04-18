// ═══ DACEWAV Admin — Preview Resize & Collapse ═══
// Panel collapse toggle, drag-to-resize, fullscreen, keyboard shortcuts

function initPreviewResize() {
  const panel = document.getElementById('preview-panel');
  const handle = document.getElementById('resize-handle');
  if (!panel) return;

  // ── Toggle collapse ──
  window.togglePreviewCollapse = function () {
    const iframe = panel.querySelector('.preview-iframe-wrap');
    if (iframe) iframe.style.visibility = 'hidden';

    panel.classList.toggle('collapsed');
    const btn = document.getElementById('preview-collapse-btn');
    const icon = btn?.querySelector('i');
    if (icon) icon.className = panel.classList.contains('collapsed') ? 'fas fa-chevron-left' : 'fas fa-chevron-right';

    localStorage.setItem('dace-preview-collapsed', panel.classList.contains('collapsed') ? '1' : '0');
    setTimeout(() => { if (iframe) iframe.style.visibility = ''; }, 200);
  };

  // Restore collapse state
  if (localStorage.getItem('dace-preview-collapsed') === '1') {
    panel.classList.add('collapsed');
  }

  // ── Keyboard shortcut: P to toggle ──
  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
    if ((e.key === 'p' || e.key === 'P') && !e.ctrlKey && !e.metaKey && !e.altKey) {
      window.togglePreviewCollapse();
      e.preventDefault();
    }
  });

  // ── Resize drag ──
  if (handle) {
    let dragging = false, startX = 0, startW = 0;

    handle.addEventListener('mousedown', (e) => {
      dragging = true; startX = e.clientX; startW = panel.offsetWidth;
      handle.classList.add('active');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      const iframe = panel.querySelector('.preview-iframe-wrap');
      if (iframe) iframe.style.visibility = 'hidden';
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const delta = startX - e.clientX;
      const newW = Math.max(280, Math.min(window.innerWidth * 0.7, startW + delta));
      panel.style.width = panel.style.minWidth = panel.style.maxWidth = newW + 'px';
      // Sync viewport buttons and iframe class
      if (typeof window._syncPanel === 'function') window._syncPanel(newW);
    });

    document.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      handle.classList.remove('active');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      const iframe = panel.querySelector('.preview-iframe-wrap');
      if (iframe) iframe.style.visibility = '';
      localStorage.setItem('dace-preview-width', panel.offsetWidth);
    });

    // Restore saved width
    const savedW = parseInt(localStorage.getItem('dace-preview-width'));
    if (savedW && savedW >= 280) {
      panel.style.width = panel.style.minWidth = panel.style.maxWidth = savedW + 'px';
    }
  }

  // ── Override fullscreen toggle ──
  const _origFullscreen = window.toggleFullscreenPreview;
  window.toggleFullscreenPreview = function () {
    panel.classList.toggle('fullscreen');
    const isFs = panel.classList.contains('fullscreen');
    const icon = panel.querySelector('.preview-bar-right .vp-btn[title*="Fullscreen"] i');
    if (icon) icon.className = isFs ? 'fas fa-compress' : 'fas fa-expand';
    if (isFs) document.addEventListener('keydown', escHandler);
    else document.removeEventListener('keydown', escHandler);
  };

  function escHandler(e) {
    if (e.key === 'Escape') {
      panel.classList.remove('fullscreen');
      const icon = panel.querySelector('.preview-bar-right .vp-btn[title*="Fullscreen"] i');
      if (icon) icon.className = 'fas fa-expand';
      document.removeEventListener('keydown', escHandler);
    }
  }
}

initPreviewResize();
