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
  // Nuclear: set display directly on every panel, then show the target
  // This bypasses any CSS cascade/class specificity issues
  var panels = document.querySelectorAll('#sec-add .etp');
  for (var i = 0; i < panels.length; i++) {
    panels[i].style.display = 'none';
    panels[i].classList.remove('on');
  }

  // Activate target tab button
  document.querySelectorAll('#sec-add .et').forEach(function(t) { t.classList.remove('on'); });
  var btn = document.querySelector('#sec-add .et[data-et="' + name + '"]');
  if (btn) btn.classList.add('on');

  // Show target panel via inline style (wins over any CSS)
  var p = g('etp-' + name);
  if (p) {
    p.style.display = 'block';
    p.classList.add('on');
  }

  // Notify other modules about tab change
  if (name === 'extras') {
    document.dispatchEvent(new CustomEvent('extras-tab-shown'));
  }

  // Defensive: force-hide #anim-subsettings when NOT on extras tab
  var animContainer = document.getElementById('anim-subsettings');
  if (animContainer && name !== 'extras') {
    animContainer.style.display = 'none';
  }
}

Object.assign(window, { showSection, showEt });
