// ═══ DACEWAV Admin — Global Card Style ═══
// Manages the "Tarjetas" section: global card style defaults stored in settings.globalCardStyle

import { g, showToast, showSaving } from './helpers.js';
import { siteSettings, db } from './state.js';
import {
  renderFiltersHTML, renderGlowHTML, renderAnimHTML, renderStyleHTML,
  renderBorderHTML, renderShadowHTML, renderHoverHTML, renderTransformHTML,
  renderEffectGalleryHTML,
} from './card-style-ui.js';
import {
  buildCardStyle, populateCardStyle, resetCardStyle,
  syncSliderDisplays, applyStyleToPreview, isCardStyleDefault, DEFAULT_CARD_STYLE,
  mergeCardStyles,
} from '../card-style-engine.js';

const PREFIX = 'g-'; // global prefix for field IDs
let _listenersAttached = false;
let _previewTimer = null;

// Initialize: inject controls HTML and load saved global style
export function initGlobalCardStyle() {
  const filters = g('gcs-filters');
  if (filters && !filters.children.length) {
    const gallery = g('gcs-fx-gallery');
    if (gallery) gallery.innerHTML = renderEffectGalleryHTML(PREFIX);
    filters.innerHTML = renderFiltersHTML(PREFIX);
    g('gcs-glow').innerHTML = renderGlowHTML(PREFIX);
    g('gcs-anim').innerHTML = renderAnimHTML(PREFIX);
    g('gcs-style').innerHTML = renderStyleHTML(PREFIX);
    g('gcs-border').innerHTML = renderBorderHTML(PREFIX);
    g('gcs-shadow').innerHTML = renderShadowHTML(PREFIX);
    g('gcs-hover').innerHTML = renderHoverHTML(PREFIX);
    g('gcs-transform').innerHTML = renderTransformHTML(PREFIX);
  }
  _attachPreviewListeners();
  loadGlobalCardStyle();
}

function _attachPreviewListeners() {
  if (_listenersAttached) return;
  _listenersAttached = true;
  const section = g('sec-card-global');
  if (!section) return;
  section.addEventListener('input', function(e) {
    if (e.target.matches('input, select, textarea')) _debouncedPreview();
  });
  section.addEventListener('change', function(e) {
    if (e.target.matches('input, select, textarea')) _debouncedPreview();
  });
}

function _debouncedPreview() {
  clearTimeout(_previewTimer);
  _previewTimer = setTimeout(updateGlobalPreview, 60);
}

// Load from settings into inputs
export function loadGlobalCardStyle() {
  const cs = siteSettings.globalCardStyle || DEFAULT_CARD_STYLE;
  populateCardStyle(cs, PREFIX);
  syncSliderDisplays(PREFIX);
  updateGlobalStatus();
  updateGlobalPreview();
}

// Save inputs to settings
export function saveGlobalCardStyle() {
  const cs = buildCardStyle(PREFIX, false); // global doesn't have anim sub-settings panels
  siteSettings.globalCardStyle = cs;
  _persistGlobalCardStyle();
  updateGlobalStatus();
  showToast('Estilo global de tarjetas guardado ✓');
}

// Reset global to defaults
export function resetGlobalCardStyle() {
  resetCardStyle(PREFIX);
  syncSliderDisplays(PREFIX);
  siteSettings.globalCardStyle = null;
  _persistGlobalCardStyle();
  updateGlobalStatus();
  updateGlobalPreview();
  showToast('Estilo global reseteado ✓');
}

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
  const cs = buildCardStyle(PREFIX, false);
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

// ═══ Live preview — uses unified engine ═══
function updateGlobalPreview() {
  const pv = g('global-pv-card');
  if (!pv) return;
  const cs = buildCardStyle(PREFIX, false);
  applyStyleToPreview(pv, cs); // Same function as beat editor preview
  
  if (typeof window._sendGlobalStyleUpdate === 'function') {
    window._sendGlobalStyleUpdate(cs);
  }
}

// Get effective cardStyle for a beat (global merged with beat-specific)
export function getEffectiveCardStyle(beat) {
  return mergeCardStyles(
    siteSettings?.globalCardStyle,
    beat.cardStyle,
    beat._customStyle
  );
}

// Update status display
function updateGlobalStatus() {
  const el = g('global-cs-status');
  if (!el) return;
  const cs = siteSettings.globalCardStyle;
  if (!cs || isCardStyleDefault(cs)) {
    el.innerHTML = '⚪ Sin estilo global configurado. Los beats usan sus estilos individuales.';
  } else {
    const parts = [];
    if (cs.filter && !isCardStyleDefault({ filter: cs.filter, glow: {}, anim: null, style: {}, border: {}, shadow: {}, hover: {}, transform: {} })) parts.push('Filtros');
    if (cs.glow?.enabled) parts.push('Glow');
    if (cs.anim?.type) parts.push('Animación');
    if (cs.border?.enabled) parts.push('Borde');
    if (cs.shadow?.enabled) parts.push('Sombra');
    if (cs.hover && (cs.hover.scale !== 1 || cs.hover.brightness !== 1)) parts.push('Hover');
    if (cs.transform && (cs.transform.rotate || cs.transform.scale !== 1)) parts.push('Transform');
    el.innerHTML = '🟢 Global activo: ' + (parts.length ? parts.join(', ') : 'valores por defecto');
  }
}

// Expose to window
Object.assign(window, {
  initGlobalCardStyle,
  saveGlobalCardStyle,
  resetGlobalCardStyle,
  applyGlobalToAllBeats,
  loadGlobalCardStyle,
  updateGlobalPreview
});
