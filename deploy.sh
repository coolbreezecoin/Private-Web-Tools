#!/usr/bin/env bash
#
# Server-side deploy script for tool.nobrisk.com (宝塔 / Nginx static hosting).
# Triggered by the 宝塔 Webhook plugin on each GitHub push to `main`:
# hard-resets to origin/main, installs deps, and rebuilds the static site.
#
# 宝塔 Webhook command:  bash /www/wwwroot/tool.nobrisk.com/deploy.sh
# Site 运行目录 must point to /dist (only the build output is served).
#
set -euo pipefail

APP_DIR="/www/wwwroot/tool.nobrisk.com"
SITE_URL="https://tool.nobrisk.com"
BRANCH="main"

# --- Ensure a supported Node (>=22, required by Astro) is on PATH ---
# The webhook runs in a non-login shell that may default to system Node 18.
# 宝塔 Node 版本管理器 installs versions under /www/server/nodejs/v<version>/bin;
# pick the highest installed major >= 22 so the build does not fall back to 18.
pick_node_bin() {
  local best="" best_major=0 dir v major
  for dir in /www/server/nodejs/v*/bin; do
    [ -x "$dir/node" ] || continue
    v="$("$dir/node" -v 2>/dev/null | sed 's/^v//')" || continue
    major="${v%%.*}"
    if [ "$major" -ge 22 ] && [ "$major" -gt "$best_major" ]; then
      best_major="$major"
      best="$dir"
    fi
  done
  printf '%s' "$best"
}

NODE_BIN="$(pick_node_bin)"
[ -n "$NODE_BIN" ] && export PATH="$NODE_BIN:$PATH"

echo "Using node $(node -v 2>/dev/null || echo '?') at $(command -v node || echo 'not found')"

cd "$APP_DIR"

# --- Sync working tree to the latest remote main ---
git fetch --all --prune
git reset --hard "origin/$BRANCH"

# --- Install dependencies and rebuild the static site ---
# SITE_URL is required, otherwise canonical/sitemap/og:image fall back to example.com.
npm ci
SITE_URL="$SITE_URL" npm run build

echo "Deployed $(git rev-parse --short HEAD) at $(date -Is)"
