// ═══ DACEWAV Admin — Beats CRUD ═══
// Beat list, editor, uploads, drag-drop, batch operations.
// Licenses → beat-licenses.js, Inline edit → beat-inline-edit.js, Live preview → beat-live-preview.js

import { db, allBeats, setAllBeats, editId, setEditId, defLics, _edLics, setEdLics, _dragBeatId, setDragBeatId, _batchImgQueue, setBatchImgQueue } from './state.js';
import { g, val, setVal, checked, setChecked, showToast, showSaving, confirmInline, promptInline, fmt } from './helpers.js';
import { showSection, showEt } from './nav.js';
import { autoSave, postToFrame } from './core.js';
import { siteSettings } from './state.js';
import { R2_ENABLED, uploadToR2 } from './r2.js';
import { updateCardPreview, syncSliderDisplay, _buildCardStyleFromInputs, _isCardStyleDefault, _setHoloColors, _toggleAnimSubsettings } from './beat-card-style.js';
import { renderEffectGalleryHTML } from './card-style-ui.js';
import { ALL_SLIDER_IDS, renderPresets, renderHoverPresets, applyPreset, applyHoverPreset, resetCardStyle, resetBeatToGlobal } from './beat-presets.js';
import { registerActions, initClickHandler } from './click-handler.js';
import { renderLicEditor, upLic, addLicRow, rmLic, loadDefaultLics } from './beat-licenses.js';
import { inlineEditName, inlineEditBpm, inlineEditKey } from './beat-inline-edit.js';

// Live preview module (attaches window._sendLiveUpdate, etc.)
import './beat-live-preview.js';

function _triggerLiveUpdate() {
  updateCardPreview();
  if (typeof window._sendLiveUpdate === 'function') window._sendLiveUpdate();
}


let _beatSearchQuery = '';
export function filterBeatList(q) { _beatSearchQuery = (q || '').trim().toLowerCase(); renderBeatList(); }

export function renderBeatList() {
  const list = g('beat-list');
  var beats = allBeats;
  if (_beatSearchQuery) beats = beats.filter(b => (b.name + ' ' + b.genre + ' ' + b.key + ' ' + (b.tags || []).join(' ')).toLowerCase().includes(_beatSearchQuery));
  if (!beats.length) { list.innerHTML = '<div style="color:var(--hi);padding:12px 0">' + (allBeats.length ? 'Sin resultados' : 'No hay beats') + '</div>'; const sc = g('beat-search-count'); if (sc) sc.textContent = allBeats.length ? '0 de ' + allBeats.length : ''; return; }
  const sc = g('beat-search-count'); if (sc) sc.textContent = _beatSearchQuery ? beats.length + ' de ' + allBeats.length : allBeats.length + ' beats';
  list.innerHTML = beats.map((b, i) => {
    const badges = []; if (b.featured) badges.push('TOP'); if (b.exclusive) badges.push('EXCL'); if (b.active === false) badges.push('OFF');
    const img = b.imageUrl ? '<img src="' + b.imageUrl + '">' : '♪';
    return '<div class="beat-row" draggable="true" data-id="' + b.id + '" ondragstart="dragStart(event)" ondragover="dragOver(event)" ondrop="dropBeat(event)" ondragend="dragEnd(event)" data-action="open-editor"><span class="drag-handle" data-action="noop" data-stop-propagation="true">⠿</span><div class="beat-row-thumb">' + img + '</div><div><div class="beat-row-name" data-editable data-dblaction="inline-edit-name" data-id="' + b.id + '">' + b.name + (badges.length ? ' <span style="font-size:8px;color:var(--acc)">' + badges.join(' ') + '</span>' : '') + '</div><div class="beat-row-meta"><span data-editable data-dblaction="inline-edit-bpm" data-id="' + b.id + '">' + b.bpm + ' BPM</span> · <span data-editable data-dblaction="inline-edit-key" data-id="' + b.id + '">' + b.key + '</span> · ' + b.genre + '</div></div><div class="beat-row-acts"><button class="btn" data-action="open-editor" data-id="' + b.id + '" data-stop-propagation="true" style="font-size:9px;padding:3px 8px">✎</button><button class="btn btn-del" data-action="quick-del" data-id="' + b.id + '" data-stop-propagation="true" style="font-size:9px;padding:3px 8px">✕</button></div></div>';
  }).join('');
}

// Drag & Drop
export function dragStart(e) { setDragBeatId(e.currentTarget.dataset.id); e.currentTarget.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; }
export function dragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; document.querySelectorAll('.beat-row.drag-over').forEach(r => r.classList.remove('drag-over')); e.currentTarget.classList.add('drag-over'); }
export function dropBeat(e) {
  e.preventDefault(); document.querySelectorAll('.beat-row.drag-over').forEach(r => r.classList.remove('drag-over'));
  const targetId = e.currentTarget.dataset.id; if (!_dragBeatId || _dragBeatId === targetId) return;
  const fromIdx = allBeats.findIndex(b => b.id === _dragBeatId); const toIdx = allBeats.findIndex(b => b.id === targetId);
  if (fromIdx < 0 || toIdx < 0) return;
  const moved = allBeats.splice(fromIdx, 1)[0]; allBeats.splice(toIdx, 0, moved);
  allBeats.forEach((b, i) => b.order = i); renderBeatList();
  const updates = {}; allBeats.forEach(b => { updates[b.id + '/order'] = b.order; });
  try { db.ref('beats').update(updates); showToast('Orden actualizado'); } catch (e) {}
}
export function dragEnd(e) { e.currentTarget.classList.remove('dragging'); setDragBeatId(null); }

// Editor
export function openEditor(id) {
  setEditId(id); showSection('add');
  // Reset image history for this editing session
  if (typeof window._resetImgHistory === 'function') window._resetImgHistory();
  // Attach live listeners on first open
  if (typeof window._attachLiveListeners === 'function') window._attachLiveListeners();
  g('editor-title').innerHTML = '<i class="fas fa-edit"></i> ' + (id ? 'Editar' : 'Nuevo') + ' beat';
  g('btn-del').style.display = id ? 'inline-flex' : 'none';
  const idField = g('f-id');
  if (idField) { idField.readOnly = !!id; idField.style.opacity = id ? '0.5' : '1'; idField.style.cursor = id ? 'not-allowed' : 'text'; }
  if (id) {
    const b = allBeats.find(x => x.id === id); if (!b) return;
    // Start live edit — snapshot for revert on cancel
    if (typeof window._startLiveEdit === 'function') window._startLiveEdit(b);
    setVal('f-id', b.id); setVal('f-name', b.name); setVal('f-genre', b.genre || 'Trap'); setVal('f-genre-c', b.genreCustom || '');
    setVal('f-bpm', b.bpm || ''); setVal('f-key', b.key || ''); setVal('f-desc', b.description || ''); setVal('f-tags', (b.tags || []).join(', '));
    setVal('f-img', b.imageUrl || ''); setVal('f-audio', b.audioUrl || ''); setVal('f-prev', b.previewUrl || '');
    setVal('f-spotify', b.spotify || ''); setVal('f-youtube', b.youtube || ''); setVal('f-soundcloud', b.soundcloud || '');
    setVal('f-date', b.date || ''); setVal('f-order', b.order || 0); setVal('f-plays', b.plays || 0);
    setChecked('f-feat', b.featured); setChecked('f-excl', b.exclusive); setChecked('f-active', b.active !== false); setChecked('f-avail', b.available !== false);
    // Load image gallery — prefer images array, fallback to single imageUrl
    _imgGallery = (b.images && b.images.length) ? b.images.slice() : (b.imageUrl ? [b.imageUrl] : []);
    // Load cardStyle (new mega schema) or fall back to legacy fields
    const cs = b.cardStyle || {};
    const csF = cs.filter || {};
    const csG = cs.glow || b.glowConfig || {};
    const csA = cs.anim || b.cardAnim || {};
    const csS = cs.style || {};
    const csB = cs.border || b.cardBorder || {};
    const csSh = cs.shadow || {};
    const csH = cs.hover || {};
    const csTf = cs.transform || {};

    // Filters
    setVal('f-cs-fb', csF.brightness != null ? csF.brightness : 1);
    setVal('f-cs-fc', csF.contrast != null ? csF.contrast : 1);
    setVal('f-cs-fs', csF.saturate != null ? csF.saturate : 1);
    setVal('f-cs-fg', csF.grayscale || 0);
    setVal('f-cs-fse', csF.sepia || 0);
    setVal('f-cs-fh', csF.hueRotate || 0);
    setVal('f-cs-fbl', csF.blur || 0);
    setVal('f-cs-fbl-type', csF.blurType || '');
    setVal('f-cs-fi', csF.invert || 0);
    setVal('f-cs-fo', csF.opacity != null ? csF.opacity : 1);
    setVal('f-cs-ds-x', csF.dropShadowX || 0);
    setVal('f-cs-ds-y', csF.dropShadowY || 0);
    setVal('f-cs-ds-bl', csF.dropShadowBlur || 0);
    setVal('f-cs-ds-op', csF.dropShadowOpacity || 0);
    setVal('f-cs-ds-clr', csF.dropShadowColor || '#000000');
    setVal('f-cs-ds-clr-h', csF.dropShadowColor || '#000000');

    // Glow
    setChecked('f-glow-on', csG.enabled || false);
    const glowTypeEl = g('f-glow-type'); if (glowTypeEl) glowTypeEl.value = csG.type || 'active';
    setVal('f-glow-color', csG.color || '#dc2626'); setVal('f-glow-color-h', csG.color || '#dc2626');
    setVal('f-glow-speed', csG.speed || 3);
    setVal('f-glow-int', csG.intensity != null ? csG.intensity : 1);
    setVal('f-glow-blur', csG.blur != null ? csG.blur : 20);
    setVal('f-glow-spread', csG.spread || 0);
    setVal('f-glow-op', csG.opacity != null ? csG.opacity : 1);
    setChecked('f-glow-hover', csG.hoverOnly || false);

    // Animation
    const animTypeEl = g('f-anim-type'); if (animTypeEl) animTypeEl.value = csA.type || '';
    const animType2El = g('f-anim-type2'); if (animType2El) animType2El.value = csA.type2 || '';
    setVal('f-anim-dur', csA.dur || 2);
    setVal('f-anim-del', csA.del || 0);
    const animEaseEl = g('f-anim-ease'); if (animEaseEl) animEaseEl.value = csA.easing || 'ease-in-out';
    const animDirEl = g('f-anim-dir'); if (animDirEl) animDirEl.value = csA.direction || 'normal';
    const animIterEl = g('f-anim-iter'); if (animIterEl) animIterEl.value = csA.iterations || 'infinite';
    setVal('f-anim-int', csA.intensity != null ? csA.intensity : 100);
    setVal('f-anim-hue-start', csA.hueStart != null ? csA.hueStart : 0);
    setVal('f-anim-hue-end', csA.hueEnd != null ? csA.hueEnd : 360);
    _setHoloColors(csA.holoColors || ['#ff0080','#00ff80','#0080ff']);
    setVal('f-anim-holo-bright-min', csA.holoBrightMin || 0.9);
    setVal('f-anim-holo-bright-max', csA.holoBrightMax || 1.4);
    setVal('f-anim-holo-sat-min', csA.holoSatMin || 0.8);
    setVal('f-anim-holo-sat-max', csA.holoSatMax || 2);
    setVal('f-anim-holo-glow', csA.holoGlow || 0);
    setVal('f-anim-holo-blur', csA.holoBlur || 0);
    const holoDirElEd = g('f-anim-holo-dir'); if (holoDirElEd) holoDirElEd.value = csA.holoDir || 'hue';
    setVal('f-anim-brillo-min', csA.brilloMin || 0.8);
    setVal('f-anim-brillo-max', csA.brilloMax || 1.5);
    setVal('f-anim-glitch-x', csA.glitchX || 4);
    setVal('f-anim-glitch-y', csA.glitchY || 4);
    setVal('f-anim-glitch-rot', csA.glitchRot || 0);
    setChecked('f-anim-glitch-chromatic', csA.glitchChromatic || false);
    setVal('f-anim-translate-x', csA.translateX || 0);
    setVal('f-anim-translate-y', csA.translateY || 12);
    setVal('f-anim-translate-rot', csA.translateRot || 0);
    setVal('f-anim-neon-min', csA.neonMin || 0.4);
    setVal('f-anim-neon-max', csA.neonMax || 1);
    setVal('f-anim-neon-bright', csA.neonBright || 1);
    setVal('f-anim-parpadeo-min', csA.parpadeoMin || 0.3);
    setVal('f-anim-parpadeo-max', csA.parpadeoMax || 1);
    setVal('f-anim-rotate-angle', csA.rotateAngle || 5);
    setVal('f-anim-rotate-scale', csA.rotateScale || 1);
    setVal('f-anim-scale-min', csA.scaleMin || 1);
    setVal('f-anim-scale-max', csA.scaleMax || 1.06);
    setVal('f-anim-scale-opacity', csA.scaleOpacity || 0.8);
    setVal('f-anim-shake-x', csA.shakeX || 4);
    setVal('f-anim-shake-y', csA.shakeY || 4);
    setVal('f-anim-cs-hue-start', csA.csHueStart || 0);
    setVal('f-anim-cs-hue-end', csA.csHueEnd || 360);
    setVal('f-anim-cs-sat', csA.csSat || 1);
    _toggleAnimSubsettings(csA.type || '');

    // Style
    const accentClr = csS.accentColor || b.accentColor || '#dc2626';
    setVal('f-accent-color', accentClr); setVal('f-accent-color-h', accentClr);
    setChecked('f-shimmer', csS.shimmer != null ? csS.shimmer : (b.shimmer || false));
    setVal('f-shimmer-speed', csS.shimmerSpeed || b.shimmerSpeed || 3);
    setVal('f-shimmer-op', csS.shimmerOp || b.shimmerOp || 0.04);
    setVal('f-cs-radius', csS.borderRadius || 0);
    setVal('f-cs-opacity', csS.opacity != null ? csS.opacity : 1);

    // Border
    setChecked('f-border-on', csB.enabled || false);
    setVal('f-border-color', csB.color || '#dc2626');
    setVal('f-border-width', csB.width || 1);
    const borderStyleEl = g('f-border-style'); if (borderStyleEl) borderStyleEl.value = csB.style || 'solid';

    // Shadow
    setChecked('f-shadow-on', csSh.enabled || false);
    setVal('f-shadow-color', csSh.color || '#000000');
    setVal('f-shadow-op', csSh.opacity != null ? csSh.opacity : 0.35);
    setVal('f-shadow-x', csSh.x || 0);
    setVal('f-shadow-y', csSh.y != null ? csSh.y : 4);
    setVal('f-shadow-blur', csSh.blur != null ? csSh.blur : 12);
    setVal('f-shadow-spread', csSh.spread || 0);
    setChecked('f-shadow-inset', csSh.inset || false);

    // Hover
    setVal('f-hov-scale', csH.scale || 1);
    setVal('f-hov-bright', csH.brightness != null ? csH.brightness : 1);
    setVal('f-hov-sat', csH.saturate != null ? csH.saturate : 1);
    setVal('f-hov-shadow', csH.shadowBlur || 0);
    setVal('f-hov-trans', csH.transition != null ? csH.transition : 0.3);
    setVal('f-hov-border', csH.borderColor || '#dc2626');
    setChecked('f-hov-glow', csH.glowIntensify || false);
    setVal('f-hov-blur', csH.blur || 0);
    setVal('f-hov-sib-blur', csH.siblingsBlur || 0);
    setVal('f-hov-hue', csH.hueRotate || 0);
    setVal('f-hov-opacity', csH.opacity != null ? csH.opacity : 1);
    setChecked('f-hov-anim-on', csH.enableAnim || false);
    const hovAnimTypeEl = g('f-hov-anim-type'); if (hovAnimTypeEl) hovAnimTypeEl.value = csH.animType || '';
    setVal('f-hov-anim-dur', csH.animDur || 1);

    // Transform
    setVal('f-tf-rotate', csTf.rotate || 0);
    setVal('f-tf-scale', csTf.scale || 1);
    setVal('f-tf-skewX', csTf.skewX || 0);
    setVal('f-tf-skewY', csTf.skewY || 0);
    setVal('f-tf-x', csTf.x || 0);
    setVal('f-tf-y', csTf.y || 0);

    // Sync all slider displays
    ALL_SLIDER_IDS.forEach(syncSliderDisplay);
    renderLicEditor(b.licenses || []);
  } else {
    ['f-id', 'f-name', 'f-genre-c', 'f-bpm', 'f-key', 'f-desc', 'f-tags', 'f-img', 'f-audio', 'f-prev', 'f-spotify', 'f-youtube', 'f-soundcloud', 'f-date'].forEach(id => setVal(id, ''));
    setVal('f-order', 0); setVal('f-plays', 0); setChecked('f-feat', false); setChecked('f-excl', false); setChecked('f-active', true); setChecked('f-avail', true);
    g('f-genre').value = 'Trap';
    _imgGallery = [];
    // Reset all cardStyle fields to defaults
    const animTypeEl = g('f-anim-type'); if (animTypeEl) animTypeEl.value = '';
    const animType2El = g('f-anim-type2'); if (animType2El) animType2El.value = '';
    setVal('f-anim-dur', 2); setVal('f-anim-del', 0);
    const animEaseElE = g('f-anim-ease'); if (animEaseElE) animEaseElE.value = 'ease-in-out';
    const animDirElE = g('f-anim-dir'); if (animDirElE) animDirElE.value = 'normal';
    const animIterElE = g('f-anim-iter'); if (animIterElE) animIterElE.value = 'infinite';
    setVal('f-anim-int', 100); setVal('f-anim-hue-start', 0); setVal('f-anim-hue-end', 360);
    _setHoloColors(['#ff0080','#00ff80','#0080ff']);
    setVal('f-anim-holo-bright-min', 0.9); setVal('f-anim-holo-bright-max', 1.4);
    setVal('f-anim-holo-sat-min', 0.8); setVal('f-anim-holo-sat-max', 2);
    setVal('f-anim-holo-glow', 0); setVal('f-anim-holo-blur', 0);
    const holoDirElE = g('f-anim-holo-dir'); if (holoDirElE) holoDirElE.value = 'hue';
    setVal('f-anim-brillo-min', 0.8); setVal('f-anim-brillo-max', 1.5);
    setVal('f-anim-glitch-x', 4); setVal('f-anim-glitch-y', 4); setVal('f-anim-glitch-rot', 0);
    setChecked('f-anim-glitch-chromatic', false);
    setVal('f-anim-translate-x', 0); setVal('f-anim-translate-y', 12); setVal('f-anim-translate-rot', 0);
    setVal('f-anim-neon-min', 0.4); setVal('f-anim-neon-max', 1); setVal('f-anim-neon-bright', 1);
    setVal('f-anim-parpadeo-min', 0.3); setVal('f-anim-parpadeo-max', 1);
    setVal('f-anim-rotate-angle', 5); setVal('f-anim-rotate-scale', 1);
    setVal('f-anim-scale-min', 1); setVal('f-anim-scale-max', 1.06); setVal('f-anim-scale-opacity', 0.8);
    setVal('f-anim-shake-x', 4); setVal('f-anim-shake-y', 4);
    setVal('f-anim-cs-hue-start', 0); setVal('f-anim-cs-hue-end', 360); setVal('f-anim-cs-sat', 1);
    _toggleAnimSubsettings('');
    // Glow reset
    setVal('f-glow-speed', 3); setVal('f-glow-int', 1); setVal('f-glow-blur', 20); setVal('f-glow-spread', 0); setVal('f-glow-op', 1);
    setChecked('f-glow-on', false); setChecked('f-glow-hover', false);
    // Shadow reset
    setVal('f-shadow-op', 0.35); setVal('f-shadow-x', 0); setVal('f-shadow-y', 4); setVal('f-shadow-blur', 12); setVal('f-shadow-spread', 0);
    setChecked('f-shadow-on', false); setVal('f-shadow-color', '#000000'); setChecked('f-shadow-inset', false);
    // Filter reset
    setVal('f-cs-fb', 1); setVal('f-cs-fc', 1); setVal('f-cs-fs', 1); setVal('f-cs-fg', 0); setVal('f-cs-fse', 0); setVal('f-cs-fh', 0); setVal('f-cs-fbl', 0); setVal('f-cs-fbl-type', ''); setVal('f-cs-fi', 0);
    setVal('f-cs-fo', 1); setVal('f-cs-ds-x', 0); setVal('f-cs-ds-y', 0); setVal('f-cs-ds-bl', 0); setVal('f-cs-ds-op', 0); setVal('f-cs-ds-clr', '#000000'); setVal('f-cs-ds-clr-h', '#000000');
    setVal('f-cs-radius', 0); setVal('f-cs-opacity', 1);
    // Hover reset
    setVal('f-hov-scale', 1); setVal('f-hov-bright', 1); setVal('f-hov-sat', 1);
    setVal('f-hov-shadow', 0); setVal('f-hov-trans', 0.3);
    setVal('f-hov-blur', 0); setVal('f-hov-sib-blur', 0); setVal('f-hov-hue', 0); setVal('f-hov-opacity', 1);
    setChecked('f-hov-glow', false); setChecked('f-hov-anim-on', false);
    const hovAnimTypeEl2 = g('f-hov-anim-type'); if (hovAnimTypeEl2) hovAnimTypeEl2.value = '';
    setVal('f-hov-anim-dur', 1);
    // Transform reset
    setVal('f-tf-rotate', 0); setVal('f-tf-scale', 1); setVal('f-tf-skewX', 0); setVal('f-tf-skewY', 0); setVal('f-tf-x', 0); setVal('f-tf-y', 0);
    // Sync all slider displays
    ALL_SLIDER_IDS.forEach(syncSliderDisplay);
    setVal('f-accent-color', '#dc2626'); setVal('f-accent-color-h', '#dc2626');
    setChecked('f-shimmer', false);
    setVal('f-shimmer-speed', 3); setVal('f-shimmer-op', 0.04);
    setChecked('f-border-on', false); setVal('f-border-color', '#dc2626');
    setVal('f-hov-border', '#dc2626');
    renderLicEditor(defLics.length ? JSON.parse(JSON.stringify(defLics)) : []);
  }
  prevImg();
  // Clear preset card active state — preset detection happens on apply, not on load
  document.querySelectorAll('.preset-card').forEach(c => c.classList.remove('active'));
  updateCardPreview();
  // Render full card preview in container
  if (typeof window.renderFullPvInCard === 'function') window.renderFullPvInCard();
  // Reset tabs to first — use showEt for reliable panel switching
  showEt('info');
}

// Upload helpers
// Image gallery: track all images for current beat
let _imgGallery = [];

function prevImg() {
  const url = val('f-img');
  // Add current URL to gallery if not already there
  if (url && url.length > 10 && _imgGallery.indexOf(url) === -1) {
    _imgGallery.push(url);
  }
  renderImgGallery();

  if (typeof window.renderFullPvInCard === 'function') window.renderFullPvInCard();
  if (url && typeof window._showImgPreview === 'function') window._showImgPreview(url);
  if (url && typeof window._addImgToHistory === 'function') window._addImgToHistory(url);
  if (typeof window._sendLiveUpdate === 'function') {
    clearTimeout(window._prevImgLiveTimer);
    window._prevImgLiveTimer = setTimeout(function() { window._sendLiveUpdate(); }, 300);
  }
}

function renderImgGallery() {
  const container = g('img-prev');
  if (!container) return;

  if (_imgGallery.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:4px">'
    + _imgGallery.map(function(url, i) {
      var isMain = (url === val('f-img'));
      return '<div style="position:relative;display:inline-block">'
        + '<img src="' + url + '" style="width:64px;height:64px;border-radius:6px;object-fit:cover;border:2px solid ' + (isMain ? 'var(--acc)' : 'var(--b)') + ';cursor:pointer" data-action="select-gallery-img" data-idx="' + i + '" title="' + (isMain ? '★ Principal' : 'Hacer principal') + '">'
        + '<div data-action="remove-gallery-img" data-idx="' + i + '" data-stop-propagation="true" title="Quitar" style="position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;background:var(--acc);color:#fff;font-size:9px;display:flex;align-items:center;justify-content:center;cursor:pointer;line-height:1">✕</div>'
        + (isMain ? '<div style="position:absolute;bottom:0;left:0;right:0;text-align:center;font-size:7px;color:var(--acc);background:rgba(0,0,0,.7);border-radius:0 0 4px 4px">★</div>' : '')
        + '</div>';
    }).join('')
    + '</div>';
}

// Registered as click-handler actions below
export function uploadBeatImg(input) {
  const file = input.files[0]; if (!file) return;
  if (!R2_ENABLED) { showToast('R2 Worker no configurado.', true); input.value = ''; return; }
  const beatId = editId || ('beat_' + Date.now());
  const btn = input.parentElement.querySelector('button'); btn.disabled = true; btn.textContent = '⏳'; showSaving(true);
  // Save current URL to gallery before overwriting
  const oldUrl = val('f-img');
  if (oldUrl && oldUrl.length > 10 && _imgGallery.indexOf(oldUrl) === -1) {
    _imgGallery.push(oldUrl);
  }
  uploadToR2(file, 'beats/' + beatId + '/cover-' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_'))
    .then(r => { setVal('f-img', r.url); prevImg(); _triggerLiveUpdate(); showSaving(false); btn.disabled = false; btn.textContent = '📤'; showToast('Imagen subida ✓'); if (typeof window.saveUrlToGallery === 'function') window.saveUrlToGallery(r.url, file.name.replace(/\.[^.]+$/, ''), 'cover', []); })
    .catch(err => { showSaving(false); btn.disabled = false; btn.textContent = '📤'; showToast('Error: ' + err.message, true); });
  input.value = '';
}
export function uploadBeatAudio(input) {
  const file = input.files[0]; if (!file) return;
  if (!R2_ENABLED) { showToast('R2 Worker no configurado.', true); input.value = ''; return; }
  const beatId = editId || ('beat_' + Date.now());
  const btn = input.parentElement.querySelector('button'); btn.disabled = true; btn.textContent = '⏳'; showSaving(true);
  const ext = file.name.split('.').pop().toLowerCase(); const folder = ext === 'wav' ? 'wavs' : 'audio';
  uploadToR2(file, 'beats/' + beatId + '/' + folder + '/' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_'))
    .then(r => { setVal('f-audio', r.url); showSaving(false); btn.disabled = false; btn.textContent = '📤'; showToast('Audio subido ✓'); })
    .catch(err => { showSaving(false); btn.disabled = false; btn.textContent = '📤'; showToast('Error: ' + err.message, true); });
  input.value = '';
}
export function uploadBeatPreview(input) {
  const file = input.files[0]; if (!file) return;
  if (!R2_ENABLED) { showToast('R2 Worker no configurado.', true); input.value = ''; return; }
  const beatId = editId || ('beat_' + Date.now());
  const btn = input.parentElement.querySelector('button'); btn.disabled = true; btn.textContent = '⏳'; showSaving(true);
  uploadToR2(file, 'beats/' + beatId + '/previews/' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_'))
    .then(r => { setVal('f-prev', r.url); updateMP(); showSaving(false); btn.disabled = false; btn.textContent = '📤'; showToast('Preview subido ✓'); })
    .catch(err => { showSaving(false); btn.disabled = false; btn.textContent = '📤'; showToast('Error: ' + err.message, true); });
  input.value = '';
}

// Batch preview upload — matches filenames to beats by name
export function uploadPreviews(input) {
  const files = Array.from(input.files || []); if (!files.length) return;
  if (!R2_ENABLED) { showToast('R2 Worker no configurado.', true); input.value = ''; return; }
  showSaving(true);
  let done = 0, total = files.length;
  files.forEach(f => {
    const baseName = f.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9._-]/g, '_');
    const match = allBeats.find(b => b.id === baseName || b.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() === baseName.toLowerCase());
    const beatId = match ? match.id : baseName;
    uploadToR2(f, 'beats/' + beatId + '/previews/' + f.name.replace(/[^a-zA-Z0-9._-]/g, '_'))
      .then(r => {
        if (match) { db.ref('beats/' + match.id + '/previewUrl').set(r.url).catch(()=>{}); }
        done++; if (done >= total) { showSaving(false); showToast(total + ' previews subidos ✓'); }
      })
      .catch(() => { done++; if (done >= total) { showSaving(false); showToast('Error en algunos archivos', true); } });
  });
  input.value = '';
}

// Save/Delete
export function saveBeat() {
  const id = val('f-id').trim(), name = val('f-name').trim();
  if (!id || !name) { showToast('ID y nombre requeridos', true); return; }
  collectLics();
  const cardStyle = _buildCardStyleFromInputs();
  // Legacy fields for backwards compat
  const animType = val('f-anim-type');
  // Determine if this beat has custom style (non-default)
  const _hasCustom = !_isCardStyleDefault(cardStyle);
  const beat = { name, genre: val('f-genre'), genreCustom: val('f-genre-c'), bpm: parseInt(val('f-bpm')) || 0, key: val('f-key'), description: val('f-desc'), tags: val('f-tags').split(',').map(t => t.trim()).filter(Boolean), imageUrl: val('f-img'), images: _imgGallery.slice(), audioUrl: val('f-audio'), previewUrl: val('f-prev'), spotify: val('f-spotify'), youtube: val('f-youtube'), soundcloud: val('f-soundcloud'), date: val('f-date'), order: parseInt(val('f-order')) || 0, plays: parseInt(val('f-plays')) || 0, featured: checked('f-feat'), exclusive: checked('f-excl'), active: checked('f-active'), available: checked('f-avail'), licenses: _edLics.filter(l => l.name),
    // Legacy fields (backwards compat)
    glowConfig: cardStyle.glow, cardAnim: cardStyle.anim, accentColor: cardStyle.style.accentColor, shimmer: cardStyle.style.shimmer, cardBorder: cardStyle.border,
    // New mega schema
    cardStyle: cardStyle, _customStyle: _hasCustom
  };
  showSaving(true);
  // Save beat to Firebase and clear liveEdits for this beat
  const updates = {};
  updates['beats/' + id] = beat;
  updates['liveEdits/' + id] = null; // Clear any live edits for this beat
  db.ref().update(updates).then(() => {
    showSaving(false);
    if (typeof window._clearLiveEdit === 'function') window._clearLiveEdit();
    // Force broadcast full state to preview iframe
    if (typeof window.broadcastThemeNow === 'function') window.broadcastThemeNow();
    showToast('Beat guardado ✓');
    showSection('beats');
  }).catch(err => { showSaving(false); showToast('Error: ' + err.message, true); });
}
export async function deleteBeat() {
  var delId = editId || val('f-id');
  if (!delId) { showToast('No hay beat seleccionado', true); return; }
  if (!await confirmInline('¿Eliminar beat "' + delId + '"?')) return;
  showSaving(true);
  const updates = {};
  updates['beats/' + delId] = null;
  updates['liveEdits/' + delId] = null; // Clear live edits too
  db.ref().update(updates).then(() => {
    showSaving(false);
    showToast('Eliminado ✓');
    setEditId(null);
    if (typeof window.broadcastThemeNow === 'function') window.broadcastThemeNow();
    showSection('beats');
  }).catch(err => { showSaving(false); showToast('Error: ' + (err.message || err.code), true); });
}
export async function quickDel(id) {
  if (!await confirmInline('¿Eliminar este beat?')) return;
  showSaving(true);
  const updates = {};
  updates['beats/' + id] = null;
  updates['liveEdits/' + id] = null; // Clear live edits too
  db.ref().update(updates).then(() => {
    showSaving(false);
    showToast('Eliminado ✓');
    if (typeof window.broadcastThemeNow === 'function') window.broadcastThemeNow();
  }).catch(err => { showSaving(false); showToast('Error: ' + (err.message || err.code), true); });
}

// Batch
export function openBatchImg() { g('batch-img-overlay').classList.add('open'); setupBatchDrop(); }
export function closeBatchImg() { g('batch-img-overlay').classList.remove('open'); }
function setupBatchDrop() {
  const drop = g('batch-img-drop');
  drop.onclick = () => document.getElementById('batch-img-input').click();
  drop.ondragover = e => { e.preventDefault(); drop.classList.add('over'); };
  drop.ondragleave = () => drop.classList.remove('over');
  drop.ondrop = e => { e.preventDefault(); drop.classList.remove('over'); handleBatchImgFiles(e.dataTransfer.files); };
}
export function handleBatchImgFiles(files) {
  const arr = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, 20 - _batchImgQueue.length);
  arr.forEach(f => {
    const name = f.name.replace(/\.[^.]+$/, '');
    const match = allBeats.find(b => b.name.toLowerCase() === name.toLowerCase());
    _batchImgQueue.push({ file: f, name, beatId: match ? match.id : '', preview: null });
    const reader = new FileReader(); const idx = _batchImgQueue.length - 1;
    reader.onload = e => { _batchImgQueue[idx].preview = e.target.result; renderBatchImgList(); };
    reader.readAsDataURL(f);
  });
  renderBatchImgList();
}
function renderBatchImgList() {
  const el = g('batch-img-list'); const saveBtn = g('batch-img-save');
  if (!_batchImgQueue.length) { el.innerHTML = ''; saveBtn.style.display = 'none'; return; }
  saveBtn.style.display = '';
  el.innerHTML = _batchImgQueue.map((item, i) => {
    const img = item.preview ? '<img src="' + item.preview + '">' : '';
    const options = allBeats.map(b => '<option value="' + b.id + '"' + (item.beatId === b.id ? ' selected' : '') + '>' + b.name + '</option>').join('');
    return '<div class="batch-img-item">' + img + '<span class="batch-img-item-name">' + item.name + '</span><select onchange="_batchImgQueue[' + i + '].beatId=this.value"><option value="">— Asignar beat —</option>' + options + '</select><button class="remove-img" data-action="batch-img-remove" data-idx="' + i + '">✕</button></div>';
  }).join('');
}
export function clearBatchImgQueue() { setBatchImgQueue([]); renderBatchImgList(); g('batch-img-input').value = ''; }
export function saveBatchImages() {
  const items = _batchImgQueue.filter(i => i.beatId);
  if (!items.length) { showToast('Asigna al menos una imagen', true); return; }
  showSaving(true); let done = 0; const total = items.length;
  items.forEach(item => {
    const dbPath = 'beats/' + item.beatId + '/imageUrl';
    if (R2_ENABLED && item.file) {
      uploadToR2(item.file, 'beats/' + item.beatId + '/cover-' + item.file.name.replace(/[^a-zA-Z0-9._-]/g, '_'))
        .then(r => db.ref(dbPath).set(r.url))
        .then(() => { done++; if (done >= total) { showSaving(false); showToast(total + ' subidas a R2 ✓'); clearBatchImgQueue(); closeBatchImg(); if (typeof window.broadcastThemeNow === 'function') window.broadcastThemeNow(); } })
        .catch(() => { done++; if (done >= total) { showSaving(false); showToast('Error', true); } });
    } else {
      db.ref(dbPath).set(item.preview).then(() => { done++; if (done >= total) { showSaving(false); showToast(total + ' asignadas ✓'); clearBatchImgQueue(); closeBatchImg(); if (typeof window.broadcastThemeNow === 'function') window.broadcastThemeNow(); } }).catch(() => { done++; if (done >= total) { showSaving(false); showToast('Error', true); } });
    }
  });
}
export async function batchAddBeats() {
  var count = await promptInline('¿Cuántos beats? (máx 20)', '3'); if (!count) return;
  count = parseInt(count); if (isNaN(count) || count < 1 || count > 20) { showToast('Máximo 20', true); return; }
  var base = allBeats.length; showSaving(true); var promises = [];
  for (var i = 0; i < count; i++) {
    var id = 'beat_' + Date.now() + '_' + i;
    promises.push(db.ref('beats/' + id).set({ name: 'Beat ' + (base + i + 1), genre: 'Trap', bpm: 140, key: 'Am', active: false, order: base + i, tags: [], description: '', imageUrl: '', audioUrl: '', previewUrl: '', spotify: '', youtube: '', soundcloud: '', date: new Date().toISOString().split('T')[0], available: true, exclusive: false, featured: false, plays: 0, licenses: [{ name: 'Basic', description: 'MP3 sin tag', priceMXN: 350, priceUSD: 18 }, { name: 'Premium', description: 'WAV sin tag', priceMXN: 1500, priceUSD: 75 }, { name: 'Exclusive', description: 'Stems + exclusividad', priceMXN: 8000, priceUSD: 400 }] }));
  }
  Promise.all(promises).then(() => { showSaving(false); showToast(count + ' beats creados'); }).catch(() => { showSaving(false); showToast('Error', true); });
}

// MP3 Player
let mpAudio2 = null;
export function updateMP() {
  // Called when preview URL changes — stop current playback and reset UI
  if (mpAudio2) { mpAudio2.pause(); mpAudio2 = null; }
  const fill = g('mp-fill'); if (fill) fill.style.width = '0%';
  const t = g('mp-t'); if (t) t.textContent = '0:00 / 0:00';
  _triggerLiveUpdate();
}
export function toggleMP() {
  const url = val('f-prev') || val('f-audio'); if (!url) return;
  if (mpAudio2 && !mpAudio2.paused) { mpAudio2.pause(); return; }
  if (mpAudio2) mpAudio2.pause();
  mpAudio2 = new Audio(url);
  mpAudio2.addEventListener('timeupdate', () => { if (!mpAudio2.duration) return; const pct = (mpAudio2.currentTime / mpAudio2.duration) * 100; g('mp-fill').style.width = pct + '%'; g('mp-t').textContent = fmt(mpAudio2.currentTime) + ' / ' + fmt(mpAudio2.duration); });
  mpAudio2.play().catch(() => {});
}
export function seekMP(e) { if (!mpAudio2 || !mpAudio2.duration) return; const r = e.currentTarget.getBoundingClientRect(); mpAudio2.currentTime = ((e.clientX - r.left) / r.width) * mpAudio2.duration; }


// ═══ Register click-handler actions ═══
registerActions({
  'open-editor': (el) => openEditor(el.dataset.id || el.closest('[data-id]')?.dataset.id),
  'quick-del': (el) => quickDel(el.dataset.id),
  'inline-edit-name': (el) => inlineEditName(el, el.dataset.id),
  'inline-edit-bpm': (el) => inlineEditBpm(el, el.dataset.id),
  'inline-edit-key': (el) => inlineEditKey(el, el.dataset.id),
  'up-lic': (el) => { const idx = parseInt(el.dataset.idx); const field = el.dataset.field; upLic(idx, field, el.value); },
  'rm-lic': (el) => rmLic(parseInt(el.dataset.idx)),
  'select-gallery-img': (el) => { const idx = parseInt(el.dataset.idx); if (_imgGallery[idx]) { setVal('f-img', _imgGallery[idx]); renderImgGallery(); _triggerLiveUpdate(); } },
  'remove-gallery-img': (el) => { const idx = parseInt(el.dataset.idx); const removed = _imgGallery.splice(idx, 1)[0]; if (removed === val('f-img')) setVal('f-img', _imgGallery[0] || ''); renderImgGallery(); _triggerLiveUpdate(); },
  'batch-img-remove': (el) => { _batchImgQueue.splice(parseInt(el.dataset.idx), 1); renderBatchImgList(); },
  'noop': () => {},
  // Gallery picker for beat image — sets f-img and triggers preview updates
  'gallery-pick-img': () => {
    window.openGalleryPicker(function(url) {
      var f = document.getElementById('f-img');
      if (f) {
        f.value = url;
        if (typeof window.prevImg === 'function') window.prevImg();
        if (typeof window.updateCardPreview === 'function') window.updateCardPreview();
        if (typeof window._sendLiveUpdate === 'function') window._sendLiveUpdate();
      }
    });
  },
  // Trash actions for beat editor fields
  'trash-audio': () => {
    var f = document.getElementById('f-audio');
    if (f && f.value) {
      var bid = document.getElementById('f-id'), bn = document.getElementById('f-name');
      window.trashItem(bid ? bid.value : '', bn ? bn.value : '', 'audio', f.value, 'audio-wav');
      f.value = '';
      if (typeof window._sendLiveUpdate === 'function') window._sendLiveUpdate();
    }
  },
  'trash-preview': () => {
    var f = document.getElementById('f-prev');
    if (f && f.value) {
      var bid = document.getElementById('f-id'), bn = document.getElementById('f-name');
      window.trashItem(bid ? bid.value : '', bn ? bn.value : '', 'preview', f.value, 'preview-mp3');
      f.value = '';
      window.updateMP();
      if (typeof window._sendLiveUpdate === 'function') window._sendLiveUpdate();
    }
  },
  'trash-img': () => {
    var f = document.getElementById('f-img');
    if (f && f.value) {
      var bid = document.getElementById('f-id');
      window.trashItem(bid ? bid.value : '', 'beat', 'image', f.value, 'cover');
      f.value = '';
      if (typeof window.prevImg === 'function') window.prevImg();
      if (typeof window._sendLiveUpdate === 'function') window._sendLiveUpdate();
      var pv = document.getElementById('pv-img-preview');
      if (pv) pv.style.display = 'none';
    }
  },
  // Remove parent element and update card preview (used by holo color swatches)
  'remove-parent': (el) => { el.parentElement.remove(); updateCardPreview(); },
});

if (typeof document !== 'undefined' && document.addEventListener) initClickHandler();

Object.assign(window, {
  filterBeatList, renderBeatList, dragStart, dragOver, dropBeat, dragEnd,
  openEditor, upLic, addLicRow, rmLic, loadDefaultLics,
  uploadBeatImg, uploadBeatAudio, uploadBeatPreview, uploadPreviews,
  saveBeat, deleteBeat, quickDel,
  inlineEditName, inlineEditBpm, inlineEditKey,
  openBatchImg, closeBatchImg, handleBatchImgFiles, clearBatchImgQueue, saveBatchImages,
  batchAddBeats, toggleMP, seekMP, prevImg, updateMP
});

// Initialize preset grids (safe if DOM not ready — functions bail early)
renderPresets();
renderHoverPresets();
// Initialize effect gallery
if (typeof document !== 'undefined' && document.getElementById) {
  var _fxGallery = document.getElementById('beat-fx-gallery');
  if (_fxGallery && !_fxGallery.children.length) _fxGallery.innerHTML = renderEffectGalleryHTML('f-');
}
