# 🛠️ Guía de Setup — DACEWAV.STORE v4.3

## ✅ Ya corregido (en esta sesión)

- [x] `<noscript>` agregado a `index.html`
- [x] Versiones actualizadas a v4.3 (index.html + admin.html)
- [x] `og:image` corregido → `https://cdn.dacewav.store/og-cover.jpg`
- [x] `DACE_VER` sincronizado en ambos archivos (4.3)
- [x] R2 token movido de hardcodeado → Firebase (`settings/r2Config`)
- [x] Panel de R2 en admin ahora tiene inputs editables + botón Guardar
- [x] `robots.txt` creado (bloquea `/admin.html`)
- [x] `sitemap.xml` creado
- [x] `<link rel="sitemap">` agregado al `<head>`
- [x] Rate limiting agregado al Worker (60 req/min por IP)
- [x] Worker CORS actualizado: `DELETE` agregado a `Access-Control-Allow-Methods`

---

## 🔧 PASOS MANUALES (requieren tu acción)

### 1️⃣ Aplicar Firebase Rules v4.2

**Urgencia: 🔴 ALTA**

1. Ve a [Firebase Console](https://console.firebase.google.com) → tu proyecto
2. Realtime Database → **Rules** (pestaña)
3. Pega el contenido de `firebase-rules-v4.2.json`:

```json
{
  "rules": {
    ".read": true,
    "adminWhitelist": {
      ".read": "auth != null && root.child('adminWhitelist').child(auth.token.email).exists()",
      ".write": "auth != null && (!root.child('adminWhitelist').exists() || root.child('adminWhitelist').child(auth.token.email).exists())"
    },
    "beats": {
      ".write": "auth != null && (root.child('adminWhitelist').child(auth.token.email).exists() || !root.child('adminWhitelist').exists())"
    },
    "settings": {
      ".write": "auth != null && (root.child('adminWhitelist').child(auth.token.email).exists() || !root.child('adminWhitelist').exists())"
    },
    "theme": {
      ".write": "auth != null && (root.child('adminWhitelist').child(auth.token.email).exists() || !root.child('adminWhitelist').exists())"
    },
    "defaultLicenses": {
      ".write": "auth != null && (root.child('adminWhitelist').child(auth.token.email).exists() || !root.child('adminWhitelist').exists())"
    },
    "customLinks": {
      ".write": "auth != null && (root.child('adminWhitelist').child(auth.token.email).exists() || !root.child('adminWhitelist').exists())"
    },
    "customEmojis": {
      ".write": "auth != null && (root.child('adminWhitelist').child(auth.token.email).exists() || !root.child('adminWhitelist').exists())"
    },
    "floatingElements": {
      ".write": "auth != null && (root.child('adminWhitelist').child(auth.token.email).exists() || !root.child('adminWhitelist').exists())"
    }
  }
}
```

4. Click **Publicar**

---

### 2️⃣ Configurar R2 desde el Admin Panel (ya no necesitas editar HTML)

**Urgencia: 🟡 MEDIA**

1. Abre el admin panel
2. Ve a **Ajustes** → **☁️ Cloudflare R2**
3. Pega tu **Worker URL**: `https://dacewav-upload.daceidk.workers.dev`
4. Pega tu **Upload Token**
5. Click **Guardar**
6. Click **Probar** para verificar conexión

El token se guarda en Firebase (`settings/r2Config`) — ya no está en el HTML.

---

### 3️⃣ Re-deploy el Worker con Rate Limiting

**Urgencia: 🟡 MEDIA**

El Worker (`r2-upload-worker.js`) fue actualizado con rate limiting. Necesitas re-subirlo:

1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers & Pages
2. Abre tu Worker `dacewav-upload`
3. Reemplaza todo el código con el contenido de `r2-upload-worker.js`
4. Click **Save and Deploy**

---

### 4️⃣ Purge Cache de Cloudflare

**Urgencia: 🔴 ALTA**

1. Cloudflare Dashboard → tu dominio `dacewav.store`
2. **Caching** → **Configuration**
3. **Purge Everything**
4. Confirmar

Esto asegura que los usuarios vean las últimas versiones de los archivos.

---

### 5️⃣ Subir archivos actualizados

**Urgencia: 🔴 ALTA**

Sube estos archivos actualizados a tu hosting:

```
index.html          ← noscript, og:image fix, v4.3
admin.html          ← R2 config dinámico, v4.3
r2-upload-worker.js ← rate limiting, DELETE CORS
robots.txt          ← NUEVO
sitemap.xml         ← NUEVO
```

Usando tu script:
```bash
cd /ruta/a/tus/archivos
export R2_ACCESS_KEY_ID="tu-key"
export R2_SECRET_ACCESS_KEY="tu-secret"

# Subir archivos públicos
node upload-to-r2.js index.html
node upload-to-r2.js robots.txt
node upload-to-r2.js sitemap.xml
node upload-to-r2.js admin.html
```

O sube manualmente a Cloudflare Pages / tu hosting.

---

### 6️⃣ (Opcional) Regenerar credenciales R2

**Urgencia: 🟢 BAJA**

Si el account ID `b9915d52e9ac118230931e40d46ab3ce` fue expuesto en repositorio público:

1. Cloudflare → R2 → Manage R2 API Tokens
2. Generar nuevos tokens
3. Actualizar las env vars del Worker
4. Actualizar en el Admin Panel → Ajustes → R2

---

## 📁 Archivos finales

| Archivo | Estado |
|---------|--------|
| `index.html` | ✅ Actualizado |
| `admin.html` | ✅ Actualizado |
| `admin-styles.css` | ✅ Sin cambios |
| `r2-upload-worker.js` | ✅ Actualizado |
| `upload-to-r2.js` | ✅ Sin cambios |
| `firebase-rules-v4.2.json` | ⏳ Pendiente aplicar en Console |
| `robots.txt` | ✅ Nuevo |
| `sitemap.xml` | ✅ Nuevo |
| `.r2ignore` | ✅ Sin cambios |
| `og-cover.jpg` | ✅ OK en CDN |

---

_Generado 2026-04-09 08:15 CST_
