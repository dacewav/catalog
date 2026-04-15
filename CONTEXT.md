# CONTEXT.md — Session Startup Protocol

## Al abrir sesión, leer en este orden:

1. `MEMORY.md` — estado del proyecto, pendientes, lecciones
2. `memory/[ayer].md` — última sesión registrada
3. `memory/[hoy].md` — si ya existe
4. `REFACTOR-PLAN.md` — buscar primer bloque sin ✅ o marcado SIGUIENTE

## Verificar estado del repo:

```bash
git status
git log --oneline -5
node build.js 2>&1 | tail -5
```

## NO hacer:
- No preguntar "¿en qué puedo ayudar?"
- No repetir contexto que ya está en MEMORY.md
- Ir directo al último pendiente o lo que el usuario pida

## Después de cada bloque de trabajo:
- [ ] `node build.js` → sin errores
- [ ] Commit descriptivo
- [ ] Push a main
- [ ] Actualizar `memory/YYYY-MM-DD.md`
- [ ] Si resolviste un bug → mover a "Bugs resueltos" en MEMORY.md
