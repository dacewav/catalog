// ═══ DACEWAV.STORE — Beat Cards & Modal ═══
import { state } from './state.js';
import { hexRgba, applyAnim, esc } from './utils.js';
import { ANIMS } from './config.js';
import { AP } from './player.js';
import { toggleWish } from './wishlist.js';
import { applyWaveformToCard } from './waveform.js';
import { setupCardTilt, observeStagger, animateCounter } from './effects.js';
import { mergeCardStyles } from './card-style-engine.js';
export { openPlayerModal, openModal, playModalBeat, closeModal, selLic } from './modal.js';
export { applyWaveformToCard };

export function beatCard(b, globalIdx) {
  const isCurrent = AP.currentBeatIdx === globalIdx;
  const isPlay = isCurrent && AP.playing;
  const T = state.T;

  // CSS waveform bars: only render as fallback when no audio preview is available
  // If previewUrl exists, applyWaveformToCard() will generate the real SVG waveform
  const hasPreview = !!b.previewUrl;
  const bars = hasPreview ? '' : Array.from({ length: 20 }, (_, i) => {
    const _wh = T.wbarHeight || 12;
    const h = Math.max(4, _wh * 0.4 + Math.sin(i * 0.9 + parseInt(b.id || 0) * 2) * _wh + Math.cos(i * 1.4) * (_wh * 0.6));
    const dur = (0.3 + Math.random() * 0.5).toFixed(2);
    return `<div class="wbar${isPlay ? ' anim' : ''}" style="height:${h}px;--wd:${dur}s;animation-delay:${(i * 0.05).toFixed(2)}s"></div>`;
  }).join('');
  
  // Only render beat-wave-row container if we have fallback bars (no preview)
  const waveRowHtml = bars ? `<div class="beat-wave-row">${bars}</div>` : '';

  const lics = b.licenses || [];
  const minL = lics[0];
  const imgH = b.imageUrl
    ? `<img src="${esc(b.imageUrl)}" alt="${esc(b.name)}" loading="lazy">`
    : '<div class="beat-img-ph">♦</div>';
  const isWished = state.wishlist.indexOf(b.id) > -1;

  // ── cardStyle: merge global + beat-specific using shared engine ──
  let cs = mergeCardStyles(
    state.siteSettings?.globalCardStyle,
    b.cardStyle,
    b._customStyle
  );
  // Fallback: if no cardStyle at all, empty object
  if (!cs) cs = {};
  const csF = cs.filter || {};
  const csG = cs.glow || {};
  const csA = cs.anim || {};
  const csS = cs.style || {};
  const csBd = cs.border || {};
  const csSh = cs.shadow || {};
  const csH = cs.hover || {};
  const csTf = cs.transform || {};

  // Glow classes & vars
  let glowClasses = '';
  let glowStyle = '';
  const glowEnabled = csG.enabled;
  if (glowEnabled) {
    const glowType = csG.type || 'active';
    // Validate glowType matches known CSS classes
    const validGlowTypes = ['active', 'rgb', 'pulse', 'breathe', 'neon'];
    const safeType = validGlowTypes.includes(glowType) ? glowType : 'active';
    glowClasses = 'glow-' + safeType;
    const gc = csG;
    if (gc.color) {
      const hex = gc.color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16) || 220;
      const gv = parseInt(hex.substring(2, 4), 16) || 38;
      const bl = parseInt(hex.substring(4, 6), 16) || 38;
      glowStyle = `--glow-clr:${gc.color};--glow-r:${r};--glow-g:${gv};--glow-b:${bl};--glow-speed:${gc.speed || 3}s`;
      if (gc.intensity != null && gc.intensity !== 1) glowStyle += `;--glow-int:${gc.intensity}`;
      if (gc.blur != null) glowStyle += `;--glow-blur:${gc.blur}px`;
      if (gc.spread) glowStyle += `;--glow-spread:${gc.spread}px`;
      if (gc.opacity != null && gc.opacity !== 1) glowStyle += `;--glow-op:${gc.opacity}`;
    }
    if (gc.hoverOnly) glowClasses += ' glow-hover-only';
  }

  // Card animation
  let animClass = '';
  let animStyle = '';
  if (csA && csA.type) {
    animClass = 'anim-' + csA.type;
    // Holograma sub-variant (gradient/pulse use custom colors, hue uses rainbow)
    if (csA.type === 'holograma' && csA.holoDir) {
      if (csA.holoDir === 'gradient') animClass = 'anim-holograma-gradient';
      else if (csA.holoDir === 'pulse') animClass = 'anim-holograma-pulse';
    }
    // Intensity controls animation speed: 100% = normal, 200% = 2x faster, 50% = 2x slower
    const animInt = (csA.intensity != null ? csA.intensity : 100) / 100;
    const effectiveDur = animInt !== 1 ? (csA.dur || 2) / animInt : (csA.dur || 2);
    animStyle = `--ad:${effectiveDur}s;--adl:${csA.del || 0}s`;
    if (animInt !== 1) animStyle += `;--anim-int:${animInt}`;
    if (csA.easing && csA.easing !== 'ease-in-out') animStyle += `;--aease:${csA.easing}`;
    if (csA.direction && csA.direction !== 'normal') animStyle += `;--adir:${csA.direction}`;
    // Per-type sub-settings CSS vars
    if (csA.type === 'holograma') {
      if (csA.hueStart != null) animStyle += `;--anim-hue-start:${csA.hueStart}deg`;
      if (csA.hueEnd != null) animStyle += `;--anim-hue-end:${csA.hueEnd}deg`;
      if (csA.holoBrightMin != null && csA.holoBrightMin !== 0.9) animStyle += `;--anim-holo-bright-min:${csA.holoBrightMin}`;
      if (csA.holoBrightMax != null && csA.holoBrightMax !== 1.4) animStyle += `;--anim-holo-bright-max:${csA.holoBrightMax}`;
      if (csA.holoSatMin != null && csA.holoSatMin !== 0.8) animStyle += `;--anim-holo-sat-min:${csA.holoSatMin}`;
      if (csA.holoSatMax != null && csA.holoSatMax !== 2) animStyle += `;--anim-holo-sat-max:${csA.holoSatMax}`;
      if (csA.holoGlow) animStyle += `;--anim-holo-glow:${csA.holoGlow}px`;
      if (csA.holoBlur) animStyle += `;--anim-holo-blur:${csA.holoBlur}px`;
      // Custom holograma colors
      let hc = csA.holoColors;
      // Firebase may return object instead of array
      if (hc && typeof hc === 'object' && !Array.isArray(hc)) hc = Object.values(hc);
      if (hc && hc.length >= 2) {
        animStyle += `;--holo-c0:${hc[0]};--holo-c1:${hc[1]}`;
        if (hc[2]) animStyle += `;--holo-c2:${hc[2]}`; else animStyle += `;--holo-c2:${hc[0]}`;
        if (hc[3]) animStyle += `;--holo-c3:${hc[3]}`; else animStyle += `;--holo-c3:${hc[1]}`;
      }
    }
    if (csA.type === 'cambio-color') {
      if (csA.csHueStart != null) animStyle += `;--anim-cs-hue-start:${csA.csHueStart}deg`;
      if (csA.csHueEnd != null) animStyle += `;--anim-cs-hue-end:${csA.csHueEnd}deg`;
      if (csA.csSat != null && csA.csSat !== 1) animStyle += `;--anim-cs-sat:${csA.csSat}`;
    }
    if (csA.type === 'brillo') {
      if (csA.brilloMin != null && csA.brilloMin !== 0.8) animStyle += `;--anim-brillo-min:${csA.brilloMin}`;
      if (csA.brilloMax != null && csA.brilloMax !== 1.5) animStyle += `;--anim-brillo-max:${csA.brilloMax}`;
    }
    if (csA.type === 'glitch') {
      if (csA.glitchX) animStyle += `;--anim-glitch-x:${csA.glitchX}px`;
      if (csA.glitchY) animStyle += `;--anim-glitch-y:${csA.glitchY}px`;
      if (csA.glitchRot) animStyle += `;--anim-glitch-rot:${csA.glitchRot}deg`;
    }
    if (csA.type === 'neon-flicker') {
      if (csA.neonMin != null && csA.neonMin !== 0.4) animStyle += `;--anim-neon-min:${csA.neonMin}`;
      if (csA.neonMax != null && csA.neonMax !== 1) animStyle += `;--anim-neon-max:${csA.neonMax}`;
      if (csA.neonBright != null && csA.neonBright !== 1) animStyle += `;--anim-neon-bright:${csA.neonBright}`;
    }
    if (csA.type === 'parpadeo') {
      if (csA.parpadeoMin != null && csA.parpadeoMin !== 0.3) animStyle += `;--anim-parpadeo-min:${csA.parpadeoMin}`;
      if (csA.parpadeoMax != null && csA.parpadeoMax !== 1) animStyle += `;--anim-parpadeo-max:${csA.parpadeoMax}`;
    }
    if (csA.type === 'rotar' || csA.type === 'wobble' || csA.type === 'balanceo' || csA.type === 'swing') {
      if (csA.rotateAngle != null && csA.rotateAngle !== 5) animStyle += `;--anim-rotate-angle:${csA.rotateAngle}deg`;
      if (csA.rotateScale != null && csA.rotateScale !== 1) animStyle += `;--anim-rotate-scale:${csA.rotateScale}`;
    }
    if (csA.type === 'pulsar' || csA.type === 'respirar' || csA.type === 'latido') {
      if (csA.scaleMin != null && csA.scaleMin !== 1) animStyle += `;--anim-scale-min:${csA.scaleMin}`;
      if (csA.scaleMax != null && csA.scaleMax !== 1.06) animStyle += `;--anim-scale-max:${csA.scaleMax}`;
      if (csA.scaleOpacity != null && csA.scaleOpacity !== 0.8) animStyle += `;--anim-scale-opacity:${csA.scaleOpacity}`;
    }
    if (csA.type === 'flotar' || csA.type === 'rebotar' || csA.type === 'drift' || (csA.type && csA.type.startsWith('deslizar-'))) {
      if (csA.translateX) animStyle += `;--anim-translate-x:${csA.translateX}px`;
      if (csA.translateY != null && csA.translateY !== 12) animStyle += `;--anim-translate-y:${csA.translateY}px`;
      if (csA.translateRot) animStyle += `;--anim-translate-rot:${csA.translateRot}deg`;
    }
    if (csA.type === 'sacudida' || csA.type === 'temblor' || csA.type === 'shake-x') {
      if (csA.shakeX != null && csA.shakeX !== 4) animStyle += `;--anim-shake-x:${csA.shakeX}px`;
      if (csA.shakeY != null && csA.shakeY !== 4) animStyle += `;--anim-shake-y:${csA.shakeY}px`;
    }
    if (csA.iterations && csA.iterations !== 'infinite') animStyle += `;--aiter:${csA.iterations}`;
  }

  // Card border
  let borderStyle = '';
  const borderEnabled = csBd.enabled;
  if (borderEnabled) {
    borderStyle = `border:${csBd.width || 1}px ${csBd.style || 'solid'} ${csBd.color || '#dc2626'}`;
  }

  // Accent color
  const accentColor = csS.accentColor;
  const shimmer = csS.shimmer;

  // Secondary animation (any type — now on ::before to avoid conflicts)
  const anim2Type = (csA && csA.type2) ? csA.type2 : '';

  // Combine all classes
  const allClasses = [
    'beat-card',
    isPlay ? 'is-playing' : '',
    b.featured ? 'featured' : '',
    glowClasses,
    animClass,
    shimmer ? 'shimmer-on' : '',
    // Secondary animation (only transform/opacity-based — filter-based excluded)
    anim2Type ? 'anim2-' + anim2Type : '',
    // Hover classes
    ((csH.scale && csH.scale !== 1) || (csH.brightness && csH.brightness !== 1) || (csH.saturate && csH.saturate !== 1) || csH.shadowBlur || csH.borderColor || csH.glowIntensify || csH.blur || csH.siblingsBlur || csH.hueRotate || (csH.opacity != null && csH.opacity !== 1)) ? 'has-hover-fx' : '',
    csH.glowIntensify ? 'hov-glow-int' : '',
    (csH.enableAnim && csH.animType) ? 'has-hover-anim' : '',
    csSh.enabled ? 'has-custom-shadow' : '',
    csF.blurType && csF.blur ? 'blur-fx-' + csF.blurType : ''
  ].filter(Boolean).join(' ');

  // Build inline styles
  const styleParts = [
    `--card-tint:${accentColor ? `linear-gradient(135deg,${accentColor},transparent)` : 'linear-gradient(135deg,rgba(185,28,28,0.3),transparent)'}`
  ];
  // Propagate accentColor to button, glow, and border CSS vars so the card looks unified
  if (accentColor) {
    const hex = accentColor.replace('#','');
    const r = parseInt(hex.substring(0,2),16)||220;
    const g = parseInt(hex.substring(2,4),16)||38;
    const b = parseInt(hex.substring(4,6),16)||38;
    styleParts.push('--accent:'+accentColor);
    styleParts.push('--btn-lic-clr:'+accentColor);
    styleParts.push('--btn-lic-bdr:rgba('+r+','+g+','+b+',0.5)');
    styleParts.push('--btn-lic-bg:rgba('+r+','+g+','+b+',0.1)');
    // Only override glow color if no explicit glow config
    if (!glowEnabled) styleParts.push('--glow-clr:'+accentColor);
  }
  if (glowStyle) styleParts.push(glowStyle);
  if (animStyle) styleParts.push(animStyle);
  if (borderStyle) styleParts.push(borderStyle);

  // Shimmer variables (speed + opacity)
  if (shimmer) {
    const shimSpeed = parseFloat(csS.shimmerSpeed) || 3;
    const shimOp = parseFloat(csS.shimmerOp) || 0.04;
    styleParts.push(`--shim-speed:${shimSpeed}s`);
    styleParts.push(`--shim-op:${shimOp}`);
  }

  // Card radius (per-beat override)
  if (csS.borderRadius) styleParts.push(`--card-radius:${csS.borderRadius}px`);

  // Build inner card styles (shadow goes here, not on .beat-card, because .beat-card-inner owns the default box-shadow)
  const innerStyleParts = [];
  if (csSh.enabled) {
    const rgba = `rgba(${parseInt((csSh.color||'#000000').replace('#','').substring(0,2),16)||0},${parseInt((csSh.color||'#000000').replace('#','').substring(2,4),16)||0},${parseInt((csSh.color||'#000000').replace('#','').substring(4,6),16)||0},${csSh.opacity != null ? csSh.opacity : 0.35})`;
    const prefix = csSh.inset ? 'inset ' : '';
    innerStyleParts.push(`box-shadow:${prefix}${csSh.x||0}px ${csSh.y!=null?csSh.y:4}px ${csSh.blur!=null?csSh.blur:12}px ${csSh.spread||0}px ${rgba}`);
  }

  // CSS Filters
  const filters = [];
  if (csF.brightness != null && csF.brightness !== 1) filters.push(`brightness(${csF.brightness})`);
  if (csF.contrast != null && csF.contrast !== 1) filters.push(`contrast(${csF.contrast})`);
  if (csF.saturate != null && csF.saturate !== 1) filters.push(`saturate(${csF.saturate})`);
  if (csF.grayscale) filters.push(`grayscale(${csF.grayscale})`);
  if (csF.sepia) filters.push(`sepia(${csF.sepia})`);
  if (csF.hueRotate) filters.push(`hue-rotate(${csF.hueRotate}deg)`);
  // Blur is handled as CSS class, not filter — it affects surrounding area, not card content
  if (csF.invert) filters.push(`invert(${csF.invert})`);
  if (csF.opacity != null && csF.opacity < 1) filters.push(`opacity(${csF.opacity})`);
  if (csF.dropShadowOpacity) {
    const dsClr = csF.dropShadowColor || '#000000';
    const hex = dsClr.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const gv = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    const a = csF.dropShadowOpacity;
    filters.push(`drop-shadow(${csF.dropShadowX || 0}px ${csF.dropShadowY || 0}px ${csF.dropShadowBlur || 0}px rgba(${r},${gv},${b},${a}))`);
  }
  if (filters.length) styleParts.push(`filter:${filters.join(' ')}`);

  // Blur FX type variables
  if (csF.blurType && csF.blur) {
    const blurInt = Math.min(csF.blur / 30, 1); // normalize 0-30 to 0-1
    styleParts.push(`--blur-int:${blurInt.toFixed(2)}`);
    if (csF.blurType === 'aura') {
      const acHex = (accentColor || '#dc2626').replace('#', '');
      styleParts.push(`--blur-aura-clr:#${acHex}`);
    }
  }

  // Opacity
  if (csS.opacity != null && csS.opacity < 1) styleParts.push(`opacity:${csS.opacity}`);

  // Box shadow — moved to innerStyleParts (applied on .beat-card-inner, not .beat-card)

  // Transform
  const tfParts = [];
  if (csTf.rotate) tfParts.push(`rotate(${csTf.rotate}deg)`);
  if (csTf.scale && csTf.scale !== 1) tfParts.push(`scale(${csTf.scale})`);
  if (csTf.skewX) tfParts.push(`skewX(${csTf.skewX}deg)`);
  if (csTf.skewY) tfParts.push(`skewY(${csTf.skewY}deg)`);
  if (csTf.x) tfParts.push(`translateX(${csTf.x}px)`);
  if (csTf.y) tfParts.push(`translateY(${csTf.y}px)`);
  if (tfParts.length) styleParts.push(`transform:${tfParts.join(' ')}`);

  // Hover CSS vars
  if (csH.scale && csH.scale !== 1) styleParts.push(`--hov-scale:${csH.scale}`);
  if (csH.brightness && csH.brightness !== 1) styleParts.push(`--hov-bright:${csH.brightness}`);
  if (csH.saturate && csH.saturate !== 1) styleParts.push(`--hov-sat:${csH.saturate}`);
  if (csH.shadowBlur) styleParts.push(`--hov-shadow:${csH.shadowBlur}px`);
  if (csH.transition != null) styleParts.push(`--hov-trans:${csH.transition}s`);
  if (csH.borderColor) styleParts.push(`--hov-bdr:${csH.borderColor}`);
  if (csH.blur) styleParts.push(`--hov-blur:${csH.blur}px`);
  if (csH.siblingsBlur) styleParts.push(`--hov-sib-blur:${csH.siblingsBlur}px`);
  if (csH.hueRotate) styleParts.push(`--hov-hue:${csH.hueRotate}deg`);
  if (csH.opacity != null && csH.opacity !== 1) styleParts.push(`--hov-opacity:${csH.opacity}`);
  if (csH.enableAnim && csH.animType) { styleParts.push(`--hov-anim-name:anim-${csH.animType}`); styleParts.push(`--hov-anim-dur:${csH.animDur || 1}s`); }

  // Border radius
  if (csS.borderRadius) styleParts.push(`--card-radius:${csS.borderRadius}px`);

  const allStyles = styleParts.join(';');

  return `<div class="${allClasses}" id="card-${b.id}" data-id="${b.id}"
    onclick="handleCardClick('${b.id}',${globalIdx})"
    style="${allStyles}">
    <div class="shimmer-overlay"></div>
    <button class="wish-btn${isWished ? ' active' : ''}" data-id="${b.id}" onclick="toggleWish('${b.id}',event)">${isWished ? '♥' : '♡'}</button>
    <div class="beat-card-inner"${innerStyleParts.length ? ' style="' + innerStyleParts.join(';') + '"' : ''}>
      <div class="beat-img">${imgH}
        ${waveRowHtml}
        <div class="play-hint"><div class="play-circle"><svg width="16" height="16" viewBox="0 0 16 16" fill="white"><path d="${isPlay ? 'M4 2h2v12H4zM10 2h2v12h-2z' : 'M5 3l10 5-10 5V3z'}"/></svg></div></div>
      </div>
      <div class="beat-body">
        <div class="beat-name">${esc(b.name)}${b.exclusive ? '<span class="tag" style="border-color:rgba(185,28,28,.5);color:var(--accent);margin-left:6px">EXCL</span>' : ''}</div>
        <div class="beat-meta-row">
          <span>${esc(b.bpm)} BPM</span><span>${esc(b.key)}</span><span>${esc(b.genre)}</span>
          ${b.plays ? `<span>▶ ${esc(b.plays)}</span>` : ''}
        </div>
        <div class="beat-tags-row">${(b.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>
        <div class="beat-foot">${b.available !== false
          ? `<div><div class="price-from">desde</div><div class="price-main">$${minL ? minL.priceMXN.toLocaleString() : '350'} <span style="font-size:11px;color:var(--muted);font-weight:400">MXN</span><span class="price-usd">· $${minL ? minL.priceUSD : '18'} USD</span></div></div><button class="btn-lic" onclick="event.stopPropagation();openModal('${b.id}')">Ver licencias</button>`
          : '<span class="unavail-lbl">No disponible</span>'}</div>
      </div>
    </div>
  </div>`;
}

export function handleCardClick(id, idx) {
  const b = state.allBeats.find((x) => x.id === id);
  if (!b || b.available === false) return;
  if (!b.audioUrl && !b.previewUrl) { openModal(id); return; }
  if (AP.currentBeatIdx === idx) { AP.toggle(); return; }
  AP.playIdx(idx);
}

// ─── Render All ───
export function renderAll() {
  const feat = state.allBeats.filter((b) => b.featured);
  const fs = document.getElementById('section-featured');
  if (feat.length && fs) {
    fs.style.display = 'block';
    document.getElementById('feat-grid').innerHTML = feat.map((b) => beatCard(b, state.allBeats.indexOf(b))).join('');
  } else if (fs) {
    fs.style.display = 'none';
  }

  if (typeof window.buildFilterOptions === 'function') window.buildFilterOptions();
  if (typeof window.buildTagCloud === 'function') window.buildTagCloud();
  if (typeof window.buildFilters === 'function') window.buildFilters();
  if (typeof window.applyFilters === 'function') window.applyFilters();

  const stBeats = document.getElementById('st-beats');
  if (stBeats) animateCounter(stBeats, state.allBeats.length);

  const stGenres = document.getElementById('st-genres');
  if (stGenres) animateCounter(stGenres, new Set(state.allBeats.map((b) => b.genre)).size);

  const sk = document.getElementById('skeleton-grid');
  if (sk) sk.style.display = 'none';

  setTimeout(() => { setupCardTilt(); observeStagger(); }, 50);
  setTimeout(() => {
    state.allBeats.forEach((b) => { if (b.previewUrl) applyWaveformToCard(b.id); });
  }, 500);

  // Sync player bar thumbnail
  if (AP.currentBeatIdx >= 0 && AP.currentBeatIdx < state.allBeats.length) {
    const cb = state.allBeats[AP.currentBeatIdx];
    if (cb?.imageUrl) {
      const th = document.getElementById('pi-thumb');
      if (th) {
        const bustUrl = cb.imageUrl.split('?')[0] + '?t=' + Date.now();
        th.innerHTML = `<img src="${bustUrl}" alt="" loading="lazy">`;
      }
    }
  }
}

export function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}
