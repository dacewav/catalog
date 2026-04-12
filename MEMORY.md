# Catalog Project Memory

## 2026-04-13 — Beat Editor Extras Tab Fixes

### Session context
Fixed real-time preview sync and image upload live update in the beat editor's Extras tab.

### What was fixed

**1. `beat-card-style.js` — `updateCardPreview()` now triggers live updates**
- Added a debounced `_sendLiveUpdate()` call at the end of `updateCardPreview()`
- Previously, live updates relied solely on event delegation catching bubbled `input`/`change` events
- This was fragile: programmatic value changes (like `setVal('f-img', url)`) don't dispatch `input` events
- Now EVERY call to `updateCardPreview()` (from all sliders, selects, checkboxes, toggles) also triggers a live store update (300ms debounce)

**2. `beats.js` — `prevImg()` now triggers live updates**
- Added debounced `_sendLiveUpdate()` call so image URL changes (typed, pasted, or uploaded) sync to the store
- The upload handler `uploadBeatImg()` already called `_triggerLiveUpdate()` after upload, but manual URL entry didn't

### Architecture: Live Update Flow

```
User interacts with control
  → input/change event bubbles to #sec-add
  → event delegation catches it
  → _debouncedPv() fires
  → updateCardPreview() [renders local preview]
  → renderFullPvInCard() [renders #pv-full-card-container]
  → _sendLiveUpdate() [syncs to store iframe + Firebase]

BUT ALSO (NEW):
  → updateCardPreview() itself now calls _sendLiveUpdate() (debounced)
  → prevImg() itself now calls _sendLiveUpdate() (debounced)
```

This dual-path ensures updates reach the store even when:
- Values are set programmatically (no event fires)
- Event delegation isn't attached yet
- The source doesn't directly call `_sendLiveUpdate()`

## 2026-04-13 — beat-preview.js never imported (vista previa rota)

### Bug
La vista previa de tarjeta en el tab Extras (`#pv-full-card-container`) no aparecía nunca.

### Root cause
`beat-preview.js` (que define `renderFullPvInCard` y `_buildCardHTML`) **nunca fue importado** por ningún módulo. Solo se mencionaba en un comentario en `beats.js`. Todas las llamadas a `window.renderFullPvInCard()` fallaban silenciosamente porque `typeof window.renderFullPvInCard === 'undefined'`.

### Fix
- Agregué `import './admin/beat-preview.js';` en `admin-main.js` (antes de `beats.js`)
- Corregí un typo de quote en `beat-preview.js:70` (extra `'` al final de un `s.push()`)
- El bundle creció de 221KB → 233.9KB (el módulo ahora sí está incluido)

### Lesson
Los módulos que se asignan a `window.*` necesitan ser importados explícitamente en el entry point (`admin-main.js`) — aunque otros módulos los usen vía `window.functionName`, el import del módulo que DEFINE la función es independiente.

### Files modified (this session)
- `/catalog/src/admin/beat-card-style.js` — added debounced `_sendLiveUpdate()` at end of `updateCardPreview()`
- `/catalog/src/admin/beats.js` — added debounced `_sendLiveUpdate()` in `prevImg()`
- `/catalog/src/admin-main.js` — added `import './admin/beat-preview.js'`
- `/catalog/src/admin/beat-preview.js` — fixed syntax error (extra quote on line 70)

### Verification
- `#pv-full-card-container` exists in admin.html line 586 (Extras tab)
- `renderFullPvInCard()` in beat-preview.js targets `document.getElementById('pv-full-card-container')`
- Build succeeds: `dist/admin-app.js` 221.3KB
