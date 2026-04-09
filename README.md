# DACEWAV.STORE v5.2.0

## Estructura del proyecto

```
dacewav-store/
├── index.html              ← Tienda (carga dist/store-app.js)
├── admin.html              ← Panel admin (scripts inline, v5.1)
├── store-styles.css        ← Estilos de la tienda
├── admin-styles.css        ← Estilos del admin
│
├── src/                    ← Código fuente modularizado
│   ├── main.js             ← Entry point tienda
│   ├── admin-main.js       ← Entry point admin (stub)
│   ├── config.js           ← Firebase config, versión, constantes
│   ├── state.js            ← Estado global centralizado
│   ├── utils.js            ← Funciones puras (hexRgba, formatTime, etc.)
│   ├── error-handler.js    ← Manejo centralizado de errores
│   ├── wishlist.js         ← Sistema de favoritos
│   ├── waveform.js         ← Generación de formas de onda
│   ├── theme.js            ← Tema light/dark, applyTheme()
│   ├── effects.js          ← Cursor glow, parallax, particles, etc.
│   ├── player.js           ← Reproductor de audio (AP object)
│   ├── cards.js            ← Beat cards + modal
│   ├── filters.js          ← Búsqueda, filtros, tag cloud
│   ├── settings.js         ← Settings, custom links, floating
│   ├── analytics.js        ← Tracking de eventos
│   └── hash-router.js      ← Deep links #/beat/<id>
│
├── dist/                   ← Build output (no commitear a git)
│   ├── store-app.js        ← Bundle minificado (48KB)
│   ├── store-app.js.map    ← Source map
│   ├── admin-app.js        ← Bundle admin
│   ├── store-styles.css    ← Copia de estilos
│   └── admin-styles.css    ← Copia de estilos
│
├── tests/                  ← Tests unitarios
│   ├── utils.test.js       ← Tests de utilidades (9 tests)
│   └── error-handler.test.js ← Tests de error handler (9 tests)
│
├── firebase-rules-v5.2.json ← Reglas de seguridad Firebase
├── package.json            ← Dependencias y scripts
├── build.js                ← Script de build (esbuild)
└── vitest.config.js        ← Config de tests
```

## Scripts

```bash
npm run build        # Build minificado para producción
npm run build:watch  # Watch mode para desarrollo
npm run build:dev    # Build sin minificar (debugging)
npm test             # Correr tests
```

## Deploy

### 1. Firebase Rules
1. Abrir Firebase Console → Realtime Database → Rules
2. Copiar contenido de `firebase-rules-v5.2.json`
3. Pegar y **Publicar** (no solo guardar)

### 2. Tienda (index.html)
1. `npm run build`
2. Subir a tu hosting:
   - `index.html`
   - `dist/store-app.js` + `dist/store-app.js.map`
   - `dist/store-styles.css`
   - `store-styles.css` (backup)

### 3. Admin (admin.html)
El admin sigue usando scripts inline por ahora. `admin-app.js` es un stub
que exporta utilidades compartidas para uso futuro.

Subir:
- `admin.html`
- `admin-styles.css`

## Migración desde v5.1

Los archivos originales (`store-app.js`, `admin.html`, etc.) se conservan
como backup. El nuevo sistema carga desde `dist/`:

**Antes:** `<script src="store-app.js"></script>`
**Ahora:** `<script src="dist/store-app.js"></script>`

El bundle expone las mismas funciones globales (`window.AP`, `window.openModal`,
etc.) así que los `onclick=""` del HTML siguen funcionando sin cambios.

## Módulos

| Módulo | Exporta | Usado por |
|--------|---------|-----------|
| `config.js` | FC, DACE_VER, ANIMS | main.js, theme.js, settings.js |
| `state.js` | state (objeto reactivo) | Todos |
| `utils.js` | hexRgba, loadFont, formatTime, safeJSON, debounce, applyAnim | theme.js, player.js, cards.js |
| `error-handler.js` | logError, withErrorHandling, fbCatch, getErrorLog, clearErrorLog | player.js, wishlist.js, waveform.js, analytics.js |
| `wishlist.js` | getWishlist, toggleWish, updateWishBadge, renderWishList, toggleWishlist, sendWishlistWhatsApp | main.js (window bindings) |
| `waveform.js` | generateWaveform, waveformToSVG, applyWaveformToCard, clearWaveformCache | cards.js |
| `theme.js` | toggleTheme, applyLightMode, initThemeSync, applyTheme | main.js |
| `effects.js` | initAllEffects, initCursorGlow, initScrollProgress, initHeroParallax, initScrollNav, setupCardTilt, observeStagger, startEQ, stopEQ, animateCounter, initParticles | main.js, cards.js, player.js, theme.js |
| `player.js` | AP (objeto con métodos) | main.js, cards.js |
| `cards.js` | beatCard, handleCardClick, openModal, playModalBeat, closeModal, selLic, showToast, renderAll | main.js, filters.js, hash-router.js |
| `filters.js` | buildFilterOptions, buildFilters, buildTagCloud, applyFilters, setGenre, clearSearch, resetAllFilters, toggleTagFilter, removeActiveTag, updateTagCloudState, toggleTagCloudExpand | main.js, cards.js |
| `settings.js` | applySettings, renderCustomLinks, renderFloating | main.js |
| `analytics.js` | trackEvent, initAnalytics | main.js |
| `hash-router.js` | (side-effects only) | main.js |

## Tests

```
✓ tests/error-handler.test.js  (9 tests)
✓ tests/utils.test.js          (9 tests)
  Tests  18 passed
```

Cubre: hexRgba, formatTime, safeJSON, debounce, logError, clearErrorLog,
withErrorHandling, fbCatch.
