// ═══ DACEWAV Admin — Navigation ═══
import { g } from './helpers.js';
import { updateHeroPv, initParticlesPreview } from './core.js';
import { initPColors } from './colors.js';

export function showSection(name) {
  // Revert live edit if leaving the editor without saving
  var current = document.querySelector('.section.on');
  if (current && current.id === 'sec-add' && name !== 'add') {
    if (typeof window._sendBeatRevert === 'function') window._sendBeatRevert();
  }
  document.querySelectorAll('.section').forEach(s => s.classList.remove('on'));
  document.querySelectorAll('.si').forEach(s => s.classList.remove('on'));
  const sec = g('sec-' + name); if (sec) sec.classList.add('on');
  const si = document.querySelector('.si[data-s="' + name + '"]'); if (si) si.classList.add('on');
  if (name === 'hero') { setTimeout(updateHeroPv, 50); setTimeout(initParticlesPreview, 100); }
  if (name === 'elements') setTimeout(() => { if (typeof initPColors === 'function') initPColors(); }, 50);
  if (name === 'stats' && typeof window.loadStats === 'function') window.loadStats();
  if (name === 'card-global' && typeof window.initGlobalCardStyle === 'function') window.initGlobalCardStyle();
}
export function showEt(name) {
  // Remove 'on' from ALL tabs and panels first — no overlap possible
  document.querySelectorAll('#sec-add .et').forEach(t => t.classList.remove('on'));
  document.querySelectorAll('#sec-add .etp').forEach(p => p.classList.remove('on'));

  // Activate target tab button
  const btn = document.querySelector('#sec-add .et[data-et="' + name + '"]');
  if (btn) btn.classList.add('on');

  // Activate target panel — force reflow to ensure browser applies display:none before display:block
  const p = g('etp-' + name);
  if (p) {
    void p.offsetHeight; // force reflow
    p.classList.add('on');
  }

  // Notify other modules about tab change
  if (name === 'extras') {
    document.dispatchEvent(new CustomEvent('extras-tab-shown'));
  }

  // Defensive: force-hide #anim-subsettings when NOT on extras tab
  // Prevents inline style.display from _toggleAnimSubsettings leaking between tabs
  const animContainer = document.getElementById('anim-subsettings');
  if (animContainer && name !== 'extras') {
    animContainer.style.display = 'none';
  }
}

Object.assign(window, { showSection, showEt });
