# Catalog Project Memory

## Estado actual

### Proyecto
- **Repo**: `github.com/dacewav/catalog`
- **Branch**: `main` (antes `fix-panel-overlap`, ya mergeado)
- **Deploy**: Cloudflare Pages (lee de GitHub, sirve estáticos desde dist/)
- **Build**: Local `node build.js` → dist/ commiteado a git
- **CDN**: Cloudflare frente al site
- **Vercel**: desconectado

### Admin refactor (completado)
- core.js: 1405 → 130 líneas (-91%)
- 15 módulos extraídos, todos con dependency injection
- Bloques 1-12 completados en sesiones anteriores
- Ver `REFACTOR-PLAN.md` para detalle de cada bloque

### Pendientes reales
- [ ] ~123 onclick restantes en admin.html (closures complejas + llamadas simples — bajo riesgo)
- [ ] CDN CORS — `cdn.dacewav.store` sin Access-Control-Allow-Origin (requiere Cloudflare dashboard)

---

## Decisiones clave

- **Cloudflare Pages > Vercel**: Vercel desconectado por cache agresivo y tokens limitados
- **dist/ commiteado**: Cloudflare Pages lee de git, no tiene build step propio
- **Dependency injection**: Para romper circular deps entre módulos admin
- **No tocar HTML sin verificar nesting**: Lección de sesión 4 (paneles huérfanos)

---

## Errores recurrentes (no repetir)

| Error | Causa | Fix |
|-------|-------|-----|
| Clonar repo dentro de sí mismo | Submodule huérfano rompe Cloudflare | `git rm --cached` |
| Cambiar HTML sin verificar DOM | Paneles huérfanos en todas las tabs | Verificar nesting `.etp` después de cambios |
| Asumir deploy correcto sin ver logs | CDN servía HTML cacheado | Revisar Cloudflare build log |
| Depurar botón en vez de bundle | Error silencioso en import | Revisar console del browser PRIMERO |

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
