# MEMORY.md — DACEWAV.STORE

> **ARCHIVO OBLIGATORIO.** Toda IA que trabaje en este proyecto DEBE leer este
> archivo al inicio de sesión y actualizarlo al final. NO lo borres, NO lo
> reescribas completo — solo actualiza las secciones relevantes.

---

## Estado Actual
- **Fase actual:** 0 (Setup)
- **Versión:** 5.2.0 → 6.0.0
- **Última sesión:** —
- **Branch activa:** —
- **Proyecto iniciado:** 2026-04-19
- **Progreso:** Pendiente iniciar. MEGA-PROMPT v2.0 creado. MEMORY.md creado.
- **Repo ref:** https://github.com/dacewav/catalog (main branch)
- **Usuario:** DACE — productor musical de Puebla, MX. NO programa.

---

## Stack
- **Frontend:** Vanilla JS (ES Modules) — NO frameworks
- **Build:** esbuild (rápido, ya configurado en v5.2)
- **Backend/DB:** Firebase Realtime Database
- **Auth:** Firebase Auth (Google OAuth) — solo para admin/owner
- **Hosting:** Cloudflare Pages (estático)
- **Media Storage:** Cloudflare R2 (imágenes, audio)
- **Testing:** Vitest
- **CSS:** Vanilla con custom properties, sin preprocesador

---

## Decisiones de Arquitectura
| Fecha | Decisión | Razón |
|-------|----------|-------|
| 2026-04-19 | Reconstruir desde cero (v6.0) | Admin y tienda no coexisten, refactor > rebuild |
| 2026-04-19 | SPA con hash routing (#/ y #/admin) | Un solo HTML, lazy-load admin, auth como gate |
| 2026-04-19 | Firebase singleton (shared/firebase.js) | Eliminar init duplicado entre admin y tienda |
| 2026-04-19 | Event bus (shared/event-bus.js) | Reemplazar window.xxx globals, desacoplar módulos |
| 2026-04-19 | Auth con /admins/{uid} en Firebase | Solo owner, no sistema multi-usuario |
| 2026-04-19 | Vanilla JS (no framework) | Código existente es vanilla, no hay razón para migrar |
| 2026-04-19 | Estado unificado con Proxy reactivo | Admin y tienda comparten el mismo state object |
| 2026-04-19 | Admin lazy-loaded via import() | No cargar 40+ módulos si no estás en /admin |
| 2026-04-19 | CSS admin scoping bajo .admin-panel | Evitar que variables del admin sobreescriban tienda |
| 2026-04-19 | MEGA-PROMPT como documentación viva | Cada IA nueva necesita contexto completo sin memoria |

---

## Bug Tracker

### Bugs Activos (sin resolver)
<!-- Formato: | Fecha | Descripción | Intentos | Notas | -->
_(vacío — se llena durante desarrollo)_

### Bugs Resueltos
<!-- Formato: | Fecha | Descripción | Solución | Archivo | -->
| Fecha | Bug | Solución | Archivo |
|-------|-----|----------|---------|
| 2026-04-19 | Admin y tienda no coexisten (scripts inline vs esbuild, estado duplicado, CSS separado, Firebase init x2) | Decisión: reconstruir con arquitectura SPA unificada | — |

---

## Skills / Técnicas Útiles
<!-- Formato: | Técnica | Contexto | Ejemplo | -->
| Técnica | Contexto | Ejemplo |
|---------|----------|---------|
| esbuild dual entry points | Build tienda + admin separados | `build.js` con array de configs |
| Hash routing vanilla | SPA sin framework | `window.location.hash` + `hashchange` listener |
| CSS custom properties | Theming dark/light | `:root { --bg: #060404; }` con toggle |
| Firebase security rules | Proteger paths por auth | `".read": "auth != null"` |
| Cache busting con MD5 | Forzar recarga de assets | `build.js` hashea → `?v=hash` en HTML |
| Proxy reactivo | Detectar cambios en state | `new Proxy(obj, setHandler)` |
| Event bus pattern | Comunicación entre módulos | `emit('beats:updated', data)` |
| Dynamic import | Lazy-load módulo admin | `import('./dist/admin-app.js')` |
| mergeCardStyles() | Herencia de estilos (global→beat→custom) | Ver `card-style-engine.js` v5.2 |
| postMessage bridge | Admin iframe ↔ tienda con ACK | Ver `live-edit.js` v5.2 |
| Canvas particles | Fondo animado performante | Ver `particles-store.js` v5.2 |
| SVG waveform | Generar forma de onda desde audio | Ver `waveform.js` v5.2 |

---

## Archivos del Proyecto (mapeo v5.2 → v6.0)
| v5.2 (actual) | v6.0 (objetivo) | Estado | Notas |
|---------------|-----------------|--------|-------|
| src/config.js | src/shared/config.js | ⏳ | Sin cambios lógicos |
| src/state.js | src/shared/state.js | ⏳ | Merge con admin/state.js, agregar Proxy |
| src/utils.js | src/shared/utils.js | ⏳ | Sin cambios |
| src/error-handler.js | src/shared/error-handler.js | ⏳ | Sin cambios |
| _(nuevo)_ | src/shared/firebase.js | ⏳ | Singleton: initFirebase, getDb, getAuth |
| _(nuevo)_ | src/shared/auth.js | ⏳ | Google OAuth + requireAdmin + logout |
| _(nuevo)_ | src/shared/db.js | ⏳ | CRUD wrappers para Firebase |
| _(nuevo)_ | src/shared/event-bus.js | ⏳ | on, off, emit, once |
| src/card-style-engine.js | src/shared/card-style-engine.js | ⏳ | Sin cambios (crítico) |
| src/main.js | src/store-main.js | ⏳ | Rewrite con nuevos imports |
| src/player.js | src/store/player.js | ⏳ | Cambiar imports |
| src/cards.js | src/store/cards.js | ⏳ | Cambiar imports |
| src/modal.js | src/store/modal.js | ⏳ | Cambiar imports |
| src/filters.js | src/store/filters.js | ⏳ | Cambiar imports |
| src/wishlist.js | src/store/wishlist.js | ⏳ | Cambiar imports |
| src/waveform.js | src/store/waveform.js | ⏳ | Cambiar imports |
| src/theme.js | src/store/theme.js | ⏳ | Cambiar imports |
| src/effects.js | src/store/effects.js | ⏳ | Cambiar imports |
| src/particles-store.js | src/store/particles.js | ⏳ | Renombrar + imports |
| src/settings.js | src/store/settings.js | ⏳ | Cambiar imports |
| src/settings-elements.js | src/store/settings-elements.js | ⏳ | Cambiar imports |
| src/analytics.js | src/store/analytics.js | ⏳ | Cambiar imports |
| src/hash-router.js | src/store/hash-router.js | ⏳ | Cambiar imports |
| src/live-edit.js | src/store/live-edit.js | ⏳ | Cambiar imports |
| src/admin-main.js | src/admin-main.js | ⏳ | Rewrite completo |
| src/admin/config.js | src/admin/config.js | ⏳ | Cambiar imports |
| src/admin/state.js | _(merge en shared/state.js)_ | ⏳ | Eliminar, usar shared |
| src/admin/helpers.js | src/admin/helpers.js | ⏳ | Cambiar imports |
| src/admin/core.js | src/admin/core.js | ⏳ | Cambiar imports |
| src/admin/firebase-init.js | _(merge en shared/auth.js + firebase.js)_ | ⏳ | Eliminar, usar shared |
| src/admin/click-handler.js | src/admin/click-handler.js | ⏳ | Cambiar imports |
| src/admin/colors.js | src/admin/design-colors.js | ⏳ | Renombrar + imports |
| src/admin/fonts.js | src/admin/design-fonts.js | ⏳ | Renombrar + imports |
| src/admin/nav.js | src/admin/design-nav.js | ⏳ | Renombrar + imports |
| src/admin/beats.js | src/admin/beats.js | ⏳ | Cambiar imports |
| src/admin/beat-*.js (6 files) | src/admin/beat-*.js | ⏳ | Cambiar imports |
| src/admin/card-*.js (3 files) | src/admin/design-cards.js | ⏳ | Consolidar + imports |
| src/admin/glow.js | src/admin/design-effects.js | ⏳ | Consolidar |
| src/admin/gradient.js | src/admin/design-effects.js | ⏳ | Consolidar |
| src/admin/particles.js | src/admin/design-effects.js | ⏳ | Consolidar |
| src/admin/floating.js | src/admin/design-effects.js | ⏳ | Consolidar |
| src/admin/text-colorizer.js | src/admin/design-hero.js | ⏳ | Consolidar |
| src/admin/hero-preview.js | src/admin/design-hero.js | ⏳ | Consolidar |
| src/admin/emojis.js | src/admin/design-effects.js | ⏳ | Consolidar |
| src/admin/gallery.js | src/admin/media-gallery.js | ⏳ | Renombrar |
| src/admin/gallery-picker.js | src/admin/media-gallery.js | ⏳ | Consolidar |
| src/admin/preview-*.js (3 files) | src/admin/preview.js | ⏳ | Consolidar |
| src/admin/undo.js | src/admin/undo.js | ⏳ | Cambiar imports |
| src/admin/autosave.js | src/admin/autosave.js | ⏳ | Cambiar imports |
| src/admin/export.js | src/admin/export-import.js | ⏳ | Renombrar |
| src/admin/theme-io.js | src/admin/export-import.js | ⏳ | Consolidar |
| src/admin/snapshots.js | src/admin/snapshots.js | ⏳ | Cambiar imports |
| src/admin/theme-presets.js | src/admin/snapshots.js | ⏳ | Consolidar |
| src/admin/r2.js | src/admin/r2.js | ⏳ | Cambiar imports |
| src/admin/features.js | src/admin/settings.js | ⏳ | Consolidar |
| src/admin/toggles.js | src/admin/settings.js | ⏳ | Consolidar |
| src/admin/trash.js | src/admin/trash.js | ⏳ | Cambiar imports |
| src/admin/cmd-palette.js | src/admin/cmd-palette.js | ⏳ | Cambiar imports |
| src/admin/resize.js | src/admin/preview.js | ⏳ | Consolidar |
| src/admin/fullscreen.js | src/admin/preview.js | ⏳ | Consolidar |
| src/admin/qr.js | src/admin/qr.js | ⏳ | Cambiar imports |
| src/admin/changelog.js | src/admin/changelog.js | ⏳ | Cambiar imports |
| index.html | index.html | ⏳ | Rewrite como SPA shell |
| admin.html | _(eliminado)_ | ⏳ | Todo vive en index.html |
| store-styles.css | store-styles.css | ⏳ | Variables CSS unificadas |
| admin-styles.css | admin-styles.css | ⏳ | Scoping bajo .admin-panel |
| build.js | build.js | ⏳ | Actualizar entry points |
| package.json | package.json | ⏳ | Actualizar a 6.0.0 |

---

## Archivos Modificados (última sesión)
| Archivo | Cambio |
|---------|--------|
| MEGA-PROMPT.md | Creado — mega prompt definitivo v2.0 |
| MEMORY.md | Creado — plantilla de memoria del proyecto |

---

## Pendientes para Próxima Sesión
- [ ] **FASE 0 — Setup:**
  - [ ] Clonar repo en nueva carpeta: `git clone https://github.com/dacewav/catalog dacewav-v6`
  - [ ] Crear branch: `git checkout -b v6-rebuild`
  - [ ] Instalar dependencias: `npm install`
  - [ ] Verificar build: `npm run build`
  - [ ] Verificar tests: `npm test`
  - [ ] Crear dirs: `src/shared/`, `src/store/`, `src/admin/`
  - [ ] Commit inicial
- [ ] **FASE 1.1:** Migrar config.js → src/shared/config.js
- [ ] **FASE 1.2:** Crear src/shared/firebase.js (singleton)
- [ ] **FASE 1.3:** Crear src/shared/event-bus.js
- [ ] **FASE 1.4:** Crear src/shared/state.js (unificado)

---

## Log de Sesiones
| Fecha | IA | Fase | Qué se hizo | Estado |
|-------|-----|------|-------------|--------|
| 2026-04-19 | Claude | — | Creación del MEGA-PROMPT v3.2 y MEMORY.md | ✅ |

---

## Mejoras sugeridas al MEGA-PROMPT
<!-- Cada IA puede agregar filas aquí si encontró gaps en el prompt -->
<!-- DACE aplica las mejoras periódicamente al MEGA-PROMPT.md del repo -->
| Fecha | Sección | Problema | Sugerencia | Estado |
|-------|---------|----------|------------|--------|
| _(vacío — se llena durante desarrollo)_ | | | | |

## Notas Importantes
- **Firebase config** está en el repo público (v5.2). Para v6.0 considerar si se necesita proteger.
- **Firebase SDK** usa v9 compat (no modular). Decisión pendiente: ¿migrar a modular?
- **Cloudflare R2** ya configurado para uploads de imágenes. Ver `src/admin/r2.js` v5.2.
- **La lista de admins** en Firebase (`/admins/{uid}`) debe tener al menos un seed: el UID del owner.
- **El usuario (DACE) no programa.** Siempre dar soluciones completas, no instrucciones.
- **Cada sesión de IA dura ~1 hora.** MEMORY.md es la ÚNICA continuidad entre sesiones.
- **La tienda está en producción.** Usuarios reales la visitan. No romper.
