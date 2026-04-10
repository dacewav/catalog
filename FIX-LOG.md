# DACEWAV.STORE v5.3 — Fix Log

## Fixes aplicados

### 🔴 Críticos (el admin no funcionaba)
1. **`settings.js` — `state.theme` → `state.T`** — El store usaba `state.T` pero settings.js accedía `state.theme`. El logo, banner, hero y links nunca se renderizaban en la tienda.

2. **Tests mocks incompletos** — `setColorRefs` y `setAutoSaveRef` no estaban en los mocks de `colors.js` y `helpers.js`. Los tests `admin-core.test.js` y `admin-beats.test.js` fallaban al importar.

### 🟡 Importantes (funciones no encontradas)
3. **`prevImg()` no expuesto a window** — El HTML llama `oninput="prevImg()"` en el campo de imagen URL del beat editor, pero la función era local en beats.js. Agregada a `Object.assign(window, ...)` y marcada como `export`.

4. **`uploadPreviews()` no existía** — El HTML tiene un input file multi-select con `onchange="uploadPreviews(this)"` pero la función nunca fue implementada. Creada: sube múltiples previews a R2 y asigna por nombre de archivo al beat correspondiente.

5. **`setShowSectionNav` nunca se cableaba** — `core-preview.js` tiene una ref `showSectionNav` para navegar al hacer click en elementos del preview iframe. El wiring a `showSection` de nav.js nunca se hizo. Agregado en `core.js`.

6. **`def-lics-editor` vs `deflics-editor` mismatch** — El HTML usa `id="deflics-editor"` pero `features.js` buscaba `g('def-lics-editor')`. Las licencias base no se renderizaban. Fix: features.js ahora busca ambos IDs.

### 🟢 Verificaciones pasadas
- ✅ Build: store 47.9KB, admin 103.2KB (12ms + 19ms)
- ✅ Tests: 121/121 pasando (8 test files)
- ✅ Todos los `onclick` del HTML tienen función en window
- ✅ Todos los imports de módulos admin resuelven
- ✅ Todos los imports de módulos store resuelven
- ✅ Todos los IDs de elementos HTML referenciados en JS existen (excepto `grad-bar` que es dinámico)
- ✅ Preview iframe apunta a `index.html`
- ✅ Admin carga `dist/admin-app.js`, Store carga `dist/store-app.js`
- ✅ `stubs.js` implementa: `initLayoutCanvas`, `runBackup`, `runSitemap`, `runStats`, `loadStats`
- ✅ `resize.js` auto-inicializa el handle de redimensión
- ✅ Versiones: store 5.3.0, admin 5.3.0
