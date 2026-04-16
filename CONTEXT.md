# CONTEXT.md — Session Startup Protocol

## Al abrir sesión, leer en este orden:

1. `MEMORY.md` — estado del proyecto, pendientes, lecciones
2. `memory/[ayer].md` — última sesión registrada
3. `memory/[hoy].md` — si ya existe
4. `REFACTOR-PLAN.md` — buscar primer bloque sin ✅ o marcado SIGUIENTE

## Verificar estado del repo:

```bash
date '+%H:%M' && echo "= SESSION_START (guardar este valor)"
cd /root/.openclaw/workspace/catalog-repo
git status
git log --oneline -5
node build.js 2>&1 | tail -5
```

## Token GitHub
- El usuario pasa el token por chat cada sesión
- Configurar: `git config credential.helper 'store'` + escribir en `~/.git-credentials`
- NO guardarlo en archivos del repo

## NO hacer:
- No preguntar "¿en qué puedo ayudar?"
- No repetir contexto que ya está en MEMORY.md
- Ir directo al último pendiente o lo que el usuario pida

---

## 🛑 Protocolo de cierre de sesión (OBLIGATORIO)

**Cuando queden ~5 minutos o el usuario diga "nos vemos" / "guarda":**

### 1. Actualizar memoria
```bash
# En memory/YYYY-MM-DD.md agregar:
## [hora] Qué se hizo
## Qué quedó pendiente
## Siguiente paso
```

### 2. Actualizar MEMORY.md si hubo cambios importantes
- Bugs resueltos → mover a "Bugs resueltos" con commit
- Nuevas decisiones → agregar a "Decisiones"
- Pendientes cambiaron → actualizar "Pendientes"

### 3. Build + commit + push (si hay cambios)
```bash
node build.js
git add -A
git commit -m "checkpoint: fin de sesión [fecha]"
git push origin main
```

### 4. Confirmar al usuario
- "Guardado. Último commit: [hash]. Pendientes: [lista corta]"

**NUNCA salir sin hacer este protocolo.** Si la hora se acaba abruptamente, priorizar paso 1 y 3.

### Si no guardaste y la sesión murió
No te preocupes. El cron `catalog-recovery` (cada 30 min) detecta:
- Cambios sin commitear → hace commit automático
- Commits sin push → intenta push o documenta que necesita token
- Build roto → documenta el error
- Al siguiente chat, leer `memory/[ayer].md` → ahí estará lo que el cron guardó

---

## Después de cada bloque de trabajo:
- [ ] `node build.js` → sin errores
- [ ] Commit descriptivo
- [ ] Push a main
- [ ] Actualizar `memory/YYYY-MM-DD.md`
- [ ] Si resolviste un bug → mover a "Bugs resueltos" en MEMORY.md
