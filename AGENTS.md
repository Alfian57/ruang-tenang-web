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
- **Jangan menjalankan `npm run build` atau perintah build lain secara otomatis. Build hanya boleh dijalankan jika pengguna memintanya secara eksplisit pada percakapan saat ini**, termasuk ketika perubahan menyentuh build/config/PWA/deployment.
- Jangan menjalankan `npm run verify` sebagai langkah default karena script tersebut juga menjalankan build. Jika build dibutuhkan untuk verifikasi tetapi belum diminta, laporkan sebagai belum dijalankan dan minta instruksi pengguna. Gunakan validasi non-build yang sesuai dengan scope perubahan, lalu periksa `git diff --check`.
- Jika environment tidak memungkinkan command dijalankan, laporkan command dan error sebenarnya; jangan menyatakan lulus.

## Generated files dan deployment

- Edit app/sw.ts, bukan public/sw.js hasil build. Jangan meregenerasi service worker melalui build tanpa permintaan eksplisit pengguna.
- next.config.ts dan entrypoint.sh membentuk konfigurasi image/runtime; jangan menghapus placeholder runtime tanpa memahami deployment GHCR/VPS.
- package-lock.json adalah lockfile npm yang dipakai Docker. Jangan mengubah bun.lock sebagai efek samping instalasi npm.
- Workflow pada .github/workflows/build-and-deploy.yml adalah sumber kebenaran untuk trigger, variable, secret, dan deploy.

## Format gambar dan performance

- Format raster default untuk aset yang dikirim ke browser adalah **WebP**. Gunakan `next/image` dengan `width`/`height` atau ukuran responsif yang eksplisit agar browser dan Next.js dapat mengoptimalkan pengiriman gambar.
- Untuk ilustrasi/foto biasa, gunakan WebP dengan kualitas sekitar 85–90. Untuk ilustrasi dengan teks, bentuk datar, atau detail referensi yang sensitif terhadap artefak, gunakan WebP lossless atau pertahankan PNG bila WebP merusak kualitas.
- Pertahankan PNG/ICO untuk favicon, apple touch icon, kebutuhan kompatibilitas eksternal, atau master referensi AI beresolusi tinggi yang menunjukkan artefak setelah konversi. Jangan mengonversi hanya demi ekstensi jika hasil visualnya memburuk.
- Jangan menyimpan dua format untuk aset runtime yang sama tanpa alasan kompatibilitas yang jelas. Setelah konversi, perbarui semua referensi source dan smoke test, lalu hapus salinan runtime lama yang tidak lagi dipakai.
- Aset runtime yang sudah menggunakan WebP: `/images/landing/about-illustration.webp`, `/images/landing/about-doctor.webp`, dan `/coin.webp`.
- `public/sw.js` adalah hasil generate; jangan diedit manual. Perubahan daftar aset akan tercermin saat service worker dibuat ulang oleh build yang hanya dijalankan setelah diminta pengguna.

## Referensi maskot Ruang Tenang

- Aset kanonis maskot: `assets/mascot/mascot.png`.
- Lembar turnaround kanonis: `assets/mascot/mascot-turnaround.webp` (lossless WebP).
- `mascot.png` adalah master referensi AI beresolusi tinggi dan tetap PNG karena efek glow/transparansinya menimbulkan artefak saat dikompresi ke WebP. Turnaround sheet sudah aman dikonversi ke WebP lossless.
- Setiap permintaan generate atau edit maskot dengan AI image generator **wajib menggunakan kedua file tersebut sebagai referensi**. Gunakan `mascot.png` untuk tampilan utama dan warna, serta `mascot-turnaround.webp` untuk menjaga bentuk, proporsi, atribut, dan konsistensi tampak depan/samping/belakang.
- Pertahankan identitas berikut kecuali pengguna meminta perubahan: kepala bulat, badan rose-coral, cape crimson dengan lining navy, trim gold, emblem empat bidang membulat terinspirasi logo Ruang Tenang, serta orb dengan simbol hati dan gelombang napas.
- Jangan menambahkan wordmark, teks, atau watermark ke maskot kecuali diminta secara eksplisit. Simpan hasil referensi baru sebagai file sibling di folder `assets/mascot/`; salin/konversi ke `public/` hanya jika pengguna meminta maskot dipakai sebagai aset runtime. Jangan menimpa dua aset kanonis tanpa instruksi eksplisit.

## Dokumentasi dan koordinasi

- Jika route, role, environment, service API, response mapping, offline policy, atau deployment berubah, perbarui README/context pada perubahan yang sama.
- Perubahan contract API harus menyebut endpoint/response yang terdampak dan disinkronkan dengan repository API serta mobile.
- Gunakan context/README.md untuk memilih dokumen; jangan menyalin seluruh context ke file adapter agent.
- Jangan melakukan perubahan database, deployment, migrasi, atau penghapusan data sebagai bagian dari pekerjaan dokumentasi tanpa instruksi eksplisit.

## Code review rules

- Flag request API langsung dari UI, bypass auth/role checks, secret NEXT_PUBLIC_* yang tidak aman, dan mutation offline yang melewati allowlist.
- Flag link/path dokumentasi yang menunjuk struktur lama atau sibling path yang tidak tersedia saat repo di-clone sendiri.
