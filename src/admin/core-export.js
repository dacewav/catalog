// ═══ DACEWAV Admin — Core: Export/Import ═══
// Export all, import all, export CSS, import URL, visual diff, change log

import {
  db, siteSettings, customEmojis, floatingEls, allBeats, defLics, customLinks,
  _changeLog, _lastChangeValues, T, setT
} from './state.js';
import { g, val, showToast, showSaving } from './helpers.js';
import { collectTheme } from './core-persistence.js';
import { loadThemeUI } from './core-ui.js';
import { autoSave } from './core-persistence.js';

// ═══ EXPORT/IMPORT ═══
export function exportAll() {
  const data = { beats: allBeats, theme: collectTheme(), settings: siteSettings, defaultLicenses: defLics, customLinks, customEmojis, floatingEls };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'dace-backup-' + new Date().toISOString().slice(0, 10) + '.json'; a.click(); showToast('Exportado ✓');
}
export function importAll(e) {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result); if (!confirm('¿Importar? Sobreescribirá todo.')) return;
      showSaving(true); const updates = {};
      if (data.beats) data.beats.forEach(b => updates['beats/' + b.id] = b);
      if (data.theme) updates['theme'] = data.theme;
      if (data.settings) updates['settings'] = data.settings;
      if (data.defaultLicenses) updates['defaultLicenses'] = data.defaultLicenses;
      if (data.customLinks) updates['customLinks'] = data.customLinks;
      if (data.customEmojis) updates['customEmojis'] = data.customEmojis;
      if (data.floatingEls) updates['floatingElements'] = data.floatingEls;
      db.ref().update(updates).then(() => { showSaving(false); showToast('Importado ✓'); setTimeout(() => location.reload(), 500); }).catch(err => { showSaving(false); showToast('Error al importar: ' + (err.message || 'sin permisos'), true); });
    } catch (err) { showToast('Archivo inválido', true); }
  };
  r.readAsText(f); e.target.value = '';
}

// ═══ EXPORT CSS ═══
export function exportCSS() {
  const t = collectTheme();
  let css = ':root {\n';
  const colorMap = { bg: '--bg', surface: '--surface', surface2: '--surface2', accent: '--accent', text: '--text', muted: '--muted', hint: '--hint', border: '--border', border2: '--border2', red: '--red', redL: '--red-l', glowColor: '--glow-color', wbarColor: '--wbar-color', wbarActive: '--wbar-active', btnLicBg: '--btn-lic-bg', btnLicClr: '--btn-lic-clr', btnLicBdr: '--btn-lic-bdr', cardShadowColor: '--card-shadow-color', bannerBg: '--banner-bg', particlesColor: '--particles-color' };
  Object.entries(colorMap).forEach(([k, cssVar]) => { if (t[k]) css += '  ' + cssVar + ': ' + t[k] + ';\n'; });
  css += "  --font-d: '" + (t.fontDisplay || 'Syne') + "', sans-serif;\n";
  css += "  --font-m: '" + (t.fontBody || 'DM Mono') + "', monospace;\n";
  css += '  --font-size: ' + (t.fontSize || 14) + 'px;\n';
  css += '  --line-height: ' + (t.lineHeight || 1.7) + ';\n';
  css += '  --r: ' + (t.radiusGlobal || 10) + 'px;\n';
  css += '  --blur-bg: ' + (t.blurBg || 24) + 'px;\n';
  css += '  --grain-opacity: ' + (t.grainOpacity || 0.3) + ';\n';
  css += '  --card-opacity: ' + (t.cardOpacity || 1) + ';\n';
  css += '  --bg-opacity: ' + (t.bgOpacity || 1) + ';\n';
  css += '  --pad-section: ' + (t.padSection || 4) + 'rem;\n';
  css += '  --beat-gap: ' + (t.beatGap || 16) + 'px;\n';
  css += '  --glow-type: ' + (t.glowType || 'text-shadow') + ';\n';
  css += '  --glow-blur: ' + (t.glowBlur || 20) + 'px;\n';
  css += '  --glow-intensity: ' + (t.glowIntensity || 1) + ';\n';
  css += '  --glow-opacity: ' + (t.glowOpacity || 1) + ';\n';
  css += '  --glow-anim: ' + (t.glowAnim || 'none') + ';\n';
  css += '  --hero-margin-top: ' + (t.heroPadTop || 7) + 'rem;\n';
  css += '  --hero-title-size: ' + (t.heroTitleSize || 2.8) + 'rem;\n';
  css += '  --hero-letter-spacing: ' + (t.heroLetterSpacing || -0.04) + 'em;\n';
  css += '  --hero-line-height: ' + (t.heroLineHeight || 1) + ';\n';
  css += '  --particles-on: ' + (t.particlesOn ? '1' : '0') + ';\n';
  css += '  --particles-count: ' + (t.particlesCount || 40) + ';\n';
  css += '  --particles-speed: ' + (t.particlesSpeed || 1) + ';\n';
  css += '  --particles-opacity: ' + (t.particlesOpacity || 0.5) + ';\n';
  css += '  --btn-opacity: ' + (t.btnOpacityNormal || 1) + ';\n';
  css += '  --btn-opacity-hover: ' + (t.btnOpacityHover || 1) + ';\n';
  css += '  --wave-opacity-off: ' + (t.waveOpacityOff || 0.18) + ';\n';
  css += '  --wave-opacity-on: ' + (t.waveOpacityOn || 1) + ';\n';
  if (t.logoUrl) css += "  --logo-url: url('" + t.logoUrl + "');\n";
  css += '  --logo-width: ' + (t.logoWidth || 80) + 'px;\n';
  css += '  --logo-scale: ' + (t.logoScale || 1) + ';\n';
  css += '  --logo-rotation: ' + (t.logoRotation || 0) + 'deg;\n';
  css += '  --logo-gap: ' + (t.logoTextGap || 12) + 'px;\n';
  css += '  --shadow-intensity: ' + (t.cardShadowIntensity || 0.5) + ';\n';
  css += '  --hero-stroke-w: ' + (t.heroStrokeW || 1) + 'px;\n';
  css += '  --hero-word-blur: ' + (t.heroWordBlur || 10) + 'px;\n';
  css += '  --hero-word-opacity: ' + (t.heroWordOp || 0.35) + ';\n';
  css += '  --hero-glow-int: ' + (t.heroGlowInt || 1) + ';\n';
  css += '  --hero-glow-blur: ' + (t.heroGlowBlur || 20) + 'px;\n';
  css += '  --hero-grad-opacity: ' + (t.heroGradOp || 0.14) + ';\n';
  css += '  --hero-grad-w: ' + (t.heroGradW || 80) + '%;\n';
  css += '  --hero-grad-h: ' + (t.heroGradH || 60) + '%;\n';
  css += '  --hero-eyebrow-size: ' + (t.heroEyebrowSize || 10) + 'px;\n';
  ['logo', 'title', 'player', 'cards', 'buttons', 'waveform'].forEach(k => {
    const a = t['anim' + k.charAt(0).toUpperCase() + k.slice(1)];
    if (a) css += '  --anim-' + k + ': ' + a.type + ' ' + a.dur + 's ' + a.del + 's;\n';
  });
  css += '}';
  const blob = new Blob([css], { type: 'text/css' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'dace-theme.css'; a.click();
  showToast('CSS exportado ✓');
}

// ═══ CHANGE LOG ═══
export function logChange(label, oldVal, newVal) {
  _changeLog.unshift({ label, oldVal, newVal, time: new Date().toLocaleTimeString() });
  if (_changeLog.length > 50) _changeLog.pop();
  renderChangeLog();
}
export function renderChangeLog() {
  const wrap = g('change-log'); if (!wrap) return;
  wrap.innerHTML = _changeLog.length ? _changeLog.slice(0, 20).map(c => '<div style="display:flex;gap:6px;padding:3px 0;border-bottom:1px solid var(--b);font-size:10px"><span style="color:var(--hi);min-width:50px">' + c.time + '</span><span style="flex:1">' + c.label + '</span><span style="color:var(--mu)">' + (c.oldVal || '—') + ' → ' + (c.newVal || '—') + '</span></div>').join('') : '<div style="color:var(--hi);font-size:10px">Sin cambios registrados</div>';
}
export function logFieldChange() {
  const fields = ['tc-bg', 'tc-surface', 'tc-accent', 'tc-text', 'tc-muted', 'tc-border', 't-font-d', 't-font-m', 't-font-size', 't-line-h', 't-glow', 't-glow-type', 't-glow-blur', 't-glow-int', 't-glow-op', 't-glow-anim', 't-blur', 't-card-op', 't-grain', 't-radius', 't-bg-op', 't-btn-op', 't-btn-hop', 'h-title', 'h-sub', 'h-eyebrow', 'h-title-size', 'h-ls', 'h-lh', 'h-pad-top', 'h-stroke-on', 'h-glow-on', 'h-grad-on', 'h-grad-clr', 'h-grad-w', 'h-grad-h', 'h-word-blur', 'h-word-op', 'p-on', 'p-type', 'p-count', 'p-color', 'p-speed', 'p-opacity', 'b-active', 'b-text', 'b-anim', 'b-speed', 'b-bg', 'b-txt-clr', 't-hero-top', 't-player-bot', 't-logo-ox', 't-logo-url', 't-logo-w', 't-logo-scale', 't-logo-rot', 'tt-wbar', 'tt-wbar-a', 'tt-btn-clr', 'tt-btn-bdr', 'tt-btn-bg', 's-name', 's-wa', 's-ig', 's-email', 's-hero', 's-sub'];
  fields.forEach(id => {
    const el = g(id); if (!el) return;
    const v = el.type === 'checkbox' ? el.checked : el.value;
    if (_lastChangeValues[id] !== undefined && _lastChangeValues[id] !== v) {
      const label = el.closest('.field,.color-wrap,.tog-row')?.querySelector('label')?.textContent || id;
      const fmtVal = v => String(v).length > 30 ? String(v).slice(0, 27) + '…' : v;
      logChange(label, fmtVal(_lastChangeValues[id]), fmtVal(v));
    }
    _lastChangeValues[id] = v;
  });
}

// ═══ VISUAL DIFF ═══
export function populateDiffSelects() {
  const snaps = JSON.parse(localStorage.getItem('dace-snapshots') || '[]');
  const opts = '<option value="">— Seleccionar —</option>' + snaps.map((s, i) => '<option value="' + i + '">' + s.name + '</option>').join('');
  const da = g('diff-a'), db2 = g('diff-b');
  if (da) da.innerHTML = opts; if (db2) db2.innerHTML = opts;
}
export function updateDiff() {
  const aIdx = val('diff-a'), bIdx = val('diff-b');
  const wrap = g('diff-result'); if (!wrap) return;
  if (aIdx === '' || bIdx === '') { wrap.innerHTML = '<div style="color:var(--hi);font-size:10px">Selecciona dos snapshots</div>'; return; }
  const snaps = JSON.parse(localStorage.getItem('dace-snapshots') || '[]');
  const a = snaps[aIdx], b = snaps[bIdx]; if (!a || !b) { wrap.innerHTML = ''; return; }
  const themeA = a.theme || {}, themeB = b.theme || {};
  const allKeys = [...new Set([...Object.keys(themeA), ...Object.keys(themeB)])].sort();
  const diffs = allKeys.filter(k => JSON.stringify(themeA[k]) !== JSON.stringify(themeB[k]));
  if (!diffs.length) { wrap.innerHTML = '<div style="color:var(--gn);font-size:10px">✓ Sin diferencias</div>'; return; }
  const labels = { bg: 'Fondo', surface: 'Surface', accent: 'Acento', text: 'Texto', fontDisplay: 'Font Display', fontBody: 'Font Body', glowColor: 'Glow', glowType: 'Glow Type', glowBlur: 'Glow Blur', glowIntensity: 'Glow Int', radiusGlobal: 'Border Radius', heroTitleSize: 'Hero Title', particlesOn: 'Partículas', beatGap: 'Beat Gap', padSection: 'Pad', blurBg: 'Blur', cardOpacity: 'Card Op' };
  wrap.innerHTML = '<div style="font-size:10px;color:var(--acc);font-weight:700;margin-bottom:6px">' + diffs.length + ' cambios</div>' + diffs.map(k => {
    const label = labels[k] || k;
    const va = themeA[k] !== undefined ? String(themeA[k]).slice(0, 40) : '—';
    const vb = themeB[k] !== undefined ? String(themeB[k]).slice(0, 40) : '—';
    return '<div style="display:flex;align-items:center;gap:6px;padding:3px 0;border-bottom:1px solid var(--b);font-size:10px"><span style="min-width:80px;font-weight:600">' + label + '</span><span style="color:var(--mu);text-decoration:line-through">' + va + '</span><span style="color:var(--mu)">→</span><span style="color:var(--acc);font-weight:600">' + vb + '</span></div>';
  }).join('');
}

// ═══ IMPORT URL ═══
export function promptImportURL() {
  const url = prompt('URL del tema JSON:\n(Ej: https://mi-servidor.com/tema.json)');
  if (!url || !url.trim()) return; importThemeFromURL(url.trim());
}
export function importThemeFromURL(url) {
  showSaving(true);
  fetch(url).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).then(data => {
    showSaving(false);
    let theme = null;
    if (data.theme) theme = data.theme; else if (data.bg || data.accent || data.fontDisplay) theme = data;
    else { showToast('Formato no reconocido', true); return; }
    const snaps = JSON.parse(localStorage.getItem('dace-snapshots') || '[]');
    snaps.push({ name: 'Backup antes de import URL', theme: collectTheme(), date: new Date().toISOString() });
    if (snaps.length > 10) snaps.shift(); localStorage.setItem('dace-snapshots', JSON.stringify(snaps));
    setT({ ...T, ...theme }); loadThemeUI(); autoSave(); showToast('Tema importado desde URL ✓');
    import('./core-ui.js').then(m => { if (m.renderSnapshots) m.renderSnapshots(); });
  }).catch(err => { showSaving(false); showToast('Error: ' + err.message, true); });
}
