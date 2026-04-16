// ═══ DACEWAV.STORE — Visual Effects ═══
import { state } from './state.js';
export { initParticles } from './particles-store.js';

// ─── Cursor Glow ───
let _cgX = 0, _cgY = 0, _cgTX = 0, _cgTY = 0;

export function initCursorGlow() {
  document.addEventListener('mousemove', (e) => { _cgTX = e.clientX; _cgTY = e.clientY; });
  (function lerp() {
    _cgX += (_cgTX - _cgX) * 0.08;
    _cgY += (_cgTY - _cgY) * 0.08;
    const g = document.getElementById('cursor-glow');
    if (g) g.style.transform = `translate(${_cgX - 200}px,${_cgY - 200}px)`;
    requestAnimationFrame(lerp);
  })();
}

// ─── Scroll Progress ───
export function initScrollProgress() {
  window.addEventListener('scroll', () => {
    const sp = document.getElementById('scroll-progress');
    if (!sp) return;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    sp.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
  }, { passive: true });
}

// ─── Hero Parallax ───
export function initHeroParallax() {
  window.addEventListener('scroll', () => {
    const hero = document.getElementById('hero-section');
    if (!hero) return;
    const st = window.scrollY;
    const heroH = hero.offsetHeight;
    if (st < heroH * 1.5) {
      hero.style.transform = `translateY(${st * 0.15}px)`;
      const title = hero.querySelector('.hero-title');
      if (title) title.style.transform = `translateY(${st * 0.08}px)`;
      const op = 1 - st / (heroH * 1.2);
      hero.style.opacity = Math.max(0.3, op);
    }
  }, { passive: true });
}

// ─── Scroll-Aware Nav ───
let _lastScrollY = 0;
export function initScrollNav() {
  window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (!nav) return;
    const st = window.scrollY;
    nav.classList.toggle('nav-scrolled', st > 60);
    if (st > 200 && st > _lastScrollY + 5) {
      nav.classList.add('nav-hidden');
    } else if (st < _lastScrollY - 5) {
      nav.classList.remove('nav-hidden');
    }
    _lastScrollY = st;
  }, { passive: true });
}

// ─── 3D Tilt on Cards ───
export function setupCardTilt() {
  document.querySelectorAll('.beat-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const inner = card.querySelector('.beat-card-inner');
      if (!inner) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      inner.style.transform = `perspective(800px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) scale(1.01)`;
    });
    card.addEventListener('mouseleave', () => {
      const inner = card.querySelector('.beat-card-inner');
      if (!inner) return;
      inner.style.transform = 'perspective(800px) rotateY(0) rotateX(0) scale(1)';
    });
  });
  // Setup JS-driven sibling blur (avoids expensive :has() on large grids)
  setupHoverSiblingBlur();
}

// ─── JS-driven sibling blur (throttled, performant for many cards) ───
function setupHoverSiblingBlur() {
  const grids = document.querySelectorAll('.beat-grid');
  grids.forEach(grid => {
    const cards = grid.querySelectorAll('.beat-card.has-hover-fx');
    if (!cards.length) return;
    // Only activate JS-driven mode if any card has siblingsBlur > 0
    let hasSibBlur = false;
    cards.forEach(c => {
      const v = getComputedStyle(c).getPropertyValue('--hov-sib-blur').trim();
      if (v && parseFloat(v) > 0) hasSibBlur = true;
    });
    if (!hasSibBlur) return;

    let throttleTimer = null;
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        if (throttleTimer) return;
        throttleTimer = setTimeout(() => { throttleTimer = null; }, 80);
        grid.classList.add('hovering');
        card.classList.add('hover-active');
      });
      card.addEventListener('mouseleave', () => {
        if (throttleTimer) return;
        throttleTimer = setTimeout(() => { throttleTimer = null; }, 80);
        grid.classList.remove('hovering');
        card.classList.remove('hover-active');
      });
    });
  });
}

// ─── Staggered Reveal ───
let _staggerObs = null;

export function observeStagger() {
  if (_staggerObs) _staggerObs.disconnect();
  _staggerObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('vis');
        _staggerObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach((el) => _staggerObs.observe(el));
  document.querySelectorAll('.beat-card').forEach((c, i) => {
    c.style.setProperty('--si', i);
    c.classList.add('reveal', 'reveal-stagger');
    _staggerObs.observe(c);
  });
}

// ─── EQ Visualizer ───
let _eqInterval = null;

export function startEQ() {
  const bars = document.querySelectorAll('#pi-eq span');
  if (!bars.length) return;
  _eqInterval = setInterval(() => {
    bars.forEach((b) => { b.style.height = (4 + Math.random() * 16) + 'px'; });
  }, 120);
}

export function stopEQ() {
  clearInterval(_eqInterval);
  document.querySelectorAll('#pi-eq span').forEach((b) => { b.style.height = '4px'; });
  document.querySelectorAll('.wbar.anim').forEach((b) => {
    b.classList.remove('anim');
    b.style.transform = 'scaleY(1)';
  });
}

// ─── Animated Counter ───
export function animateCounter(el, target) {
  if (!el) return;
  let current = 0;
  const step = Math.max(1, Math.ceil(target / 30));
  const iv = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(iv); }
    el.textContent = current;
  }, 30);
}

// ─── Initialize all scroll/visual effects ───
let _scrollInitDone = false;

export function initAllEffects() {
  if (_scrollInitDone) return;
  _scrollInitDone = true;
  initCursorGlow();
  initScrollProgress();
  initHeroParallax();
  initScrollNav();
}
