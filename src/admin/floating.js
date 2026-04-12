// ═══ DACEWAV Admin — Floating Elements ═══
// Extracted from core.js — manages floating overlay elements on the store.

import { ANIMS } from './config.js';
import { db, floatingEls } from './state.js';
import { g, showToast } from './helpers.js';

export function renderFloatingEditor() {
  const container = g('floating-editor');
  if (!container) return;
  const els = Object.entries(floatingEls);
  container.innerHTML = els.length
    ? els
        .map(([k, el]) => {
          return (
            '<div class="fe-ed-item" data-key="' +
            k +
            '" style="background:var(--as2);border:1px solid var(--b);border-radius:var(--rad);padding:8px;margin-bottom:6px">' +
            '<div class="fg3"><div class="field"><label>X</label><input type="number" value="' +
            (el.x || 0) +
            '" data-f="x"></div>' +
            '<div class="field"><label>Y</label><input type="number" value="' +
            (el.y || 0) +
            '" data-f="y"></div>' +
            '<div class="field"><label>Ancho</label><input type="number" value="' +
            (el.width || 100) +
            '" data-f="width"></div></div>' +
            '<div class="fg3"><div class="field"><label>Alto</label><input type="number" value="' +
            (el.height || 100) +
            '" data-f="height"></div>' +
            '<div class="field"><label>Opacidad</label><input type="number" min="0" max="1" step="0.05" value="' +
            (el.opacity != null ? el.opacity : 1) +
            '" data-f="opacity"></div>' +
            '<div class="field"><label>Visible</label><input type="checkbox" class="tog" ' +
            (el.visible !== false ? 'checked' : '') +
            ' data-f="visible"></div></div>' +
            '<div class="fg2"><div class="field"><label>Tipo</label><select data-f="type"><option value="image"' +
            (el.type === 'image' ? ' selected' : '') +
            '>Imagen</option><option value="text"' +
            (el.type === 'text' ? ' selected' : '') +
            '>Texto</option></select></div>' +
            '<div class="field"><label>Anim</label><select data-f="anim">' +
            ANIMS.map(
              (a) =>
                '<option value="' + a + '"' + (el.anim === a ? ' selected' : '') + '>' + a + '</option>'
            ).join('') +
            '</select></div></div>' +
            '<div class="field"><label>Contenido (URL o texto)</label><input type="text" value="' +
            (el.content || '') +
            '" data-f="content"></div>' +
            '<div class="btn-row" style="margin-top:6px"><button class="btn btn-ok" onclick="saveFE(\'' +
            k +
            '\')" style="font-size:9px">Guardar</button><button class="btn btn-del" onclick="rmFE(\'' +
            k +
            '\')" style="font-size:9px">\u2715</button></div></div>'
          );
        })
        .join('')
    : '<div style="color:var(--hi);font-size:10px">Sin elementos flotantes.</div>';
}

export function renderFloatingPreview() {
  const pv = g('floating-preview');
  if (!pv) return;
  pv.innerHTML = '';
  Object.entries(floatingEls).forEach(([k, el]) => {
    if (!el || !el.visible) return;
    const d = document.createElement('div');
    const scaleX = pv.offsetWidth / 1200,
      scaleY = 120 / 800;
    d.style.cssText =
      'position:absolute;left:' +
      (el.x || 0) * scaleX +
      'px;top:' +
      (el.y || 0) * scaleY +
      'px;width:' +
      (el.width || 100) * scaleX +
      'px;height:' +
      (el.height || 100) * scaleY +
      'px;opacity:' +
      (el.opacity || 1) +
      ';pointer-events:none';
    if (el.type === 'text')
      d.innerHTML =
        '<div style="font-size:' +
        Math.max(6, (el.fontSize || 16) * scaleX) +
        'px;color:var(--tx);white-space:nowrap">' +
        (el.content || '') +
        '</div>';
    else if (el.content)
      d.innerHTML =
        '<img src="' +
        el.content +
        "\" style=\"width:100%;height:100%;object-fit:contain\" onerror=\"this.style.display='none'\">";
    pv.appendChild(d);
  });
}

export function addFE() {
  const k = 'fe_' + Date.now();
  floatingEls[k] = {
    type: 'image',
    content: '',
    x: 100,
    y: 100,
    width: 100,
    height: 100,
    opacity: 1,
    visible: true,
    anim: 'none',
    animDur: 2,
    fontSize: 16,
  };
  renderFloatingEditor();
  renderFloatingPreview();
}

export function saveFE(k) {
  const el = document.querySelector('.fe-ed-item[data-key="' + k + '"]');
  if (!el) return;
  const f = {};
  el.querySelectorAll('[data-f]').forEach((inp) => {
    f[inp.dataset.f] = inp.type === 'checkbox' ? inp.checked : inp.value;
  });
  floatingEls[k] = {
    ...floatingEls[k],
    ...f,
    x: parseFloat(f.x) || 0,
    y: parseFloat(f.y) || 0,
    width: parseFloat(f.width) || 100,
    height: parseFloat(f.height) || 100,
    opacity: parseFloat(f.opacity) || 1,
    fontSize: parseInt(f.fontSize) || 16,
  };
  localStorage.setItem('dace-floating', JSON.stringify(floatingEls));
  if (db) db.ref('floatingElements/' + k).set(floatingEls[k]).catch(() => {});
  renderFloatingPreview();
  showToast('Elemento guardado');
}

export function rmFE(k) {
  delete floatingEls[k];
  localStorage.setItem('dace-floating', JSON.stringify(floatingEls));
  if (db) db.ref('floatingElements/' + k).remove().catch(() => {});
  renderFloatingEditor();
  renderFloatingPreview();
  showToast('Eliminado');
}
