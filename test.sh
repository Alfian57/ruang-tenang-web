#!/usr/bin/env bash

set -e

# =========================
# CONFIG
# =========================
REGISTRY="ghcr.io"
USERNAME="alfian57"
IMAGE_NAME="ruang-tenang-web"
TAG="latest"

# Build arg
NEXT_PUBLIC_API_URL="https://api.ruang-tenang.site/api/v1"

IMAGE="$REGISTRY/$USERNAME/$IMAGE_NAME:$TAG"

# =========================
# CHECK LOGIN
# =========================
echo "🔐 Pastikan sudah login ke GHCR"
echo "Jika belum:"
echo "  docker login ghcr.io"
echo ""

# =========================
# BUILD & PUSH
# =========================
echo "🚀 Building & pushing image: $IMAGE"

docker buildx build \
  --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" \
  -t "$IMAGE" \
  --push \
  .

echo ""
echo "✅ DONE"
echo "📦 Image pushed: $IMAGE"
