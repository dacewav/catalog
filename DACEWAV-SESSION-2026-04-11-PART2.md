# DACEWAV.STORE — Session Report (Part 2)

**Date:** 2026-04-11 10:56–11:53 GMT+8

---

## Summary

Continuation session focused on per-beat card animations, Firebase security hardening, and admin UX improvements.

---

## R1 — Per-Beat Card Animations & Styles (UI + Logic)

### 1. ✅ Card Animation Controls in Extras Tab
**What:** New UI section "🎬 Animación de tarjeta" in beat editor → Extras tab.
**Features:**
- 17 animation types dropdown (flotar, pulsar, respirar, latido, rebotar, balanceo, brillo, cambio-color, holograma, neon-flicker, glitch, drift, zoom-in, pop, rubber-band, jello, wobble)
- Duration slider (0.3s–10s)
- Delay slider (0–5s)

### 2. ✅ Card Style Controls in Extras Tab
**What:** New UI section "🎨 Estilo de tarjeta" in beat editor → Extras tab.
**Features:**
- Accent color picker + hex input (bidirectional sync)
- Shimmer toggle (always-visible, not just hover)
- Custom border: toggle + color picker + width slider (1–5px)

### 3. ✅ Save/Load for New Fields
**What:** `beats.js` — `openEditor()` loads, `saveBeat()` persists.
**Data structure per beat:**
```js
cardAnim: { type: "flotar", dur: 2, del: 0 }  // or null
accentColor: "#dc2626"
shimmer: true/false
cardBorder: { enabled: true, color: "#dc2626", width: 2 }
```

### 4. ✅ Store Rendering (cards.js)
**What:** `beatCard()` applies animation classes, inline styles, shimmer class.
- `anim-{type}` class with `--ad` and `--adl` CSS vars
- `shimmer-on` class for permanent shimmer effect
- Inline border style from `cardBorder`
- `--card-tint` gradient from `accentColor`

### 5. ✅ Shimmer CSS (store-styles.css)
**What:** Added `.beat-card.shimmer-on .shimmer-overlay { opacity: 1 }` for always-visible shimmer.

---

## R2 — Edit Beat Fixes

### 6. ✅ Color Sync & Slider Display Fix
**Problem:** When editing existing beats, color picker/hex input weren't synced, slider value text showed defaults.
**Fix:**
- `syncSliderDisplay(id)` — updates slider text after programmatic `setVal()`
- `syncAccentColor(source)` — bidirectional picker ↔ hex sync
- `openEditor()` calls `syncSliderDisplay()` for anim-dur, anim-del, border-width
- HTML `oninput` handlers on accent color picker + hex input

---

## R3 — Firebase Security Rules (UID-based)

### 7. ✅ New Whitelist Structure
**Problem:** Old rules used `".read": true` at root (exposed adminWhitelist, settings, theme, team). `replace('.',',')` in rules caused Firebase parser errors.
**Solution:** UID-based whitelist with pending queue.

**New Firebase structure:**
```
adminWhitelist/
  approved/
    {uid}: "email"          ← approved admins (by UID)
  pending/
    {encoded_email}: true   ← waiting for first login
```

**New rules check:**
```
root.child('adminWhitelist/approved').child(auth.uid).exists()
```

### 8. ✅ Auto-Resolve Pending Flow
**How it works:**
1. Admin adds email in Equipo → saved to `pending/`
2. That person logs in → system detects email in pending
3. Moves their UID to `approved/`, removes from `pending/`
4. Bootstrap: first login of daceidk auto-registers UID `Uks9YGSd6rS40zqlRujoe6pE6N22`

### 9. ✅ Admin Whitelist UI Updated
- Shows approved members with UID snippet and ✅ icon
- Shows pending members with ⏳ clock icon and "Esperando login" label
- Add → goes to pending; remove works for both approved and pending

---

## R4 — Live Beat Card Preview in Admin

### 10. ✅ Real-Time Preview in Extras Tab
**What:** Mini beat card preview at top of Extras tab that updates live as you change settings.
**Features:**
- Shows beat name, BPM, key, genre, image
- Glow effects (all 5 types) with correct colors
- Card animations (all 17 types) with correct timing
- Shimmer overlay
- Custom border
- Accent color gradient
- Updates on every input change (oninput/onchange)
- Admin-only — does not affect store

**CSS:** Full animation keyframe set (bcpv-*) and glow keyframes (bcpv-glow-*) added to admin.html.

---

## Build & Tests
- ✅ Build: store-app.js 53.8KB, admin-app.js 119.2KB
- ✅ Tests: 104/104 passed

## Commits (6)
```
2f466c5 feat: whitelist por UID con auto-resolve de pending
a08532d fix: quitar $other duplicado en reglas Firebase
9658458 fix: animaciones y estilos de tarjeta funcionan en editar beat
5600d86 feat: animaciones por tarjeta de beat - editor + store
1a22031 fix: reglas Firebase seguras — cerrar exposición de datos admin
```

## All Files Modified (9)
```
admin.html                  — preview card CSS, preview HTML in extras, oninput handlers
src/admin/beats.js          — updateCardPreview(), syncSliderDisplay(), syncAccentColor()
src/admin/firebase-init.js  — UID-based whitelist with pending auto-resolve
src/cards.js                — cardAnim/accentColor/shimmer/cardBorder rendering
store-styles.css            — shimmer-on class
firebase-rules-secure.json  — UID-based rules
dist/store-app.js           — rebuilt
dist/admin-app.js           — rebuilt
dist/store-styles.css       — synced
```

## Pending / Notes
- Firebase rules need to be published manually via Firebase Console
- Anonymous Auth should be enabled for store analytics writes to work
- Bootstrap UID `Uks9YGSd6rS40zqlRujoe6pE6N22` hardcoded for daceidk@gmail.com
- Other admins (xiligamesz, prodxce) should be added via Equipo tab → pending queue
