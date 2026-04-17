// ═══ DACEWAV Admin — Global Card Style ═══
// Manages the "Tarjetas" section: global card style defaults stored in settings.globalCardStyle

import { g, showToast, showSaving } from './helpers.js';
import { siteSettings, db } from './state.js';
import {
  renderFiltersHTML, renderGlowHTML, renderAnimHTML, renderStyleHTML,
  renderBorderHTML, renderShadowHTML, renderHoverHTML, renderTransformHTML,
  renderEffectGalleryHTML,
  buildCardStyleFromPrefix, populateFromCardStyle, resetCardStyleInputs,
  syncSliderDisplays, DEFAULT_CARD_STYLE, isCardStyleEmpty
} from './card-style-ui.js';

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

// Event delegation: catch ALL input/change events in the global section
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
  populateFromCardStyle(cs, PREFIX);
  syncSliderDisplays(PREFIX);
  updateGlobalStatus();
  updateGlobalPreview();
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
  updateGlobalPreview();
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

// ═══ Live preview ═══
function updateGlobalPreview() {
  const pv = g('global-pv-card');
  if (!pv) return;
  const cs = buildCardStyleFromPrefix(PREFIX);
  _applyStyleToPv(pv, cs);
  
  // Send live update to store (real-time sync with ACK)
  if (typeof window._sendGlobalStyleUpdate === 'function') {
    window._sendGlobalStyleUpdate(cs);
  }
}

// Apply cardStyle to a preview element (mirrors beats.js _applyCardStyleToPreview)
function _applyStyleToPv(pv, cs) {
  // Reset
  pv.className = 'bcpv';
  pv.style.cssText = '';
  const inner = pv.querySelector('.bcpv-inner');
  if (inner) { inner.style.border = ''; inner.style.borderRadius = ''; }

  // Filters
  const f = cs.filter || {};
  const filters = [];
  if (f.brightness != null && f.brightness !== 1) filters.push('brightness(' + f.brightness + ')');
  if (f.contrast != null && f.contrast !== 1) filters.push('contrast(' + f.contrast + ')');
  if (f.saturate != null && f.saturate !== 1) filters.push('saturate(' + f.saturate + ')');
  if (f.grayscale) filters.push('grayscale(' + f.grayscale + ')');
  if (f.sepia) filters.push('sepia(' + f.sepia + ')');
  if (f.hueRotate) filters.push('hue-rotate(' + f.hueRotate + 'deg)');
  if (f.blur) filters.push('blur(' + f.blur + 'px)');
  if (f.invert) filters.push('invert(' + f.invert + ')');
  if (filters.length) pv.style.filter = filters.join(' ');

  // Accent color
  const accentColor = (cs.style || {}).accentColor;
  if (accentColor) {
    const hex = accentColor.replace('#','');
    const r = parseInt(hex.substring(0,2),16)||220;
    const gv = parseInt(hex.substring(2,4),16)||38;
    const b = parseInt(hex.substring(4,6),16)||38;
    pv.style.setProperty('--accent', accentColor);
    pv.style.setProperty('--btn-lic-clr', accentColor);
    pv.style.setProperty('--btn-lic-bdr', 'rgba('+r+','+gv+','+b+',0.5)');
    pv.style.setProperty('--btn-lic-bg', 'rgba('+r+','+gv+','+b+',0.1)');
  }

  // Glow
  const gc = cs.glow || {};
  if (gc.enabled) {
    pv.classList.add('glow-' + (gc.type || 'active'));
    const hex = (gc.color || '#dc2626').replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 220;
    const gv = parseInt(hex.substring(2, 4), 16) || 38;
    const b = parseInt(hex.substring(4, 6), 16) || 38;
    pv.style.setProperty('--glow-clr', gc.color || '#dc2626');
    pv.style.setProperty('--glow-r', r);
    pv.style.setProperty('--glow-g', gv);
    pv.style.setProperty('--glow-b', b);
    pv.style.setProperty('--glow-speed', (gc.speed || 3) + 's');
    pv.style.setProperty('--glow-int', gc.intensity || 1);
    pv.style.setProperty('--glow-blur', (gc.blur || 20) + 'px');
    pv.style.setProperty('--glow-spread', (gc.spread || 0) + 'px');
    pv.style.setProperty('--glow-op', gc.opacity != null ? gc.opacity : 1);
    if (gc.hoverOnly) pv.classList.add('glow-hover-only');
  }

  // Animation
  const ca = cs.anim;
  if (ca && ca.type) {
    pv.classList.add('anim-' + ca.type);
    pv.style.setProperty('--ad', (ca.dur || 2) + 's');
    pv.style.setProperty('--adl', (ca.del || 0) + 's');
    pv.style.setProperty('--aease', ca.easing || 'ease-in-out');
    pv.style.setProperty('--adir', ca.direction || 'normal');
    pv.style.setProperty('--aiter', ca.iterations || 'infinite');
    const intVal = (ca.intensity != null ? ca.intensity : 100) / 100;
    pv.style.setProperty('--anim-int', intVal);
  }

  // Style
  const st = cs.style || {};
  if (st.shimmer) pv.classList.add('shimmer-on');
  if (st.borderRadius) {
    pv.style.setProperty('--card-radius', st.borderRadius + 'px');
    if (inner) inner.style.borderRadius = st.borderRadius + 'px';
  }
  if (st.opacity != null && st.opacity < 1) pv.style.opacity = st.opacity;

  // Border
  const bd = cs.border || {};
  if (bd.enabled && inner) {
    inner.style.border = (bd.width || 1) + 'px ' + (bd.style || 'solid') + ' ' + (bd.color || '#dc2626');
  }

  // Shadow
  const sh = cs.shadow || {};
  if (sh.enabled) {
    const hex = (sh.color || '#000000').replace('#','');
    const r = parseInt(hex.substring(0,2),16)||0;
    const gv = parseInt(hex.substring(2,4),16)||0;
    const b = parseInt(hex.substring(4,6),16)||0;
    const rgba = 'rgba('+r+','+gv+','+b+','+(sh.opacity != null ? sh.opacity : 0.35)+')';
    const prefix = sh.inset ? 'inset ' : '';
    pv.style.boxShadow = prefix + (sh.x||0) + 'px ' + (sh.y!=null?sh.y:4) + 'px ' + (sh.blur!=null?sh.blur:12) + 'px ' + (sh.spread||0) + 'px ' + rgba;
  }

  // Transform
  const tf = cs.transform || {};
  const tfParts = [];
  if (tf.rotate) tfParts.push('rotate(' + tf.rotate + 'deg)');
  if (tf.scale && tf.scale !== 1) tfParts.push('scale(' + tf.scale + ')');
  if (tf.skewX) tfParts.push('skewX(' + tf.skewX + 'deg)');
  if (tf.skewY) tfParts.push('skewY(' + tf.skewY + 'deg)');
  if (tf.x) tfParts.push('translateX(' + tf.x + 'px)');
  if (tf.y) tfParts.push('translateY(' + tf.y + 'px)');
  if (tfParts.length) pv.style.transform = tfParts.join(' ');

  // Hover CSS vars
  const hv = cs.hover || {};
  if (hv.scale && hv.scale !== 1) pv.style.setProperty('--hov-scale', hv.scale);
  if (hv.brightness && hv.brightness !== 1) pv.style.setProperty('--hov-bright', hv.brightness);
  if (hv.saturate && hv.saturate !== 1) pv.style.setProperty('--hov-sat', hv.saturate);
  if (hv.shadowBlur) pv.style.setProperty('--hov-shadow', hv.shadowBlur + 'px');
  if (hv.transition != null) pv.style.setProperty('--hov-trans', hv.transition + 's');
  if (hv.borderColor) pv.style.setProperty('--hov-bdr', hv.borderColor);
  if (hv.blur) pv.style.setProperty('--hov-blur', hv.blur + 'px');
  if (hv.siblingsBlur) pv.style.setProperty('--hov-sib-blur', hv.siblingsBlur + 'px');
  if (hv.hueRotate) pv.style.setProperty('--hov-hue', hv.hueRotate + 'deg');
  if (hv.opacity != null && hv.opacity !== 1) pv.style.setProperty('--hov-opacity', hv.opacity);
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
  loadGlobalCardStyle,
  updateGlobalPreview
});
