# DACEWAV.STORE — Contexto para siguiente sesión
# Fecha: 2026-04-09 | Sesión por: Mira (AI assistant)

## Quién es el usuario
- Habla español, casual
- Usa GitHub Pages para deploy (repo: dacewav/catalog, branch main)
- El admin es su panel personal para gestionar beats, temas, links, etc.
- La tienda es para vender beats de música (Trap, R&B, Drill, Reggaeton)
- Firebase como backend (Realtime Database + Auth)

## Estado actual del proyecto
- **v5.2 estable** — Store y Admin compilan, 64 tests pasan, producción funcionando
- **GitHub Pages** despliega automáticamente al hacer push a main
- **Firebase Rules** publicadas (v5.2, con validaciones de datos)
- El usuario NO tiene gh CLI ni git configurado en su máquina para este repo — necesita token de GitHub para que el asistente haga push

## Cosas por pulir (ordenadas por importancia)

### 🔴 Crítico
- [ ] **Verificar admin en producción** — Nunca se probó el admin con el bundle modular. Abrir admin.html, hacer login, probar CRUD de beats. Probablemente haya bugs de imports o funciones que no se expusieron a window.

### 🟡 Importante
- [ ] **Firebase Auth en rules** — Actualmente `.write: "auth != null"` significa que CUALQUIER usuario de Firebase puede modificar datos. Debería validar contra la whitelist de emails.
- [ ] **core.js es un monstruo (924 líneas)** — Contiene undo/redo, auto-save, preview, theme, presets, particles, emojis, glow, banner, export/import, snapshots, gradient editor, hero drag, fullscreen preview, change log. Dividirlo sería bueno pero tiene dependencias circulares con colors.js y nav.js.
- [ ] **auth.js está duplicado** — `src/admin/auth.js` tiene login/logout pero firebase-init.js tiene su propia versión. Borrar auth.js o integrarla.
- [ ] **Más tests** — Solo tests de store. Falta: admin/core.js (collectTheme, loadThemeUI), admin/colors.js, admin/beats.js.

### 🟢 Nice to have
- [ ] **SEO prerendering** — La tienda depende 100% de JS para renderizar. Google no indexa nada.
- [ ] **Lazy loading** — Si hay muchos beats, el grid se vuelve lento.
- [ ] **CSS cleanup** — store-styles.css y admin-styles.css tienen duplicados.
- [ ] **store-app.js backup** — El archivo original de 58KB ya no se usa (el store carga dist/store-app.js). Se puede borrar.

## Comandos útiles
```bash
cd dacewav-v5.2
npm install          # instalar deps
npm run build        # compilar (store + admin)
npm test             # correr 64 tests
npm run build:watch  # modo dev con hot reload
```

## Arquitectura rápida
- **Store** (frontend público): `src/main.js` → `dist/store-app.js` (48KB)
- **Admin** (panel privado): `src/admin-main.js` → `dist/admin-app.js` (100KB)
- **Build**: esbuild (13ms), config en `build.js`
- **Tests**: vitest, config en `vitest.config.js`
- **Firebase**: compat SDK (global `firebase` object, no modular)

## Trampa fácil de caer
- Los módulos admin usan `window.functionName = functionName` para que los onclick del HTML funcionen. Si un módulo falta su window assignment, algo del admin se rompe sin error visible.
- `colors.js` y `core.js` tienen dependencia circular (esbuild la resuelve, pero al refactorizar cuidado).
- `state.js` del admin usa getters/setters exportados (`export let db = null; export function setDb(v) { db = v; }`). Los imports leen el binding, no el valor, así que hay que usar los setters.
