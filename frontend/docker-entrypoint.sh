#!/bin/sh
set -eu

API_BASE="${REGCHECK_API_BASE_URL:-${VITE_API_BASE_URL:-}}"

escape_js() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

CONFIG_PATH="/usr/share/nginx/html/runtime-config.js"

if [ -n "$API_BASE" ]; then
  ESCAPED=$(escape_js "$API_BASE")
  printf 'window.__REGCHECK_API_BASE_URL__="%s";\n' "$ESCAPED" > "$CONFIG_PATH"
else
  printf '%s\n' 'window.__REGCHECK_API_BASE_URL__="";' > "$CONFIG_PATH"
fi

exec nginx -g 'daemon off;'
