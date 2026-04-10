// ═══ DACEWAV.STORE — Theme System ═══
import { state } from './state.js';
import { hexRgba, loadFont, applyAnim } from './utils.js';
import { ANIMS } from './config.js';
import { fbCatch } from './error-handler.js';
import { initParticles } from './effects.js';

// Change detection: only re-init expensive things when their settings actually change
let _lastParticleJSON = '';
let _lastAnimJSON = '';

export function toggleTheme() {
  state.isLightMode = !state.isLightMode;
  applyLightMode();
  localStorage.setItem('dace-light-mode', state.isLightMode ? '1' : '0');

  if (state.db) {
    state.db.ref('settings/lightMode').set(state.isLightMode).catch(fbCatch('Theme/toggle'));
  }

  try {
    localStorage.setItem('dace-theme-broadcast', JSON.stringify({
      ts: Date.now(),
      lightMode: state.isLightMode,
    }));
  } catch {}
}

export function applyLightMode() {
  document.body.classList.toggle('light-mode', state.isLightMode);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = state.isLightMode ? '☀️' : '🌙';
}

export function initThemeSync() {
  applyLightMode();

  window.addEventListener('load', () => {
    if (state.db) {
      state.db.ref('settings/lightMode').on('value', (snap) => {
        const val = snap.val();
        if (val === null) return;
        const newVal = !!val;
        if (newVal !== state.isLightMode) {
          state.isLightMode = newVal;
          applyLightMode();
          localStorage.setItem('dace-light-mode', state.isLightMode ? '1' : '0');
        }
      });
    }
  });

  window.addEventListener('storage', (e) => {
    if (e.key === 'dace-theme-broadcast' && e.newValue) {
      try {
        const d = JSON.parse(e.newValue);
        if (typeof d.lightMode === 'boolean' && d.lightMode !== state.isLightMode) {
          state.isLightMode = d.lightMode;
          applyLightMode();
          localStorage.setItem('dace-light-mode', state.isLightMode ? '1' : '0');
        }
      } catch {}
    }
  });
}

export function applyTheme(t) {
  state.T = t;
  const r = document.documentElement;

  // Base color map
  const map = {
    bg: '--bg', surface: '--surface', surface2: '--surface2', accent: '--accent',
    text: '--text', muted: '--muted', hint: '--hint', border: '--border',
    border2: '--border2', red: '--red', redL: '--red-l',
  };
  Object.keys(map).forEach((k) => { if (t[k]) r.style.setProperty(map[k], t[k]); });

  // Effect properties
  if (t.cardOpacity != null && t.surface) r.style.setProperty('--surface', hexRgba(t.surface, Math.min(1, t.cardOpacity)));
  if (t.blurBg != null) r.style.setProperty('--blur-bg', t.blurBg + 'px');
  if (t.grainOpacity != null) r.style.setProperty('--grain-opacity', t.grainOpacity);
  if (t.radiusGlobal != null) {
    r.style.setProperty('--r', t.radiusGlobal + 'px');
    r.style.setProperty('--r-lg', Math.round(t.radiusGlobal * 1.6) + 'px');
  }
  if (t.padSection != null) r.style.setProperty('--pad-section', t.padSection + 'rem');
  if (t.beatGap != null) r.style.setProperty('--beat-gap', t.beatGap + 'px');
  if (t.wbarColor) r.style.setProperty('--wbar-color', t.wbarColor);
  if (t.wbarActive) r.style.setProperty('--wbar-active', t.wbarActive);
  if (t.btnLicBg) r.style.setProperty('--btn-lic-bg', t.btnLicBg);
  if (t.btnLicClr) r.style.setProperty('--btn-lic-clr', t.btnLicClr);
  if (t.btnLicBdr) r.style.setProperty('--btn-lic-bdr', t.btnLicBdr);
  if (t.bgOpacity != null) r.style.setProperty('--bg-opacity', t.bgOpacity);
  if (t.btnOpacityNormal != null) r.style.setProperty('--btn-opacity', t.btnOpacityNormal);
  if (t.btnOpacityHover != null) r.style.setProperty('--btn-opacity-hover', t.btnOpacityHover);
  if (t.waveOpacityOff != null) r.style.setProperty('--wave-opacity-off', t.waveOpacityOff);
  if (t.waveOpacityOn != null) r.style.setProperty('--wave-opacity-on', t.waveOpacityOn);
  if (t.logoScale) r.style.setProperty('--logo-scale', t.logoScale);
  if (t.logoTextGap != null) r.style.setProperty('--logo-text-gap', t.logoTextGap + 'px');

  // Card shadow
  if (t.cardShadowIntensity != null && t.cardShadowColor) {
    r.style.setProperty('--card-shadow', `0 12px 40px ${hexRgba(t.cardShadowColor, t.cardShadowIntensity)}`);
  }

  // Layout
  if (t.layout) {
    if (t.layout.heroMarginTop != null) r.style.setProperty('--hero-pad-top', t.layout.heroMarginTop + 'rem');
    if (t.layout.playerBottom != null) r.style.setProperty('--player-bottom', t.layout.playerBottom + 'px');
    if (t.layout.logoOffsetX != null) r.style.setProperty('--logo-offset-x', t.layout.logoOffsetX + 'px');
  }

  // Glow system
  const a = t.glowColor || t.accent || '#dc2626';
  const gi = t.glowIntensity ?? 1;
  const go = t.glowOpacity ?? 1;
  if (t.glowActive === false || gi === 0) {
    r.style.setProperty('--glow-sm', 'none');
    r.style.setProperty('--glow-md', 'none');
  } else {
    const gc = hexRgba(a, gi * go);
    const gc50 = hexRgba(a, gi * go * 0.5);
    const gBlur = t.glowBlur || 20;
    r.style.setProperty('--glow-sm', `0 0 ${gBlur}px ${gc}`);
    r.style.setProperty('--glow-md', `0 0 ${gBlur * 2}px ${gc50}`);
  }

  const gAnim = t.glowAnim || 'none';
  if (gAnim !== 'none') {
    r.style.setProperty('--glow-anim-name', 'glow-' + gAnim);
    r.style.setProperty('--glow-anim-duration', (t.glowAnimSpeed || 2) + 's');
  } else {
    r.style.setProperty('--glow-anim-name', 'none');
  }

  // Fonts
  if (t.fontDisplay) {
    loadFont(t.fontDisplay);
    r.style.setProperty('--font-d', `'${t.fontDisplay}',sans-serif`);
  }
  if (t.fontBody) {
    loadFont(t.fontBody);
    r.style.setProperty('--font-m', `'${t.fontBody}',monospace`);
  }
  if (t.fontSize) r.style.fontSize = t.fontSize + 'px';
  if (t.lineHeight) r.style.lineHeight = t.lineHeight;

  // Hero section-level styles (title HTML is managed by settings.js _buildHero)
  const heroSection = document.getElementById('hero-section');
  const heroAccent = t.heroStrokeClr || t.glowColor || a;

  if (heroSection) {
    const gradOn = t.heroGradOn !== false;
    const gradClr = t.heroGradClr || a;
    const gradOp = t.heroGradOp != null ? t.heroGradOp : 0.14;
    const gradW = t.heroGradW || 80;
    const gradH = t.heroGradH || 60;
    heroSection.style.setProperty('--hero-grad',
      gradOn ? `radial-gradient(ellipse ${gradW}% ${gradH}% at 50% 0%, ${hexRgba(gradClr, gradOp)}, transparent)` : 'none'
    );
    if (t.heroPadTop != null) heroSection.style.setProperty('--hero-pad-top', t.heroPadTop + 'rem');
  }

  // Eyebrow styling (text is set by settings.js)
  const eyebrow = document.getElementById('hero-eyebrow');
  if (eyebrow) {
    if (t.heroEyebrowOn === false) {
      eyebrow.style.display = 'none';
    } else {
      eyebrow.style.display = '';
      const eyClr = t.heroEyebrowClr || heroAccent;
      eyebrow.style.color = eyClr;
      eyebrow.style.borderColor = hexRgba(eyClr, 0.3);
      eyebrow.style.background = hexRgba(eyClr, 0.08);
      if (t.heroEyebrowSize) eyebrow.style.fontSize = t.heroEyebrowSize + 'px';
    }
  }

  // Loader brand
  const lb = document.getElementById('loader-brand');
  if (lb && t.accent) {
    const em = lb.querySelector('em');
    if (em) em.style.color = t.accent;
    document.querySelectorAll('.ld').forEach((d) => { d.style.background = t.accent; });
  }
  if (t.bg) {
    const loader = document.getElementById('loader');
    if (loader) loader.style.background = t.bg;
  }

  // Banner
  const banner = document.getElementById('site-banner');
  if (banner) {
    banner.style.background = t.bannerBg || '#7f1d1d';
    banner.style.setProperty('--banner-speed', (t.bannerSpeed || 20) + 's');
  }

  // Opacity properties
  if (t.navOpacity != null) r.style.setProperty('--nav-op', t.navOpacity);
  if (t.beatImgOpacity != null) r.style.setProperty('--beat-img-op', t.beatImgOpacity);
  if (t.textOpacity != null) r.style.setProperty('--text-op', t.textOpacity);
  if (t.heroBgOpacity != null) r.style.setProperty('--hero-bg-op', t.heroBgOpacity);
  if (t.sectionOpacity != null) r.style.setProperty('--section-op', t.sectionOpacity);

  // Blend modes
  if (t.orbBlendMode) r.style.setProperty('--orb-blend', t.orbBlendMode);
  if (t.grainBlendMode) r.style.setProperty('--grain-blend', t.grainBlendMode);
  if (t.wbarHeight != null) r.style.setProperty('--wbar-h', t.wbarHeight + 'px');
  if (t.wbarRadius != null) r.style.setProperty('--wbar-r', t.wbarRadius + 'px');
  if (t.fontWeight) r.style.setProperty('--font-w', t.fontWeight);

  // Animations — only re-apply when anim settings actually changed
  const animKey = JSON.stringify([t.animLogo, t.animTitle, t.animPlayer, t.animCards, t.animButtons, t.animWaveform]);
  if (animKey !== _lastAnimJSON) {
    _lastAnimJSON = animKey;
    applyAnim(document.querySelector('.nav-brand'), t.animLogo, ANIMS);
    applyAnim(document.getElementById('hero-title'), t.animTitle, ANIMS);
    applyAnim(document.getElementById('player-bar'), t.animPlayer, ANIMS);
    document.querySelectorAll('.beat-card').forEach((c) => applyAnim(c, t.animCards, ANIMS));
    document.querySelectorAll('.btn-lic,.nav-cta,.btn-wa').forEach((b) => applyAnim(b, t.animButtons, ANIMS));
  }

  // Particles — only re-init when particle settings actually changed
  const partKey = JSON.stringify([t.particlesOn, t.particlesCount, t.particlesMin, t.particlesMax, t.particlesSpeed, t.particlesType, t.particlesColor, t.particlesOpacity, t.particlesText, t.particlesImgUrl]);
  if (partKey !== _lastParticleJSON) {
    _lastParticleJSON = partKey;
    initParticles();
  }
}
