// ═══ DACEWAV Admin — Core: UI ═══
// Inspector, admin theme toggle, tooltips, floating canvas editor,
// loadThemeUI, loadSettingsUI, snapshots, emojis

import { ANIMS, EMOJIS } from './config.js';
import {
  db, T, setT, siteSettings, customEmojis, floatingEls
} from './state.js';
import { g, val, setVal, checked, setChecked, sv, showToast } from './helpers.js';
import { loadColorValues } from './colors.js';
import { updateHeroPv, updateBannerPv, updatePreview } from './core-preview.js';
import {
  autoSave, collectTheme, renderSaveSlots
} from './core-persistence.js';
import { buildAnimControls, togglePFields } from './core-effects.js';
import { populateDiffSelects } from './core-export.js';

// ═══ INSPECTOR ═══
export function toggleInspector() {
  const btn = g('inspector-btn');
  const isActive = btn.classList.toggle('acc');
  const frame = g('preview-frame');
  if (frame && frame.contentWindow) frame.contentWindow.postMessage({ type: 'inspector-mode', enabled: isActive }, '*');
  showToast(isActive ? 'Inspector ON — haz clic en el preview' : 'Inspector OFF');
}

// ═══ ADMIN THEME ═══
export function toggleAdminTheme() {
  document.body.classList.toggle('light');
  const isLight = document.body.classList.contains('light');
  g('theme-toggle').innerHTML = isLight ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  localStorage.setItem('dace-admin-theme', isLight ? 'light' : 'dark');
}

// ═══ LOAD THEME UI ═══
export function loadThemeUI() {
  if (!T || !Object.keys(T).length) return;
  const s = (id, v) => { const el = g(id); if (el && v != null) el.value = v; };
  s('tc-bg-h', T.bg); s('tc-surface-h', T.surface); s('tc-surface2-h', T.surface2);
  s('tc-text-h', T.text); s('tc-muted-h', T.muted); s('tc-hint-h', T.hint);
  s('tc-border-h', T.border); s('tc-border2-h', T.border2);
  s('tc-accent-h', T.accent); s('tc-red-h', T.red); s('tc-red-l-h', T.redL);
  s('t-font-d', T.fontDisplay); s('t-font-m', T.fontBody);
  if (g('fp-display-btn')) g('fp-display-btn').textContent = T.fontDisplay || 'Syne';
  if (g('fp-body-btn')) g('fp-body-btn').textContent = T.fontBody || 'DM Mono';
  s('t-font-size', T.fontSize); s('t-line-h', T.lineHeight);
  s('t-logo-url', T.logoUrl); s('t-logo-w', T.logoWidth);
  s('t-logo-rot', T.logoRotation || 0); s('t-logo-scale', T.logoScale || 1); s('t-logo-gap', T.logoTextGap || 12);
  setChecked('t-logo-text', T.showLogoText);
  s('tc-glow', T.glowColor || T.accent); s('tt-glow', T.glowColor || T.accent);
  s('t-glow-type', T.glowType || 'text-shadow'); s('t-glow-blur', T.glowBlur); s('t-glow-int', T.glowIntensity); s('t-glow-op', T.glowOpacity); s('t-glow-anim', T.glowAnim || 'none');
  setChecked('t-glow', T.glowActive);
  s('t-blur', T.blurBg); s('t-card-op', T.cardOpacity); s('t-grain', T.grainOpacity); s('t-radius', T.radiusGlobal);
  s('t-bg-op', T.bgOpacity); s('t-btn-op', T.btnOpacityNormal); s('t-btn-hop', T.btnOpacityHover);
  s('t-wbar-op', T.waveOpacityOff); s('t-wbar-aop', T.waveOpacityOn);
  s('tt-wbar', T.wbarColor); s('tt-wbar-a', T.wbarActive);
  s('tt-btn-bg', T.btnLicBg); s('tt-btn-clr', T.btnLicClr); s('tt-btn-bdr', T.btnLicBdr);
  s('t-pad', T.padSection); s('t-gap', T.beatGap);
  s('tc-shadow', T.cardShadowColor); s('t-shadow-int', T.cardShadowIntensity);
  s('p-color', T.particlesColor); s('p-count', T.particlesCount); s('p-min', T.particlesMin); s('p-max', T.particlesMax); s('p-speed', T.particlesSpeed);
  s('p-type', T.particlesType || 'circle'); s('p-opacity', T.particlesOpacity); s('p-text', T.particlesText || '♪'); s('p-img-url', T.particlesImgUrl || '');
  setChecked('p-on', T.particlesOn);
  togglePFields();
  s('b-text', T.bannerText); s('b-bg', T.bannerBg); s('b-speed', T.bannerSpeed); s('b-anim', T.bannerAnim || 'scroll');
  if (T.layout) { s('t-hero-top', T.layout.heroMarginTop); s('t-player-bot', T.layout.playerBottom); s('t-logo-ox', T.layout.logoOffsetX); }
  if (T.heroTitleCustom) s('h-title', T.heroTitleCustom);
  if (T.heroSubCustom) s('h-sub', T.heroSubCustom);
  if (T.heroEyebrow) s('h-eyebrow', T.heroEyebrow);
  s('h-glow-int', T.heroGlowInt); s('h-glow-blur', T.heroGlowBlur);
  setChecked('h-glow-on', T.heroGlowOn); setChecked('h-stroke-on', T.heroStrokeOn);
  s('h-stroke-w', T.heroStrokeW); s('h-word-blur', T.heroWordBlur); s('h-word-op', T.heroWordOp); s('h-stroke-clr', T.heroStrokeClr);
  setChecked('h-grad-on', T.heroGradOn); s('h-grad-clr', T.heroGradClr); s('h-grad-op', T.heroGradOp); s('h-grad-w', T.heroGradW); s('h-grad-h', T.heroGradH);
  s('h-title-size', T.heroTitleSize); s('h-pad-top', T.heroPadTop); s('h-ls', T.heroLetterSpacing); s('h-lh', T.heroLineHeight);
  setChecked('h-eyebrow-on', T.heroEyebrowOn); s('h-eyebrow-clr', T.heroEyebrowClr); s('h-eyebrow-size', T.heroEyebrowSize);
  s('t-nav-op', T.navOpacity); s('t-beat-img-op', T.beatImgOpacity); s('t-text-op', T.textOpacity);
  s('t-hero-bg-op', T.heroBgOpacity); s('t-section-op', T.sectionOpacity);
  if (T.orbBlendMode) { var ob = g('t-orb-blend'); if (ob) ob.value = T.orbBlendMode; }
  if (T.grainBlendMode) { var gb = g('t-grain-blend'); if (gb) gb.value = T.grainBlendMode; }
  s('t-glow-speed', T.glowAnimSpeed); s('t-wbar-h', T.wbarHeight); s('t-wbar-r', T.wbarRadius);
  if (T.fontWeight) { var fw = g('t-font-weight'); if (fw) fw.value = T.fontWeight; }
  document.querySelectorAll('.slider-wrap input[type=range]').forEach(el => sv(el));
  loadColorValues();
  const gs = g('gc-swatch'); if (gs) gs.style.background = T.glowColor || T.accent || '#dc2626';
  const ht = g('hpv-title'), he = g('hpv-eyebrow'), hs = g('hpv-sub');
  if (ht && T.heroDragTitleTop != null) { ht.style.top = T.heroDragTitleTop + 'px'; ht.style.left = (T.heroDragTitleLeft || 0) + 'px'; }
  if (he && T.heroDragEyebrowTop != null) { he.style.top = T.heroDragEyebrowTop + 'px'; he.style.left = (T.heroDragEyebrowLeft || 0) + 'px'; }
  if (hs && T.heroDragSubTop != null) { hs.style.top = T.heroDragSubTop + 'px'; hs.style.left = (T.heroDragSubLeft || 0) + 'px'; }
  loadAndPreviewFont(); updatePreview(); updateHeroPv(); updateBannerPv();
  renderSaveSlots(); buildAnimControls();
}

// ═══ LOAD SETTINGS UI ═══
export function loadSettingsUI() {
  setVal('s-name', siteSettings.siteName || 'DACE'); setVal('s-wa', siteSettings.whatsapp || '');
  setVal('s-ig', siteSettings.instagram || ''); setVal('s-email', siteSettings.email || '');
  setVal('s-hero', siteSettings.heroTitle || ''); setVal('s-sub', siteSettings.heroSubtitle || '');
  setVal('s-div-title', siteSettings.dividerTitle || ''); setVal('s-div-sub', siteSettings.dividerSub || '');
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
}

// ═══ TOOLTIPS ═══
export function addTooltips() {
  const tips = { 'tc-bg': 'Color de fondo principal', 'tc-surface': 'Color de superficie de tarjetas', 'tc-accent': 'Color de acento / resaltado', 't-font-d': 'Fuente para títulos', 't-font-m': 'Fuente para textos secundarios', 't-font-size': 'Tamaño base de toda la tienda', 't-line-h': 'Espacio entre líneas', 't-glow': 'Activa/desactiva glow global', 't-glow-type': 'Tipo de efecto glow', 't-glow-anim': 'Animación del glow', 't-blur': 'Desenfoque del fondo', 't-grain': 'Intensidad del grano', 't-radius': 'Radio de bordes', 'p-on': 'Partículas flotantes', 'p-type': 'Forma de partículas', 'p-count': 'Número de partículas', 'h-title': 'Título principal del hero', 'h-sub': 'Subtítulo', 'h-grad-on': 'Degradado radial', 'h-title-size': 'Tamaño del título', 'h-stroke-on': 'Outline última palabra', 'h-glow-on': 'Brillo del título', 't-logo-url': 'URL del logo', 't-logo-w': 'Ancho del logo', 's-name': 'Nombre del sitio', 's-wa': 'WhatsApp', 's-ig': 'Instagram' };
  Object.entries(tips).forEach(([id, text]) => {
    const el = g(id); if (!el) return;
    const label = el.closest('.field,.color-wrap,.tog-row')?.querySelector('label');
    if (label && !label.querySelector('.tip')) { const tip = document.createElement('span'); tip.className = 'tip'; tip.title = text; tip.textContent = '?'; label.appendChild(tip); }
  });
}

// ═══ FLOATING CANVAS EDITOR ═══
export function renderFloatingEditor() {
  const container = g('floating-editor'); if (!container) return;
  const els = Object.entries(floatingEls);
  container.innerHTML = els.length ? els.map(([k, el]) => {
    return '<div class="fe-ed-item" data-key="' + k + '" style="background:var(--as2);border:1px solid var(--b);border-radius:var(--rad);padding:8px;margin-bottom:6px">'
      + '<div class="fg3"><div class="field"><label>X</label><input type="number" value="' + (el.x || 0) + '" data-f="x"></div>'
      + '<div class="field"><label>Y</label><input type="number" value="' + (el.y || 0) + '" data-f="y"></div>'
      + '<div class="field"><label>Ancho</label><input type="number" value="' + (el.width || 100) + '" data-f="width"></div></div>'
      + '<div class="fg3"><div class="field"><label>Alto</label><input type="number" value="' + (el.height || 100) + '" data-f="height"></div>'
      + '<div class="field"><label>Opacidad</label><input type="number" min="0" max="1" step="0.05" value="' + (el.opacity != null ? el.opacity : 1) + '" data-f="opacity"></div>'
      + '<div class="field"><label>Visible</label><input type="checkbox" class="tog" ' + (el.visible !== false ? 'checked' : '') + ' data-f="visible"></div></div>'
      + '<div class="fg2"><div class="field"><label>Tipo</label><select data-f="type"><option value="image"' + (el.type === 'image' ? ' selected' : '') + '>Imagen</option><option value="text"' + (el.type === 'text' ? ' selected' : '') + '>Texto</option></select></div>'
      + '<div class="field"><label>Anim</label><select data-f="anim">' + ANIMS.map(a => '<option value="' + a + '"' + (el.anim === a ? ' selected' : '') + '>' + a + '</option>').join('') + '</select></div></div>'
      + '<div class="field"><label>Contenido (URL o texto)</label><input type="text" value="' + (el.content || '') + '" data-f="content"></div>'
      + '<div class="btn-row" style="margin-top:6px"><button class="btn btn-ok" onclick="saveFE(\'' + k + '\')" style="font-size:9px">Guardar</button><button class="btn btn-del" onclick="rmFE(\'' + k + '\')" style="font-size:9px">✕</button></div></div>';
  }).join('') : '<div style="color:var(--hi);font-size:10px">Sin elementos flotantes.</div>';
}
export function renderFloatingPreview() {
  const pv = g('floating-preview'); if (!pv) return; pv.innerHTML = '';
  Object.entries(floatingEls).forEach(([k, el]) => {
    if (!el || !el.visible) return;
    const d = document.createElement('div');
    const scaleX = pv.offsetWidth / 1200, scaleY = 120 / 800;
    d.style.cssText = 'position:absolute;left:' + ((el.x || 0) * scaleX) + 'px;top:' + ((el.y || 0) * scaleY) + 'px;width:' + ((el.width || 100) * scaleX) + 'px;height:' + ((el.height || 100) * scaleY) + 'px;opacity:' + (el.opacity || 1) + ';pointer-events:none';
    if (el.type === 'text') d.innerHTML = '<div style="font-size:' + Math.max(6, (el.fontSize || 16) * scaleX) + 'px;color:var(--tx);white-space:nowrap">' + (el.content || '') + '</div>';
    else if (el.content) d.innerHTML = '<img src="' + el.content + '" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display=\'none\'">';
    pv.appendChild(d);
  });
}
export function addFE() {
  const k = 'fe_' + Date.now();
  floatingEls[k] = { type: 'image', content: '', x: 100, y: 100, width: 100, height: 100, opacity: 1, visible: true, anim: 'none', animDur: 2, fontSize: 16 };
  renderFloatingEditor(); renderFloatingPreview();
}
export function saveFE(k) {
  const el = document.querySelector('.fe-ed-item[data-key="' + k + '"]'); if (!el) return;
  const f = {}; el.querySelectorAll('[data-f]').forEach(inp => { f[inp.dataset.f] = inp.type === 'checkbox' ? inp.checked : inp.value; });
  floatingEls[k] = { ...floatingEls[k], ...f, x: parseFloat(f.x) || 0, y: parseFloat(f.y) || 0, width: parseFloat(f.width) || 100, height: parseFloat(f.height) || 100, opacity: parseFloat(f.opacity) || 1, fontSize: parseInt(f.fontSize) || 16 };
  localStorage.setItem('dace-floating', JSON.stringify(floatingEls));
  if (db) db.ref('floatingElements/' + k).set(floatingEls[k]).catch(() => {});
  renderFloatingPreview(); showToast('Elemento guardado');
}
export function rmFE(k) {
  delete floatingEls[k]; localStorage.setItem('dace-floating', JSON.stringify(floatingEls));
  if (db) db.ref('floatingElements/' + k).remove().catch(() => {});
  renderFloatingEditor(); renderFloatingPreview(); showToast('Eliminado');
}

// ═══ EMOJIS ═══
export { EMOJIS } from './config.js';
export function renderEmojiGrid() { g('emoji-grid').innerHTML = EMOJIS.map(e => '<div class="emoji-btn" onclick="insertEmoji(\'' + e + '\')">' + e + '</div>').join(''); }
export function insertEmoji(e) { const b = g('b-text'); if (b) { b.value += e; updateBannerPv(); autoSave(); } }
export function renderCustomEmojis() {
  g('ce-list').innerHTML = customEmojis.length ? customEmojis.map((e, i) => '<div class="ce-item"><img src="' + e.url + '"><div class="ce-name">:' + e.name + ':</div><button class="btn btn-del" onclick="removeCE(' + i + ')" style="font-size:9px">✕</button></div>').join('') : '<div style="color:var(--hi);font-size:10px">Sin emojis personalizados</div>';
}
export function addCustomEmoji() {
  const name = val('ce-name').trim(), url = val('ce-url').trim();
  if (!name || !url) { showToast('Nombre y URL', true); return; }
  customEmojis.push({ name, url, width: parseInt(val('ce-w')) || 24, height: parseInt(val('ce-h')) || 24, anim: val('ce-anim') || 'none' });
  localStorage.setItem('dace-custom-emojis', JSON.stringify(customEmojis)); renderCustomEmojis(); updateBannerPv();
  setVal('ce-name', ''); setVal('ce-url', '');
  if (db) db.ref('customEmojis').set(customEmojis).catch(() => {});
}
export function removeCE(i) {
  customEmojis.splice(i, 1); localStorage.setItem('dace-custom-emojis', JSON.stringify(customEmojis));
  renderCustomEmojis(); updateBannerPv();
  if (db) db.ref('customEmojis').set(customEmojis).catch(() => {});
}

// ═══ SNAPSHOTS ═══
export function takeSnapshot() {
  const snaps = JSON.parse(localStorage.getItem('dace-snapshots') || '[]');
  snaps.push({ name: val('snap-name') || 'Snapshot ' + (snaps.length + 1), theme: collectTheme(), date: new Date().toISOString() });
  if (snaps.length > 10) snaps.shift();
  localStorage.setItem('dace-snapshots', JSON.stringify(snaps));
  setVal('snap-name', ''); renderSnapshots(); showToast('Snapshot guardado');
}
export function renderSnapshots() {
  const wrap = g('snapshots-list'); if (!wrap) return;
  const snaps = JSON.parse(localStorage.getItem('dace-snapshots') || '[]');
  wrap.innerHTML = snaps.length ? snaps.map((s, i) => '<div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid var(--b)"><div style="flex:1"><div style="font-size:11px;font-weight:700">' + s.name + '</div><div style="font-size:9px;color:var(--hi)">' + new Date(s.date).toLocaleString() + '</div></div><button class="btn btn-g" onclick="loadSnapshot(' + i + ')" style="font-size:9px">Cargar</button><button class="btn btn-del" onclick="rmSnapshot(' + i + ')" style="font-size:9px">✕</button></div>').join('') : '<div style="color:var(--hi);font-size:10px">Sin snapshots</div>';
  populateDiffSelects();
}
export function loadSnapshot(i) {
  const snaps = JSON.parse(localStorage.getItem('dace-snapshots') || '[]'); if (!snaps[i]) return;
  setT(snaps[i].theme); loadThemeUI(); autoSave(); showToast('Snapshot: ' + snaps[i].name);
}
export function rmSnapshot(i) {
  const snaps = JSON.parse(localStorage.getItem('dace-snapshots') || '[]'); snaps.splice(i, 1);
  localStorage.setItem('dace-snapshots', JSON.stringify(snaps)); renderSnapshots();
}
