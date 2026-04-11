# Implementation Plan — Hover System + Style Presets

## Phase 1: Hover System (4 new properties + hover animation)
- admin.html: sliders for blur, siblingsBlur, hueRotate, opacity, hover anim toggle/select/duration
- store-styles.css: CSS rules using the new --hov-* vars
- cards.js: emit the new --hov-* vars on beat-card elements
- beats.js: _applyCardStyleToPreview + openEditor load/save already have schema

## Phase 2: Style Presets (4 presets from taste-skill archetypes)
- admin.html: preset card section before hover
- beats.js: JS to apply preset to all inputs + updateCardPreview
- Each preset: Brutalist, Minimalist, Luxury Glass, Editorial

## Phase 3: Build
- Rebuild dist/admin-app.js and dist/store-app.js
