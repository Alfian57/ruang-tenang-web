# Ecosystem Ruang Tenang
| Repository | Peran | Kontrak utama |
| --- | --- | --- |
| ruang-tenang-web | Frontend web member/admin/mitra | HTTP API /api/v1, auth JWT, upload, billing |
| ruang-tenang-api | Backend dan sumber data | route Gin, DTO, migration PostgreSQL, OpenAPI |
| ruang-tenang-mobile | Flutter client member | API yang sama, BASE_URL host-only + /api/v1 |

Web memakai NEXT_PUBLIC_API_BASE_URL lengkap dengan /api/v1; mobile memakai BASE_URL tanpa prefix lalu menambahkannya sendiri. Perubahan response harus dicek pada services/api/, datasource Dart, dan snapshot OpenAPI.

Member adalah role lintas web/mobile. Admin dan mitra hanya didukung web. AI, journal, mood, moderation, billing, upload, dan data pribadi memerlukan perhatian khusus pada privacy, role, dan error handling.

API dapat mengirim route web melalui push notification, rekomendasi wellness, dan context AI. Route dashboard member kanonis adalah `/dashboard/community`, `/dashboard/journey`, dan `/dashboard/billing`; detail forum menggunakan slug pada `/dashboard/community/forum/[slug]`.
