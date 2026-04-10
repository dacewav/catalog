# DACEWAV.STORE — Reporte de sesión (2026-04-10)

## Estado actual del proyecto

**Branch:** `rebuild/v1` (pusheado a GitHub)
**Estructura:** 18 archivos, modular, sin build step
**Firebase:** Keys reales configuradas (proyecto `dacewav-store-3b0f5`)
**Auth:** Google Sign-In con whitelist: `daceidk@gmail.com`, `xiligamesz@gmail.com`, `prodxce@gmail.com`

## Fases completadas

- ✅ FASE 1 — Infraestructura (firebase.js, _headers, _redirects, workers/upload.js, wrangler.toml, .gitignore)
- ✅ FASE 2 — Design system (css/shared.css, css/store.css, css/admin.css, index.html, admin.html)
- ✅ FASE 3 — Tienda: grid de beats + filtros básicos (catalog.js con genre/search/sort)
- ✅ FASE 4 — Player persistente + modal de licencias (player.js, licenses.js)
- ✅ FASE 5 — Admin: auth + navegación sidebar (main.js, stubs)
- ✅ FASE 6 — Admin: CRUD beats completo (beats.js)
- ✅ FASE 7 — Admin: editor de tema con preview (theme.js)
- ✅ FASE 8 — Filtros básicos + animaciones CSS (catalog.js additions, store.css additions)
- ✅ FASE 9 — Admin: config site + precios + órdenes + CSV export (settings.js)
- ✅ FASE 10 — QA (verificado: imports, IDs HTML, clean code, security headers)

## Features del v5.4 que FALTAN portar al nuevo código

### Prioridad Alta

1. **Filtros avanzados** (de `filters.js`)
   - Key dropdown (filtra por tonalidad)
   - Mood dropdown (filtra por tags como mood)
   - Tag cloud (tags populares con conteo, expandible)
   - Active filter pills (muestra filtros activos con botón X para quitar)
   - "Limpiar todo" button
   - Más opciones de sort: oldest, name-za, bpm-asc, bpm-desc, price-asc, price-desc

2. **Wishlist** (de `wishlist.js`)
   - Botón ♡ en cada beat card (toggle, animación pop)
   - Persistencia en localStorage
   - Panel lateral de favoritos (slide desde derecha)
   - Badge con conteo en nav
   - Botón "Enviar por WhatsApp" con lista formateada

3. **Modal mejorado** (de `cards.js`)
   - Links de plataforma: Spotify, YouTube, SoundCloud
   - Botón WhatsApp con mensaje preformateado
   - Campo `description` en beats
   - `previewUrl` separado de `audioUrl`
   - OG tags dinámicos (og:title, og:description, og:image al abrir modal)

4. **Featured section** (de `cards.js`)
   - Sección separada arriba del catálogo para beats con `featured: true`
   - Se oculta si no hay featured

5. **Banner configurable** (de `main.js`)
   - Barra superior con mensaje desde Firebase `/config/site/banner`
   - Se oculta si no hay banner

### Prioridad Media

6. **Counter animados** (de `effects.js`)
   - Stats en hero: "X beats" / "Y géneros" con animación count-up

7. **Skip ±10s** en player (de `player.js`)
   - Botones -10s y +10s en player bar

8. **Accent color por beat** (de `cards.js`)
   - Cada beat puede tener `accentColor` → gradiente sutil en la card

9. **Play count en cards** (de `cards.js`)
   - Mostrar `▶ X` si el beat tiene plays > 0

10. **EXCL badge** (de `cards.js`)
    - Tag "EXCL" en beats con `exclusive: true`

### Prioridad Baja (skip por ahora)

- Waveform bars animadas en cards
- EQ animation en player bar
- Card tilt 3D
- Testimonials section
- Hash router
- Command palette

## Archivos del v5.4 disponibles para referencia

Los archivos fuente del v5.4 están en git history (`git show HEAD~1:src/archivo.js`) y también fueron pasados por el usuario en lotes de archivos subidos. Los más importantes:

- `src/cards.js` — renderizado de cards + modal + OG tags
- `src/filters.js` — filtros avanzados + tag cloud
- `src/wishlist.js` — sistema de favoritos completo
- `src/player.js` — audio player con EQ y modal mode
- `src/state.js` — estado global compartido
- `src/config.js` — Firebase keys + constantes (ya extraídas)
- `src/effects.js` — animaciones, tilt, counters, EQ
- `src/waveform.js` — waveform en cards
- `src/main.js` — init, loader, banner, stats
- `src/settings.js` — carga de config site/theme desde Firebase
- `src/theme.js` — tema visual (store-side)
- `src/utils.js` — helpers (formatTime, hexRgba, etc)
- `src/error-handler.js` — manejo de errores
- `src/admin-main.js` — entry point admin
- `firebase-init.js` — auth + carga de datos (admin)

## Pendientes de deploy

- [ ] Mergear `rebuild/v1` → `main` (PR: `https://github.com/dacewav/catalog/pull/new/rebuild/v1`)
- [ ] Subir reglas Firebase desde `firebase-rules-v5.3.json`
- [ ] Activar Google Auth en Firebase Console (Build → Authentication → Sign-in method → Google → Enable)
- [ ] Desplegar Cloudflare Worker (`wrangler deploy`)
- [ ] Configurar redirect `/api/upload` → Worker URL
- [ ] Configurar CDN `cdn.dacewav.store` en R2
- [ ] **Rotar token de GitHub** (el anterior quedó expuesto en chat)

## Notas técnicas

- El nuevo código usa Firebase SDK v11.2.0 modular (ESM), el viejo usaba v9.23.0 compat. No hay conflictos.
- El nuevo código NO tiene build step (vanilla ESM). El viejo usaba esbuild.
- `window.__toast` es el helper para notificaciones desde módulos admin.
- Los beats en Firebase ya tienen la estructura vieja (`name` en vez de `title`, `imageUrl` en vez de `coverUrl`, etc). El nuevo código espera `title` y `coverUrl`. Puede necesitar migración de datos o adaptar el código.
