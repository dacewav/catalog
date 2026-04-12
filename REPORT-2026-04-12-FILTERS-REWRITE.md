# Report — Admin Preview Broken (2026-04-12 13:20 GMT+8)

## What was done this session
1. Universal CSS filters panel with drop-shadow, opacity
2. Effects gallery (14 presets, taste-skill refined)
3. Blur types system (vigneta/aura/focus instead of filter:blur)
4. Shimmer speed/opacity persistence fix
5. Animación 2 (Combo) extracted to separate card

## What broke
Admin preview (bcpv card + pv-full-card-container) likely broken because:

### Suspect 1: admin.html structure damage
- Python script was used to extract anim2 dropdown from animation card
- The extraction may have broken HTML nesting (extra/missing closing divs)
- Check: `<div class="card">` nesting around lines 754-940

### Suspect 2: Preview CSS missing blur-fx classes
- `blur-fx-vigneta`, `blur-fx-aura`, `blur-fx-focus` CSS was added to `admin-styles.css`
- But the bcpv preview may need these on `.bcpv-inner` not `.bcpv`
- Check: `.bcpv.blur-fx-* .bcpv-inner::after` selectors

### Suspect 3: filter:blur removed from preview
- `_applyCardStyleToPreview` in beat-card-style.js was changed to NOT apply `filter:blur()`
- Instead it adds CSS class `blur-fx-{type}` 
- If blurType is empty string but blur > 0, nothing happens (no visual)
- The old `if (f.blur) filters.push('blur(' + f.blur + 'px)')` was removed

### Suspect 4: updateCardPreview reset issue
- `updateCardPreview()` does `pv.className = 'bcpv'` and `pv.style.cssText = ''`
- This resets ALL classes including any pre-existing ones
- Then `_applyCardStyleToPreview` re-adds them — but may miss some

## Key files to check
- `src/admin/beat-card-style.js` — `_applyCardStyleToPreview()` and `updateCardPreview()`
- `admin.html` — lines 750-950 (animation card → anim2 card → estilo card)
- `admin-styles.css` — `.bcpv` preview styles (end of file, blur-fx section)
- `store-styles.css` — `.blur-fx-*` classes

## Quick fix suggestions
1. Validate HTML structure: `grep -c '<div' admin.html` vs `grep -c '</div>' admin.html`
2. Re-add `if (f.blur && !f.blurType) filters.push('blur(' + f.blur + 'px)')` as fallback
3. Check that `.bcpv` preview has the blur CSS

## Git state
- Last commit: `3e7672e` fix: shimmer persistence + anim2 separated into own panel
- Previous: `541656d` feat: premium effect presets + blur types system
- Branch: main (pushed)
