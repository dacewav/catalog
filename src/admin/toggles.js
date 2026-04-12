// ═══ DACEWAV Admin — Toggle, Setup & Settings UI ═══
// Extracted from core.js — inspector, admin theme, hero sync, settings loader.

import { siteSettings } from './state.js';
import { g, val, setVal, checked, setChecked, showToast } from './helpers.js';
import { updateHeroPv, updateDividerPv } from './hero-preview.js';
import { initTextColorizers } from './text-colorizer.js';

let _postToFrame = null;
let _PM_ORIGIN = '*';

export function setToggleDeps({ postToFrame, PM_ORIGIN }) {
  _postToFrame = postToFrame;
  _PM_ORIGIN = PM_ORIGIN;
}

let showSectionNav = () => {};
export function setShowSectionNav(fn) { showSectionNav = fn; }

export function toggleInspector() {
  const btn = g('inspector-btn');
  const isActive = btn.classList.toggle('acc');
  const frame = g('preview-frame');
  if (frame && frame.contentWindow)
    frame.contentWindow.postMessage({ type: 'inspector-mode', enabled: isActive }, _PM_ORIGIN);
  showToast(isActive ? 'Inspector ON \u2014 haz clic en el preview' : 'Inspector OFF');
}

export function toggleAdminTheme() {
  document.body.classList.toggle('light');
  const isLight = document.body.classList.contains('light');
  g('theme-toggle').innerHTML = isLight ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  localStorage.setItem('dace-admin-theme', isLight ? 'light' : 'dark');
}

export function setupHeroSync() {
  const sHero = g('s-hero'),
    hTitle = g('h-title');
  if (sHero && hTitle) {
    sHero.addEventListener('input', function () {
      if (hTitle.value !== sHero.value) {
        hTitle.value = sHero.value;
        updateHeroPv();
      }
    });
    hTitle.addEventListener('input', function () {
      if (sHero.value !== hTitle.value) sHero.value = hTitle.value;
    });
  }
  const sSub = g('s-sub'),
    hSub = g('h-sub');
  if (sSub && hSub) {
    sSub.addEventListener('input', function () {
      if (hSub.value !== sSub.value) {
        hSub.value = sSub.value;
        updateHeroPv();
      }
    });
    hSub.addEventListener('input', function () {
      if (sSub.value !== hSub.value) sSub.value = hSub.value;
    });
  }
}

export function loadSettingsUI() {
  setVal('s-name', siteSettings.siteName || 'DACE');
  setVal('s-wa', siteSettings.whatsapp || '');
  setVal('s-ig', siteSettings.instagram || '');
  setVal('s-email', siteSettings.email || '');
  setVal('s-hero', siteSettings.heroTitle || '');
  setVal('s-sub', siteSettings.heroSubtitle || '');
  setVal('s-div-title', siteSettings.dividerTitle || '');
  setVal('s-div-sub', siteSettings.dividerSub || '');
  if (siteSettings.dividerTitleSize) setVal('d-title-size', siteSettings.dividerTitleSize);
  if (siteSettings.dividerLetterSpacing != null) setVal('d-ls', siteSettings.dividerLetterSpacing);
  if (siteSettings.dividerSubColor) setVal('d-sub-clr', siteSettings.dividerSubColor);
  if (siteSettings.dividerSubSize) setVal('d-sub-size', siteSettings.dividerSubSize);
  if (siteSettings.dividerGlowOn) setChecked('d-glow-on', true);
  if (siteSettings.dividerGlowInt != null) setVal('d-glow-int', siteSettings.dividerGlowInt);
  if (siteSettings.dividerGlowBlur) setVal('d-glow-blur', siteSettings.dividerGlowBlur);
  setChecked('s-testi', siteSettings.testimonialsActive);
  setChecked('b-active', siteSettings.bannerActive);
  setVal('b-text', siteSettings.bannerText || '');
  setVal('b-bg', siteSettings.bannerBg || '#7f1d1d');
  setVal('b-speed', siteSettings.bannerSpeed || 20);
  setVal('b-anim', siteSettings.bannerAnim || 'scroll');
  setVal('b-easing', siteSettings.bannerEasing || 'linear');
  setVal('b-dir', siteSettings.bannerDir || 'normal');
  setVal('b-delay', siteSettings.bannerDelay || 0);
  setVal('b-txt-clr', siteSettings.bannerTxtClr || '#ffffff');
  initTextColorizers();
  updateDividerPv();
}

Object.assign(window, {
  setShowSectionNav, toggleInspector, toggleAdminTheme,
  setupHeroSync, loadSettingsUI,
});
