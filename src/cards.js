// ═══ DACEWAV.STORE — Beat Cards & Modal ═══
import { state } from './state.js';
import { hexRgba, applyAnim } from './utils.js';
import { ANIMS } from './config.js';
import { AP } from './player.js';
import { toggleWish } from './wishlist.js';
import { applyWaveformToCard } from './waveform.js';
import { setupCardTilt, observeStagger, animateCounter } from './effects.js';

export function beatCard(b, globalIdx) {
  const isCurrent = AP.currentBeatIdx === globalIdx;
  const isPlay = isCurrent && AP.playing;
  const T = state.T;

  const bars = Array.from({ length: 20 }, (_, i) => {
    const _wh = T.wbarHeight || 12;
    const h = Math.max(4, _wh * 0.4 + Math.sin(i * 0.9 + parseInt(b.id || 0) * 2) * _wh + Math.cos(i * 1.4) * (_wh * 0.6));
    const dur = (0.3 + Math.random() * 0.5).toFixed(2);
    return `<div class="wbar${isPlay ? ' anim' : ''}" style="height:${h}px;--wd:${dur}s;animation-delay:${(i * 0.05).toFixed(2)}s"></div>`;
  }).join('');

  const lics = b.licenses || [];
  const minL = lics[0];
  const imgH = b.imageUrl
    ? `<img src="${b.imageUrl}" alt="${b.name}" loading="lazy">`
    : '<div class="beat-img-ph">♦</div>';
  const isWished = state.wishlist.indexOf(b.id) > -1;

  // Per-beat glow animation classes
  let glowClasses = '';
  let glowStyle = '';
  if (b.glowConfig && b.glowConfig.enabled) {
    const gc = b.glowConfig;
    const glowType = gc.type || 'active'; // active, rgb, pulse, breathe, neon
    glowClasses = 'glow-' + glowType;
    if (gc.color) {
      // Parse hex to RGB for CSS custom properties
      const hex = gc.color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16) || 220;
      const gv = parseInt(hex.substring(2, 4), 16) || 38;
      const bl = parseInt(hex.substring(4, 6), 16) || 38;
      glowStyle = `--glow-clr:${gc.color};--glow-r:${r};--glow-g:${gv};--glow-b:${bl};--glow-speed:${gc.speed || 3}s`;
    }
  }

  // Per-beat card animation
  let animClass = '';
  let animStyle = '';
  if (b.cardAnim && b.cardAnim.type) {
    animClass = 'anim-' + b.cardAnim.type;
    animStyle = `--ad:${b.cardAnim.dur || 2}s;--adl:${b.cardAnim.del || 0}s`;
  }

  // Per-beat card border
  let borderStyle = '';
  if (b.cardBorder && b.cardBorder.enabled) {
    borderStyle = `border:${b.cardBorder.width || 1}px solid ${b.cardBorder.color || '#dc2626'}`;
  }

  // Combine all classes
  const allClasses = [
    'beat-card',
    isPlay ? 'is-playing' : '',
    b.featured ? 'featured' : '',
    glowClasses,
    animClass,
    b.shimmer ? 'shimmer-on' : ''
  ].filter(Boolean).join(' ');

  // Combine all inline styles
  const allStyles = [
    `--card-tint:${b.accentColor ? `linear-gradient(135deg,${b.accentColor},transparent)` : 'linear-gradient(135deg,rgba(185,28,28,0.3),transparent)'}`,
    glowStyle,
    animStyle,
    borderStyle
  ].filter(Boolean).join(';');

  return `<div class="${allClasses}" id="card-${b.id}"
    onclick="handleCardClick('${b.id}',${globalIdx})"
    style="${allStyles}">
    <div class="shimmer-overlay"></div>
    <button class="wish-btn${isWished ? ' active' : ''}" data-id="${b.id}" onclick="toggleWish('${b.id}',event)">${isWished ? '♥' : '♡'}</button>
    <div class="beat-card-inner">
      <div class="beat-img">${imgH}
        <div class="beat-wave-row">${bars}</div>
        <div class="play-hint"><div class="play-circle"><svg width="16" height="16" viewBox="0 0 16 16" fill="white"><path d="${isPlay ? 'M4 2h2v12H4zM10 2h2v12h-2z' : 'M5 3l10 5-10 5V3z'}"/></svg></div></div>
      </div>
      <div class="beat-body">
        <div class="beat-name">${b.name}${b.exclusive ? '<span class="tag" style="border-color:rgba(185,28,28,.5);color:var(--accent);margin-left:6px">EXCL</span>' : ''}</div>
        <div class="beat-meta-row">
          <span>${b.bpm} BPM</span><span>${b.key}</span><span>${b.genre}</span>
          ${b.plays ? `<span>▶ ${b.plays}</span>` : ''}
        </div>
        <div class="beat-tags-row">${(b.tags || []).map((t) => `<span class="tag">${t}</span>`).join('')}</div>
        <div class="beat-foot">${b.available !== false
          ? `<div><div class="price-from">desde</div><div class="price-main">$${minL ? minL.priceMXN.toLocaleString() : '350'} <span style="font-size:11px;color:var(--muted);font-weight:400">MXN</span><span class="price-usd">· $${minL ? minL.priceUSD : '18'} USD</span></div></div><button class="btn-lic" onclick="event.stopPropagation();openModal('${b.id}')">Ver licencias</button>`
          : '<span class="unavail-lbl">No disponible</span>'}</div>
      </div>
    </div>
  </div>`;
}

export function handleCardClick(id, idx) {
  const b = state.allBeats.find((x) => x.id === id);
  if (!b || b.available === false) return;
  if (!b.audioUrl && !b.previewUrl) { openModal(id); return; }
  if (AP.currentBeatIdx === idx) { AP.toggle(); return; }
  AP.playIdx(idx);
}

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
  const title = beat.name + ' · DACE Beats';
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
export function openModal(id) {
  const b = state.allBeats.find((x) => x.id === id);
  if (!b) return;
  state.modalBeatId = id;
  _updateOG(b);

  document.getElementById('m-name').textContent = b.name;
  document.getElementById('m-sub').innerHTML = `<span>${b.bpm} BPM</span><span>${b.key}</span><span>${b.genre}</span>`;

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
  if (mTags) mTags.innerHTML = (b.tags || []).map((t) => `<span class="tag">${t}</span>`).join('');

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
        <div class="lic-name">${l.name}</div>
        <div class="lic-desc">${l.description}</div>
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

  // Use a unified approach: playIdx handles everything (including modal state)
  if (AP.currentBeatIdx === bi && AP.playing) {
    // Same beat is playing — toggle pause
    AP.toggle();
  } else {
    // Different beat or not playing — play via global player
    // The global player will also update modal button via _updateIcons
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

// ─── Render All ───
export function renderAll() {
  const feat = state.allBeats.filter((b) => b.featured);
  const fs = document.getElementById('section-featured');
  if (feat.length && fs) {
    fs.style.display = 'block';
    document.getElementById('feat-grid').innerHTML = feat.map((b) => beatCard(b, state.allBeats.indexOf(b))).join('');
  } else if (fs) {
    fs.style.display = 'none';
  }

  if (typeof window.buildFilterOptions === 'function') window.buildFilterOptions();
  if (typeof window.buildTagCloud === 'function') window.buildTagCloud();
  if (typeof window.buildFilters === 'function') window.buildFilters();
  if (typeof window.applyFilters === 'function') window.applyFilters();

  const stBeats = document.getElementById('st-beats');
  if (stBeats) animateCounter(stBeats, state.allBeats.length);

  const stGenres = document.getElementById('st-genres');
  if (stGenres) animateCounter(stGenres, new Set(state.allBeats.map((b) => b.genre)).size);

  const sk = document.getElementById('skeleton-grid');
  if (sk) sk.style.display = 'none';

  setTimeout(() => { setupCardTilt(); observeStagger(); }, 50);
  setTimeout(() => {
    state.allBeats.forEach((b) => { if (b.previewUrl) applyWaveformToCard(b.id); });
  }, 500);

  // Sync player bar thumbnail
  if (AP.currentBeatIdx >= 0 && AP.currentBeatIdx < state.allBeats.length) {
    const cb = state.allBeats[AP.currentBeatIdx];
    if (cb?.imageUrl) {
      const th = document.getElementById('pi-thumb');
      if (th) {
        const bustUrl = cb.imageUrl.split('?')[0] + '?t=' + Date.now();
        th.innerHTML = `<img src="${bustUrl}" alt="" loading="lazy">`;
      }
    }
  }
}

export function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}
