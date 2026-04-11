// ═══ DACEWAV Admin — Beats CRUD ═══
import { db, allBeats, setAllBeats, editId, setEditId, defLics, _edLics, setEdLics, _dragBeatId, setDragBeatId, _batchImgQueue, setBatchImgQueue } from './state.js';
import { g, val, setVal, checked, setChecked, showToast, showSaving, confirmInline, promptInline, fmt } from './helpers.js';
import { showSection } from './nav.js';
import { autoSave } from './core.js';
import { R2_ENABLED, uploadToR2 } from './r2.js';

// Sync slider value display after programmatic setVal
function syncSliderDisplay(inputId) {
  const el = g(inputId); if (!el) return;
  const sib = el.nextElementSibling; if (!sib) return;
  const v = parseFloat(el.value);
  if (inputId.includes('dur') || inputId.includes('del') || inputId.includes('speed')) sib.textContent = v.toFixed(1) + 's';
  else if (inputId.includes('width') || inputId.includes('blur') || inputId.includes('spread') || inputId.includes('shadow') && !inputId.includes('hov')) sib.textContent = (inputId.includes('blur') || inputId.includes('spread') || inputId.includes('shadow')) ? v + 'px' : v.toFixed(1) + 'px';
  else if (inputId.includes('rotate') || inputId.includes('skew') || inputId.includes('hue') || inputId.includes('fh')) sib.textContent = v.toFixed(1) + '°';
  else if (inputId.includes('scale') || inputId.includes('hov-scale') || inputId.includes('tf-scale')) sib.textContent = v.toFixed(2) + 'x';
  else if (inputId.includes('radius')) sib.textContent = v + 'px';
  else if (inputId.includes('x') || inputId.includes('y')) sib.textContent = v + 'px';
  else if (inputId.includes('trans')) sib.textContent = v.toFixed(2) + 's';
  else sib.textContent = v.toFixed(2);
}

// Color picker ↔ hex input sync (bidirectional)
function syncAccentColor(source) {
  const picker = g('f-accent-color');
  const hex = g('f-accent-color-h');
  if (!picker || !hex) return;
  if (source === 'picker') hex.value = picker.value;
  else picker.value = hex.value;
}

// ═══ HELPER: build cardStyle from inputs ═══
function _buildCardStyleFromInputs() {
  const animType = val('f-anim-type');
  return {
    filter: {
      brightness: parseFloat(val('f-cs-fb')) || 1,
      contrast: parseFloat(val('f-cs-fc')) || 1,
      saturate: parseFloat(val('f-cs-fs')) || 1,
      grayscale: parseFloat(val('f-cs-fg')) || 0,
      sepia: parseFloat(val('f-cs-fse')) || 0,
      hueRotate: parseInt(val('f-cs-fh')) || 0,
      blur: parseFloat(val('f-cs-fbl')) || 0,
      invert: parseFloat(val('f-cs-fi')) || 0
    },
    glow: {
      enabled: checked('f-glow-on'),
      type: val('f-glow-type') || 'active',
      color: val('f-glow-color') || '#dc2626',
      speed: parseFloat(val('f-glow-speed')) || 3,
      intensity: parseFloat(val('f-glow-int')) || 1,
      blur: parseInt(val('f-glow-blur')) || 20,
      spread: parseInt(val('f-glow-spread')) || 0,
      opacity: parseFloat(val('f-glow-op')) || 1,
      hoverOnly: checked('f-glow-hover')
    },
    anim: animType ? {
      type: animType,
      type2: val('f-anim-type2') || '',
      dur: parseFloat(val('f-anim-dur')) || 2,
      del: parseFloat(val('f-anim-del')) || 0,
      easing: val('f-anim-ease') || 'ease-in-out',
      direction: val('f-anim-dir') || 'normal',
      iterations: val('f-anim-iter') || 'infinite'
    } : null,
    style: {
      accentColor: val('f-accent-color') || '',
      shimmer: checked('f-shimmer'),
      borderRadius: parseInt(val('f-cs-radius')) || 0,
      opacity: parseFloat(val('f-cs-opacity')) || 1
    },
    border: {
      enabled: checked('f-border-on'),
      color: val('f-border-color') || '#dc2626',
      width: parseFloat(val('f-border-width')) || 1,
      style: val('f-border-style') || 'solid'
    },
    shadow: {
      enabled: checked('f-shadow-on'),
      color: val('f-shadow-color') || '#000000',
      opacity: parseFloat(val('f-shadow-op')) || 0.35,
      x: parseInt(val('f-shadow-x')) || 0,
      y: parseInt(val('f-shadow-y')) || 4,
      blur: parseInt(val('f-shadow-blur')) || 12,
      spread: parseInt(val('f-shadow-spread')) || 0,
      inset: checked('f-shadow-inset')
    },
    hover: {
      scale: parseFloat(val('f-hov-scale')) || 1,
      brightness: parseFloat(val('f-hov-bright')) || 1,
      saturate: parseFloat(val('f-hov-sat')) || 1,
      shadowBlur: parseInt(val('f-hov-shadow')) || 0,
      transition: parseFloat(val('f-hov-trans')) || 0.3,
      borderColor: val('f-hov-border') || '',
      glowIntensify: checked('f-hov-glow'),
      blur: parseFloat(val('f-hov-blur')) || 0,
      siblingsBlur: parseFloat(val('f-hov-sib-blur')) || 0,
      hueRotate: parseInt(val('f-hov-hue')) || 0,
      opacity: parseFloat(val('f-hov-opacity')) || 1,
      enableAnim: checked('f-hov-anim-on'),
      animType: val('f-hov-anim-type') || '',
      animDur: parseFloat(val('f-hov-anim-dur')) || 1
    },
    transform: {
      rotate: parseFloat(val('f-tf-rotate')) || 0,
      scale: parseFloat(val('f-tf-scale')) || 1,
      skewX: parseFloat(val('f-tf-skewX')) || 0,
      skewY: parseFloat(val('f-tf-skewY')) || 0,
      x: parseInt(val('f-tf-x')) || 0,
      y: parseInt(val('f-tf-y')) || 0
    }
  };
}

// ═══ HELPER: apply cardStyle to preview element ═══
function _applyCardStyleToPreview(pv, cs) {
  const inner = pv.querySelector('.bcpv-inner');

  // 1. CSS Filters
  const f = cs.filter || {};
  const filters = [];
  if (f.brightness !== 1) filters.push('brightness(' + f.brightness + ')');
  if (f.contrast !== 1) filters.push('contrast(' + f.contrast + ')');
  if (f.saturate !== 1) filters.push('saturate(' + f.saturate + ')');
  if (f.grayscale) filters.push('grayscale(' + f.grayscale + ')');
  if (f.sepia) filters.push('sepia(' + f.sepia + ')');
  if (f.hueRotate) filters.push('hue-rotate(' + f.hueRotate + 'deg)');
  if (f.blur) filters.push('blur(' + f.blur + 'px)');
  if (f.invert) filters.push('invert(' + f.invert + ')');
  if (filters.length) pv.style.filter = filters.join(' ');

  // 2. Glow
  const gc = cs.glow || {};
  if (gc.enabled) {
    pv.classList.add('glow-' + (gc.type || 'active'));
    const hex = (gc.color || '#dc2626').replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 220;
    const gv = parseInt(hex.substring(2, 4), 16) || 38;
    const b = parseInt(hex.substring(4, 6), 16) || 38;
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

  // 3. Card animation
  const ca = cs.anim;
  if (ca && ca.type) {
    pv.classList.add('anim-' + ca.type);
    pv.style.setProperty('--ad', (ca.dur || 2) + 's');
    pv.style.setProperty('--adl', (ca.del || 0) + 's');
    pv.style.setProperty('--aease', ca.easing || 'ease-in-out');
    pv.style.setProperty('--adir', ca.direction || 'normal');
    pv.style.setProperty('--aiter', ca.iterations || 'infinite');
    // Secondary animation on ::before pseudo-element
    if (ca.type2) {
      pv.classList.add('anim2-' + ca.type2);
      pv.style.setProperty('--anim2', 'anim-' + ca.type2);
    }
  }

  // 4. Style
  const st = cs.style || {};
  if (st.accentColor) pv.style.setProperty('--card-tint', 'linear-gradient(135deg,' + st.accentColor + ',transparent)');
  if (st.shimmer) pv.classList.add('shimmer-on');
  if (st.borderRadius && inner) inner.style.borderRadius = st.borderRadius + 'px';
  if (st.opacity < 1) pv.style.opacity = st.opacity;

  // 5. Border
  const bd = cs.border || {};
  if (bd.enabled && inner) {
    inner.style.border = (bd.width || 1) + 'px ' + (bd.style || 'solid') + ' ' + (bd.color || '#dc2626');
  }

  // 6. Shadow
  const sh = cs.shadow || {};
  if (sh.enabled) {
    const rgba = _hexToRgba(sh.color || '#000000', sh.opacity != null ? sh.opacity : 0.35);
    const prefix = sh.inset ? 'inset ' : '';
    pv.style.boxShadow = prefix + (sh.x || 0) + 'px ' + (sh.y || 4) + 'px ' + (sh.blur || 12) + 'px ' + (sh.spread || 0) + 'px ' + rgba;
  }

  // 7. Transform
  const tf = cs.transform || {};
  const transforms = [];
  if (tf.rotate) transforms.push('rotate(' + tf.rotate + 'deg)');
  if (tf.scale && tf.scale !== 1) transforms.push('scale(' + tf.scale + ')');
  if (tf.skewX) transforms.push('skewX(' + tf.skewX + 'deg)');
  if (tf.skewY) transforms.push('skewY(' + tf.skewY + 'deg)');
  if (tf.x) transforms.push('translateX(' + tf.x + 'px)');
  if (tf.y) transforms.push('translateY(' + tf.y + 'px)');
  if (transforms.length) pv.style.transform = transforms.join(' ');

  // 8. Hover vars (for CSS to pick up)
  const hv = cs.hover || {};
  if (hv.scale && hv.scale !== 1) pv.style.setProperty('--hov-scale', hv.scale);
  if (hv.brightness && hv.brightness !== 1) pv.style.setProperty('--hov-bright', hv.brightness);
  if (hv.saturate && hv.saturate !== 1) pv.style.setProperty('--hov-sat', hv.saturate);
  if (hv.shadowBlur) pv.style.setProperty('--hov-shadow', hv.shadowBlur + 'px');
  if (hv.transition != null) pv.style.setProperty('--hov-trans', (hv.transition || 0.3) + 's');
  if (hv.borderColor) pv.style.setProperty('--hov-bdr', hv.borderColor);
  if (hv.glowIntensify) pv.classList.add('hov-glow-int');
  const hasHoverEffects = (hv.scale && hv.scale !== 1) || (hv.brightness && hv.brightness !== 1) || (hv.saturate && hv.saturate !== 1) || hv.shadowBlur || hv.borderColor || hv.glowIntensify;
  if (hasHoverEffects) pv.classList.add('has-hover-fx');
}

function _hexToRgba(hex, alpha) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  return 'rgba(' + r + ',' + g + ',' + b + ',' + (alpha != null ? alpha : 1) + ')';
}

// ═══ LIVE CARD PREVIEW ═══
function updateCardPreview() {
  const pv = g('beat-card-pv'); if (!pv) return;

  // Beat info
  const name = val('f-name') || 'Nombre del Beat';
  const bpm = val('f-bpm') || '140';
  const key = val('f-key') || 'Am';
  const genre = g('f-genre')?.value || 'Trap';
  const imgUrl = val('f-img');

  const nameEl = g('bcpv-name'); if (nameEl) nameEl.textContent = name;
  const bpmEl = g('bcpv-bpm'); if (bpmEl) bpmEl.textContent = bpm + ' BPM';
  const keyEl = g('bcpv-key'); if (keyEl) keyEl.textContent = key;
  const genreEl = g('bcpv-genre'); if (genreEl) genreEl.textContent = genre;

  // Image
  const imgWrap = g('bcpv-img');
  if (imgWrap) {
    if (imgUrl) imgWrap.innerHTML = '<img src="' + imgUrl + '" alt="">';
    else imgWrap.innerHTML = '<div class="bcpv-img-ph">♪</div>';
  }

  // Reset
  pv.className = 'bcpv';
  pv.style.cssText = '';
  if (inner = pv.querySelector('.bcpv-inner')) { inner.style.border = ''; inner.style.borderRadius = ''; }

  // Build and apply cardStyle
  const cs = _buildCardStyleFromInputs();
  _applyCardStyleToPreview(pv, cs);
}
function syncBorderColor(source) {
  const picker = g('f-border-color');
  if (!picker) return;
  // border color has no hex text input, just the picker — but we could add one later
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
    return '<div class="beat-row" draggable="true" data-id="' + b.id + '" ondragstart="dragStart(event)" ondragover="dragOver(event)" ondrop="dropBeat(event)" ondragend="dragEnd(event)" onclick="openEditor(\'' + b.id + '\')"><span class="drag-handle" onclick="event.stopPropagation()">⠿</span><div class="beat-row-thumb">' + img + '</div><div><div class="beat-row-name" data-editable ondblclick="event.stopPropagation();inlineEditName(this,\'' + b.id + '\')">' + b.name + (badges.length ? ' <span style="font-size:8px;color:var(--acc)">' + badges.join(' ') + '</span>' : '') + '</div><div class="beat-row-meta"><span data-editable ondblclick="event.stopPropagation();inlineEditBpm(this,\'' + b.id + '\')">' + b.bpm + ' BPM</span> · <span data-editable ondblclick="event.stopPropagation();inlineEditKey(this,\'' + b.id + '\')">' + b.key + '</span> · ' + b.genre + '</div></div><div class="beat-row-acts"><button class="btn" onclick="event.stopPropagation();openEditor(\'' + b.id + '\')" style="font-size:9px;padding:3px 8px">✎</button><button class="btn btn-del" onclick="event.stopPropagation();quickDel(\'' + b.id + '\')" style="font-size:9px;padding:3px 8px">✕</button></div></div>';
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
  g('editor-title').innerHTML = '<i class="fas fa-edit"></i> ' + (id ? 'Editar' : 'Nuevo') + ' beat';
  g('btn-del').style.display = id ? 'inline-flex' : 'none';
  const idField = g('f-id');
  if (idField) { idField.readOnly = !!id; idField.style.opacity = id ? '0.5' : '1'; idField.style.cursor = id ? 'not-allowed' : 'text'; }
  if (id) {
    const b = allBeats.find(x => x.id === id); if (!b) return;
    setVal('f-id', b.id); setVal('f-name', b.name); setVal('f-genre', b.genre || 'Trap'); setVal('f-genre-c', b.genreCustom || '');
    setVal('f-bpm', b.bpm || ''); setVal('f-key', b.key || ''); setVal('f-desc', b.description || ''); setVal('f-tags', (b.tags || []).join(', '));
    setVal('f-img', b.imageUrl || ''); setVal('f-audio', b.audioUrl || ''); setVal('f-prev', b.previewUrl || '');
    setVal('f-spotify', b.spotify || ''); setVal('f-youtube', b.youtube || ''); setVal('f-soundcloud', b.soundcloud || '');
    setVal('f-date', b.date || ''); setVal('f-order', b.order || 0); setVal('f-plays', b.plays || 0);
    setChecked('f-feat', b.featured); setChecked('f-excl', b.exclusive); setChecked('f-active', b.active !== false); setChecked('f-avail', b.available !== false);
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
    setVal('f-cs-fi', csF.invert || 0);

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

    // Style
    const accentClr = csS.accentColor || b.accentColor || '#dc2626';
    setVal('f-accent-color', accentClr); setVal('f-accent-color-h', accentClr);
    setChecked('f-shimmer', csS.shimmer != null ? csS.shimmer : (b.shimmer || false));
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

    // Transform
    setVal('f-tf-rotate', csTf.rotate || 0);
    setVal('f-tf-scale', csTf.scale || 1);
    setVal('f-tf-skewX', csTf.skewX || 0);
    setVal('f-tf-skewY', csTf.skewY || 0);
    setVal('f-tf-x', csTf.x || 0);
    setVal('f-tf-y', csTf.y || 0);

    // Sync all slider displays
    ['f-anim-dur','f-anim-del','f-border-width','f-glow-speed','f-glow-int','f-glow-blur','f-glow-spread','f-glow-op',
     'f-cs-fb','f-cs-fc','f-cs-fs','f-cs-fg','f-cs-fse','f-cs-fh','f-cs-fbl','f-cs-fi','f-cs-radius','f-cs-opacity',
     'f-shadow-op','f-shadow-x','f-shadow-y','f-shadow-blur','f-shadow-spread',
     'f-hov-scale','f-hov-bright','f-hov-sat','f-hov-shadow','f-hov-trans',
     'f-tf-rotate','f-tf-scale','f-tf-skewX','f-tf-skewY','f-tf-x','f-tf-y'
    ].forEach(syncSliderDisplay);
    renderLicEditor(b.licenses || []);
  } else {
    ['f-id', 'f-name', 'f-genre-c', 'f-bpm', 'f-key', 'f-desc', 'f-tags', 'f-img', 'f-audio', 'f-prev', 'f-spotify', 'f-youtube', 'f-soundcloud', 'f-date'].forEach(id => setVal(id, ''));
    setVal('f-order', 0); setVal('f-plays', 0); setChecked('f-feat', false); setChecked('f-excl', false); setChecked('f-active', true); setChecked('f-avail', true);
    g('f-genre').value = 'Trap';
    // Reset all cardStyle fields to defaults
    const animTypeEl = g('f-anim-type'); if (animTypeEl) animTypeEl.value = '';
    const animType2El = g('f-anim-type2'); if (animType2El) animType2El.value = '';
    ['f-anim-dur','f-anim-del','f-glow-speed','f-glow-int','f-glow-blur','f-glow-spread','f-glow-op',
     'f-cs-fb','f-cs-fc','f-cs-fs','f-cs-fg','f-cs-fse','f-cs-fh','f-cs-fbl','f-cs-fi','f-cs-radius','f-cs-opacity',
     'f-shadow-op','f-shadow-x','f-shadow-y','f-shadow-blur','f-shadow-spread',
     'f-hov-scale','f-hov-bright','f-hov-sat','f-hov-shadow','f-hov-trans',
     'f-tf-rotate','f-tf-scale','f-tf-skewX','f-tf-skewY','f-tf-x','f-tf-y'
    ].forEach(id => { const el = g(id); if (el) { el.value = el.defaultValue || (el.min != null ? el.min : 0); } });
    setChecked('f-glow-on', false); setChecked('f-glow-hover', false);
    setVal('f-accent-color', '#dc2626'); setVal('f-accent-color-h', '#dc2626');
    setChecked('f-shimmer', false);
    setChecked('f-border-on', false); setVal('f-border-color', '#dc2626'); setVal('f-border-width', 1);
    setChecked('f-shadow-on', false); setVal('f-shadow-color', '#000000'); setChecked('f-shadow-inset', false);
    setChecked('f-hov-glow', false); setVal('f-hov-border', '#dc2626');
    renderLicEditor(defLics.length ? JSON.parse(JSON.stringify(defLics)) : []);
  }
  prevImg();
  updateCardPreview();
  document.querySelectorAll('#sec-add .et').forEach((t, i) => t.classList.toggle('on', i === 0));
  document.querySelectorAll('#sec-add .etp').forEach((p, i) => p.classList.toggle('on', i === 0));
}

// License Editor
function renderLicEditor(lics) {
  g('le-editor').innerHTML = lics.map((l, i) => '<div class="lic-ed-row" data-idx="' + i + '"><div class="lic-ed-grid"><input type="text" placeholder="Nombre" value="' + (l.name || '') + '" onchange="upLic(' + i + ',\'name\',this.value)"><input type="number" placeholder="MXN" value="' + (l.priceMXN || '') + '" onchange="upLic(' + i + ',\'mxn\',this.value)"><input type="number" placeholder="USD" value="' + (l.priceUSD || '') + '" onchange="upLic(' + i + ',\'usd\',this.value)"></div><input type="text" placeholder="Descripción" value="' + (l.description || '') + '" style="font-size:10px" onchange="upLic(' + i + ',\'desc\',this.value)"><button class="btn btn-del" style="margin-top:4px;font-size:9px" onclick="rmLic(' + i + ')">✕</button></div>').join('');
}
export function upLic(idx, field, value) { collectLics(); autoSave(); }
export function addLicRow() { collectLics(); _edLics.push({ name: '', priceMXN: 0, priceUSD: 0, description: '' }); renderLicEditor(_edLics); }
export function rmLic(idx) { collectLics(); _edLics.splice(idx, 1); renderLicEditor(_edLics); }
function collectLics() { const lics = []; g('le-editor').querySelectorAll('.lic-ed-row').forEach(row => { const inp = row.querySelectorAll('input'); lics.push({ name: inp[0].value, priceMXN: parseFloat(inp[1].value) || 0, priceUSD: parseFloat(inp[2].value) || 0, description: inp[3].value }); }); setEdLics(lics); }
export function loadDefaultLics() { renderLicEditor(JSON.parse(JSON.stringify(defLics))); showToast('Licencias base cargadas'); }

// Upload helpers
function prevImg() { const url = val('f-img'); g('img-prev').innerHTML = url ? '<img src="' + url + '" style="max-width:160px;max-height:100px;border-radius:6px;border:1px solid var(--b)">' : ''; }
export function uploadBeatImg(input) {
  const file = input.files[0]; if (!file) return;
  if (!R2_ENABLED) { showToast('R2 Worker no configurado.', true); input.value = ''; return; }
  const beatId = editId || ('beat_' + Date.now());
  const btn = input.parentElement.querySelector('button'); btn.disabled = true; btn.textContent = '⏳'; showSaving(true);
  uploadToR2(file, 'beats/' + beatId + '/cover-' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_'))
    .then(r => { setVal('f-img', r.url); prevImg(); showSaving(false); btn.disabled = false; btn.textContent = '📤'; showToast('Imagen subida ✓'); })
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

// Save/Delete
export function saveBeat() {
  const id = val('f-id').trim(), name = val('f-name').trim();
  if (!id || !name) { showToast('ID y nombre requeridos', true); return; }
  collectLics();
  const cardStyle = _buildCardStyleFromInputs();
  // Legacy fields for backwards compat
  const animType = val('f-anim-type');
  const beat = { name, genre: val('f-genre'), genreCustom: val('f-genre-c'), bpm: parseInt(val('f-bpm')) || 0, key: val('f-key'), description: val('f-desc'), tags: val('f-tags').split(',').map(t => t.trim()).filter(Boolean), imageUrl: val('f-img'), audioUrl: val('f-audio'), previewUrl: val('f-prev'), spotify: val('f-spotify'), youtube: val('f-youtube'), soundcloud: val('f-soundcloud'), date: val('f-date'), order: parseInt(val('f-order')) || 0, plays: parseInt(val('f-plays')) || 0, featured: checked('f-feat'), exclusive: checked('f-excl'), active: checked('f-active'), available: checked('f-avail'), licenses: _edLics.filter(l => l.name),
    // Legacy fields (backwards compat)
    glowConfig: cardStyle.glow, cardAnim: cardStyle.anim, accentColor: cardStyle.style.accentColor, shimmer: cardStyle.style.shimmer, cardBorder: cardStyle.border,
    // New mega schema
    cardStyle: cardStyle
  };
  showSaving(true); db.ref('beats/' + id).set(beat).then(() => { showSaving(false); showToast('Beat guardado ✓'); showSection('beats'); }).catch(err => { showSaving(false); showToast('Error: ' + err.message, true); });
}
export async function deleteBeat() {
  var delId = editId || val('f-id');
  if (!delId) { showToast('No hay beat seleccionado', true); return; }
  if (!await confirmInline('¿Eliminar beat "' + delId + '"?')) return;
  showSaving(true); db.ref('beats/' + delId).remove().then(() => { showSaving(false); showToast('Eliminado ✓'); setEditId(null); showSection('beats'); }).catch(err => { showSaving(false); showToast('Error: ' + (err.message || err.code), true); });
}
export async function quickDel(id) {
  if (!await confirmInline('¿Eliminar este beat?')) return;
  showSaving(true); db.ref('beats/' + id).remove().then(() => { showSaving(false); showToast('Eliminado ✓'); }).catch(err => { showSaving(false); showToast('Error: ' + (err.message || err.code), true); });
}

// Inline Edit
function _inlineEdit(el, id, field, parse) {
  if (el.querySelector('input')) return;
  const beat = allBeats.find(b => b.id === id); if (!beat) return;
  const orig = field === 'bpm' ? String(beat.bpm) : field === 'key' ? beat.key : beat.name;
  const inp = document.createElement('input'); inp.className = 'beat-inline-edit'; inp.value = orig;
  inp.style.maxWidth = field === 'name' ? '200px' : '80px';
  el.innerHTML = ''; el.appendChild(inp); inp.focus(); inp.select();
  function save() {
    const val2 = parse ? parse(inp.value) : inp.value.trim();
    if (val2 !== null && val2 !== orig) {
      beat[field] = val2;
      showSaving(true); db.ref('beats/' + id + '/' + field).set(val2).then(() => { showSaving(false); showToast('Actualizado ✓'); }).catch(err => { showSaving(false); showToast('Error', true); });
    }
    renderBeatList();
  }
  inp.addEventListener('blur', save);
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); save(); } if (e.key === 'Escape') { renderBeatList(); } });
}
export function inlineEditName(el, id) { _inlineEdit(el, id, 'name', v => { const s = v.trim(); return s ? s : null; }); }
export function inlineEditBpm(el, id) { _inlineEdit(el, id, 'bpm', v => { const n = parseInt(v); return (n > 0 && n < 400) ? n : null; }); }
export function inlineEditKey(el, id) { _inlineEdit(el, id, 'key', v => { const s = v.trim().toUpperCase(); return s ? s : null; }); }

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
    return '<div class="batch-img-item">' + img + '<span class="batch-img-item-name">' + item.name + '</span><select onchange="_batchImgQueue[' + i + '].beatId=this.value"><option value="">— Asignar beat —</option>' + options + '</select><button class="remove-img" onclick="_batchImgQueue.splice(' + i + ',1);renderBatchImgList()">✕</button></div>';
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
        .then(() => { done++; if (done >= total) { showSaving(false); showToast(total + ' subidas a R2 ✓'); clearBatchImgQueue(); closeBatchImg(); } })
        .catch(() => { done++; if (done >= total) { showSaving(false); showToast('Error', true); } });
    } else {
      db.ref(dbPath).set(item.preview).then(() => { done++; if (done >= total) { showSaving(false); showToast(total + ' asignadas ✓'); clearBatchImgQueue(); closeBatchImg(); } }).catch(() => { done++; if (done >= total) { showSaving(false); showToast('Error', true); } });
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
export function toggleMP() {
  const url = val('f-prev') || val('f-audio'); if (!url) return;
  if (mpAudio2 && !mpAudio2.paused) { mpAudio2.pause(); return; }
  if (mpAudio2) mpAudio2.pause();
  mpAudio2 = new Audio(url);
  mpAudio2.addEventListener('timeupdate', () => { if (!mpAudio2.duration) return; const pct = (mpAudio2.currentTime / mpAudio2.duration) * 100; g('mp-fill').style.width = pct + '%'; g('mp-t').textContent = fmt(mpAudio2.currentTime) + ' / ' + fmt(mpAudio2.duration); });
  mpAudio2.play().catch(() => {});
}
export function seekMP(e) { if (!mpAudio2 || !mpAudio2.duration) return; const r = e.currentTarget.getBoundingClientRect(); mpAudio2.currentTime = ((e.clientX - r.left) / r.width) * mpAudio2.duration; }

Object.assign(window, {
  filterBeatList, renderBeatList, dragStart, dragOver, dropBeat, dragEnd,
  openEditor, upLic, addLicRow, rmLic, loadDefaultLics,
  uploadBeatImg, uploadBeatAudio, uploadBeatPreview,
  saveBeat, deleteBeat, quickDel,
  inlineEditName, inlineEditBpm, inlineEditKey,
  openBatchImg, closeBatchImg, handleBatchImgFiles, clearBatchImgQueue, saveBatchImages,
  batchAddBeats, toggleMP, seekMP,
  syncAccentColor, updateCardPreview
});
