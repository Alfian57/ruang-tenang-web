# Fitur dan Route
## Area publik

Landing page, about/contact, privacy/terms, artikel publik, stories publik, hall of fame, dan halaman gamification publik berada di app/(landing)/.

## Area member

Dashboard member memakai tiga hub agar fitur yang berkaitan tidak tersebar:

- `/dashboard/community` memuat Forum (default), Kisah Inspiratif, Jurnal Publik, dan Statistik. Detail forum memakai `/dashboard/community/forum/[slug]`; detail dan pembuatan kisah memakai `/dashboard/community/stories/*`.
- `/dashboard/journey` memuat Ringkasan level/XP/badge (default), Peta, dan Hadiah. Misi Harian tersedia melalui Daily Task FAB di seluruh dashboard member.
- `/dashboard/billing` tampil sebagai **Paket & Koin** pada menu akun, dengan tab Paket (default), Koin, dan Transaksi.

Artikel hanya memakai `/dashboard/articles`; route dashboard lama untuk reading, forum, stories, progress-map, rewards, dan topup sengaja dihapus tanpa redirect. Route publik `/stories*`, serta route admin/moderasi, tetap terpisah.

## Area admin dan moderasi

app/dashboard/admin/ mengelola users, articles, songs, forums, levels, rewards, billing, B2B, dan broadcasts. app/dashboard/moderation/ menangani queue, reports, stories, appeals, actions, crisis keywords, dan trigger warnings.

## Area mitra

app/dashboard/mitra/ mengelola organizations, subscription, insights, payments, settings, onboarding, invite, dan kebutuhan SSO/B2B.

## Route truth

Gunakan lib/routes.ts untuk constant dan dynamic builder. Gunakan folder app/ untuk memastikan route benar-benar tersedia; jangan menambahkan daftar route manual yang tidak ditautkan ke source. Saat route ditambah, periksa middleware, dashboard navigation, role visibility, loading/error state, dan context ini.

Tab hub disimpan pada query `tab` agar dapat ditautkan dan mengikuti navigasi browser. Panel berat dimuat secara dinamis dan hanya panel aktif yang mengambil data. Daily Task FAB memakai store non-persisten dan menjadi antarmuka kanonis untuk misi harian.
