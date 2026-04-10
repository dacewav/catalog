# Prompt v2 — Rediseño admin.html (con referencias de diseño)

## PROYECTO: dacewav/catalog — Reescritura del admin.html con diseño inspirado en Spotify / BeatStars / Tidal / YouTube Music

Repo: `https://github.com/dacewav/catalog`
Al terminar, **haz push de todo al repo** con un commit claro. Borra también cualquier archivo que ya no sirva (`store-app.js` original de 58KB en raíz, `dacewav-v5.4-fix.tar`, `dacewav-v5.4-fix.tar.gz`, y vacía `admin-styles.css` ya que el CSS va embebido en el nuevo `admin.html`).

Stack: Firebase compat SDK 9.23, esbuild, GitHub Pages / Cloudflare Pages.
El admin compila con `npm run build` → `dist/admin-app.js` (100KB). **Ese archivo no se toca.**

---

## FILOSOFÍA DE DISEÑO — referencias exactas

- **Spotify**: Sidebar oscura con íconos + texto, hover states con highlight sutil, tipografía limpia en jerarquía clara, fondo `#121212`, cards con artwork cuadrado
- **YouTube Music / Tidal**: Acento rojo intenso como único color de acción, secciones con mucho espacio vertical, headers grandes y respirados
- **BeatStars (producer dashboard)**: Tabla de beats con thumbnail, stats inline por beat, búsqueda prominente, badge de estado (activo/exclusivo/inactivo)
- **wavs.com**: Grid limpio, tipografía sin serifa bold, separación clara entre contenido operativo y configuración visual
- **Filosofía general**: Todo grande, estructurado, sin elementos decorativos innecesarios. Cada píxel tiene función. Sin gradientes alocados, sin glassmorphism excesivo. El rojo es el único acento — úsalo con precisión quirúrgica.

## Paleta fija:
```
--bg:      #0d0d0f    /* fondo base, casi negro */
--surface: #141417    /* paneles y sidebar */
--card:    #1c1c21    /* cards y secciones */
--border:  #2a2a33    /* bordes sutiles */
--border2: #3a3a47    /* bordes hover/activos */
--acc:     #dc2626    /* rojo DACE — el ÚNICO acento */
--acc2:    #b91c1c    /* rojo oscuro para hover */
--tx:      #f0f0f2    /* texto principal */
--mu:      #8888a0    /* texto secundario/muted */
--hi:      #c0c0d0    /* texto hint */
```

## Tipografía:
- Display/títulos: Syne 700–800 (ya cargada)
- UI/labels/datos: Inter 400–600 (ya cargada)
- Código/valores: DM Mono 400 (ya cargada)
- Escala: section title 20px Syne 800, card title 13px Inter 600 uppercase letter-spacing 0.08em, label 11px Inter 500 uppercase letter-spacing 0.06em color `--mu`, valor 14px Inter 400 color `--tx`

---

## LAYOUT GENERAL

3 columnas fijas con CSS Grid:
```
[Sidebar 220px / 64px collapsed] [Contenido flex-1] [Preview 380px / 0px collapsed]
```
- Sidebar y preview colapsables con botón toggle + transición suave
- Resize handle entre contenido y preview (el `id="resize-handle"` existente)
- Topbar fijo arriba, 56px de alto, `z-index` sobre todo

## Sidebar — separación visual TRABAJO / DISEÑO:

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

Cada grupo tiene un label tipo `TRABAJO` / `DISEÑO` en 9px uppercase muted, y una línea separadora.
Item activo: barra de 3px rojo a la izquierda + fondo `rgba(220,38,38,0.08)` + texto blanco.
Item hover: fondo `rgba(255,255,255,0.04)`.

## Topbar:
- Izquierda: logo "DACE· Admin" en Syne 800 con el `·` en `--acc`
- Centro: undo, redo, command palette (Ctrl+K) — botones fantasma con ícono
- Derecha: dot de estado `id="sdot"`, botón Guardar (rojo filled), export, import, toggle tema, inspector, logout

---

## SECCIÓN BEATS — diseño tipo BeatStars producer view

Header de sección con:
- Título grande "Catálogo de Beats"
- 3 chips de stats: `{n} totales · {n} activos · {n} exclusivos`
- Botón "＋ Nuevo beat" rojo filled alineado a la derecha

Buscador (`id="beat-search-input"`):
- Ancho completo, altura 44px, con ícono lupa y counter `id="beat-search-count"` dentro

Lista de beats (`id="beat-list"`):
- Cada beat como fila horizontal tipo tabla: `[artwork 48x48] [nombre + género pill] [BPM] [Key] [estado badge] [acciones]`
- Artwork con border-radius 6px
- Badge estado: verde=activo, rojo=exclusiva, gris=inactivo
- Acciones: ícono editar, ícono eliminar — aparecen en hover
- Filas alternas con fondo levemente diferente
- Drag handle a la izquierda para reordenar

## Editor de beat (`id="sec-add"`):
Tabs (`data-et`): Info · Licencias · Media · Plataformas · Extras
- Tabs como línea underline, no pills. Tab activo: texto blanco + borde bottom rojo 2px

---

## PANEL DE PREVIEW (derecha)

Barra superior del preview:
- Izquierda: label "Vista previa" con ícono ojo
- Centro: 3 botones viewport mobile/tablet/desktop con íconos, el activo en rojo
- Derecha: input URL `id="preview-url"`, botón cargar, refresh, fullscreen, QR

Iframe `id="preview-frame"` ocupa todo el espacio restante.

---

## RESTRICTIONS
- El archivo dist/admin-app.js NO se toca, ni src/, ni build.js
- Solo se reescribe admin.html (HTML + CSS embebido en <style>)
- admin-styles.css externo puede vaciarse
- Compatible con Firebase compat SDK
- Las fuentes de Google Fonts del <head> se quedan
- Font Awesome 6.5.1 se queda

## DEPLOY
- Commit: `feat: admin UI rewrite — Spotify/BeatStars/Tidal inspired dark design`
- Borrar: `store-app.js` (raíz), `dacewav-v5.4-fix.tar`, `dacewav-v5.4-fix.tar.gz`
- Vaciar: `admin-styles.css` → solo `/* Estilos movidos a admin.html */`
- Commit limpieza: `chore: remove unused files, clear admin-styles.css`
