# Catalog Project Memory

## Estado actual

### Proyecto
- **Repo**: `github.com/dacewav/catalog`
- **Branch**: `main`
- **Deploy**: Cloudflare Pages (lee de GitHub, sirve desde root del repo)
- **Build**: Local `node build.js` → dist/ con esbuild
- **CDN**: Cloudflare frente al site
- **Bundle**: store 65.2KB, admin 241.8KB
- **Tests**: 125/125 pass (pre-refactor)

### Arquitectura
```
┌─────────────────────────────────────────────────┐
│ Cloudflare Pages: dacewav.store                  │
│                                                  │
│  index.html → dist/store-app.js (tienda pública) │
│  admin.html → dist/admin-app.js (panel admin)    │
│  _headers → CSP, security headers                │
│  dist/ → JS/CSS bundles con hash cache busting   │
└─────────────────────────────────────────────────┘

Admin (iframe) ──postMessage──→ Store (en iframe)
       ↕                              ↕
    Firebase ◄─────────────────────→ Firebase
```

### Módulos por pares críticos
| Admin | Store | Función |
|-------|-------|---------|
| preview-sync.js | live-edit.js | Comunicación postMessage |
| beat-card-style.js + card-global.js | card-style-engine.js + cards.js | Card styling |
| beats.js | Firebase → main.js | CRUD beats |
| autosave.js | live-edit.js | Theme/settings sync |
| firebase-init.js | main.js | Auth + data loading |

### Pendientes reales (ACTUALIZADO)
- [ ] Confirmar fix iframe preview (position: absolute) — deploy hecho
- [ ] Fix: global-card-style-update no debe sobreescribir beats individuales en live-edit.js
- [ ] Firebase rules: usuario debe pegar firebase-rules-secure.json en Console
- [ ] Audit completo de pares admin↔store
- [ ] Testing end-to-end: beat CRUD → preview → store
- [ ] Revisar initAdmin: dynamic imports fallan silenciosamente
- [ ] card-style-engine.js: verificar que ambos lados lo usan correctamente
- [ ] Error handling en saveBeat (PERMISSION_DENIED visible en console)

---

## Decisiones clave

- **Cloudflare Pages > Vercel**: Cache agresivo de Vercel causaba problemas
- **Root deploy**: Cloudflare Pages sirve desde root del repo, no desde dist/
- **_headers en root**: Cloudflare lee CSP de _headers en el root del deployment
- **Dependency injection**: Para romper circular deps entre módulos admin
- **cardStyle como single source of truth**: No más legacy fields (glowConfig, cardAnim, etc.)
- **Layout grid**: `80px minmax(380px,1fr) 2fr` — store toma 2/3, controles 1/3
- **iframe sizing**: `position: absolute` dentro de wrapper `position: relative`

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
| Toccar store cuando solo se pidió admin | Cambios en live-edit.js/main.js afectan store | Revertir store, solo tocar admin |
| iframe height 0 en grid+flex | CSS grid + flex: 1 no garantiza height del iframe | Usar position: absolute en iframe |

---

## Instrucciones para sesiones

1. Leer `CONTEXT.md` al inicio (checklist de arranque)
2. Actualizar `memory/YYYY-MM-DD.md` al final de cada bloque de trabajo
3. Cuando un bug se resuelva → mover a "Bugs resueltos" con commit hash
4. No acumular bugs sin reproducir — documentar condiciones
5. Build + commit + push después de cada bloque de trabajo
6. **Auto-save a los ~50 min** — ver SOUL.md para protocolo completo
7. **NO tocar store files sin autorización explícita** — solo admin
8. **Analizar ANTES de escribir** — leer todos los archivos relevantes primero

---

## Recovery system
- Cron `catalog-recovery` corre cada 30 min
- Si una sesión muere sin guardar → el cron hace commit automático
- Si hay commits sin push → el cron intenta push o documenta que necesita token
- En el siguiente chat, memory/ tendrá lo que el cron guardó

---

## Bugs resueltos (historial completo)

### Sesión 8 — Layout + iframe fix (2026-04-19)
- Layout reestructurado: store index como contenido principal (2/3 pantalla)
- Grid: `80px minmax(380px,1fr) 2fr` con `.split.preview-collapsed` para colapso
- iframe sizing: `position: absolute` para garantizar height correcto
- Debug logging agregado a initPreviewIframe
- Store files revertidos (live-edit.js, main.js) — no se debieron tocar
- Commits: `73227a3`, `a4299d6`, `677bbb0`, `f67bdd7`

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
