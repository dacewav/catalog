// ═══ DACEWAV Admin — Global Card Style ═══
// Manages the "Tarjetas" section: global card style defaults stored in settings.globalCardStyle

import { g, showToast, showSaving } from './helpers.js';
import { siteSettings, db } from './state.js';
import {
  renderFiltersHTML, renderGlowHTML, renderAnimHTML, renderStyleHTML,
  renderBorderHTML, renderShadowHTML, renderHoverHTML, renderTransformHTML,
  buildCardStyleFromPrefix, populateFromCardStyle, resetCardStyleInputs,
  syncSliderDisplays, DEFAULT_CARD_STYLE, isCardStyleEmpty
} from './card-style-ui.js';

const PREFIX = 'g-'; // global prefix for field IDs

// Initialize: inject controls HTML and load saved global style
export function initGlobalCardStyle() {
  const filters = g('gcs-filters');
  if (filters && !filters.children.length) {
    filters.innerHTML = renderFiltersHTML(PREFIX);
    g('gcs-glow').innerHTML = renderGlowHTML(PREFIX);
    g('gcs-anim').innerHTML = renderAnimHTML(PREFIX);
    g('gcs-style').innerHTML = renderStyleHTML(PREFIX);
    g('gcs-border').innerHTML = renderBorderHTML(PREFIX);
    g('gcs-shadow').innerHTML = renderShadowHTML(PREFIX);
    g('gcs-hover').innerHTML = renderHoverHTML(PREFIX);
    g('gcs-transform').innerHTML = renderTransformHTML(PREFIX);
  }
  loadGlobalCardStyle();
}

// Load from settings into inputs
export function loadGlobalCardStyle() {
  const cs = siteSettings.globalCardStyle || DEFAULT_CARD_STYLE;
  populateFromCardStyle(cs, PREFIX);
  syncSliderDisplays(PREFIX);
  updateGlobalStatus();
}

// Save inputs to settings
export function saveGlobalCardStyle() {
  const cs = buildCardStyleFromPrefix(PREFIX);
  siteSettings.globalCardStyle = cs;
  _persistGlobalCardStyle();
  updateGlobalStatus();
  showToast('Estilo global de tarjetas guardado ✓');
}

// Reset global to defaults
export function resetGlobalCardStyle() {
  resetCardStyleInputs(PREFIX);
  syncSliderDisplays(PREFIX);
  siteSettings.globalCardStyle = null;
  _persistGlobalCardStyle();
  updateGlobalStatus();
  showToast('Estilo global reseteado ✓');
}

// Persist globalCardStyle to Firebase + localStorage
function _persistGlobalCardStyle() {
  localStorage.setItem('dace-settings', JSON.stringify(siteSettings));
  if (db) {
    showSaving(true);
    db.ref('settings/globalCardStyle').set(siteSettings.globalCardStyle || null)
      .then(() => { showSaving(false); })
      .catch(err => { showSaving(false); showToast('Error: ' + err.message, true); });
  }
}

// Apply global style to ALL beats (overwrites their cardStyle)
export function applyGlobalToAllBeats() {
  if (!confirm('¿Aplicar el estilo global a TODOS los beats? Esto sobreescribirá los estilos personalizados de cada beat.')) return;
  const cs = buildCardStyleFromPrefix(PREFIX);
  import('./state.js').then(({ allBeats }) => {
    showSaving(true);
    if (db) {
      const updates = {};
      allBeats.forEach(b => { updates['beats/' + b.id + '/cardStyle'] = cs; updates['beats/' + b.id + '/_customStyle'] = false; });
      db.ref().update(updates)
        .then(() => { showSaving(false); showToast('Estilo global aplicado a ' + allBeats.length + ' beats ✓'); })
        .catch(err => { showSaving(false); showToast('Error: ' + err.message, true); });
    } else {
      showSaving(false);
      showToast('Estilo global aplicado a ' + allBeats.length + ' beats (local) ✓');
    }
  });
}

// Update status display
function updateGlobalStatus() {
  const el = g('global-cs-status');
  if (!el) return;
  const cs = siteSettings.globalCardStyle;
  if (!cs || isCardStyleEmpty(cs)) {
    el.innerHTML = '⚪ Sin estilo global configurado. Los beats usan sus estilos individuales.';
  } else {
    const parts = [];
    if (cs.filter && JSON.stringify(cs.filter) !== JSON.stringify(DEFAULT_CARD_STYLE.filter)) parts.push('Filtros');
    if (cs.glow && cs.glow.enabled) parts.push('Glow');
    if (cs.anim && cs.anim.type) parts.push('Animación');
    if (cs.border && cs.border.enabled) parts.push('Borde');
    if (cs.shadow && cs.shadow.enabled) parts.push('Sombra');
    if (cs.hover && (cs.hover.scale !== 1 || cs.hover.brightness !== 1)) parts.push('Hover');
    if (cs.transform && (cs.transform.rotate || cs.transform.scale !== 1)) parts.push('Transform');
    el.innerHTML = '🟢 Global activo: ' + (parts.length ? parts.join(', ') : 'valores por defecto');
  }
}

// Get effective cardStyle for a beat (global merged with beat-specific)
export function getEffectiveCardStyle(beat) {
  const global = siteSettings?.globalCardStyle;
  if (!global) return beat.cardStyle || null;
  if (!beat.cardStyle) return global;
  if (beat._customStyle === false) return global;
  // Deep merge: beat values override global
  const merged = {};
  const allKeys = new Set([...Object.keys(global), ...Object.keys(beat.cardStyle)]);
  allKeys.forEach(k => {
    if (beat.cardStyle[k] != null) {
      merged[k] = typeof beat.cardStyle[k] === 'object' && !Array.isArray(beat.cardStyle[k])
        ? { ...(global[k] || {}), ...beat.cardStyle[k] }
        : beat.cardStyle[k];
    } else if (global[k] != null) {
      merged[k] = global[k];
    }
  });
  return merged;
}

// Expose to window
Object.assign(window, {
  initGlobalCardStyle,
  saveGlobalCardStyle,
  resetGlobalCardStyle,
  applyGlobalToAllBeats,
  loadGlobalCardStyle
});
