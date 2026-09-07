# Arsitektur Web
## Batas aplikasi

Frontend ini menangani UI publik, autentikasi, member dashboard, admin/moderasi, dan mitra. Backend Go adalah sumber data dan otorisasi server; frontend tidak boleh dianggap sebagai boundary keamanan.

## Lapisan

- app/: route, page, loading/error boundary, dan server/client composition.
- components/: komponen presentasi, layout dashboard, provider, widget, player, dan komponen domain bersama.
- app/**/_hooks dan hooks/: state/view-model dan orchestration UI.
- services/api/: operasi API per domain. Service memanggil HTTP client terpusat.
- services/http/: base URL, Bearer token, timeout, retry 429, response/error normalization, pagination, dan offline queue.
- store/: Zustand state lintas halaman, terutama auth, chat, dashboard, journal, block, dan music player.
- types/: kontrak TypeScript yang dipakai oleh service dan UI.
- lib/: route constants, safe redirect, Midtrans, offline IndexedDB, dan helper umum.

## Routing dan role

Route publik/auth berada di group (landing) dan (auth). app/dashboard/layout.tsx, middleware, dan konfigurasi navigasi mengarahkan role ke member, admin/moderator, atau mitra. Server tetap wajib memvalidasi role; redirect frontend hanya UX.

## PWA dan offline

app/sw.ts adalah sumber service worker. Cache dan outbox berjalan melalui lib/offline/ serta HTTP client. Hanya mutation domain yang aman dan idempotensi-nya sudah ditangani yang boleh diantrekan. Auth, chat AI, billing, admin, moderasi, push, dan operasi sensitif selalu membutuhkan koneksi.

## Pola perubahan

Tambahkan operasi baru pada services/api/<domain>.ts, schema/type bila perlu, hook/view-model, lalu page/component. Pastikan loading, empty, error, accessibility, responsive behavior, dan role guard tetap tersedia.
