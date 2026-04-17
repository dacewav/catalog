// ═══ DACEWAV.STORE — Wishlist System ═══
import { state } from './state.js';
import { logError, fbCatch } from './error-handler.js';
import { esc } from './utils.js';

export function getWishlist() {
  return state.wishlist;
}

export function toggleWish(id, event) {
  if (event) { event.stopPropagation(); event.preventDefault(); }
  const idx = state.wishlist.indexOf(id);
  const btn = document.querySelector(`.wish-btn[data-id="${id}"]`);

  if (idx > -1) {
    state.wishlist.splice(idx, 1);
    if (btn) { btn.classList.remove('active'); btn.textContent = '♡'; }
  } else {
    state.wishlist.push(id);
    if (btn) {
      btn.classList.add('active');
      btn.textContent = '♥';
      btn.classList.add('pop');
      setTimeout(() => btn.classList.remove('pop'), 300);
    }
  }
  localStorage.setItem('dace-wishlist', JSON.stringify(state.wishlist));
  updateWishBadge();
  renderWishList();
}

export function updateWishBadge() {
  const badge = document.getElementById('wish-nav-badge');
  const count = document.getElementById('wl-count');

  if (badge) {
    const prev = badge.textContent;
    badge.textContent = state.wishlist.length;
    badge.style.display = state.wishlist.length ? 'flex' : 'none';
    if (prev !== String(state.wishlist.length)) {
      badge.classList.remove('pop');
      void badge.offsetWidth;
      badge.classList.add('pop');
    }
  }
  if (count) count.textContent = state.wishlist.length;
}

export function renderWishList() {
  const list = document.getElementById('wl-list');
  if (!list) return;

  if (!state.wishlist.length) {
    list.innerHTML = `<div class="wl-empty">
      <div class="wl-empty-icon">❤️</div>
      <div class="wl-empty-text">Aún no tienes favoritos.<br>Haz click en ♡ para guardar beats.</div>
    </div>`;
    return;
  }

  list.innerHTML = state.wishlist.map((id) => {
    const b = state.allBeats.find((x) => x.id === id);
    if (!b) return '';
    const lics = b.licenses || [];
    const minL = lics[0];
    const img = b.imageUrl
      ? `<img src="${b.imageUrl}" alt="" loading="lazy">`
      : '<span style="font-size:1.2rem">♦</span>';
    const price = minL ? ` · $${minL.priceMXN} MXN` : '';
    return `<div class="wl-item" onclick="openModal('${esc(b.id)}');toggleWishlist()">
      <div class="wl-item-img">${img}</div>
      <div class="wl-item-info">
        <div class="wl-item-name">${esc(b.name)}</div>
        <div class="wl-item-meta">${esc(b.bpm)} BPM · ${esc(b.key)}${price}</div>
      </div>
      <button class="wl-item-remove" onclick="event.stopPropagation();toggleWish('${esc(b.id)}')" title="Quitar">✕</button>
    </div>`;
  }).join('');
}

export function toggleWishlist() {
  const panel = document.getElementById('wishlist-panel');
  if (!panel) return;
  panel.classList.toggle('open');
  if (panel.classList.contains('open')) {
    renderWishList();
    updateWishBadge();
  }
}

export function sendWishlistWhatsApp() {
  if (!state.wishlist.length) {
    if (typeof window.showToast === 'function') window.showToast('No hay favoritos');
    return;
  }
  const lines = state.wishlist.map((id, i) => {
    const b = state.allBeats.find((x) => x.id === id);
    if (!b) return null;
    const lics = b.licenses || [];
    const minL = lics[0];
    return `${i + 1}. ${b.name} (${b.bpm} BPM · ${b.key}${minL ? ` · $${minL.priceMXN} MXN` : ''})`;
  }).filter(Boolean);

  const msg = encodeURIComponent(
    `Hola DACE, me interesan estos beats:\n\n${lines.join('\n')}\n\n¿Podemos hablar de licencias?`
  );
  const wa = state.siteSettings.whatsapp
    ? `https://wa.me/${state.siteSettings.whatsapp}?text=${msg}`
    : '#';
  window.open(wa, '_blank');
}
