# Operasi Web
## Environment

config/env.ts memvalidasi NEXT_PUBLIC_API_BASE_URL, timezone, image hosts, dan Midtrans. Placeholder __NEXT_PUBLIC_API_BASE_URL__ dipertahankan saat build agar dapat diganti entrypoint.sh ketika container start.

NEXT_PUBLIC_API_BASE_URL harus menyertakan /api/v1 untuk request API. Host upload diturunkan dengan menghapus suffix tersebut. Pada deployed page, placeholder atau localhost yang tidak reachable akan diarahkan ke origin page /api/v1.

## Docker

Image menggunakan Node 22, Next standalone output, dan non-root user. Build memakai package-lock.json lebih dahulu bila tersedia. Runtime entrypoint mengganti placeholder pada artefak .next dan server.js; perubahan terhadap pola placeholder harus diuji dengan build container.

## CI/deployment

.github/workflows/build-and-deploy.yml:
- menjalankan Docker Buildx pada push dan pull request ke main;
- push image GHCR hanya untuk non-PR;
- memakai repository variables untuk API URL saat build;
- deploy SSH ke VPS hanya setelah push langsung ke main.

Jangan menaruh DOCKER_TOKEN, SSH key, host, atau variable production dalam file yang di-commit.

## Verifikasi lokal

Gunakan npm run verify. Jika dependency belum tersedia, jalankan npm ci terlebih dahulu. Smoke audit bersifat statis dan tidak menggantikan pengujian API integration atau browser end-to-end.
