#!/bin/sh
set -e

# ============================================
# Runtime Environment Variable Injection
# Mengganti __NEXT_PUBLIC_*__ placeholder dengan
# nilai env yang sebenarnya saat container start
# ============================================

echo "🔧 Injecting runtime environment variables..."

API_BASE_URL="${NEXT_PUBLIC_API_BASE_URL:-${NEXT_PUBLIC_API_URL:-https://ruang-tenang.site/api/v1}}"

# Cari semua file build artifact yang mungkin menyimpan placeholder.
find /app/.next -type f \( -name "*.js" -o -name "*.mjs" -o -name "*.json" -o -name "*.html" \) -exec sed -i \
  -e "s|__NEXT_PUBLIC_API_BASE_URL__|${API_BASE_URL}|g" \
  {} \;

# Standalone server bundle juga bisa menyimpan placeholder.
if [ -f /app/server.js ]; then
  sed -i "s|__NEXT_PUBLIC_API_BASE_URL__|${API_BASE_URL}|g" /app/server.js
fi

# Tambahkan placeholder lain jika ada
# find /app/.next -type f -name "*.js" -exec sed -i \
#   -e "s|__NEXT_PUBLIC_OTHER_VAR__|${NEXT_PUBLIC_OTHER_VAR:-default}|g" \
#   {} \;

echo "✅ Environment variables injected:"
echo "   NEXT_PUBLIC_API_BASE_URL=${API_BASE_URL}"

# Jalankan command utama (node server.js)
exec "$@"
