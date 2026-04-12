# MEMORY.md

## Lecciones aprendidas (hard way)

### FIXES DE UI: NUNCA CERRAR SIN VERIFICAR EN NAVEGADOR
- No basta con "la sintaxis está bien" — el fix tiene que funcionar en el browser real
- Siempre mapear TODOS los callers de una función antes de reescribirla
- Siempre mapear TODOS los elementos DOM relacionados (puede haber duplicados en tabs distintos)
- Logging en consola > asumir que funciona
- Probar el flujo completo end-to-end antes de reportar "listo"

### PATRÓN DE ERRORES RECURRENTE
- Hacer fix rápido → no probar → decir "listo" → usuario reporta que no funciona → frustración
- Evitar: tomar 2 min extra para verificar vs 10 min de correcciones

### PROYECTO: DACEWAV Admin
- Stack: Firebase + R2 + vanilla JS (ES modules)
- Editor de beats tiene tabs: General, Estilo, Preview, Licencias, Media, Plataformas, Extras
- Imagen del beat: campo `f-img` (URL), preview en `#img-prev` (tab media) Y `#pv-img-preview` (tab extras)
- Galería global: `catalog/src/admin/gallery.js` — guarda en Firebase `imageGallery/`
- `saveUrlToGallery()` dedup por URL
- `uploadBeatImg()` sube a R2, setea `f-img`, llama `prevImg()`
- `prevImg()` es la función central de render de imagen — la reescribí, posiblemente rompí algo
