# Fitur dan Route
## Area publik

Landing page, about/contact, privacy/terms, artikel publik, stories publik, hall of fame, dan halaman gamification publik berada di app/(landing)/.

## Area member

Dashboard member mencakup mood tracker, journal, chat AI, artikel/reading, stories, forum, musik/playlist, komunitas, wellness, progress map, rewards, game, billing/top-up, profile, dan settings.

## Area admin dan moderasi

app/dashboard/admin/ mengelola users, articles, songs, forums, levels, rewards, billing, B2B, dan broadcasts. app/dashboard/moderation/ menangani queue, reports, stories, appeals, actions, crisis keywords, dan trigger warnings.

## Area mitra

app/dashboard/mitra/ mengelola organizations, subscription, insights, payments, settings, onboarding, invite, dan kebutuhan SSO/B2B.

## Route truth

Gunakan lib/routes.ts untuk constant dan dynamic builder. Gunakan folder app/ untuk memastikan route benar-benar tersedia; jangan menambahkan daftar route manual yang tidak ditautkan ke source. Saat route ditambah, periksa middleware, dashboard navigation, role visibility, loading/error state, dan context ini.
