# DACEWAV.STORE — Session Report Final (2026-04-12)

**Session:** 05:38–06:28 GMT+8
**Commits:** 6 (see git log)

---

## ✅ LO QUE SÍ FUNCIONA

### Sliders
- Todos los 73 sliders del beat editor tienen reset (↺)
- `syncSliderDisplay` usa mapa exacto de formatos (`SD_FMT`) — presets actualizan TODOS los displays
- `ALL_SLIDER_IDS` centraliza la lista, no más arrays duplicados
- `sv()` en helpers.js mejorado para todos los formatos

### Animaciones
- 25 tipos de animación disponibles en el dropdown (antes 16)
- Faltaban: zoom-out, rotar, spin-lento, deslizar arriba/abajo/izq/der, sacudida, parpadeo
- Preview del admin tiene 42 keyframes `pv-*` (antes 25)
- Holograma multi-color: gradient y pulse funcionan con colores custom

### Live Edit (postMessage Admin → Iframe)
- ✅ Los logs confirman que el postMessage llega al iframe
- ✅ `beat-update` recibe el beat en index 0
- ✅ Firebase write OK
- ✅ `renderAll()` se ejecuta

### Presets
- 4 style presets + 8 hover presets
- `applyPreset()` reset ALL fields antes de aplicar (no hay leak de valores previos)
- `resetCardStyle()` reset completo incluyendo sub-settings de animación

### Preview Panel
- CSS fixes: llaves huérfanas, `--pw` fallback, selectores rotos
- Resize handle funciona (drag-right = más ancho)

---

## ❌ LO QUE NO FUNCIONA / QUEDA PENDIENTE

### 1. Shimmer, Shadow, Hover no se ven en la tienda
**Problema:** El admin preview muestra shimmer, sombras, y efectos hover, pero la tienda real no los muestra igual.
**Causa probable:**
- El store `.beat-card` tiene CSS base que puede estar sobreescribiendo los estilos inline
- `box-shadow` del store tiene un default `--card-shadow` que puede competir con el shadow del beat
- Shimmer necesita `.shimmer-overlay` con la keyframe `shimmer` — verificar que el store la tenga
- Hover CSS vars (`--hov-scale`, `--hov-bright`, etc.) necesitan `.has-hover-fx` class

**Fix pendiente:** Revisar `store-styles.css` y asegurar que los inline styles del beat tengan suficiente especificidad para ganarle a los defaults.

### 2. CDN CORS Error
**Error:** `cdn.dacewav.store` no tiene header `Access-Control-Allow-Origin`
**Impacto:** Waveform no carga, audio de preview no carga
**Fix:** Configurar CORS en Cloudflare R2 o Worker que sirve `cdn.dacewav.store`:
```
Access-Control-Allow-Origin: https://dacewav.store
```

### 3. Firebase Analytics Permission Denied
**Error:** `PERMISSION_DENIED: Permission denied` en `/analytics/*`
**Fix:** Agregar a Firebase rules:
```json
"analytics": {
  ".read": false,
  ".write": true
}
```

### 4. CSP Violation
**Error:** `Connecting to '<URL>' violates connect-src`
**Fix:** Revisar qué URL está bloqueada y agregarla al `Content-Security-Policy` en `_headers`

### 5. Visual Mismatch: Admin Preview vs Store
**Problema:** El admin preview (con CSS scoped) se ve diferente al store (con CSS completo).
**Razón:** El admin usa CSS variables mapeadas (`--sf→--surface`, etc.) y keyframes `pv-*` separados. El store tiene sus propias CSS variables y keyframes. Aunque los datos son idénticos, el render puede diferir por:
- Diferentes valores default de CSS variables
- Diferentes especificidades de CSS
- `mix-blend-mode: overlay` se ve diferente según el background

**Fix pendiente:** Unificar las CSS variables o asegurar que los defaults del store coincidan con los del admin preview.

---

## 📋 INSTRUCCIONES PARA LA PRÓXIMA SESIÓN

### Prioridad 1: Shimmer/Shadow/Hover en la tienda
1. Abrir tienda en browser → Inspect un `.beat-card`
2. Verificar si las clases `shimmer-on`, `has-hover-fx`, `glow-active` están aplicadas
3. Verificar si `box-shadow` inline está presente en el `style=""`
4. Si las clases están pero no se ven → problema de CSS specificity
5. Fix: agregar `!important` a los inline styles del beat en `cards.js` o subir especificidad en `store-styles.css`

### Prioridad 2: CDN CORS
1. Ir a Cloudflare Dashboard → R2 → bucket `dace-beats`
2. Settings → CORS → agregar:
   - Origin: `https://dacewav.store`
   - Methods: `GET, HEAD`
   - Headers: `*`

### Prioridad 3: Firebase Analytics Rules
1. Firebase Console → Realtime Database → Rules
2. Agregar: `"analytics": { ".write": true }`

### Prioridad 4: Unificar Preview/Store CSS
1. Comparar `#pv-full-card-container` CSS (admin) con `.beat-card` CSS (store)
2. Asegurar que los mismos CSS variables tengan los mismos defaults
3. Considerar usar el store CSS directamente en el admin preview (importar `store-styles.css`)

---

## 🛠️ ARCHITECTURE NOTES

### File Structure
```
admin.html          — 3144 líneas, CSS + HTML + JS inline
src/admin/beats.js  — ~1880 líneas, card style schema, preview, presets, live edit
src/cards.js        — ~490 líneas, store card renderer
store-styles.css    — ~732 líneas, all store CSS + animations
dist/               — esbuild output (admin-app.js, store-app.js)
```

### Skills Installed (en ~/.openclaw/workspace/)
- `skills-taste/` — taste-skill + 6 sub-skills
- `skills-vibe/` — Vibe governed runtime
- `skills-everything/` — Claude Code rules/patterns
- Referencia: `SKILLS-REFERENCE.md`

### Live Edit Flow
```
Admin slider change
  → event delegation on #sec-add
  → _debouncedPv() (250ms)
  → _sendLiveUpdate()
  → postToFrame({ type: 'beat-update', beatId, data })
  → iframe receives message
  → Object.assign(state.allBeats[bi], d.data)
  → renderAll()
  → applyFilters() → beatCard() → new HTML with updated cardStyle
```

### Build & Deploy
```bash
node build.js           # builds dist/admin-app.js + dist/store-app.js
git add -A && git commit -m "..."
git push https://TOKEN@github.com/dacewav/catalog.git main
# Cloudflare Pages auto-deploys from main branch
```

---

## 🔑 GITHUB TOKEN
Token shared in chat — **ROTATE after every session**
→ github.com/settings/tokens → Regenerate
