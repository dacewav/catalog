# DACEWAV Admin — Refactor Master Plan

## Objetivo
Simplificar el admin sin cambiar funcionalidad. Menos bugs, más mantenible.

## Reglas
- **Cada bloque se testea en browser ANTES de pasar al siguiente**
- Zero cambios de funcionalidad visible (solo refactor interno)
- Si algo no está claro, parar y preguntar
- Build + commit después de cada bloque
- Si un bloque rompe algo, revertir y replantear

---

## Bloque 1: Foundation ✅ COMPLETADO (2026-04-13)
- [x] Cache busting automático en build.js
- [x] build.js calcula MD5 hash de CSS/JS y reescribe HTML con ?v=HASH
- [x] Idempotent: re-build no duplica hashes
- [x] Commit: `8df3c88`
- **Test en browser:** Abrir admin → DevTools → Network → verificar que CSS/JS cargan con ?v=HASH. Hacer cambio en CSS → rebuild → verificar hash cambia y browser carga nuevo.

## Bloque 2: Matar core.js — Undo/Redo ✅ COMPLETADO (2026-04-13)
- [x] Crear `src/admin/undo.js` con pushUndo, pushUndoInitial, undo, redo
- [x] Dependency injection via `setUndoDeps()` para romper imports circulares
- [x] core.js importa de undo.js, elimina definiciones inline
- [x] cmd-palette.js importa undo/redo de undo.js
- [x] Build OK (admin 249.1KB)
- [x] Commit: `b161990`
- **Test en browser:** Abrir admin → cambiar color de fondo → Ctrl+Z (deshacer) → verificar que revierte. Ctrl+Shift+Z (rehacer) → verificar que aplica de nuevo.

## Bloque 3: Matar core.js — Auto-Save (SIGUIENTE)
### Qué mover:
- `_autoSaveTimer` variable
- `autoSave()` function
- `saveAll()` / `saveTheme()` function
- `showSaving()` → ya está en helpers.js

### A dónde:
`src/admin/autosave.js`

### Dependencias:
- `collectTheme` de core.js → usar mismo patrón de setter
- `db` de state.js
- `showSaving` de helpers.js

## Bloque 4: Matar core.js — Live Edit / Preview Sync
### Qué mover:
- `_broadcastTimer`, `_lastBroadcastJSON`
- `broadcastTheme()`, `broadcastThemeNow()`, `broadcastHighlight()`
- `_sendLiveUpdate()`, `_startLiveEdit()`, `_clearLiveEdit()`, `_sendBeatRevert()`
- `_attachLiveListeners()`
- window postMessage handler

### A dónde:
`src/admin/live-edit.js`

### Nota:
Este es el más complejo porque tiene el postMessage listener que interactúa con el iframe del preview. Testear bien.

## Bloque 5: Matar core.js — Theme IO
`collectTheme()`, `loadThemeUI()`, `exportAll()`, `importAll()`, `exportCSS()`
→ `src/admin/theme-io.js`

## Bloque 6: Matar core.js — Gradient Editor
`renderGradEditor()`, `buildGradCSS()`, `addGradStop()`, etc.
→ `src/admin/gradient.js`

## Bloque 7: Matar core.js — Resto
Hero preview, particles, floating elements, emojis, text colorizer
→ archivos separados
core.js debería quedar < 200 líneas (solo init + wiring)

## Bloque 8: Limpiar CSS !important
Quitar `!important` de `.etp` rules (ya no se necesitan con inline styles).
Verificar tabs en browser.

## Bloque 9: Migrar onclick → addEventListener
Empezar por beats.js, ir archivo por archivo.

## Bloque 10: Tests básicos del admin
- Test `showEt()` — solo un panel visible
- Test `openEditor()` — campos se llenan
- Test `saveBeat()` — datos se serializan
- Test `prevImg()` — galería se puebla

---

## Archivos clave del admin
| Archivo | Líneas | Rol |
|---------|--------|-----|
| src/admin/core.js | 1405 | EL MONSTRUO — refactorizar |
| src/admin/beats.js | 460 | CRUD beats + editor |
| src/admin/theme.js | 472 | Theme editor (store-side) |
| src/admin/settings.js | 373 | Config + precios + órdenes |
| src/admin/nav.js | ~60 | Navegación + tabs |
| src/admin/colors.js | ~300 | Color pickers |
| src/admin/helpers.js | ~200 | Utilidades |
| src/admin/state.js | ~100 | Estado compartido |
| src/admin/card-style-ui.js | ~400 | Generador de controles de estilo |
| src/admin/beat-card-style.js | ~200 | Lector de estilos de tarjeta |
| src/admin/beat-preview.js | ~400 | Preview + image history |
| src/admin-main.js | ~30 | Entry point |
