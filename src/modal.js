// ═══ DACEWAV.STORE — Modal ═══
// Beat detail modal: open, close, license selection, OG tags, player modal link.
import { state } from './state.js';
import { AP } from './player.js';
import { esc } from './utils.js';

// ─── OG Tags ───
function _setMeta(prop, content) {
  const el = document.querySelector(`meta[property="${prop}"]`) || document.querySelector(`meta[name="${prop}"]`);
  if (el) el.setAttribute('content', content);
}

const _ogDefaults = { title: null, desc: null, img: null };

function _updateOG(beat) {
  if (!_ogDefaults.title) {
    _ogDefaults.title = document.querySelector('meta[property="og:title"]')?.content;
    _ogDefaults.desc = document.querySelector('meta[property="og:description"]')?.content;
    _ogDefaults.img = document.querySelector('meta[property="og:image"]')?.content;
  }
  const title = esc(beat.name) + ' · DACE Beats';
  const desc = `${beat.bpm} BPM · ${beat.key} · ${beat.genre}${beat.licenses?.[0] ? ` · Desde $${beat.licenses[0].priceMXN} MXN` : ''}`;
  const img = beat.imageUrl || _ogDefaults.img;
  _setMeta('og:title', title); _setMeta('twitter:title', title);
  _setMeta('og:description', desc); _setMeta('twitter:description', desc);
  _setMeta('og:image', img); _setMeta('twitter:image', img);
  document.title = beat.name + ' · DACE · Beats';
}

function _restoreOG() {
  if (!_ogDefaults.title) return;
  _setMeta('og:title', _ogDefaults.title); _setMeta('twitter:title', _ogDefaults.title);
  _setMeta('og:description', _ogDefaults.desc); _setMeta('twitter:description', _ogDefaults.desc);
  _setMeta('og:image', _ogDefaults.img); _setMeta('twitter:image', _ogDefaults.img);
  document.title = 'DACE · Beats';
}

// ─── Modal ───
export function openPlayerModal() {
  const idx = AP.currentBeatIdx;
  if (idx < 0 || idx >= state.allBeats.length) return;
  openModal(state.allBeats[idx].id);
}

export function openModal(id) {
  const b = state.allBeats.find((x) => x.id === id);
  if (!b) return;
  state.modalBeatId = id;
  _updateOG(b);

  document.getElementById('m-name').textContent = b.name;
  document.getElementById('m-sub').innerHTML = `<span>${esc(b.bpm)} BPM</span><span>${esc(b.key)}</span><span>${esc(b.genre)}</span>`;

  const mhero = document.getElementById('mhero');
  const oi = mhero?.querySelector('img');
  if (oi) oi.remove();
  const ph = document.getElementById('mhero-ph');
  if (ph) ph.style.display = b.imageUrl ? 'none' : 'flex';
  if (b.imageUrl) {
    const img = document.createElement('img');
    img.src = b.imageUrl;
    img.alt = b.name;
    img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover';
    mhero?.insertBefore(img, mhero.firstChild);
  }

  const mDesc = document.getElementById('m-desc');
  if (mDesc) mDesc.textContent = b.description || '';

  const mTags = document.getElementById('m-tags');
  if (mTags) mTags.innerHTML = (b.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join('');

  const platHtml = [
    b.spotify && `<a class="plat-btn plat-spotify" href="${b.spotify}" target="_blank">🎵 Spotify</a>`,
    b.youtube && `<a class="plat-btn plat-youtube" href="${b.youtube}" target="_blank">▶ YouTube</a>`,
    b.soundcloud && `<a class="plat-btn plat-soundcloud" href="${b.soundcloud}" target="_blank">☁ SoundCloud</a>`,
  ].filter(Boolean).join('');

  const mPlat = document.getElementById('m-plat');
  if (mPlat) {
    mPlat.innerHTML = platHtml;
    mPlat.style.display = platHtml ? 'flex' : 'none';
  }

  const mLics = document.getElementById('m-lics');
  if (mLics) {
    mLics.innerHTML = (b.licenses || []).map((l, i) => `
      <div class="lic-row${i === 0 ? ' sel' : ''}" onclick="selLic(this)">
        <div class="lic-name">${esc(l.name)}</div>
        <div class="lic-desc">${esc(l.description)}</div>
        <div class="lic-p">
          <div class="lic-mxn">$${(l.priceMXN || 0).toLocaleString()} MXN</div>
          <div class="lic-usd">≈ $${l.priceUSD || 0} USD</div>
        </div>
      </div>`).join('');
  }

  const msg = encodeURIComponent(`Hola DACE, me interesa licenciar el beat "${b.name}". ¿Podemos hablar?`);
  const wa = state.siteSettings.whatsapp ? `https://wa.me/${state.siteSettings.whatsapp}?text=${msg}` : '#';
  const ig = state.siteSettings.instagram ? `https://instagram.com/${state.siteSettings.instagram}` : '#';

  const mActs = document.getElementById('m-acts');
  if (mActs) {
    mActs.innerHTML = `<a class="btn-wa" href="${wa}" target="_blank">Contactar por WhatsApp</a><a class="btn-ig" href="${ig}" target="_blank">Instagram</a>`;
  }

  const bi = state.allBeats.findIndex((x) => x.id === b.id);
  const isCurrent = AP.currentBeatIdx === bi && AP.playing;
  const mb = document.getElementById('m-play-btn');
  if (mb) {
    mb.innerHTML = isCurrent
      ? '<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2h2v12H4zM10 2h2v12h-2z"/></svg>'
      : '<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M5 3l10 5-10 5V3z"/></svg>';
  }

  const modalOv = document.getElementById('modal-ov');
  if (modalOv) modalOv.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function playModalBeat() {
  if (!state.modalBeatId) return;
  const b = state.allBeats.find((x) => x.id === state.modalBeatId);
  if (!b) return;
  const bi = state.allBeats.findIndex((x) => x.id === state.modalBeatId);

  if (AP.currentBeatIdx === bi && AP.playing) {
    AP.toggle();
  } else {
    AP.playModalBeat(b);
  }
}

export function closeModal() {
  const modalOv = document.getElementById('modal-ov');
  if (modalOv) modalOv.classList.remove('open');
  document.body.style.overflow = '';
  AP.exitModal();
  _restoreOG();
}

export function selLic(el) {
  document.querySelectorAll('.lic-row').forEach((r) => r.classList.remove('sel'));
  el.classList.add('sel');
}
