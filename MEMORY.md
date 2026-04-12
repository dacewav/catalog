# Catalog Project Memory

## 🧠 Instrucciones para futuras sesiones
- **Guardar memorias importantes** en `memory/YYYY-MM-DD.md` al final de cada sesión
- **Actualizar pendientes**: cuando un bug se resuelva, moverlo a "Resueltos" con el commit
- **Actualizar este MEMORY.md** con lecciones aprendidas y estado actual
- No acumular bugs pendientes sin resolver — si no se puede reproducir, documentar condiciones
- Borrar de pendientes lo que ya se resolvió

---

## Estado actual

### Arquitectura de deploy
- **Hosting**: Cloudflare Pages (lee de GitHub, sirve estáticos)
- **Headers**: `_headers` (formato Cloudflare Pages) — CSP, security
- **Build**: Local (`npm run build`), dist/ commiteado a git
- **CDN**: Cloudflare (frente al site)
- **Vercel**: desconectado del repo

### Pendientes
- [ ] Glow no visible en iframe preview (live edit → store)
- [ ] CSS filters aparecen en Media tab (posible browser cache)
- [ ] Shimmer/Shadow/Hover en la tienda — CSS specificity
- [ ] CDN CORS — `cdn.dacewav.store` sin Access-Control-Allow-Origin
- [ ] Firebase Analytics — PERMISSION_DENIED en `/analytics/*`
- [ ] Migrar onclick inline → addEventListener (beats.js primero)
- [ ] Tests básicos admin (showEt, openEditor, saveBeat, prevImg)

---

## ⚠️ Lecciones críticas

### Nunca tocar HTML sin verificar nesting (sesión 4)
Mover divs en admin.html sin verificar el árbol DOM después causó que paneles huérfanos aparecieran en todas las pestañas. 4 intentos fallidos porque no verifiqué la estructura.
**Regla**: después de cualquier cambio al HTML, verificar nesting de `.etp` y `.section`.

### Nunca clonar un repo dentro de sí mismo (sesión 5)
Clonar el repo en `catalog/catalog` creó un submodule huérfano que rompió Cloudflare Pages. `fatal: No url found for submodule path 'catalog' in .gitmodules`

### Verificar CI logs antes de asumir deploy correcto (sesión 5)
El CDN servía HTML cacheado por horas. El hash en el HTML (`7b96efbe`) no coincidía con el commit (`f3598870`). Solo se resolvió revisando el build log de Cloudflare Pages.

### Depurar el bundle, no el botón (sesión 5)
El error `doGoogleLogin is not defined` parecía un problema de auth, pero la causa real era que el bundle JS crasheaba al cargar por un `ReferenceError` en `theme-presets.js`. Verificar la consola del browser PRIMERO.

---

## Bugs resueltos (historial)

### Sesión 5 — Login fix + Deploy (2026-04-13)
- `theme-presets.js` tenía `Object.assign(window)` huérfano → bundle crasheaba → doGoogleLogin undefined → fix: eliminar bloque huérfano
- Deploy: submodule huérfano `catalog/` rompía Cloudflare Pages → fix: `git rm --cached`
- Deploy: Vercel sin vercel.json, deployments fallaban → desconectado Vercel
- Commits: `f6bab3c`, `2432c06`, `abf979f`, `84a1264`, `dab839c`

### Sesión 4 — Panel Overlap (2026-04-13)
- Paneles de editor en todas las tabs → fix: mover orphaned panels dentro de `#etp-extras`
- Commit: `34c50b2`

### Sesión 2 — Glow + Live edit + Papelera (2026-04-13)
- admin-batch-update no aplicaba tema/settings → fix: agregar applyTheme/applySettings en handlers
- Glow CSS vars ignoradas en keyframes → fix: reescribir keyframes con var() reales
- glow-hover-only referenciaba keyframes inexistentes → fix: usar beat-glow-* correctos
- beatCard() glow blur condicional → fix: siempre setear si existe
- Commit: `5c47f5d`

### Sesión 1 — Preview + Sync + Imágenes + Trash (2026-04-13)
- beat-preview.js nunca importado → fix: import en admin-main.js
- Live update no se disparaba desde sliders → fix: listener global en card-style-ui.js
- Mini preview eliminado (no podía ser idéntico al store real)
- Sistema de imágenes con historial + papelera implementado
