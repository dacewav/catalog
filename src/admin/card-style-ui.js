// ═══ DACEWAV Admin — Card Style Controls Generator ═══
// Generates HTML for card style controls (filters, glow, anim, border, shadow, hover, transform)
// Used in both: beat editor (Extras tab) and global card style section

import { g } from './helpers.js';

// Default cardStyle shape
export const DEFAULT_CARD_STYLE = {
  filter: { brightness: 1, contrast: 1, saturate: 1, grayscale: 0, sepia: 0, hueRotate: 0, blur: 0, invert: 0 },
  glow: { enabled: false, type: 'active', color: '#dc2626', speed: 3, intensity: 1, blur: 20, spread: 0, opacity: 1, hoverOnly: false },
  anim: null,
  style: { accentColor: '#dc2626', shimmer: false, borderRadius: 0, opacity: 1 },
  border: { enabled: false, color: '#dc2626', width: 1, style: 'solid' },
  shadow: { enabled: false, color: '#000000', opacity: 0.35, x: 0, y: 4, blur: 12, spread: 0, inset: false },
  hover: { scale: 1, brightness: 1, saturate: 1, shadowBlur: 0, transition: 0.3, borderColor: '#dc2626', glowIntensify: false, blur: 0, siblingsBlur: 0, hueRotate: 0, opacity: 1, enableAnim: false, animType: '', animDur: 1 },
  transform: { rotate: 0, scale: 1, skewX: 0, skewY: 0, x: 0, y: 0 }
};

// Check if a cardStyle is effectively empty/default (no customizations)
export function isCardStyleEmpty(cs) {
  if (!cs || typeof cs !== 'object') return true;
  const keys = ['filter', 'glow', 'anim', 'style', 'border', 'shadow', 'hover', 'transform'];
  return !keys.some(k => {
    if (!cs[k]) return false;
    if (k === 'anim') return !!cs[k];
    const d = DEFAULT_CARD_STYLE[k];
    if (!d) return !!cs[k];
    return JSON.stringify(cs[k]) !== JSON.stringify(d);
  });
}

// Generate filters section HTML. prefix = field ID prefix (e.g. 'f-' or 'g-')
export function renderFiltersHTML(prefix) {
  const p = prefix;
  return `
    <div class="field"><label>🔆 Brillo</label><div class="slider-wrap"><input type="range" id="${p}cs-fb" min="0" max="5" step="0.05" value="1" oninput="sv(this)"><span class="slider-val">1.00</span><button class="slider-reset" onclick="resetSlider(this.previousElementSibling.previousElementSibling,1)">↺</button></div></div>
    <div class="field"><label>◑ Contraste</label><div class="slider-wrap"><input type="range" id="${p}cs-fc" min="0" max="5" step="0.05" value="1" oninput="sv(this)"><span class="slider-val">1.00</span><button class="slider-reset" onclick="resetSlider(this.previousElementSibling.previousElementSibling,1)">↺</button></div></div>
    <div class="field"><label>🎨 Saturación</label><div class="slider-wrap"><input type="range" id="${p}cs-fs" min="0" max="10" step="0.05" value="1" oninput="sv(this)"><span class="slider-val">1.00</span><button class="slider-reset" onclick="resetSlider(this.previousElementSibling.previousElementSibling,1)">↺</button></div></div>
    <div class="fg2">
      <div class="field"><label>⬜ Grayscale</label><div class="slider-wrap"><input type="range" id="${p}cs-fg" min="0" max="1" step="0.05" value="0" oninput="sv(this)"><span class="slider-val">0.00</span></div></div>
      <div class="field"><label>🟤 Sepia</label><div class="slider-wrap"><input type="range" id="${p}cs-fse" min="0" max="1" step="0.05" value="0" oninput="sv(this)"><span class="slider-val">0.00</span></div></div>
    </div>
    <div class="fg2">
      <div class="field"><label>🔄 Hue rotate</label><div class="slider-wrap"><input type="range" id="${p}cs-fh" min="0" max="360" step="1" value="0" oninput="this.nextElementSibling.textContent=this.value+'°'"><span class="slider-val">0°</span></div></div>
      <div class="field"><label>💥 Blur</label><div class="slider-wrap"><input type="range" id="${p}cs-fbl" min="0" max="60" step="0.5" value="0" oninput="this.nextElementSibling.textContent=parseFloat(this.value).toFixed(1)+'px'"><span class="slider-val">0.0px</span></div></div>
    </div>
    <div class="field"><label>🔀 Invertir</label><div class="slider-wrap"><input type="range" id="${p}cs-fi" min="0" max="1" step="0.05" value="0" oninput="sv(this)"><span class="slider-val">0.00</span></div></div>`;
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
      <div class="field"><label>Border radius</label><div class="slider-wrap"><input type="range" id="${p}cs-radius" min="0" max="80" step="1" value="0" oninput="this.nextElementSibling.textContent=this.value+'px'"><span class="slider-val">0px</span><button class="slider-reset" onclick="resetSlider(this.previousElementSibling.previousElementSibling,0)">↺</button></div></div>
    </div>
    <div class="field"><label>Opacidad tarjeta</label><div class="slider-wrap"><input type="range" id="${p}cs-opacity" min="0.05" max="1" step="0.05" value="1" oninput="sv(this)"><span class="slider-val">1.00</span><button class="slider-reset" onclick="resetSlider(this.previousElementSibling.previousElementSibling,1)">↺</button></div></div>`;
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
    <div class="field"><label>Escala hover</label><div class="slider-wrap"><input type="range" id="${p}hov-scale" min="0.5" max="2" step="0.01" value="1" oninput="this.nextElementSibling.textContent=parseFloat(this.value).toFixed(2)+'x'"><span class="slider-val">1.00x</span><button class="slider-reset" onclick="resetSlider(this.previousElementSibling.previousElementSibling,1)">↺</button></div></div>
    <div class="fg2">
      <div class="field"><label>Brillo hover</label><div class="slider-wrap"><input type="range" id="${p}hov-bright" min="0" max="5" step="0.05" value="1" oninput="sv(this)"><span class="slider-val">1.00</span><button class="slider-reset" onclick="resetSlider(this.previousElementSibling.previousElementSibling,1)">↺</button></div></div>
      <div class="field"><label>Saturación hover</label><div class="slider-wrap"><input type="range" id="${p}hov-sat" min="0" max="8" step="0.05" value="1" oninput="sv(this)"><span class="slider-val">1.00</span><button class="slider-reset" onclick="resetSlider(this.previousElementSibling.previousElementSibling,1)">↺</button></div></div>
    </div>
    <div class="fg2">
      <div class="field"><label>Elevación</label><div class="slider-wrap"><input type="range" id="${p}hov-shadow" min="0" max="100" step="1" value="0" oninput="this.nextElementSibling.textContent=this.value+'px'"><span class="slider-val">0px</span><button class="slider-reset" onclick="resetSlider(this.previousElementSibling.previousElementSibling,0)">↺</button></div></div>
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

// Build cardStyle object from inputs with given prefix
export function buildCardStyleFromPrefix(prefix) {
  const p = prefix;
  const v = id => { const el = g(id); return el ? el.value : ''; };
  const n = id => parseFloat(v(id)) || 0;
  const c = id => { const el = g(id); return el ? el.checked : false; };
  const animType = v(p + 'anim-type');
  return {
    filter: {
      brightness: n(p + 'cs-fb') || 1, contrast: n(p + 'cs-fc') || 1, saturate: n(p + 'cs-fs') || 1,
      grayscale: n(p + 'cs-fg'), sepia: n(p + 'cs-fse'), hueRotate: parseInt(v(p + 'cs-fh')) || 0,
      blur: n(p + 'cs-fbl'), invert: n(p + 'cs-fi')
    },
    glow: {
      enabled: c(p + 'glow-on'), type: v(p + 'glow-type') || 'active', color: v(p + 'glow-color') || '#dc2626',
      speed: n(p + 'glow-speed') || 3, intensity: n(p + 'glow-int') || 1, blur: parseInt(v(p + 'glow-blur')) || 20,
      spread: parseInt(v(p + 'glow-spread')) || 0, opacity: n(p + 'glow-op') || 1, hoverOnly: c(p + 'glow-hover')
    },
    anim: animType ? {
      type: animType, dur: n(p + 'anim-dur') || 2, del: n(p + 'anim-del') || 0,
      easing: v(p + 'anim-ease') || 'ease-in-out', direction: v(p + 'anim-dir') || 'normal',
      iterations: v(p + 'anim-iter') || 'infinite', intensity: parseInt(v(p + 'anim-int')) || 100
    } : null,
    style: {
      accentColor: v(p + 'accent-color') || '#dc2626', shimmer: c(p + 'shimmer'),
      borderRadius: parseInt(v(p + 'cs-radius')) || 0, opacity: n(p + 'cs-opacity') || 1
    },
    border: {
      enabled: c(p + 'border-on'), color: v(p + 'border-color') || '#dc2626',
      width: n(p + 'border-width') || 1, style: v(p + 'border-style') || 'solid'
    },
    shadow: {
      enabled: c(p + 'shadow-on'), color: v(p + 'shadow-color') || '#000000',
      opacity: n(p + 'shadow-op') || 0.35, x: parseInt(v(p + 'shadow-x')) || 0,
      y: parseInt(v(p + 'shadow-y')) || 4, blur: parseInt(v(p + 'shadow-blur')) || 12,
      spread: parseInt(v(p + 'shadow-spread')) || 0, inset: c(p + 'shadow-inset')
    },
    hover: {
      scale: n(p + 'hov-scale') || 1, brightness: n(p + 'hov-bright') || 1, saturate: n(p + 'hov-sat') || 1,
      shadowBlur: parseInt(v(p + 'hov-shadow')) || 0, transition: n(p + 'hov-trans') || 0.3,
      borderColor: v(p + 'hov-border') || '#dc2626', glowIntensify: c(p + 'hov-glow'),
      blur: n(p + 'hov-blur'), siblingsBlur: n(p + 'hov-sib-blur'),
      hueRotate: parseInt(v(p + 'hov-hue')) || 0, opacity: n(p + 'hov-opacity') || 1
    },
    transform: {
      rotate: parseInt(v(p + 'tf-rotate')) || 0, scale: n(p + 'tf-scale') || 1,
      skewX: parseInt(v(p + 'tf-skewX')) || 0, skewY: parseInt(v(p + 'tf-skewY')) || 0,
      x: parseInt(v(p + 'tf-x')) || 0, y: parseInt(v(p + 'tf-y')) || 0
    }
  };
}

// Populate inputs from a cardStyle object with given prefix
export function populateFromCardStyle(cs, prefix) {
  if (!cs) return;
  const p = prefix;
  const s = (id, val) => { const el = g(id); if (el) el.value = val; };
  const ck = (id, val) => { const el = g(id); if (el) el.checked = !!val; };

  const f = cs.filter || {};
  s(p + 'cs-fb', f.brightness != null ? f.brightness : 1);
  s(p + 'cs-fc', f.contrast != null ? f.contrast : 1);
  s(p + 'cs-fs', f.saturate != null ? f.saturate : 1);
  s(p + 'cs-fg', f.grayscale || 0); s(p + 'cs-fse', f.sepia || 0);
  s(p + 'cs-fh', f.hueRotate || 0); s(p + 'cs-fbl', f.blur || 0); s(p + 'cs-fi', f.invert || 0);

  const gc = cs.glow || {};
  ck(p + 'glow-on', gc.enabled);
  s(p + 'glow-type', gc.type || 'active');
  s(p + 'glow-color', gc.color || '#dc2626'); s(p + 'glow-color-h', gc.color || '#dc2626');
  s(p + 'glow-speed', gc.speed || 3); s(p + 'glow-int', gc.intensity != null ? gc.intensity : 1);
  s(p + 'glow-blur', gc.blur != null ? gc.blur : 20); s(p + 'glow-spread', gc.spread || 0);
  s(p + 'glow-op', gc.opacity != null ? gc.opacity : 1); ck(p + 'glow-hover', gc.hoverOnly);

  const a = cs.anim || {};
  s(p + 'anim-type', a.type || ''); s(p + 'anim-dur', a.dur || 2); s(p + 'anim-del', a.del || 0);
  s(p + 'anim-ease', a.easing || 'ease-in-out'); s(p + 'anim-dir', a.direction || 'normal');
  s(p + 'anim-iter', a.iterations || 'infinite'); s(p + 'anim-int', a.intensity != null ? a.intensity : 100);

  const st = cs.style || {};
  s(p + 'accent-color', st.accentColor || '#dc2626'); s(p + 'accent-color-h', st.accentColor || '#dc2626');
  ck(p + 'shimmer', st.shimmer); s(p + 'cs-radius', st.borderRadius || 0);
  s(p + 'cs-opacity', st.opacity != null ? st.opacity : 1);

  const bd = cs.border || {};
  ck(p + 'border-on', bd.enabled); s(p + 'border-color', bd.color || '#dc2626');
  s(p + 'border-width', bd.width || 1); s(p + 'border-style', bd.style || 'solid');

  const sh = cs.shadow || {};
  ck(p + 'shadow-on', sh.enabled); s(p + 'shadow-color', sh.color || '#000000');
  s(p + 'shadow-op', sh.opacity != null ? sh.opacity : 0.35);
  s(p + 'shadow-x', sh.x || 0); s(p + 'shadow-y', sh.y != null ? sh.y : 4);
  s(p + 'shadow-blur', sh.blur != null ? sh.blur : 12); s(p + 'shadow-spread', sh.spread || 0);
  ck(p + 'shadow-inset', sh.inset);

  const hv = cs.hover || {};
  s(p + 'hov-scale', hv.scale || 1); s(p + 'hov-bright', hv.brightness != null ? hv.brightness : 1);
  s(p + 'hov-sat', hv.saturate != null ? hv.saturate : 1); s(p + 'hov-shadow', hv.shadowBlur || 0);
  s(p + 'hov-trans', hv.transition != null ? hv.transition : 0.3);
  s(p + 'hov-border', hv.borderColor || '#dc2626'); ck(p + 'hov-glow', hv.glowIntensify);
  s(p + 'hov-blur', hv.blur || 0); s(p + 'hov-sib-blur', hv.siblingsBlur || 0);
  s(p + 'hov-hue', hv.hueRotate || 0); s(p + 'hov-opacity', hv.opacity != null ? hv.opacity : 1);

  const tf = cs.transform || {};
  s(p + 'tf-rotate', tf.rotate || 0); s(p + 'tf-scale', tf.scale || 1);
  s(p + 'tf-skewX', tf.skewX || 0); s(p + 'tf-skewY', tf.skewY || 0);
  s(p + 'tf-x', tf.x || 0); s(p + 'tf-y', tf.y || 0);
}

// Reset all inputs to defaults with given prefix
export function resetCardStyleInputs(prefix) {
  populateFromCardStyle(DEFAULT_CARD_STYLE, prefix);
  const s = (id, v) => { const el = g(id); if (el) el.value = v; };
  s(prefix + 'anim-type', '');
}

// Sync slider displays for a prefix
export function syncSliderDisplays(prefix) {
  const ids = [
    'cs-fb','cs-fc','cs-fs','cs-fg','cs-fse','cs-fi','cs-radius','cs-opacity',
    'glow-speed','glow-int','glow-blur','glow-spread','glow-op',
    'anim-dur','anim-del','anim-int',
    'border-width','shadow-op','shadow-x','shadow-y','shadow-blur','shadow-spread',
    'hov-scale','hov-bright','hov-sat','hov-shadow','hov-trans','hov-blur','hov-sib-blur','hov-hue','hov-opacity',
    'tf-rotate','tf-scale','tf-skewX','tf-skewY','tf-x','tf-y'
  ];
  ids.forEach(id => {
    const el = g(prefix + id);
    if (!el) return;
    const sib = el.nextElementSibling;
    if (!sib) return;
    const v = parseFloat(el.value);
    if (id.includes('dur') || id.includes('del') || id.includes('speed')) sib.textContent = v.toFixed(1) + 's';
    else if (id.includes('blur') || id.includes('spread') || id.includes('shadow') || id.includes('width') || id.includes('x') || id.includes('y') || id.includes('radius')) sib.textContent = v + (id.includes('blur') || id.includes('spread') ? 'px' : id.includes('radius') ? 'px' : 'px');
    else if (id.includes('rotate') || id.includes('skew') || id.includes('hue') || id.includes('fh')) sib.textContent = v.toFixed(1) + '°';
    else if (id.includes('scale')) sib.textContent = v.toFixed(2) + 'x';
    else if (id.includes('trans')) sib.textContent = v.toFixed(2) + 's';
    else if (id.includes('int') && !id.includes('glow')) sib.textContent = v + '%';
    else sib.textContent = v.toFixed(2);
  });
}
