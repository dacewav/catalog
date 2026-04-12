# 🚀 SESSION STARTUP — Léelo primero

## Si el usuario dice "donde lo dejamos, seguimos" o similar:

### 1. Abrir el proyecto
```bash
cd /root/.openclaw/workspace/catalog
git checkout fix-panel-overlap
git pull
```

### 2. Leer estos 3 archivos (en orden)
1. `REFACTOR-PLAN.md` → busca el primer bloque con `SIGUIENTE` o sin `✅`
2. `memory/2026-04-13.md` (y la fecha de hoy si existe) → contexto de la última sesión
3. `MEMORY.md` → contexto general del proyecto

### 3. Ejecutar el bloque pendiente
- Seguir los pasos del REFACTOR-PLAN.md al pie de la letra
- Cada bloque termina con: `node build.js` → commit → push → actualizar plan

### 4. Después de CADA bloque
- [ ] Build OK (`node build.js`)
- [ ] Commit con mensaje descriptivo
- [ ] Push a `fix-panel-overlap`
- [ ] Actualizar `REFACTOR-PLAN.md`: marcar bloque como ✅, marcar siguiente como SIGUIENTE
- [ ] Actualizar `memory/YYYY-MM-DD.md` con lo que hiciste

### 5. Si algo rompe
- NO fix a ciegas
- Reportar qué rompió y por qué
- Revertir con `git checkout -- <archivo>` si es necesario
- Replantear el bloque

---

## Estado actual (última actualización: 2026-04-13)
- ✅ core.js: 1405 → 711 líneas (-694, -49%)
- 9 módulos extraídos: undo, gradient, changelog, floating, snapshots, emojis, text-colorizer, glow, hero-preview
- ⏳ Quedan en core.js (711 líneas): auto-save, broadcast, collectTheme, loadThemeUI, presets, anim controls, particles, iframe comm
- Branch: `fix-panel-overlap`
- Build: `npm install && node build.js`

## Bugs pendientes de verificación en browser
- Panel overlap: showEt usa inline styles ahora → verificar
- Galería vacía: _imgHistory se resetea en openEditor → verificar
