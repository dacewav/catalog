#!/bin/bash
# ════════════════════════════════════════════════════════════
# DACEWAV.STORE — Deploy Script
# Ejecutar desde la raíz del repo: bash deploy.sh
# ════════════════════════════════════════════════════════════
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 DACEWAV — Deploy completo"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── 1. Cloudflare Worker (R2 Upload) ──
echo ""
echo "📦 [1/3] Deployando Cloudflare Worker..."
wrangler deploy
echo "✅ Worker deployado"

# ── 2. Firebase Rules ──
echo ""
echo "📦 [2/3] Subiendo reglas Firebase..."
echo "   ⚠️  Necesitas firebase CLI: npm install -g firebase-tools"
echo "   ⚠️  Y login: firebase login"
if command -v firebase &> /dev/null; then
  firebase deploy --only database:dacewav-store-3b0f5 --project dacewav-store-3b0f5
  echo "✅ Reglas Firebase subidas"
else
  echo "⚠️  firebase CLI no encontrado. Sube manualmente:"
  echo "   → Firebase Console → Realtime Database → Rules"
  echo "   → Pega el contenido de firebase-rules-v5.3.json"
fi

# ── 3. Resumen ──
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deploy listo"
echo ""
echo "📋 Tareas manuales pendientes:"
echo "   1. Firebase Console → Auth → Google → Enable"
echo "   2. Configurar CDN cdn.dacewav.store en R2"
echo "   3. Cloudflare Pages: auto-deploy desde main ✅"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
