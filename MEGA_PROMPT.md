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
| Base de datos | Firebase Realtime Database — SDK modular v9 ESM |
| Auth | Firebase Auth (email/password, solo mi cuenta) |
| Audio | Cloudflare R2 → public URL: cdn.dacewav.store |
| Código | Vanilla HTML + CSS + JS ESM (sin bundler, sin build step) |

---

## REGLAS DE ARQUITECTURA — OBLIGATORIAS

1. **Sin build step.** No esbuild, webpack, vite. Solo `<script type="module">`.
2. **Firebase modular.** `import { ... } from 'https://www.gstatic.com/firebasejs/11.2.0/...'`
3. **Sin NPM en producción.** Librerías solo via CDN si es necesario.
4. **Archivos ≤ 150 líneas.** Si crece más, dividir el módulo.
5. **Sin `window.fn = fn`.** Solo `addEventListener` desde JS. Sin `onclick=""` en HTML.
6. **CSS con variables.** Todo desde `css/shared.css`. Sin hardcodear colores.
7. **Sin alert() / confirm() / prompt().** Feedback siempre inline en el UI.
8. **Un módulo = una responsabilidad.** catalog.js solo renderiza. player.js solo audio.

---

## ESTRUCTURA DE ARCHIVOS

```
dacewav/catalog/
├── index.html              # Tienda pública
├── admin.html              # Admin (requiere auth)
├── 404.html
├── _headers                # Cloudflare security headers
├── _redirects              # /admin → /admin.html
├── css/
│   ├── shared.css          # CSS variables globales (design tokens)
│   ├── store.css
│   └── admin.css
├── js/
│   ├── firebase.js         # export { db, auth }
│   ├── store/
│   │   ├── main.js         # Entry point: carga tema, inicia módulos
│   │   ├── catalog.js      # Grid de beats + filtros
│   │   ├── player.js       # Audio player persistente
│   │   └── licenses.js     # Modal de licencias
│   └── admin/
│       ├── main.js         # Auth guard + navegación
│       ├── beats.js        # CRUD beats + subida R2
│       ├── theme.js        # Editor de tema visual
│       └── settings.js     # Config sitio + órdenes
└── workers/
    └── upload.js           # Cloudflare Worker → R2
```

---

## DISEÑO — IDENTIDAD VISUAL

**Concepto:** Cinematográfico oscuro. Vino tinto. Grain texture. Ambient glow. No genérico.
**Referencias:** A24 films, Frank Ocean artwork, Travis Scott Astroworld.

```css
/* CSS Variables principales — en css/shared.css */
:root {
  --color-bg:          #080808;
  --color-surface:     #111111;
  --color-surface-2:   #1A1A1A;
  --color-border:      #222222;
  --color-primary:     #6B1A2A;    /* vino tinto */
  --color-primary-glow:#8B2035;
  --color-accent:      #C44569;    /* rosa oscuro */
  --color-accent-soft: #E8637B;
  --color-text:        #F0EAE2;    /* blanco cálido */
  --color-text-muted:  #8A8078;
  --color-text-dim:    #554E47;
  --glow-primary:      0 0 40px rgba(107,26,42,0.6);
  --grain-opacity:     0.035;
  --font-display:      'Bebas Neue', sans-serif;
  --font-body:         'DM Sans', sans-serif;
  --font-mono:         'JetBrains Mono', monospace;
  --player-height:     72px;
  --z-player:          100;
  --z-modal:           200;
}
```

**Google Fonts a usar:**
```html
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

---

## FIREBASE — Schema de datos

```json
{
  "beats": {
    "BEAT_ID": {
      "title": "string",
      "slug": "string",
      "bpm": "number",
      "key": "string",
      "genre": "Trap|R&B|Drill|Reggaeton|Afro|Sample",
      "mood": "Dark|Chill|Hype|Romantic|Aggressive",
      "tags": ["string"],
      "audioUrl": "string (R2 URL)",
      "coverUrl": "string",
      "duration": "number (segundos)",
      "plays": "number",
      "featured": "boolean",
      "status": "active|draft|sold",
      "exclusive": "boolean",
      "createdAt": "number (timestamp)",
      "updatedAt": "number (timestamp)",
      "licenses": {
        "mp3":       { "mxn": 299,  "usd": 15  },
        "wav":       { "mxn": 499,  "usd": 25  },
        "premium":   { "mxn": 999,  "usd": 50  },
        "ilimitada": { "mxn": 1999, "usd": 100 },
        "exclusiva": { "mxn": 4999, "usd": 250 }
      }
    }
  },
  "config": {
    "site": {
      "title": "DACE Beats",
      "heroText": "string",
      "instagramUrl": "string",
      "beatstarsUrl": "string",
      "contactEmail": "string"
    },
    "theme": { "...variables CSS..." },
    "licenses": {
      "mp3": { "name": "MP3 Básica", "features": ["..."], "mxn": 299, "usd": 15 }
    }
  },
  "orders": {
    "ORDER_ID": {
      "beatId": "string", "licenseType": "string",
      "price": "number", "currency": "MXN|USD",
      "buyerEmail": "string", "createdAt": "number"
    }
  }
}
```

**Firebase Security Rules:**
```json
{
  "rules": {
    "beats":  { ".read": true, ".write": "auth != null && auth.token.email === 'TU_EMAIL'" },
    "config": { ".read": true, ".write": "auth != null && auth.token.email === 'TU_EMAIL'" },
    "orders": { ".read": "auth != null && auth.token.email === 'TU_EMAIL'", ".write": true }
  }
}
```

---

## PLAN DE FASES — Estado actual

Marca con ✅ las fases que ya terminaron al inicio de sesión nueva.

```
[ ] FASE 1 — Infraestructura base
      firebase.js, _headers, _redirects, workers/upload.js
      CHECKPOINT 1 → zip v1.0

[ ] FASE 2 — Design system
      css/shared.css, css/store.css, css/admin.css
      Estructura HTML de index.html y admin.html
      CHECKPOINT 2 → zip v2.0

[ ] FASE 3 — Tienda: datos + grid de beats
      js/store/main.js, js/store/catalog.js
      CHECKPOINT 3 → zip v3.0

[ ] FASE 4 — Tienda: player + modal de licencias
      js/store/player.js, js/store/licenses.js
      CHECKPOINT 4 → zip v4.0

[ ] FASE 5 — Admin: auth + estructura
      js/admin/main.js, admin.html completo
      CHECKPOINT 5 → zip v5.0

[ ] FASE 6 — Admin: CRUD de beats
      js/admin/beats.js
      CHECKPOINT 6 → zip v6.0

[ ] FASE 7 — Admin: editor de tema
      js/admin/theme.js
      CHECKPOINT 7 → zip v7.0

[ ] FASE 8 — Tienda: filtros + animaciones
      js/store/catalog.js (añadir filtros), css/store.css (polish)
      CHECKPOINT 8 → zip v8.0

[ ] FASE 9 — Admin: config + órdenes
      js/admin/settings.js
      CHECKPOINT 9 → zip v9.0

[ ] FASE 10 — QA + deploy
      Bug fixes, checklist completo, Cloudflare Pages live
      CHECKPOINT 10 → zip v10.0 (versión final)
```

**Al inicio de cada sesión nueva:** dime en qué fase quedamos y qué zip fue el último.

---

## REGLAS FINALES PARA LA IA

```
SIEMPRE:
✓ Leer este contexto completo antes de escribir código
✓ Declarar al inicio: "Scope: [archivos que voy a tocar]"
✓ Generar reporte + zip después de cada cambio importante
✓ Parar y esperar confirmación en cada checkpoint
✓ Decir qué se rompió ANTES de tocarlo

NUNCA:
✗ Cambiar el stack sin autorización
✗ Tocar archivos fuera del scope declarado
✗ Reescribir un archivo completo para cambiar 3 líneas
✗ Usar alert(), confirm(), prompt()
✗ Hardcodear colores (siempre CSS variables)
✗ Usar window.fn = fn (siempre addEventListener)
✗ Continuar después de un checkpoint sin confirmación explícita
```

---
*Versión de este contexto: 2.0 | Proyecto: dacewav.store | Stack: Cloudflare + Firebase + R2*
