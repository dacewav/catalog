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
    initVisualEffects();
    await loadTheme();
    loadBanner();
    initCatalog(db);
    initWishlist(db);
    initPlayer();
    initLicenses();
    setupNav();
    initScrollReveal();

    // Hide loader
    setTimeout(() => {
      document.getElementById('loader')?.classList.add('hidden');
      setTimeout(() => document.getElementById('loader')?.remove(), 500);
    }, 600);
  } catch (err) {
    console.error('[DACEWAV] Init error:', err);
    document.getElementById('loader')?.remove();
  }
});

// ── Visual Effects ──
function initVisualEffects() {
  // Cursor glow
  const glow = document.getElementById('cursor-glow');
  if (glow && window.innerWidth > 768) {
    document.addEventListener('mousemove', (e) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    }, { passive: true });
  }

  // Scroll progress
  const progress = document.getElementById('scroll-progress');
  if (progress) {
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progress.style.width = pct + '%';
    }, { passive: true });
  }
}

// ── Scroll Reveal ──
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  reveals.forEach(el => observer.observe(el));
}

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

async function loadBanner() {
  try {
    const snap = await get(ref(db, 'config/site'));
    if (!snap.exists()) return;
    const site = snap.val();
    const msg = site.banner || '';
    if (!msg) return;

    const banner = document.getElementById('banner');
    const text = document.getElementById('banner-text');
    const close = document.getElementById('banner-close');
    if (!banner || !text) return;

    // Check if dismissed in this session
    if (sessionStorage.getItem('dace-banner-dismissed') === msg) return;

    text.textContent = msg;
    banner.style.display = 'flex';

    if (close) {
      close.addEventListener('click', () => {
        banner.style.display = 'none';
        sessionStorage.setItem('dace-banner-dismissed', msg);
      });
    }
  } catch {
    // silent
  }
}
