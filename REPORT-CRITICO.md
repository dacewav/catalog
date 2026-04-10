# DACEWAV.STORE — Reporte Crítico v5.2 (2026-04-10)

## 🚨 BUG ACTIVO: Tabs del editor de beats NO funcionan

**Descripción:** Al editar un beat en el admin, los botones de pestañas (Info, Licencias, Media, Plataformas, Extras) no cambian de panel.

**Causa raíz:** `showEt()` se define en dos módulos (nav.js + features.js). La versión de features.js sobreescribe la de nav.js. El uso de `event.target` falla cuando el click es en un SVG hijo del botón.

**Intentos de fix:**
1. ❌ Alinear features.js con nav.js usando `g('etp-'+name)` — no resolvió
2. ❌ Cambiar `event.target` → `event.currentTarget` — pendiente de verificar

**Archivos involucrados:**
- `src/admin/nav.js` (línea ~15) — showEt definition #1
- `src/admin/features.js` (línea ~96) — showEt definition #2 (sobreescribe #1)
- `admin.html` — botones `.et` con `onclick="showEt('info')"` etc.

**Sugerencia para siguiente sesión:** Agregar `data-et="info"` a cada botón `.et` en admin.html y usar `t.dataset.et === name` en vez de depender del objeto `event` global. O eliminar la definición duplicada de features.js.

---

## 📋 Bugs encontrados en revisión de código

### Prioridad Alta

1. **Memory leak — initParticles()**
   - Se llama desde `applyTheme()` que se ejecuta en cada cambio
   - Crea múltiples loops `requestAnimationFrame` sin cancelar los anteriores
   - Archivo: `src/effects.js`

2. **Memory leak — observeStagger()**
   - Se llama desde `renderAll()` y `applyFilters()` sin desconectar observer anterior
   - Crea nuevo `IntersectionObserver` cada vez
   - Archivo: `src/effects.js`

3. **Scroll listeners sin throttle**
   - `initHeroParallax()`, `initScrollNav()`, `initScrollProgress()`
   - Calculan en cada frame sin `requestAnimationFrame` throttle
   - Causa jank en mobile
   - Archivo: `src/effects.js`

4. **`confirm()` y `prompt()` en admin**
   - `firebase-init.js`: `confirm('¿Cerrar sesión?')`
   - `beats.js`: `confirm('¿Eliminar...')` × 3, `prompt('¿Cuántos beats?')`, `prompt('URL del tema JSON')`
   - Deberían ser modales inline

5. **Firebase keys expuestas en repo**
   - `src/config.js` tiene API keys reales de Firebase
   - Archivo: `src/config.js`

### Prioridad Media

6. **`formatTime` duplicada** — en `utils.js` y `beats.js` (como `fmt()`)
7. **Waveform cache sin límite** — localStorage puede llenarse (~5MB)
8. **Analytics escribe demasiado** — sin rate limiting, 3 writes por evento
9. **`renderAll()` re-renderiza innerHTML completo** — rompe event listeners del 3D tilt
10. **EQ visualizer nunca se detiene** — `setInterval` sigue corriendo
11. **PostMessage sin origin** — usa `'*'` en vez de `'https://dacewav.store'`
12. **Light mode incompleto** — falta estilo para modal, wishlist panel, player bar, toast

### Prioridad Baja

13. **Inconsistencia nombres de campos** — store usa `name`/`imageUrl`, MEGA_PROMPT dice `title`/`coverUrl`
14. **Firebase Compat vs Modular** — usa `firebase.database()` (compat) en vez de modular ESM
15. **`onclick=""` en HTML** — ~40 handlers inline, debería usar addEventListener
16. **Build step con esbuild** — MEGA_PROMPT dice "sin build step"

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
