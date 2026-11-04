# SMART-SDLP

Sistem Informasi Manajemen Anggaran, Evaluasi, dan Pelaporan Kegiatan untuk **BRMP SDLP**. Aplikasi ini memfasilitasi pemantauan realisasi anggaran (APBN & Non-APBN), progres fisik kegiatan, kepatuhan pelaporan bulanan Penanggung Jawab (PJ), manajemen arsip dokumen, serta rekapitulasi dan audit log secara terpusat.

---

## Teknologi Utama

- **Framework:** Next.js 16.3.3 (App Router)
- **Runtime & Package Manager:** Node.js (`^20.19 || ^22.12 || >=24`) & `npm`
- **Database:** MySQL 8.0 / MariaDB 11 (Collation: `utf8mb4_unicode_ci` atau `utf8mb4_general_ci`)
- **ORM:** Prisma 7.10 (`@prisma/client` & `@prisma/adapter-mariadb`)
- **Autentikasi:** Better Auth (`prismaAdapter` dengan provider `mysql`)
- **Testing & Eksekusi Skrip:** `tsx`

---

## Prasyarat Sistem

1. **Node.js** versi **22.12+** atau **24** (direkomendasikan)
2. **npm** (bawaan Node.js)
3. **MySQL 8.0+** atau **MariaDB 11+** (dapat dijalankan melalui instalasi lokal maupun Docker)

---

## Konfigurasi Lingkungan (`.env`)

Salin berkas `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Sesuaikan nilai variabel di dalam `.env`:

```env
# Koneksi Database MySQL / MariaDB
# Catatan: Jika password mengandung karakter khusus, wajib di-URL-encode
DATABASE_URL="mysql://USER:PASSWORD@127.0.0.1:3306/smartsdlp"

# Konfigurasi Better Auth
BETTER_AUTH_SECRET="ganti-dengan-secret-acak-minimal-32-karakter"
BETTER_AUTH_URL="http://localhost:3000"

NEXT_PUBLIC_AUTH_URL="http://localhost:3000"

# Konfigurasi Email (SMTP / Mailer) & Google Drive (opsional sesuai kebutuhan fitur)
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM=""
```

---

## Instalasi & Menjalankan di Lokal

1. **Pasang dependensi (sesuai versi terkunci di `package-lock.json`):**

   ```bash
   npm ci
   ```

   _(Atau gunakan `npm install` saat pengembangan awal)._

2. **Generate Prisma Client:**

   ```bash
   npm run db:generate
   ```

   > **Catatan Penting:** Perintah `prisma generate` menghapus berkas manual `src/generated/prisma/index.ts` (`export * from "./client"`). Setelah menjalankan generate, selalu pulihkan berkas tersebut dengan perintah:
   >
   > ```bash
   > git checkout -- src/generated/prisma/index.ts
   > ```

3. **Jalankan Migrasi Database:**
   - Untuk lingkungan pengembangan (membuat dan menerapkan migrasi di database lokal):
     ```bash
     npm run db:migrate:dev
     ```
   - Untuk lingkungan produksi atau database dengan hak akses pengguna terbatas (tanpa hak `CREATE DATABASE`):
     ```bash
     npm run db:migrate
     ```

4. **Buat Akun Admin Pertama (Bootstrap Admin):**
   Jalankan skrip bootstrap dengan menyertakan variabel `BOOTSTRAP_ADMIN_EMAIL` dan `BOOTSTRAP_ADMIN_PASSWORD` (**wajib minimal 12 karakter**):
   - **Linux / macOS / Git Bash:**
     ```bash
     BOOTSTRAP_ADMIN_EMAIL="admin@instansi.go.id" BOOTSTRAP_ADMIN_PASSWORD="PasswordAdminMinimal12Karakter!" npx tsx prisma/bootstrap-admin.ts
     ```
   - **Windows PowerShell:**
     ```powershell
     $env:BOOTSTRAP_ADMIN_EMAIL="admin@instansi.go.id"
     $env:BOOTSTRAP_ADMIN_PASSWORD="PasswordAdminMinimal12Karakter!"
     npx tsx prisma/bootstrap-admin.ts
     ```

5. **Jalankan Server Pengembangan:**
   ```bash
   npm run dev
   ```
   Aplikasi dapat diakses di `http://localhost:3000`.

---

## Daftar Skrip (`package.json`)

| Perintah                 | Deskripsi                                                           |
| :----------------------- | :------------------------------------------------------------------ |
| `npm run dev`            | Menjalankan server pengembangan Next.js                             |
| `npm run build`          | Mem-build aplikasi untuk mode produksi                              |
| `npm start`              | Menjalankan server produksi hasil build                             |
| `npm run db:generate`    | Menjalankan `prisma generate`                                       |
| `npm run db:migrate`     | Menerapkan migrasi pada database target (`prisma migrate deploy`)   |
| `npm run db:migrate:dev` | Membuat dan menerapkan migrasi di lokal (`prisma migrate dev`)      |
| `npm run db:studio`      | Membuka antarmuka Prisma Studio (`prisma studio`)                   |
| `npm test`               | Menjalankan seluruh berkas pengujian (`node scripts/run-tests.mjs`) |
| `npx tsc --noEmit`       | Memeriksa tipe TypeScript tanpa menghasilkan berkas keluaran        |
| `npx eslint src`         | Memeriksa kualitas kode menggunakan ESLint                          |

---

## Pengujian Lokal Mode Produksi

Untuk meniru lingkungan server produksi (seperti di Hostinger) pada mesin lokal:

1. Pastikan database MySQL 8.0 (misal di port `3306`) atau MariaDB 11 (misal di port `3307`) sudah berjalan dan memiliki skema terbaru dari `npx prisma migrate deploy`.
2. Pastikan akun admin pertama telah dibuat melalui `prisma/bootstrap-admin.ts`.
3. Jalankan rangkaian perintah produksi berikut:
   ```bash
   npm ci
   npm run build
   npm start
   ```
4. Jalankan verifikasi tipe dan unit test:
   ```bash
   npx tsc --noEmit
   npx eslint src
   npm test
   ```

---

## Panduan Deployment ke Hostinger (Business Web Hosting)

Aplikasi ini dirancang untuk berjalan di **Hostinger Business Web Hosting** menggunakan fitur **Node.js Web App** pada **hPanel**. Panduan teknis langkah demi langkah secara lengkap tersedia di berkas [`docs/DEPLOY_HOSTINGER.md`](docs/DEPLOY_HOSTINGER.md).

### Ringkasan Konfigurasi di hPanel

1. **Pengaturan Aplikasi Node.js:**
   - **Node.js Version:** Pilih versi **22** atau **24**.
   - **Deployment Method:** Hubungkan dengan repositori GitHub dan pilih branch rilis yang digunakan.
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Environment Variables:** Masukkan seluruh variabel yang tertera pada `.env.example` ke pengaturan Environment Variables di hPanel.

2. **Pengaturan Database MySQL:**
   - Buat database MySQL dan pengguna baru melalui menu Databases di hPanel, lalu atur nilai `DATABASE_URL`.
   - Pastikan collation database menggunakan `utf8mb4_unicode_ci` atau `utf8mb4_general_ci` (jangan gunakan `_bin` agar pencarian teks tetap _case-insensitive_).

3. **Inisialisasi Skema & Admin Pertama:**
   - **Jalur A (Jika paket memiliki akses SSH):**
     Jalankan `npx prisma migrate deploy` untuk membuat tabel, lalu jalankan `npx tsx prisma/bootstrap-admin.ts` dengan variabel `BOOTSTRAP_ADMIN_EMAIL` dan `BOOTSTRAP_ADMIN_PASSWORD`.
   - **Jalur B (Jika tanpa akses SSH):**
     Impor berkas `migration.sql` yang berada di `prisma/migrations/<nama_migrasi_init>/migration.sql` secara langsung melalui **phpMyAdmin**. Untuk membuat admin pertama, aktifkan sementara fitur **Remote MySQL** di hPanel untuk IP komputer lokal pengembang, arahkan `DATABASE_URL` lokal ke server Hostinger, jalankan `npx tsx prisma/bootstrap-admin.ts`, lalu cabut kembali akses IP tersebut.
     _(Catatan: Jika skema dibuat melalui impor manual phpMyAdmin dan di kemudian hari ingin menjalankan `prisma migrate deploy`, jalankan terlebih dahulu `npx prisma migrate resolve --applied <nama_migrasi_init>`)._
