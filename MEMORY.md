# Catalog Project Memory

## Estado actual

### Proyecto
- **Repo**: `github.com/dacewav/catalog`
- **Branch**: `main`
- **Deploy**: Cloudflare Pages (lee de GitHub, sirve estáticos desde dist/)
- **Build**: Local `node build.js` → dist/ commiteado a git
- **CDN**: Cloudflare frente al site
- **Vercel**: desconectado

### Admin refactor (completado)
- core.js: 1405 → 130 líneas (-91%)
- 15 módulos extraídos, todos con dependency injection
- Bloques 1-16 completados
- Ver `REFACTOR-PLAN.md` para detalle de cada bloque

### Pendientes reales
- [x] ~131 onclick restantes en admin.html → **0** (Bloque 15, ec978d7)
- [x] CDN CORS — ✅ worker custom domain
- [x] Shimmer/Shadow/Hover CSS specificity — fix parcial (f6435ed)
- [x] Firebase Analytics PERMISSION_DENIED — ServerValue fix (7c012cb)
- [x] Duplicate class attrs — 31 fixeados (f6435ed)
- [ ] **Shimmer/glow no visible en store** — CSS fixes aplicados, pendiente confirmar post-deploy
- [ ] **Admin editing roto** — usuario reporta en sesión 2026-04-16, posible timing de deploy
- [ ] Rediseño de la store (feature request principal)
- [ ] Glow no visible en iframe preview (live edit → store)

---

## Decisiones clave

- **Cloudflare Pages > Vercel**: Vercel desconectado por cache agresivo y tokens limitados
- **dist/ commiteado**: Cloudflare Pages lee de git, no tiene build step propio
- **Dependency injection**: Para romper circular deps entre módulos admin
- **No tocar HTML sin verificar nesting**: Lección de sesión 4 (paneles huérfanos)
- **No quitar will-change de todos los cards**: Solo de cards sin animaciones

---

## Errores recurrentes (no repetir)

| Error | Causa | Fix |
|-------|-------|-----|
| Clonar repo dentro de sí mismo | Submodule huérfano rompe Cloudflare | `git rm --cached` |
| Cambiar HTML sin verificar DOM | Paneles huérfanos en todas las tabs | Verificar nesting `.etp` después de cambios |
| Asumir deploy correcto sin ver logs | CDN servía HTML cacheado | Revisar Cloudflare build log |
| Depurar botón en vez de bundle | Error silencioso en import | Revisar console del browser PRIMERO |
| will-change:transform en cards con glow | GPU layer clippea box-shadow animado | Solo aplicar will-change en cards sin anim |
| firebase.database.ServerValue vs db.ServerValue | ServerValue está en namespace, no en instancia | Usar `firebase.database.ServerValue.TIMESTAMP` |

---

## Instrucciones para sesiones

1. Leer `CONTEXT.md` al inicio (checklist de arranque)
2. Actualizar `memory/YYYY-MM-DD.md` al final de cada sesión
3. Cuando un bug se resuelva → mover a "Bugs resueltos" con commit hash
4. No acumular bugs sin reproducir — documentar condiciones
5. Build + commit + push después de cada bloque de trabajo
6. **Auto-save a los ~50 min** — ver SOUL.md para protocolo completo

## Recovery system
- Cron `catalog-recovery` corre cada 30 min
- Si una sesión muere sin guardar → el cron hace commit automático
- Si hay commits sin push → el cron intenta push o documenta que necesita token
- En el siguiente chat, memory/ tendrá lo que el cron guardó

---

## Bugs resueltos (historial completo)

### Sesión 6 — Shimmer/Glow/Analytics (2026-04-16)
- Shimmer hover specificity: mostraba shimmer en hover para TODAS las cards → solo shimmer-on
- will-change:transform en .beat-card-inner causaba que box-shadow animado desaparezca en GPU layers
- Shimmer opacidad: 0.06→0.08, sweep más amplio
- 31 duplicate class attributes en admin.html (spacing classes ignoradas)
- Firebase Analytics: `state.db.ServerValue?.TIMESTAMP` → undefined → fix con `firebase.database?.ServerValue?.TIMESTAMP`
- Commits: `f6435ed`, `a9aa217`, `7c012cb`
- **⚠️ Shimmer/glow sigue sin mostrarse en store — pendiente debugging en browser**

### Sesión 5 — Login fix + Deploy (2026-04-13)
- `theme-presets.js` Object.assign(window) huérfano → bundle crasheaba → doGoogleLogin undefined
- Submodule huérfano `catalog/` rompía Cloudflare Pages
- Commits: `f6bab3c`, `2432c06`, `abf979f`, `84a1264`, `dab839c`

### Sesión 4 — Panel Overlap (2026-04-13)
- Paneles huérfanos fuera de `#etp-extras` → fix: mover dentro
- Commit: `34c50b2`

### Sesión 2 — Glow + Live edit (2026-04-13)
- admin-batch-update no aplicaba tema/settings
- Glow CSS vars ignoradas en keyframes
- Commit: `5c47f5d`

### Sesión 1 — Preview + Sync + Imágenes (2026-04-13)
- beat-preview.js nunca importado
- Live update no se disparaba desde sliders
