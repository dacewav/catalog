// ═══ DACEWAV.STORE — Hash Router ═══
// Handles #/beat/<id> deep links and browser back/forward.
// This file patches window.openModal / window.closeModal set by main.js.

import { state } from './state.js';

let _guard = false;

function _getId() {
  const m = location.hash.match(/^#\/beat\/(.+)$/);
  return m ? decodeURIComponent(m[1]) : null;
}

function _push(id) {
  if (id) history.pushState({ beatId: id }, '', '#/beat/' + encodeURIComponent(id));
  else history.pushState(null, '', location.pathname + location.search);
}

function _updTitle(id) {
  const b = state.allBeats.find((x) => x.id === id);
  if (b) document.title = b.name + ' — DACEWAV.STORE';
}

// Patch openModal to add hash
const _savedOpen = window.openModal;
window.openModal = function (id) {
  if (_savedOpen) _savedOpen(id);
  if (!_guard) _push(id);
  _updTitle(id);

  // Add copy-link button
  setTimeout(() => {
    const mb = document.querySelector('#modal-ov .modal-body');
    if (mb && !document.getElementById('btn-copiar-link')) {
      const btn = document.createElement('button');
      btn.id = 'btn-copiar-link';
      btn.type = 'button';
      btn.innerHTML = '🔗 Copiar link';
      btn.style.cssText = 'display:block;margin:12px auto 0;padding:8px 18px;background:transparent;color:var(--muted);border:1px solid var(--border2);border-radius:8px;font-size:12px;font-family:var(--font-m);cursor:pointer;transition:all .2s';
      btn.onmouseenter = () => { btn.style.color = 'var(--text)'; btn.style.borderColor = 'var(--accent)'; };
      btn.onmouseleave = () => { btn.style.color = 'var(--muted)'; btn.style.borderColor = 'var(--border2)'; };
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const bid = _getId();
        if (bid) {
          const url = 'https://dacewav.store/#/beat/' + bid;
          if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
          if (typeof window.showToast === 'function') window.showToast('¡Link copiado!');
        }
      };
      mb.appendChild(btn);
    }
  }, 100);
};

// Patch closeModal to clear hash
const _savedClose = window.closeModal;
window.closeModal = function () {
  if (_savedClose) _savedClose();
  if (!_guard) _push(null);
  document.title = 'DACE · Beats';
};

function _safeOpen(id) {
  _guard = true;
  try { window.openModal(id); } finally { _guard = false; }
}

function _safeClose() {
  _guard = true;
  try {
    if (_savedClose) _savedClose();
    document.title = 'DACE · Beats';
  } finally { _guard = false; }
}

window.addEventListener('popstate', () => {
  const id = _getId();
  if (id) _safeOpen(id);
  else _safeClose();
});

function _tryHash() {
  const id = _getId();
  if (!id) return;
  if (state.allBeats && state.allBeats.length > 0) _safeOpen(id);
  else setTimeout(_tryHash, 300);
}

setTimeout(_tryHash, 500);
