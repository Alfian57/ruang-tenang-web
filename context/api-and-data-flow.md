# API dan Alur Data
## HTTP client

Semua request berjalan melalui services/http/client.ts. Client menambahkan Bearer token bila diberikan, memakai timeout 30 detik, menangani 204, normalisasi error validation, retry terbatas untuk 429, dan membentuk URL dari NEXT_PUBLIC_API_BASE_URL.

Response sukses umumnya berbentuk { data, meta?, requestId? }. Backend dapat mengirim pagination flat; client mengubahnya menjadi meta dengan page, limit, total_items, total_pages, has_next, dan has_prev.

## Service dan schema

Service pada services/api/ memetakan endpoint domain. Auth memakai schema Zod untuk memvalidasi response penting. Tambahkan schema ketika response eksternal memiliki bentuk yang wajib dijaga; jangan menyembunyikan perubahan kontrak dengan any.

## Auth dan redirect

Token disimpan/diambil oleh auth store dan dipasang pada request terlindungi. Middleware menangani redirect serta validasi asal Midtrans, tetapi backend tetap menjadi otoritas auth dan role.

## Upload dan timestamp

Pesan suara chat memakai `MediaRecorder` dan mengunggah Blob dalam format asli yang didukung browser (WebM/Opus, OGG/Opus, atau MP4/AAC) ke `/upload/audio`, lalu mengirim URL hasil unggahan sebagai pesan bertipe `audio`. API menentukan format berkas dari magic bytes dan menerima container tersebut; batas unggahan 10 MB. Jangan mengganti nama/tipe Blob menjadi MP3 tanpa konversi audio yang sebenarnya.
Percakapan suara yang dapat dipahami RuNa memakai dikte browser (`SpeechRecognition`) lalu mengirim transkrip sebagai pesan teks. Rekaman audio terpisah dapat diunggah dan diputar kembali, tetapi backend chat saat ini belum mentranskrip rekaman tersebut untuk model AI.

Upload URL dapat berupa relative path atau absolute URL; gunakan helper services/http/upload-url.ts. Timestamp dinormalisasi di client agar tampilan mengikuti timezone aplikasi.

## Integrasi pembayaran

Client key Midtrans boleh berada di NEXT_PUBLIC_MIDTRANS_CLIENT_KEY; server key tidak boleh masuk frontend. NEXT_PUBLIC_MIDTRANS_ENV menentukan sandbox/production. Billing juga menyediakan link pembayaran/invoice melalui API.
Daftar transaksi admin memfilter kasus refund melalui `refund_reconciliation_status`; refund diajukan lewat layanan admin billing yang mengirim ke Midtrans, sedangkan rekonsiliasi menyertakan tindakan dan catatan operator. Riwayat member menampilkan refund terkonfirmasi/menunggu konfirmasi dan bila sedang ditinjau.

Registrasi dan profil mengirim `whatsapp_number`. Login yang menerima `verification_required` menyimpan challenge di sessionStorage dan mengarahkan pengguna ke `/verify-phone`; JWT/cookie auth baru disimpan setelah OTP diverifikasi. Akun lama tanpa nomor dapat menambah nomor dari halaman OTP. Lupa kata sandi tetap mencari akun lewat email, lalu backend mengirim kode reset via WhatsApp terverifikasi.

## Perubahan contract

Saat endpoint atau DTO API berubah, perbarui service, type/schema, error mapping, dan context ini. Sinkronkan dengan OpenAPI API serta datasource mobile sebelum menganggap perubahan selesai.

Untuk daftar dashboard, service meminta `page`/`limit` pada `/articles`, `/my-articles`, `/song-categories`, `/playlists`, `/playlists/public`, `/forums`, `/stories`, `/stories/my-stories`, `/journals/public`, dan `/rewards`. Forum tetap memakai `offset`, dan filter `circle` diterapkan sebelum pagination di server. Pencarian lagu memakai `/search?type=songs&page=...&limit=...`; katalog hadiah memakai `reward_type` dan menerima `reward_types` sebagai facet seluruh katalog, bukan hanya halaman aktif. `/playlists/public?kind=official|community` memfilter di server dan menyertakan `is_admin_playlist` pada DTO. Endpoint yang sebelumnya mengembalikan array utuh (`/song-categories`, `/playlists`, `/rewards`) hanya memakai response paginated saat query pagination/filter disertakan; tanpa query itu respons legacy untuk mobile tetap dipertahankan. Pagination flat dinormalisasi oleh HTTP client menjadi `meta`.
