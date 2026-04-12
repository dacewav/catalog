// ═══ DACEWAV Admin — Text Colorizer ═══
// Visual text editor: click words to color them. Stores segments for multi-color text.

import { g, val, showToast } from './helpers.js';

let _tczState = {};

export function initTextColorizers() {
  const divTitle = val('s-div-title') || 'Todo fire. Zero filler.';
  const divSegments = _tczParseHTML(divTitle);
  renderTextColorizer('div-tcz', 's-div-title', divSegments);

  const heroTitle = val('h-title') || 'Beats que\ndefinen géneros.';
  const heroSegments = _tczParseHTML(heroTitle.replace(/\n/g, '\n'));
  renderTextColorizer('hero-tcz', 'h-title', heroSegments);
}

export function renderTextColorizer(containerId, inputId, segments) {
  const wrap = g(containerId); if (!wrap) return;
  const accent = val('tc-glow') || '#dc2626';
  const presets = [accent, '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f0f0f2', ''];
  _tczState[containerId] = { segments: segments || [], activeColor: accent };

  wrap.innerHTML =
    '<div class="tcz-toolbar">' +
      '<label>Color:</label>' +
      '<input type="color" class="tcz-color-pick" id="' + containerId + '-pick" value="' + accent + '" oninput="tczSetColor(\'' + containerId + '\',this.value)">' +
      '<div class="tcz-presets">' +
        presets.map((c, i) =>
          '<div class="tcz-preset' + (i === 0 ? ' on' : '') + '"' +
          ' style="background:' + (c || 'transparent') + ';' + (!c ? 'border:1px dashed var(--mu)' : '') + '"' +
          ' onclick="tczSetColor(\'' + containerId + '\',\'' + c + '\');tczMarkPreset(this,\'' + containerId + '\')"' +
          ' title="' + (c || 'Quitar color') + '"></div>'
        ).join('') +
      '</div>' +
    '</div>' +
    '<div class="tcz-text" id="' + containerId + '-text">' + _tczRenderWords(containerId, segments) + '</div>' +
    '<div class="tcz-actions">' +
      '<button onclick="tczClearColors(\'' + containerId + '\')">🗑 Quitar colores</button>' +
      '<button onclick="tczSplitAtCursor(\'' + containerId + '\',\'' + inputId + '\')">✂ Dividir texto</button>' +
    '</div>' +
    '<div class="tcz-hint">Click en una palabra para aplicar el color seleccionado. Click de nuevo para quitarlo.</div>';

  const rawInput = g(inputId);
  if (rawInput) rawInput.style.display = 'none';
}

function _tczRenderWords(containerId, segments) {
  let html = '';
  let idx = 0;
  segments.forEach(seg => {
    const words = seg.text.split(/(\s+)/);
    words.forEach(w => {
      if (/^\s+$/.test(w)) {
        html += w;
      } else if (w.length > 0) {
        const style = seg.c ? 'color:' + seg.c : '';
        const cls = 'tcz-w' + (seg.c ? ' tcz-colored' : '');
        html += '<span class="' + cls + '" style="' + style + '" data-idx="' + idx + '" onclick="tczWordClick(\'' + containerId + '\',' + idx + ')">' + w + '</span>';
        idx++;
      }
    });
  });
  return html || '<span style="color:var(--hi);font-style:italic">Escribe texto arriba...</span>';
}

export function tczSetColor(containerId, color) {
  if (!_tczState[containerId]) return;
  _tczState[containerId].activeColor = color;
  const pick = g(containerId + '-pick');
  if (pick) pick.value = color || '#ffffff';
}

export function tczMarkPreset(el, containerId) {
  const wrap = el.closest('.tcz-presets');
  if (wrap) wrap.querySelectorAll('.tcz-preset').forEach(p => p.classList.remove('on'));
  el.classList.add('on');
}

export function tczWordClick(containerId, wordIdx) {
  const state = _tczState[containerId]; if (!state) return;
  const color = state.activeColor;

  let globalIdx = 0;
  let newSegments = [];
  state.segments.forEach(seg => {
    const words = seg.text.split(/(\s+)/);
    words.forEach(w => {
      if (/^\s+$/.test(w)) {
        if (newSegments.length > 0) {
          newSegments[newSegments.length - 1].text += w;
        } else {
          newSegments.push({ text: w, c: seg.c });
        }
      } else if (w.length > 0) {
        if (globalIdx === wordIdx) {
          newSegments.push({ text: w, c: (seg.c === color && color) ? '' : color });
        } else {
          newSegments.push({ text: w, c: seg.c });
        }
        globalIdx++;
      }
    });
  });

  state.segments = _tczMergeSegments(newSegments);
  const textEl = g(containerId + '-text');
  if (textEl) textEl.innerHTML = _tczRenderWords(containerId, state.segments);
  _tczSyncToInput(containerId);
}

function _tczMergeSegments(segments) {
  if (segments.length < 2) return segments;
  const merged = [segments[0]];
  for (let i = 1; i < segments.length; i++) {
    const prev = merged[merged.length - 1];
    const curr = segments[i];
    if (prev.c === curr.c) {
      prev.text += curr.text;
    } else {
      merged.push(curr);
    }
  }
  return merged;
}

export function tczClearColors(containerId) {
  const state = _tczState[containerId]; if (!state) return;
  const fullText = state.segments.map(s => s.text).join('');
  state.segments = [{ text: fullText, c: '' }];
  const textEl = g(containerId + '-text');
  if (textEl) textEl.innerHTML = _tczRenderWords(containerId, state.segments);
  _tczSyncToInput(containerId);
}

export function tczSplitAtCursor(containerId, inputId) {
  const state = _tczState[containerId]; if (!state) return;
  const rawInput = g(inputId); if (!rawInput) return;
  rawInput.style.display = '';
  rawInput.focus();
  rawInput.addEventListener('input', function handler() {
    const html = rawInput.value;
    state.segments = _tczParseHTML(html);
    const textEl = g(containerId + '-text');
    if (textEl) textEl.innerHTML = _tczRenderWords(containerId, state.segments);
    _tczSyncToInput(containerId);
  }, { once: false });
  showToast('Edita el texto raw. Los <em> se convierten en colores.');
}

function _tczParseHTML(html) {
  const segments = [];
  const parts = html.split(/(<em>.*?<\/em>)/);
  const accent = val('tc-glow') || '#dc2626';
  parts.forEach(part => {
    const emMatch = part.match(/^<em>(.*?)<\/em>$/);
    if (emMatch) {
      segments.push({ text: emMatch[1], c: accent });
    } else if (part.length > 0) {
      segments.push({ text: part, c: '' });
    }
  });
  return segments.length ? segments : [{ text: html, c: '' }];
}

function _tczSyncToInput(containerId) {
  const state = _tczState[containerId]; if (!state) return;
  const container = g(containerId);
  if (!container) return;
  container.dataset.segments = JSON.stringify(state.segments);
}

export function tczGetSegments(containerId) {
  const state = _tczState[containerId];
  return state ? state.segments : [];
}

function escapeHtml(s) {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function segmentsToHTML(segments) {
  if (!segments || !segments.length) return '';
  return segments.map(s => {
    const text = escapeHtml(s.text).replace(/\n/g, '<br>');
    if (s.c) return '<span style="color:' + s.c + '">' + text + '</span>';
    return text;
  }).join('');
}

// ═══ Window assignments ═══
Object.assign(window, {
  renderTextColorizer, tczSetColor, tczMarkPreset, tczWordClick,
  tczClearColors, tczSplitAtCursor, tczGetSegments, segmentsToHTML, initTextColorizers
});
