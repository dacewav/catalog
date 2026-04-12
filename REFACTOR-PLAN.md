# DACEWAV Admin — Refactor Master Plan

## Objetivo
Simplificar el admin sin cambiar funcionalidad. Menos bugs, más mantenible.

## Reglas
- **Cada bloque se testea en browser ANTES de pasar al siguiente**
- Zero cambios de funcionalidad visible (solo refactor interno)
- Build + commit después de cada bloque

---

## Progreso core.js: 1405 → 1271 líneas (-134)

## ✅ Completados

### Bloque 1: Cache busting automático
- build.js calcula MD5 hash de CSS/JS, reescribe HTML con ?v=HASH
- Commit: `8df3c88`

### Bloque 2: Undo/Redo → undo.js (68 líneas)
- Dependency injection via `setUndoDeps()` rompe circularidad
- cmd-palette.js importa de undo.js
- Commit: `b0033ff`

### Bloque 3: Gradient Editor → gradient.js (133 líneas)
- renderGradEditor, buildGradCSS, addGradStop, updateGradStop, rmGradStop, startDragStop, applyGradToHero
- Cero dependencias circulares

### Bloque 4: Change Log + Tooltips → changelog.js (109 líneas)
- logChange, renderChangeLog, logFieldChange, addTooltips
- TRACKED_FIELDS + TOOLTIPS extraídos como constantes

### Bloque 5: Floating Elements → floating.js (148 líneas)
- renderFloatingEditor, renderFloatingPreview, addFE, saveFE, rmFE

Bloques 3-5 commit: `352f793`

---

## ⏳ Pendientes (en orden de dificultad)

### Bloque 6: Snapshots + Diff
Funciones: takeSnapshot, renderSnapshots, loadSnapshot, rmSnapshot, populateDiffSelects, updateDiff
Dependen de: setT, loadThemeUI, autoSave (circular) → usar dependency injection
Archivo: `src/admin/snapshots.js`

### Bloque 7: Emoji System
Funciones: renderEmojiGrid, insertEmoji, renderCustomEmojis, addCustomEmoji, uploadEmojiFile, removeCE
Dependen de: customEmojis de state.js, db de state.js
Archivo: `src/admin/emojis.js`

### Bloque 8: Export/Import
Funciones: exportAll, importAll, exportCSS, promptImportURL, importThemeFromURL
Dependen de: collectTheme, loadThemeUI, autoSave (circular)
Archivo: `src/admin/export.js`

### Bloque 9: Hero Preview + Banner + Divider
Funciones: updateHeroPv, updateBannerPv, updateDividerPv, setupHeroSync
Dependen de: muchas vars de state.js + helpers.js
Archivo: `src/admin/hero-preview.js`

### Bloque 10: Glow System
Funciones: updateGlowDesc, updateGlowAnimDesc, computeGlowCSS, applyGlowTo, applyGlowPreset
Archivo: `src/admin/glow.js`

### Bloque 11: Text Colorizer
Funciones: initTextColorizers, tczSetColor, tczMarkPreset, tczWordClick, tczClearColors, tczSplitAtCursor, tczGetSegments, segmentsToHTML
Archivo: `src/admin/text-colorizer.js` (ya existe, mover de core.js)

### Bloque 12: Auto-Save + Broadcast (dejar para el final)
autoSave, saveAll, _collectSiteSettings, broadcastTheme, broadcastThemeNow, postToFrame
Son el núcleo de core.js — extraer cuando todo lo demás esté fuera.

### Bloque 13: Theme collect/load
collectTheme, loadThemeUI, loadSettingsUI
Son las funciones más grandes y con más deps — extraer al final.

### Bloque 14: Limpiar CSS !important
Quitar `!important` de `.etp` rules (ya no se necesitan con inline styles).

### Bloque 15: Migrar onclick → addEventListener
Empezar por beats.js, ir archivo por archivo.

### Bloque 16: Tests básicos del admin
Test showEt, openEditor, saveBeat, prevImg.

---

## Archivos del admin (actualizado)
| Archivo | Líneas | Rol |
|---------|--------|-----|
| src/admin/core.js | 1271 | Main module (era 1405) |
| src/admin/undo.js | 68 | Undo/redo |
| src/admin/gradient.js | 133 | Gradient editor |
| src/admin/changelog.js | 109 | Change log + tooltips |
| src/admin/floating.js | 148 | Floating elements |
| src/admin/beats.js | 460 | CRUD beats |
| src/admin/theme.js | 472 | Theme editor |
| src/admin/settings.js | 373 | Config + precios |
| src/admin/card-style-ui.js | ~400 | Style control generator |
| src/admin/beat-card-style.js | ~200 | Card style reader |
| src/admin/beat-preview.js | ~400 | Preview + image history |
