# DACEWAV.STORE — Reporte Crítico v5.3 (2026-04-10)

## ✅ BUG ACTIVO FINALMENTE CORREGIDO: showEt tabs

**Causa raíz REAL:** `showEt` se asignaba a `window` desde DOS módulos:
1. `src/admin/nav.js` → `Object.assign(window, { showSection, showEt })`
2. `src/admin/features.js` → `Object.assign(window, { ..., showEt, copyCmd })`

El fix de `data-et` y re-export NO bastaba porque features.js seguía asignando `showEt` a window en su `Object.assign`. Esbuild no lo eliminaba del bundle.

**Fix definitivo:** Eliminado `showEt` del `Object.assign(window)` de features.js. Ahora solo nav.js lo asigna.

**Archivos modificados:**
- `src/admin/features.js` — quitado `showEt` del Object.assign + quitado re-export
- `src/admin/nav.js` — showEt usa `data-et` attributes (ya estaba)

---

## Estado actual del proyecto: v5.3

### Bugs corregidos en esta sesión (v5.2 → v5.3)

| Bug | Estado | Fix |
|-----|--------|-----|
| showEt tabs rotas | ✅ FIX DEFINITIVO | Un solo módulo asigna a window |
| Memory leaks effects.js | ✅ | disconnect observer + removeEventListener |
| Scroll listeners duplicados | ✅ | Guard en initAllEffects() |
| confirm()/prompt() nativos | ✅ | confirmInline/promptInline |
| formatTime duplicada | ✅ | fmt() unificada en helpers.js |
| Waveform cache sin límite | ✅ | Max 50 entries + LRU |
| Analytics rate limiting | ✅ | Batched writes 2s debounce |
| EQ no se detiene en error | ✅ | error handler agrega stopEQ |
| postMessage sin origin | ✅ | window.location.origin |
| Light mode incompleto | ✅ | Estilos para wishlist, cards, filtros |

### Bugs pendientes (Priority Baja)

- Firebase Compat vs Modular (intencional por ahora)
- ~150 onclick="" inline handlers en admin.html (migración progresiva)
- renderAll() re-renderiza innerHTML (pierde event listeners 3D tilt)

### Problemas estructurales identificados

1. **150 onclick inline en HTML** — frágil, depende de que esbuild resuelva window assignments en orden correcto
2. **2 Object.assign(window) compitiendo** — cualquier función duplicada causa bugs silentos
3. **admin.html tiene 75KB** — todo el HTML del admin en un solo archivo
4. **admin-styles.css tiene 34KB** — un solo archivo CSS para todo
5. **Beats + Diseño + Settings mezclados** — secciones no están organizadas lógicamente

---

## Pendientes de deploy

- [ ] Verificar Cloudflare Pages deploy automático
- [ ] Subir reglas Firebase (firebase-rules-v5.2.json)
- [ ] Activar Google Auth en Firebase Console
- [ ] Desplegar Cloudflare Worker (R2 upload)
- [ ] Configurar CDN cdn.dacewav.store
- [ ] **Rotar token de GitHub** (quedó expuesto)

---

*Última actualización: 2026-04-10 23:58 GMT+8*
