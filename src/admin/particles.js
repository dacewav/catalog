// ═══ DACEWAV Admin — Particles Preview ═══
// Extracted from core.js — animated particles canvas preview.

import { ppCtx, ppParts, ppAnim, setPpCtx, setPpParts, setPpAnim } from './state.js';
import { g, val } from './helpers.js';

export function togglePFields() {
  const t = val('p-type') || 'circle';
  const tw = g('p-text-wrap'),
    iw = g('p-img-wrap');
  if (tw) tw.style.display = t === 'text' ? 'block' : 'none';
  if (iw) iw.style.display = t === 'image' ? 'block' : 'none';
}

export function initParticlesPreview() {
  const c = g('particles-pv');
  if (!c) return;
  c.innerHTML = '';
  const canvas = document.createElement('canvas');
  canvas.width = c.offsetWidth || 300;
  canvas.height = 100;
  canvas.style.cssText = 'width:100%;height:100%';
  c.appendChild(canvas);
  setPpCtx(canvas.getContext('2d'));
  const parts = [];
  const count = parseInt(val('p-count')) || 40;
  const pMin = parseInt(val('p-min')) || 2;
  const pMax = parseInt(val('p-max')) || 6;
  const speed = parseFloat(val('p-speed')) || 1;
  for (let i = 0; i < count; i++)
    parts.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: pMin + Math.random() * (pMax - pMin),
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      o: 0.1 + Math.random() * 0.4,
      rot: Math.random() * Math.PI * 2,
      rv: (Math.random() - 0.5) * 0.02,
    });
  setPpParts(parts);
  if (ppAnim) cancelAnimationFrame(ppAnim);
  animPP(canvas);
}

export function animPP(canvas) {
  if (!ppCtx) return;
  ppCtx.clearRect(0, 0, canvas.width, canvas.height);
  const col = val('p-color') || '#dc2626',
    type = val('p-type') || 'circle',
    text = val('p-text') || '\u266A',
    baseOp = parseFloat(val('p-opacity')) || 0.5;
  ppParts.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.rot != null) p.rot += p.rv || 0;
    if (p.x < -p.r * 2) p.x = canvas.width + p.r;
    if (p.x > canvas.width + p.r) p.x = -p.r;
    if (p.y < -p.r * 2) p.y = canvas.height + p.r;
    if (p.y > canvas.height + p.r) p.y = -p.r;
    ppCtx.save();
    ppCtx.globalAlpha = (p.o || 0.3) * baseOp;
    ppCtx.fillStyle = col;
    if (type === 'square') {
      ppCtx.translate(p.x, p.y);
      ppCtx.rotate(p.rot || 0);
      ppCtx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2);
    } else if (type === 'text') {
      ppCtx.font = Math.max(8, p.r * 3) + 'px sans-serif';
      ppCtx.textAlign = 'center';
      ppCtx.textBaseline = 'middle';
      ppCtx.fillText(text, p.x, p.y);
    } else {
      ppCtx.beginPath();
      ppCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ppCtx.fill();
    }
    ppCtx.restore();
  });
  setPpAnim(requestAnimationFrame(() => animPP(canvas)));
}
