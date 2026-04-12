// ═══ DACEWAV Admin — Change Log & Tooltips ═══
// Extracted from core.js — tracks field changes and adds info tooltips.

import { _changeLog, _lastChangeValues } from './state.js';
import { g } from './helpers.js';

export function logChange(label, oldVal, newVal) {
  _changeLog.unshift({ label, oldVal, newVal, time: new Date().toLocaleTimeString() });
  if (_changeLog.length > 50) _changeLog.pop();
  renderChangeLog();
}

export function renderChangeLog() {
  const wrap = g('change-log');
  if (!wrap) return;
  wrap.innerHTML = _changeLog.length
    ? _changeLog
        .slice(0, 20)
        .map(
          (c) =>
            '<div style="display:flex;gap:6px;padding:3px 0;border-bottom:1px solid var(--b);font-size:10px"><span style="color:var(--hi);min-width:50px">' +
            c.time +
            '</span><span style="flex:1">' +
            c.label +
            '</span><span style="color:var(--mu)">' +
            (c.oldVal || '\u2014') +
            ' \u2192 ' +
            (c.newVal || '\u2014') +
            '</span></div>'
        )
        .join('')
    : '<div style="color:var(--hi);font-size:10px">Sin cambios registrados</div>';
}

const TRACKED_FIELDS = [
  'tc-bg', 'tc-surface', 'tc-accent', 'tc-text', 'tc-muted', 'tc-border',
  't-font-d', 't-font-m', 't-font-size', 't-line-h',
  't-glow', 't-glow-type', 't-glow-blur', 't-glow-int', 't-glow-op', 't-glow-anim',
  't-blur', 't-card-op', 't-grain', 't-radius', 't-bg-op', 't-btn-op', 't-btn-hop',
  'h-title', 'h-sub', 'h-eyebrow', 'h-title-size', 'h-ls', 'h-lh', 'h-pad-top',
  'h-stroke-on', 'h-glow-on', 'h-grad-on', 'h-grad-clr', 'h-grad-w', 'h-grad-h',
  'h-word-blur', 'h-word-op', 'h-glow-clr', 'h-stroke-clr',
  'p-on', 'p-type', 'p-count', 'p-color', 'p-speed', 'p-opacity',
  'b-active', 'b-text', 'b-anim', 'b-speed', 'b-bg', 'b-txt-clr',
  't-hero-top', 't-player-bot', 't-logo-ox', 't-logo-url', 't-logo-w', 't-logo-scale', 't-logo-rot',
  'tt-wbar', 'tt-wbar-a', 'tt-btn-clr', 'tt-btn-bdr', 'tt-btn-bg',
  's-name', 's-wa', 's-ig', 's-email', 's-hero', 's-sub',
];

export function logFieldChange() {
  TRACKED_FIELDS.forEach((id) => {
    const el = g(id);
    if (!el) return;
    const v = el.type === 'checkbox' ? el.checked : el.value;
    if (_lastChangeValues[id] !== undefined && _lastChangeValues[id] !== v) {
      const label =
        el.closest('.field,.color-wrap,.tog-row')?.querySelector('label')?.textContent || id;
      const fmtVal = (v) => (String(v).length > 30 ? String(v).slice(0, 27) + '\u2026' : v);
      logChange(label, fmtVal(_lastChangeValues[id]), fmtVal(v));
    }
    _lastChangeValues[id] = v;
  });
}

// ═══ TOOLTIPS ═══
const TOOLTIPS = {
  'tc-bg': 'Color de fondo principal',
  'tc-surface': 'Color de superficie de tarjetas',
  'tc-accent': 'Color de acento / resaltado',
  't-font-d': 'Fuente para t\xEDtulos',
  't-font-m': 'Fuente para textos secundarios',
  't-font-size': 'Tama\xF1o base de toda la tienda',
  't-line-h': 'Espacio entre l\xEDneas',
  't-glow': 'Activa/desactiva glow global',
  't-glow-type': 'Tipo de efecto glow',
  't-glow-anim': 'Animaci\xF3n del glow',
  't-blur': 'Desenfoque del fondo',
  't-grain': 'Intensidad del grano',
  't-radius': 'Radio de bordes',
  'p-on': 'Part\xEDculas flotantes',
  'p-type': 'Forma de part\xEDculas',
  'p-count': 'N\xFAmero de part\xEDculas',
  'h-title': 'T\xEDtulo principal del hero',
  'h-sub': 'Subt\xEDtulo',
  'h-grad-on': 'Degradado radial',
  'h-title-size': 'Tama\xF1o del t\xEDtulo',
  'h-stroke-on': 'Outline \xFAltima palabra',
  'h-glow-on': 'Brillo del t\xEDtulo',
  't-logo-url': 'URL del logo',
  't-logo-w': 'Ancho del logo',
  's-name': 'Nombre del sitio',
  's-wa': 'WhatsApp',
  's-ig': 'Instagram',
};

export function addTooltips() {
  Object.entries(TOOLTIPS).forEach(([id, text]) => {
    const el = g(id);
    if (!el) return;
    const label = el.closest('.field,.color-wrap,.tog-row')?.querySelector('label');
    if (label && !label.querySelector('.tip')) {
      const tip = document.createElement('span');
      tip.className = 'tip';
      tip.title = text;
      tip.textContent = '?';
      label.appendChild(tip);
    }
  });
}
