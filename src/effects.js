// ═══ DACEWAV.STORE — Visual Effects ═══
import { state } from './state.js';

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

// ─── Particles ───
let particles = [];
let pCanvas = null;
let pCtx = null;
let pAnimId = null;
const _pImgCache = {};

function _pImg(url) {
  if (_pImgCache[url]) return _pImgCache[url];
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = url;
  _pImgCache[url] = img;
  img.onload = () => { _pImgCache[url] = img; };
  return img;
}

function _drawStar(ctx, cx, cy, r, pts) {
  ctx.beginPath();
  for (let i = 0; i < pts * 2; i++) {
    const a = (i * Math.PI) / pts - Math.PI / 2;
    const rd = i % 2 === 0 ? r : r * 0.4;
    const x = cx + Math.cos(a) * rd;
    const y = cy + Math.sin(a) * rd;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

let _particlesResizeHandler = null;
let _lastPartCount = 0;
let _lastPartMin = 0;
let _lastPartMax = 0;
let _particlesInitialized = false;

export function initParticles() {
  pCanvas = document.getElementById('particles-canvas');
  if (!pCanvas) return;
  pCtx = pCanvas.getContext('2d');
  pCanvas.width = window.innerWidth;
  pCanvas.height = window.innerHeight;

  // Remove previous resize handler to prevent accumulation
  if (_particlesResizeHandler) window.removeEventListener('resize', _particlesResizeHandler);
  _particlesResizeHandler = () => {
    if (pCanvas) { pCanvas.width = window.innerWidth; pCanvas.height = window.innerHeight; }
  };
  window.addEventListener('resize', _particlesResizeHandler);

  const T = state.T;
  const count = T.particlesCount || 40;
  const pMin = T.particlesMin || 2;
  const pMax = T.particlesMax || 6;

  // Only recreate particles if count or size range changed
  // Otherwise just update speed on existing particles (smooth transition)
  const needsRecreate = !_particlesInitialized
    || count !== _lastPartCount
    || pMin !== _lastPartMin
    || pMax !== _lastPartMax;

  if (needsRecreate) {
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * pCanvas.width,
        y: Math.random() * pCanvas.height,
        r: pMin + Math.random() * (pMax - pMin),
        vx: (Math.random() - 0.5) * (T.particlesSpeed || 1),
        vy: (Math.random() - 0.5) * (T.particlesSpeed || 1),
        o: 0.1 + Math.random() * 0.4,
        rot: Math.random() * Math.PI * 2,
        rv: (Math.random() - 0.5) * 0.02,
      });
    }
    _lastPartCount = count;
    _lastPartMin = pMin;
    _lastPartMax = pMax;
  } else {
    // Just update speed on existing particles — no recreation
    const speed = T.particlesSpeed || 1;
    particles.forEach(p => {
      const angle = Math.atan2(p.vy, p.vx);
      const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      const newSpeed = speed * (0.5 + Math.random() * 0.5);
      p.vx = Math.cos(angle) * newSpeed;
      p.vy = Math.sin(angle) * newSpeed;
    });
  }

  if (!_particlesInitialized) {
    _particlesInitialized = true;
    if (pAnimId) cancelAnimationFrame(pAnimId);
    _animateParticles();
  }
  // If already running, the animation loop reads state.T each frame — no restart needed
}

function _animateParticles() {
  const T = state.T;
  if (!T.particlesOn || !pCtx) {
    if (pCtx) pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    return;
  }

  pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
  const col = T.particlesColor || T.accent || '#dc2626';
  const type = T.particlesType || 'circle';
  const text = T.particlesText || '♪';
  const imgUrl = T.particlesImgUrl || '';
  const baseOp = T.particlesOpacity != null ? T.particlesOpacity : 0.5;

  particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.rot != null) p.rot += p.rv || 0;

    // Wrap around edges
    if (p.x < -p.r * 2) p.x = pCanvas.width + p.r;
    if (p.x > pCanvas.width + p.r) p.x = -p.r;
    if (p.y < -p.r * 2) p.y = pCanvas.height + p.r;
    if (p.y > pCanvas.height + p.r) p.y = -p.r;

    const op = (p.o || 0.3) * baseOp;
    pCtx.save();
    pCtx.globalAlpha = op;

    if (type === 'square') {
      pCtx.fillStyle = col;
      pCtx.translate(p.x, p.y);
      pCtx.rotate(p.rot || 0);
      pCtx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2);
    } else if (type === 'star') {
      pCtx.fillStyle = col;
      pCtx.translate(p.x, p.y);
      pCtx.rotate(p.rot || 0);
      _drawStar(pCtx, 0, 0, p.r, 5);
    } else if (type === 'text') {
      pCtx.fillStyle = col;
      pCtx.font = `${Math.max(8, p.r * 3)}px sans-serif`;
      pCtx.textAlign = 'center';
      pCtx.textBaseline = 'middle';
      pCtx.fillText(text, p.x, p.y);
    } else if (type === 'image') {
      const img = _pImg(imgUrl);
      if (img && img.complete && img.naturalWidth) {
        pCtx.drawImage(img, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
      } else {
        pCtx.fillStyle = col;
        pCtx.beginPath();
        pCtx.arc(p.x, p.y, p.r * 0.5, 0, Math.PI * 2);
        pCtx.fill();
      }
    } else {
      pCtx.fillStyle = col;
      pCtx.beginPath();
      pCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      pCtx.fill();
    }

    pCtx.restore();
  });

  pAnimId = requestAnimationFrame(_animateParticles);
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
