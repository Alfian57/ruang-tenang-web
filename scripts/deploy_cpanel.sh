#!/usr/bin/env bash
#
# deploy_cpanel.sh — Rakit bundle deployment Next.js (standalone) untuk cPanel.
#
# Menghasilkan:
#   ./upload-web/        (isi siap upload ke ~/ruang-tenang-web/)
#   ./upload-web.zip     (arsip siap upload)
#
# Script ini otomatis:
#   1. Memvalidasi .env.production (fail-fast bila masih localhost / host API kurang).
#   2. Memindahkan .env.local sementara agar .env.production yang dipakai saat build
#      (Next.js memuat .env.local dengan prioritas lebih tinggi dari .env.production).
#   3. Membangun aplikasi lalu memverifikasi env produksi benar-benar tertanam.
#   4. Menyalin .next/standalone + public + .next/static ke bundle (static WAJIB;
#      standalone tidak menyertakannya secara otomatis).
#
# Pemakaian:
#   bash scripts/deploy_cpanel.sh
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

OUT_DIR="${REPO_ROOT}/upload-web"
ZIP_PATH="${REPO_ROOT}/upload-web.zip"
# Nama folder utama di dalam zip (= Application Root cPanel). Saat diextract
# akan terbentuk satu folder ini dengan seluruh isi di dalamnya.
ARCHIVE_ROOT="ruang-tenang-web"
ENV_PROD="${REPO_ROOT}/.env.production"
ENV_LOCAL="${REPO_ROOT}/.env.local"
ENV_LOCAL_BAK="${REPO_ROOT}/.env.local.deploy.bak"

red()    { printf '\033[31m%s\033[0m\n' "$*"; }
green()  { printf '\033[32m%s\033[0m\n' "$*"; }
blue()   { printf '\033[34m%s\033[0m\n' "$*"; }
yellow() { printf '\033[33m%s\033[0m\n' "$*"; }
die()    { red "ERROR: $*"; exit 1; }

restore_env_local() {
  if [ -f "${ENV_LOCAL_BAK}" ]; then
    mv -f "${ENV_LOCAL_BAK}" "${ENV_LOCAL}"
    blue "-> .env.local dikembalikan"
  fi
}
trap restore_env_local EXIT

# ---------------------------------------------------------------------------
# 1. Preflight
# ---------------------------------------------------------------------------
blue "== Preflight =="
command -v node >/dev/null 2>&1 || die "node tidak ditemukan."
command -v npm  >/dev/null 2>&1 || die "npm tidak ditemukan."
command -v zip  >/dev/null 2>&1 || die "zip tidak ditemukan."

[ -f "${ENV_PROD}" ] || die ".env.production tidak ditemukan di ${REPO_ROOT}. Buat file tersebut sebelum deploy."
[ -d "node_modules" ] || die "node_modules tidak ditemukan. Jalankan 'npm ci' terlebih dahulu."

# ---------------------------------------------------------------------------
# 2. Validasi .env.production
# ---------------------------------------------------------------------------
blue "== Validasi .env.production =="
read_env() {
  grep -E "^$1=" "${ENV_PROD}" | tail -1 | cut -d= -f2- | tr -d '"' | tr -d "'" | xargs || true
}

api_base="$(read_env NEXT_PUBLIC_API_BASE_URL)"
allowed_hosts="$(read_env NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS)"

[ -n "${api_base}" ] || die "NEXT_PUBLIC_API_BASE_URL kosong di .env.production."
case "${api_base}" in
  *localhost*|*127.0.0.1*) die "NEXT_PUBLIC_API_BASE_URL masih mengarah ke localhost: ${api_base}" ;;
esac
case "${allowed_hosts}" in
  *api.ruang-tenang.my.id*) : ;;
  *) die "NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS harus memuat api.ruang-tenang.my.id (sekarang: '${allowed_hosts}')" ;;
esac
green "   API base     : ${api_base}"
green "   Image hosts  : ${allowed_hosts}"

# ---------------------------------------------------------------------------
# 3. Build dengan env produksi
# ---------------------------------------------------------------------------
blue "== Build (npm run build) =="
if [ -f "${ENV_LOCAL}" ]; then
  mv -f "${ENV_LOCAL}" "${ENV_LOCAL_BAK}"
  blue "-> .env.local dipindahkan sementara agar .env.production dipakai saat build"
else
  yellow "-> .env.local tidak ada; .env.production langsung dipakai"
fi

npm run build
restore_env_local

# ---------------------------------------------------------------------------
# 4. Verifikasi env tertanam di bundle statis
# ---------------------------------------------------------------------------
blue "== Verifikasi env tertanam =="
[ -d ".next/static/chunks" ] || die ".next/static/chunks tidak ada. Build gagal?"

baked="$(grep -oh 'NEXT_PUBLIC_API_BASE_URL:"[^"]*"' .next/static/chunks/*.js 2>/dev/null | sort -u || true)"
echo "   ${baked:-<tidak ditemukan>}"
case "${baked}" in
  *localhost*|*127.0.0.1*) die "Build masih memuat localhost. Periksa file env dan jalankan ulang." ;;
esac
case "${baked}" in
  *api.ruang-tenang.my.id*) green "   Build memuat host API produksi." ;;
  *) die "Build tidak memuat api.ruang-tenang.my.id." ;;
esac

# ---------------------------------------------------------------------------
# 5. Rakit bundle
# ---------------------------------------------------------------------------
blue "== Rakit bundle =="
[ -d ".next/standalone" ] || die ".next/standalone tidak ada. Pastikan output:'standalone' aktif di next.config.ts."

rm -rf "${OUT_DIR}" "${ZIP_PATH}"
mkdir -p "${OUT_DIR}"

cp -r .next/standalone/. "${OUT_DIR}/"
cp -r public "${OUT_DIR}/public"
mkdir -p "${OUT_DIR}/.next/static"
cp -r .next/static/. "${OUT_DIR}/.next/static/"

# Next.js standalone menyalin .env.production ke output. Jangan ikut ter-upload:
# nilai NEXT_PUBLIC_* sudah ter-embed ke bundle, dan server memakai .env miliknya
# sendiri di ~/ruang-tenang-web/.env.
find "${OUT_DIR}" -maxdepth 1 -name '.env*' -delete

# Sanity check: berkas yang paling sering hilang.
[ -f "${OUT_DIR}/server.js" ] || die "server.js tidak ada di bundle."
[ -f "${OUT_DIR}/.next/BUILD_ID" ] || die ".next/BUILD_ID tidak ada di bundle."
[ -n "$(ls -A "${OUT_DIR}/.next/static")" ] || die ".next/static kosong di bundle."
[ -z "$(find "${OUT_DIR}" -maxdepth 1 -name '.env*')" ] || die "File env terdeteksi di bundle (harus dibersihkan)."
[ -f "${OUT_DIR}/public/sw.js" ] || yellow "-> public/sw.js tidak ada (PWA service worker mungkin tidak aktif)."

# ---------------------------------------------------------------------------
# 6. Zip (dengan satu folder utama di dalam arsip)
# ---------------------------------------------------------------------------
blue "== Zip =="
STAGE_DIR="$(mktemp -d)"
mv "${OUT_DIR}" "${STAGE_DIR}/${ARCHIVE_ROOT}"
( cd "${STAGE_DIR}" && zip -qr "${ZIP_PATH}" "${ARCHIVE_ROOT}" )
mv "${STAGE_DIR}/${ARCHIVE_ROOT}" "${OUT_DIR}"
rm -rf "${STAGE_DIR}"

green ""
green "Selesai."
green "  Bundle : ${OUT_DIR}"
green "  Zip    : ${ZIP_PATH}"
green "Isi zip diextract menjadi folder '${ARCHIVE_ROOT}/'."
green "Upload ${ZIP_PATH##*/} ke direktori home (~) cPanel, extract, lalu RESTART app."
