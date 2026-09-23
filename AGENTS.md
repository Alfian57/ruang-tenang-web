# AGENTS.md — Ruang Tenang Web
Dokumen ini adalah instruksi kanonis untuk AI agent dan contributor. Baca README.md, lalu buka dokumen di context/ sesuai area perubahan.

CLAUDE.md, GEMINI.md, dan .github/copilot-instructions.md adalah adapter tipis yang merujuk ke dokumen ini; Cursor dan OpenCode memakai AGENTS.md sebagai instruction native.

## Sumber kebenaran

- Runtime truth: kode, package.json, next.config.ts, config/env.ts, workflow CI, dan .env.example.
- Route truth: folder app/ dan lib/routes.ts.
- API truth: anotasi/implementasi pada ruang-tenang-api, lalu service dan schema frontend.
- Product truth: perilaku UI yang sudah terimplementasi; keputusan lintas platform dirangkum di context/ecosystem.md.
- Jangan menganggap .orig, .rej, public/sw.js, atau source map sebagai sumber implementasi utama.

## Cara bekerja

1. Identifikasi role dan route yang terdampak sebelum mengedit.
2. Ikuti alur page → hook/view-model → services/api → services/http/client.ts.
3. Jangan memanggil fetch langsung dari page/component bila service domain sudah ada.
4. Pertahankan validasi Zod, envelope API, normalisasi pagination/timestamp, dan error mapping.
5. Perubahan fitur harus tetap aman untuk auth guard, role, responsive layout, accessibility, dan loading/error/empty state.
6. Mutation offline hanya boleh memakai endpoint yang sudah diizinkan services/http/client.ts; jangan mengantrekan auth, chat, billing, admin, moderasi, push, atau endpoint sensitif.
7. Gunakan @/ alias dan konvensi folder yang sudah ada. Hindari menambah dependency bila utilitas yang ada cukup.
8. Jangan menaruh secret di kode, .env.local, bundle, log, atau dokumentasi.

## Validasi

- Perubahan TypeScript/React: jalankan `npm run lint` dan `npm run typecheck`.
- Perubahan route, API service, auth, atau offline: jalankan `npm run test:smoke` juga.
- `npm run build` tidak wajib untuk perubahan UI, styling, copy, atau TypeScript biasa. Jalankan build hanya jika diminta pengguna atau perubahan menyentuh build/config/PWA/deployment.
- Jangan menjalankan `npm run verify` sebagai langkah default karena script tersebut juga menjalankan build. Gunakan validasi yang sesuai dengan scope perubahan, lalu periksa `git diff --check`.
- Jika environment tidak memungkinkan command dijalankan, laporkan command dan error sebenarnya; jangan menyatakan lulus.

## Generated files dan deployment

- Edit app/sw.ts, bukan public/sw.js hasil build.
- next.config.ts dan entrypoint.sh membentuk konfigurasi image/runtime; jangan menghapus placeholder runtime tanpa memahami deployment GHCR/VPS.
- package-lock.json adalah lockfile npm yang dipakai Docker. Jangan mengubah bun.lock sebagai efek samping instalasi npm.
- Workflow pada .github/workflows/build-and-deploy.yml adalah sumber kebenaran untuk trigger, variable, secret, dan deploy.

## Dokumentasi dan koordinasi

- Jika route, role, environment, service API, response mapping, offline policy, atau deployment berubah, perbarui README/context pada perubahan yang sama.
- Perubahan contract API harus menyebut endpoint/response yang terdampak dan disinkronkan dengan repository API serta mobile.
- Gunakan context/README.md untuk memilih dokumen; jangan menyalin seluruh context ke file adapter agent.
- Jangan melakukan perubahan database, deployment, migrasi, atau penghapusan data sebagai bagian dari pekerjaan dokumentasi tanpa instruksi eksplisit.

## Code review rules

- Flag request API langsung dari UI, bypass auth/role checks, secret NEXT_PUBLIC_* yang tidak aman, dan mutation offline yang melewati allowlist.
- Flag link/path dokumentasi yang menunjuk struktur lama atau sibling path yang tidak tersedia saat repo di-clone sendiri.
