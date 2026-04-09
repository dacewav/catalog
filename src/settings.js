// ═══ DACEWAV.STORE — Settings ═══
import { state } from './state.js';
import { ANIMS } from './config.js';
import { applyAnim } from './utils.js';

export function applySettings() {
  const s = state.siteSettings;
  const T = state.theme || {};
  const customEmojis = state.customEmojis || [];
  const brand = document.getElementById('nav-brand');
  if (brand) {
    if (T.logoUrl) {
      const scale = T.logoScale || 1;
      const imgHtml = '<img src="' + T.logoUrl + '" style="width:' + (T.logoWidth || 80) + 'px;' + (T.logoHeight && T.logoHeight > 0 ? 'height:' + T.logoHeight + 'px;' : '') + 'transform:rotate(' + (T.logoRotation || 0) + 'deg) scale(' + scale + ');display:block;transition:transform .3s" alt="logo">';
      if (T.showLogoText) brand.innerHTML = '<span class="nav-logo-wrap">' + imgHtml + '</span><span class="nav-text-wrap" style="display:flex;align-items:center">' + (s.siteName || 'DACE') + '<em>·</em></span>';
      else brand.innerHTML = imgHtml;
    } else {
      brand.innerHTML = (s.siteName || 'DACE') + '<em>·</em>';
    }
  }

  document.getElementById('footer-brand').innerHTML = (s.siteName || 'DACE') + '<em>·</em>';

  const ban = document.getElementById('site-banner');
  if (s.bannerActive) {
    ban.style.display = 'block';
    let bText = T.bannerText || s.bannerText || '';
    (customEmojis || []).forEach(e => {
      if (e.name && e.url) bText = bText.split(':' + e.name + ':').join('<img src="' + e.url + '" style="height:' + (e.height || 24) + 'px;vertical-align:middle;margin:0 2px">');
    });
    const bAnim = s.bannerAnim || 'scroll';
    const bSpeed = T.bannerSpeed || s.bannerSpeed || 20;
    const bEasing = s.bannerEasing || 'linear';
    const bDir = s.bannerDir || 'normal';
    const bDelay = s.bannerDelay || 0;
    const bTxtClr = s.bannerTxtClr || '#ffffff';
    const durMap = { 'scroll': bSpeed + 's', 'fade-pulse': (bSpeed / 5) + 's', 'bounce': (bSpeed / 10) + 's', 'glow-pulse': (bSpeed / 5) + 's' };
    const bDur = durMap[bAnim] || bSpeed + 's';
    const bInner = document.getElementById('banner-inner');
    bInner.innerHTML = bText;
    if (bAnim === 'static') bInner.style.animation = 'none';
    else bInner.style.animation = 'banner-' + bAnim + ' ' + bDur + ' ' + bEasing + ' ' + bDelay + 's infinite ' + bDir;
    bInner.style.color = bTxtClr;
  } else {
    ban.style.display = 'none';
  }

  const _heroText = s.heroTitle || T.heroTitleCustom;
  if (_heroText) {
    const lines = _heroText.split('\n');
    document.getElementById('hero-title').innerHTML = lines.map((l, i) =>
      i === lines.length - 1 ? '<span class="glow-word" data-t="' + l + '">' + l + '</span>' : l
    ).join('<br>');
  }

  document.getElementById('hero-sub').textContent = s.heroSubtitle || T.heroSubCustom || '';

  const eyebrow = document.querySelector('.hero-eyebrow');
  if (eyebrow && T.heroEyebrow) {
    eyebrow.textContent = '';
    eyebrow.appendChild(document.createTextNode(T.heroEyebrow));
  }

  if (s.whatsapp) {
    const wa = 'https://wa.me/' + s.whatsapp;
    document.getElementById('nav-wa').href = wa;
    document.getElementById('f-wa').href = wa;
    const cwa = document.getElementById('cta-wa');
    if (cwa) cwa.href = wa;
  }
  if (s.instagram) {
    const ig = 'https://instagram.com/' + s.instagram;
    document.getElementById('nav-ig').href = ig;
    document.getElementById('f-ig').href = ig;
  }
  if (s.email) document.getElementById('f-email').href = 'mailto:' + s.email;

  // Section divider (editable)
  const dt = document.getElementById('divider-title');
  const ds = document.getElementById('divider-sub');
  if (dt && s.dividerTitle) dt.innerHTML = s.dividerTitle;
  if (ds && s.dividerSub) ds.textContent = s.dividerSub;

  if (s.testimonialsActive && s.testimonials && s.testimonials.length) {
    document.getElementById('testimonials').style.display = 'block';
    document.getElementById('testi-grid').innerHTML = s.testimonials.map(t =>
      '<div class="testi-card"><div class="testi-stars"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div><p class="testi-text">' + t.text + '</p><div class="testi-name">' + t.name + '</div><div class="testi-role">' + (t.role || '') + '</div></div>'
    ).join('');
  }
}

export function renderCustomLinks(links) {
  const byLoc = { header: [], hero: [], footer: [] };
  Object.values(links).forEach(l => { if (byLoc[l.location]) byLoc[l.location].push(l); });
  document.getElementById('nav-custom-links').innerHTML = byLoc.header.map(l =>
    '<a class="nav-link" href="' + l.url + '" target="_blank">' + l.label + '</a>'
  ).join('');
  document.getElementById('hero-custom-links').innerHTML = byLoc.hero.map(l =>
    '<a class="nav-cta" href="' + l.url + '" target="_blank" style="display:inline-block;margin:4px">' + l.label + '</a>'
  ).join('');
  document.getElementById('footer-custom-links').innerHTML = byLoc.footer.map(l =>
    '<a class="footer-link" href="' + l.url + '" target="_blank">' + l.label + '</a>'
  ).join('');
}

export function renderFloating(elements) {
  const layer = document.getElementById('floating-layer');
  layer.innerHTML = '';
  Object.values(elements).forEach(el => {
    if (!el || !el.visible) return;
    const div = document.createElement('div');
    div.className = 'fe-static';
    div.style.cssText = 'left:' + (el.x || 0) + 'px;top:' + (el.y || 0) + 'px;width:' + (el.width || 100) + 'px;height:' + (el.height || 100) + 'px;opacity:' + (el.opacity || 1);
    if (el.type === 'text') div.innerHTML = '<div class="fe-text-static" style="font-size:' + (el.fontSize || 16) + 'px">' + (el.content || '') + '</div>';
    else div.innerHTML = '<img src="' + (el.content || '') + '" alt="" draggable="false">';
    if (el.anim && el.anim !== 'none') {
      applyAnim(div, { type: el.anim, dur: el.animDur || 2, del: 0 }, ANIMS);
    }
    layer.appendChild(div);
  });
}
