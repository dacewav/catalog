// ═══ DACEWAV Admin — Beat Card Style ═══
// Card style building, preview application, slider sync, color pickers,
// animation sub-settings, holograma helpers, and live preview update.
//
// Uses card-style-engine.js as single source of truth for build/apply/check logic.

import { db, allBeats, siteSettings } from './state.js';
import { g, val, setVal, checked, setChecked, showToast } from './helpers.js';
import {
  buildCardStyle, applyStyleToPreview, isCardStyleDefault,
  syncSliderDisplay as engineSyncSlider
} from '../card-style-engine.js';

// Re-export for backward compat
export { syncSliderDisplay } from '../card-style-engine.js';

// ═══ Color picker ↔ hex input sync ═══
export function syncAccentColor(source) {
  const picker = g('f-accent-color');
  const hex = g('f-accent-color-h');
  if (!picker || !hex) return;
  if (source === 'picker') hex.value = picker.value;
  else picker.value = hex.value;
}

export function syncBeatGlowColor(source) {
  const picker = g('f-glow-color');
  const hex = g('f-glow-color-h');
  if (!picker || !hex) return;
  if (source === 'picker') hex.value = picker.value;
  else picker.value = hex.value;
}

export function syncBorderColor(source) {
  const picker = g('f-border-color');
  if (!picker) return;
}

// ═══ Toggle per-animation sub-settings panels ═══
export function _toggleAnimSubsettings(type) {
  const container = document.getElementById('anim-subsettings');
  if (!container) return;
  const panels = container.querySelectorAll('.anim-sub-panel');
  panels.forEach(p => p.style.display = 'none');
  if (!type) { container.style.display = 'none'; return; }
  container.style.display = 'block';
  const map = {
    'holograma': 'sub-holograma', 'cambio-color': 'sub-color-shift', 'brillo': 'sub-brillo',
    'glitch': 'sub-glitch', 'temblor': 'sub-shake', 'flotar': 'sub-translate',
    'pulsar': 'sub-scale', 'respirar': 'sub-scale', 'latido': 'sub-scale',
    'rebotar': 'sub-translate', 'deslizar-arriba': 'sub-translate', 'deslizar-abajo': 'sub-translate',
    'deslizar-izq': 'sub-translate', 'deslizar-der': 'sub-translate', 'sacudida': 'sub-shake',
    'neon-flicker': 'sub-neon', 'parpadeo': 'sub-parpadeo', 'rotar': 'sub-rotate',
    'wobble': 'sub-rotate', 'balanceo': 'sub-rotate', 'swing': 'sub-rotate',
    'drift': 'sub-translate', 'shake-x': 'sub-shake'
  };
  const panelId = map[type];
  if (panelId) { const panel = document.getElementById(panelId); if (panel) panel.style.display = 'block'; }
}

// ═══ Holograma color helpers ═══
window.addHoloColor = function() {
  const list = document.getElementById('holo-colors-list');
  if (!list) return;
  const colors = ['#ffff00','#ff00ff','#00ffff','#ff8800','#8800ff'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const div = document.createElement('div');
  div.className = 'holo-cs';
  div.style.cssText = 'display:flex;align-items:center;gap:4px';
  div.innerHTML = `<input type="color" value="${randomColor}" oninput="updateCardPreview()" style="width:32px;height:24px;border:1px solid var(--b);border-radius:4px;background:none;cursor:pointer;padding:0"><button onclick="this.parentElement.remove();updateCardPreview()" style="background:none;border:none;color:var(--acc);cursor:pointer;font-size:12px">✕</button>`;
  list.appendChild(div);
  updateCardPreview();
};

export function _getHoloColors() {
  const list = document.getElementById('holo-colors-list');
  if (!list) return ['#ff0080','#00ff80','#0080ff'];
  return Array.from(list.querySelectorAll('input[type=color]')).map(i => i.value);
}

export function _setHoloColors(colors) {
  const list = document.getElementById('holo-colors-list');
  if (!list || !colors || !colors.length) return;
  list.innerHTML = colors.map(c => `<div class="holo-cs" style="display:flex;align-items:center;gap:4px"><input type="color" value="${c}" oninput="updateCardPreview()" style="width:32px;height:24px;border:1px solid var(--b);border-radius:4px;background:none;cursor:pointer;padding:0"><button onclick="this.parentElement.remove();updateCardPreview()" style="background:none;border:none;color:var(--acc);cursor:pointer;font-size:12px">✕</button></div>`).join('');
}

// ═══ Build cardStyle from beat editor inputs (f- prefix, with animation sub-settings) ═══
export function _buildCardStyleFromInputs() {
  return buildCardStyle('f-', true);
}

// ═══ Check if cardStyle is default ═══
export function _isCardStyleDefault(cs) {
  return isCardStyleDefault(cs);
}

// ═══ Apply cardStyle to preview element ═══
export function _applyCardStyleToPreview(pv, cs) {
  applyStyleToPreview(pv, cs);
}

// ═══ Live card preview update ═══
export function updateCardPreview() {
  const pv = g('beat-card-pv');
  const cs = _buildCardStyleFromInputs();
  const animTypeVal = val('f-anim-type');
  _toggleAnimSubsettings(animTypeVal);

  if (pv) {
    const name = val('f-name') || 'Nombre del Beat';
    const bpm = val('f-bpm') || '140';
    const key = val('f-key') || 'Am';
    const genre = g('f-genre')?.value || 'Trap';
    const imgUrl = val('f-img');

    const nameEl = g('bcpv-name'); if (nameEl) nameEl.textContent = name;
    const bpmEl = g('bcpv-bpm'); if (bpmEl) bpmEl.textContent = bpm + ' BPM';
    const keyEl = g('bcpv-key'); if (keyEl) keyEl.textContent = key;
    const genreEl = g('bcpv-genre'); if (genreEl) genreEl.textContent = genre;

    const imgWrap = g('bcpv-img');
    if (imgWrap) {
      if (imgUrl) imgWrap.innerHTML = '<img src="' + imgUrl + '" alt="">';
      else imgWrap.innerHTML = '<div class="bcpv-img-ph">♪</div>';
    }

    applyStyleToPreview(pv, cs);
  }

  if (typeof window.renderFullPvInCard === 'function') window.renderFullPvInCard();

  if (typeof window._sendLiveUpdate === 'function') {
    clearTimeout(window._updateCardPvLiveTimer);
    window._updateCardPvLiveTimer = setTimeout(function() { window._sendLiveUpdate(); }, 300);
  }
}

// ═══ Window assignments ═══
Object.assign(window, {
  syncAccentColor, syncBeatGlowColor, syncBorderColor,
  updateCardPreview, _buildCardStyleFromInputs, _applyCardStyleToPreview,
  _toggleAnimSubsettings, _getHoloColors, _setHoloColors, _isCardStyleDefault,
  syncSliderDisplay: engineSyncSlider
});
