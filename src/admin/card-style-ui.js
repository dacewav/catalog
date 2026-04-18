// ═══ DACEWAV Admin — Card Style Controls Generator ═══
// Generates HTML for card style controls (filters, glow, anim, border, shadow, hover, transform)
// Used in both: beat editor (Extras tab) and global card style section
//
// Core logic (build, populate, apply, check) lives in card-style-engine.js

import { g } from './helpers.js';
import { EFFECT_PRESETS } from './card-effect-presets.js';

// Re-export everything from engine (single source of truth)
export {
  DEFAULT_CARD_STYLE,
  buildCardStyle as buildCardStyleFromPrefix,
  populateCardStyle as populateFromCardStyle,
  resetCardStyle as resetCardStyleInputs,
  isCardStyleDefault as isCardStyleEmpty,
  syncSliderDisplays,
  applyStyleToPreview,
  mergeCardStyles,
  safeGlowType,
} from '../card-style-engine.js';

// ═══ Blur type options for the dropdown
export const BLUR_TYPES = [
  { value: '', label: 'Ninguno', desc: 'Sin blur' },
  { value: 'vigneta', label: 'Vigneta', desc: 'Oscurece los bordes' },
  { value: 'aura', label: 'Aura', desc: 'Resplandor alrededor' },
  { value: 'focus', label: 'Focus', desc: 'Centro nítido, bordes suaves' },
];

export function renderEffectGalleryHTML(prefix) {
  const cats = { base: 'Base', color: 'Color', glow: 'Glow', anim: 'Animación' };
  let html = '<div class="fx-gallery">';
  for (const [catKey, catName] of Object.entries(cats)) {
    const presets = EFFECT_PRESETS.filter(p => p.cat === catKey);
    if (!presets.length) continue;
    html += '<div class="fx-cat-label">' + catName + '</div>';
    html += '<div class="fx-cat-row">';
    presets.forEach(p => {
      html += '<div class="fx-preset" data-fx="' + p.id + '" data-prefix="' + prefix + '" onclick="window.__applyFxPreset && window.__applyFxPreset(\'' + p.id + '\',\'' + prefix + '\')" title="' + p.desc + '">' +
        '<div class="fx-pv" style="background:' + p.preview.bg + ';filter:' + p.preview.filter + '"></div>' +
        '<div class="fx-preset-name">' + p.name + '</div>' +
      '</div>';
    });
    html += '</div>';
  }
  html += '</div>';
  return html;
}

// ═══ HTML generators (these stay here — they're UI, not logic) ═══

export function renderFiltersHTML(prefix) {
  const p = prefix;
  return `
    <div style="margin-bottom:8px">
      <div style="font-size:10px;font-weight:600;color:var(--hi);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Ajustes básicos</div>
    </div>
    <div class="field"><label>🔆 Brillo</label><div class="slider-wrap"><input type="range" id="${p}cs-fb" min="0" max="5" step="0.05" value="1" oninput="sv(this)"><span class="slider-val">1.00</span><button class="slider-reset" data-action="reset-slider" data-reset-val="1">↺</button></div></div>
    <div class="field"><label>◑ Contraste</label><div class="slider-wrap"><input type="range" id="${p}cs-fc" min="0" max="5" step="0.05" value="1" oninput="sv(this)"><span class="slider-val">1.00</span><button class="slider-reset" data-action="reset-slider" data-reset-val="1">↺</button></div></div>
    <div class="field"><label>🎨 Saturación</label><div class="slider-wrap"><input type="range" id="${p}cs-fs" min="0" max="10" step="0.05" value="1" oninput="sv(this)"><span class="slider-val">1.00</span><button class="slider-reset" data-action="reset-slider" data-reset-val="1">↺</button></div></div>
    <div class="field"><label>👁 Opacidad</label><div class="slider-wrap"><input type="range" id="${p}cs-fo" min="0" max="1" step="0.01" value="1" oninput="sv(this)"><span class="slider-val">1.00</span><button class="slider-reset" data-action="reset-slider" data-reset-val="1">↺</button></div></div>

    <div style="margin:10px 0 8px">
      <div style="font-size:10px;font-weight:600;color:var(--hi);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Efectos de color</div>
    </div>
    <div class="fg2">
      <div class="field"><label>⬜ Grayscale</label><div class="slider-wrap"><input type="range" id="${p}cs-fg" min="0" max="1" step="0.05" value="0" oninput="sv(this)"><span class="slider-val">0.00</span><button class="slider-reset" data-action="reset-slider" data-reset-val="0">↺</button></div></div>
      <div class="field"><label>🟤 Sepia</label><div class="slider-wrap"><input type="range" id="${p}cs-fse" min="0" max="1" step="0.05" value="0" oninput="sv(this)"><span class="slider-val">0.00</span><button class="slider-reset" data-action="reset-slider" data-reset-val="0">↺</button></div></div>
    </div>
    <div class="fg2">
      <div class="field"><label>🔄 Hue rotate</label><div class="slider-wrap"><input type="range" id="${p}cs-fh" min="0" max="360" step="1" value="0" oninput="this.nextElementSibling.textContent=this.value+'°'"><span class="slider-val">0°</span><button class="slider-reset" data-action="reset-slider" data-reset-val="0">↺</button></div></div>
      <div class="field"><label>🔀 Invertir</label><div class="slider-wrap"><input type="range" id="${p}cs-fi" min="0" max="1" step="0.05" value="0" oninput="sv(this)"><span class="slider-val">0.00</span><button class="slider-reset" data-action="reset-slider" data-reset-val="0">↺</button></div></div>
    </div>

    <div style="margin:10px 0 8px">
      <div style="font-size:10px;font-weight:600;color:var(--hi);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Blur</div>
    </div>
    <div class="field"><label>Tipo de blur</label>
      <select id="${p}cs-fbl-type" style="font-family:var(--fm);font-size:11px;background:var(--abg);color:var(--tx);border:1px solid var(--b);border-radius:var(--rad);padding:6px 10px;width:100%;cursor:pointer">
        <option value="">Ninguno</option>
        <option value="vigneta">Vigneta</option>
        <option value="aura">Aura</option>
        <option value="focus">Focus</option>
      </select>
    </div>
    <div class="field"><label>Intensidad</label><div class="slider-wrap"><input type="range" id="${p}cs-fbl" min="0" max="50" step="0.5" value="0" oninput="this.nextElementSibling.textContent=parseFloat(this.value).toFixed(1)+'px'"><span class="slider-val">0.0px</span><button class="slider-reset" data-action="reset-slider" data-reset-val="0">↺</button></div></div>

    <div style="margin:10px 0 8px">
      <div style="font-size:10px;font-weight:600;color:var(--hi);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Drop Shadow</div>
    </div>
    <div class="fg2">
      <div class="field"><label>↔ Offset X</label><div class="slider-wrap"><input type="range" id="${p}cs-ds-x" min="-80" max="80" step="1" value="0" oninput="this.nextElementSibling.textContent=this.value+'px'"><span class="slider-val">0px</span><button class="slider-reset" data-action="reset-slider" data-reset-val="0">↺</button></div></div>
      <div class="field"><label>↕ Offset Y</label><div class="slider-wrap"><input type="range" id="${p}cs-ds-y" min="-80" max="80" step="1" value="0" oninput="this.nextElementSibling.textContent=this.value+'px'"><span class="slider-val">0px</span><button class="slider-reset" data-action="reset-slider" data-reset-val="0">↺</button></div></div>
    </div>
    <div class="fg2">
      <div class="field"><label>💫 Blur</label><div class="slider-wrap"><input type="range" id="${p}cs-ds-bl" min="0" max="100" step="1" value="0" oninput="this.nextElementSibling.textContent=this.value+'px'"><span class="slider-val">0px</span><button class="slider-reset" data-action="reset-slider" data-reset-val="0">↺</button></div></div>
      <div class="field"><label>👁 Opacidad</label><div class="slider-wrap"><input type="range" id="${p}cs-ds-op" min="0" max="1" step="0.05" value="0" oninput="sv(this)"><span class="slider-val">0.00</span><button class="slider-reset" data-action="reset-slider" data-reset-val="0">↺</button></div></div>
    </div>
    <div class="color-wrap"><label>Color shadow</label><div class="color-swatch"><input type="color" id="${p}cs-ds-clr" value="#000000"></div><input type="text" class="color-hex" id="${p}cs-ds-clr-h" value="#000000"></div>`;
}

export function renderGlowHTML(prefix) {
  const p = prefix;
  return `
    <div class="tog-row"><input type="checkbox" class="tog" id="${p}glow-on"><span class="tog-lbl">Activar glow</span></div>
    <div class="field"><label>Tipo de glow</label>
      <select id="${p}glow-type" style="font-family:var(--fm);font-size:11px;background:var(--abg);color:var(--tx);border:1px solid var(--b);border-radius:var(--rad);padding:6px 10px;width:100%;cursor:pointer">
        <option value="active">Pulso suave</option><option value="rgb">Ciclo RGB</option><option value="pulse">Latido</option><option value="breathe">Respiración</option><option value="neon">Neón parpadeo</option>
      </select>
    </div>
    <div class="color-wrap"><label>Color glow</label><div class="color-swatch"><input type="color" id="${p}glow-color" value="#dc2626"></div><input type="text" class="color-hex" id="${p}glow-color-h" value="#dc2626"></div>
    <div class="fg2">
      <div class="field"><label>Velocidad</label><div class="slider-wrap"><input type="range" id="${p}glow-speed" min="0.3" max="10" step="0.1" value="3" oninput="this.nextElementSibling.textContent=parseFloat(this.value).toFixed(1)+'s'"><span class="slider-val">3.0s</span></div></div>
      <div class="field"><label>Intensidad</label><div class="slider-wrap"><input type="range" id="${p}glow-int" min="0" max="20" step="0.1" value="1" oninput="this.nextElementSibling.textContent=parseFloat(this.value).toFixed(1)+'x'"><span class="slider-val">1.0x</span></div></div>
    </div>
    <div class="fg2">
      <div class="field"><label>Blur</label><div class="slider-wrap"><input type="range" id="${p}glow-blur" min="0" max="200" step="1" value="20" oninput="this.nextElementSibling.textContent=this.value+'px'"><span class="slider-val">20px</span></div></div>
      <div class="field"><label>Spread</label><div class="slider-wrap"><input type="range" id="${p}glow-spread" min="0" max="100" step="1" value="0" oninput="this.nextElementSibling.textContent=this.value+'px'"><span class="slider-val">0px</span></div></div>
    </div>
    <div class="fg2">
      <div class="field"><label>Opacidad</label><div class="slider-wrap"><input type="range" id="${p}glow-op" min="0" max="1" step="0.05" value="1" oninput="sv(this)"><span class="slider-val">1.00</span></div></div>
      <div style="display:flex;align-items:end;padding-bottom:6px"><div class="tog-row" style="margin:0"><input type="checkbox" class="tog" id="${p}glow-hover"><span class="tog-lbl">Solo en hover</span></div></div>
    </div>`;
}

export function renderAnimHTML(prefix) {
  const p = prefix;
  return `
    <div class="field"><label>Animación principal</label>
      <select id="${p}anim-type" style="font-family:var(--fm);font-size:11px;background:var(--abg);color:var(--tx);border:1px solid var(--b);border-radius:var(--rad);padding:6px 10px;width:100%;cursor:pointer">
        <option value="">Ninguna</option><option value="flotar">🫧 Flotar</option><option value="pulsar">💓 Pulsar</option><option value="respirar">🫁 Respirar</option><option value="latido">❤️ Latido</option><option value="rebotar">🏀 Rebotar</option><option value="balanceo">⚖️ Balanceo</option><option value="brillo">✨ Brillo</option><option value="cambio-color">🎨 Cambio de color</option><option value="holograma">🌈 Holograma</option><option value="neon-flicker">💡 Neón parpadeo</option><option value="glitch">📺 Glitch</option><option value="drift">🌊 Drift</option><option value="zoom-in">🔍 Zoom in</option><option value="pop">💥 Pop</option><option value="rubber-band">🎗️ Rubber band</option><option value="jello">🍮 Jello</option><option value="wobble">🪱 Wobble</option><option value="shake-x">↔️ Shake X</option><option value="heartbeat">💗 Heartbeat</option><option value="flip">🔄 Flip</option><option value="swing">🎪 Swing</option><option value="tada">🎉 Tada</option><option value="bounce-in">⬆️ Bounce in</option><option value="temblor">🫨 Temblor</option>
      </select>
    </div>
    <div class="fg2">
      <div class="field"><label>Duración</label><div class="slider-wrap"><input type="range" id="${p}anim-dur" min="0.05" max="30" step="0.1" value="2" oninput="this.nextElementSibling.textContent=parseFloat(this.value).toFixed(1)+'s'"><span class="slider-val">2.0s</span></div></div>
      <div class="field"><label>Delay</label><div class="slider-wrap"><input type="range" id="${p}anim-del" min="0" max="30" step="0.1" value="0" oninput="this.nextElementSibling.textContent=parseFloat(this.value).toFixed(1)+'s'"><span class="slider-val">0.0s</span></div></div>
    </div>
    <div class="fg2">
      <div class="field"><label>Easing</label>
        <select id="${p}anim-ease" style="font-family:var(--fm);font-size:11px;background:var(--abg);color:var(--tx);border:1px solid var(--b);border-radius:var(--rad);padding:6px 10px;width:100%;cursor:pointer">
          <option value="ease-in-out">Ease in-out</option><option value="ease">Ease</option><option value="ease-in">Ease in</option><option value="ease-out">Ease out</option><option value="linear">Linear</option><option value="cubic-bezier(0.68,-0.55,0.27,1.55)">Elastic</option><option value="cubic-bezier(0.34,1.56,0.64,1)">Back</option>
        </select>
      </div>
      <div class="field"><label>Dirección</label>
        <select id="${p}anim-dir" style="font-family:var(--fm);font-size:11px;background:var(--abg);color:var(--tx);border:1px solid var(--b);border-radius:var(--rad);padding:6px 10px;width:100%;cursor:pointer">
          <option value="normal">Normal</option><option value="reverse">Reverse</option><option value="alternate">Alternate</option><option value="alternate-reverse">Alt reverse</option>
        </select>
      </div>
    </div>
    <div class="field"><label>Iteraciones</label>
      <select id="${p}anim-iter" style="font-family:var(--fm);font-size:11px;background:var(--abg);color:var(--tx);border:1px solid var(--b);border-radius:var(--rad);padding:6px 10px;width:100%;cursor:pointer">
        <option value="infinite">∞ Infinito</option><option value="1">1 vez</option><option value="2">2 veces</option><option value="3">3 veces</option><option value="5">5 veces</option><option value="10">10 veces</option>
      </select>
    </div>
    <div class="field"><label>⚡ Velocidad</label><div class="slider-wrap"><input type="range" id="${p}anim-int" min="10" max="300" step="5" value="100" oninput="this.nextElementSibling.textContent=this.value+'%'"><span class="slider-val">100%</span></div></div>`;
}

export function renderStyleHTML(prefix) {
  const p = prefix;
  return `
    <div class="color-wrap"><label>Color acento</label><div class="color-swatch"><input type="color" id="${p}accent-color" value="#dc2626"></div><input type="text" class="color-hex" id="${p}accent-color-h" value="#dc2626"></div>
    <div class="fg2">
      <div class="tog-row"><input type="checkbox" class="tog" id="${p}shimmer"><span class="tog-lbl">Shimmer</span></div>
      <div class="field"><label>Border radius</label><div class="slider-wrap"><input type="range" id="${p}cs-radius" min="0" max="80" step="1" value="0" oninput="this.nextElementSibling.textContent=this.value+'px'"><span class="slider-val">0px</span><button class="slider-reset" data-action="reset-slider" data-reset-val="0">↺</button></div></div>
    </div>
    <div class="field"><label>Opacidad tarjeta</label><div class="slider-wrap"><input type="range" id="${p}cs-opacity" min="0.05" max="1" step="0.05" value="1" oninput="sv(this)"><span class="slider-val">1.00</span><button class="slider-reset" data-action="reset-slider" data-reset-val="1">↺</button></div></div>`;
}

export function renderBorderHTML(prefix) {
  const p = prefix;
  return `
    <div class="tog-row"><input type="checkbox" class="tog" id="${p}border-on"><span class="tog-lbl">Activar borde</span></div>
    <div class="fg3">
      <div class="color-wrap"><label>Color</label><div class="color-swatch"><input type="color" id="${p}border-color" value="#dc2626"></div></div>
      <div class="field"><label>Grosor</label><div class="slider-wrap"><input type="range" id="${p}border-width" min="0.5" max="20" step="0.5" value="1" oninput="this.nextElementSibling.textContent=parseFloat(this.value).toFixed(1)+'px'"><span class="slider-val">1.0px</span></div></div>
      <div class="field"><label>Estilo</label>
        <select id="${p}border-style" style="font-family:var(--fm);font-size:11px;background:var(--abg);color:var(--tx);border:1px solid var(--b);border-radius:var(--rad);padding:6px 8px;width:100%;cursor:pointer">
          <option value="solid">── Sólido</option><option value="dashed">- - Dashed</option><option value="dotted">··· Dotted</option><option value="double">══ Double</option>
        </select>
      </div>
    </div>`;
}

export function renderShadowHTML(prefix) {
  const p = prefix;
  return `
    <div class="tog-row"><input type="checkbox" class="tog" id="${p}shadow-on"><span class="tog-lbl">Activar sombra</span></div>
    <div class="fg2">
      <div class="color-wrap"><label>Color</label><div class="color-swatch"><input type="color" id="${p}shadow-color" value="#000000"></div></div>
      <div class="field"><label>Opacidad</label><div class="slider-wrap"><input type="range" id="${p}shadow-op" min="0" max="1" step="0.05" value="0.35" oninput="sv(this)"><span class="slider-val">0.35</span></div></div>
    </div>
    <div class="fg2">
      <div class="field"><label>Offset X</label><div class="slider-wrap"><input type="range" id="${p}shadow-x" min="-80" max="80" step="1" value="0" oninput="this.nextElementSibling.textContent=this.value+'px'"><span class="slider-val">0px</span></div></div>
      <div class="field"><label>Offset Y</label><div class="slider-wrap"><input type="range" id="${p}shadow-y" min="-80" max="80" step="1" value="4" oninput="this.nextElementSibling.textContent=this.value+'px'"><span class="slider-val">4px</span></div></div>
    </div>
    <div class="fg2">
      <div class="field"><label>Blur</label><div class="slider-wrap"><input type="range" id="${p}shadow-blur" min="0" max="150" step="1" value="12" oninput="this.nextElementSibling.textContent=this.value+'px'"><span class="slider-val">12px</span></div></div>
      <div class="field"><label>Spread</label><div class="slider-wrap"><input type="range" id="${p}shadow-spread" min="-50" max="100" step="1" value="0" oninput="this.nextElementSibling.textContent=this.value+'px'"><span class="slider-val">0px</span></div></div>
    </div>
    <div class="tog-row"><input type="checkbox" class="tog" id="${p}shadow-inset"><span class="tog-lbl">Inset (sombra interna)</span></div>`;
}

export function renderHoverHTML(prefix) {
  const p = prefix;
  return `
    <div class="field"><label>Escala hover</label><div class="slider-wrap"><input type="range" id="${p}hov-scale" min="0.5" max="2" step="0.01" value="1" oninput="this.nextElementSibling.textContent=parseFloat(this.value).toFixed(2)+'x'"><span class="slider-val">1.00x</span><button class="slider-reset" data-action="reset-slider" data-reset-val="1">↺</button></div></div>
    <div class="fg2">
      <div class="field"><label>Brillo hover</label><div class="slider-wrap"><input type="range" id="${p}hov-bright" min="0" max="5" step="0.05" value="1" oninput="sv(this)"><span class="slider-val">1.00</span><button class="slider-reset" data-action="reset-slider" data-reset-val="1">↺</button></div></div>
      <div class="field"><label>Saturación hover</label><div class="slider-wrap"><input type="range" id="${p}hov-sat" min="0" max="8" step="0.05" value="1" oninput="sv(this)"><span class="slider-val">1.00</span><button class="slider-reset" data-action="reset-slider" data-reset-val="1">↺</button></div></div>
    </div>
    <div class="fg2">
      <div class="field"><label>Elevación</label><div class="slider-wrap"><input type="range" id="${p}hov-shadow" min="0" max="100" step="1" value="0" oninput="this.nextElementSibling.textContent=this.value+'px'"><span class="slider-val">0px</span><button class="slider-reset" data-action="reset-slider" data-reset-val="0">↺</button></div></div>
      <div class="field"><label>Transición</label><div class="slider-wrap"><input type="range" id="${p}hov-trans" min="0" max="3" step="0.05" value="0.3" oninput="this.nextElementSibling.textContent=parseFloat(this.value).toFixed(2)+'s'"><span class="slider-val">0.30s</span></div></div>
    </div>
    <div class="color-wrap"><label>Borde hover</label><div class="color-swatch"><input type="color" id="${p}hov-border" value="#dc2626"></div></div>
    <div class="tog-row"><input type="checkbox" class="tog" id="${p}hov-glow"><span class="tog-lbl">Intensificar glow en hover</span></div>
    <div class="fg2">
      <div class="field"><label>Blur hover</label><div class="slider-wrap"><input type="range" id="${p}hov-blur" min="0" max="30" step="0.5" value="0" oninput="this.nextElementSibling.textContent=parseFloat(this.value).toFixed(1)+'px'"><span class="slider-val">0.0px</span></div></div>
      <div class="field"><label>Blur hermanos</label><div class="slider-wrap"><input type="range" id="${p}hov-sib-blur" min="0" max="20" step="0.5" value="0" oninput="this.nextElementSibling.textContent=parseFloat(this.value).toFixed(1)+'px'"><span class="slider-val">0.0px</span></div></div>
    </div>
    <div class="fg2">
      <div class="field"><label>Hue rotate hover</label><div class="slider-wrap"><input type="range" id="${p}hov-hue" min="0" max="360" step="1" value="0" oninput="this.nextElementSibling.textContent=this.value+'°'"><span class="slider-val">0°</span></div></div>
      <div class="field"><label>Opacidad hover</label><div class="slider-wrap"><input type="range" id="${p}hov-opacity" min="0" max="1" step="0.05" value="1" oninput="sv(this)"><span class="slider-val">1.00</span></div></div>
    </div>`;
}

export function renderTransformHTML(prefix) {
  const p = prefix;
  return `
    <div class="fg2">
      <div class="field"><label>Rotar</label><div class="slider-wrap"><input type="range" id="${p}tf-rotate" min="-180" max="180" step="1" value="0" oninput="this.nextElementSibling.textContent=this.value+'°'"><span class="slider-val">0°</span></div></div>
      <div class="field"><label>Escalar</label><div class="slider-wrap"><input type="range" id="${p}tf-scale" min="0.1" max="3" step="0.01" value="1" oninput="this.nextElementSibling.textContent=parseFloat(this.value).toFixed(2)+'x'"><span class="slider-val">1.00x</span></div></div>
    </div>
    <div class="fg2">
      <div class="field"><label>Skew X</label><div class="slider-wrap"><input type="range" id="${p}tf-skewX" min="-45" max="45" step="1" value="0" oninput="this.nextElementSibling.textContent=this.value+'°'"><span class="slider-val">0°</span></div></div>
      <div class="field"><label>Skew Y</label><div class="slider-wrap"><input type="range" id="${p}tf-skewY" min="-45" max="45" step="1" value="0" oninput="this.nextElementSibling.textContent=this.value+'°'"><span class="slider-val">0°</span></div></div>
    </div>
    <div class="fg2">
      <div class="field"><label>Translate X</label><div class="slider-wrap"><input type="range" id="${p}tf-x" min="-200" max="200" step="1" value="0" oninput="this.nextElementSibling.textContent=this.value+'px'"><span class="slider-val">0px</span></div></div>
      <div class="field"><label>Translate Y</label><div class="slider-wrap"><input type="range" id="${p}tf-y" min="-200" max="200" step="1" value="0" oninput="this.nextElementSibling.textContent=this.value+'px'"><span class="slider-val">0px</span></div></div>
    </div>`;
}

// ═══ Universal slider → preview bridge ═══
document.addEventListener('input', function(e) {
  if (e.target.type !== 'range' && e.target.type !== 'color') return;
  var id = e.target.id || '';
  if (id.startsWith('f-')) {
    if (typeof window.updateCardPreview === 'function') window.updateCardPreview();
  } else if (id.startsWith('g-')) {
    var section = document.getElementById('sec-card-global');
    if (section) section.dispatchEvent(new Event('input', { bubbles: true }));
  }
});

document.addEventListener('change', function(e) {
  var id = e.target.id || '';
  if (id.startsWith('f-') && (e.target.type === 'checkbox' || e.target.tagName === 'SELECT')) {
    if (typeof window.updateCardPreview === 'function') window.updateCardPreview();
  } else if (id.startsWith('g-') && (e.target.type === 'checkbox' || e.target.tagName === 'SELECT')) {
    var section = document.getElementById('sec-card-global');
    if (section) section.dispatchEvent(new Event('input', { bubbles: true }));
  }
});

// ═══ Effect preset application ═══
// Uses lazy import to avoid circular deps at module load time
import { populateCardStyle, resetCardStyle, syncSliderDisplays } from '../card-style-engine.js';

window.__applyFxPreset = function(presetId, prefix) {
  const preset = EFFECT_PRESETS.find(p => p.id === presetId);
  if (!preset) return;
  const cs = preset.apply();
  resetCardStyle(prefix);
  populateCardStyle(cs, prefix);
  syncSliderDisplays(prefix);
  const galleryEl = document.querySelector(`[data-prefix="${prefix}"]`)?.closest('.fx-gallery');
  if (galleryEl) {
    galleryEl.querySelectorAll('.fx-preset').forEach(el => el.classList.toggle('active', el.dataset.fx === presetId));
  }
  if (prefix === 'f-') {
    if (typeof window.updateCardPreview === 'function') window.updateCardPreview();
  } else {
    const section = document.getElementById('sec-card-global');
    if (section) section.dispatchEvent(new Event('input', { bubbles: true }));
  }
};
