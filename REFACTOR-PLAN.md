# DACEWAV — Refactor Master Plan (Admin + Store)

## Objetivo
Simplificar TODO el código sin cambiar funcionalidad. Admin Y Store optimizados.
Menos bugs, más mantenible, código que coincida entre ambos lados.

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


---

# 🛒 STORE — Optimización (SIGUIENTE DESPUÉS DEL ADMIN)

## Estado: SIN optimizar (2952 líneas en 15 archivos)

## Archivos de la store
| Archivo | Líneas | Rol |
|---------|--------|-----|
| src/main.js | 474 | Entry point + Firebase sync + live edit |
| src/cards.js | 525 | Card render + modal + OG tags |
| src/effects.js | 346 | Animations, tilt, counters, particles |
| src/player.js | 277 | Audio player |
| src/settings.js | 280 | Site settings + floating elements render |
| src/theme.js | 230 | Theme CSS application |
| src/filters.js | 224 | Advanced filters + tag cloud |
| src/waveform.js | 126 | Waveform bars |
| src/wishlist.js | 110 | Wishlist system |
| src/hash-router.js | 91 | Hash-based routing |
| src/analytics.js | 72 | Firebase analytics |
| src/error-handler.js | 72 | Error handling |
| src/utils.js | 67 | Helpers |
| src/state.js | 34 | Global state |
| src/config.js | 24 | Constants |
| store-styles.css | 762 | All store CSS |

## Bloques de optimización store

### Store-1: main.js — reducir (474 líneas)
- El sync de Firebase (liveEdits listener) es la parte más grande
- Separar live-edit sync a `src/live-edit.js`
- Separar banner/stats a `src/store-init.js`

### Store-2: cards.js — reducir (525 líneas)
- `beatCard()` es la función más grande (render de card HTML)
- `openModal()` tiene mucho HTML inline
- Separar modal a `src/modal.js`
- Separar OG tags a `src/og-tags.js`

### Store-3: effects.js — reducir (346 líneas)
- Particles, tilt, counters, stagger observer
- Separar particles a `src/particles.js`
- Separar tilt + stagger a `src/card-effects.js`

### Store-4: Limpiar CSS
- store-styles.css tiene 762 líneas con muchos keyframes
- Los keyframes de glow son duplicados del admin
- Verificar que no hay !important wars

### Store-5: Nombres consistentes admin↔store
- Admin usa `name`, store debería usar `name` (no `title`)
- Admin usa `imageUrl`, store debería usar `imageUrl` (no `coverUrl`)
- Verificar que Firebase data model es consistente

### Store-6: Tests
- Ya hay tests para filters, cards, player, utils
- Agregar tests para modal, wishlist, live-edit sync
