// ═══ DACEWAV.STORE — Particles ═══
// Canvas-based particle system: circle, square, star, text, image.
import { state } from './state.js';

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

  if (_particlesResizeHandler) window.removeEventListener('resize', _particlesResizeHandler);
  _particlesResizeHandler = () => {
    if (pCanvas) { pCanvas.width = window.innerWidth; pCanvas.height = window.innerHeight; }
  };
  window.addEventListener('resize', _particlesResizeHandler);

  const T = state.T;
  const count = T.particlesCount || 40;
  const pMin = T.particlesMin || 2;
  const pMax = T.particlesMax || 6;

  const needsRecreate = !_particlesInitialized || count !== _lastPartCount || pMin !== _lastPartMin || pMax !== _lastPartMax;

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
    const speed = T.particlesSpeed || 1;
    particles.forEach(p => {
      const angle = Math.atan2(p.vy, p.vx);
      p.vx = Math.cos(angle) * speed * (0.5 + Math.random() * 0.5);
      p.vy = Math.sin(angle) * speed * (0.5 + Math.random() * 0.5);
    });
  }

  if (!_particlesInitialized) {
    _particlesInitialized = true;
    if (pAnimId) cancelAnimationFrame(pAnimId);
    _animateParticles();
  }
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
