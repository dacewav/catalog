// ═══ DACEWAV Admin — Preview Panel Controls ═══
// Panel collapse toggle, fullscreen, keyboard shortcuts.
// Panel width is controlled by CSS grid — no manual resize needed.

function initPreviewControls() {
  const panel = document.getElementById('preview-panel');
  const split = document.querySelector('.split');
  if (!panel) return;

  // ── Toggle collapse ──
  window.togglePreviewCollapse = function () {
    const iframe = panel.querySelector('.preview-iframe-wrap');
    if (iframe) iframe.style.visibility = 'hidden';

    panel.classList.toggle('collapsed');
    if (split) split.classList.toggle('preview-collapsed');

    const btn = document.getElementById('preview-collapse-btn');
    const icon = btn?.querySelector('i');
    if (icon) icon.className = panel.classList.contains('collapsed') ? 'fas fa-chevron-left' : 'fas fa-chevron-right';

    localStorage.setItem('dace-preview-collapsed', panel.classList.contains('collapsed') ? '1' : '0');
    setTimeout(() => { if (iframe) iframe.style.visibility = ''; }, 200);
    // Re-sync viewport after collapse toggle
    if (typeof window._syncViewport === 'function') setTimeout(window._syncViewport, 250);
  };

  // Restore collapse state
  if (localStorage.getItem('dace-preview-collapsed') === '1') {
    panel.classList.add('collapsed');
    if (split) split.classList.add('preview-collapsed');
  }

  // ── Keyboard shortcut: P to toggle ──
  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
    if ((e.key === 'p' || e.key === 'P') && !e.ctrlKey && !e.metaKey && !e.altKey) {
      window.togglePreviewCollapse();
      e.preventDefault();
    }
  });

  // ── Fullscreen toggle ──
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

initPreviewControls();
