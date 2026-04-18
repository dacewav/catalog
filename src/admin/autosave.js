// ═══ DACEWAV Admin — Auto-Save ═══
// autoSave, saveAll, _collectSiteSettings

import { db, siteSettings } from './state.js';
import { pushUndo } from './undo.js';
import { logFieldChange } from './changelog.js';
import { g, val, checked, showToast, showSaving } from './helpers.js';
import { tczGetSegments } from './text-colorizer.js';

// Deps injected from core.js
let _collectThemeFn, _broadcastThemeFn;
export function setAutoSaveDeps({ collectTheme, broadcastTheme }) {
  _collectThemeFn = collectTheme;
  _broadcastThemeFn = broadcastTheme;
}

let _autoSaveTimer = null;

export function autoSave() {
  clearTimeout(_autoSaveTimer);
  try { pushUndo(); } catch {}
  try { logFieldChange(); } catch {}
  try { _broadcastThemeFn(); } catch {}
  const dot = g('sdot'); if (dot) dot.className = 'sdot';
  _autoSaveTimer = setTimeout(() => {
    try {
      const theme = _collectThemeFn();
      localStorage.setItem('dace-theme', JSON.stringify(theme));
      if (!db) { if (dot) dot.className = 'sdot ok'; return; }
      _collectSiteSettings();
      const p1 = db.ref('theme').update(theme).catch(e => console.warn('[autoSave] theme:', e.code));
      const p2 = db.ref('settings').update(siteSettings).catch(e => console.warn('[autoSave] settings:', e.code));
      Promise.all([p1, p2]).then(() => { if (dot) { dot.className = 'sdot ok'; setTimeout(() => dot.className = 'sdot', 2000); } }).catch(() => { if (dot) dot.className = 'sdot err'; });
    } catch (e) {
      console.error('[autoSave] collectTheme error:', e);
      if (dot) dot.className = 'sdot err';
    }
  }, 2000);
}

export function saveAll() {
  try {
    const theme = _collectThemeFn(); pushUndo();
    localStorage.setItem('dace-theme', JSON.stringify(theme));
    _collectSiteSettings();
    localStorage.setItem('dace-settings', JSON.stringify(siteSettings));
    showSaving(true);
    if (db) {
      Promise.all([db.ref('theme').set(theme), db.ref('settings').update(siteSettings)])
        .then(() => { showSaving(false); showToast('Todo guardado ✓') })
        .catch(err => { showSaving(false); showToast('Error: ' + (err.message || 'desconocido'), true) });
    } else { showSaving(false); showToast('Guardado local ✓'); }
  } catch (e) {
    showSaving(false);
    showToast('Error al recopilar datos: ' + (e.message || 'desconocido'), true);
    console.error('[saveAll]', e);
  }
}

export function _collectSiteSettings() {
  siteSettings.siteName = val('s-name') || 'DACE';
  siteSettings.whatsapp = val('s-wa') || '';
  siteSettings.instagram = val('s-ig') || '';
  siteSettings.email = val('s-email') || '';
  siteSettings.heroTitle = val('s-hero') || '';
  siteSettings.heroSubtitle = val('s-sub') || '';
  siteSettings.dividerTitle = val('s-div-title') || '';
  siteSettings.dividerSub = val('s-div-sub') || '';
  siteSettings.dividerTitleSegments = tczGetSegments('div-tcz');
  siteSettings.dividerTitleSize = parseFloat(val('d-title-size')) || 3;
  siteSettings.dividerLetterSpacing = parseFloat(val('d-ls')) || -0.04;
  siteSettings.dividerSubColor = val('d-sub-clr') || '';
  siteSettings.dividerSubSize = parseInt(val('d-sub-size')) || 13;
  siteSettings.dividerGlowOn = checked('d-glow-on');
  siteSettings.dividerGlowInt = parseFloat(val('d-glow-int')) || 1;
  siteSettings.dividerGlowBlur = parseInt(val('d-glow-blur')) || 20;
  siteSettings.testimonialsActive = checked('s-testi');
  siteSettings.bannerActive = checked('b-active');
  siteSettings.bannerText = val('b-text') || '';
  siteSettings.bannerBg = val('b-bg') || '#7f1d1d';
  siteSettings.bannerSpeed = parseInt(val('b-speed')) || 20;
  siteSettings.bannerAnim = val('b-anim') || 'scroll';
  siteSettings.bannerEasing = val('b-easing') || 'linear';
  siteSettings.bannerDir = val('b-dir') || 'normal';
  siteSettings.bannerDelay = parseFloat(val('b-delay')) || 0;
  siteSettings.bannerTxtClr = val('b-txt-clr') || '#ffffff';
  const r2Url = val('r2-worker-url') || '';
  const r2Token = val('r2-upload-token') || '';
  if (r2Url || r2Token) {
    siteSettings.r2Config = { workerUrl: r2Url, uploadToken: r2Token };
  }
}
