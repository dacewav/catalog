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
let configLicenses = {};
let currentBeat = null;
let activeTier = 'mp3';

export function initLicenses() {
  overlay = document.getElementById('license-overlay');
  tabsEl = document.getElementById('license-tabs');
  contentEl = document.getElementById('license-content');
  titleEl = document.getElementById('license-beat-title');
  closeBtn = document.getElementById('license-close');

  loadConfigLicenses();
  bindEvents();
}

async function loadConfigLicenses() {
  try {
    const snap = await get(ref(db, 'config/licenses'));
    if (snap.exists()) {
      configLicenses = snap.val();
    }
  } catch (err) {
    console.warn('[DACEWAV] License config load failed, using defaults:', err);
  }
}

function bindEvents() {
  // Listen for show events
  document.addEventListener('beat:showLicenses', (e) => {
    if (e.detail) showModal(e.detail);
  });

  // Close
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('visible')) {
      closeModal();
    }
  });
}

function showModal(beat) {
  currentBeat = beat;
  titleEl.textContent = beat.title || 'Licencias';

  // Default to first available tier
  activeTier = TIERS.find(t => !beat.exclusive || t !== 'exclusiva') || 'mp3';

  renderTabs(beat);
  renderContent(beat, activeTier);

  overlay.classList.add('visible');
}

function closeModal() {
  overlay.classList.remove('visible');
  currentBeat = null;
}

function renderTabs(beat) {
  tabsEl.innerHTML = '';

  TIERS.forEach(tier => {
    const tab = document.createElement('button');
    tab.className = 'license-tab';
    tab.textContent = TIER_NAMES[tier];

    if (tier === activeTier) tab.classList.add('active');

    // Disable exclusiva if beat is already exclusive
    if (tier === 'exclusiva' && beat.exclusive) {
      tab.classList.add('disabled');
      tab.title = 'Beat ya vendido exclusivamente';
    }

    tab.addEventListener('click', () => {
      if (tab.classList.contains('disabled')) return;
      activeTier = tier;
      renderTabs(beat);
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

  // Actions
  const actions = document.createElement('div');
  actions.className = 'license-content__actions';

  const btnBeatstars = document.createElement('a');
  btnBeatstars.className = 'btn-primary';
  btnBeatstars.textContent = 'Comprar en BeatStars';
  btnBeatstars.target = '_blank';
  btnBeatstars.rel = 'noopener';
  // BeatStars URL from config or fallback
  btnBeatstars.href = '#';
  actions.appendChild(btnBeatstars);

  const btnContact = document.createElement('a');
  btnContact.className = 'btn-secondary';
  btnContact.textContent = 'Contactar';
  btnContact.href = '#';
  actions.appendChild(btnContact);

  // Load config for links
  loadLinks(btnBeatstars, btnContact);

  contentEl.appendChild(actions);
}

async function loadLinks(btnBeatstars, btnContact) {
  try {
    const snap = await get(ref(db, 'config/site'));
    if (snap.exists()) {
      const site = snap.val();
      if (site.beatstarsUrl) btnBeatstars.href = site.beatstarsUrl;
      if (site.contactEmail) btnContact.href = `mailto:${site.contactEmail}`;
    }
  } catch (err) {
    // Keep defaults
  }
}

function getTierPrice(beat, tier) {
  // Beat-level prices first, then config fallback, then hardcoded
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

  // Hardcoded fallback
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
