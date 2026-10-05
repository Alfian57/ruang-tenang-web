# Dokumentasi Deployment Next.js (`ruang-tenang-web`) ke Shared Hosting (cPanel)

Dokumen ini berisi panduan langkah demi langkah untuk melakukan deployment proyek frontend **ruang-tenang-web** (Next.js 15 Standalone Mode) ke shared hosting cPanel menggunakan fitur **Setup Node.js App (Phusion Passenger)** dan **cPanel Terminal**.

---

## 📋 Prasyarat Lingkungan

- **Lokal:** 
  - Node.js (v18.18+ atau v20.x LTS disarankan), npm / bun / pnpm, Git.
- **Server:** 
  - Akses **cPanel Terminal** (fitur Terminal bawaan di cPanel).
  - Fitur **Setup Node.js App** (CloudLinux NodeJS Selector / Phusion Passenger).
  - Akses **File Manager** cPanel.
- **Domain:** 
  - Frontend: `ruang-tenang.my.id` (A Record / CNAME telah mengarah ke IP hosting dan SSL aktif).
  - Backend API: `api.ruang-tenang.my.id` (telah aktif dan siap menerima request).

---

## 1. Siapkan Environment Variable Produksi di Lokal (Krusial)

> [!IMPORTANT]
> **Mengapa ini harus dilakukan sebelum proses build di lokal?**  
> Pada Next.js, semua variabel lingkungan yang diawali dengan **`NEXT_PUBLIC_*`** di-inline (*baked in*) langsung ke dalam berkas JavaScript statis browser dan konfigurasi `server.js` (`remotePatterns` gambar dan `rewrites`) pada saat proses **BUILD-TIME di komputer lokal**, bukan di runtime server cPanel!  
> Jika Anda melakukan build tanpa variabel ini, aplikasi yang terpasang di cPanel akan tetap mencoba menghubungi `http://localhost:8080` (komputer milik pengunjung), bukan server API Anda.

Buat atau sesuaikan file `.env.production` di root folder proyek lokal (`ruang-tenang-web/.env.production`):

```env
# URL API Backend Produksi
NEXT_PUBLIC_API_BASE_URL=https://api.ruang-tenang.my.id/api/v1
NEXT_PUBLIC_APP_TIMEZONE=Asia/Jakarta

# Domain Gambar yang Diizinkan (Next Image remotePatterns)
NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS=api.ruang-tenang.my.id,ruang-tenang.my.id

# Lingkungan Duitku Payment Gateway (sandbox / production)
NEXT_PUBLIC_DUITKU_ENV=production

# Mode Node.js
NODE_ENV=production
```

> [!NOTE]
> File konfigurasi bawaan proyek adalah [`next.config.ts`](file:///home/alfiang/Projects/ruang-tenang/ruang-tenang-web/next.config.ts). Pengaturan `output: "standalone"`, PWA (`@serwist/next`), dan Image Optimization **sudah terkonfigurasi secara lengkap**. Anda **tidak perlu** membuat atau menimpa dengan `next.config.js` baru.

---

## 2. Build Proyek di Komputer Lokal

Buka terminal di root folder `ruang-tenang-web` pada komputer lokal Anda, lalu jalankan perintah build:

### Menggunakan npm:
```bash
npm run build
```

### Menggunakan bun:
```bash
bun run build
```

Proses build ini akan secara otomatis:
1. Menghasilkan biner aplikasi server mandiri di `.next/standalone/`.
2. Memaketkan dependensi runtime minimal ke dalam `.next/standalone/node_modules/`.
3. Men-generate berkas Service Worker PWA di `public/sw.js`.

---

## 3. Rakit Bundle Deployment (`upload-web`)

Next.js Standalone memerlukan berkas aset statis (`static/`) dan aset publik (`public/`) untuk digabungkan bersama biner server.

Lakukan langkah perakitan berikut di komputer lokal:

### Di Linux / macOS:
```bash
# 1. Buat folder sementara untuk bundling
mkdir -p upload-web

# 2. Salin seluruh isi standalone (termasuk server.js, package.json, dan node_modules bawaan)
cp -r .next/standalone/* upload-web/
cp -r .next/standalone/.next upload-web/

# 3. Salin folder public (termasuk sw.js) ke upload-web/
cp -r public upload-web/public

# 4. Salin folder .next/static ke dalam upload-web/.next/static
mkdir -p upload-web/.next/static
cp -r .next/static/* upload-web/.next/static/

# 5. Kompres seluruh isi folder upload-web menjadi upload-web.zip
cd upload-web
zip -r ../upload-web.zip .
cd ..
rm -rf upload-web
```

### Di Windows (PowerShell):
```powershell
# 1. Buat folder sementara
New-Item -ItemType Directory -Force -Path "upload-web"

# 2. Salin isi standalone
Copy-Item -Recurse -Force ".next\standalone\*" "upload-web\"
Copy-Item -Recurse -Force ".next\standalone\.next" "upload-web\"

# 3. Salin folder public
Copy-Item -Recurse -Force "public" "upload-web\public"

# 4. Salin folder .next/static
New-Item -ItemType Directory -Force -Path "upload-web\.next\static"
Copy-Item -Recurse -Force ".next\static\*" "upload-web\.next\static\"

# 5. Kompres menjadi upload-web.zip
Compress-Archive -Path "upload-web\*" -DestinationPath "upload-web.zip" -Force
Remove-Item -Recurse -Force "upload-web"
```

---

### 📦 Struktur Berkas yang Benar di Dalam `upload-web.zip`

Pastikan struktur berkas di dalam `upload-web.zip` tepat seperti berikut:

```text
upload-web.zip
├── .next/
│   ├── server/                  <-- Bawaan dari standalone (.next/server)
│   ├── static/                  <-- Disalin dari root .next/static
│   ├── BUILD_ID
│   ├── routes-manifest.json
│   ├── prerender-manifest.json
│   ├── app-build-manifest.json
│   └── required-server-files.json
├── node_modules/                <-- Bawaan dari standalone (JANGAN DIHAPUS!)
├── public/                      <-- Disalin dari root public/ (termasuk sw.js)
├── package.json                 <-- Bawaan dari standalone
└── server.js                    <-- Bawaan dari standalone
```

> [!WARNING]
> **JANGAN HAPUS folder `node_modules/` bawaan standalone!**  
> Folder `node_modules` di dalam `.next/standalone/` berukuran kecil (~50MB) dan hanya memuat library yang dibutuhkan saat aplikasi berjalan. Jangan menghapusnya, karena jika dihapus server tidak akan dapat menyala.

---

## 4. Konfigurasi Node.js App di cPanel

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

## 5. Unggah & Ekstrak File di Server

1. Buka **File Manager** cPanel -> Masuk ke direktori `~/ruang-tenang-web/`.
2. Jika ada berkas lama atau folder `node_modules` sisa konfigurasi cPanel, hapus terlebih dahulu agar bersih.
3. Unggah file `upload-web.zip` ke dalam direktori `~/ruang-tenang-web/`.
4. Klik kanan pada file `upload-web.zip` -> pilih **Extract** langsung di direktori `~/ruang-tenang-web/`.
5. Buat file `.env` di dalam `~/ruang-tenang-web/.env` untuk runtime server:
   ```env
   NODE_ENV=production
   PORT=3000
   NEXT_TELEMETRY_DISABLED=1
   ```

---

## 6. Persiapan Cache & Izin via cPanel Terminal

1. Buka menu **Terminal** di cPanel.
2. Jalankan perintah aktivasi environment yang disalin pada Langkah 4:
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

## 7. Menjalankan & Memverifikasi Aplikasi

1. Kembali ke **cPanel** -> **Setup Node.js App**.
2. Pada baris aplikasi `ruang-tenang.my.id`, klik tombol **RESTART**.
3. Buka browser dan akses domain Anda:
   ```text
   https://ruang-tenang.my.id
   ```
4. Buka **Developer Tools (F12) -> Console & Network**:
   - Pastikan request API mengarah ke `https://api.ruang-tenang.my.id/api/v1` (bukan ke `localhost:8080`).
   - Pastikan gambar avatar, badge, dan ilustrasi muncul tanpa error 400 / 404.
   - Periksa tab **Application -> Service Workers** untuk memastikan PWA Service Worker (`sw.js`) terdaftar dengan status *Activated*.

---

## 🛠️ Troubleshooting Cepat

- **Error `503 Service Unavailable`:**
  - Buka File Manager cPanel dan periksa berkas `~/ruang-tenang-web/stderr.log`.
  - Pastikan **Application Startup File** di cPanel diset ke `server.js` (bukan `app.js` atau kosong).
  - Pastikan struktur berkas `.next/` memiliki subfolder `server/` dan file `routes-manifest.json`.

- **Panggilan API Tetap Mengarah ke `localhost:8080`:**
  - Ini terjadi karena saat menjalankan `npm run build` di komputer lokal, file `.env.production` belum dibuat atau variabel `NEXT_PUBLIC_API_BASE_URL` belum terisi.
  - Solusi: Buat `.env.production` di lokal sesuai Langkah 1, jalankan ulang `npm run build`, kemas ulang `upload-web.zip`, dan unggah kembali ke server.

- **Gambar `next/image` Mengalami Error (Invalid src prop):**
  - Pastikan domain gambar backend telah didaftarkan pada variabel `NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS` sebelum build di lokal:
    ```env
    NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS=api.ruang-tenang.my.id,ruang-tenang.my.id
    ```

- **PWA Service Worker Menampilkan Error `no-response`:**
  - Pastikan file `public/sw.js` ikut tersalin ke folder `~/ruang-tenang-web/public/sw.js` di server.

- **Server Crash / Out of Memory (OOM):**
  - Pastikan Anda **TIDAK** menjalankan `npm install` di cPanel Terminal. Cukup gunakan folder `node_modules` bawaan dari `.next/standalone/`.