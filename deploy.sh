#!/usr/bin/env bash
set -euo pipefail

echo "→ Pulling latest changes..."
git pull

echo "→ Installing dependencies..."
pnpm install --frozen-lockfile

echo "→ Building frontend..."
cd web && pnpm build && cd ..

echo "→ Restarting API..."
sudo systemctl restart 1337play

echo "→ Waiting for server to come up..."
sleep 2
curl -sf http://localhost:3001/api/health | grep -q '"ok":true' \
  && echo "✓ Deployed $(git rev-parse --short HEAD)" \
  || (echo "✗ Health check failed — check logs: journalctl -u 1337play -n 50" && exit 1)
