# DACEWAV.STORE — Estado actual (11 Abril 2026)

## Stack
- Repo: github.com/dacewav/catalog
- Deploy: Cloudflare Pages (auto-deploy desde main)
- URL tienda: https://dacewav.store
- URL admin: https://dacewav.store/admin.html
- Firebase: proyecto `dacewav-store-3b0f5`, SDK compat 9.23
- Build: esbuild → `dist/admin-app.js` (100KB)
- Tests: vitest (95 tests)

## Bugs fixeados (esta sesión)
1. ✅ `EMOJIS is not defined` — import faltante en core.js
2. ✅ Firebase key `daceidk@gmail.com` con `.` — encode/decode emails
3. ✅ `safeJSON(null)` retornando null — guard null input

## Archivos creados (esta sesión)
- `firebase-rules.json` — reglas Firebase con validación
- `worker/upload.js` — Cloudflare Worker para R2 uploads
- `wrangler.toml` — config del worker
- `_headers` — CSP y security headers
- `_redirects` — /admin → admin.html
- `PROMPT-V1.md` — prompt de rediseño v1
- `PROMPT-V2.md` — prompt de rediseño v2 con referencias
- `MEGA-PROMPT-REDESIGN.md` — contexto completo para siguiente sesión
- `admin.html.bak` — backup del admin actual

## Pendientes (requieren consola)
- [ ] Subir reglas Firebase (firebase-rules.json)
- [ ] Activar Google Auth en Firebase Console
- [ ] Deploy Cloudflare Worker (wrangler deploy)
- [ ] Configurar CDN cdn.dacewav.store en R2
- [ ] Guardar R2 config en admin
- [ ] **Rotar token GitHub** (expuesto en chat)

## Features — todas implementadas
Filtros avanzados, Wishlist, Modal (Spotify/YouTube/SoundCloud/WhatsApp), Featured section, Banner, Counters animados, Skip ±10s, Accent color, Play count, EXCL badge, Analytics, Custom links, Floating elements, Testimonials

## Siguiente tarea
Reescribir admin.html con diseño Spotify/BeatStars/Tidal.
Ver: `MEGA-PROMPT-REDESIGN.md`
