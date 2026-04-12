# DACEWAV.STORE — MEGA PROMPT: Full Interface Rebuild

**Date:** 2026-04-12
**Purpose:** Rebuild the entire admin interface (admin.html) from scratch with a clean, modular, professional design. Keep ALL existing functionality. Fix all visual bugs. Make it production-grade.

---

## 1. PROJECT OVERVIEW

**What is this?** A beat store admin panel + public storefront for a music producer ("DACE"). The admin controls everything: beats, themes, animations, hover effects, card styles, hero section, settings. The store is the public-facing catalog at `dacewav.store`.

**Stack:** Vanilla HTML/CSS/JS. No frameworks. Firebase Realtime Database + Auth. Cloudflare Pages + R2 for CDN. esbuild for bundling store JS.

**Current problem:** The admin is a single 3100+ line `admin.html` file with inline CSS, HTML, and JS. Layout bugs keep cascading — fixing one thing breaks another. The entire UI needs to be rebuilt with proper structure.

---

## 2. DESIGN VISION

### Aesthetic: Dark Grain Luxury
- **Palette:** Warm-tinted dark. NOT pure black. Think `#0c0a0e` base, `#13111a` surfaces, deep red accent `#e63946`
- **Texture:** Subtle SVG noise/grain overlay on body (`mix-blend-mode: overlay`, low opacity ~0.15-0.25)
- **Typography:** `Syne` for display/headings (bold, tight tracking), `Space Grotesk` for body UI, `DM Mono` for values/code
- **Transitions:** Spring physics `cubic-bezier(0.34, 1.56, 0.64, 1)` for interactive elements, smooth `cubic-bezier(0.16, 1, 0.3, 1)` for layout
- **Shadows:** Diffusion shadows, tinted to background hue. Never pure black. Think `0 4px 20px rgba(12,10,14,0.4)`
- **Borders:** Ultra-subtle `rgba(255,255,255,0.06)` for structure, slightly brighter `rgba(255,255,255,0.12)` on hover

### Reference Aesthetics
- **WAVS.com** — Bold dark interface, clear sections, strong typography
- **Spotify for Artists** — Clean dashboard, data-heavy but readable
- **YouTube Studio** — Section-based layout, collapsible cards
- **TIDAL** — Dark luxury, subtle gradients
- **Notion** — Clean editor UI, well-organized panels

### Design Rules (from taste-skill)
- DESIGN_VARIANCE: 8 (asymmetric layouts OK)
- MOTION_INTENSITY: 6 (fluid CSS transitions, spring physics on interactive)
- VISUAL_DENSITY: 4 (airy/gallery mode — generous spacing, not cockpit)
- No emojis in code. Use Font Awesome icons (already included) or clean SVG
- Grain/noise on fixed pseudo-element only (never on scrolling containers)
- Animate ONLY `transform` and `opacity` (never `top/left/width/height`)
- Z-index strictly for systemic layer contexts

---

## 3. CURRENT FILE STRUCTURE

```
catalog/
├── admin.html              ← 3100+ lines, ALL admin code inline (THIS IS THE PROBLEM)
├── index.html              ← Store frontend (15k lines)
├── store-styles.css        ← Store CSS (730 lines, animations, cards, hover system)
├── dist-store-styles.css   ← Copy of store-styles.css
├── src/
│   ├── admin/
│   │   ├── beats.js        ← Beat CRUD, card style schema, preview, presets, live edit (~1880 lines)
│   │   ├── core.js         ← Theme collect/load, preview, auto-save, broadcast (~1400 lines)
│   │   ├── colors.js       ← Color editor, sync functions
│   │   ├── config.js       ← COLOR_DEFS, presets, hover presets
│   │   ├── helpers.js      ← DOM helpers (g, val, setVal, sv), hexFromRgba, rgbaFromHex
│   │   ├── nav.js          ← Section navigation
│   │   ├── firebase-init.js ← Firebase setup
│   │   ├── state.js        ← Shared state (T, db, beats, settings)
│   │   ├── r2.js           ← R2 upload worker integration
│   │   ├── resize.js       ← Preview panel resize handle
│   │   ├── card-style-ui.js ← Reusable card style controls
│   │   ├── card-global.js  ← Global card style section
│   │   ├── fonts.js        ← Google Fonts loader
│   │   ├── cmd-palette.js  ← Command palette (Ctrl+K)
│   │   ├── snap*.js        ← Snapshots system
│   │   └── effects.js      ← Card tilt, stagger, animations
│   ├── admin-main.js       ← Admin module entry point
│   ├── main.js             ← Store entry point
│   ├── cards.js            ← Store card renderer (beatCard function)
│   ├── player.js           ← Audio player
│   ├── config.js           ← Firebase config
│   ├── state.js            ← Store state
│   ├── utils.js            ← Utilities (hexRgba, applyAnim)
│   ├── effects.js          ← Store effects (tilt, stagger, counters)
│   ├── analytics.js        ← Event tracking
│   ├── filters.js          ← Beat filtering/search
│   ├── wishlist.js         ← Wishlist system
│   ├── waveform.js         ← Real waveform SVG
│   └── ...
├── build.js                ← esbuild bundler
├── firebase-rules-secure.json
├── worker/upload.js        ← R2 worker
└── wrangler.toml
```

---

## 4. COMPLETE FEATURE LIST (Everything the admin must do)

### 4.1 Authentication
- Firebase Auth with email/password
- Login overlay screen
- Admin whitelist system (uid-based)
- Logout button

### 4.2 Navigation (Left Sidebar)
- Sections: Beats, Tarjetas (Cards), Elementos, Hero, Ajustes, Equipo
- Collapsible sidebar with icons
- Section switching with smooth transitions
- Active state highlighting

### 4.3 Beat Management (CRUD)
- List all beats with drag-to-reorder
- Add/edit/delete beats
- Fields: name, genre, bpm, key, description, tags, imageUrl, audioUrl, previewUrl, spotify, youtube, soundcloud, featured, exclusive, available, active, order
- License management (name, priceMXN, priceUSD, description per license)
- Image upload to R2 CDN
- Audio upload to R2 CDN
- Batch operations

### 4.4 Beat Card Style Editor (THE BIG ONE — 73 sliders)
Per-beat card customization with real-time preview:

#### CSS Filters
- brightness (0-3), contrast (0-3), saturate (0-5)
- grayscale (0-1), sepia (0-1), hue-rotate (0-360°), blur (0-60px), invert (0-1)

#### Glow System
- enabled toggle, type (active/rgb/pulse/breathe/neon)
- color picker, speed (0.1-30s), intensity (0-10), blur (0-200px)
- spread (0-100px), opacity (0-1), hoverOnly toggle

#### Animation System (25 types)
Primary: flotar, pulsar, respirar, latido, rebotar, balanceo, brillo, cambio-color, holograma, neon-flicker, glitch, drift, zoom-in, zoom-out, pop, rubber-band, jello, wobble, shake-x, heartbeat, flip, swing, tada, bounce-in, temblor
Secondary (combo): rotar, spin-lento, deslizar-arriba/abajo/izq/der, sacudida, parpadeo, spin-rapido, elastic, slide-up-fade, typing

Per-animation sub-settings:
- Holograma: holoDir (hue/gradient/pulse), holoColors[] (4 colors), brightness min/max, saturation min/max, glow blur, animation blur, hue start/end
- Brillo: brightness min/max
- Glitch: distance X/Y, rotation
- Translate: X/Y, rotation
- Neon-flicker: min/max opacity, brightness
- Parpadeo: min/max opacity
- Rotate: angle, scale
- Scale: min/max, opacity
- Shake: X/Y

Animation controls:
- type, type2 (secondary), duration (0.05-30s), delay (0-10s)
- easing, direction, iterations
- intensity/velocity (10-300%) → controls speed via `effectiveDuration = baseDuration / (intensity/100)`

#### Card Style
- accentColor, shimmer toggle, border-radius (0-80px), opacity (0.05-1)

#### Border
- enabled toggle, color, width (0.5-10px), style (solid/dashed/dotted)

#### Shadow
- enabled toggle, color, opacity (0-1), x/y offset (±80px)
- blur (0-150px), spread (-50 to 100px), inset toggle

#### Hover Effects
- scale (0.5-2x), brightness (0-5), saturate (0-8)
- shadowBlur (0-40px), transition (0-1s), borderColor
- blur (0-30px), siblingsBlur (0-20px), hueRotate (0-360°)
- opacity (0-1), glowIntensify toggle
- hover animation (enableAnim + animType + animDur)
- 8 hover presets: Ninguno, Sutil, Glow, Blur, Spotlight, Holograma, Pop, Zen

#### Transform
- rotate (±180°), scale (0.1-3x), skewX/Y (±45°), translate X/Y (±100px)

#### Presets
- 4 style presets: Minimal, Luxury Glass, Neon Brutal, Dark Organic
- Each preset sets ALL fields (full reset before apply)
- "Usar estilo global" button per beat

### 4.5 Global Card Style ("Tarjetas" Section)
- All same controls as per-beat (filters, glow, animation, style, border, shadow, hover, transform)
- Save/Reset/Apply-to-All buttons
- Store merges global → beat (beat wins if `_customStyle: true`)
- Beats without custom styles inherit from global
- Preview card showing current global style

### 4.6 Elementos Section (Theme/Store Settings)
These control the public store's appearance:

#### Colors (Color Editor)
20 color definitions with color picker + text input + alpha slider:
- Fondo, Surface, Surface 2, Texto, Muted, Hint, Borde, Borde 2
- Acento, Red base, Red light, Glow, Wave bar, Wave activo
- Btn texto, Btn borde, Btn fondo, Sombra, Banner, Partículas

Each has: color picker input, hex/rgba text input, optional alpha slider

#### Waveform
- Color normal (picker + hex/rgba), Color activo
- Opacidad inactivo (0-1), Opacidad activo (0-1)
- Altura barras (4-30px), Radio barras (0-10px)

#### Botón Licencias
- Color texto, Color borde, Color fondo (each with picker + text input)

#### Fuente
- Font display (Google Fonts picker), Font body
- Font size (8-24px), Line height (1-2.5)
- Font weight (400/700/800/900)

#### Diseño
- Blur fondo (0-80px), Opacidad tarjetas (0-1), Grano (0-1)
- Border radius global (0-80px), Opacidad nav (0-1)
- Opacidad beat img (0-1), Opacidad texto (0-1)
- Opacidad hero bg (0-1), Opacidad sección (0-1)
- Orb blend mode, Grain blend mode (select dropdowns)

#### Glow Text
- Toggle on/off, type (text-shadow/box-shadow), blur (0-50px)
- intensity (0-10), opacity (0-1), animation type, speed (0.5-10s)
- spread (0-50px), color picker

#### Partículas
- Toggle on/off, type (circle/star/note/custom), count (10-200)
- min/max size, speed, opacity, custom text/image URL

#### Banner
- Toggle on/off, text, background color, speed (5-60s)
- animation type (scroll/fade-pulse/bounce/glow-pulse)

#### Logo
- URL, width, scale, rotation, text gap, show/hide text toggle

#### Espaciado
- Padding sección (1-10rem), Gap beats (4-40px)
- Hero margin top, Player bottom, Logo offset X

### 4.7 Hero Section Editor
- Title custom text, subtitle, eyebrow text
- Title size (2-8rem), letter-spacing, line-height
- Eyebrow toggle, color, size
- Stroke mode toggle, stroke width, stroke color
- Glow toggle, glow intensity, blur, color
- Gradient toggle, gradient color, opacity, width, height
- Word blur, word opacity
- Hero padding top
- Draggable elements (title, eyebrow, subtitle) with position save
- Real-time preview

### 4.8 Preview Panel (Right Side)
- iframe loading `dacewav.store`
- Viewport toggle: mobile (375px), tablet (768px), desktop (full)
- Custom URL input
- Refresh button
- Fullscreen toggle (F key)
- QR code for mobile testing
- Resize handle (drag to adjust width)

### 4.9 Live Edit System
Real-time sync from admin to store:
- postMessage to iframe (same-tab)
- Firebase `liveEdits/{beatId}` for cross-window
- Event delegation on all inputs (any change triggers live update)
- Presets trigger live update after applying
- Batch message optimization

### 4.10 Floating Elements
- Add/remove/edit floating elements (images, text)
- Drag to position
- Opacity, scale, rotation controls
- Persisted in Firebase

### 4.11 Custom Links
- Add/edit/delete custom nav links (text + URL)
- Rendered in store nav, hero, footer

### 4.12 Custom Emojis
- Add/remove custom emoji reactions
- Used in store

### 4.13 Snapshots & Themes
- Save/load theme snapshots (local slots + Firebase)
- Undo/redo system (theme history)
- Theme import from URL
- Export theme as JSON

### 4.14 Settings
- Site name, WhatsApp number, Instagram handle, email
- Hero subtitle custom text
- SEO settings

### 4.15 Command Palette (Ctrl+K)
- Search all controls by name
- Quick jump to any field

### 4.16 Inspector Mode
- Click any element in preview to see its CSS
- Highlight overlay with element info

### 4.17 Team Management
- Add/remove team members (uid-based)
- Whitelist management

### 4.18 Responsive Admin
- Sidebar collapses on narrow screens
- Preview panel auto-hides below breakpoint
- Mobile-friendly controls

---

## 5. STORE FRONTEND (What the admin controls)

The admin generates data that the store renders. The store has:

### Store Card System (src/cards.js)
- Merges global cardStyle + beat-specific cardStyle (beat wins if `_customStyle: true`)
- Applies: CSS filters, glow classes, animation classes, border, shadow, transform, hover CSS vars
- Shimmer overlay (`.shimmer-on` class)
- Glow types: glow-active, glow-rgb, glow-pulse, glow-breathe, glow-neon
- Animation classes: `.anim-{type}` (25+ types)
- Secondary animation: `.anim2-{type}` on `::before` pseudo-element
- Hover system: `.has-hover-fx` class + CSS vars (`--hov-scale`, `--hov-bright`, etc.)
- Shadow: applied to `.beat-card-inner` (NOT `.beat-card`) for CSS specificity
- Custom shadow class: `.has-custom-shadow` (prevents hover override)

### Store CSS (store-styles.css)
- 730+ lines of CSS
- All animation keyframes (25+ primary + 30+ secondary)
- Glow animation classes
- Card system with tinted overlay (`::after` with `--card-tint`)
- Responsive breakpoints
- Light mode toggle
- Wishlist panel
- Player bar
- Modal system
- Skeleton loading

### Communication Channels
```
Admin → Store (iframe):     postMessage({ type: 'beat-update', ... })
Admin → Store (separate):   Firebase: liveEdits/{beatId}
Store ↔ Store (cross-tab):  localStorage + storage event
Admin → Store (global):     postMessage({ type: 'admin-batch-update', ... })
```

---

## 6. REBUILD RULES (NON-NEGOTIABLE)

### Structure
1. **MODULAR FILES.** admin.html should be ONLY structure (HTML) + inline CSS. All JS in separate modules under `src/admin/`.
2. **CSS in ONE PLACE.** Either inline in admin.html OR in a separate `admin-styles.css`. Not both. Pick one.
3. **NO CSS DUPLICATION.** Every rule defined once. Use CSS variables for theming.
4. **MAX 500 LINES per file.** If a file exceeds 500 lines, split it.

### Layout
5. **FIXED SIDEBAR WIDTH** — `--sbw: 232px`. Content area uses remaining space.
6. **NO OVERLAPPING ELEMENTS.** Every element has its own space. Use CSS Grid for sections, Flexbox for rows.
7. **CONSISTENT SPACING** — Use CSS variables: `--gap-xs: 4px`, `--gap-sm: 8px`, `--gap-md: 16px`, `--gap-lg: 24px`, `--gap-xl: 32px`
8. **SCROLL CONTAINMENT** — Sidebar scrollable independently from main content. Main content scrollable independently.

### Visual
9. **ALL SLIDERS SAME WIDTH.** No variation. Slider track + value + reset button in a consistent layout.
10. **ALL COLOR INPUTS SAME WIDTH.** Color picker swatch + text input side by side, fixed dimensions.
11. **CARDS WITH CLEAR BORDERS.** Every card/section has `border: 1px solid var(--b)`. No floating elements without boundaries.
12. **CONSISTENT TYPOGRAPHY.** Labels: `10px uppercase letter-spacing:.08em`. Values: `11px DM Mono`. Headers: `13px Space Grotesk 600`. Section titles: `14px Syne 700`.
13. **NO TEXT OVERFLOW.** Every text container has `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` where needed.
14. **VISIBLE FOCUS STATES.** All interactive elements have `:focus-visible` styles.

### Interactions
15. **ALL CHANGES TRIGGER AUTOSAVE.** Every input has `oninput="autoSave()"` or equivalent.
16. **ALL CHANGES TRIGGER LIVE UPDATE.** Via event delegation, not per-field listeners.
17. **DEBOUNCE TEXT INPUTS.** 250ms debounce for text fields. Immediate for sliders/checkboxes.
18. **FEEDBACK ON ACTIONS.** Save = "Guardado ✓" toast. Error = red toast. Loading = spinner.

### Data
19. **FIREBASE SCHEMA MUST MATCH.** Every field saved must have a corresponding Firebase rule in `firebase-rules-secure.json`.
20. **NO DATA LOSS.** `collectTheme()` must capture EVERY field. `loadThemeUI()` must restore EVERY field.
21. **VALIDATE ON SAVE.** Check types, ranges, required fields before writing to Firebase.

---

## 7. CSS VARIABLE SYSTEM

Define ALL design tokens as CSS variables in `:root`:

```css
:root {
  /* Palette */
  --bg: #0c0a0e;
  --sf: #13111a;      /* surface */
  --sf2: #1a1722;     /* surface elevated */
  --abg: #1e1b24;     /* active/selected bg */
  --bg2: #262230;     /* secondary bg */
  --b: #2e2a38;       /* border */
  --b2: #403a50;      /* border hover */
  --acc: #e63946;     /* accent */
  --ac2: #c5303c;     /* accent dark */
  --ac3: #9b2c35;     /* accent darker */
  --tx: #ede8f2;      /* text */
  --mu: #7d7594;      /* muted */
  --hi: #ada4c2;      /* hint */
  --ok: #34d399;      /* success */
  --wr: #fbbf24;      /* warning */

  /* Typography */
  --fd: 'Syne', sans-serif;
  --fm: 'Space Grotesk', sans-serif;
  --fx: 'DM Mono', monospace;

  /* Radius */
  --rad: 10px;
  --rlg: 16px;
  --rsb: 8px;

  /* Transitions */
  --tr: 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);      /* spring */
  --tr-smooth: 0.3s cubic-bezier(0.16, 1, 0.3, 1);     /* smooth */

  /* Shadows */
  --shd: 0 4px 20px rgba(12,10,14,0.4);
  --shl: 0 8px 40px rgba(12,10,14,0.5);
  --sh-card: 0 2px 12px rgba(12,10,14,0.3), 0 0 0 1px rgba(255,255,255,0.03);
  --sh-card-hover: 0 8px 30px rgba(12,10,14,0.5), 0 0 0 1px rgba(255,255,255,0.06);

  /* Layout */
  --sbw: 232px;
  --sbw-collapsed: 64px;
  --tbh: 56px;

  /* Spacing */
  --gap-xs: 4px;
  --gap-sm: 8px;
  --gap-md: 16px;
  --gap-lg: 24px;
  --gap-xl: 32px;
  --gap-xxl: 48px;

  /* Slider */
  --slider-thumb: 18px;
  --slider-track: 5px;
  --slider-val-w: 52px;
}
```

---

## 8. COMPONENT PATTERNS

### Card/Section Pattern
```html
<div class="card">
  <div class="card-title" onclick="toggleCard(this)">
    <span>Section Name</span>
    <i class="fas fa-chevron-down"></i>
  </div>
  <div class="card-body">
    <!-- Fields go here -->
  </div>
</div>
```

### Slider Pattern
```html
<div class="field">
  <label>Label Text</label>
  <div class="slider-wrap">
    <input type="range" id="f-xxx" min="0" max="100" value="50"
      oninput="sv(this);autoSave()">
    <span class="slider-val">50px</span>
    <button class="slider-reset" onclick="resetSlider(this.previousElementSibling.previousElementSibling, 50)">↺</button>
  </div>
</div>
```

### Color Input Pattern
```html
<div class="color-wrap">
  <label>Color Name</label>
  <div class="color-swatch">
    <input type="color" id="tc-xxx" value="#dc2626"
      oninput="syncXXX(this.value)">
  </div>
  <input type="text" class="color-hex" id="tt-xxx" value="#dc2626"
    oninput="syncXXX(this.value)">
</div>
```

### Toggle Pattern
```html
<div class="field row">
  <label>Toggle Label</label>
  <label class="tog">
    <input type="checkbox" id="t-xxx" onchange="autoSave()">
    <span></span>
  </label>
</div>
```

### Select Pattern
```html
<div class="field">
  <label>Select Label</label>
  <select id="t-xxx" onchange="autoSave()">
    <option value="a">Option A</option>
    <option value="b">Option B</option>
  </select>
</div>
```

---

## 9. KNOWN BUGS TO AVOID

1. **Shadow specificity** — Custom shadows must go on `.beat-card-inner`, NOT `.beat-card`. CSS `.beat-card-inner` has its own `box-shadow: var(--card-shadow)` that beats inline styles on parent.
2. **Color input truncation** — `.color-hex` needs `width: 120px; min-width: 100px; flex-shrink: 0` to prevent flex compression of long rgba values.
3. **Slider value alignment** — `.slider-val` needs FIXED `width` (not `min-width`) so reset buttons align vertically.
4. **Hover shadow override** — `.beat-card:hover .beat-card-inner` hover box-shadow overrides custom shadow. Use `.has-custom-shadow` class to exclude.
5. **Firebase analytics** — Store doesn't authenticate. Analytics rules must use `.write: true` (not `auth != null`).
6. **db reference null** — IIFE captures `db` at module load when it's null. Use `window._db` for IIFE contexts.
7. **pvDetached undeclared** — Must use `var pvDetached = false` (not just assignment in strict mode).
8. **syncSliderDisplay** — Must use exact-key format map (`SD_FMT`), not regex matching.
9. **Presets leak values** — `applyPreset()` must reset ALL fields before applying preset values.
10. **postMessage same-tab** — `localStorage` events don't fire in same tab. Use `postMessage` to iframe + Firebase for cross-window.

---

## 10. BUILD & DEPLOY

```bash
node build.js                              # builds dist/admin-app.js + dist/store-app.js
git add -A && git commit -m "message"      # commit
git push origin main                       # push → Cloudflare Pages auto-deploys
```

- Cloudflare Pages deploys from `main` branch, root directory
- `admin.html` is served directly (not bundled)
- Store JS is bundled to `dist/store-app.js`
- `store-styles.css` is served directly
- R2 worker handles uploads at `upload.dacewav.store`
- CDN serves files at `cdn.dacewav.store`

---

## 11. WHAT TO KEEP AS-IS (DO NOT MODIFY)

- `src/cards.js` — Store card renderer (just fixed shadow/shimmer)
- `store-styles.css` — Store CSS (animations, hover system, all keyframes)
- `src/player.js` — Audio player
- `src/main.js` — Store entry point
- `src/analytics.js` — Event tracking
- `src/filters.js` — Search/filter
- `src/wishlist.js` — Wishlist
- `src/waveform.js` — Real waveform SVG
- `src/effects.js` — Store effects
- `src/config.js` — Firebase config
- `firebase-rules-secure.json` — Just fixed analytics rules
- `worker/upload.js` — Just added GET handler with CORS
- `index.html` — Store frontend
- `build.js` — esbuild bundler

## 12. WHAT TO REBUILD COMPLETELY

- `admin.html` — Complete rewrite. New layout, new CSS, modular structure.
- `src/admin/beats.js` — Refactor. Split card style schema, preview, presets into separate files if >500 lines.
- `src/admin/core.js` — Refactor. Clean up collectTheme/loadThemeUI to be exhaustive.
- Any `src/admin/*.js` file that needs cleanup.

---

## 13. SUCCESS CRITERIA

The rebuild is done when:
1. Every single slider works (all 73 + global section)
2. Every color input shows correct values (no truncation)
3. No elements overlap or cover each other
4. Preview panel works (loads iframe, resizes, viewport toggle)
5. Live edit works (admin changes → store updates in real-time)
6. Presets apply correctly (reset → apply → all fields update)
7. Shadows, shimmer, hover effects visible in store
8. No CSS specificity conflicts
9. File structure is modular (< 500 lines per file)
10. Mobile responsive (sidebar collapses, preview hides)
11. All existing features work identically to current version
12. Visual design is premium — dark grain luxury, clean, professional

---

**START THE REBUILD. Read this file completely before touching any code. Plan the file structure first, then implement section by section. Test each section before moving to the next. Commit frequently.**
