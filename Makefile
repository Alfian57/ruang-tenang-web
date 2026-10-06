.PHONY: install dev build start lint typecheck test verify deploy-cpanel deploy-clean help

# Default target
.DEFAULT_GOAL := help

# Install dependencies from lockfile
install:
	npm ci

# Development server
dev:
	npm run dev

# Production build
build:
	npm run build

# Start production server (standalone build)
start:
	npm run start

# Lint
lint:
	npm run lint

# TypeScript typecheck
typecheck:
	npm run typecheck

# Smoke test
test:
	npm run test:smoke

# Full verification
verify:
	npm run verify

# Deployment (cPanel)
# Build produksi dan rakit bundle upload-web/ + upload-web.zip.
# Script otomatis memvalidasi .env.production, menangani prioritas .env.local,
# dan menyertakan .next/static ke bundle.
deploy-cpanel:
	@bash ./scripts/deploy_cpanel.sh

# Hapus artefak bundle deployment agar tidak menumpuk.
deploy-clean:
	@echo "🧹 Removing cPanel deployment bundles..."
	rm -rf upload-web upload-web.zip
	@echo "✅ Deployment bundle cleaned!"

help:
	@echo "Available targets:"
	@echo "  install       - Install dependencies (npm ci)"
	@echo "  dev           - Run development server"
	@echo "  build         - Production build"
	@echo "  start         - Start production server"
	@echo "  lint          - Run ESLint"
	@echo "  typecheck     - Run TypeScript typecheck"
	@echo "  test          - Run smoke test"
	@echo "  verify        - Lint + typecheck + smoke test + build"
	@echo "  deploy-cpanel - Build & bundle for cPanel (upload-web.zip)"
	@echo "  deploy-clean  - Remove cPanel deployment artifacts"
