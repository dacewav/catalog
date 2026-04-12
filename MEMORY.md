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

### Files modified
- `/catalog/src/admin/beat-card-style.js` — added debounced `_sendLiveUpdate()` at end of `updateCardPreview()`
- `/catalog/src/admin/beats.js` — added debounced `_sendLiveUpdate()` in `prevImg()`

### Verification
- `#pv-full-card-container` exists in admin.html line 586 (Extras tab)
- `renderFullPvInCard()` in beat-preview.js targets `document.getElementById('pv-full-card-container')`
- Build succeeds: `dist/admin-app.js` 221.3KB
