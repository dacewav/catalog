// ═══ DACEWAV Admin — Beat Preview ═══
// Card HTML builder (used by _renderFullPvCard for floating preview), draggable preview, resize handles.
// NOTE: The main preview lives in the iframe panel (preview-frame). The mini preview was removed.

import { g, val, checked } from './helpers.js';
import { _buildCardStyleFromInputs, SD_FMT } from './beat-card-style.js';

// ═══ Shared card HTML builder (DRY) ═══
window._buildCardHTML = function(cs, opts) {
  const { name, bpm, key, genre, imgUrl, tags, isExcl } = opts;
  const f = cs.filter || {};
  const gc = cs.glow || {};
  const ca = cs.anim || {};
  const csH = cs.hover || {};
  const csS = cs.style || {};
  const csSh = cs.shadow || {};
  const csTf = cs.transform || {};
  const csBd = cs.border || {};

  // Classes
  var animSuffix = '';
  if (ca.type === 'holograma' && ca.holoDir) {
    if (ca.holoDir === 'gradient') animSuffix = '-gradient';
    else if (ca.holoDir === 'pulse') animSuffix = '-pulse';
  }
  const animClass = ca.type ? 'anim-' + ca.type + animSuffix : '';
  const anim2Class = ca.type2 ? 'anim2-' + ca.type2 : '';
  const glowClass = gc.enabled ? 'glow-' + (gc.type || 'active') : '';
  const shimmerClass = csS.shimmer ? 'shimmer-on' : '';
  const hasHoverFx = ((csH.scale && csH.scale !== 1) || (csH.brightness && csH.brightness !== 1) || (csH.saturate && csH.saturate !== 1) || csH.shadowBlur || csH.borderColor || csH.glowIntensify || csH.blur || csH.siblingsBlur || csH.hueRotate || (csH.opacity != null && csH.opacity !== 1)) ? 'has-hover-fx' : '';
  const hovGlowInt = csH.glowIntensify ? 'hov-glow-int' : '';
  const hovAnimClass = (csH.enableAnim && csH.animType) ? 'has-hover-anim' : '';
  const allClasses = ['beat-card', glowClass, animClass, shimmerClass, anim2Class, hasHoverFx, hovGlowInt, hovAnimClass].filter(Boolean).join(' ');

  // Inline styles
  const s = [];
  const accentColor = csS.accentColor || '#dc2626';
  s.push('--card-tint:linear-gradient(135deg,' + accentColor + ',transparent)');
  const ach = accentColor.replace('#','');
  const ar = parseInt(ach.substring(0,2),16)||220, ag = parseInt(ach.substring(2,4),16)||38, ab = parseInt(ach.substring(4,6),16)||38;
  s.push('--accent:'+accentColor+';--btn-lic-clr:'+accentColor+';--btn-lic-bdr:rgba('+ar+','+ag+','+ab+',0.5);--btn-lic-bg:rgba('+ar+','+ag+','+ab+',0.1)');
  if (!gc.enabled) s.push('--glow-clr:'+accentColor);

  // Shimmer
  if (csS.shimmer) {
    var shimSpeed = parseFloat(val('f-shimmer-speed')) || 3;
    var shimOp = parseFloat(val('f-shimmer-op')) || 0.04;
    s.push('--shim-speed:'+shimSpeed+'s;--shim-op:'+shimOp);
  }

  // Glow
  if (gc.enabled && gc.color) {
    const hex = gc.color.replace('#','');
    s.push('--glow-clr:'+gc.color+';--glow-r:'+(parseInt(hex.substring(0,2),16)||220)+';--glow-g:'+(parseInt(hex.substring(2,4),16)||38)+';--glow-b:'+(parseInt(hex.substring(4,6),16)||38)+';--glow-speed:'+(gc.speed||3)+'s');
    if (gc.intensity != null && gc.intensity !== 1) s.push('--glow-int:'+gc.intensity);
    if (gc.blur != null && gc.blur !== 20) s.push('--glow-blur:'+gc.blur+'px');
    if (gc.spread) s.push('--glow-spread:'+gc.spread+'px');
    if (gc.opacity != null && gc.opacity !== 1) s.push('--glow-op:'+gc.opacity);
  }

  // Animation vars
  if (ca.type) {
    const animInt = (ca.intensity != null ? ca.intensity : 100) / 100;
    const effectiveDur = animInt !== 1 ? (ca.dur || 2) / animInt : (ca.dur || 2);
    s.push('--ad:'+effectiveDur+'s;--adl:'+(ca.del||0)+'s');
    if (ca.easing && ca.easing !== 'ease-in-out') s.push('--aease:'+ca.easing);
    if (ca.direction && ca.direction !== 'normal') s.push('--adir:'+ca.direction);
    if (animInt !== 1) s.push('--anim-int:'+animInt);
    if (ca.type === 'holograma') {
      s.push('--anim-hue-start:'+(ca.hueStart||0)+'deg;--anim-hue-end:'+(ca.hueEnd||360)+'deg');
      s.push('--anim-holo-bright-min:'+(ca.holoBrightMin||0.9)+';--anim-holo-bright-max:'+(ca.holoBrightMax||1.4));
      s.push('--anim-holo-sat-min:'+(ca.holoSatMin||0.8)+';--anim-holo-sat-max:'+(ca.holoSatMax||2));
      if (ca.holoGlow) s.push('--anim-holo-glow:'+ca.holoGlow+'px');
      if (ca.holoBlur) s.push('--anim-holo-blur:'+ca.holoBlur+'px');
      var holoDir = ca.holoDir || 'hue';
      var holoColors = ca.holoColors || ['#ff0080','#00ff80','#0080ff'];
      if (holoDir === 'gradient' && holoColors.length >= 2) {
        s.push('--holo-c0:'+holoColors[0]);
        s.push('--holo-c1:'+holoColors[1]);
        if (holoColors[2]) s.push('--holo-c2:'+holoColors[2]); else s.push('--holo-c2:'+holoColors[0]);
        if (holoColors[3]) s.push('--holo-c3:'+holoColors[3]); else s.push('--holo-c3:'+holoColors[1]);
      }
      if (holoDir === 'pulse' && holoColors.length >= 2) {
        s.push('--holo-c0:'+holoColors[0]);
        s.push('--holo-c1:'+holoColors[1]);
        if (holoColors[2]) s.push('--holo-c2:'+holoColors[2]); else s.push('--holo-c2:'+holoColors[0]);
      }
    }
    if (ca.type === 'brillo') s.push('--anim-brillo-min:'+(ca.brilloMin||0.8)+';--anim-brillo-max:'+(ca.brilloMax||1.5));
    if (ca.type === 'glitch') s.push('--anim-glitch-x:'+(ca.glitchX||4)+'px;--anim-glitch-y:'+(ca.glitchY||4)+'px;--anim-glitch-rot:'+(ca.glitchRot||0)+'deg');
    if (ca.type === 'pulsar' || ca.type === 'respirar' || ca.type === 'latido') s.push('--anim-scale-min:'+(ca.scaleMin||1)+';--anim-scale-max:'+(ca.scaleMax||1.06)+';--anim-scale-opacity:'+(ca.scaleOpacity||0.8));
    if (ca.type === 'flotar' || ca.type === 'rebotar' || ca.type === 'drift' || (ca.type && ca.type.startsWith('deslizar-'))) {
      s.push('--anim-translate-x:'+(ca.translateX||0)+'px;--anim-translate-y:'+(ca.translateY||12)+'px;--anim-translate-rot:'+(ca.translateRot||0)+'deg');
    }
    if (ca.type === 'neon-flicker') s.push('--anim-neon-min:'+(ca.neonMin||0.4)+';--anim-neon-max:'+(ca.neonMax||1)+';--anim-neon-bright:'+(ca.neonBright||1));
    if (ca.type === 'parpadeo') s.push('--anim-parpadeo-min:'+(ca.parpadeoMin||0.3)+';--anim-parpadeo-max:'+(ca.parpadeoMax||1));
    if (ca.type === 'rotar' || ca.type === 'wobble' || ca.type === 'balanceo' || ca.type === 'swing') s.push('--anim-rotate-angle:'+(ca.rotateAngle||5)+'deg;--anim-rotate-scale:'+(ca.rotateScale||1));
    if (ca.type === 'cambio-color') s.push('--anim-cs-hue-start:'+(ca.csHueStart||0)+'deg;--anim-cs-hue-end:'+(ca.csHueEnd||360)+'deg;--anim-cs-sat:'+(ca.csSat||1));
    if (ca.type === 'sacudida' || ca.type === 'temblor' || ca.type === 'shake-x') s.push('--anim-shake-x:'+(ca.shakeX||4)+'px;--anim-shake-y:'+(ca.shakeY||4)+'px');
    if (ca.iterations && ca.iterations !== 'infinite') s.push('--aiter:'+ca.iterations);
  }

  // Border
  if (csBd.enabled) s.push('border:'+(csBd.width||1)+'px '+(csBd.style||'solid')+' '+(csBd.color||'#dc2626'));

  // Filters
  const filters = [];
  if (f.brightness != null && f.brightness !== 1) filters.push('brightness('+f.brightness+')');
  if (f.contrast != null && f.contrast !== 1) filters.push('contrast('+f.contrast+')');
  if (f.saturate != null && f.saturate !== 1) filters.push('saturate('+f.saturate+')');
  if (f.grayscale) filters.push('grayscale('+f.grayscale+')');
  if (f.sepia) filters.push('sepia('+f.sepia+')');
  if (f.hueRotate) filters.push('hue-rotate('+f.hueRotate+'deg)');
  if (f.blur) filters.push('blur('+f.blur+'px)');
  if (f.invert) filters.push('invert('+f.invert+')');
  if (filters.length) s.push('filter:'+filters.join(' '));

  // Opacity
  if (csS.opacity != null && csS.opacity < 1) s.push('opacity:'+csS.opacity);

  // Shadow
  if (csSh.enabled) {
    const hex = (csSh.color||'#000000').replace('#','');
    s.push('box-shadow:'+(csSh.inset?'inset ':'')+(csSh.x||0)+'px '+(csSh.y!=null?csSh.y:4)+'px '+(csSh.blur!=null?csSh.blur:12)+'px '+(csSh.spread||0)+'px rgba('+(parseInt(hex.substring(0,2),16)||0)+','+(parseInt(hex.substring(2,4),16)||0)+','+(parseInt(hex.substring(4,6),16)||0)+','+(csSh.opacity!=null?csSh.opacity:0.35)+')');
  }

  // Transform
  const tf = [];
  if (csTf.rotate) tf.push('rotate('+csTf.rotate+'deg)');
  if (csTf.scale && csTf.scale !== 1) tf.push('scale('+csTf.scale+')');
  if (csTf.skewX) tf.push('skewX('+csTf.skewX+'deg)');
  if (csTf.skewY) tf.push('skewY('+csTf.skewY+'deg)');
  if (csTf.x) tf.push('translateX('+csTf.x+'px)');
  if (csTf.y) tf.push('translateY('+csTf.y+'px)');
  if (tf.length) s.push('transform:'+tf.join(' '));

  // Hover vars
  if (csH.scale && csH.scale !== 1) s.push('--hov-scale:'+csH.scale);
  if (csH.brightness && csH.brightness !== 1) s.push('--hov-bright:'+csH.brightness);
  if (csH.saturate && csH.saturate !== 1) s.push('--hov-sat:'+csH.saturate);
  if (csH.shadowBlur) s.push('--hov-shadow:'+csH.shadowBlur+'px');
  if (csH.transition != null) s.push('--hov-trans:'+csH.transition+'s');
  if (csH.borderColor) s.push('--hov-bdr:'+csH.borderColor);
  if (csH.blur) s.push('--hov-blur:'+csH.blur+'px');
  if (csH.siblingsBlur) s.push('--hov-sib-blur:'+csH.siblingsBlur+'px');
  if (csH.hueRotate) s.push('--hov-hue:'+csH.hueRotate+'deg');
  if (csH.opacity != null && csH.opacity !== 1) s.push('--hov-opacity:'+csH.opacity);
  if (csH.enableAnim && csH.animType) { s.push('--hov-anim-name:anim-'+csH.animType); s.push('--hov-anim-dur:'+(csH.animDur||1)+'s'); }
  if (csS.borderRadius) s.push('--card-radius:'+csS.borderRadius+'px');

  // Waveform bars
  const bars = Array.from({length: 20}, function(_, i) {
    const h = 4 + Math.random() * 16;
    return '<div class="wbar" style="height:'+h+'px;--wd:0.5s;animation-delay:'+((i*0.05).toFixed(2))+'s"></div>';
  }).join('');

  const tagsHtml = tags.map(function(t) { return '<span class="tag">'+t+'</span>'; }).join('');

  return '<div class="'+allClasses+'" style="'+s.join(';')+';cursor:default">'
    +'<div class="shimmer-overlay"></div>'
    +'<div class="beat-card-inner"'+(csBd.enabled ? '' : ' style="border:none"')+'>'
    +'<div class="beat-img">'+(imgUrl ? '<img src="'+imgUrl+'" alt="" loading="lazy">' : '<div class="beat-img-ph">♪</div>')
    +'<div class="beat-wave-row">'+bars+'</div>'
    +'<div class="play-hint"><div class="play-circle"><svg width="16" height="16" viewBox="0 0 16 16" fill="white"><path d="M5 3l10 5-10 5V3z"/></svg></div></div>'
    +'</div>'
    +'<div class="beat-body">'
    +'<div class="beat-name">'+name+(isExcl ? '<span class="tag" style="border-color:rgba(185,28,28,.5);color:var(--accent);margin-left:6px">EXCL</span>' : '')+'</div>'
    +'<div class="beat-meta-row"><span>'+bpm+' BPM</span><span>'+key+'</span><span>'+genre+'</span></div>'
    +(tagsHtml ? '<div class="beat-tags-row">'+tagsHtml+'</div>' : '')
    +'<div class="beat-foot"><div><div class="price-from">desde</div><div class="price-main">$350 <span style="font-size:11px;color:var(--muted);font-weight:400">MXN</span><span class="price-usd">· $18 USD</span></div></div><div class="btn-lic">Ver licencias</div></div>'
    +'</div></div></div>';
};

// ═══ Render full beat card in floating preview ═══
window._renderFullPvCard = function() {
  var container = document.getElementById('float-pv-full-card');
  if (!container) return;
  var floatPv = document.getElementById('float-pv');
  if (!floatPv || floatPv.dataset.mode !== 'full') return;
  container.innerHTML = window._buildCardHTML(_buildCardStyleFromInputs(), {
    name: val('f-name') || 'Nombre del Beat',
    bpm: val('f-bpm') || '140',
    key: val('f-key') || 'Am',
    genre: g('f-genre') ? g('f-genre').value : 'Trap',
    imgUrl: val('f-img'),
    tags: (val('f-tags') || '').split(',').map(function(t) { return t.trim(); }).filter(Boolean),
    isExcl: checked('f-excl')
  });
};

// ═══ Mini preview removed — real preview lives in the iframe panel (preview-frame) ═══
window.renderFullPvInCard = function() {};

// ═══ Detach/attach preview ═══
var pvDetached = false;
window.toggleDetachPv = function() {
  pvDetached = !pvDetached;
  const btn = document.getElementById('pv-detach-btn');
  const card = document.getElementById('pv-card-embed');
  if (pvDetached) {
    if (btn) btn.textContent = '📎 Desfijado';
    if (card) {
      card.style.position = 'fixed';
      card.style.zIndex = '9000';
      card.style.right = '20px';
      card.style.top = '60px';
      card.style.width = '420px';
      card.style.boxShadow = '0 20px 60px rgba(0,0,0,0.5)';
      card.style.left = 'auto';
      card.style.bottom = 'auto';
      card.style.marginTop = '0';
      card.style.resize = 'both';
      card.style.overflow = 'auto';
      card.style.minWidth = '280px';
      card.style.minHeight = '200px';
      makePvDraggable(card);
      addPvResizeHandles(card);
    }
  } else {
    if (btn) btn.textContent = '📌 Fijado';
    if (card) {
      card.style.position = '';
      card.style.zIndex = '';
      card.style.right = '';
      card.style.top = '';
      card.style.left = '';
      card.style.bottom = '';
      card.style.width = '';
      card.style.boxShadow = '';
      card.style.marginTop = '8px';
      card.style.cursor = '';
      card.style.resize = '';
      card.style.overflow = '';
      card.style.minWidth = '';
      card.style.minHeight = '';
      removePvResizeHandles(card);
    }
  }
};

// ═══ Draggable preview ═══
export function makePvDraggable(el) {
  const title = el.querySelector('.card-title');
  if (!title || title._draggable) return;
  title._draggable = true;
  title.style.cursor = 'grab';
  let dragging = false, sx, sy, oL, oT;
  title.addEventListener('pointerdown', function(e) {
    if (e.target.tagName === 'BUTTON' || e.target.closest('.pv-rz-handle')) return;
    dragging = true; sx = e.clientX; sy = e.clientY;
    oL = el.offsetLeft; oT = el.offsetTop;
    title.style.cursor = 'grabbing';
    el.style.left = oL + 'px'; el.style.top = oT + 'px'; el.style.right = 'auto';
    e.preventDefault();
  });
  window.addEventListener('pointermove', function(e) {
    if (!dragging) return;
    el.style.left = (oL + e.clientX - sx) + 'px';
    el.style.top = (oT + e.clientY - sy) + 'px';
  });
  var up = function() { if (dragging) { dragging = false; title.style.cursor = 'grab'; } };
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
}

// ═══ Resize handles for detached preview ═══
var _pvResizeHandles = [];
function addPvResizeHandles(card) {
  removePvResizeHandles(card);
  var handles = [
    { pos: 'right', css: 'top:0;right:-4px;width:8px;height:100%;cursor:col-resize' },
    { pos: 'bottom', css: 'bottom:-4px;left:0;width:100%;height:8px;cursor:row-resize' },
    { pos: 'corner-br', css: 'bottom:-4px;right:-4px;width:14px;height:14px;cursor:nwse-resize;border-radius:0 0 4px 0' }
  ];
  handles.forEach(function(h) {
    var el = document.createElement('div');
    el.className = 'pv-rz-handle';
    el.dataset.pos = h.pos;
    el.style.cssText = 'position:absolute;z-index:9001;background:rgba(220,38,38,0.3);opacity:0;transition:opacity .2s;' + h.css;
    card.appendChild(el);
    el.addEventListener('pointerdown', function(e) { startPvResize(card, el, h.pos, e); });
    _pvResizeHandles.push(el);
  });
  card.addEventListener('mouseenter', _pvShowHandles);
  card.addEventListener('mouseleave', _pvHideHandles);
}

function removePvResizeHandles(card) {
  _pvResizeHandles.forEach(function(h) { if (h.parentNode) h.parentNode.removeChild(h); });
  _pvResizeHandles = [];
  card.removeEventListener('mouseenter', _pvShowHandles);
  card.removeEventListener('mouseleave', _pvHideHandles);
}

function _pvShowHandles() { _pvResizeHandles.forEach(function(h) { h.style.opacity = '1'; }); }
function _pvHideHandles() { _pvResizeHandles.forEach(function(h) { h.style.opacity = '0'; }); }

function startPvResize(card, handle, pos, e) {
  e.preventDefault(); e.stopPropagation();
  var startX = e.clientX, startY = e.clientY;
  var startW = card.offsetWidth, startH = card.offsetHeight;
  handle.setPointerCapture(e.pointerId);
  document.body.style.userSelect = 'none';
  var onMove = function(e2) {
    if (pos === 'right' || pos === 'corner-br') card.style.width = Math.max(280, startW + (e2.clientX - startX)) + 'px';
    if (pos === 'bottom' || pos === 'corner-br') card.style.height = Math.max(200, startH + (e2.clientY - startY)) + 'px';
  };
  var onUp = function() {
    handle.releasePointerCapture(e.pointerId);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    document.body.style.userSelect = '';
  };
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
}

// ═══ Image history for this editing session ═══
var _imgHistory = [];

window._showImgPreview = function(url) {
  var wrap = document.getElementById('pv-img-preview');
  var img = document.getElementById('pv-img-preview-img');
  if (!wrap || !img) return;
  if (url) {
    img.src = url;
    img.onerror = function() { wrap.style.display = 'none'; };
    wrap.style.display = 'block';
  } else {
    wrap.style.display = 'none';
  }
};

window._addImgToHistory = function(url) {
  if (!url || url.length < 10) return;
  // Avoid duplicates
  if (_imgHistory.indexOf(url) > -1) return;
  _imgHistory.unshift(url);
  if (_imgHistory.length > 8) _imgHistory.pop();
  _renderImgHistory();
};

window._renderImgHistory = function() {
  var el = document.getElementById('pv-img-history');
  if (!el) return;
  if (!_imgHistory.length) { el.innerHTML = ''; return; }
  el.innerHTML = '<div style="font-size:8px;color:var(--mu);margin-bottom:4px;width:100%;text-align:center;letter-spacing:.06em;text-transform:uppercase">Historial</div>'
    + '<div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap">'
    + _imgHistory.map(function(url, i) {
      return '<div style="position:relative;display:inline-block">'
        + '<img src="' + url + '" onclick="window._selectHistoryImg(' + i + ')" title="Usar esta" style="width:40px;height:40px;border-radius:4px;object-fit:cover;border:1px solid var(--b);cursor:pointer;transition:border-color .15s" onmouseenter="this.style.borderColor=\'var(--acc)\'" onmouseleave="this.style.borderColor=\'var(--b)\'">'
        + '<div onclick="event.stopPropagation();window._removeHistoryImg(' + i + ')" title="Quitar" style="position:absolute;top:-4px;right:-4px;width:14px;height:14px;border-radius:50%;background:var(--acc);color:#fff;font-size:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transition:opacity .15s;line-height:1" onmouseenter="this.parentNode.querySelector(\'img\').style.borderColor=\'var(--acc)\';this.style.opacity=1" onmouseleave="this.style.opacity=0">✕</div>'
        + '</div>';
    }).join('')
    + '</div>';
  // Show the X on hover via CSS-like behavior (already handled inline above)
};

window._removeHistoryImg = function(idx) {
  _imgHistory.splice(idx, 1);
  _renderImgHistory();
};

window._selectHistoryImg = function(idx) {
  var url = _imgHistory[idx];
  if (!url) return;
  var imgField = document.getElementById('f-img');
  if (imgField) {
    imgField.value = url;
    if (typeof window.prevImg === 'function') window.prevImg();
    if (typeof window.updateCardPreview === 'function') window.updateCardPreview();
    if (typeof window._sendLiveUpdate === 'function') window._sendLiveUpdate();
  }
  window._showImgPreview(url);
};

// ═══ Preview image upload handler ═══
window._initPvImgUpload = function() {
  var input = document.getElementById('pv-img-upload');
  if (!input || input._bound) return;
  input._bound = true;
  input.addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (!file) return;
    // Always show local preview immediately
    var reader = new FileReader();
    reader.onload = function(ev) {
      var localUrl = ev.target.result;
      window._showImgPreview(localUrl);
      window._addImgToHistory(localUrl);
      // Set the field and sync
      var imgField = document.getElementById('f-img');
      if (imgField) {
        imgField.value = localUrl;
        if (typeof window.prevImg === 'function') window.prevImg();
        if (typeof window.updateCardPreview === 'function') window.updateCardPreview();
        if (typeof window._sendLiveUpdate === 'function') window._sendLiveUpdate();
      }
    };
    reader.readAsDataURL(file);

    // If R2 is configured, also upload to R2 (will update URL when done)
    var r2Enabled = typeof window._r2IsEnabled === 'function' && window._r2IsEnabled();
    if (r2Enabled && typeof window.uploadBeatImg === 'function') {
      window.uploadBeatImg(input);
    }
    input.value = '';
  });
};

// ═══ Window assignments ═══
Object.assign(window, {
  makePvDraggable
});
