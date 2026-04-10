#!/bin/bash
# Push DACEWAV deploy files to GitHub
# Usage: ./push.sh
# Requires: git configured with push access to dacewav/catalog

set -e

REPO_DIR="${1:-$HOME/dacewav-catalog}"
DEPLOY_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "📁 Deploy dir: $DEPLOY_DIR"
echo "📁 Repo dir: $REPO_DIR"

if [ ! -d "$REPO_DIR/.git" ]; then
  echo "❌ $REPO_DIR no es un repo git. Clona primero:"
  echo "   git clone git@github.com:dacewav/catalog.git $REPO_DIR"
  exit 1
fi

echo "📋 Copiando archivos..."
cp "$DEPLOY_DIR/admin.html" "$REPO_DIR/admin.html"
cp "$DEPLOY_DIR/admin-app.js" "$REPO_DIR/dist/admin-app.js"
cp "$DEPLOY_DIR/admin-styles.css" "$REPO_DIR/dist/admin-styles.css"
cp "$DEPLOY_DIR/index.html" "$REPO_DIR/index.html"
cp "$DEPLOY_DIR/store-app.js" "$REPO_DIR/dist/store-app.js"
cp "$DEPLOY_DIR/store-styles.css" "$REPO_DIR/store-styles.css"
cp "$DEPLOY_DIR/_redirects" "$REPO_DIR/_redirects"
cp "$DEPLOY_DIR/_headers" "$REPO_DIR/_headers"

echo "📦 Commit + push..."
cd "$REPO_DIR"
git add -A
git commit -m "deploy: update from local $(date +%Y-%m-%d)" || echo "Nada que commitear"
git push origin main

echo "✅ Listo. Cloudflare Pages deploy ~1-2 min."
