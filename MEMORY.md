# Catalog Project Memory

## Estado actual

### Proyecto
- **Repo**: `github.com/dacewav/catalog`
- **Branch**: `main`
- **Deploy**: Cloudflare Pages (lee de GitHub, sirve estáticos desde dist/)
- **Build**: Local `node build.js` → dist/ commiteado a git
- **CDN**: Cloudflare frente al site
- **Vercel**: desconectado
- **Bundle**: store 65.2KB, admin 247.5KB
- **Tests**: 125/125 pass

### card-style-engine refactor (completado 2026-04-18)
- Nuevo módulo compartido: `src/card-style-engine.js`
- Single source of truth para cardStyle (build, populate, apply, check, merge)
- Eliminado código duplicado: _buildCardStyleFromInputs, _applyCardStyleToPreview, _isCardStyleDefault, SD_FMT
- Admin (-7.8KB), Store (-0.9KB) por eliminación de duplicación
- Legacy fields (glowConfig, cardAnim, accentColor, cardBorder, shimmer) eliminados de live-edit pipeline
- Preview global ahora aplica TODOS los anim sub-settings (antes solo aplicaba básico)

### Admin refactor (completado sesiones anteriores)
- core.js: 1405 → 130 líneas (-91%)
- 16 módulos extraídos, todos con dependency injection
- 131 onclick migrados a data-action delegation
- Ver `REFACTOR-PLAN.md` para detalle de cada bloque

### Pendientes reales
- [ ] Testing real en browser — preview panel, beat save, card styles end-to-end
- [ ] Confirmar shimmer/glow effects post-deploy en browser real
- [ ] Confirmar admin editing con Firebase rules actualizadas
- [ ] Stats charts necesitan datos reales para verificar render
- [ ] Preview panel resize handle — verificar en browser

---

## Decisiones clave

- **Cloudflare Pages > Vercel**: Vercel desconectado por cache agresivo y tokens limitados
- **dist/ commiteado**: Cloudflare Pages lee de git, no tiene build step propio
- **Dependency injection**: Para romper circular deps entre módulos admin
- **cardStyle como single source of truth**: No más legacy fields (glowConfig, cardAnim, etc.) en pipeline
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
| require() en ES modules | card-style-ui.js usó require por error | Usar import estático |

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

### Sesión 7 — Firebase Rules + Glow + Analytics (2026-04-17)
- Firebase rules desalineadas: 12+ campos con límites más restrictivos en producción
- UID adminWhitelist: prod tenía E6N2 (25 chars) vs repo E6N22 (26 chars)
- glowConfig/spread max 10 en prod → admin saves rechazados
- Nodos faltantes en prod: imageGallery, customLinks, customEmojis, defaultLicenses
- will-change:transform en cards glow → GPU clippeaba box-shadow animado (mismo bug que shimmer)
- Analytics: search_query (13 chars) excedía act max 10 en prod
- Commits: `583da2e`
- **⚠️ Usuario debe pegar firebase-rules-secure.json en Firebase Console y publicar**

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
