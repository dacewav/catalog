# ════════════════════════════════════════════════════════════
# DACEWAV.STORE — MEGA CONTEXTO
# Pega esto COMPLETO al inicio de cada sesión nueva.
# ════════════════════════════════════════════════════════════

## QUIÉN SOY
Soy DACE, productor de beats, Puebla México. Marca: DACEWAV.
Repo: github.com/dacewav/catalog | Dominio: dacewav.store
Hablo español casual. Respuestas directas. Código que funcione.

---

## ⚠️ REGLAS DE SESIÓN — LEE ESTO PRIMERO

Esta sesión tiene tiempo limitado (~1 hora). Por eso:

### Después de CADA cambio importante debes:

**1. GENERAR UN REPORTE** con este formato exacto:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 CHECKPOINT v[X.Y] — [nombre corto]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ COMPLETADO:
  - [qué se hizo]
  - [qué se hizo]

🔄 EN PROGRESO:
  - [qué quedó a medias, si aplica]

📋 PENDIENTE:
  - [qué falta de esta fase]
  - [qué falta de esta fase]

⚠️ PROBLEMAS ENCONTRADOS:
  - [bugs conocidos o limitaciones]

🗂️ ARCHIVOS MODIFICADOS:
  - [archivo] — [qué cambió]

💾 VERSIÓN EMPAQUETADA: v[X.Y]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**2. EMPAQUETAR LOS ARCHIVOS** — Después de generar el reporte, crea un zip con todos los archivos actuales del proyecto usando esta nomenclatura de versión:

| Cambio | Versión | Ejemplo |
|--------|---------|---------|
| Fase nueva completada | X.0 | 1.0, 2.0, 3.0 |
| Feature importante dentro de una fase | X.Y | 1.1, 1.2, 2.1 |
| Bugfix o ajuste menor | X.Y.Z | 1.1.1 |

**Comando para empaquetar** (ejecutar en terminal/bash del proyecto):
```bash
# Reemplazar X.Y con la versión actual
zip -r dacewav-vX.Y.zip . \
  --exclude "*.git*" \
  --exclude "node_modules/*" \
  --exclude "*.tar" \
  --exclude "*.tar.gz" \
  --exclude "dacewav-v*.zip"
```

Cuando el zip esté listo, dime: **"✅ Zip listo: dacewav-vX.Y.zip — puedes descargarlo"**

**3. PARAR y esperar mi confirmación** antes de continuar a lo siguiente.

---

## STACK TECNOLÓGICO — NO cambiar sin mi autorización

| Capa | Tecnología |
|------|-----------|
| Hosting | Cloudflare Pages (deploy automático desde GitHub main) |
| Build | esbuild (npm run build → dist/) |
| Base de datos | Firebase Realtime Database — SDK compat (firebase.database()) |
| Auth | Firebase Auth (Google login, whitelist de emails) |
| Audio | Cloudflare R2 → public URL: cdn.dacewav.store |
| Tests | Vitest (npm test) |
| Código | Vanilla HTML + CSS + JS ESM |

**Nota:** El proyecto usa esbuild para bundlear `src/` → `dist/`. El store carga `dist/store-app.js` y el admin carga scripts inline + `dist/admin-app.js` (stub con utilidades compartidas).

---

## ESTRUCTURA DE ARCHIVOS ACTUAL

```
dacewav/catalog/
├── index.html                  # Tienda pública (carga dist/store-app.js)
├── admin.html                  # Admin (scripts inline + dist/admin-app.js)
├── store-styles.css            # Estilos de la tienda
├── admin-styles.css            # Estilos del admin
├── store-app.js                # Bundle legacy (backup)
│
├── src/                        # Código fuente modularizado
│   ├── main.js                 # Entry point tienda
│   ├── config.js               # Firebase config, versión, constantes
│   ├── state.js                # Estado global centralizado
│   ├── utils.js                # Funciones puras (hexRgba, formatTime, etc.)
│   ├── error-handler.js        # Manejo centralizado de errores
│   ├── wishlist.js             # Sistema de favoritos
│   ├── waveform.js             # Generación de formas de onda (cache limitado)
│   ├── theme.js                # Tema light/dark, applyTheme()
│   ├── effects.js              # Cursor glow, parallax, particles, EQ
│   ├── player.js               # Reproductor de audio (AP object)
│   ├── cards.js                # Beat cards + modal de licencias
│   ├── filters.js              # Búsqueda, filtros, tag cloud
│   ├── settings.js             # Settings, custom links, floating
│   ├── analytics.js            # Tracking de eventos (batched)
│   ├── hash-router.js          # Deep links #/beat/<id>
│   └── admin/                  # Admin modules
│       ├── nav.js              # Navegación + showEt (tabs del editor)
│       ├── core.js             # Undo/redo, preview iframe, theme collect/load
│       ├── beats.js            # CRUD beats + drag & drop
│       ├── features.js         # Links, testimonios, licencias base
│       ├── firebase-init.js    # Auth + carga de datos Firebase
│       ├── helpers.js          # DOM helpers, toast, confirmInline/promptInline
│       ├── colors.js           # Editor de colores
│       ├── config.js           # Config admin
│       ├── state.js            # Estado admin
│       ├── fonts.js            # Selector de fuentes Google
│       ├── r2.js               # Cloudflare R2 upload
│       ├── qr.js               # QR preview
│       ├── resize.js           # Resize handler
│       ├── cmd-palette.js      # Command palette (Ctrl+K)
│       └── admin-main.js       # Entry point admin (stub)
│
├── dist/                       # Build output (gitignored)
│   ├── store-app.js            # Bundle tienda (~49KB)
│   ├── store-app.js.map
│   ├── admin-app.js            # Bundle admin (~101KB)
│   ├── admin-app.js.map
│   ├── store-styles.css
│   └── admin-styles.css
│
├── tests/                      # Tests unitarios (Vitest)
│   ├── utils.test.js
│   ├── error-handler.test.js
│   ├── player.test.js
│   ├── cards.test.js
│   ├── filters.test.js
│   ├── admin-beats.test.js
│   └── admin-core.test.js
│
├── firebase-rules-v5.2.json    # Reglas de seguridad Firebase
├── package.json                # Dependencias y scripts
├── build.js                    # Script de build (esbuild)
└── vitest.config.js
```

**Scripts disponibles:**
```bash
npm run build       # Build minificado para producción
npm run build:watch # Watch mode para desarrollo
npm run build:dev   # Build sin minificar (debugging)
npm test            # Correr tests (Vitest)
```

---

## REGLAS DE ARQUITECTURA — OBLIGATORIAS

1. **esbuild para bundlear.** `npm run build` genera `dist/`. No tocar dist/ a mano.
2. **Firebase compat SDK.** `firebase.database()` — NO modular en admin.
3. **Archivos ≤ 150 líneas.** Si crece más, dividir el módulo.
4. **Preferir addEventListener.** Legacy tiene `onclick=""` en HTML (~40 handlers). Nuevos módulos usar addEventListener.
5. **CSS con variables.** Todo desde `store-styles.css` / `admin-styles.css`. Sin hardcodear colores.
6. **Sin alert() / confirm() / prompt().** Usar `confirmInline()` / `promptInline()` de `src/admin/helpers.js`.
7. **Un módulo = una responsabilidad.** catalog.js solo renderiza. player.js solo audio.

---

## FIREBASE — Schema de datos (ACTUAL)

```json
{
  "beats": {
    "BEAT_ID": {
      "id": "string",
      "name": "string",
      "genre": "string",
      "genreCustom": "string",
      "bpm": "number",
      "key": "string",
      "description": "string",
      "tags": ["string"],
      "imageUrl": "string (R2 URL)",
      "audioUrl": "string (R2 URL)",
      "previewUrl": "string (R2 URL)",
      "spotify": "string",
      "youtube": "string",
      "soundcloud": "string",
      "date": "string (YYYY-MM-DD)",
      "order": "number",
      "plays": "number",
      "featured": "boolean",
      "exclusive": "boolean",
      "active": "boolean",
      "available": "boolean",
      "licenses": [
        {
          "name": "string",
          "priceMXN": "number",
          "priceUSD": "number",
          "description": "string"
        }
      ]
    }
  },
  "settings": {
    "heroTitle": "string",
    "heroSubtitle": "string",
    "bannerText": "string",
    "bannerActive": "boolean",
    "whatsappNumber": "string",
    "instagramUrl": "string",
    "beatstarsUrl": "string",
    "contactEmail": "string",
    "r2AccountId": "string",
    "r2AccessKeyId": "string",
    "r2Bucket": "string",
    "r2PublicUrl": "string",
    "testimonials": [{ "name": "string", "role": "string", "text": "string" }]
  },
  "theme": {
    "bg": "string",
    "surface": "string",
    "accent": "string",
    "glowColor": "string",
    "fontDisplay": "string",
    "fontBody": "string",
    "grainOpacity": "number",
    "particlesOn": "boolean",
    "particlesType": "circle|square|star|text|image",
    "particlesCount": "number",
    "... más variables de tema"
  },
  "defaultLicenses": [{ "name": "string", "priceMXN": "number", "priceUSD": "number", "description": "string" }],
  "customLinks": { "KEY": { "label": "string", "url": "string", "location": "header|hero|footer" } },
  "floatingElements": { "..." },
  "customEmojis": ["string"],
  "adminWhitelist": { "email@domain.com": true }
}
```

**Firebase Security Rules** (firebase-rules-v5.2.json):
```json
{
  "rules": {
    "beats":  { ".read": true, ".write": "auth != null" },
    "settings": { ".read": true, ".write": "auth != null" },
    "theme": { ".read": true, ".write": "auth != null" },
    "defaultLicenses": { ".read": true, ".write": "auth != null" },
    "customLinks": { ".read": true, ".write": "auth != null" },
    "floatingElements": { ".read": true, ".write": "auth != null" },
    "adminWhitelist": { ".read": "auth != null", ".write": "auth != null" },
    "analytics": { ".read": "auth != null", ".write": true }
  }
}
```

---

## DISEÑO — IDENTIDAD VISUAL

**Concepto:** Cinematográfico oscuro. Vino tinto. Grain texture. Ambient glow. No genérico.
**Referencias:** A24 films, Frank Ocean artwork, Travis Scott Astroworld.

Variables de tema se manejan desde el admin (Firebase `theme` node) y se aplican via CSS custom properties en runtime.

---

## PLAN DE FASES — Estado actual v5.2

```
✅ FASE 1 — Infraestructura base
✅ FASE 2 — Design system + HTML
✅ FASE 3 — Tienda: datos + grid de beats
✅ FASE 4 — Tienda: player + modal de licencias
✅ FASE 5 — Admin: auth + estructura
✅ FASE 6 — Admin: CRUD de beats
✅ FASE 7 — Admin: editor de tema
✅ FASE 8 — Tienda: filtros + animaciones
✅ FASE 9 — Admin: config + órdenes

[ ] FASE 10 — QA + deploy final
      - Verificar Cloudflare Pages deploy
      - Subir reglas Firebase (firebase-rules-v5.2.json)
      - Activar Google Auth en Firebase Console
      - Desplegar Cloudflare Worker (R2 upload)
      - Configurar CDN cdn.dacewav.store
      - Rotar token de GitHub (quedó expuesto)
```

---

## FEATURES QUE YA FUNCIONAN

- ✅ Grid de beats con filtros avanzados (genre, key, mood, search, sort, tag cloud)
- ✅ Wishlist (localStorage, panel lateral, WhatsApp)
- ✅ Player persistente con skip ±10s, EQ visualizer
- ✅ Modal de licencias con OG tags, links de plataforma
- ✅ Featured section, banner configurable
- ✅ Admin: CRUD beats, drag & drop, inline edit, batch add
- ✅ Admin: Editor de tema masivo (glow, fonts, particles, gradients, presets)
- ✅ Admin: Command palette, keyboard shortcuts, QR preview
- ✅ Scroll-aware nav, cursor glow, parallax hero, card tilt 3D
- ✅ Hash router para deep links
- ✅ Light mode toggle
- ✅ Analytics tracking (batched, rate-limited)
- ✅ Tests unitarios (95 tests pasando)

---

## BUGS CORREGIDOS (v5.2 → v5.3)

- ✅ showEt tabs — FIX DEFINITIVO: eliminado de Object.assign(window) de features.js
- ✅ Memory leak observeStagger — disconnect prev observer
- ✅ Memory leak initParticles — remove prev resize listener
- ✅ Scroll listeners duplicados — initAllEffects guard
- ✅ confirm()/prompt() nativos → confirmInline()/promptInline()
- ✅ formatTime duplicada — unificada en helpers.js fmt()
- ✅ Waveform cache sin límite — max 50 entries + LRU pruning
- ✅ Analytics sin rate limiting — batched writes 2s debounce
- ✅ EQ no se detiene en error — error handler agrega stopEQ
- ✅ postMessage sin origin validation
- ✅ Light mode incompleto — estilos para wishlist, cards, filtros

---

## BUGS PENDIENTES

### Prioridad Media
- Light mode incompleto — falta estilo para modal, wishlist panel, player bar, toast

### Prioridad Baja
- Firebase Compat vs Modular — usa firebase.database() (compat) en vez de modular ESM
- onclick="" en HTML — ~40 handlers inline, debería migrar a addEventListener
- renderAll() re-renderiza innerHTML completo — rompe event listeners del 3D tilt

---

## REGLAS FINALES PARA LA IA

```
SIEMPRE:
✓ Leer este contexto completo antes de escribir código
✓ Declarar al inicio: "Scope: [archivos que voy a tocar]"
✓ Hacer npm run build después de cambios en src/
✓ Hacer npm test antes de reportar que algo funciona
✓ Generar reporte + zip después de cada cambio importante
✓ Parar y esperar confirmación en cada checkpoint
✓ Push a GitHub después de cada commit exitoso

NUNCA:
✗ Cambiar el stack sin autorización
✗ Tocar archivos fuera del scope declarado
✗ Reescribir un archivo completo para cambiar 3 líneas
✗ Usar alert(), confirm(), prompt() nativos
✗ Hardcodear colores (siempre CSS variables)
✗ Hacer push sin que build + tests pasen
✗ Continuar después de un checkpoint sin confirmación explícita
```

---

*Versión de este contexto: 5.3 | Proyecto: dacewav.store | Stack: Cloudflare + Firebase + R2 + esbuild*
