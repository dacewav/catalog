# Report — Live Edit / Real-Time Preview (2026-04-12)

## Problem Summary
Beat style presets and per-field edits in the admin panel don't reflect in real-time on the live store (dacewav.store). The admin preview works, but the customer-facing store doesn't update until a page refresh.

## Root Cause Chain (5 issues found and fixed)

### 1. `localStorage` events don't fire in same tab
- **Where:** `src/admin/beats.js` `_sendLiveUpdate()`
- **What:** Admin used `localStorage.setItem('dace-live-edit', ...)` to communicate with the store. The `storage` event only fires in OTHER tabs/windows, not the same tab.
- **Fix:** Added `postMessage` to the store iframe + Firebase write to `liveEdits/{beatId}`.

### 2. `pvFields` array only had 11 of ~80 fields
- **Where:** `src/admin/beats.js` `_attachLiveListeners()`
- **What:** Only basic fields (name, bpm, key, genre, etc.) had input listeners. CSS filters, glow, animation, shadow, hover, transform fields had NO listeners.
- **Fix:** Replaced per-field listeners with event delegation on `#sec-add`.

### 3. Presets didn't trigger live update
- **Where:** `src/admin/beats.js` `applyPreset()` and `applyHoverPreset()`
- **What:** `setVal()` sets values programmatically without firing `input`/`change` events. Event delegation never triggered.
- **Fix:** Added explicit `_sendLiveUpdate()` calls after `updateCardPreview()`.

### 4. `admin-batch-update` message type not handled by store
- **Where:** `src/admin/core.js` `_doBroadcast()` + `src/main.js` message handler
- **What:** Optimized to send 1 batch message instead of 4 individual messages, but store had no handler for the new type.
- **Fix:** Added `admin-batch-update` handler in store + kept backwards compat with individual types.

### 5. `db` reference null in IIFE (CURRENT ISSUE)
- **Where:** `src/admin/beats.js` IIFE + `src/admin/firebase-init.js`
- **What:** The IIFE that defines `_sendLiveUpdate()` captures `db` from `state.js` at module load time. At that point, `db` is `null` (firebase-init hasn't run yet). Later calls use the stale `null` reference.
- **Fix:** `firebase-init.js` sets `window._db = database`. `beats.js` uses `window._db || db` at call time.

## Architecture: Three Communication Channels

```
Admin → Store (same tab, iframe)
  └→ postMessage({ type: 'beat-update', ... })

Admin → Store (separate windows, e.g. dacewav.store)
  └→ Firebase: liveEdits/{beatId}

Store → Store (cross-tab sync, fallback)
  └→ localStorage 'dace-live-edit' + storage event
```

For global settings (theme, settings, emojis, floating):
```
Admin → Store
  └→ postMessage({ type: 'admin-batch-update', ... })
```

## Firebase Rules — `liveEdits` Path (REQUIRED)
```json
"liveEdits": {
  ".read": true,
  ".write": "auth != null && root.child('adminWhitelist/approved').child(auth.uid).exists()"
}
```
This MUST be in Firebase Console → Realtime Database → Rules. Without it, the admin cannot write preview data.

## Files Modified

| File | Changes |
|------|---------|
| `src/admin/beats.js` | Event delegation, presets trigger live update, reset button, `window._db`, accent propagation, filter check fix |
| `src/admin/core.js` | Exported `postToFrame()`, batch message |
| `src/admin/firebase-init.js` | Sets `window._db` alongside `setDb()` |
| `src/main.js` | `admin-batch-update` handler, `liveEdits` Firebase listener with logging |
| `src/cards.js` | Accent color propagation to `--btn-lic-clr`, `--btn-lic-bdr`, `--btn-lic-bg`, `--accent` |
| `admin.html` | Scoped CSS for `.btn-lic` uses CSS variables |
| `firebase-rules-secure.json` | Added `liveEdits` path |

## Known Remaining Issues

1. **Store `liveEdits` listener** — Added logging. Need to verify in console:
   - `[LiveEdit:store] liveEdits changed, count: 1` should appear when admin applies preset
   - If no message appears, Firebase read is failing (check rules)

2. **Accent color mismatch** — Store propagates `accentColor` to button/glow CSS vars. Admin preview does the same. But global theme colors (btn-lic-clr from theme) may still differ from per-beat overrides.

3. **Filter check mismatch (fixed)** — Admin `_applyCardStyleToPreview()` was adding `brightness(undefined)` for beats without filters. Now uses `!= null` check matching store.

4. **CORS on CDN** — `cdn.dacewav.store` missing `Access-Control-Allow-Origin` header. Blocks waveform generation (unrelated to live edit).

5. **Analytics permission denied** — Store writes to `/analytics/*` without auth. Needs public write rule or auth for store analytics.

## How to Test Live Edit

1. Open `dacewav.store/admin.html` → F12 → Console
2. Verify: `[DACE Admin] Firebase DB ready, window._db set`
3. Open a beat editor (click ✎ on any beat)
4. Verify: `[LiveEdit] delegation listeners attached`
5. Apply a preset (e.g. Luxury Glass)
6. Check store console (open store in separate tab, F12):
   - Should see: `[LiveEdit:store] liveEdits changed, count: 1`
   - Card should update with preset styles

## Quick Reference: Adding Future Real-Time Features

To send data from admin to store in real-time:

```js
// In any admin module:
import { postToFrame } from './core.js';

// For iframe (same tab):
postToFrame({ type: 'my-update', data: myData });

// For live store (separate window):
import { db } from './state.js';
// Use window._db for IIFE contexts:
var _db = window._db || db;
_db.ref('liveEdits/' + beatId).update({ myField: value });
```

```js
// In main.js (store):
// Add handler in the message listener:
} else if (d.type === 'my-update' && d.data) {
  // handle it
}
// Or add a Firebase listener:
state.db.ref('myPath').on('value', (snap) => { ... });
```
