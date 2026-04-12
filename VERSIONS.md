# VERSIONS — DACEWAV.STORE

## Release History

### v5.1 (2026-04-12)
**Archivo:** `releases/v5.1.tar.gz` (181K)
**Commit:** `d3f490b`

Cambios:
- **admin-styles.css**: Sidebar 80px columna (icon+label apilado), Topbar 48px compacto, Cards limpias (--as bg, uppercase titles), slider-val color accent, .field-hint, .save-status (3 estados), .preview-sync-badge, preview-bar con vars del sistema
- **admin.html**: Topbar 9 botones con icon+label 7px, Sidebar 13 items en 3 grupos (Contenido/Diseño/Sistema), JS sync (syncToPreview, pushAllThemeToFrame, autoSave wrapper, _idToVar map), preview-sync-badge, sin duplicados s-hero/s-sub
- **index.html**: Listener postMessage para DACE_THEME (sync iframe en tiempo real)
- **SKILLS-REFERENCE.md**: 10 skills documentadas

Archivos incluidos:
- admin.html (135K)
- admin-styles.css (98K)
- index.html (16K)
- dist/admin-app.js (199K, sin cambios)
- dist/store-app.js (65K, sin cambios)
- dist/store-app.js.map (186K)
- store-styles.css (73K)
- SKILLS-REFERENCE.md (1.7K)

Para subir: reemplaza admin.html, admin-styles.css, index.html en tu hosting.

---

### v5.0 y anteriores
Ver git log del repo para historial completo.
