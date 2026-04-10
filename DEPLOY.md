# Deploy Manual — dacewav/catalog

Sube estos archivos al repo `github.com/dacewav/catalog` en la branch `main`.

## Archivos

| Archivo | Destino |
|---|---|
| `admin.html` | root |
| `admin-app.js` | `dist/admin-app.js` |
| `admin-styles.css` | `dist/admin-styles.css` |
| `index.html` | root |
| `store-app.js` | `dist/store-app.js` |
| `store-styles.css` | root |
| `_redirects` | root |
| `_headers` | root |

## Pasos

1. Copiar archivos al repo local
2. `git add -A && git commit -m "update" && git push origin main`
3. Cloudflare Pages auto-deploy ~1-2 min
