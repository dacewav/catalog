// ═══ DACEWAV Admin — Navigation ═══
import { g } from './helpers.js';
import { updateHeroPv, initParticlesPreview } from './core.js';
import { initPColors } from './colors.js';

export function showSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('on'));
  document.querySelectorAll('.si').forEach(s => s.classList.remove('on'));
  const sec = g('sec-' + name); if (sec) sec.classList.add('on');
  const si = document.querySelector('.si[data-s="' + name + '"]'); if (si) si.classList.add('on');
  if (name === 'hero') { setTimeout(updateHeroPv, 50); setTimeout(initParticlesPreview, 100); }
  if (name === 'elements') setTimeout(() => { if (typeof initPColors === 'function') initPColors(); }, 50);
  if (name === 'stats' && typeof window.loadStats === 'function') window.loadStats();
  // Show/hide floating card preview
  const fpv = document.getElementById('float-pv');
  if (fpv) fpv.style.display = (name === 'add') ? 'block' : 'none';
}
export function showEt(name) {
  document.querySelectorAll('#sec-add .et').forEach(t => t.classList.remove('on'));
  document.querySelectorAll('#sec-add .etp').forEach(p => p.classList.remove('on'));
  const btn = document.querySelector('#sec-add .et[data-et="' + name + '"]');
  if (btn) btn.classList.add('on');
  const p = g('etp-' + name); if (p) p.classList.add('on');
}

Object.assign(window, { showSection, showEt });
