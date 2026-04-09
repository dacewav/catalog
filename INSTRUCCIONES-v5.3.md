# DACEWAV.STORE v5.3 — Handoff Document

## Archivos incluidos

Extrae `dacewav-v5.3.tar.gz` — contiene todo el proyecto listo.

```bash
mkdir dacewav-v5.3 && cd dacewav-v5.3
tar xzf dacewav-v5.3.tar.gz
npm install
npm run build
npm test   # → 95 tests
```

---

## Qué se hizo en esta sesión

### ✅ Completado

1. **Firebase Rules v5.3** (`firebase-rules-v5.3.json`)
   - Antes: `.write: "auth != null"` → cualquier usuario logueado podía escribir
   - Ahora: cada path de escritura valida contra `adminWhitelist` en la DB
   - Solo los 3 emails bootstrap pueden modificar `adminWhitelist`
   - `analytics/events`, `counts`, `daily` siguen write público (necesario para tracking)
   - **⚠️ FALTA PUBLICAR en Firebase Console** — copiar el JSON y pegar en Rules → Publish

2. **auth.js eliminado** (`src/admin/auth.js`)
   - Era duplicado de la auth en `firebase-init.js`
   - `firebase-init.js` tiene whitelist + manejo de errores mejor

3. **firebase-init.js fix**
   - Bootstrap del `adminWhitelist` solo si el usuario es admin base
   - `addWhitelistEmail` / `removeWhitelistEmail` manejan error de permisos

4. **Tests: 64 → 95 (+31)**
   - `tests/admin-core.test.js` — 14 tests (computeGlowCSS 7 tipos, collectTheme defaults/values/layout/particles)
   - `tests/admin-beats.test.js` — 17 tests (renderBeatList badges/images/count, filterBeatList name/genre/key, openEditor new/edit)
   - `tests/setup.js` — mocks de `window`, `document`, `addEventListener` para entorno Node

5. **Docs subidos a repo**
   - `CONTEXT.md`, `SESION-2026-04-09.md`, `README.md`

6. **Push a GitHub** — commit `e47a106` en `main`
   - GitHub Pages despliega automáticamente

---

## Estado actual del proyecto

- **v5.3** — Build OK (store 48KB, admin 100.2KB), 95 tests pasando
- **GitHub Pages**: `https://dacewav.github.io/catalog/`
- **Firebase**: compat SDK (global `firebase` object)
- **Build**: esbuild (~13ms store, ~18ms admin)
- **Tests**: vitest, 7 test files, 95 tests

---

## Bugs conocidos en el Admin Panel

### 🔴 Funciones no implementadas (HTML llama pero no existen en src/)

- **`initLayoutCanvas()`** — onclick en Layout → "Layout Canvas → Reiniciar". No existe en ningún módulo.
- **`runBackup()`** — onclick en Settings → Utilidades → "Backup ahora". No existe.
- **`runSitemap()`** — onclick en Settings → Utilidades → "Generar Sitemap". No existe.
- **`runStats()`** — onclick en Stats → "vía Worker". No existe.
- **`loadStats()`** — Referenciado en nav.js (`typeof window.loadStats`) pero nunca definido. Al entrar a la sección Stats, no carga datos.
- **`updateMP()`** — Llamado en `beats.js → uploadBeatPreview` y en HTML (`oninput="updateMP()"` en el campo Preview URL). Nunca definido — rompe al subir preview o al escribir una URL manualmente.

### 🟡 Resize handle no funciona

- **`initResize()`** en `resize.js` está definida pero **nunca se llama**. No hay side-effects en el módulo. El handle entre el panel de controles y el preview no permite redimensionar. Fix: llamar `initResize()` en `firebase-init.js → initAdmin()` o agregar side-effect en resize.js.

### 🟡 Sidebar colapsable

- No existe botón ni handler para colapsar/expandir la sidebar. El CSS tiene `.sidebar` fijo a 52px. Si el usuario espera poder retraerla, falta implementar toggle.

### Notas

- `deleteBeat` está en `Object.assign(window, ...)` de beats.js — funciona.
- `openCmdPalette`, `closeKbdPanel`, `toggleCard`, `applyTypo`, `seekMP` — todos expuestos a window. Funcionan.
- Las funciones del whitelist (`addWhitelistEmail`, `removeWhitelistEmail`, `renderWhitelistEditor`) se asignan directamente con `window.func = func` en firebase-init.js. Funcionan.

---

## Pendientes (ordenados por prioridad)

### 🔴 Crítico

- [ ] **Publicar firebase-rules-v5.3.json en Firebase Console**
  - Copiar contenido del archivo → Firebase Console → Realtime Database → Rules → Publish
  - Después: entrar al admin con una de las 3 cuentas base (se crea adminWhitelist automáticamente)

- [ ] **Verificar admin en producción**
  - Abrir `https://dacewav.github.io/catalog/admin.html`
  - Hacer login, probar CRUD de beats, cambio de tema, presets, etc.
  - Primera vez con el bundle modular — probablemente hay bugs de imports o funciones que no se expusieron a `window`

### 🟡 Importante

- [ ] **core.js es un monstruo (924 líneas)**
  - Contiene: undo/redo, auto-save, preview, theme collect/load, presets, particles, emojis, glow, banner, export/import, snapshots, gradient editor, hero drag, fullscreen preview, change log
  - Dividir en: `saving.js`, `preview.js`, `theme-builder.js`, `particles.js`, `export.js`
  - **OJO**: dependencias circulares con `colors.js` y `nav.js` — resolver primero
  - `colors.js` importa `updatePreview` y `autoSave` de `core.js`
  - `core.js` importa `loadColorValues` de `colors.js`

- [ ] **Más tests**
  - Admin/core.js: `loadThemeUI`, `saveAll`, `_collectSiteSettings`, `broadcastTheme`, `applyPreset`
  - Admin/colors.js: `buildColorEditor`, `loadColorValues`, `applyColor`
  - Admin/features.js: `renderLinksEditor`, `renderTestiEditor`, `renderDefLicsEditor`

- [ ] **CSS cleanup** — `store-styles.css` y `admin-styles.css` tienen duplicados

### 🟢 Nice to have

- [ ] **SEO prerendering** — La tienda depende 100% de JS. Google no indexa nada.
- [ ] **Lazy loading** — Virtualizar grid de beats si hay muchos.
- [ ] **store-app.js backup** — El de 58KB ya no se usa (el store carga `dist/store-app.js` de 48KB). Se puede borrar.

---

## Comandos útiles

```bash
cd dacewav-v5.3
npm install          # instalar deps
npm run build        # compilar (store + admin)
npm test             # correr 95 tests
npm run build:watch  # modo dev con hot reload
```

## Arquitectura rápida

```
src/
├── main.js             ← Store entry point
├── config.js, state.js, utils.js, error-handler.js
├── player.js, cards.js, filters.js, effects.js
├── theme.js, waveform.js, wishlist.js, settings.js
├── analytics.js, hash-router.js
│
└── admin/
    ├── firebase-init.js  ← Admin entry (bootstraps todo)
    ├── core.js           ← MÁS GRANDE (924 líneas, theme/save/preview...)
    ├── beats.js          ← CRUD + drag & drop
    ├── colors.js         ← Editor de colores
    ├── fonts.js          ← Font picker
    ├── nav.js            ← Navegación secciones
    ├── config.js         ← Constantes
    ├── state.js          ← Estado global (getters/setters)
    ├── helpers.js        ← DOM helpers
    ├── cmd-palette.js    ← Ctrl+K command palette
    ├── features.js       ← Licencias, links, testimonials
    ├── r2.js             ← Cloudflare R2 upload
    ├── qr.js             ← QR code generation
    └── resize.js         ← Panel resize handle
```

## Trampas fáciles de caer

- Los módulos admin usan `window.functionName = functionName` para que los `onclick` del HTML funcionen. Si un módulo falta su window assignment, algo se rompe sin error visible.
- `colors.js` ↔ `core.js` tienen dependencia circular (esbuild la resuelve, pero al refactorizar cuidado).
- `state.js` del admin usa getters/setters exportados. Los imports leen el binding, no el valor — hay que usar los setters (`setDb(v)` no `db = v`).
- Firebase config está hardcodeado en `src/admin/config.js` — NO es secreto (client-side).

---

## Token de GitHub

El token usado en esta sesión (`ghp_ZGX...18f`) fue limpiado del remote. **Revócalo en GitHub** antes de la próxima sesión. Genera uno nuevo cuando lo necesites para push.

---

_Generado: 2026-04-10 00:19 CST_
