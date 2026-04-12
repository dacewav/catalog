# Catalog Project Memory

## 2026-04-13 (sesión 2) — Glow system fix, Live edit sync, Papelera audio

### Problemas resueltos

**6. admin-batch-update no aplicaba tema/settings (CRÍTICO)**
- `src/main.js` handler `admin-batch-update` guardaba `state.T = d.theme` pero nunca llamaba `applyTheme()` ni `applySettings()`
- Cambios de colores, glow global, tipografía, etc. quedaban en memoria sin renderizar
- Mismo problema en handlers individuales `theme-update` y `settings-update`
- Fix: agregar `applyTheme(state.T)`, `applySettings()` y `renderAll()` cuando data cambia
- Archivo: `src/main.js` líneas ~139-175

**7. Glow per-beat — CSS vars ignoradas en keyframes**
- Keyframes CSS (`beat-glow`, `beat-glow-pulse`, `beat-glow-breathe`, `beat-glow-neon`, `beat-glow-rgb`) tenían blur hardcoded a 20px, spread 0px
- `--glow-int` y `--glow-op` NUNCA se usaban en los keyframes → sliders sin efecto
- Fix: reescritos todos los keyframes para usar `var(--glow-blur)`, `var(--glow-spread)`, `calc(alfa * var(--glow-int) * var(--glow-op))`
- Aplicado en `store-styles.css` Y `admin-styles.css` (keyframes `bcpv-glow-*`)
- Archivos: `store-styles.css` (keyframes beat-glow-*), `admin-styles.css` (keyframes bcpv-glow-*)

**8. glow-hover-only referenciaba keyframes inexistentes**
- `store-styles.css` usaba `bcpv-glow-pulse`, `bcpv-glow-rgb`, etc. que solo existían en admin-styles
- Fix: cambiados a `beat-glow-*` que sí están definidos en store-styles
- Archivo: `store-styles.css` línea ~724

**9. Papelera conectada a audio y preview**
- Tab Media solo tenía botón de upload, sin botón de borrar/papelera para audio y preview
- Fix: agregados botones 🗑 junto a Audio WAV y Preview MP3 que llaman `trashItem()` con type `'audio'`/`'preview'`
- Archivo: `admin.html` líneas ~562-563

**10. beatCard() glow blur siempre seteado**
- `src/cards.js` condicionaba `--glow-blur` con `gc.blur !== 20` → si el usuario ponía 20px no se seteaba
- Fix: quitar la condición, siempre setear si existe el valor
- Archivo: `src/cards.js` línea ~72

### Pendientes (re-sesión)
- [ ] Animaciones en Media tab — no se pudo reproducir. Queda para investigar si reaparece.
- [ ] El sync a Firebase de imágenes grandes (base64) puede ser lento
- [ ] Tests de glow con CSS vars (no hay tests de CSS output todavía)

### Commit
`5c47f5d` — "fix: glow system + live edit sync + papelera audio/preview"

### Archivos clave (adicionales a los de sesión 1)
- `src/main.js` — handler `admin-batch-update` fix (applyTheme/applySettings)
- `store-styles.css` — keyframes glow reescritos con CSS vars
- `admin-styles.css` — keyframes bcpv-glow reescritos con CSS vars

---

## 2026-04-13 — Sesión completa: Preview, Sync, Imágenes, Trash

### Resumen de cambios
Sesión larga con múltiples iteraciones sobre el preview de tarjetas y sistema de imágenes.

### Problemas resueltos

**1. beat-preview.js nunca importado**
- `admin-main.js` no importaba `beat-preview.js` → `renderFullPvInCard` nunca existía
- Fix: `import './admin/beat-preview.js'` en admin-main.js

**2. Live update no se disparaba desde sliders generados**
- `card-style-ui.js` genera sliders con `oninput="sv(this)"` que NO llamaban `updateCardPreview()`
- Fix: listener global en `card-style-ui.js` que captura input/change en controles `f-` y `g-`

**3. Mini preview eliminado**
- `_buildCardHTML()` era copia simplificada de `beatCard()` del store — nunca iba a ser idéntica
- Decisión: eliminar mini preview, usar solo el iframe de la derecha (`preview-frame`)
- El tab Extras ahora muestra indicador + botón de upload de imagen

**4. Sistema de imágenes**
- Preview inmediato al subir imagen (FileReader)
- Historial mini con thumbnails (hasta 8, con X para quitar)
- Botón "Papelera" mueve imagen a trash en vez de borrar directo
- `_sendLiveUpdate()` se llama automáticamente desde `updateCardPreview()` y `prevImg()`

**5. Papelera (Trash)**
- Nueva sección `#sec-trash` en sidebar
- `src/admin/trash.js` — localStorage, restore, delete perm, filters
- Badge en sidebar muestra cantidad de elementos

### Pendientes
- [ ] Animaciones en Media tab — el usuario reporta controles de animación apareciendo en el tab Media. No se pudo reproducir/aislar el bug. Investigar en siguiente sesión.
- [ ] Conectar trash a audios y previews (solo imágenes por ahora)
- [ ] El sync a Firebase de imágenes grandes (base64) puede ser lento

### Arquitectura de live update (final)
```
Slider/control cambia
  → oninput="sv(this)" (display update)
  → document 'input' listener (card-style-ui.js)
  → updateCardPreview()
    → _buildCardStyleFromInputs() [lee valores]
    → _sendLiveUpdate() debounced (300ms)
      → postMessage → preview-frame iframe
      → Firebase liveEdits/{beatId}
    → renderFullPvInCard() [no-op, preview eliminado]
```

### Archivos clave
- `src/admin/beats.js` — CRUD beats, editor, uploads, prevImg, live edit
- `src/admin/beat-card-style.js` — updateCardPreview, _buildCardStyleFromInputs
- `src/admin/beat-preview.js` — _buildCardHTML, renderFullPvInCard (no-op), image upload handler
- `src/admin/card-style-ui.js` — effect gallery, generated controls, universal slider listener
- `src/admin/trash.js` — papelera
- `src/admin/nav.js` — showSection, showEt
- `src/cards.js` — store's beatCard() (the REAL renderer)
- `src/main.js` — store's live edit receiver
