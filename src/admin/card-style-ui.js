// ═══ DACEWAV Admin — Card Style Controls Generator ═══
// Generates HTML for card style controls (filters, glow, anim, border, shadow, hover, transform)
// Used in both: beat editor (Extras tab) and global card style section

import { g } from './helpers.js';

// ═══ EFFECT PRESETS GALLERY ═══
// Photoshop-style gallery of visual effect presets.
// Each preset is a complete visual style: filters + glow + anim + shadow.
// Clicking a preset applies ALL its values at once. User can then fine-tune with sliders.
export const EFFECT_PRESETS = [
  {
    id: 'none', name: 'Original', icon: '⊘', cat: 'basic',
    desc: 'Sin efectos — tarjeta limpia',
    preview: { bg: 'linear-gradient(135deg, #1a1a2e, #16213e)', filter: 'none' },
    apply: () => ({
      filter: { brightness: 1, contrast: 1, saturate: 1, grayscale: 0, sepia: 0, hueRotate: 0, blur: 0, invert: 0, opacity: 1, dropShadowX: 0, dropShadowY: 0, dropShadowBlur: 0, dropShadowColor: '#000000', dropShadowOpacity: 0 },
      glow: { enabled: false, type: 'active', color: '#dc2626', speed: 3, intensity: 1, blur: 20, spread: 0, opacity: 1, hoverOnly: false },
      anim: null, style: { accentColor: '#dc2626', shimmer: false, borderRadius: 0, opacity: 1 },
      border: { enabled: false, color: '#dc2626', width: 1, style: 'solid' },
      shadow: { enabled: false, color: '#000000', opacity: 0.35, x: 0, y: 4, blur: 12, spread: 0, inset: false },
      hover: { scale: 1, brightness: 1, saturate: 1, shadowBlur: 0, transition: 0.3, borderColor: '#dc2626', glowIntensify: false, blur: 0, siblingsBlur: 0, hueRotate: 0, opacity: 1, enableAnim: false, animType: '', animDur: 1 },
      transform: { rotate: 0, scale: 1, skewX: 0, skewY: 0, x: 0, y: 0 }
    })
  },
  {
    id: 'noir', name: 'Noir', icon: '🎬', cat: 'color',
    desc: 'Alto contraste B&W, estilo cine negro',
    preview: { bg: 'linear-gradient(135deg, #1a1a1a, #333)', filter: 'grayscale(1) contrast(1.5) brightness(0.9)' },
    apply: () => ({
      filter: { brightness: 0.9, contrast: 1.5, saturate: 0, grayscale: 1, sepia: 0, hueRotate: 0, blur: 0, invert: 0, opacity: 1, dropShadowX: 0, dropShadowY: 8, dropShadowBlur: 20, dropShadowColor: '#000000', dropShadowOpacity: 0.6 },
      glow: { enabled: false, type: 'active', color: '#ffffff', speed: 3, intensity: 1, blur: 20, spread: 0, opacity: 1, hoverOnly: false },
      anim: null, style: { accentColor: '#dc2626', shimmer: false, borderRadius: 0, opacity: 1 },
      border: { enabled: false, color: '#dc2626', width: 1, style: 'solid' },
      shadow: { enabled: true, color: '#000000', opacity: 0.7, x: 0, y: 8, blur: 20, spread: 0, inset: false },
      hover: { scale: 1.03, brightness: 1.2, saturate: 0, shadowBlur: 30, transition: 0.3, borderColor: '#ffffff', glowIntensify: false, blur: 0, siblingsBlur: 3, hueRotate: 0, opacity: 1, enableAnim: false, animType: '', animDur: 1 },
      transform: { rotate: 0, scale: 1, skewX: 0, skewY: 0, x: 0, y: 0 }
    })
  },
  {
    id: 'vintage', name: 'Vintage', icon: '📷', cat: 'color',
    desc: 'Sepia cálido con sombras suaves',
    preview: { bg: 'linear-gradient(135deg, #8B4513, #D2691E)', filter: 'sepia(0.8) contrast(1.1) brightness(0.95)' },
    apply: () => ({
      filter: { brightness: 0.95, contrast: 1.1, saturate: 0.8, grayscale: 0, sepia: 0.8, hueRotate: 0, blur: 0, invert: 0, opacity: 1, dropShadowX: 0, dropShadowY: 4, dropShadowBlur: 15, dropShadowColor: '#8B4513', dropShadowOpacity: 0.4 },
      glow: { enabled: false, type: 'active', color: '#D2691E', speed: 3, intensity: 1, blur: 20, spread: 0, opacity: 1, hoverOnly: false },
      anim: null, style: { accentColor: '#D2691E', shimmer: false, borderRadius: 8, opacity: 1 },
      border: { enabled: true, color: '#8B4513', width: 1, style: 'solid' },
      shadow: { enabled: true, color: '#8B4513', opacity: 0.4, x: 0, y: 6, blur: 15, spread: 0, inset: false },
      hover: { scale: 1.02, brightness: 1.1, saturate: 1, shadowBlur: 20, transition: 0.4, borderColor: '#D2691E', glowIntensify: false, blur: 0, siblingsBlur: 2, hueRotate: 0, opacity: 1, enableAnim: false, animType: '', animDur: 1 },
      transform: { rotate: 0, scale: 1, skewX: 0, skewY: 0, x: 0, y: 0 }
    })
  },
  {
    id: 'neon-glow', name: 'Neón', icon: '💡', cat: 'glow',
    desc: 'Resplandor neón pulsante, colores vivos',
    preview: { bg: 'linear-gradient(135deg, #0f0f23, #1a0a2e)', filter: 'brightness(1.1) saturate(1.5)' },
    apply: () => ({
      filter: { brightness: 1.1, contrast: 1.2, saturate: 1.5, grayscale: 0, sepia: 0, hueRotate: 0, blur: 0, invert: 0, opacity: 1, dropShadowX: 0, dropShadowY: 0, dropShadowBlur: 0, dropShadowColor: '#000000', dropShadowOpacity: 0 },
      glow: { enabled: true, type: 'active', color: '#ff00ff', speed: 2, intensity: 1.5, blur: 30, spread: 0, opacity: 0.8, hoverOnly: false },
      anim: null, style: { accentColor: '#ff00ff', shimmer: true, borderRadius: 4, opacity: 1 },
      border: { enabled: true, color: '#ff00ff', width: 1, style: 'solid' },
      shadow: { enabled: false, color: '#ff00ff', opacity: 0.35, x: 0, y: 4, blur: 12, spread: 0, inset: false },
      hover: { scale: 1.04, brightness: 1.3, saturate: 1.8, shadowBlur: 0, transition: 0.25, borderColor: '#00ffff', glowIntensify: true, blur: 0, siblingsBlur: 4, hueRotate: 0, opacity: 1, enableAnim: false, animType: '', animDur: 1 },
      transform: { rotate: 0, scale: 1, skewX: 0, skewY: 0, x: 0, y: 0 }
    })
  },
  {
    id: 'cyberpunk', name: 'Cyberpunk', icon: '🤖', cat: 'glow',
    desc: 'Magenta/cyan, alto contraste, futurista',
    preview: { bg: 'linear-gradient(135deg, #ff006e, #00f5d4)', filter: 'contrast(1.4) saturate(2)' },
    apply: () => ({
      filter: { brightness: 1.15, contrast: 1.4, saturate: 2, grayscale: 0, sepia: 0, hueRotate: 0, blur: 0, invert: 0, opacity: 1, dropShadowX: -3, dropShadowY: 3, dropShadowBlur: 12, dropShadowColor: '#ff006e', dropShadowOpacity: 0.5 },
      glow: { enabled: true, type: 'rgb', color: '#ff006e', speed: 4, intensity: 1.2, blur: 25, spread: 0, opacity: 0.7, hoverOnly: false },
      anim: null, style: { accentColor: '#ff006e', shimmer: false, borderRadius: 2, opacity: 1 },
      border: { enabled: true, color: '#00f5d4', width: 1, style: 'solid' },
      shadow: { enabled: true, color: '#ff006e', opacity: 0.3, x: -4, y: 4, blur: 15, spread: 0, inset: false },
      hover: { scale: 1.05, brightness: 1.2, saturate: 2.5, shadowBlur: 0, transition: 0.2, borderColor: '#ff006e', glowIntensify: true, blur: 0, siblingsBlur: 6, hueRotate: 0, opacity: 1, enableAnim: false, animType: '', animDur: 1 },
      transform: { rotate: 0, scale: 1, skewX: 0, skewY: 0, x: 0, y: 0 }
    })
  },
  {
    id: 'hologram', name: 'Holograma', icon: '🌈', cat: 'anim',
    desc: 'Ciclo de tono + brillo, efecto iridiscente',
    preview: { bg: 'linear-gradient(135deg, #ff0080, #00ff80, #0080ff)', filter: 'hue-rotate(90deg) brightness(1.1)' },
    apply: () => ({
      filter: { brightness: 1.05, contrast: 1.1, saturate: 1.3, grayscale: 0, sepia: 0, hueRotate: 0, blur: 0, invert: 0, opacity: 1, dropShadowX: 0, dropShadowY: 0, dropShadowBlur: 0, dropShadowColor: '#000000', dropShadowOpacity: 0 },
      glow: { enabled: true, type: 'rgb', color: '#ff0080', speed: 5, intensity: 1, blur: 20, spread: 0, opacity: 0.6, hoverOnly: false },
      anim: { type: 'holograma', dur: 4, del: 0, easing: 'ease-in-out', direction: 'normal', iterations: 'infinite', intensity: 100, hueStart: 0, hueEnd: 360, holoBrightMin: 0.9, holoBrightMax: 1.4, holoSatMin: 0.8, holoSatMax: 2, holoGlow: 0, holoBlur: 0 },
      style: { accentColor: '#ff0080', shimmer: true, borderRadius: 8, opacity: 1 },
      border: { enabled: false, color: '#dc2626', width: 1, style: 'solid' },
      shadow: { enabled: false, color: '#000000', opacity: 0.35, x: 0, y: 4, blur: 12, spread: 0, inset: false },
      hover: { scale: 1.05, brightness: 1.3, saturate: 1.5, shadowBlur: 0, transition: 0.3, borderColor: '#ff0080', glowIntensify: true, blur: 0, siblingsBlur: 5, hueRotate: 30, opacity: 1, enableAnim: false, animType: '', animDur: 1 },
      transform: { rotate: 0, scale: 1, skewX: 0, skewY: 0, x: 0, y: 0 }
    })
  },
  {
    id: 'glitch', name: 'Glitch', icon: '📺', cat: 'anim',
    desc: 'Distorsión digital, chromatic aberration',
    preview: { bg: 'linear-gradient(135deg, #ff0040, #0040ff)', filter: 'saturate(2) contrast(1.3)' },
    apply: () => ({
      filter: { brightness: 1.1, contrast: 1.3, saturate: 1.8, grayscale: 0, sepia: 0, hueRotate: 0, blur: 0, invert: 0, opacity: 1, dropShadowX: -4, dropShadowY: 0, dropShadowBlur: 0, dropShadowColor: '#ff0040', dropShadowOpacity: 0.7 },
      glow: { enabled: false, type: 'active', color: '#ff0040', speed: 3, intensity: 1, blur: 20, spread: 0, opacity: 1, hoverOnly: false },
      anim: { type: 'glitch', dur: 0.3, del: 0, easing: 'steps(2)', direction: 'normal', iterations: 'infinite', intensity: 100, glitchX: 3, glitchY: 2, glitchRot: 0.5 },
      style: { accentColor: '#ff0040', shimmer: false, borderRadius: 0, opacity: 1 },
      border: { enabled: false, color: '#dc2626', width: 1, style: 'solid' },
      shadow: { enabled: false, color: '#000000', opacity: 0.35, x: 0, y: 4, blur: 12, spread: 0, inset: false },
      hover: { scale: 1, brightness: 1.4, saturate: 2, shadowBlur: 0, transition: 0.1, borderColor: '#ff0040', glowIntensify: false, blur: 0, siblingsBlur: 0, hueRotate: 0, opacity: 1, enableAnim: false, animType: '', animDur: 1 },
      transform: { rotate: 0, scale: 1, skewX: 0, skewY: 0, x: 0, y: 0 }
    })
  },
  {
    id: 'ghost', name: 'Fantasma', icon: '👻', cat: 'anim',
    desc: 'Opacidad baja + blur, efecto etéreo',
    preview: { bg: 'linear-gradient(135deg, #2d2d44, #4a4a6a)', filter: 'blur(1px) opacity(0.6)' },
    apply: () => ({
      filter: { brightness: 1, contrast: 0.9, saturate: 0.6, grayscale: 0.3, sepia: 0, hueRotate: 0, blur: 2, invert: 0, opacity: 0.7, dropShadowX: 0, dropShadowY: 0, dropShadowBlur: 25, dropShadowColor: '#6366f1', dropShadowOpacity: 0.3 },
      glow: { enabled: true, type: 'breathe', color: '#6366f1', speed: 5, intensity: 0.8, blur: 30, spread: 0, opacity: 0.4, hoverOnly: false },
      anim: { type: 'respirar', dur: 5, del: 0, easing: 'ease-in-out', direction: 'normal', iterations: 'infinite', intensity: 80 },
      style: { accentColor: '#6366f1', shimmer: false, borderRadius: 12, opacity: 0.7 },
      border: { enabled: true, color: '#6366f1', width: 1, style: 'solid' },
      shadow: { enabled: false, color: '#6366f1', opacity: 0.35, x: 0, y: 4, blur: 12, spread: 0, inset: false },
      hover: { scale: 1.02, brightness: 1.3, saturate: 1, shadowBlur: 0, transition: 0.5, borderColor: '#a78bfa', glowIntensify: true, blur: 0, siblingsBlur: 4, hueRotate: 0, opacity: 1, enableAnim: false, animType: '', animDur: 1 },
      transform: { rotate: 0, scale: 1, skewX: 0, skewY: 0, x: 0, y: 0 }
    })
  },
  {
    id: 'ember', name: 'Brasa', icon: '🔥', cat: 'glow',
    desc: 'Glow cálido pulsante, tonos fuego',
    preview: { bg: 'linear-gradient(135deg, #8B0000, #FF4500)', filter: 'brightness(1.1) saturate(1.3)' },
    apply: () => ({
      filter: { brightness: 1.05, contrast: 1.15, saturate: 1.3, grayscale: 0, sepia: 0.1, hueRotate: 0, blur: 0, invert: 0, opacity: 1, dropShadowX: 0, dropShadowY: 4, dropShadowBlur: 15, dropShadowColor: '#FF4500', dropShadowOpacity: 0.5 },
      glow: { enabled: true, type: 'pulse', color: '#FF4500', speed: 1.5, intensity: 1.3, blur: 25, spread: 5, opacity: 0.7, hoverOnly: false },
      anim: null, style: { accentColor: '#FF4500', shimmer: false, borderRadius: 4, opacity: 1 },
      border: { enabled: false, color: '#FF4500', width: 1, style: 'solid' },
      shadow: { enabled: true, color: '#8B0000', opacity: 0.5, x: 0, y: 6, blur: 18, spread: 0, inset: false },
      hover: { scale: 1.04, brightness: 1.3, saturate: 1.5, shadowBlur: 0, transition: 0.25, borderColor: '#FF6347', glowIntensify: true, blur: 0, siblingsBlur: 5, hueRotate: 0, opacity: 1, enableAnim: false, animType: '', animDur: 1 },
      transform: { rotate: 0, scale: 1, skewX: 0, skewY: 0, x: 0, y: 0 }
    })
  },
  {
    id: 'frost', name: 'Escarcha', icon: '❄️', cat: 'color',
    desc: 'Tinte azul frío + brillo suave',
    preview: { bg: 'linear-gradient(135deg, #0c4a6e, #38bdf8)', filter: 'brightness(1.1) saturate(0.8) hue-rotate(-10deg)' },
    apply: () => ({
      filter: { brightness: 1.1, contrast: 1.05, saturate: 0.8, grayscale: 0, sepia: 0, hueRotate: -10, blur: 0, invert: 0, opacity: 1, dropShadowX: 0, dropShadowY: 0, dropShadowBlur: 20, dropShadowColor: '#38bdf8', dropShadowOpacity: 0.3 },
      glow: { enabled: true, type: 'breathe', color: '#38bdf8', speed: 4, intensity: 0.9, blur: 25, spread: 0, opacity: 0.5, hoverOnly: true },
      anim: null, style: { accentColor: '#38bdf8', shimmer: true, borderRadius: 10, opacity: 1 },
      border: { enabled: true, color: '#38bdf8', width: 1, style: 'solid' },
      shadow: { enabled: true, color: '#0c4a6e', opacity: 0.4, x: 0, y: 6, blur: 16, spread: 0, inset: false },
      hover: { scale: 1.03, brightness: 1.2, saturate: 1, shadowBlur: 0, transition: 0.35, borderColor: '#7dd3fc', glowIntensify: false, blur: 0, siblingsBlur: 3, hueRotate: 0, opacity: 1, enableAnim: false, animType: '', animDur: 1 },
      transform: { rotate: 0, scale: 1, skewX: 0, skewY: 0, x: 0, y: 0 }
    })
  },
  {
    id: 'film', name: 'Película', icon: '🎞️', cat: 'color',
    desc: 'Desaturado + grano, look cinematográfico',
    preview: { bg: 'linear-gradient(135deg, #3d3d3d, #5a5a5a)', filter: 'grayscale(0.4) contrast(1.15) sepia(0.15)' },
    apply: () => ({
      filter: { brightness: 0.95, contrast: 1.15, saturate: 0.7, grayscale: 0.4, sepia: 0.15, hueRotate: 0, blur: 0, invert: 0, opacity: 1, dropShadowX: 0, dropShadowY: 6, dropShadowBlur: 18, dropShadowColor: '#000000', dropShadowOpacity: 0.5 },
      glow: { enabled: false, type: 'active', color: '#dc2626', speed: 3, intensity: 1, blur: 20, spread: 0, opacity: 1, hoverOnly: false },
      anim: null, style: { accentColor: '#dc2626', shimmer: false, borderRadius: 2, opacity: 1 },
      border: { enabled: false, color: '#dc2626', width: 1, style: 'solid' },
      shadow: { enabled: true, color: '#000000', opacity: 0.5, x: 0, y: 6, blur: 18, spread: 0, inset: false },
      hover: { scale: 1.02, brightness: 1.15, saturate: 0.9, shadowBlur: 25, transition: 0.4, borderColor: '#888888', glowIntensify: false, blur: 0, siblingsBlur: 2, hueRotate: 0, opacity: 1, enableAnim: false, animType: '', animDur: 1 },
      transform: { rotate: 0, scale: 1, skewX: 0, skewY: 0, x: 0, y: 0 }
    })
  },
  {
    id: 'pop', name: 'Pop Art', icon: '🎨', cat: 'color',
    desc: 'Saturación extrema, colores vibrantes',
    preview: { bg: 'linear-gradient(135deg, #ff006e, #8338ec, #3a86ff)', filter: 'saturate(3) contrast(1.3) brightness(1.1)' },
    apply: () => ({
      filter: { brightness: 1.1, contrast: 1.3, saturate: 3, grayscale: 0, sepia: 0, hueRotate: 0, blur: 0, invert: 0, opacity: 1, dropShadowX: 3, dropShadowY: 3, dropShadowBlur: 0, dropShadowColor: '#000000', dropShadowOpacity: 0.3 },
      glow: { enabled: false, type: 'active', color: '#ff006e', speed: 3, intensity: 1, blur: 20, spread: 0, opacity: 1, hoverOnly: false },
      anim: null, style: { accentColor: '#ff006e', shimmer: false, borderRadius: 0, opacity: 1 },
      border: { enabled: true, color: '#000000', width: 3, style: 'solid' },
      shadow: { enabled: true, color: '#000000', opacity: 0.3, x: 4, y: 4, blur: 0, spread: 0, inset: false },
      hover: { scale: 1.06, brightness: 1.2, saturate: 3.5, shadowBlur: 0, transition: 0.15, borderColor: '#ff006e', glowIntensify: false, blur: 0, siblingsBlur: 3, hueRotate: 20, opacity: 1, enableAnim: false, animType: '', animDur: 1 },
      transform: { rotate: 0, scale: 1, skewX: 0, skewY: 0, x: 0, y: 0 }
    })
  },
  {
    id: 'float', name: 'Flotante', icon: '🫧', cat: 'anim',
    desc: 'Flotación suave, animación sutil',
    preview: { bg: 'linear-gradient(135deg, #1e1b4b, #312e81)', filter: 'brightness(1.05)' },
    apply: () => ({
      filter: { brightness: 1.05, contrast: 1, saturate: 1, grayscale: 0, sepia: 0, hueRotate: 0, blur: 0, invert: 0, opacity: 1, dropShadowX: 0, dropShadowY: 8, dropShadowBlur: 20, dropShadowColor: '#312e81', dropShadowOpacity: 0.4 },
      glow: { enabled: false, type: 'active', color: '#dc2626', speed: 3, intensity: 1, blur: 20, spread: 0, opacity: 1, hoverOnly: false },
      anim: { type: 'flotar', dur: 3, del: 0, easing: 'ease-in-out', direction: 'alternate', iterations: 'infinite', intensity: 100 },
      style: { accentColor: '#6366f1', shimmer: false, borderRadius: 12, opacity: 1 },
      border: { enabled: false, color: '#dc2626', width: 1, style: 'solid' },
      shadow: { enabled: true, color: '#312e81', opacity: 0.3, x: 0, y: 10, blur: 25, spread: 0, inset: false },
      hover: { scale: 1.05, brightness: 1.1, saturate: 1, shadowBlur: 35, transition: 0.35, borderColor: '#6366f1', glowIntensify: false, blur: 0, siblingsBlur: 3, hueRotate: 0, opacity: 1, enableAnim: false, animType: '', animDur: 1 },
      transform: { rotate: 0, scale: 1, skewX: 0, skewY: 0, x: 0, y: 0 }
    })
  },
  {
    id: 'underwater', name: 'Submarino', icon: '🌊', cat: 'anim',
    desc: 'Azul profundo, onda lenta, ambiente oceánico',
    preview: { bg: 'linear-gradient(135deg, #042f2e, #0d9488)', filter: 'hue-rotate(-5deg) brightness(0.9) saturate(1.2)' },
    apply: () => ({
      filter: { brightness: 0.9, contrast: 1.1, saturate: 1.2, grayscale: 0, sepia: 0, hueRotate: -5, blur: 1, invert: 0, opacity: 0.9, dropShadowX: 0, dropShadowY: 0, dropShadowBlur: 30, dropShadowColor: '#0d9488', dropShadowOpacity: 0.3 },
      glow: { enabled: true, type: 'breathe', color: '#0d9488', speed: 6, intensity: 0.7, blur: 35, spread: 0, opacity: 0.4, hoverOnly: false },
      anim: { type: 'respirar', dur: 6, del: 0, easing: 'ease-in-out', direction: 'normal', iterations: 'infinite', intensity: 70 },
      style: { accentColor: '#0d9488', shimmer: false, borderRadius: 16, opacity: 0.9 },
      border: { enabled: true, color: '#0d9488', width: 1, style: 'solid' },
      shadow: { enabled: true, color: '#042f2e', opacity: 0.5, x: 0, y: 8, blur: 25, spread: 0, inset: false },
      hover: { scale: 1.02, brightness: 1.2, saturate: 1.5, shadowBlur: 0, transition: 0.5, borderColor: '#2dd4bf', glowIntensify: true, blur: 0, siblingsBlur: 6, hueRotate: 10, opacity: 1, enableAnim: false, animType: '', animDur: 1 },
      transform: { rotate: 0, scale: 1, skewX: 0, skewY: 0, x: 0, y: 0 }
    })
  }
];

// Render effect gallery HTML for a given prefix
export function renderEffectGalleryHTML(prefix) {
  const cats = { basic: 'Básico', color: 'Color', glow: 'Glow', anim: 'Animación' };
  let html = '<div class="fx-gallery">';
  for (const [catKey, catName] of Object.entries(cats)) {
    const presets = EFFECT_PRESETS.filter(p => p.cat === catKey);
    if (!presets.length) continue;
    html += '<div class="fx-cat-row">';
    presets.forEach(p => {
      html += `<div class="fx-preset" data-fx="${p.id}" data-prefix="${prefix}" onclick="window.__applyFxPreset && window.__applyFxPreset('${p.id}','${prefix}')" title="${p.desc}">
        <div class="fx-pv" style="background:${p.preview.bg};filter:${p.preview.filter}"></div>
        <div class="fx-preset-name">${p.name}</div>
      </div>`;
    });
    html += '</div>';
  }
  html += '</div>';
  return html;
}

// Default cardStyle shape
export const DEFAULT_CARD_STYLE = {
  filter: { brightness: 1, contrast: 1, saturate: 1, grayscale: 0, sepia: 0, hueRotate: 0, blur: 0, invert: 0, opacity: 1, dropShadowX: 0, dropShadowY: 0, dropShadowBlur: 0, dropShadowColor: '#000000', dropShadowOpacity: 0 },
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
    <div style="margin-bottom:8px">
      <div style="font-size:10px;font-weight:600;color:var(--hi);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Ajustes básicos</div>
    </div>
    <div class="field"><label>🔆 Brillo</label><div class="slider-wrap"><input type="range" id="${p}cs-fb" min="0" max="5" step="0.05" value="1" oninput="sv(this)"><span class="slider-val">1.00</span><button class="slider-reset" onclick="resetSlider(this.previousElementSibling.previousElementSibling,1)">↺</button></div></div>
    <div class="field"><label>◑ Contraste</label><div class="slider-wrap"><input type="range" id="${p}cs-fc" min="0" max="5" step="0.05" value="1" oninput="sv(this)"><span class="slider-val">1.00</span><button class="slider-reset" onclick="resetSlider(this.previousElementSibling.previousElementSibling,1)">↺</button></div></div>
    <div class="field"><label>🎨 Saturación</label><div class="slider-wrap"><input type="range" id="${p}cs-fs" min="0" max="10" step="0.05" value="1" oninput="sv(this)"><span class="slider-val">1.00</span><button class="slider-reset" onclick="resetSlider(this.previousElementSibling.previousElementSibling,1)">↺</button></div></div>
    <div class="field"><label>👁 Opacidad</label><div class="slider-wrap"><input type="range" id="${p}cs-fo" min="0" max="1" step="0.01" value="1" oninput="sv(this)"><span class="slider-val">1.00</span><button class="slider-reset" onclick="resetSlider(this.previousElementSibling.previousElementSibling,1)">↺</button></div></div>

    <div style="margin:10px 0 8px">
      <div style="font-size:10px;font-weight:600;color:var(--hi);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Efectos de color</div>
    </div>
    <div class="fg2">
      <div class="field"><label>⬜ Grayscale</label><div class="slider-wrap"><input type="range" id="${p}cs-fg" min="0" max="1" step="0.05" value="0" oninput="sv(this)"><span class="slider-val">0.00</span><button class="slider-reset" onclick="resetSlider(this.previousElementSibling.previousElementSibling,0)">↺</button></div></div>
      <div class="field"><label>🟤 Sepia</label><div class="slider-wrap"><input type="range" id="${p}cs-fse" min="0" max="1" step="0.05" value="0" oninput="sv(this)"><span class="slider-val">0.00</span><button class="slider-reset" onclick="resetSlider(this.previousElementSibling.previousElementSibling,0)">↺</button></div></div>
    </div>
    <div class="fg2">
      <div class="field"><label>🔄 Hue rotate</label><div class="slider-wrap"><input type="range" id="${p}cs-fh" min="0" max="360" step="1" value="0" oninput="this.nextElementSibling.textContent=this.value+'°'"><span class="slider-val">0°</span><button class="slider-reset" onclick="resetSlider(this.previousElementSibling.previousElementSibling,0)">↺</button></div></div>
      <div class="field"><label>🔀 Invertir</label><div class="slider-wrap"><input type="range" id="${p}cs-fi" min="0" max="1" step="0.05" value="0" oninput="sv(this)"><span class="slider-val">0.00</span><button class="slider-reset" onclick="resetSlider(this.previousElementSibling.previousElementSibling,0)">↺</button></div></div>
    </div>

    <div style="margin:10px 0 8px">
      <div style="font-size:10px;font-weight:600;color:var(--hi);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Blur</div>
    </div>
    <div class="field"><label>💥 Blur</label><div class="slider-wrap"><input type="range" id="${p}cs-fbl" min="0" max="100" step="0.5" value="0" oninput="this.nextElementSibling.textContent=parseFloat(this.value).toFixed(1)+'px'"><span class="slider-val">0.0px</span><button class="slider-reset" onclick="resetSlider(this.previousElementSibling.previousElementSibling,0)">↺</button></div></div>

    <div style="margin:10px 0 8px">
      <div style="font-size:10px;font-weight:600;color:var(--hi);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Drop Shadow</div>
    </div>
    <div class="fg2">
      <div class="field"><label>↔ Offset X</label><div class="slider-wrap"><input type="range" id="${p}cs-ds-x" min="-80" max="80" step="1" value="0" oninput="this.nextElementSibling.textContent=this.value+'px'"><span class="slider-val">0px</span><button class="slider-reset" onclick="resetSlider(this.previousElementSibling.previousElementSibling,0)">↺</button></div></div>
      <div class="field"><label>↕ Offset Y</label><div class="slider-wrap"><input type="range" id="${p}cs-ds-y" min="-80" max="80" step="1" value="0" oninput="this.nextElementSibling.textContent=this.value+'px'"><span class="slider-val">0px</span><button class="slider-reset" onclick="resetSlider(this.previousElementSibling.previousElementSibling,0)">↺</button></div></div>
    </div>
    <div class="fg2">
      <div class="field"><label>💫 Blur</label><div class="slider-wrap"><input type="range" id="${p}cs-ds-bl" min="0" max="100" step="1" value="0" oninput="this.nextElementSibling.textContent=this.value+'px'"><span class="slider-val">0px</span><button class="slider-reset" onclick="resetSlider(this.previousElementSibling.previousElementSibling,0)">↺</button></div></div>
      <div class="field"><label>👁 Opacidad</label><div class="slider-wrap"><input type="range" id="${p}cs-ds-op" min="0" max="1" step="0.05" value="0" oninput="sv(this)"><span class="slider-val">0.00</span><button class="slider-reset" onclick="resetSlider(this.previousElementSibling.previousElementSibling,0)">↺</button></div></div>
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
      blur: n(p + 'cs-fbl'), invert: n(p + 'cs-fi'), opacity: n(p + 'cs-fo') || 1,
      dropShadowX: parseInt(v(p + 'cs-ds-x')) || 0, dropShadowY: parseInt(v(p + 'cs-ds-y')) || 0,
      dropShadowBlur: parseInt(v(p + 'cs-ds-bl')) || 0, dropShadowColor: v(p + 'cs-ds-clr') || '#000000',
      dropShadowOpacity: n(p + 'cs-ds-op') || 0
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
  s(p + 'cs-fo', f.opacity != null ? f.opacity : 1);
  s(p + 'cs-fg', f.grayscale || 0); s(p + 'cs-fse', f.sepia || 0);
  s(p + 'cs-fh', f.hueRotate || 0); s(p + 'cs-fbl', f.blur || 0); s(p + 'cs-fi', f.invert || 0);
  s(p + 'cs-ds-x', f.dropShadowX || 0); s(p + 'cs-ds-y', f.dropShadowY || 0);
  s(p + 'cs-ds-bl', f.dropShadowBlur || 0);
  s(p + 'cs-ds-clr', f.dropShadowColor || '#000000'); s(p + 'cs-ds-clr-h', f.dropShadowColor || '#000000');
  s(p + 'cs-ds-op', f.dropShadowOpacity || 0);

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
    'cs-fb','cs-fc','cs-fs','cs-fg','cs-fse','cs-fi','cs-fo','cs-radius','cs-opacity',
    'cs-ds-x','cs-ds-y','cs-ds-bl','cs-ds-op',
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

// ═══ Global function: apply an effect preset to a panel with given prefix ═══
window.__applyFxPreset = function(presetId, prefix) {
  const preset = EFFECT_PRESETS.find(p => p.id === presetId);
  if (!preset) return;
  const cs = preset.apply();
  // Reset all inputs first
  resetCardStyleInputs(prefix);
  // Populate with preset values
  populateFromCardStyle(cs, prefix);
  syncSliderDisplays(prefix);
  // Highlight active preset in gallery
  const galleryEl = document.querySelector(`[data-prefix="${prefix}"]`)?.closest('.fx-gallery');
  if (galleryEl) {
    galleryEl.querySelectorAll('.fx-preset').forEach(el => el.classList.toggle('active', el.dataset.fx === presetId));
  }
  // Trigger preview — depends on which panel
  if (prefix === 'f-') {
    if (typeof window.updateCardPreview === 'function') window.updateCardPreview();
    if (typeof window._sendLiveUpdate === 'function') window._sendLiveUpdate();
  } else {
    // Global panel: trigger input event on the section to fire delegation
    const section = document.getElementById('sec-card-global');
    if (section) section.dispatchEvent(new Event('input', { bubbles: true }));
  }
};
