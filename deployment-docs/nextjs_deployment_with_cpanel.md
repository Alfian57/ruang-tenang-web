# Dokumentasi Deployment Next.js (`ruang-tenang-web`) ke Shared Hosting (cPanel)

Dokumen ini berisi panduan langkah demi langkah untuk melakukan deployment proyek frontend **ruang-tenang-web** (Next.js 15 Standalone Mode) ke shared hosting cPanel menggunakan fitur **Setup Node.js App (Phusion Passenger)** dan **cPanel Terminal**.

> [!IMPORTANT]
> Proses build & perakitan bundle di lokal sudah diotomasi oleh **`scripts/deploy_cpanel.sh`**. Ikuti langkah di bawah; jangan merakit bundle secara manual agar `.next/static` tidak terlewat.

---

## 📋 Prasyarat Lingkungan

- **Lokal:**
  - Node.js (v18.18+ atau v20.x LTS disarankan), npm, Git, `zip`.
  - Folder `node_modules` sudah terpasang (`npm ci`).
- **Server:**
  - Akses **cPanel Terminal** (fitur Terminal bawaan di cPanel).
  - Fitur **Setup Node.js App** (CloudLinux NodeJS Selector / Phusion Passenger).
  - Akses **File Manager** cPanel.
- **Domain:**
  - Frontend: `ruang-tenang.my.id` (A Record / CNAME telah mengarah ke IP hosting dan SSL aktif).
  - Backend API: `api.ruang-tenang.my.id` (telah aktif dan siap menerima request).

---

## 1. Environment Variable Produksi di Lokal (Krusial)

> [!IMPORTANT]
> **Mengapa ini harus dilakukan sebelum proses build di lokal?**
> Pada Next.js, semua variabel lingkungan yang diawali **`NEXT_PUBLIC_*`** di-inline (*baked in*) langsung ke dalam berkas JavaScript statis browser dan konfigurasi `server.js` (`remotePatterns` gambar dan `rewrites`) pada saat proses **BUILD-TIME di komputer lokal**, bukan di runtime server cPanel.
> Jika Anda melakukan build tanpa variabel ini, aplikasi yang terpasang di cPanel akan tetap mencoba menghubungi `http://localhost:8080` (komputer milik pengunjung), bukan server API Anda.

Pastikan file `.env.production` di root folder proyek lokal (`ruang-tenang-web/.env.production`) berisi:

```env
# URL API Backend Produksi
NEXT_PUBLIC_API_BASE_URL=https://api.ruang-tenang.my.id/api/v1
NEXT_PUBLIC_APP_TIMEZONE=Asia/Jakarta

# Domain Gambar yang Diizinkan (Next Image remotePatterns)
NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS=ruang-tenang.my.id,api.ruang-tenang.my.id

# Lingkungan Duitku Payment Gateway (sandbox / production)
NEXT_PUBLIC_DUITKU_ENV=sandbox

# Mode Node.js
NODE_ENV=production
```

> [!WARNING]
> **`.env.local` MENIMPA `.env.production`.**
> Next.js memuat `.env.local` dengan prioritas lebih tinggi daripada `.env.production` pada semua environment (kecuali `test`). Jika `.env.local` masih memuat `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1`, nilai itulah yang akan tertanam ke bundle meskipun `.env.production` sudah benar.
> Script `scripts/deploy_cpanel.sh` otomatis memindahkan `.env.local` sementara saat build lalu mengembalikannya. Jika Anda membangun secara manual, pinggirkan `.env.local` terlebih dahulu.

> [!NOTE]
> File konfigurasi bawaan proyek adalah [`next.config.ts`](file:///home/alfiang/Projects/ruang-tenang/ruang-tenang-web/next.config.ts). Pengaturan `output: "standalone"`, PWA (`@serwist/next`), dan Image Optimization **sudah terkonfigurasi secara lengkap**. Anda **tidak perlu** membuat atau menimpa dengan `next.config.js` baru.

---

## 2. Build & Rakit Bundle (Diotomasi)

Jalankan perintah berikut dari root folder `ruang-tenang-web` pada komputer lokal:

```bash
make deploy-cpanel
```

> Target ini memanggil `scripts/deploy_cpanel.sh`. Menjalankan `bash scripts/deploy_cpanel.sh` secara langsung juga sama. Untuk menghapus artefak hasil rakitan, gunakan `make deploy-clean`.

Script akan menjalankan seluruh rangkaian berikut secara berurutan:

1. **Preflight** — memastikan `node`, `npm`, `zip`, `node_modules`, dan `.env.production` tersedia.
2. **Validasi `.env.production`** — menggagalkan proses bila `NEXT_PUBLIC_API_BASE_URL` masih `localhost` atau `NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS` tidak memuat `api.ruang-tenang.my.id`.
3. **Build** — memindahkan `.env.local` sementara (dan mengembalikannya lewat trap, termasuk bila gagal), lalu menjalankan `npm run build`.
4. **Verifikasi env tertanam** — memastikan bundle JS memuat `api.ruang-tenang.my.id`, bukan `localhost`.
5. **Rakit bundle** — menggabungkan `.next/standalone` + `public` + **`.next/static`**.
6. **Zip** — menghasilkan arsip siap upload.

### Hasil

```text
ruang-tenang-web/
├── upload-web/                <-- isi siap upload (di-ignore git)
└── upload-web.zip             <-- arsip siap upload (di-ignore git)
```

> [!NOTE]
> Script ini dapat dijalankan berkali-kali. Folder `upload-web/` dan `upload-web.zip` selalu dibuat ulang dari nol.

---

### 📦 Struktur Berkas yang Benar di Dalam `upload-web.zip`

```text
upload-web.zip
└── ruang-tenang-web/            <-- Folder utama (Application Root saat diextract)
    ├── .next/
    │   ├── server/              <-- Bawaan dari standalone (.next/server)
    │   ├── static/              <-- Disalin dari root .next/static (WAJIB)
    │   ├── BUILD_ID
    │   ├── routes-manifest.json
    │   ├── prerender-manifest.json
    │   ├── app-build-manifest.json
    │   └── required-server-files.json
    ├── node_modules/            <-- Bawaan dari standalone (JANGAN DIHAPUS!)
    ├── public/                  <-- Disalin dari root public/ (termasuk sw.js)
    ├── package.json             <-- Bawaan dari standalone
    └── server.js                <-- Bawaan dari standalone
```

> [!NOTE]
> Next.js standalone kadang menyalin `.env.production` ke output. Script otomatis menghapus berkas `.env*` dari bundle; server tetap memakai `.env` yang Anda buat manual di `~/ruang-tenang-web/.env`.

> [!WARNING]
> **`.next/static/` tidak disertakan otomatis oleh Next.js Standalone.**
> Folder `.next/standalone/.next/` memang tidak memiliki `static/`. Jika folder `.next/static/` tidak ikut disalin ke bundle, seluruh aset (`*.css`, `*.js`, `*.woff2`) akan mengembalikan **404 Not Found**. Script `deploy_cpanel.sh` menangani hal ini.

> [!WARNING]
> **JANGAN HAPUS folder `node_modules/` bawaan standalone!**
> Folder `node_modules` di dalam `.next/standalone/` berukuran kecil (~50MB) dan hanya memuat library yang dibutuhkan saat aplikasi berjalan. Jangan menghapusnya, karena jika dihapus server tidak akan dapat menyala.

---

## 3. Konfigurasi Node.js App di cPanel

1. Login ke **cPanel** -> Buka menu **Setup Node.js App**.
2. Klik tombol **Create Application**:
   - **Node.js Version:** Pilih versi LTS (misal `20.x` atau `22.x`).
   - **Application Mode:** `Production`.
   - **Application Root:** `ruang-tenang-web` (folder di root home user cPanel).
   - **Application URL:** Pilih domain `ruang-tenang.my.id`.
   - **Application Startup File:** `server.js`
3. Klik tombol **Create** / **Save**.
4. Salin perintah aktivasi *Virtual Environment* yang ditampilkan di bagian atas halaman.
   *Contoh:*
   ```bash
   source /home/username/nodevenv/ruang-tenang-web/20/bin/activate && cd /home/username/ruang-tenang-web
   ```

---

## 4. Unggah & Ekstrak File di Server

1. Buka **File Manager** cPanel -> Masuk ke direktori **home** (`/home/username/`).
2. Jika `~/ruang-tenang-web/` sudah ada dan berisi berkas lama atau `node_modules` sisa konfigurasi cPanel, bersihkan isinya terlebih dahulu.
3. Unggah file `upload-web.zip` ke direktori home (`/home/username/`).
4. Klik kanan pada file `upload-web.zip` -> pilih **Extract**. Akan terbentuk folder `ruang-tenang-web/` yang berisi seluruh aplikasi (extract akan merge bila folder tersebut sudah ada).
5. Buat file `.env` di dalam `~/ruang-tenang-web/.env` untuk runtime server:
   ```env
   NODE_ENV=production
   PORT=3000
   NEXT_TELEMETRY_DISABLED=1
   ```

---

## 5. Persiapan Cache & Izin via cPanel Terminal

1. Buka menu **Terminal** di cPanel.
2. Jalankan perintah aktivasi environment yang disalin pada Langkah 3:
   ```bash
   source /home/username/nodevenv/ruang-tenang-web/20/bin/activate && cd /home/username/ruang-tenang-web
   ```
3. Buat direktori cache Next.js dan berikan izin tulis (*writable*):
   ```bash
   mkdir -p .next/cache
   chmod -R 775 .next/cache
   ```

> [!TIP]
> **TIDAK PERLU MENJALANKAN `npm install` DI CPANEL!**
> Karena Anda menggunakan bundle *Standalone*, seluruh dependensi runtime yang dibutuhkan sudah tersedia di dalam folder `node_modules/`. Menjalankan `npm install` di shared hosting berisiko tinggi memicu error *Out of Memory (OOM / Killed)* karena keterbatasan RAM server.

4. (Opsional) Uji coba jalankan server sejenak untuk memastikan tidak ada file yang hilang:
   ```bash
   node server.js
   ```
   Jika muncul output `▲ Next.js` dan port server siap mendengarkan, tekan **`Ctrl + C`** untuk keluar dari pengujian.

---

## 6. Menjalankan & Memverifikasi Aplikasi

1. Kembali ke **cPanel** -> **Setup Node.js App**.
2. Pada baris aplikasi `ruang-tenang.my.id`, klik tombol **RESTART**.
3. Buka browser dan akses domain Anda:
   ```text
   https://ruang-tenang.my.id
   ```
4. Buka **Developer Tools (F12) -> Console & Network**:
   - Pastikan tidak ada lagi error `404` pada berkas `/_next/static/...` (`.css`, `.js`, `.woff2`).
   - Pastikan request API mengarah ke `https://api.ruang-tenang.my.id/api/v1` (bukan ke `localhost:8080`).
   - Pastikan gambar avatar, badge, dan ilustrasi muncul tanpa error 400 / 404.
   - Periksa tab **Application -> Service Workers** untuk memastikan PWA Service Worker (`sw.js`) terdaftar dengan status *Activated*.

---

## 🛠️ Troubleshooting Cepat

- **Semua aset `/_next/static/...` mengembalikan 404:**
  - Penyebab paling umum: folder `.next/static/` tidak ikut ter-extract ke `~/ruang-tenang-web/.next/static/`.
  - Solusi: jalankan ulang `make deploy-cpanel` di lokal, unggah `upload-web.zip` baru, extract ulang, lalu **RESTART**.
  - Verifikasi di server: `ls ~/ruang-tenang-web/.next/static` harus menampilkan `chunks/`, `css/`, `media/`.

- **Error `503 Service Unavailable`:**
  - Buka File Manager cPanel dan periksa berkas `~/ruang-tenang-web/stderr.log`.
  - Pastikan **Application Startup File** di cPanel diset ke `server.js` (bukan `app.js` atau kosong).
  - Pastikan struktur berkas `.next/` memiliki subfolder `server/` dan file `routes-manifest.json`.

- **Panggilan API Tetap Mengarah ke `localhost:8080`:**
  - Ini terjadi karena saat `npm run build`, file `.env.production` belum benar **atau** `.env.local` masih menimpanya.
  - Solusi: perbaiki `.env.production`, pinggirkan `.env.local`, lalu jalankan ulang `make deploy-cpanel`. Script akan menolak hasil build yang masih memuat `localhost`.

- **Gambar `next/image` Mengalami Error (Invalid src prop):**
  - Pastikan domain gambar backend telah didaftarkan pada variabel `NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS` sebelum build di lokal:
    ```env
    NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS=ruang-tenang.my.id,api.ruang-tenang.my.id
    ```
  - Script `deploy_cpanel.sh` memvalidasi hal ini sebelum build.

- **PWA Service Worker Menampilkan Error `no-response`:**
  - Pastikan file `public/sw.js` ikut tersalin ke folder `~/ruang-tenang-web/public/sw.js` di server.

- **Server Crash / Out of Memory (OOM):**
  - Pastikan Anda **TIDAK** menjalankan `npm install` di cPanel Terminal. Cukup gunakan folder `node_modules` bawaan dari `.next/standalone/`.
