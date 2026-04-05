# DACE · Catálogo Embebible

## Archivos
- `index.html` — el catálogo completo
- `beats.json` — tus beats (este es el que editas)

---

## Setup en 3 pasos

### 1. GitHub
1. Crea un repo en github.com llamado `catalog` (o el nombre que quieras)
2. Sube `index.html` y `beats.json`
3. Ve a Settings → Pages → Branch: main → Save
4. Tu catálogo vive en: `https://TUUSUARIO.github.io/catalog`

### 2. Cloudflare R2 (audio)
1. Entra a cloudflare.com → R2 → Create Bucket → nombre: `dace-beats`
2. Sube tus previews MP3 (versión sin tag completo o con tag de agua)
3. Ve a Settings del bucket → Public Access → Allow
4. Copia la URL pública, queda así: `https://TU-BUCKET.r2.dev/tu-beat.mp3`
5. Pega esa URL en el campo `audioUrl` de cada beat en `beats.json`

### 3. Configura tus datos
En `index.html` busca la sección `CONFIG` (línea ~170) y edita:
```js
const CONFIG = {
  whatsapp: '522221234567',   // tu número con código de país
  instagram: 'dace.beats',    // tu @
  tiers: [ ... ]              // precios — ya están cargados con tus 5 tiers
}
```

---

## Agregar un beat nuevo

Abre `beats.json` y agrega un objeto al array:

```json
{
  "id": "007",
  "name": "Nombre del Beat",
  "bpm": 140,
  "key": "Am",
  "genre": "Trap",
  "tags": ["Trap", "Dark"],
  "audioUrl": "https://TU-BUCKET.r2.dev/nombre-beat.mp3",
  "available": true,
  "exclusive": false,
  "description": "Descripción breve del beat para el artista."
}
```

Guarda el archivo, haz commit en GitHub → el catálogo se actualiza en segundos.

## Marcar un beat como vendido

Cambia `"available": true` a `"available": false`. El beat aparece desactivado en el catálogo.

## Beat con exclusiva libre

Cambia `"exclusive": true` para que aparezca el badge "excl. libre" y se muestre el tier Exclusiva en el modal.

---

## Embeber en otro sitio

Pega este iframe donde quieras (Linktree custom, tu web, etc.):

```html
<iframe src="https://TUUSUARIO.github.io/catalog" 
        width="100%" 
        height="700" 
        frameborder="0" 
        style="border-radius:12px">
</iframe>
```
