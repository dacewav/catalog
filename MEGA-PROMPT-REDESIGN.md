# ════════════════════════════════════════════════════════════
# DACEWAV.STORE — MEGA CONTEXTO v2
# Contexto completo para el chat de rediseño del admin
# ════════════════════════════════════════════════════════════

## PROYECTO
Repo: github.com/dacewav/catalog
Deploy: Cloudflare Pages (auto-deploy desde GitHub main)
URL: https://dacewav.store/admin.html
Stack: Firebase compat SDK 9.23, esbuild, GitHub Pages/Cloudflare Pages
Build: `npm run build` → `dist/admin-app.js` (100KB)

## TAREA
Reescribir completamente `admin.html` (HTML + CSS embebido en `<style>`).
NO tocar: `dist/admin-app.js`, `src/`, `build.js`, ni ningún archivo JS.
Solo se reescribe `admin.html`.

## RESTRICCIONES ABSOLUTAS

### 1. IDs que el JS necesita (NO renombrar):
login-overlay, login-google-btn, login-error, login-lockout, topbar, sdot, controls-area, preview-panel, preview-frame, beat-list, beat-search-input, beat-search-count, color-editor, hero-pv, hpv-grad, hpv-title, hpv-sub, hpv-eyebrow, hpv-eyebrow-text, le-editor, deflics-editor, links-editor, testi-editor, anim-controls, floating-editor, floating-preview, layout-canvas, preset-grid, save-slots, snapshots-list, diff-a, diff-b, diff-result, whitelist-list, stat-total-visits, stat-total-clicks, stat-total-wa, stat-total-searches, daily-visits-chart, top-views-chart, top-wa-chart, counts-table, r2-status-dot, r2-status-text, r2-worker-url, r2-upload-token, change-log, cmd-overlay, cmd-input, cmd-results, toast, saving-ind, particles-pv, gp-box, gp-text, gp-btn, banner-pv, emoji-grid, ce-list, batch-img-overlay, batch-img-drop, batch-img-input, batch-img-list, batch-img-save, qr-overlay, qr-canvas, qr-url, kbd-overlay, resize-handle, inspector-btn, theme-toggle

### 2. Input IDs (NO renombrar):
t-blur, t-radius, t-grain, t-glow, tc-glow, tt-glow, h-title, h-sub, h-eyebrow, h-grad-on, h-grad-clr, h-grad-op, h-grad-w, h-grad-h, h-title-size, h-ls, h-lh, h-pad-top, h-glow-on, h-glow-int, h-glow-blur, h-stroke-on, h-stroke-w, h-stroke-clr, h-word-blur, h-word-op, h-eyebrow-on, h-eyebrow-clr, h-eyebrow-size, t-font-d, t-font-m, t-font-size, t-line-h, t-font-weight, t-glow-type, t-glow-anim, t-glow-op, t-glow-blur, t-glow-int, t-card-op, t-nav-op, t-beat-img-op, t-text-op, t-hero-bg-op, t-section-op, t-orb-blend, t-grain-blend, t-pad, t-gap, t-radius, t-hero-top, t-player-bot, t-logo-url, t-logo-text, t-logo-w, t-logo-scale, t-logo-rot, t-logo-gap, t-logo-ox, tc-wbar, tt-wbar, tc-wbar-a, tt-wbar-a, t-wbar-op, t-wbar-aop, t-wbar-h, t-wbar-r, tc-btn-clr, tt-btn-clr, tc-btn-bdr, tt-btn-bdr, tc-btn-bg, tt-btn-bg, t-bg-op, t-btn-op, t-btn-hop, tc-shadow, t-shadow-int, p-on, p-color, p-type, p-text-wrap, p-text, p-img-wrap, p-img-url, p-count, p-min, p-max, p-speed, p-opacity, b-active, b-text, b-bg, b-txt-clr, b-anim, b-speed, b-delay, b-easing, b-dir, b-anim-dir, f-id, f-name, f-genre, f-genre-c, f-bpm, f-key, f-desc, f-tags, f-img, f-img-file, f-audio, f-audio-file, f-prev, f-prev-file, f-spotify, f-youtube, f-soundcloud, f-date, f-order, f-plays, f-feat, f-excl, f-active, f-avail, btn-del, editor-title, s-name, s-wa, s-ig, s-email, s-hero, s-sub, s-div-title, s-div-sub, s-testi, custom-theme-name, custom-themes-list, snap-name, fp-display-btn, fp-display-dd, fp-display-search, fp-display-tabs, fp-display-list, fp-display-more, fp-display-custom, fp-body-btn, fp-body-dd, fp-body-search, fp-body-tabs, fp-body-list, fp-body-more, fp-body-custom, fp-display, fp-body, mp-ic, mp-fill, mp-t, wl-new-email, ce-name, ce-url, ce-w, ce-h, ce-anim, glow-desc, glow-anim-desc, grad-stops, preview-url, imp-f, r2-status-dot, r2-status-text, backup-status, sitemap-status, previews-status, previews-input, cmd-restore

### 3. Clases que el JS busca (NO renombrar):
.si (sidebar items, .on activo), .section (paneles, .on), .etp (editor tabs), .et (tab nav), .card, .card-title, .card-body, .tog-row, .tog, .slider-wrap, .slider-val, .vp-btn, .tb, .btn, .font-picker-btn, .font-picker-dd, .font-preview-display, .font-preview-body

### 4. Data attributes (NO cambiar):
data-s en .si (nombre de sección), data-et en .et

### 5. onclick handlers que el HTML DEBE tener (el JS los llama así):
- doGoogleLogin(), doLogout()
- openEditor(null), saveBeat(), deleteBeat(), filterBeatList(value), batchAddBeats(), openBatchImg()
- saveAll(), autoSave(), updatePreview(), updateHeroPv(), sv(input), toggleCard(el)
- showSection('nombre'), showEt('tab')
- syncGlowColor(value), syncWB(), syncWBA(), syncBtnColor(), syncBtnBdr(), syncBtnBg()
- undo(), redo(), openCmdPalette(), exportAll(), importAll(event), toggleAdminTheme(), toggleInspector()
- saveR2Config(), testR2Connection(), purgeCache(), runBackup(), runSitemap()
- loadStats(), runStats()
- addWhitelistEmail(), takeSnapshot(), openKbdPanel(), setViewport('mobile'|'tablet'|'desktop'), refreshIframe(), toggleFullscreenPreview(), openQRPanel()
- applyTypo('industrial'|'brutalista'|...), toggleFontPicker('display'|'body'), filterFontPicker('display',val), loadMoreFonts('display'), applyCustomFont('display')
- addLicRow(), loadDefaultLics(), addDefLicRow(), saveDefLics(), addLinkRow(), saveLinks(), addTestiRow(), saveTestis()
- addFE(), togglePFields()
- autoSave() en onchange/oninput de sliders

### 6. Scripts en el <head> (NO cambiar):
- Firebase SDK 9.23 compat desde gstatic CDN
- Google Fonts: Syne, DM Mono, Inter
- Font Awesome 6.5.1

---

## DISEÑO NUEVO — REFERENCIAS

### Paleta fija:
```css
--bg:      #0d0d0f    /* fondo base */
--surface: #141417    /* paneles y sidebar */
--card:    #1c1c21    /* cards y secciones */
--border:  #2a2a33    /* bordes sutiles */
--border2: #3a3a47    /* bordes hover/activos */
--acc:     #dc2626    /* rojo — ÚNICO acento */
--acc2:    #b91c1c    /* rojo hover */
--tx:      #f0f0f2    /* texto principal */
--mu:      #8888a0    /* muted */
--hi:      #c0c0d0    /* hint */
```

### Tipografía:
- Títulos: Syne 700–800
- UI/labels/datos: Inter 400–600
- Código/valores: DM Mono 400
- Escala: section 20px Syne 800, card 13px Inter 600 uppercase ls 0.08em, label 11px Inter 500 uppercase ls 0.06em --mu, valor 14px Inter 400 --tx

### Referentes visuales:
- **Spotify**: Sidebar oscura, hover sutil, fondo #121212
- **YouTube Music / Tidal**: Rojo como único acento, espacio vertical, headers grandes
- **BeatStars**: Tabla beats con thumbnail, stats inline, badges estado
- **wavs.com**: Grid limpio, tipografía bold, separación clara operativo/diseño
- Sin gradientes alocados, sin glassmorphism excesivo, cada píxel tiene función

---

## LAYOUT — 3 COLUMNAS

```
[Sidebar 220px/64px] [Contenido flex-1] [Preview 380px/0px]
```

### Sidebar (data-s, .si):
```
── TRABAJO ─────────────────
  🎵  Catálogo de Beats     (data-s="beats")
  📊  Estadísticas          (data-s="stats")
  ⚙️  Configuración         (data-s="settings")
  👥  Equipo                (data-s="team")

── DISEÑO ──────────────────
  🎨  Estilos globales      (data-s="global")
  ⭐  Hero & Banner         (data-s="hero")
  ▦   Layout                (data-s="layout")
  🛍️  Elementos             (data-s="elements")
  ✨  Animaciones           (data-s="animations")
  ↗   Flotantes             (data-s="floating")
  🗂️  Temas & Presets       (data-s="themes")
```
- Labels TRABAJO/DISEÑO en 9px uppercase muted
- Línea separadora entre grupos
- Item activo: barra 3px --acc izquierda + fondo rgba(220,38,38,0.08) + texto blanco
- Hover: fondo rgba(255,255,255,0.04)

### Topbar (56px):
- Izq: "DACE· Admin" Syne 800, · en --acc
- Centro: undo, redo, cmd palette (Ctrl+K) — ghost buttons
- Der: sdot, Guardar (--acc filled), export, import, toggle tema, inspector, logout

---

## SECCIONES — ESTRUCTURA

### BEATS (data-s="beats", class="section"):
- Header: título "Catálogo de Beats" + chips stats + botón "＋ Nuevo beat"
- Buscador: beat-search-input (44px, lupa, counter)
- Lista: beat-list — filas tipo tabla con thumbnail, nombre, BPM, key, badge estado, acciones hover
- Editor: sec-add con tabs data-et: info, lics, media, platforms, extras
  - Tabs underline, activo: blanco + bottom --acc 2px

### GLOBAL (data-s="global"):
- Card "Colores base" → id="color-editor" (JS lo llena)
- Card "Efectos visuales" → sliders t-blur, t-card-op, t-grain, etc.
- Card "Tipografía" → presets typograficos, font pickers, sliders t-font-size, t-line-h, t-font-weight
- Card "Espaciado" → sliders t-pad, t-gap

### HERO (data-s="hero"):
- Preview hero-pv arriba (200px)
- Cards: Sistema Glow, Texto, Fondo hero, Degradado avanzado, Tamaño, Tag, Partículas, Banner, Emojis
- Cada card con sus IDs exactos del prompt v1

### TEMAS (data-s="themes"):
- Slots save-slots, preset-grid, custom themes, snapshots, visual diff

### LAYOUT (data-s="layout"): positions, layout-canvas, logo
### ELEMENTS (data-s="elements"): waveform, botón, opacidades, deflics-editor, links-editor, testi-editor
### ANIMATIONS (data-s="animations"): anim-controls (JS lo llena)
### FLOATING (data-s="floating"): floating-preview + floating-editor
### SETTINGS (data-s="settings"): R2, utilidades, sitio, divider, historial, export/import
### TEAM (data-s="team"): whitelist-list + wl-new-email
### STATS (data-s="stats"): 4 stat cards + charts

---

## PANEL DE PREVIEW (derecha):
- Barra: label "Vista previa" + viewport buttons (vp-btn .on) + preview-url + refresh + fullscreen + QR
- Iframe: preview-frame (.mobile/.tablet/.desktop)

## MODALES/OVERLAYS (IDs preservados):
cmd-overlay, kbd-overlay, qr-overlay, batch-img-overlay, login-overlay
Toast: toast, saving-ind

---

## DEPLOY FINAL
1. Commit: `feat: admin UI rewrite — Spotify/BeatStars/Tidal inspired dark design`
2. Borrar: `store-app.js` (raíz, 58KB), `dacewav-v5.4-fix.tar`, `dacewav-v5.4-fix.tar.gz`
3. Vaciar: `admin-styles.css` → `/* Estilos movidos a admin.html */`
4. Commit: `chore: remove unused files, clear admin-styles.css`
5. Push a main

## TOKEN GITHUB
El usuario proporciona token en el chat para push.

## ARCHIVO DE REFERENCIAS
`admin.html.bak` — copia del admin.html actual (872 líneas) para referencia de estructura
