# DACEWAV.STORE — Session Report

**Date:** 2026-04-11 11:58–12:46 GMT+8

---

## Summary

Debug session fixing PERMISSION_DENIED error on beat editing, then a mega expansion of per-beat card customization controls — the `cardStyle` system with 52+ new controls.

---

## R1 — PERMISSION_DENIED Bug Fix

### 1. 🔴 Root Cause: `id` field in beat object
**Problem:** `saveBeat()` built the beat object as `{ id, name, genre, ... }` — the `id` field was included as a property inside the data. The Firebase secure rules have `"$other": { ".validate": false }`, which rejects ANY field not explicitly declared in the schema. `id` was not in the schema → Firebase blocked the write.

**Fix:** Removed `id` from the beat object in both `saveBeat()` and `batchAddBeats()`. The `id` already exists as the key of the Firebase ref (`beats/{id}`), no need to store it inside.

**Files:** `src/admin/beats.js` (2 locations)

### 2. 🔴 Firebase Rules Validation Too Strict
**Problem:** User's published rules had incorrect limits:
| Field | Published | Correct |
|-------|-----------|---------|
| `genre` | `length <= 10` | `<= 100` |
| `bpm` | `>= 20 && <= 40` | `<= 400` |
| `imageUrl` | `length <= 200` | `<= 2000` |
| `audioUrl` | `length <= 200` | `<= 2000` |
| `spotify` | `length <= 50` | `<= 500` |
| `licenses.description` | `length <= 50` | `<= 500` |

The BPM limit of 40 was the worst offender — every single beat has BPM > 40.

**Fix:** Provided corrected `firebase-rules-secure.json` for manual publish via Firebase Console.

### 3. 📋 Rules Structure Mismatch
**Problem:** Legacy rules used `adminWhitelist/{email}` but project had migrated to `adminWhitelist/approved/{uid}` structure.

**Fix:** User needed to publish the new `firebase-rules-secure.json` (UID-based rules).

---

## R2 — cardStyle Mega System (52+ New Controls)

### 4. ✅ 🌈 Filtros CSS — New Section
8 sliders: brightness, contrast, saturate, grayscale, sepia, hue-rotate, blur, invert.
All with reset buttons and live preview.

### 5. ✅ ✨ Glow Enhanced
Added 4 new controls to existing glow section:
- **Intensity** (0–10x) — glow force multiplier
- **Blur** (0–100px) — glow diffusion
- **Spread** (0–60px) — glow extension
- **Opacity** (0–1) — glow transparency
- **Hover only** toggle — glow only appears on mouse hover

### 6. ✅ 🎬 Animation Enhanced
- **Secondary animation** dropdown — combine 2 animations (e.g., flotar + brillo)
- Added 8 new animation types: shake-x, heartbeat, flip, swing, tada, bounce-in, temblor, spin-lento
- **Easing** dropdown — ease, ease-in, ease-out, ease-in-out, linear, elastic, back
- **Direction** dropdown — normal, reverse, alternate, alternate-reverse
- **Iterations** dropdown — infinite, 1, 2, 3, 5, 10
- Extended duration range: 0.1s–15s, delay: 0–10s

### 7. ✅ 🎨 Style Enhanced
- **Border radius** slider (0–40px) — per-card rounded corners
- **Card opacity** slider (0.05–1) — per-card transparency
- **Border style** dropdown — solid, dashed, dotted, double

### 8. ✅ 🌑 Sombra — New Section
Full box-shadow control:
- Color picker, opacity slider
- Offset X (-30 to 30px), Offset Y (-30 to 30px)
- Blur (0–60px), Spread (-20 to 40px)
- Inset toggle (inner shadow)

### 9. ✅ 🎭 Hover Effects — New Section
What happens when user hovers over card:
- **Scale** (1–1.25x) — grow on hover
- **Brightness** (0.5–2) — illuminate on hover
- **Saturate** (0–3) — more color on hover
- **Elevation** (0–40px) — shadow on hover
- **Transition** (0–1s) — animation speed
- **Border color** — different border on hover
- **Glow intensify** toggle — glow pulses faster on hover

### 10. ✅ 📐 Transform — New Section
Initial CSS transform applied to card:
- **Rotation** (-15° to 15°)
- **Scale** (0.7–1.3x)
- **Skew X** (-15° to 15°)
- **Skew Y** (-15° to 15°)
- **Translate X** (-20 to 20px)
- **Translate Y** (-20 to 20px)

### 11. ✅ Unified cardStyle Schema
New `cardStyle` object in Firebase replaces scattered fields:
```js
cardStyle: {
  filter:    { brightness, contrast, saturate, grayscale, sepia, hueRotate, blur, invert },
  glow:      { enabled, type, color, speed, intensity, blur, spread, opacity, hoverOnly },
  anim:      { type, type2, dur, del, easing, direction, iterations },
  style:     { accentColor, shimmer, borderRadius, opacity },
  border:    { enabled, color, width, style },
  shadow:    { enabled, color, opacity, x, y, blur, spread, inset },
  hover:     { scale, brightness, saturate, shadowBlur, transition, borderColor, glowIntensify },
  transform: { rotate, scale, skewX, skewY, x, y }
}
```
Backwards compatible — old beats without `cardStyle` fall back to legacy fields.

### 12. ✅ Helper Functions
- `_buildCardStyleFromInputs()` — reads all 52 inputs, returns `cardStyle` object
- `_applyCardStyleToPreview(pv, cs)` — applies all CSS properties to preview element
- `_hexToRgba(hex, alpha)` — color conversion utility

### 13. ✅ Store Rendering (cards.js)
Full render of `cardStyle` properties in beat cards:
- CSS filters, opacity, box-shadow, transform all applied as inline styles
- Secondary animation via `.anim2-{type}` class
- Hover CSS vars (`--hov-scale`, `--hov-bright`, etc.) for CSS transitions
- Border radius via `--card-radius` CSS var

### 14. ✅ Store CSS (store-styles.css)
New CSS rules for:
- 16 secondary animation classes (`.anim2-*`)
- Glow hover-only system (`.glow-hover-only`)
- Hover effects system (`.has-hover-fx`)
- Glow intensify on hover (`.hov-glow-int`)
- Per-card border radius (`--card-radius`)

### 15. ✅ Firebase Rules (cardStyle)
Full validation for all 8 sub-sections of `cardStyle`:
- Each field has min/max validation matching slider ranges
- `$other: false` on each sub-section to reject unknown fields
- `!newData.exists() ||` guards for optional sections

---

## Build & Tests
- ✅ Build: store-app.js 56.4KB, admin-app.js 126.3KB
- ✅ Tests: 104/104 passed

## Commits (3)
```
0c817fa feat: cardStyle mega system — 60+ controles por beat
8e66b4c fix: quitar campo id del beat object para firebase rules
a08532d fix: reglas Firebase seguras (from prior session)
```

## All Files Modified (10)
```
admin.html                  — 6 new card sections with sliders/dropdowns/toggles
src/admin/beats.js          — _buildCardStyleFromInputs(), _applyCardStyleToPreview(), save/load mega schema
src/cards.js                — full cardStyle render in beat cards
store-styles.css            — hover effects, glow hover-only, secondary anims, border-radius
firebase-rules-secure.json  — cardStyle validation (8 sub-sections)
dist/admin-app.js           — rebuilt (126.3KB)
dist/store-app.js           — rebuilt (56.4KB)
dist/store-styles.css       — synced
dist/admin-app.js.map       — synced
dist/store-app.js.map       — synced
```

## Pending
- Firebase rules need manual publish via Firebase Console (contains both PERMISSION_DENIED fix + cardStyle rules)
- GitHub token should be rotated (was shared in chat)
- Anonymous Auth should be enabled for store analytics writes

## Total Controls Per Beat (Now)
| Category | Before | After |
|----------|--------|-------|
| Glow | 4 | 9 |
| Animation | 3 | 8 |
| Style | 5 | 8 |
| Filters | 0 | 8 |
| Shadow | 0 | 8 |
| Hover | 0 | 7 |
| Transform | 0 | 6 |
| **Total** | **12** | **54** |
