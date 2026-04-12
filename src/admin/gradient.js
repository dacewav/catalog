// ═══ DACEWAV Admin — Gradient Editor ═══
// Extracted from core.js — hero background gradient stop editor.

import { _gradStops, _gradRerenderTimer, setGradRerenderTimer } from './state.js';
import { g, val } from './helpers.js';

export function renderGradEditor() {
  const wrap = g('grad-stops');
  if (!wrap) return;
  const gradCSS = buildGradCSS();
  wrap.innerHTML =
    '<div style="height:40px;border-radius:var(--rad);border:1px solid var(--b);margin-bottom:8px;position:relative;overflow:hidden;cursor:pointer" id="grad-bar" onclick="addGradStop(event)">' +
    '<div style="width:100%;height:100%;background:linear-gradient(90deg,' + gradCSS + ');transition:background .2s"></div>' +
    _gradStops
      .map(
        (s, i) =>
          '<div style="position:absolute;left:' +
          s.pos +
          '%;top:0;bottom:0;width:12px;margin-left:-6px;cursor:ew-resize;display:flex;flex-direction:column;align-items:center;padding-top:2px" onmousedown="startDragStop(event,' +
          i +
          ')"><div style="width:10px;height:10px;border-radius:50%;background:' +
          s.color +
          ';border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.5)"></div><div style="width:2px;flex:1;background:rgba(255,255,255,0.5)"></div></div>'
      )
      .join('') +
    '</div><div style="display:flex;flex-direction:column;gap:4px">' +
    _gradStops
      .map(
        (s, i) =>
          '<div style="display:flex;align-items:center;gap:6px;padding:4px 6px;background:var(--as2);border-radius:var(--rad)"><span style="font-size:9px;color:var(--mu);min-width:16px">' +
          i +
          '</span><input type="range" min="0" max="100" value="' +
          s.pos +
          '" style="width:70px" oninput="updateGradStop(' +
          i +
          ",\\'pos\\',this.value)\"><input type=\"color\" value=\"" +
          s.color +
          "\" style=\"width:22px;height:18px;border:1px solid var(--b);border-radius:3px;padding:0\" oninput=\"updateGradStop(" +
          i +
          ",\\'color\\',this.value)\"><input type=\"range\" min=\"0\" max=\"0.5\" step=\"0.01\" value=\"" +
          s.opacity +
          "\" style=\"width:50px\" oninput=\"updateGradStop(" +
          i +
          ",\\'opacity\\',this.value)\"><span style=\"font-size:9px;color:var(--acc);min-width:28px\">" +
          s.opacity.toFixed(2) +
          '</span><button class="btn btn-del" onclick="rmGradStop(' +
          i +
          ')" style="font-size:8px;padding:2px 5px;margin-left:auto">\u2715</button></div>'
      )
      .join('') +
    '</div>';
}

export function buildGradCSS() {
  const sorted = [..._gradStops].sort((a, b) => a.pos - b.pos);
  return sorted
    .map(
      (s) =>
        'rgba(' +
        parseInt(s.color.slice(1, 3), 16) +
        ',' +
        parseInt(s.color.slice(3, 5), 16) +
        ',' +
        parseInt(s.color.slice(5, 7), 16) +
        ',' +
        s.opacity +
        ') ' +
        s.pos +
        '%'
    )
    .join(', ');
}

export function addGradStop(e) {
  const bar = g('grad-bar');
  if (!bar) return;
  const r = bar.getBoundingClientRect();
  const pos = Math.round(((e.clientX - r.left) / r.width) * 100);
  _gradStops.push({ pos, color: '#dc2626', opacity: 0.1 });
  renderGradEditor();
  applyGradToHero();
}

export function updateGradStop(i, field, v) {
  if (!_gradStops[i]) return;
  _gradStops[i][field] = field === 'pos' ? parseInt(v) : field === 'opacity' ? parseFloat(v) : v;
  clearTimeout(_gradRerenderTimer);
  setGradRerenderTimer(
    setTimeout(() => {
      renderGradEditor();
      applyGradToHero();
    }, field === 'color' ? 300 : 0)
  );
}

export function rmGradStop(i) {
  _gradStops.splice(i, 1);
  renderGradEditor();
  applyGradToHero();
}

export function startDragStop(e, i) {
  e.preventDefault();
  const bar = g('grad-bar');
  if (!bar) return;
  const r = bar.getBoundingClientRect();
  function onMove(ev) {
    const pos = Math.round(Math.max(0, Math.min(100, ((ev.clientX - r.left) / r.width) * 100)));
    _gradStops[i].pos = pos;
    renderGradEditor();
    applyGradToHero();
  }
  function onUp() {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
  }
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

export function applyGradToHero() {
  const css = buildGradCSS();
  const pvg = g('hpv-grad');
  if (pvg)
    pvg.style.background =
      'radial-gradient(ellipse ' +
      (parseInt(val('h-grad-w')) || 80) +
      '% ' +
      (parseInt(val('h-grad-h')) || 60) +
      '% at 50% 0%, ' +
      css +
      ')';
}
