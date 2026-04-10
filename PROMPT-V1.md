# Prompt v1 — Rediseño admin.html

## PROYECTO: dacewav/catalog — Reescritura completa de admin.html

Repo público: `https://github.com/dacewav/catalog`
Stack: Firebase Realtime Database (compat SDK 9.23), esbuild, GitHub Pages/Cloudflare Pages.
El admin compila con `npm run build` → genera `dist/admin-app.js` (100KB) que se carga al final del `admin.html` con `<script src="dist/admin-app.js">`.

---

## ESTADO ACTUAL — LO QUE EXISTE Y HAY QUE RESPETAR

El `admin.html` actual tiene 872 líneas. Todo el JS vive en `src/admin-main.js` y sus módulos compilados en `dist/admin-app.js`. Las funciones se exponen como `window.functionName` para que los `onclick` del HTML funcionen — esto no debe cambiar.

### Funciones críticas que el nuevo HTML debe seguir llamando igual:
- Firebase Auth: `doGoogleLogin()`, `doLogout()`
- Beats CRUD: `openEditor(null)`, `saveBeat()`, `deleteBeat()`, `filterBeatList(value)`, `batchAddBeats()`, `openBatchImg()`
- Tema/Preview: `saveAll()`, `autoSave()`, `updatePreview()`, `updateHeroPv()`, `sv(input)`, `toggleCard(el)`
- Secciones: `showSection('nombre')`, `showEt('tab')`
- Colores/Glow: `syncGlowColor(value)`, `syncWB()`, `syncWBA()`, `syncBtnColor()`, `syncBtnBdr()`, `syncBtnBg()`
- UI: `undo()`, `redo()`, `openCmdPalette()`, `exportAll()`, `importAll(event)`, `toggleAdminTheme()`, `toggleInspector()`
- R2: `saveR2Config()`, `testR2Connection()`, `purgeCache()`, `runBackup()`, `runSitemap()`
- Stats: `loadStats()`, `runStats()`
- Misc: `addWhitelistEmail()`, `takeSnapshot()`, `openKbdPanel()`, `setViewport('mobile'|'tablet'|'desktop')`, `refreshIframe()`, `toggleFullscreenPreview()`, `openQRPanel()`
- Typo: `applyTypo('industrial'|'brutalista'|...)`, `toggleFontPicker('display'|'body')`, `filterFontPicker('display',val)`, `loadMoreFonts('display')`, `applyCustomFont('display')`
- Licencias: `addLicRow()`, `loadDefaultLics()`, `addDefLicRow()`, `saveDefLics()`, `addLinkRow()`, `saveLinks()`, `addTestiRow()`, `saveTestis()`
- Anim: `addFE()`
- Particles: `togglePFields()`

### IDs que el JS necesita encontrar en el DOM (no renombrar):
login-overlay, login-google-btn, login-error, login-lockout, topbar, sdot, controls-area, preview-panel, preview-frame, beat-list, beat-search-input, beat-search-count, color-editor, hero-pv, hpv-grad, hpv-title, hpv-sub, hpv-eyebrow, hpv-eyebrow-text, le-editor, deflics-editor, links-editor, testi-editor, anim-controls, floating-editor, floating-preview, layout-canvas, preset-grid, save-slots, snapshots-list, diff-a, diff-b, diff-result, whitelist-list, stat-total-visits, stat-total-clicks, stat-total-wa, stat-total-searches, daily-visits-chart, top-views-chart, top-wa-chart, counts-table, r2-status-dot, r2-status-text, r2-worker-url, r2-upload-token, change-log, cmd-overlay, cmd-input, cmd-results, toast, saving-ind, particles-pv, gp-box, gp-text, gp-btn, banner-pv, emoji-grid, ce-list, batch-img-overlay, batch-img-drop, batch-img-input, batch-img-list, batch-img-save, qr-overlay, qr-canvas, qr-url, kbd-overlay, resize-handle, inspector-btn, theme-toggle

### Todos los input IDs:
t-blur, t-radius, t-grain, t-glow, tc-glow, tt-glow, h-title, h-sub, h-eyebrow, h-grad-on, h-grad-clr, h-grad-op, h-grad-w, h-grad-h, h-title-size, h-ls, h-lh, h-pad-top, h-glow-on, h-glow-int, h-glow-blur, h-stroke-on, h-stroke-w, h-stroke-clr, h-word-blur, h-word-op, h-eyebrow-on, h-eyebrow-clr, h-eyebrow-size, t-font-d, t-font-m, t-font-size, t-line-h, t-font-weight, t-glow-type, t-glow-anim, t-glow-op, t-glow-blur, t-glow-int, t-card-op, t-nav-op, t-beat-img-op, t-text-op, t-hero-bg-op, t-section-op, t-orb-blend, t-grain-blend, t-pad, t-gap, t-radius, t-hero-top, t-player-bot, t-logo-url, t-logo-text, t-logo-w, t-logo-scale, t-logo-rot, t-logo-gap, t-logo-ox, tc-wbar, tt-wbar, tc-wbar-a, tt-wbar-a, t-wbar-op, t-wbar-aop, t-wbar-h, t-wbar-r, tc-btn-clr, tt-btn-clr, tc-btn-bdr, tt-btn-bdr, tc-btn-bg, tt-btn-bg, t-bg-op, t-btn-op, t-btn-hop, tc-shadow, t-shadow-int, p-on, p-color, p-type, p-text-wrap, p-text, p-img-wrap, p-img-url, p-count, p-min, p-max, p-speed, p-opacity, b-active, b-text, b-bg, b-txt-clr, b-anim, b-speed, b-delay, b-easing, b-dir, b-anim-dir, f-id, f-name, f-genre, f-genre-c, f-bpm, f-key, f-desc, f-tags, f-img, f-img-file, f-audio, f-audio-file, f-prev, f-prev-file, f-spotify, f-youtube, f-soundcloud, f-date, f-order, f-plays, f-feat, f-excl, f-active, f-avail, btn-del, editor-title, s-name, s-wa, s-ig, s-email, s-hero, s-sub, s-div-title, s-div-sub, s-testi, custom-theme-name, custom-themes-list, snap-name, fp-display-btn, fp-display-dd, fp-display-search, fp-display-tabs, fp-display-list, fp-display-more, fp-display-custom, fp-body-btn, fp-body-dd, fp-body-search, fp-body-tabs, fp-body-list, fp-body-more, fp-body-custom, fp-display, fp-body, mp-ic, mp-fill, mp-t, wl-new-email, ce-name, ce-url, ce-w, ce-h, ce-anim, glow-desc, glow-anim-desc, grad-stops, preview-url, imp-f, r2-status-dot, r2-status-text, backup-status, sitemap-status, previews-status, previews-input, cmd-restore

### Clases que el JS busca:
.si (sidebar items, con .on para activo), .section (paneles, con .on), .etp (editor tabs), .et (tab nav), .card, .card-title, .card-body, .tog-row, .tog, .slider-wrap, .slider-val, .vp-btn, .tb, .btn, .font-picker-btn, .font-picker-dd, .font-preview-display, .font-preview-body

### Data attributes:
data-s en .si (nombre de sección), data-et en .et

---

## LO QUE QUIERO CAMBIAR — EL REDISEÑO

Reescribir completamente el HTML/CSS del admin con un nuevo diseño, pero conservando absolutamente todos los IDs, clases y llamadas listados arriba. El `dist/admin-app.js` no se toca.

### Nuevo layout general:
- 3 columnas: sidebar izquierdo (colapsable, ~200px expandido / 60px colapsado) + área de contenido central (flexible) + panel de preview derecho (colapsable, ~380px)
- El resize handle entre contenido y preview se queda
- Header/topbar se queda pero más limpio y con más altura

### Reorganización de la sidebar — separar TRABAJO de DISEÑO:

TRABAJO (sección propia, visual distinta):
- beats → "Catálogo de Beats" (icono music)
- stats → "Estadísticas"
- settings → "Configuración"
- team → "Equipo"

DISEÑO (grupo separado):
- global → "Estilos Globales"
- hero → "Hero & Banner"
- layout → "Layout"
- elements → "Elementos"
- animations → "Animaciones"
- floating → "Flotantes"
- themes → "Temas & Presets"

### Diseño visual nuevo:
- Dark theme base: #0f0f11 fondo, #1a1a1f paneles, #252530 cards, bordes #2e2e3a
- Acento personalizable (CSS var --acc)
- Tipografía grande y jerárquica: sección title en 18px bold, card title en 13px medium, labels en 11px uppercase con letter-spacing
- Sliders con track custom (más alto, 6px, con fill de color --acc), thumb grande (18px), valor siempre visible a la derecha
- Color pickers: swatch cuadrado 32x32 + input hex de texto, ambos sincronizados
- Cards con bordes sutiles, border-radius 12px, padding 20px
- Sidebar con íconos grandes (20px) + texto, separadores visuales entre grupos TRABAJO/DISEÑO, highlight de item activo con barra izquierda de color --acc
- Topbar con altura 52px, logo a la izquierda, controles al centro, acciones a la derecha
- Cada sección tiene un header descriptivo con título, descripción corta y badge de estado

### Mejoras específicas por sección:

**Beats** (TRABAJO):
- Lista de beats como tabla/cards grandes, con imagen thumbnail, nombre, género, BPM, key, estado (badge), y acciones
- Buscador más prominente con filtros de género y estado
- Botón "Nuevo beat" destacado (primary)
- Stats rápidas: total beats, activos, exclusivos — en chips/badges en el header

**Editor de beat** (sec-add):
- Tabs más grandes y claros (Info / Licencias / Media / Plataformas / Extras)
- Campos organizados en grid 2 columnas con labels descriptivos
- En Media: zona de drop de imagen con preview grande (200x200), zona de drop de audio con mini player integrado
- En Licencias: tabla con nombre, precio MXN, precio USD, derechos — editable inline

**Global** (DISEÑO):
- Color pickers todos con swatch + hex, agrupados: "Colores base" y "Efectos"
- Sliders con rango completo sin límites artificiales, bien etiquetados con unidad (px, %, rem, x)
- Presets de tipografía como cards clickeables con preview del estilo

**Hero** (DISEÑO):
- Mini preview del hero siempre visible arriba de los controles
- Controles del glow con preview en tiempo real de los 3 elementos

**Temas** (DISEÑO):
- Preset grid como tarjetas grandes con nombre y swatch de colores
- Save slots numerados con nombre editable

### Panel de preview derecho:
- Selector de viewport con íconos (mobile/tablet/desktop)
- URL bar para cambiar la URL del iframe
- Botones: refresh, fullscreen, QR
- Sin cambios funcionales

### Restricciones:
- El archivo dist/admin-app.js NO se toca, ni src/, ni build.js
- Solo se reescribe admin.html (HTML + CSS embebido en <style>)
- admin-styles.css externo puede vaciarse o eliminarse
- Funciona sin backend propio (GitHub Pages / Cloudflare Pages)
- Compatible con Firebase compat SDK
- Las fuentes de Google Fonts del <head> se quedan
- Font Awesome 6.5.1 se queda
