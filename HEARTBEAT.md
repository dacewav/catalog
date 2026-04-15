# HEARTBEAT.md

## Tareas periódicas (cada ~2h)

### 1. Estado del repo
```bash
cd /root/.openclaw/workspace/catalog-repo
git status
git log --oneline -3
```
Si hay cambios sin commitear desde hace >1h → notificar.

### 2. Actualizar memoria
Si `memory/[ayer].md` existe y no fue procesado en MEMORY.md → consolidar.

### 3. Health check
```bash
node build.js 2>&1 | grep -i error || echo "Build OK"
```
Si el build rompe → notificar inmediatamente.

---

## No hacer si:
- Es de noche (23:00-08:00)
- Ya se revisó en los últimos 60 min
- No hay nada nuevo
