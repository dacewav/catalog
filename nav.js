// ═══ DACEWAV Admin — Navigation ═══
import { g } from './helpers.js';
import { updateHeroPv } from './core-preview.js';
import { initParticlesPreview } from './core-effects.js';
import { initPColors } from './colors.js';

export function showSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('on'));
  document.querySelectorAll('.si').forEach(s => s.classList.remove('on'));
  const sec = g('sec-' + name); if (sec) sec.classList.add('on');
  const si = document.querySelector('.si[data-s="' + name + '"]'); if (si) si.classList.add('on');
  if (name === 'hero') { setTimeout(updateHeroPv, 50); setTimeout(initParticlesPreview, 100); }
  if (name === 'elements') setTimeout(() => { if (typeof initPColors === 'function') initPColors(); }, 50);
  if (name === 'stats' && typeof window.loadStats === 'function') window.loadStats();
}
export function showEt(name) {
  const tabs = document.querySelectorAll('#sec-add .et');
  const panels = document.querySelectorAll('#sec-add .etp');
  // Map tab index to panel: tabs[0]→panels[0] (info), tabs[1]→panels[1] (lics), etc.
  const names = ['info', 'lics', 'media', 'plat', 'extras'];
  const idx = names.indexOf(name);
  tabs.forEach((t, i) => t.classList.toggle('on', i === idx));
  panels.forEach((p, i) => p.classList.toggle('on', i === idx));
}

Object.assign(window, { showSection, showEt });
