# Ruang Tenang Web

Frontend web Ruang Tenang untuk member, admin/moderator, dan mitra organisasi. Aplikasi memakai Next.js App Router dan berbagi API dengan repository ruang-tenang-api serta aplikasi member di ruang-tenang-mobile.

## Mulai cepat

### Prasyarat

- Node.js 22 (versi yang dipakai image Docker; Node.js 20+ biasanya cukup untuk development).
- npm.
- API Ruang Tenang berjalan pada http://localhost:8080 atau URL yang setara.

### Instalasi lokal

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Buka http://localhost:3000. Untuk development lokal, nilai minimum .env.local adalah:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

NEXT_PUBLIC_API_URL tetap diterima sebagai fallback kompatibilitas. Jangan masukkan server key atau secret backend ke environment NEXT_PUBLIC_*.

## Perintah

```bash
npm run dev          # Next dev dengan Turbopack
npm run lint         # ESLint
npm run typecheck    # TypeScript tanpa emit
npm run test:smoke   # Audit smoke statis
npm run build        # Build produksi
npm run start        # Menjalankan build produksi
npm run verify       # lint + typecheck + smoke + build
```

Repository ini belum memiliki unit-test suite terpisah; test:smoke memeriksa invariant penting secara statis. Jalankan npm run verify sebelum perubahan frontend diserahkan.

## Arsitektur singkat

- app/ berisi route App Router. Group (landing) dan (auth) memisahkan halaman publik/auth; dashboard/ berisi area terproteksi member, admin, moderasi, dan mitra.
- components/ berisi UI reusable, layout, provider, player musik, PWA, dan komponen domain bersama.
- services/api/ adalah service per domain. Semua request harus melewati services/http/client.ts.
- store/ berisi Zustand store; hooks/ menangani view-model dan interaksi browser.
- types/ adalah tipe lintas fitur; config/env.ts adalah sumber validasi environment.
- lib/offline/ mengelola cache/outbox IndexedDB untuk mutation yang memang boleh diantrekan saat offline.

Detail route, alur data, dan operasi ada di context/README.md. Aturan kerja untuk AI agent ada di AGENTS.md.

## Fitur dan role

- Member: dashboard, mood, jurnal, chat AI, artikel, stories, forum, musik, breathing, komunitas, wellness, gamifikasi, billing, dan top-up.
- Admin/moderator: pengguna, artikel, musik, forum, level/reward, billing, broadcast, moderasi, serta crisis keywords.
- Mitra: organisasi, subscription, seat, insight, pembayaran, onboarding, dan SSO configuration.
- PWA mendukung install prompt, service worker, API cache, dan outbox terbatas. Chat, auth, billing, admin, moderasi, dan push tidak diantrekan offline.

## Environment utama

Salin .env.example ke .env.local.

| Variable | Kegunaan |
| --- | --- |
| NEXT_PUBLIC_API_BASE_URL | API lengkap termasuk /api/v1. |
| NEXT_PUBLIC_APP_TIMEZONE | Zona waktu tampilan, default Asia/Jakarta. |
| NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS | Allowlist host gambar remote, dipisahkan koma. |
| NEXT_PUBLIC_MIDTRANS_CLIENT_KEY | Client key Midtrans Snap; kosong memakai alur pembayaran manual. |
| NEXT_PUBLIC_MIDTRANS_ENV | sandbox atau production. |

Pada image Docker, API URL dapat diinjeksi saat container start melalui entrypoint.sh. Build CI memakai GitHub repository variables; secret deployment tidak disimpan di repository.

## Struktur repository

```text
app/           route dan page App Router
components/    UI, layout, player, PWA, provider
config/        validasi environment
hooks/         reusable view-model hooks
lib/           helper, route, offline storage, payment
services/      HTTP client dan API service per domain
store/         Zustand state
types/         tipe domain dan API
utils/         sanitizer, formatter, dan helper
scripts/       smoke/audit dan maintenance script
context/       dokumentasi teknis yang lebih spesifik
```

## Docker dan deployment

Dockerfile membuat standalone Next image berbasis Node 22. Workflow .github/workflows/build-and-deploy.yml membangun dan push image ke GHCR pada push/PR, lalu melakukan deploy VPS hanya pada push ke main. Periksa workflow dan entrypoint.sh sebelum mengubah nama variable atau lokasi deploy.

## Kontribusi

Mulai dengan membaca AGENTS.md, lalu context yang relevan. Perubahan API, auth, billing, AI, offline queue, atau role harus diverifikasi terhadap ruang-tenang-api dan didokumentasikan pada context terkait. Jangan commit .env.local, token, atau data pengguna.
