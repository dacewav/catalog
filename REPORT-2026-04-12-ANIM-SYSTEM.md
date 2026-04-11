# Report — Animation System Overhaul (2026-04-12)

## Summary
Complete fix and redesign of the animation system in the admin panel and store. Addresses broken Animation 2 (combo), meaningless intensity slider, and missing holograma custom colors.

---

## Bugs Fixed

### 1. Animation 2 (Combo) Not Working
- **Root cause:** `.beat-card::before { display: none }` in `store-styles.css` line 302 was hiding the `::before` pseudo-element that ALL anim2 effects depend on.
- **Fix:** Added `.beat-card[class*="anim2-"]::before { display: block }` to override when anim2 is active.
- **Files:** `store-styles.css:303`, `store-styles.css:600`

### 2. Intensity Slider Did Nothing
- **Root cause:** `--anim-int` CSS variable was set but only used by ~15 of 30+ animation keyframes. Many animations ignored it entirely.
- **Fix:** Repurposed intensity to control **animation speed** via duration calculation: `effectiveDuration = baseDuration / (intensity / 100)`.
  - 100% = normal speed (2s)
  - 200% = 2x faster (1s)
  - 50% = 2x slower (4s)
  - Range increased from 0-100% to 10-300%
- **Files:** `src/cards.js:92-95`, `src/admin/beats.js:764-766`, `admin.html:2379`, `src/admin/card-style-ui.js:103`

### 3. Holograma Custom Colors Ignored in Store
- **Root cause:** Store always applied class `anim-holograma` (hue-rotate rainbow mode) regardless of `holoDir` setting. The CSS classes `anim-holograma-gradient` and `anim-holograma-pulse` (which use `--holo-c0..c3` custom colors) were never applied.
- **Fix:** Added `holoDir` check in `src/cards.js:86-89`:
  - `holoDir=hue` → `anim-holograma` (rainbow via hue-rotate)
  - `holoDir=gradient` → `anim-holograma-gradient` (custom linear gradient)
  - `holoDir=pulse` → `anim-holograma-pulse` (custom colors cycling)
- **Also fixed:** Store now sets `--holo-c0..c3` CSS variables with custom colors (`src/cards.js:102-109`)
- **Also fixed:** Firebase array normalization for `holoColors` field (Object → Array)

### 4. Presets Didn't Reset Old Values
- **Root cause:** `applyPreset()` only set fields the preset defined, leaving old values from previous presets active.
- **Fix:** Added full field reset (all ~80 fields to defaults) before applying preset values. Uses IIFE wrappers to avoid variable name conflicts.
- **File:** `src/admin/beats.js:288-343`

### 5. `_sendLiveUpdate` Not on Window
- **Root cause:** `_sendLiveUpdate()` was a local IIFE function. `applyPreset()`, `applyHoverPreset()`, `resetCardStyle()` all called `window._sendLiveUpdate()` which was `undefined`.
- **Fix:** Changed `function _sendLiveUpdate()` → `window._sendLiveUpdate = function _sendLiveUpdate()`
- **File:** `src/admin/beats.js:1511`

---

## New Features

### Global Card Style ("Tarjetas" Section)
- New admin sidebar section for global card style defaults
- All card style controls: filters, glow, animation, style, border, shadow, hover, transform
- Real-time preview card with event delegation (every slider/color updates preview instantly)
- Save/Reset/Apply-to-All buttons
- Store merges global → beat.cardStyle (beat wins if `_customStyle: true`)
- Beats without custom styles inherit from global automatically

### Per-Beat "Use Global" Button
- "🌐 Usar estilo global" button in beat editor Extras tab
- Loads global style values into all fields for the current beat

### _customStyle Flag
- `beat._customStyle: true` set on save when beat has non-default styles
- Store checks this flag to decide whether to use beat-specific or global style
- "⚡ Aplicar a TODOS" sets `_customStyle: false` on all beats

---

## Architecture Notes

### Animation Speed vs Magnitude
- **Speed** → controlled by "⚡ Velocidad" slider (affects `--ad` duration)
- **Magnitude** → controlled by per-animation sub-settings sliders:
  - Flotar/Rebotar: Translate X/Y pixels
  - Pulsar/Respirar/Latido: Scale min/max
  - Holograma: Colors, brightness, saturation ranges
  - Glitch: Distance X/Y, rotation
  - etc.
- `--anim-int` CSS variable now defaults to 1 (not explicitly set by admin)

### CSS Classes for Holograma
```
anim-holograma           → hue-rotate rainbow (default)
anim-holograma-gradient  → custom linear-gradient colors
anim-holograma-pulse     → custom colors cycling
```

### Communication Channels (Unchanged)
```
Admin → Store (same tab, iframe): postMessage({ type: 'beat-update', ... })
Admin → Store (separate window):  Firebase: liveEdits/{beatId}
Store ↔ Store (cross-tab):        localStorage + storage event
```

---

## Remaining Improvements (TODO)

1. **Per-animation independent panels** — Each animation type could have fully independent sub-settings with relevant sliders only (partially done, needs more work)
2. **Animation 2 independent speed** — Anim2 currently shares duration with anim1 via `--ad`
3. **Live preview for global section** — Preview card exists but doesn't show all animation types (needs CSS keyframes imported)
4. **Preset categories** — Group presets by style (Minimal, Luxury, Neon, Dark, etc.)
5. **Export/Import styles** — JSON export of cardStyle for backup/sharing
6. **Style inheritance visualization** — Badge showing which beats use global vs custom

---

## Files Modified

| File | Changes |
|------|---------|
| `store-styles.css` | anim2 `::before` display fix, holograma CSS vars |
| `src/cards.js` | Holograma holoDir suffix, custom colors, Firebase normalization, intensity→speed |
| `src/admin/beats.js` | _sendLiveUpdate on window, preset full reset, intensity→speed, _customStyle flag |
| `src/admin/card-style-ui.js` | Reusable controls generator, velocity slider |
| `src/admin/card-global.js` | Global section logic (save/load/reset/preview/apply-to-all) |
| `src/admin/nav.js` | Init global controls on section show |
| `src/admin-main.js` | Import card-global module |
| `admin.html` | Tarjetas sidebar item, section, preview card, velocity label |
| `src/admin-main.js` | Import card-global module |

---

## Testing
- 87/87 unit tests passing
- Build produces correct bundles for both store and admin
- Manual testing needed: holograma gradient/pulse with custom colors on live store
