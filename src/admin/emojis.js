// ═══ DACEWAV Admin — Emoji System ═══
// Extracted from core.js — default emoji grid + custom emoji management.

import { EMOJIS } from './config.js';
import { db, customEmojis } from './state.js';
import { g, val, setVal, showToast } from './helpers.js';

// Dependencies injected by core.js
let _updateBannerPv = null;
let _autoSave = null;

export function setEmojiDeps({ updateBannerPv, autoSave }) {
  _updateBannerPv = updateBannerPv;
  _autoSave = autoSave;
}

export function renderEmojiGrid() {
  g('emoji-grid').innerHTML = EMOJIS.map(
    (e) => '<div class="emoji-btn" onclick="insertEmoji(\'' + e + '\')">' + e + '</div>'
  ).join('');
}

export function insertEmoji(e) {
  const b = g('b-text');
  if (b) {
    b.value += e;
    if (_updateBannerPv) _updateBannerPv();
    if (_autoSave) _autoSave();
  }
}

export function renderCustomEmojis() {
  g('ce-list').innerHTML = customEmojis.length
    ? customEmojis
        .map(
          (e, i) =>
            '<div class="ce-item"><img src="' +
            e.url +
            '"><div class="ce-name">:' +
            e.name +
            ':</div><button class="btn btn-del" onclick="removeCE(' +
            i +
            ')" style="font-size:9px">\u2715</button></div>'
        )
        .join('')
    : '<div style="color:var(--hi);font-size:10px">Sin emojis personalizados</div>';
}

export function addCustomEmoji() {
  const name = val('ce-name').trim(),
    url = val('ce-url').trim();
  if (!name || !url) {
    showToast('Nombre y URL', true);
    return;
  }
  customEmojis.push({
    name,
    url,
    width: parseInt(val('ce-w')) || 24,
    height: parseInt(val('ce-h')) || 24,
    anim: val('ce-anim') || 'none',
  });
  localStorage.setItem('dace-custom-emojis', JSON.stringify(customEmojis));
  renderCustomEmojis();
  if (_updateBannerPv) _updateBannerPv();
  setVal('ce-name', '');
  setVal('ce-url', '');
  if (db) db.ref('customEmojis').set(customEmojis).catch(() => {});
}

export function uploadEmojiFile(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const baseName = file.name
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .toLowerCase();
  const reader = new FileReader();
  reader.onload = function (e) {
    const dataUrl = e.target.result;
    if (dataUrl.length > 200 * 1024) {
      showToast('Imagen muy grande (>200KB). Comprime primero.', true);
    }
    customEmojis.push({
      name: baseName,
      url: dataUrl,
      width: parseInt(val('ce-w')) || 24,
      height: parseInt(val('ce-h')) || 24,
      anim: val('ce-anim') || 'none',
    });
    localStorage.setItem('dace-custom-emojis', JSON.stringify(customEmojis));
    renderCustomEmojis();
    if (_updateBannerPv) _updateBannerPv();
    if (db) db.ref('customEmojis').set(customEmojis).catch(() => {});
    showToast('Emoji "' + baseName + '" subido \u2713');
    input.value = '';
  };
  reader.readAsDataURL(file);
}

export function removeCE(i) {
  customEmojis.splice(i, 1);
  localStorage.setItem('dace-custom-emojis', JSON.stringify(customEmojis));
  renderCustomEmojis();
  if (_updateBannerPv) _updateBannerPv();
  if (db) db.ref('customEmojis').set(customEmojis).catch(() => {});
}
