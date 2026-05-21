#!/bin/sh
set -eu

API_BASE="${REGCHECK_API_BASE_URL:-${VITE_API_BASE_URL:-}}"
API_BASE="${API_BASE%/}"

if [ -z "$API_BASE" ]; then
  echo "REGCHECK_API_BASE_URL is required (backend URL for nginx /api proxy)." >&2
  exit 1
fi

case "$API_BASE" in
  http://*|https://*) ;;
  *)
    echo "REGCHECK_API_BASE_URL must be absolute (https://...), got: $API_BASE" >&2
    exit 1
    ;;
esac

# Backend on the host machine (make dev / make dev in regcheck-backend): localhost inside
# the container is the frontend container, not the host.
if [ -f /.dockerenv ]; then
  API_BASE=$(printf '%s' "$API_BASE" | sed -e 's|http://localhost|http://host.docker.internal|' \
    -e 's|http://127.0.0.1|http://host.docker.internal|')
fi

export API_UPSTREAM="$API_BASE"

TEMPLATE="/etc/nginx/templates/default.conf.template"
OUTPUT="/etc/nginx/conf.d/default.conf"

if command -v envsubst >/dev/null 2>&1; then
  envsubst '${API_UPSTREAM}' < "$TEMPLATE" > "$OUTPUT"
else
  sed "s|\${API_UPSTREAM}|${API_UPSTREAM}|g" "$TEMPLATE" > "$OUTPUT"
fi

printf '%s\n' 'window.__REGCHECK_API_BASE_URL__="";' > /usr/share/nginx/html/runtime-config.js

exec nginx -g 'daemon off;'
