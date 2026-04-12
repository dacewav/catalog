# Reporte de Sesión — 2026-04-12 (23:00)

## Tarea
Matchear la vista previa local del panel de admin con la vista previa de la tienda (tarjetas), añadir botón de upload de imagen directo en el preview, y actualización en tiempo real.

## Cambios realizados

### 1. Preview unificado con tarjeta de la tienda
- **Eliminado** el `.bcpv` simplificado (mini-card genérica que NO se parecía a la tienda)
- **Reemplazado** por `_buildCardHTML()` — genera el mismo HTML exacto que la tienda (`beat-card` con todos sus sub-elementos)
- Layout: de side-by-side (bcpv + tienda) → tarjeta centrada única
- Archivos: `admin.html`, `releases/v5.2/admin.html`

### 2. Botón 📸 Imagen en el preview
- Botón en el header del panel "Vista previa" (tab Extras del editor)
- Abre file picker directamente
- Usa el sistema R2 existente (`uploadBeatImg`) si está configurado
- Fallback a base64 local si R2 no está disponible
- Archivos: `src/admin/beat-preview.js` (nueva función `_initPvImgUpload`)

### 3. Actualización en tiempo real
- `uploadBeatImg` en `beats.js` ahora llama `_triggerLiveUpdate()` después de subir
- Chain: `setVal('f-img')` → `_triggerLiveUpdate()` → `updateCardPreview()` → `renderFullPvInCard()` → `_sendLiveUpdate()` (Firebase + postMessage iframe)
- `_initPvImgUpload()` se inicializa via `_attachLiveListeners()` al abrir el editor
- Archivos: `src/admin/beats.js`

### 4. CSS del preview
- `max-width` del container: 260px → 320px
- Estilos del card ya existían scoped bajo `#pv-full-card-container` en `admin-styles.css` (110+ reglas)
- Archivos: `admin-styles.css`, `releases/v5.2/admin-styles.css`

## Archivos modificados
```
src/admin/beat-preview.js    — handler upload + init
src/admin/beats.js           — _triggerLiveUpdate en uploadBeatImg
admin.html                   — nuevo layout preview
releases/v5.2/admin.html     — idem
admin-styles.css             — max-width 320px
releases/v5.2/admin-styles.css — idem
dist/admin-app.js            — build output
dist/admin-app.js.map        — build output
releases/v5.2/admin-app.js   — build output
```

## Commit
`e1144bf` — `feat: preview de tarjeta idéntica a la tienda + upload de imagen directo`

## Notas
- El CSS scoping de `store-styles.css` completo bajo `#pv-full-card-container` se intentó pero descartó por bugs en el parser. Se usa el CSS del admin que ya tiene los estilos scoped.
- Algunos efectos visuales avanzados (blur-fx, hover sibling blur, etc.) pueden no ser 100% idénticos a la tienda por diferencias en los CSS keyframes (`pv-*` vs store originals).
