# Catalog Project Memory

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
