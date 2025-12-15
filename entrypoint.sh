#!/bin/sh
set -e

# ============================================
# Runtime Environment Variable Injection
# Mengganti __NEXT_PUBLIC_*__ placeholder dengan
# nilai env yang sebenarnya saat container start
# ============================================

echo "🔧 Injecting runtime environment variables..."

# Cari semua file JS di .next dan ganti placeholder
find /app/.next -type f -name "*.js" -exec sed -i \
  -e "s|__NEXT_PUBLIC_API_URL__|${NEXT_PUBLIC_API_URL:-http://localhost:8080/api/v1}|g" \
  {} \;

# Tambahkan placeholder lain jika ada
# find /app/.next -type f -name "*.js" -exec sed -i \
#   -e "s|__NEXT_PUBLIC_OTHER_VAR__|${NEXT_PUBLIC_OTHER_VAR:-default}|g" \
#   {} \;

echo "✅ Environment variables injected:"
echo "   NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://localhost:8080/api/v1}"

# Jalankan command utama (node server.js)
exec "$@"
