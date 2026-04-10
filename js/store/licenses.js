// ════════════════════════════════════════════════════════════
// DACEWAV.STORE — Licenses Modal (js/store/licenses.js)
// ════════════════════════════════════════════════════════════

import { db } from '../firebase.js';
import { ref, get } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js';

const TIERS = ['mp3', 'wav', 'premium', 'ilimitada', 'exclusiva'];

const DEFAULT_FEATURES = {
  mp3:       ['Archivo MP3 320kbps', 'Uso no comercial', 'Hasta 2.000 streams', 'Sin stems'],
  wav:       ['Archivo WAV sin comprimir', 'Uso no comercial', 'Hasta 10.000 streams', 'Sin stems'],
  premium:   ['WAV + Stems', 'Uso comercial', 'Hasta 100.000 streams', 'Distribución en plataformas'],
  ilimitada: ['WAV + Stems', 'Uso comercial ilimitado', 'Streams ilimitados', 'Sin exclusividad'],
  exclusiva: ['WAV + Stems + Proyecto', 'Propiedad completa', 'Streams ilimitados', 'Exclusividad total'],
};

const TIER_NAMES = {
  mp3: 'MP3',
  wav: 'WAV',
  premium: 'Premium',
  ilimitada: 'Ilimitada',
  exclusiva: 'Exclusiva',
};

let overlay, tabsEl, contentEl, titleEl, closeBtn;
let descEl, tagsEl, platformsEl, actionsEl;
let configLicenses = {};
let siteConfig = {};
let currentBeat = null;
let activeTier = 'mp3';

// OG defaults
const ogDefaults = { title: null, desc: null, img: null };

export function initLicenses() {
  overlay = document.getElementById('license-overlay');
  tabsEl = document.getElementById('license-tabs');
  contentEl = document.getElementById('license-content');
  titleEl = document.getElementById('license-beat-title');
  closeBtn = document.getElementById('license-close');
  descEl = document.getElementById('license-desc');
  tagsEl = document.getElementById('license-tags');
  platformsEl = document.getElementById('license-platforms');
  actionsEl = document.getElementById('license-actions');

  // Cache OG defaults
  ogDefaults.title = document.querySelector('meta[property="og:title"]')?.content || null;
  ogDefaults.desc = document.querySelector('meta[property="og:description"]')?.content || null;
  ogDefaults.img = document.querySelector('meta[property="og:image"]')?.content || null;

  loadConfig();
  bindEvents();
}

async function loadConfig() {
  try {
    const [licSnap, siteSnap] = await Promise.all([
      get(ref(db, 'config/licenses')),
      get(ref(db, 'config/site')),
    ]);
    if (licSnap.exists()) configLicenses = licSnap.val();
    if (siteSnap.exists()) siteConfig = siteSnap.val();
  } catch (err) {
    console.warn('[DACEWAV] Config load failed:', err);
  }
}

function bindEvents() {
  document.addEventListener('beat:showLicenses', (e) => {
    if (e.detail) showModal(e.detail);
  });

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('visible')) closeModal();
  });
}

function showModal(beat) {
  currentBeat = beat;
  titleEl.textContent = beat.title || 'Licencias';

  activeTier = TIERS.find(t => !beat.exclusive || t !== 'exclusiva') || 'mp3';

  renderMeta(beat);
  renderPlatforms(beat);
  renderTabs(beat);
  renderContent(beat, activeTier);
  renderActions(beat);
  updateOG(beat);

  overlay.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  overlay.classList.remove('visible');
  document.body.style.overflow = '';
  currentBeat = null;
  restoreOG();
}

function renderMeta(beat) {
  // Description
  if (descEl) {
    if (beat.description) {
      descEl.textContent = beat.description;
      descEl.style.display = 'block';
    } else {
      descEl.style.display = 'none';
    }
  }

  // Tags
  if (tagsEl) {
    tagsEl.innerHTML = '';
    const tags = beat.tags || [];
    if (tags.length) {
      tags.forEach(t => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.textContent = t;
        tagsEl.appendChild(span);
      });
      tagsEl.style.display = 'flex';
    } else {
      tagsEl.style.display = 'none';
    }
  }
}

function renderPlatforms(beat) {
  if (!platformsEl) return;
  platformsEl.innerHTML = '';

  const links = [
    { key: 'spotify', label: '🎵 Spotify', color: '#1DB954' },
    { key: 'youtube', label: '▶ YouTube', color: '#FF0000' },
    { key: 'soundcloud', label: '☁ SoundCloud', color: '#FF5500' },
  ];

  let hasAny = false;
  links.forEach(({ key, label, color }) => {
    if (beat[key]) {
      hasAny = true;
      const a = document.createElement('a');
      a.className = 'platform-btn';
      a.href = beat[key];
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = label;
      a.style.setProperty('--plat-color', color);
      platformsEl.appendChild(a);
    }
  });

  platformsEl.style.display = hasAny ? 'flex' : 'none';
}

function renderTabs(beat) {
  tabsEl.innerHTML = '';

  TIERS.forEach(tier => {
    const tab = document.createElement('button');
    tab.className = 'license-tab';
    tab.textContent = TIER_NAMES[tier];

    if (tier === activeTier) tab.classList.add('active');
    if (tier === 'exclusiva' && beat.exclusive) {
      tab.classList.add('disabled');
      tab.title = 'Beat ya vendido exclusivamente';
    }

    tab.addEventListener('click', () => {
      if (tab.classList.contains('disabled')) return;
      activeTier = tier;
      tabsEl.querySelectorAll('.license-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderContent(beat, tier);
    });

    tabsEl.appendChild(tab);
  });
}

function renderContent(beat, tier) {
  const price = getTierPrice(beat, tier);
  const features = getTierFeatures(tier);

  contentEl.innerHTML = '';

  // Features list
  const list = document.createElement('ul');
  list.className = 'license-content__features';
  features.forEach(f => {
    const li = document.createElement('li');
    li.textContent = f;
    list.appendChild(li);
  });
  contentEl.appendChild(list);

  // Price
  const priceEl = document.createElement('div');
  priceEl.className = 'license-content__price';
  priceEl.textContent = `$${price.mxn} MXN / $${price.usd} USD`;
  contentEl.appendChild(priceEl);
}

function renderActions(beat) {
  if (!actionsEl) return;
  actionsEl.innerHTML = '';

  // BeatStars
  if (siteConfig.beatstarsUrl) {
    const btnBs = document.createElement('a');
    btnBs.className = 'btn-primary';
    btnBs.textContent = 'Comprar en BeatStars';
    btnBs.href = siteConfig.beatstarsUrl;
    btnBs.target = '_blank';
    btnBs.rel = 'noopener';
    actionsEl.appendChild(btnBs);
  }

  // WhatsApp
  const waUrl = siteConfig.whatsapp
    ? `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(`Hola DACE, me interesa licenciar el beat "${beat.title || 'Untitled'}". ¿Podemos hablar?`)}`
    : `https://wa.me/?text=${encodeURIComponent(`Hola DACE, me interesa licenciar el beat "${beat.title || 'Untitled'}". ¿Podemos hablar?`)}`;

  const btnWa = document.createElement('a');
  btnWa.className = btnBsExists() ? 'btn-secondary' : 'btn-primary';
  btnWa.textContent = '📱 WhatsApp';
  btnWa.href = waUrl;
  btnWa.target = '_blank';
  btnWa.rel = 'noopener';
  actionsEl.appendChild(btnWa);

  // Email
  if (siteConfig.contactEmail) {
    const btnEmail = document.createElement('a');
    btnEmail.className = 'btn-secondary';
    btnEmail.textContent = '✉ Email';
    btnEmail.href = `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(`Licencia: ${beat.title || 'Untitled'}`)}`;
    actionsEl.appendChild(btnEmail);
  }
}

function btnBsExists() {
  return !!siteConfig.beatstarsUrl;
}

// ── OG Tags ──
function setMeta(prop, content) {
  const el = document.querySelector(`meta[property="${prop}"]`) || document.querySelector(`meta[name="${prop}"]`);
  if (el) el.setAttribute('content', content);
}

function updateOG(beat) {
  const title = `${beat.title || 'Untitled'} · DACE Beats`;
  const parts = [];
  if (beat.bpm) parts.push(`${beat.bpm} BPM`);
  if (beat.key) parts.push(beat.key);
  if (beat.genre) parts.push(beat.genre);
  const desc = parts.join(' · ') || 'Beats exclusivos por DACEWAV';
  const img = beat.coverUrl || ogDefaults.img;

  setMeta('og:title', title);
  setMeta('twitter:title', title);
  setMeta('og:description', desc);
  setMeta('twitter:description', desc);
  if (img) {
    setMeta('og:image', img);
    setMeta('twitter:image', img);
  }
  document.title = `${beat.title || 'Untitled'} · DACE`;
}

function restoreOG() {
  if (ogDefaults.title) {
    setMeta('og:title', ogDefaults.title);
    setMeta('twitter:title', ogDefaults.title);
  }
  if (ogDefaults.desc) {
    setMeta('og:description', ogDefaults.desc);
    setMeta('twitter:description', ogDefaults.desc);
  }
  if (ogDefaults.img) {
    setMeta('og:image', ogDefaults.img);
    setMeta('twitter:image', ogDefaults.img);
  }
  document.title = 'DACE Beats — dacewav.store';
}

// ── Helpers ──
function getTierPrice(beat, tier) {
  if (beat.licenses && beat.licenses[tier]) {
    const p = beat.licenses[tier];
    return {
      mxn: typeof p === 'object' ? (p.mxn || 0) : 0,
      usd: typeof p === 'object' ? (p.usd || 0) : 0,
    };
  }

  if (configLicenses[tier]) {
    return {
      mxn: configLicenses[tier].mxn || 0,
      usd: configLicenses[tier].usd || 0,
    };
  }

  const defaults = {
    mp3:       { mxn: 299,  usd: 15  },
    wav:       { mxn: 499,  usd: 25  },
    premium:   { mxn: 999,  usd: 50  },
    ilimitada: { mxn: 1999, usd: 100 },
    exclusiva: { mxn: 4999, usd: 250 },
  };
  return defaults[tier] || { mxn: 0, usd: 0 };
}

function getTierFeatures(tier) {
  if (configLicenses[tier] && configLicenses[tier].features) {
    return configLicenses[tier].features;
  }
  return DEFAULT_FEATURES[tier] || [];
}
