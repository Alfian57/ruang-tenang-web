# Ecosystem Ruang Tenang
| Repository | Peran | Kontrak utama |
| --- | --- | --- |
| ruang-tenang-web | Frontend web member/admin/mitra | HTTP API /api/v1, auth JWT, upload, billing |
| ruang-tenang-api | Backend dan sumber data | route Gin, DTO, migration PostgreSQL, OpenAPI |
| ruang-tenang-mobile | Flutter client member | API yang sama, BASE_URL host-only + /api/v1 |

Web memakai NEXT_PUBLIC_API_BASE_URL lengkap dengan /api/v1; mobile memakai BASE_URL tanpa prefix lalu menambahkannya sendiri. Perubahan response harus dicek pada services/api/, datasource Dart, dan snapshot OpenAPI.

Member adalah role lintas web/mobile. Admin dan mitra hanya didukung web. AI, journal, mood, moderation, billing, upload, dan data pribadi memerlukan perhatian khusus pada privacy, role, dan error handling.

API dapat mengirim route web melalui push notification, rekomendasi wellness, dan context AI. Route dashboard member kanonis adalah `/dashboard/community`, `/dashboard/journey`, dan `/dashboard/billing`; detail forum menggunakan slug pada `/dashboard/community/forum/[slug]`.

## Invariant lintas repo

- API dan snapshot OpenAPI adalah sumber contract HTTP. Web dan mobile mengonsumsi `/api/v1` yang sama dengan konfigurasi base URL masing-masing.
- Perubahan route/DTO harus menjaga kompatibilitas kedua client dan ditinjau pada handler/test/OpenAPI API, service/schema web, serta datasource/model mobile.
- Web melayani member, admin, moderator, dan mitra; mobile hanya member (`user`). Pemeriksaan role dan ownership yang melindungi data harus tetap dilakukan API. API menyimpan state consent AI; client menjaga gate/disclaimer chat dan tidak menganggap gate UI sebagai kontrol akses server.
- Journal, chat/context AI, mood, profil, laporan moderasi, dan billing adalah data pribadi. Consent AI dan pengaturan privasi journal harus dihormati di semua client.
- Prompt/model AI, kuota, moderasi, dan kebijakan krisis berada di API. Client mempertahankan consent/disclaimer serta menangani response/error menurut contract.

Peta surface member web/mobile yang dipakai untuk meninjau paritas ada di `member-feature-parity.md` pada repo web dan mobile. Kedua salinan perlu diperbarui bersama ketika surface member berubah.
