// ═══ DACEWAV Admin — Card Style Controls Generator ═══
// Generates HTML for card style controls (filters, glow, anim, border, shadow, hover, transform)
// Used in both: beat editor (Extras tab) and global card style section

import { g } from './helpers.js';

// ═══ EFFECT PRESETS GALLERY ═══
// Premium visual presets based on taste-skill principles:
// - No pure black, no oversaturated neon
// - Tinted shadows, material depth, subtle sophistication
// - Each preset is a complete cardStyle that applies all at once
export const EFFECT_PRESETS = [
  {
    id: 'none', name: 'Limpio', cat: 'base',
    desc: 'Sin efectos',
    preview: { bg: 'linear-gradient(135deg, #1c1917, #292524)', filter: 'none' },
    apply: () => ({
      filter: { brightness: 1, contrast: 1, saturate: 1, grayscale: 0, sepia: 0, hueRotate: 0, blur: 0, blurType: '', invert: 0, opacity: 1, dropShadowX: 0, dropShadowY: 0, dropShadowBlur: 0, dropShadowColor: '#000000', dropShadowOpacity: 0 },
      glow: { enabled: false, type: 'active', color: '#dc2626', speed: 3, intensity: 1, blur: 20, spread: 0, opacity: 1, hoverOnly: false },
      anim: null, style: { accentColor: '#dc2626', shimmer: false, borderRadius: 0, opacity: 1 },
      border: { enabled: false, color: '#dc2626', width: 1, style: 'solid' },
      shadow: { enabled: false, color: '#000000', opacity: 0.35, x: 0, y: 4, blur: 12, spread: 0, inset: false },
      hover: { scale: 1, brightness: 1, saturate: 1, shadowBlur: 0, transition: 0.3, borderColor: '#dc2626', glowIntensify: false, blur: 0, siblingsBlur: 0, hueRotate: 0, opacity: 1, enableAnim: false, animType: '', animDur: 1 },
      transform: { rotate: 0, scale: 1, skewX: 0, skewY: 0, x: 0, y: 0 }
    })
  },
  {
    id: 'film', name: 'Cine', cat: 'color',
    desc: 'Desaturación sutil, contraste cinematográfico, grano orgánico',
    preview: { bg: 'linear-gradient(135deg, #292524, #44403c)', filter: 'grayscale(0.3) contrast(1.15) sepia(0.1)' },
    apply: () => ({
      filter: { brightness: 0.97, contrast: 1.15, saturate: 0.75, grayscale: 0.3, sepia: 0.1, hueRotate: 0, blur: 0, blurType: '', invert: 0, opacity: 1, dropShadowX: 0, dropShadowY: 6, dropShadowBlur: 20, dropShadowColor: '#1c1917', dropShadowOpacity: 0.5 },
      glow: { enabled: false, type: 'active', color: '#dc2626', speed: 3, intensity: 1, blur: 20, spread: 0, opacity: 1, hoverOnly: false },
      anim: null, style: { accentColor: '#a8a29e', shimmer: false, borderRadius: 4, opacity: 1 },
      border: { enabled: false, color: '#dc2626', width: 1, style: 'solid' },
      shadow: { enabled: true, color: '#1c1917', opacity: 0.6, x: 0, y: 8, blur: 24, spread: 0, inset: false },
      hover: { scale: 1.02, brightness: 1.12, saturate: 0.85, shadowBlur: 30, transition: 0.4, borderColor: '#78716c', glowIntensify: false, blur: 0, siblingsBlur: 2, hueRotate: 0, opacity: 1, enableAnim: false, animType: '', animDur: 1 },
      transform: { rotate: 0, scale: 1, skewX: 0, skewY: 0, x: 0, y: 0 }
    })
  },
  {
    id: 'noir', name: 'Noir', cat: 'color',
    desc: 'Alto contraste B&W, sombras profundas, elegancia clásica',
    preview: { bg: 'linear-gradient(135deg, #1c1917, #292524)', filter: 'grayscale(1) contrast(1.4) brightness(0.9)' },
    apply: () => ({
      filter: { brightness: 0.9, contrast: 1.4, saturate: 0, grayscale: 1, sepia: 0, hueRotate: 0, blur: 0, blurType: '', invert: 0, opacity: 1, dropShadowX: 0, dropShadowY: 10, dropShadowBlur: 25, dropShadowColor: '#0c0a09', dropShadowOpacity: 0.6 },
      glow: { enabled: false, type: 'active', color: '#dc2626', speed: 3, intensity: 1, blur: 20, spread: 0, opacity: 1, hoverOnly: false },
      anim: null, style: { accentColor: '#fafaf9', shimmer: false, borderRadius: 2, opacity: 1 },
      border: { enabled: false, color: '#dc2626', width: 1, style: 'solid' },
      shadow: { enabled: true, color: '#0c0a09', opacity: 0.7, x: 0, y: 10, blur: 28, spread: 0, inset: false },
      hover: { scale: 1.03, brightness: 1.2, saturate: 0, shadowBlur: 35, transition: 0.35, borderColor: '#d6d3d1', glowIntensify: false, blur: 0, siblingsBlur: 3, hueRotate: 0, opacity: 1, enableAnim: false, animType: '', animDur: 1 },
      transform: { rotate: 0, scale: 1, skewX: 0, skewY: 0, x: 0, y: 0 }
    })
  },
  {
    id: 'vintage', name: 'Retiro', cat: 'color',
    desc: 'Sepia cálido, bordes suaves, atmósfera nostálgica',
    preview: { bg: 'linear-gradient(135deg, #44403c, #78716c)', filter: 'sepia(0.6) contrast(1.05) brightness(0.95)' },
    apply: () => ({
      filter: { brightness: 0.95, contrast: 1.05, saturate: 0.85, grayscale: 0, sepia: 0.6, hueRotate: 0, blur: 0, blurType: '', invert: 0, opacity: 1, dropShadowX: 0, dropShadowY: 4, dropShadowBlur: 18, dropShadowColor: '#44403c', dropShadowOpacity: 0.35 },
      glow: { enabled: false, type: 'active', color: '#dc2626', speed: 3, intensity: 1, blur: 20, spread: 0, opacity: 1, hoverOnly: false },
      anim: null, style: { accentColor: '#a68a64', shimmer: false, borderRadius: 8, opacity: 1 },
      border: { enabled: true, color: '#78716c', width: 1, style: 'solid' },
      shadow: { enabled: true, color: '#44403c', opacity: 0.4, x: 0, y: 6, blur: 20, spread: 0, inset: false },
      hover: { scale: 1.02, brightness: 1.1, saturate: 1, shadowBlur: 24, transition: 0.45, borderColor: '#a68a64', glowIntensify: false, blur: 0, siblingsBlur: 2, hueRotate: 0, opacity: 1, enableAnim: false, animType: '', animDur: 1 },
      transform: { rotate: 0, scale: 1, skewX: 0, skewY: 0, x: 0, y: 0 }
    })
  },
  {
    id: 'ember', name: 'Brasa', cat: 'glow',
    desc: 'Glow cálido contenido, profundidad sin saturación excesiva',
    preview: { bg: 'linear-gradient(135deg, #292524, #451a03)', filter: 'brightness(1.05) saturate(1.2)' },
    apply: () => ({
      filter: { brightness: 1.05, contrast: 1.1, saturate: 1.2, grayscale: 0, sepia: 0.05, hueRotate: 0, blur: 0, blurType: '', invert: 0, opacity: 1, dropShadowX: 0, dropShadowY: 5, dropShadowBlur: 18, dropShadowColor: '#9a3412', dropShadowOpacity: 0.3 },
      glow: { enabled: true, type: 'pulse', color: '#c2410c', speed: 2.5, intensity: 1.1, blur: 25, spread: 0, opacity: 0.55, hoverOnly: false },
      anim: null, style: { accentColor: '#ea580c', shimmer: false, borderRadius: 6, opacity: 1 },
      border: { enabled: true, color: '#9a3412', width: 1, style: 'solid' },
      shadow: { enabled: true, color: '#431407', opacity: 0.5, x: 0, y: 8, blur: 22, spread: 0, inset: false },
      hover: { scale: 1.03, brightness: 1.2, saturate: 1.3, shadowBlur: 0, transition: 0.3, borderColor: '#f97316', glowIntensify: true, blur: 0, siblingsBlur: 4, hueRotate: 0, opacity: 1, enableAnim: false, animType: '', animDur: 1 },
      transform: { rotate: 0, scale: 1, skewX: 0, skewY: 0, x: 0, y: 0 }
    })
  },
  {
    id: 'frost', name: 'Escarcha', cat: 'glow',
    desc: 'Tinte frío, glow tenue solo en hover, pulido helado',
    preview: { bg: 'linear-gradient(135deg, #0c4a6e, #164e63)', filter: 'brightness(1.08) saturate(0.85)' },
    apply: () => ({
      filter: { brightness: 1.08, contrast: 1.05, saturate: 0.85, grayscale: 0, sepia: 0, hueRotate: -5, blur: 0, blurType: '', invert: 0, opacity: 1, dropShadowX: 0, dropShadowY: 0, dropShadowBlur: 22, dropShadowColor: '#0e7490', dropShadowOpacity: 0.25 },
      glow: { enabled: true, type: 'breathe', color: '#0e7490', speed: 5, intensity: 0.8, blur: 28, spread: 0, opacity: 0.4, hoverOnly: true },
      anim: null, style: { accentColor: '#22d3ee', shimmer: true, shimmerSpeed: 3, shimmerOp: 0.04, borderRadius: 10, opacity: 1 },
      border: { enabled: true, color: '#155e75', width: 1, style: 'solid' },
      shadow: { enabled: true, color: '#083344', opacity: 0.45, x: 0, y: 6, blur: 18, spread: 0, inset: false },
      hover: { scale: 1.03, brightness: 1.15, saturate: 1, shadowBlur: 0, transition: 0.4, borderColor: '#67e8f9', glowIntensify: false, blur: 0, siblingsBlur: 3, hueRotate: 0, opacity: 1, enableAnim: false, animType: '', animDur: 1 },
      transform: { rotate: 0, scale: 1, skewX: 0, skewY: 0, x: 0, y: 0 }
    })
  },
  {
    id: 'crystal', name: 'Cristal', cat: 'glow',
    desc: 'Glassmorphism con refracción interior, bordes iluminados',
    preview: { bg: 'linear-gradient(135deg, #1e1b4b, #312e81)', filter: 'brightness(1.1)' },
    apply: () => ({
      filter: { brightness: 1.1, contrast: 1.05, saturate: 1.1, grayscale: 0, sepia: 0, hueRotate: 0, blur: 0, blurType: '', invert: 0, opacity: 0.92, dropShadowX: 0, dropShadowY: 8, dropShadowBlur: 30, dropShadowColor: '#312e81', dropShadowOpacity: 0.3 },
      glow: { enabled: true, type: 'breathe', color: '#6366f1', speed: 4, intensity: 0.7, blur: 30, spread: 0, opacity: 0.35, hoverOnly: true },
      anim: null, style: { accentColor: '#818cf8', shimmer: true, shimmerSpeed: 3, shimmerOp: 0.04, borderRadius: 14, opacity: 0.92 },
      border: { enabled: true, color: 'rgba(255,255,255,0.08)', width: 1, style: 'solid' },
      shadow: { enabled: true, color: '#1e1b4b', opacity: 0.4, x: 0, y: 10, blur: 30, spread: 0, inset: false },
      hover: { scale: 1.04, brightness: 1.2, saturate: 1.15, shadowBlur: 0, transition: 0.35, borderColor: 'rgba(255,255,255,0.2)', glowIntensify: true, blur: 0, siblingsBlur: 5, hueRotate: 0, opacity: 1, enableAnim: false, animType: '', animDur: 1 },
      transform: { rotate: 0, scale: 1, skewX: 0, skewY: 0, x: 0, y: 0 }
    })
  },
  {
    id: 'hologram', name: 'Holo', cat: 'anim',
    desc: 'Ciclo de tono iridiscente, brillo orgánico, no neón genérico',
    preview: { bg: 'linear-gradient(135deg, #7c2d12, #065f46, #1e3a5f)', filter: 'hue-rotate(45deg) brightness(1.05)' },
    apply: () => ({
      filter: { brightness: 1.05, contrast: 1.08, saturate: 1.2, grayscale: 0, sepia: 0, hueRotate: 0, blur: 0, blurType: '', invert: 0, opacity: 1, dropShadowX: 0, dropShadowY: 0, dropShadowBlur: 0, dropShadowColor: '#000000', dropShadowOpacity: 0 },
      glow: { enabled: true, type: 'rgb', color: '#7c2d12', speed: 6, intensity: 0.8, blur: 22, spread: 0, opacity: 0.45, hoverOnly: false },
      anim: { type: 'holograma', dur: 5, del: 0, easing: 'ease-in-out', direction: 'normal', iterations: 'infinite', intensity: 80, hueStart: 0, hueEnd: 360, holoBrightMin: 0.9, holoBrightMax: 1.25, holoSatMin: 0.9, holoSatMax: 1.6, holoGlow: 0, holoBlur: 0 },
      style: { accentColor: '#d97706', shimmer: true, shimmerSpeed: 3, shimmerOp: 0.04, borderRadius: 10, opacity: 1 },
      border: { enabled: false, color: '#dc2626', width: 1, style: 'solid' },
      shadow: { enabled: true, color: '#1c1917', opacity: 0.35, x: 0, y: 6, blur: 20, spread: 0, inset: false },
      hover: { scale: 1.04, brightness: 1.2, saturate: 1.3, shadowBlur: 0, transition: 0.3, borderColor: '#fbbf24', glowIntensify: true, blur: 0, siblingsBlur: 4, hueRotate: 15, opacity: 1, enableAnim: false, animType: '', animDur: 1 },
      transform: { rotate: 0, scale: 1, skewX: 0, skewY: 0, x: 0, y: 0 }
    })
  },
  {
    id: 'float', name: 'Flota', cat: 'anim',
    desc: 'Flotación sutil, sombra difusa, sensación etérea',
    preview: { bg: 'linear-gradient(135deg, #1c1917, #292524)', filter: 'brightness(1.05)' },
    apply: () => ({
      filter: { brightness: 1.05, contrast: 1, saturate: 1, grayscale: 0, sepia: 0, hueRotate: 0, blur: 0, blurType: '', invert: 0, opacity: 1, dropShadowX: 0, dropShadowY: 10, dropShadowBlur: 25, dropShadowColor: '#1c1917', dropShadowOpacity: 0.35 },
      glow: { enabled: false, type: 'active', color: '#dc2626', speed: 3, intensity: 1, blur: 20, spread: 0, opacity: 1, hoverOnly: false },
      anim: { type: 'flotar', dur: 4, del: 0, easing: 'ease-in-out', direction: 'alternate', iterations: 'infinite', intensity: 90 },
      style: { accentColor: '#78716c', shimmer: false, borderRadius: 12, opacity: 1 },
      border: { enabled: false, color: '#dc2626', width: 1, style: 'solid' },
      shadow: { enabled: true, color: '#1c1917', opacity: 0.25, x: 0, y: 12, blur: 30, spread: 0, inset: false },
      hover: { scale: 1.04, brightness: 1.1, saturate: 1, shadowBlur: 40, transition: 0.4, borderColor: '#a8a29e', glowIntensify: false, blur: 0, siblingsBlur: 3, hueRotate: 0, opacity: 1, enableAnim: false, animType: '', animDur: 1 },
      transform: { rotate: 0, scale: 1, skewX: 0, skewY: 0, x: 0, y: 0 }
    })
  },
  {
    id: 'glitch', name: 'Glitch', cat: 'anim',
    desc: 'Distorsión controlada, aberración cromática sutil',
    preview: { bg: 'linear-gradient(135deg, #450a0a, #1e1b4b)', filter: 'saturate(1.5) contrast(1.2)' },
    apply: () => ({
      filter: { brightness: 1.05, contrast: 1.2, saturate: 1.5, grayscale: 0, sepia: 0, hueRotate: 0, blur: 0, blurType: '', invert: 0, opacity: 1, dropShadowX: -3, dropShadowY: 0, dropShadowBlur: 0, dropShadowColor: '#991b1b', dropShadowOpacity: 0.5 },
      glow: { enabled: false, type: 'active', color: '#dc2626', speed: 3, intensity: 1, blur: 20, spread: 0, opacity: 1, hoverOnly: false },
      anim: { type: 'glitch', dur: 0.4, del: 0, easing: 'steps(2)', direction: 'normal', iterations: 'infinite', intensity: 100, glitchX: 2, glitchY: 1, glitchRot: 0.3 },
      style: { accentColor: '#ef4444', shimmer: false, borderRadius: 0, opacity: 1 },
      border: { enabled: false, color: '#dc2626', width: 1, style: 'solid' },
      shadow: { enabled: false, color: '#000000', opacity: 0.35, x: 0, y: 4, blur: 12, spread: 0, inset: false },
      hover: { scale: 1, brightness: 1.3, saturate: 1.8, shadowBlur: 0, transition: 0.1, borderColor: '#ef4444', glowIntensify: false, blur: 0, siblingsBlur: 0, hueRotate: 0, opacity: 1, enableAnim: false, animType: '', animDur: 1 },
      transform: { rotate: 0, scale: 1, skewX: 0, skewY: 0, x: 0, y: 0 }
    })
  },
  {
    id: 'ghost', name: 'Eco', cat: 'anim',
    desc: 'Translucidez etérea, respiración lenta, aura índigo',
    preview: { bg: 'linear-gradient(135deg, #1e1b4b, #312e81)', filter: 'opacity(0.7) blur(1px)' },
    apply: () => ({
      filter: { brightness: 1, contrast: 0.92, saturate: 0.7, grayscale: 0.2, sepia: 0, hueRotate: 0, blur: 0, blurType: '', invert: 0, opacity: 0.75, dropShadowX: 0, dropShadowY: 0, dropShadowBlur: 28, dropShadowColor: '#4338ca', dropShadowOpacity: 0.2 },
      glow: { enabled: true, type: 'breathe', color: '#6366f1', speed: 6, intensity: 0.6, blur: 32, spread: 0, opacity: 0.3, hoverOnly: false },
      anim: { type: 'respirar', dur: 6, del: 0, easing: 'ease-in-out', direction: 'normal', iterations: 'infinite', intensity: 70 },
      style: { accentColor: '#818cf8', shimmer: false, borderRadius: 14, opacity: 0.75 },
      border: { enabled: true, color: 'rgba(99,102,241,0.2)', width: 1, style: 'solid' },
      shadow: { enabled: false, color: '#4338ca', opacity: 0.35, x: 0, y: 4, blur: 12, spread: 0, inset: false },
      hover: { scale: 1.02, brightness: 1.25, saturate: 1, shadowBlur: 0, transition: 0.5, borderColor: 'rgba(99,102,241,0.4)', glowIntensify: true, blur: 0, siblingsBlur: 4, hueRotate: 0, opacity: 1, enableAnim: false, animType: '', animDur: 1 },
      transform: { rotate: 0, scale: 1, skewX: 0, skewY: 0, x: 0, y: 0 }
    })
  },
  {
    id: 'pop', name: 'Pop', cat: 'color',
    desc: 'Saturación alta con bordes marcados, estilo editorial',
    preview: { bg: 'linear-gradient(135deg, #881337, #1e3a5f)', filter: 'saturate(2.5) contrast(1.25) brightness(1.05)' },
    apply: () => ({
      filter: { brightness: 1.05, contrast: 1.25, saturate: 2.5, grayscale: 0, sepia: 0, hueRotate: 0, blur: 0, blurType: '', invert: 0, opacity: 1, dropShadowX: 3, dropShadowY: 3, dropShadowBlur: 0, dropShadowColor: '#1c1917', dropShadowOpacity: 0.25 },
      glow: { enabled: false, type: 'active', color: '#dc2626', speed: 3, intensity: 1, blur: 20, spread: 0, opacity: 1, hoverOnly: false },
      anim: null, style: { accentColor: '#e11d48', shimmer: false, borderRadius: 2, opacity: 1 },
      border: { enabled: true, color: '#1c1917', width: 2, style: 'solid' },
      shadow: { enabled: true, color: '#1c1917', opacity: 0.25, x: 4, y: 4, blur: 0, spread: 0, inset: false },
      hover: { scale: 1.05, brightness: 1.15, saturate: 2.8, shadowBlur: 0, transition: 0.18, borderColor: '#e11d48', glowIntensify: false, blur: 0, siblingsBlur: 3, hueRotate: 10, opacity: 1, enableAnim: false, animType: '', animDur: 1 },
      transform: { rotate: 0, scale: 1, skewX: 0, skewY: 0, x: 0, y: 0 }
    })
  },
  {
    id: 'deep', name: 'Abismo', cat: 'glow',
    desc: 'Oscuridad profunda con sombra interna, volumen dramático',
    preview: { bg: 'linear-gradient(135deg, #0c0a09, #1c1917)', filter: 'brightness(0.85) contrast(1.2)' },
    apply: () => ({
      filter: { brightness: 0.85, contrast: 1.2, saturate: 0.9, grayscale: 0, sepia: 0, hueRotate: 0, blur: 0, blurType: '', invert: 0, opacity: 1, dropShadowX: 0, dropShadowY: 12, dropShadowBlur: 35, dropShadowColor: '#0c0a09', dropShadowOpacity: 0.7 },
      glow: { enabled: true, type: 'active', color: '#dc2626', speed: 4, intensity: 0.6, blur: 30, spread: 0, opacity: 0.25, hoverOnly: true },
      anim: null, style: { accentColor: '#dc2626', shimmer: false, borderRadius: 8, opacity: 1 },
      border: { enabled: false, color: '#dc2626', width: 1, style: 'solid' },
      shadow: { enabled: true, color: '#000000', opacity: 0.7, x: 0, y: 12, blur: 35, spread: -5, inset: true },
      hover: { scale: 1.02, brightness: 1.3, saturate: 1.1, shadowBlur: 0, transition: 0.4, borderColor: '#dc2626', glowIntensify: true, blur: 0, siblingsBlur: 6, hueRotate: 0, opacity: 1, enableAnim: false, animType: '', animDur: 1 },
      transform: { rotate: 0, scale: 1, skewX: 0, skewY: 0, x: 0, y: 0 }
    })
  }
];

// Blur type options for the dropdown
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

// Default cardStyle shape
export const DEFAULT_CARD_STYLE = {
  filter: { brightness: 1, contrast: 1, saturate: 1, grayscale: 0, sepia: 0, hueRotate: 0, blur: 0, blurType: '', invert: 0, opacity: 1, dropShadowX: 0, dropShadowY: 0, dropShadowBlur: 0, dropShadowColor: '#000000', dropShadowOpacity: 0 },
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
    <div class="field"><label>Tipo de blur</label>
      <select id="${p}cs-fbl-type" style="font-family:var(--fm);font-size:11px;background:var(--abg);color:var(--tx);border:1px solid var(--b);border-radius:var(--rad);padding:6px 10px;width:100%;cursor:pointer">
        <option value="">Ninguno</option>
        <option value="vigneta">Vigneta</option>
        <option value="aura">Aura</option>
        <option value="focus">Focus</option>
      </select>
    </div>
    <div class="field"><label>Intensidad</label><div class="slider-wrap"><input type="range" id="${p}cs-fbl" min="0" max="50" step="0.5" value="0" oninput="this.nextElementSibling.textContent=parseFloat(this.value).toFixed(1)+'px'"><span class="slider-val">0.0px</span><button class="slider-reset" onclick="resetSlider(this.previousElementSibling.previousElementSibling,0)">↺</button></div></div>

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
      blur: n(p + 'cs-fbl'), blurType: v(p + 'cs-fbl-type') || '', invert: n(p + 'cs-fi'), opacity: n(p + 'cs-fo') || 1,
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
      shimmerSpeed: parseFloat(v(p + 'shimmer-speed')) || 3,
      shimmerOp: parseFloat(v(p + 'shimmer-op')) || 0.04,
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
  s(p + 'cs-fbl-type', f.blurType || '');
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
  s(p + 'shimmer-speed', st.shimmerSpeed || 3);
  s(p + 'shimmer-op', st.shimmerOp || 0.04);

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

// ═══ Universal slider → preview bridge ═══
// Catches ALL range/slider input events and routes to the correct preview function.
// This ensures dynamically generated sliders (from renderFiltersHTML, renderGlowHTML, etc.)
// always trigger a preview update, even if their oninput only calls sv(this).
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

// Also catch select changes and checkbox changes in the generated controls
document.addEventListener('change', function(e) {
  var id = e.target.id || '';
  // Only handle f-/g- prefixed controls (beat editor or global card style)
  if (id.startsWith('f-') && (e.target.type === 'checkbox' || e.target.tagName === 'SELECT')) {
    if (typeof window.updateCardPreview === 'function') window.updateCardPreview();
  } else if (id.startsWith('g-') && (e.target.type === 'checkbox' || e.target.tagName === 'SELECT')) {
    var section = document.getElementById('sec-card-global');
    if (section) section.dispatchEvent(new Event('input', { bubbles: true }));
  }
});
