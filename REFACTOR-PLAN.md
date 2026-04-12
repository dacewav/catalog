# DACEWAV Admin — Refactor Master Plan

## Objetivo
Simplificar el admin sin cambiar funcionalidad. Menos bugs, más mantenible.

## Reglas
- Cada bloque se testea ANTES de pasar al siguiente
- Zero cambios de funcionalidad visible (solo refactor interno)
- Si algo no está claro, parar y preguntar
- Build después de cada bloque
- Commit después de cada bloque que funcione

---

## Bloque 1: Foundation ✅ EN PROGRESO
- [x] Cache busting automático en build.js
- [x] admin.html referencia CSS/JS con hash
- [ ] Verificar build funciona con hash

## Bloque 2: Matar core.js — Parte 1: Extraer undo/redo
- `pushUndo()`, `pushUndoInitial()`, `undo()`, `redo()` → `src/admin/undo.js`
- Importar en admin-main.js
- Exponer a window (por ahora mantener patrón onclick)
- Build + verificar

## Bloque 3: Matar core.js — Parte 2: Extraer auto-save
- `autoSave()`, `saveAll()`, `showSaving()` → `src/admin/autosave.js`
- Importar donde se necesite
- Build + verificar

## Bloque 4: Matar core.js — Parte 3: Extraer preview sync
- `_sendLiveUpdate()`, `_startLiveEdit()`, `_clearLiveEdit()`, `_sendBeatRevert()`
- `_attachLiveListeners()`, postMessage handlers
- → `src/admin/live-edit.js`
- Build + verificar

## Bloque 5: Matar core.js — Parte 4: Extraer theme IO
- `collectTheme()`, `loadThemeUI()`, `exportAll()`, `importAll()`, `exportCSS()`
- `renderPresets()`, `applyPreset()`, `renderSaveSlots()`, etc.
- → `src/admin/theme-io.js`
- Build + verificar

## Bloque 6: Matar core.js — Parte 5: Extraer gradient editor
- `renderGradEditor()`, `buildGradCSS()`, `addGradStop()`, etc.
- → `src/admin/gradient.js`
- Build + verificar

## Bloque 7: Matar core.js — Parte 6: Resto
- Hero preview, particles, floating elements, emoji, text colorizer
- → archivos separados según categoría
- core.js debería quedar < 200 líneas (solo init + wiring)
- Build + verificar

## Bloque 8: Limpiar CSS !important
- Quitar `!important` de `.etp` rules (ya no se necesitan con inline styles)
- Quitar `.etp:not(.on) > *` visibility backup
- Verificar que tabs siguen funcionando

## Bloque 9: Migrar onclick → addEventListener
- Empezar por beats.js (el que más se toca)
- Ir archivo por archivo
- Patrón: `el.addEventListener('click', handler)` en init function
- Build + verificar cada archivo

## Bloque 10: Tests básicos del admin
- Test `showEt()` — verificar que solo un panel tiene display:block
- Test `openEditor()` — verificar que campos se llenan
- Test `saveBeat()` — verificar que datos se serializan bien
- Test `prevImg()` — verificar que galería se puebla

---

## Progreso
- 2026-04-13: Plan creado. Bloque 1 en progreso.
