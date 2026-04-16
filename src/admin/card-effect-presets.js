// ═══ DACEWAV Admin — Card Effect Presets ═══
// Premium visual presets. Each is a complete cardStyle that applies all at once.
// Imported by card-style-ui.js for the effect gallery and preset buttons.

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
