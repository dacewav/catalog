// ═══ DACEWAV Admin — Snapshots & Diff ═══
// Extracted from core.js — theme snapshots, load/restore, visual diff, URL import.

import { T, setT } from './state.js';
import { g, val, setVal, showToast, showSaving, promptInline } from './helpers.js';

// Dependencies injected by core.js at init
let _collectTheme = null;
let _loadThemeUI = null;
let _autoSave = null;
let _renderSnapshotsSelf = null; // self-reference for recursive calls

export function setSnapshotDeps({ collectTheme, loadThemeUI, autoSave }) {
  _collectTheme = collectTheme;
  _loadThemeUI = loadThemeUI;
  _autoSave = autoSave;
}

// ═══ SNAPSHOTS ═══
export function takeSnapshot() {
  if (!_collectTheme) return;
  const snaps = JSON.parse(localStorage.getItem('dace-snapshots') || '[]');
  snaps.push({
    name: val('snap-name') || 'Snapshot ' + (snaps.length + 1),
    theme: _collectTheme(),
    date: new Date().toISOString(),
  });
  if (snaps.length > 10) snaps.shift();
  localStorage.setItem('dace-snapshots', JSON.stringify(snaps));
  setVal('snap-name', '');
  renderSnapshots();
  showToast('Snapshot guardado');
}

export function renderSnapshots() {
  const wrap = g('snapshots-list');
  if (!wrap) return;
  const snaps = JSON.parse(localStorage.getItem('dace-snapshots') || '[]');
  wrap.innerHTML = snaps.length
    ? snaps
        .map(
          (s, i) =>
            '<div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid var(--b)"><div style="flex:1"><div style="font-size:11px;font-weight:700">' +
            s.name +
            '</div><div style="font-size:9px;color:var(--hi)">' +
            new Date(s.date).toLocaleString() +
            '</div></div><button class="btn btn-g" onclick="loadSnapshot(' +
            i +
            ')" style="font-size:9px">Cargar</button><button class="btn btn-del" onclick="rmSnapshot(' +
            i +
            ')" style="font-size:9px">\u2715</button></div>'
        )
        .join('')
    : '<div style="color:var(--hi);font-size:10px">Sin snapshots</div>';
  populateDiffSelects();
}

export function loadSnapshot(i) {
  const snaps = JSON.parse(localStorage.getItem('dace-snapshots') || '[]');
  if (!snaps[i]) return;
  setT(snaps[i].theme);
  if (_loadThemeUI) _loadThemeUI();
  if (_autoSave) _autoSave();
  showToast('Snapshot: ' + snaps[i].name);
}

export function rmSnapshot(i) {
  const snaps = JSON.parse(localStorage.getItem('dace-snapshots') || '[]');
  snaps.splice(i, 1);
  localStorage.setItem('dace-snapshots', JSON.stringify(snaps));
  renderSnapshots();
}

// ═══ VISUAL DIFF ═══
export function populateDiffSelects() {
  const snaps = JSON.parse(localStorage.getItem('dace-snapshots') || '[]');
  const opts =
    '<option value="">\u2014 Seleccionar \u2014</option>' +
    snaps.map((s, i) => '<option value="' + i + '">' + s.name + '</option>').join('');
  const da = g('diff-a'),
    db2 = g('diff-b');
  if (da) da.innerHTML = opts;
  if (db2) db2.innerHTML = opts;
}

export function updateDiff() {
  const aIdx = val('diff-a'),
    bIdx = val('diff-b');
  const wrap = g('diff-result');
  if (!wrap) return;
  if (aIdx === '' || bIdx === '') {
    wrap.innerHTML = '<div style="color:var(--hi);font-size:10px">Selecciona dos snapshots</div>';
    return;
  }
  const snaps = JSON.parse(localStorage.getItem('dace-snapshots') || '[]');
  const a = snaps[aIdx],
    b = snaps[bIdx];
  if (!a || !b) {
    wrap.innerHTML = '';
    return;
  }
  const themeA = a.theme || {},
    themeB = b.theme || {};
  const allKeys = [...new Set([...Object.keys(themeA), ...Object.keys(themeB)])].sort();
  const diffs = allKeys.filter((k) => JSON.stringify(themeA[k]) !== JSON.stringify(themeB[k]));
  if (!diffs.length) {
    wrap.innerHTML = '<div style="color:var(--gn);font-size:10px">\u2713 Sin diferencias</div>';
    return;
  }
  const labels = {
    bg: 'Fondo',
    surface: 'Surface',
    accent: 'Acento',
    text: 'Texto',
    fontDisplay: 'Font Display',
    fontBody: 'Font Body',
    glowColor: 'Glow',
    glowType: 'Glow Type',
    glowBlur: 'Glow Blur',
    glowIntensity: 'Glow Int',
    radiusGlobal: 'Border Radius',
    heroTitleSize: 'Hero Title',
    particlesOn: 'Part\xEDculas',
    beatGap: 'Beat Gap',
    padSection: 'Pad',
    blurBg: 'Blur',
    cardOpacity: 'Card Op',
  };
  wrap.innerHTML =
    '<div style="font-size:10px;color:var(--acc);font-weight:700;margin-bottom:6px">' +
    diffs.length +
    ' cambios</div>' +
    diffs
      .map((k) => {
        const label = labels[k] || k;
        const va = themeA[k] !== undefined ? String(themeA[k]).slice(0, 40) : '\u2014';
        const vb = themeB[k] !== undefined ? String(themeB[k]).slice(0, 40) : '\u2014';
        return (
          '<div style="display:flex;align-items:center;gap:6px;padding:3px 0;border-bottom:1px solid var(--b);font-size:10px"><span style="min-width:80px;font-weight:600">' +
          label +
          '</span><span style="color:var(--mu);text-decoration:line-through">' +
          va +
          '</span><span style="color:var(--mu)">\u2192</span><span style="color:var(--acc);font-weight:600">' +
          vb +
          '</span></div>'
        );
      })
      .join('');
}

// ═══ IMPORT URL ═══
export async function promptImportURL() {
  const url = await promptInline(
    'URL del tema JSON (Ej: https://mi-servidor.com/tema.json)'
  );
  if (!url || !url.trim()) return;
  importThemeFromURL(url.trim());
}

export function importThemeFromURL(url) {
  showSaving(true);
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then((data) => {
      showSaving(false);
      let theme = null;
      if (data.theme) theme = data.theme;
      else if (data.bg || data.accent || data.fontDisplay) theme = data;
      else {
        showToast('Formato no reconocido', true);
        return;
      }
      // Backup before import
      const snaps = JSON.parse(localStorage.getItem('dace-snapshots') || '[]');
      snaps.push({
        name: 'Backup antes de import URL',
        theme: _collectTheme ? _collectTheme() : {},
        date: new Date().toISOString(),
      });
      if (snaps.length > 10) snaps.shift();
      localStorage.setItem('dace-snapshots', JSON.stringify(snaps));
      setT({ ...T, ...theme });
      if (_loadThemeUI) _loadThemeUI();
      if (_autoSave) _autoSave();
      showToast('Tema importado desde URL \u2713');
      renderSnapshots();
    })
    .catch((err) => {
      showSaving(false);
      showToast('Error: ' + err.message, true);
    });
}
