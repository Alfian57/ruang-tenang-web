# API dan Alur Data
## HTTP client

Semua request berjalan melalui services/http/client.ts. Client menambahkan Bearer token bila diberikan, memakai timeout 30 detik, menangani 204, normalisasi error validation, retry terbatas untuk 429, dan membentuk URL dari NEXT_PUBLIC_API_BASE_URL.

Response sukses umumnya berbentuk { data, meta?, requestId? }. Backend dapat mengirim pagination flat; client mengubahnya menjadi meta dengan page, limit, total_items, total_pages, has_next, dan has_prev.

## Service dan schema

Service pada services/api/ memetakan endpoint domain. Auth memakai schema Zod untuk memvalidasi response penting. Tambahkan schema ketika response eksternal memiliki bentuk yang wajib dijaga; jangan menyembunyikan perubahan kontrak dengan any.

## Auth dan redirect

Token disimpan/diambil oleh auth store dan dipasang pada request terlindungi. Middleware menangani redirect serta validasi asal Midtrans, tetapi backend tetap menjadi otoritas auth dan role.

## Upload dan timestamp

Upload URL dapat berupa relative path atau absolute URL; gunakan helper services/http/upload-url.ts. Timestamp dinormalisasi di client agar tampilan mengikuti timezone aplikasi.

## Integrasi pembayaran

Client key Midtrans boleh berada di NEXT_PUBLIC_MIDTRANS_CLIENT_KEY; server key tidak boleh masuk frontend. NEXT_PUBLIC_MIDTRANS_ENV menentukan sandbox/production. Billing juga menyediakan link pembayaran/invoice melalui API.

## Perubahan contract

Saat endpoint atau DTO API berubah, perbarui service, type/schema, error mapping, dan context ini. Sinkronkan dengan OpenAPI API serta datasource mobile sebelum menganggap perubahan selesai.
