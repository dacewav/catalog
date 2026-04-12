// ═══ DACEWAV Admin — Hero/Banner/Divider Preview ═══
// Extracted from core.js — live preview rendering for hero, banner, divider sections.

import { customEmojis } from './state.js';
import { g, val, checked, hexRgba, escapeHtml } from './helpers.js';
import { tczGetSegments, segmentsToHTML } from './text-colorizer.js';
export function updateHeroPv() {
  // Collect values with safe fallbacks
  const $ = (id) => document.getElementById(id);
  const v = (id, def) => { const el = $(id); return el ? el.value : def; };
  const c = (id) => { const el = $(id); return el ? el.checked : false; };

  const accent = v('tc-glow') || '#dc2626';
  const fd = v('t-font-d', 'Syne');

  // Title
  const titleRaw = v('h-title', 'Beats que\ndefinen géneros.');
  const lines = titleRaw.split('\n');
  const lastLine = lines[lines.length - 1] || '';
  const otherLines = lines.slice(0, -1);

  // Glow/stroke on last word
  const strokeOn = c('h-stroke-on');
  const strokeW = parseFloat(v('h-stroke-w', '1')) || 1;
  const wordBlur = parseInt(v('h-word-blur', '10')) || 10;
  const wordOp = parseFloat(v('h-word-op', '0.35'));
  const strokeClr = v('h-stroke-clr', accent);
  const glowClr = v('h-glow-clr', accent);

  // Title glow
  const glowOn = c('h-glow-on');
  const glowInt = parseFloat(v('h-glow-int', '1'));
  const glowBlur = parseInt(v('h-glow-blur', '20')) || 20;

  // Typography
  const titleSize = parseFloat(v('h-title-size', '2.8'));
  const ls = parseFloat(v('h-ls', '-0.04'));
  const lh = parseFloat(v('h-lh', '1'));

  // Gradient background
  const gradOn = c('h-grad-on');
  const gradClr = v('h-grad-clr', accent);
  const gradOp = parseFloat(v('h-grad-op', '0.14'));
  const gradW = parseInt(v('h-grad-w', '80')) || 80;
  const gradH = parseInt(v('h-grad-h', '60')) || 60;

  // Eyebrow
  const eyebrowOn = c('h-eyebrow-on');
  const eyebrowText = v('h-eyebrow', 'En vivo · Puebla, MX');
  const eyebrowClr = v('h-eyebrow-clr', accent);
  const eyebrowSize = parseInt(v('h-eyebrow-size', '10')) || 10;

  // Text color
  const textClr = v('h-text-clr', '#f0f0f2');

  // Subtitle
  const subText = v('h-sub', 'Puebla, MX · Trap · R&B · Drill');

  // ── Apply to preview ──
  const pv = $('hero-pv');
  if (!pv) return;

  // Gradient
  const pvg = $('hpv-grad');
  if (pvg) {
    pvg.style.background = gradOn
      ? 'radial-gradient(ellipse ' + gradW + '% ' + gradH + '% at 50% 0%, ' + hexRgba(gradClr, gradOp) + ', transparent)'
      : 'none';
  }

  // Eyebrow
  const pve = $('hpv-eyebrow');
  if (pve) {
    if (eyebrowOn && eyebrowText) {
      pve.style.display = 'inline-flex';
      pve.style.color = eyebrowClr;
      pve.style.borderColor = hexRgba(eyebrowClr, 0.3);
      pve.style.background = hexRgba(eyebrowClr, 0.08);
      pve.style.fontSize = eyebrowSize + 'px';
      const dot = pve.querySelector('.hero-pv-eyebrow-dot');
      if (dot) dot.style.background = eyebrowClr;
      const pvet = $('hpv-eyebrow-text');
      if (pvet) pvet.textContent = eyebrowText;
    } else {
      pve.style.display = 'none';
    }
  }

  // Title
  const pvt = $('hpv-title');
  if (pvt) {
    pvt.style.fontFamily = "'" + fd + "', sans-serif";
    pvt.style.fontSize = titleSize + 'rem';
    pvt.style.letterSpacing = ls + 'em';
    pvt.style.lineHeight = String(lh);
    pvt.style.textShadow = glowOn ? '0 0 ' + glowBlur + 'px ' + hexRgba(glowClr, glowInt) : 'none';

    // Build title HTML
    let html = '';
    const heroSegs = tczGetSegments('hero-tcz');
    const hasColoredSegs = heroSegs.length && heroSegs.some(s => s.c);

    if (hasColoredSegs) {
      // Use colorizer segments - each word rendered with its color
      // Still apply glow/stroke to the last visual line
      const segHTML = segmentsToHTML(heroSegs);
      // For glow/stroke, wrap the whole thing
      if (strokeOn || glowOn) {
        const classes = ['glow-word'];
        const styles = ['--hw-blur:' + wordBlur + 'px', '--hw-op:' + wordOp];
        if (strokeOn) {
          classes.push('stroke-mode');
          styles.push('-webkit-text-stroke:' + strokeW + 'px ' + strokeClr);
        }
        html = '<span class="' + classes.join(' ') + '" style="' + styles.join(';') + '">' + segHTML + '</span>';
      } else {
        html = segHTML;
      }
    } else {
      // Original logic: split by lines, last line gets glow/stroke
      if (otherLines.length) {
        html += '<span style="color:' + textClr + '">' + otherLines.map(l => escapeHtml(l)).join('<br>') + '</span><br>';
      }
      if (lastLine) {
        const escapedLine = escapeHtml(lastLine);
        const classes = ['glow-word'];
        const styles = ['--hw-blur:' + wordBlur + 'px', '--hw-op:' + wordOp];
        if (strokeOn) {
          classes.push('stroke-mode');
          styles.push('color:transparent', '-webkit-text-stroke:' + strokeW + 'px ' + strokeClr);
        } else {
          styles.push('color:' + textClr);
        }
        html += '<span class="' + classes.join(' ') + '" data-t="' + escapedLine + '" style="' + styles.join(';') + '">' + escapedLine + '</span>';
      }
    }
    pvt.innerHTML = html;
  }

  // Subtitle
  const pvs = $('hpv-sub');
  if (pvs) pvs.textContent = subText;
}

// Safe HTML escape for user input
// ═══ BANNER PREVIEW ═══
export function updateBannerPv() {
  let text = val('b-text') || 'Preview del banner...';
  (customEmojis || []).forEach(e => { if (e.name && e.url) text = text.split(':' + e.name + ':').join('<img src="' + e.url + '" style="height:' + (e.height || 24) + 'px;vertical-align:middle">') });
  const bp = g('banner-pv'); if (!bp) return;
  bp.style.background = val('b-bg') || '#7f1d1d';
  const anim = val('b-anim') || 'scroll';
  const speed = val('b-speed') || 20;
  const easing = val('b-easing') || 'linear';
  const dir = val('b-dir') || 'normal';
  const delay = parseFloat(val('b-delay')) || 0;
  const txtClr = val('b-txt-clr') || '#ffffff';
  const durMap = { 'scroll': speed + 's', 'fade-pulse': (speed / 5) + 's', 'bounce': (speed / 10) + 's', 'glow-pulse': (speed / 5) + 's', 'static': '' };
  const dur = durMap[anim] || speed + 's';
  const animCss = anim === 'static' ? '' : 'animation:bp-' + anim + ' ' + dur + ' ' + easing + ' ' + delay + 's infinite ' + dir;
  bp.innerHTML = '<span style="display:inline-block;white-space:nowrap;color:' + txtClr + ';' + animCss + '">' + text + '</span>';
}

// ═══ DIVIDER PREVIEW ═══
export function updateDividerPv() {
  const pvTitle = g('div-pv-title'); if (!pvTitle) return;
  const segments = tczGetSegments('div-tcz');
  if (segments.length) {
    pvTitle.innerHTML = segmentsToHTML(segments);
  }
  // Apply styles
  const titleSize = parseFloat(val('d-title-size')) || 3;
  const ls = parseFloat(val('d-ls')) || -0.04;
  const glowOn = checked('d-glow-on');
  const glowInt = parseFloat(val('d-glow-int')) || 1;
  const glowBlur = parseInt(val('d-glow-blur')) || 20;
  const accent = val('tc-glow') || '#dc2626';

  pvTitle.style.fontSize = titleSize + 'rem';
  pvTitle.style.letterSpacing = ls + 'em';
  pvTitle.style.textShadow = glowOn ? '0 0 ' + glowBlur + 'px ' + hexRgba(accent, glowInt * 0.5) : 'none';

  const pvSub = g('div-pv-sub');
  if (pvSub) {
    pvSub.textContent = val('s-div-sub') || '';
    pvSub.style.color = val('d-sub-clr') || 'var(--mu)';
    pvSub.style.fontSize = (parseInt(val('d-sub-size')) || 13) + 'px';
  }
}

Object.assign(window, { updateHeroPv, updateBannerPv, updateDividerPv });
