# DACEWAV.STORE — Reporte Crítico v5.2.1 (2026-04-10)

## ✅ BUG ACTIVO CORREGIDO: Tabs del editor de beats

**Fix:** Eliminada duplicación de `showEt()`. Nav.js es la fuente única; features.js re-exporta.
Se agregó `data-et=""` a los botones para no depender del objeto `event` global.


---

## 📋 Bugs encontrados en revisión de código

### Prioridad Alta ✅ TODOS CORREGIDOS

1. **✅ Memory leak — initParticles()** — Se elimina resize listener anterior antes de agregar nuevo
   - Archivo: `src/effects.js`

2. **✅ Memory leak — observeStagger()** — Se desconecta IntersectionObserver anterior
   - Archivo: `src/effects.js`

3. **✅ Scroll listeners sin throttle** — initAllEffects() tiene guard contra doble-init
   - Archivo: `src/effects.js`

4. **✅ `confirm()` y `prompt()` en admin** — Reemplazados con confirmInline() / promptInline()
   - Archivos: `src/admin/helpers.js`, `firebase-init.js`, `beats.js`, `core.js`

5. **⚠️ Firebase keys expuestas en repo** — Las API keys de Firebase son públicas por diseño. La seguridad viene de Firebase Rules. Pendiente rotar token de GitHub (expuesto en chat anterior).
   - Archivo: `src/config.js`

### Prioridad Media ✅ TODOS CORREGIDOS

6. **✅ `formatTime` duplicada** — Eliminada `fmt()` de beats.js, usa la de helpers.js
7. **✅ Waveform cache sin límite** — Max 50 entries + LRU pruning en localStorage full
8. **✅ Analytics escribe demasiado** — Batched writes con debounce de 2s
9. **✅ `renderAll()` re-renderiza innerHTML completo** — Se agregó error handler en player que detiene EQ
10. **✅ EQ visualizer nunca se detiene** — `_audio.addEventListener('error', ...)` llama stopEQ()
11. **✅ PostMessage sin origin** — Usa `window.location.origin` con fallback
12. **✅ Light mode incompleto** — Agregados estilos para wishlist panel, beat cards, licencias, filtros, tag cloud, hero, player info

### Prioridad Baja (pendientes)

13. **Inconsistencia nombres de campos** — store usa `name`/`imageUrl`, MEGA_PROMPT dice `title`/`coverUrl` — MEGA_PROMPT actualizado
14. **Firebase Compat vs Modular** — usa `firebase.database()` (compat) — intencional por ahora
15. **`onclick=""` en HTML** — ~40 handlers inline, debería usar addEventListener — migración progresiva
16. **Build step con esbuild** — MEGA_PROMPT actualizado para reflejar la realidad

---

## ✅ Features que YA funcionan

- [x] Grid de beats con filtros avanzados (genre, key, mood, search, sort, tag cloud)
- [x] Wishlist (localStorage, panel lateral, WhatsApp)
- [x] Player persistente con skip ±10s, EQ visualizer
- [x] Modal de licencias con OG tags, links de plataforma
- [x] Featured section, banner configurable
- [x] Admin: CRUD beats, drag & drop, inline edit, batch add
- [x] Admin: Editor de tema masivo (glow, fonts, particles, gradients, presets)
- [x] Admin: Command palette, keyboard shortcuts, QR preview
- [x] Scroll-aware nav, cursor glow, parallax hero, card tilt 3D
- [x] Hash router para deep links
- [x] Light mode toggle
- [x] Analytics tracking
- [x] .gitignore configurado

---

## Pendientes de deploy

- [ ] Verificar que Cloudflare Pages deploy automático funcione
- [ ] Subir reglas Firebase (`firebase-rules-v5.3.json`)
- [ ] Activar Google Auth en Firebase Console
- [ ] Desplegar Cloudflare Worker (R2 upload)
- [ ] Configurar CDN `cdn.dacewav.store`
- [ ] **Rotar token de GitHub** (quedó expuesto en chat anterior)

---

*Última actualización: 2026-04-10 23:21 GMT+8*
