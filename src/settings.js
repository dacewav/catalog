// ═══ DACEWAV.STORE — Settings & Dynamic Content ═══
import { state } from './state.js';
import { applyAnim, hexRgba } from './utils.js';
import { ANIMS } from './config.js';

// Change detection for expensive operations
let _lastHeroKey = '';
let _lastDividerKey = '';

// ─── Hero Builder — Single source of truth ───
function _buildHero(s, T) {
  const ht = document.getElementById('hero-title');
  if (!ht) return;

  const accent = T.glowColor || T.accent || '#dc2626';
  const heroTextClr = T.heroTextClr || T.text || '#f0f0f2';
  const strokeClr = T.heroStrokeClr || accent;
  const glowClr = T.heroGlowClr || accent;
  const strokeOn = T.heroStrokeOn === true;
  const glowOn = T.heroGlowOn !== false;
  const strokeW = T.heroStrokeW || 1;
  const wordBlur = T.heroWordBlur || 10;
  const wordOp = T.heroWordOp != null ? T.heroWordOp : 0.35;
  const glowBlur = T.heroGlowBlur || T.glowBlur || 20;
  const glowInt = T.heroGlowInt || T.glowIntensity || 1;
  const fontSize = T.heroTitleSize;
  const ls = T.heroLetterSpacing;
  const lh = T.heroLineHeight;

  // Title text: Firebase setting > theme custom > default
  const raw = s.heroTitle || T.heroTitleCustom || 'Beats que\ndefinen géneros.';
  const lines = raw.split('\n');
  const lastIdx = lines.length - 1;

  // Check for colorizer segments (from admin visual editor)
  const heroSegs = T.heroTitleSegments;
  const hasColoredSegs = heroSegs && heroSegs.length && heroSegs.some(s => s.c);

  // Build HTML
  let html = '';
  if (hasColoredSegs) {
    // Use colorizer segments
    const segHTML = heroSegs.map(seg => {
      if (seg.c) return `<span style="color:${seg.c}">${seg.text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`;
      return seg.text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }).join('');
    // Wrap for glow/stroke effects
    if (strokeOn || glowOn) {
      const classes = ['glow-word'];
      if (strokeOn) classes.push('stroke-mode');
      const styles = [`--hw-blur:${wordBlur}px`, `--hw-op:${wordOp}`];
      if (strokeOn) styles.push(`-webkit-text-stroke:${strokeW}px ${strokeClr}`);
      html = `<span class="${classes.join(' ')}" style="${styles.join(';')}">${segHTML}</span>`;
    } else {
      html = segHTML;
    }
  } else {
    // Original line-by-line logic
    lines.forEach((line, i) => {
      const safe = line.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      if (i < lastIdx) {
        html += `<span style="color:${heroTextClr}">${safe}</span><br>`;
      } else {
        const classes = ['glow-word'];
        if (strokeOn) classes.push('stroke-mode');
        const styles = [`color:${strokeOn ? 'transparent' : heroTextClr}`];
        if (strokeOn) styles.push(`-webkit-text-stroke:${strokeW}px ${strokeClr}`);
        styles.push(`--hw-blur:${wordBlur}px`);
        styles.push(`--hw-op:${wordOp}`);
        html += `<span class="${classes.join(' ')}" data-t="${safe}" style="${styles.join(';')}">${safe}</span>`;
      }
    });
  }
  ht.innerHTML = html;

  // Title-level styles
  if (fontSize) ht.style.fontSize = fontSize + 'rem';
  if (ls != null) ht.style.letterSpacing = ls + 'em';
  if (lh) ht.style.lineHeight = String(lh);
  ht.style.textShadow = glowOn ? `0 0 ${glowBlur}px ${hexRgba(glowClr, glowInt)}` : 'none';

  // Subtitle
  const heroSub = document.getElementById('hero-sub');
  if (heroSub) heroSub.textContent = s.heroSubtitle || T.heroSubCustom || '';

  // Eyebrow
  const eyebrow = document.getElementById('hero-eyebrow');
  if (eyebrow) {
    if (T.heroEyebrowOn === false) {
      eyebrow.style.display = 'none';
    } else {
      eyebrow.style.display = '';
      const eyText = T.heroEyebrow || 'En vivo · Puebla, MX';
      eyebrow.textContent = '';
      eyebrow.appendChild(document.createTextNode(eyText));
    }
  }
}

export function applySettings() {
  const s = state.siteSettings;
  const T = state.T;

  // Brand
  const brand = document.getElementById('nav-brand');
  if (brand) {
    if (T.logoUrl) {
      const scale = T.logoScale || 1;
      const imgHtml = `<img src="${T.logoUrl}" style="width:${T.logoWidth || 80}px;${T.logoHeight && T.logoHeight > 0 ? `height:${T.logoHeight}px;` : ''}transform:rotate(${T.logoRotation || 0}deg) scale(${scale});display:block;transition:transform .3s" alt="logo">`;
      if (T.showLogoText) {
        brand.innerHTML = `<span class="nav-logo-wrap">${imgHtml}</span><span class="nav-text-wrap" style="display:flex;align-items:center">${s.siteName || 'DACE'}<em>·</em></span>`;
      } else {
        brand.innerHTML = imgHtml;
      }
    } else {
      brand.innerHTML = `${s.siteName || 'DACE'}<em>·</em>`;
    }
  }

  const footerBrand = document.getElementById('footer-brand');
  if (footerBrand) footerBrand.innerHTML = `${s.siteName || 'DACE'}<em>·</em>`;

  // Banner
  const ban = document.getElementById('site-banner');
  if (ban) {
    if (s.bannerActive) {
      ban.style.display = 'block';
      let bText = T.bannerText || s.bannerText || '';
      (state.customEmojis || []).forEach((e) => {
        if (e.name && e.url) {
          bText = bText.split(':' + e.name + ':').join(
            `<img src="${e.url}" style="height:${e.height || 24}px;vertical-align:middle;margin:0 2px">`
          );
        }
      });
      const bAnim = s.bannerAnim || 'scroll';
      const bSpeed = T.bannerSpeed || s.bannerSpeed || 20;
      const bEasing = s.bannerEasing || 'linear';
      const bDir = s.bannerDir || 'normal';
      const bDelay = s.bannerDelay || 0;
      const bTxtClr = s.bannerTxtClr || '#ffffff';
      const durMap = { scroll: bSpeed + 's', 'fade-pulse': (bSpeed / 5) + 's', bounce: (bSpeed / 10) + 's', 'glow-pulse': (bSpeed / 5) + 's' };
      const bDur = durMap[bAnim] || bSpeed + 's';
      const bInner = document.getElementById('banner-inner');
      if (bInner) {
        bInner.innerHTML = bText;
        bInner.style.animation = bAnim === 'static' ? 'none' : `banner-${bAnim} ${bDur} ${bEasing} ${bDelay}s infinite ${bDir}`;
        bInner.style.color = bTxtClr;
      }
    } else {
      ban.style.display = 'none';
    }
  }

  // ─── Hero: Single source of truth ───
  // Only rebuild when hero-related settings actually changed
  const heroKey = JSON.stringify([
    s.heroTitle, T.heroTitleCustom, T.heroGlowOn, T.heroGlowInt, T.heroGlowBlur, T.heroGlowClr,
    T.heroStrokeOn, T.heroStrokeW, T.heroWordBlur, T.heroWordOp, T.heroStrokeClr,
    T.heroTitleSize, T.heroLetterSpacing, T.heroLineHeight, T.heroTextClr,
    T.heroEyebrowOn, T.heroEyebrow, T.heroEyebrowClr, T.heroEyebrowSize,
    T.heroGradOn, T.heroGradClr, T.heroGradOp, T.heroGradW, T.heroGradH,
    T.heroPadTop, T.fontDisplay, T.glowColor, T.accent, T.heroTitleSegments
  ]);
  if (heroKey !== _lastHeroKey) {
    _lastHeroKey = heroKey;
    _buildHero(s, T);
  }

  // Social links
  if (s.whatsapp) {
    const wa = 'https://wa.me/' + s.whatsapp;
    const navWa = document.getElementById('nav-wa');
    const fWa = document.getElementById('f-wa');
    const ctaWa = document.getElementById('cta-wa');
    if (navWa) navWa.href = wa;
    if (fWa) fWa.href = wa;
    if (ctaWa) ctaWa.href = wa;
  }
  if (s.instagram) {
    const ig = 'https://instagram.com/' + s.instagram;
    const navIg = document.getElementById('nav-ig');
    const fIg = document.getElementById('f-ig');
    if (navIg) navIg.href = ig;
    if (fIg) fIg.href = ig;
  }
  if (s.email) {
    const fEmail = document.getElementById('f-email');
    if (fEmail) fEmail.href = 'mailto:' + s.email;
  }

  // Section divider — only rebuild when divider settings changed
  const divKey = JSON.stringify([
    s.dividerTitle, s.dividerTitleSegments, s.dividerTitleSize, s.dividerLetterSpacing,
    s.dividerSub, s.dividerSubColor, s.dividerSubSize,
    s.dividerGlowOn, s.dividerGlowInt, s.dividerGlowBlur
  ]);
  if (divKey !== _lastDividerKey) {
    _lastDividerKey = divKey;
    const dt = document.getElementById('divider-title');
    const ds = document.getElementById('divider-sub');
    if (dt) {
      if (s.dividerTitleSegments && s.dividerTitleSegments.length) {
        dt.innerHTML = s.dividerTitleSegments.map(seg => {
          if (seg.c) return '<span style="color:' + seg.c + '">' + seg.text + '</span>';
          return seg.text;
        }).join('');
      } else if (s.dividerTitle) {
        dt.innerHTML = s.dividerTitle;
      }
      if (s.dividerTitleSize) dt.style.fontSize = s.dividerTitleSize + 'rem';
      if (s.dividerLetterSpacing != null) dt.style.letterSpacing = s.dividerLetterSpacing + 'em';
      if (s.dividerGlowOn) {
        const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#dc2626';
        dt.style.textShadow = '0 0 ' + (s.dividerGlowBlur || 20) + 'px ' + hexRgba(accent, (s.dividerGlowInt || 1) * 0.5);
      }
    }
    if (ds && s.dividerSub) {
      ds.textContent = s.dividerSub;
      if (s.dividerSubColor) ds.style.color = s.dividerSubColor;
      if (s.dividerSubSize) ds.style.fontSize = s.dividerSubSize + 'px';
    }
  }

  // Testimonials
  if (s.testimonialsActive && s.testimonials?.length) {
    const testimonials = document.getElementById('testimonials');
    const testiGrid = document.getElementById('testi-grid');
    if (testimonials) testimonials.style.display = 'block';
    if (testiGrid) {
      testiGrid.innerHTML = s.testimonials.map((t) => `
        <div class="testi-card">
          <div class="testi-stars"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div>
          <p class="testi-text">${t.text}</p>
          <div class="testi-name">${t.name}</div>
          <div class="testi-role">${t.role || ''}</div>
        </div>`).join('');
    }
  }
}

export function renderCustomLinks(links) {
  const byLoc = { header: [], hero: [], footer: [] };
  Object.values(links).forEach((l) => { if (byLoc[l.location]) byLoc[l.location].push(l); });

  const navCL = document.getElementById('nav-custom-links');
  if (navCL) navCL.innerHTML = byLoc.header.map((l) => `<a class="nav-link" href="${l.url}" target="_blank">${l.label}</a>`).join('');

  const heroCL = document.getElementById('hero-custom-links');
  if (heroCL) heroCL.innerHTML = byLoc.hero.map((l) => `<a class="nav-cta" href="${l.url}" target="_blank" style="display:inline-block;margin:4px">${l.label}</a>`).join('');

  const footerCL = document.getElementById('footer-custom-links');
  if (footerCL) footerCL.innerHTML = byLoc.footer.map((l) => `<a class="footer-link" href="${l.url}" target="_blank">${l.label}</a>`).join('');
}

export function renderFloating(elements) {
  const layer = document.getElementById('floating-layer');
  if (!layer) return;
  layer.innerHTML = '';
  Object.values(elements).forEach((el) => {
    if (!el || !el.visible) return;
    const div = document.createElement('div');
    div.className = 'fe-static';
    div.style.cssText = `left:${el.x || 0}px;top:${el.y || 0}px;width:${el.width || 100}px;height:${el.height || 100}px;opacity:${el.opacity || 1}`;
    if (el.type === 'text') {
      div.innerHTML = `<div class="fe-text-static" style="font-size:${el.fontSize || 16}px">${el.content || ''}</div>`;
    } else {
      div.innerHTML = `<img src="${el.content || ''}" alt="" draggable="false">`;
    }
    if (el.anim && el.anim !== 'none') {
      applyAnim(div, { type: el.anim, dur: el.animDur || 2, del: 0 }, ANIMS);
    }
    layer.appendChild(div);
  });
}
