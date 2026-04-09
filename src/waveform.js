// ═══ DACEWAV.STORE — Waveform System ═══
import { state } from './state.js';
import { logError } from './error-handler.js';

const WAVEFORM_BARS = 40;

/**
 * Generate waveform data from audio URL. Uses cache if available.
 */
export function generateWaveform(audioUrl, beatId, callback) {
  if (state.waveformCache[beatId]) {
    callback(state.waveformCache[beatId]);
    return;
  }

  let ctx;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const xhr = new XMLHttpRequest();
    xhr.open('GET', audioUrl, true);
    xhr.responseType = 'arraybuffer';

    xhr.onload = function () {
      ctx.decodeAudioData(
        xhr.response,
        function (buffer) {
          const data = buffer.getChannelData(0);
          const step = Math.floor(data.length / WAVEFORM_BARS);
          const wave = [];

          for (let i = 0; i < WAVEFORM_BARS; i++) {
            let sum = 0;
            for (let j = 0; j < step; j++) {
              sum += Math.abs(data[i * step + j]);
            }
            wave.push(sum / step);
          }

          const max = Math.max(...wave);
          const normalized = wave.map((v) => v / max);
          state.waveformCache[beatId] = normalized;

          try {
            localStorage.setItem('dace-waveforms', JSON.stringify(state.waveformCache));
          } catch (e) {
            // localStorage full — silently ignore
          }

          callback(normalized);
          ctx.close();
        },
        function () {
          callback(null);
          ctx.close();
        }
      );
    };

    xhr.onerror = function () {
      callback(null);
      ctx.close();
    };

    xhr.send();
  } catch (e) {
    logError('Waveform/generate', e);
    if (ctx) { try { ctx.close(); } catch {} }
    callback(null);
  }
}

/**
 * Convert waveform data array to SVG rects.
 */
export function waveformToSVG(wave, width, height) {
  if (!wave || !wave.length) return '';
  const barW = width / wave.length;
  const gap = 1;
  const svgW = barW - gap;
  return wave.map((v, i) => {
    const h = Math.max(2, v * height);
    const y = height - h;
    return `<rect x="${i * barW}" y="${y}" width="${svgW}" height="${h}" rx="1"/>`;
  }).join('');
}

/**
 * Generate and apply waveform SVG to a beat card.
 */
export function applyWaveformToCard(beatId) {
  const b = state.allBeats.find((x) => x.id === beatId);
  if (!b || !b.previewUrl) return;
  const card = document.getElementById('card-' + beatId);
  if (!card) return;
  const waveRow = card.querySelector('.beat-wave-row');
  if (!waveRow) return;

  generateWaveform(b.previewUrl, beatId, (wave) => {
    if (!wave) return;
    const svg = `<svg class="waveform-svg" viewBox="0 0 200 52" preserveAspectRatio="none">
      <defs><clipPath id="wcp-${beatId}"><rect class="wf-clip-rect" x="0" y="0" width="0" height="52"/></clipPath></defs>
      <g class="wf-bg">${waveformToSVG(wave, 200, 52)}</g>
      <g class="wf-progress" clip-path="url(#wcp-${beatId})">${waveformToSVG(wave, 200, 52)}</g>
    </svg>`;
    waveRow.insertAdjacentHTML('afterend', svg);
    waveRow.style.display = 'none';
  });
}

/**
 * Clear waveform cache (for debugging / memory management).
 */
export function clearWaveformCache() {
  state.waveformCache = {};
  localStorage.removeItem('dace-waveforms');
}
