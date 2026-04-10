// ════════════════════════════════════════════════════════════
// DACEWAV.STORE — Store Main (js/store/main.js)
// ════════════════════════════════════════════════════════════

import { db } from '../firebase.js';
import { ref, get } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js';
import { initCatalog } from './catalog.js';
import { initPlayer } from './player.js';
import { initLicenses } from './licenses.js';
import { initWishlist } from './wishlist.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadTheme();
    initCatalog(db);
    initWishlist(db);
    initPlayer();
    initLicenses();
    setupNav();
  } catch (err) {
    console.error('[DACEWAV] Init error:', err);
  }
});

async function loadTheme() {
  try {
    const snap = await get(ref(db, 'config/theme'));
    if (!snap.exists()) return;
    const theme = snap.val();
    const root = document.documentElement;

    const varMap = {
      colorPrimary:    '--color-primary',
      colorPrimaryGlow:'--color-primary-glow',
      colorAccent:     '--color-accent',
      colorAccentSoft: '--color-accent-soft',
      colorBg:         '--color-bg',
      colorSurface:    '--color-surface',
      colorSurface2:   '--color-surface-2',
      colorBorder:     '--color-border',
      colorText:       '--color-text',
      colorMuted:      '--color-text-muted',
      colorDim:        '--color-text-dim',
      glowIntensity:   null,
      grainOpacity:    '--grain-opacity',
      fontDisplay:     '--font-display',
      fontBody:        '--font-body',
    };

    for (const [key, cssVar] of Object.entries(varMap)) {
      if (theme[key] === undefined || cssVar === null) continue;

      if (key === 'glowIntensity') {
        const val = parseInt(theme[key], 10) || 40;
        const opacity = (parseInt(theme[key], 10) || 60) / 100;
        root.style.setProperty('--glow-primary', `0 0 ${val}px rgba(107, 26, 42, ${opacity})`);
        continue;
      }

      if (key === 'fontDisplay' || key === 'fontBody') {
        root.style.setProperty(cssVar, `'${theme[key]}', sans-serif`);
        continue;
      }

      root.style.setProperty(cssVar, theme[key]);
    }
  } catch (err) {
    console.warn('[DACEWAV] Theme load failed, using defaults:', err);
  }
}

function setupNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('nav--scrolled', window.scrollY > 80);
  }, { passive: true });
}
