# SMART-SDLP

**SMART-SDLP** adalah Sistem Informasi Manajemen Anggaran, Evaluasi, dan Pelaporan Kegiatan untuk **BRMP SDLP**.

Aplikasi ini dikembangkan untuk mendukung pengelolaan kegiatan dan administrasi secara terpusat, mulai dari pemantauan realisasi anggaran, progres fisik kegiatan, pelaporan bulanan Penanggung Jawab (PJ), pengelolaan arsip dokumen, hingga rekapitulasi dan pencatatan aktivitas sistem.

## Fitur Utama

- **Dashboard** — Menyajikan informasi dan ringkasan kegiatan untuk mendukung pemantauan pelaksanaan kegiatan.
- **Manajemen Kegiatan** — Mengelola data master dan informasi kegiatan yang menjadi dasar pencatatan serta pelaporan.
- **Pelaporan Kegiatan** — Memfasilitasi pencatatan dan pemantauan progres fisik serta realisasi anggaran APBN dan Non-APBN.
- **Manajemen Pengguna** — Mengelola akun dan peran pengguna sesuai kewenangannya.
- **Arsip SP2D** — Mendukung pengelolaan arsip dokumen terkait SP2D.
- **Repositori Dokumen** — Menyimpan dan mengelola dokumen pendukung kegiatan dengan integrasi Google Drive.
- **Cetak dan Rekapitulasi** — Menyediakan fungsi pencetakan laporan dan rekapitulasi informasi kegiatan.
- **Audit Log** — Mencatat aktivitas tertentu dalam sistem untuk mendukung penelusuran dan pemantauan administrasi.
- **Autentikasi dan Keamanan Akun** — Mengelola proses login, sesi pengguna, dan perubahan kata sandi.

## Peran Pengguna

SMART-SDLP menerapkan pemisahan akses berdasarkan peran pengguna.

### Admin

Admin memiliki akses ke fungsi administrasi, antara lain pengelolaan pengguna, data master, kegiatan, arsip dokumen, laporan, dan audit log sesuai implementasi aplikasi.

### Penanggung Jawab (PJ)

PJ menggunakan aplikasi untuk mengakses fungsi yang berkaitan dengan kegiatan dan pelaporan sesuai kewenangan akun masing-masing.

## Teknologi yang Digunakan

| Teknologi                                     | Kegunaan                                     |
| --------------------------------------------- | -------------------------------------------- |
| [Next.js](https://nextjs.org/) 16.3.3         | Framework aplikasi web dengan App Router     |
| [React](https://react.dev/)                   | Pembangunan antarmuka pengguna               |
| [TypeScript](https://www.typescriptlang.org/) | Pengetikan statis untuk JavaScript           |
| [Prisma](https://www.prisma.io/) 7.10         | ORM untuk akses dan pengelolaan database     |
| MySQL / MariaDB                               | Penyimpanan data aplikasi                    |
| [Better Auth](https://www.better-auth.com/)   | Autentikasi dan pengelolaan sesi pengguna    |
| Google Drive API                              | Integrasi pengelolaan dokumen                |
| SMTP                                          | Pengiriman email sesuai konfigurasi aplikasi |
| [ExcelJS](https://github.com/exceljs/exceljs) | Pengolahan file spreadsheet                  |
| [tsx](https://github.com/privatenumber/tsx)   | Eksekusi skrip TypeScript                    |

Versi dependensi yang sebenarnya mengikuti konfigurasi pada `package.json` dan `package-lock.json`.

## Struktur Project

Berikut gambaran umum struktur utama repository:

```text
smartsdlp/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── bootstrap-admin.ts
├── public/
├── scripts/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   ├── api/
│   │   ├── account/
│   │   └── ...
│   ├── features/
│   ├── components/
│   ├── lib/
│   └── generated/
├── package.json
├── package-lock.json
├── next.config.ts
├── tsconfig.json
└── README.md
```

Keterangan:

- `prisma/` — Schema database, migrasi, dan skrip inisialisasi admin.
- `src/app/` — Halaman, layout, dan routing aplikasi Next.js.
- `src/features/` — Modul fitur dan logika aplikasi yang dikelompokkan berdasarkan fungsinya.
- `src/components/` — Komponen antarmuka yang digunakan di berbagai bagian aplikasi.
- `src/lib/` — Konfigurasi serta fungsi pendukung, termasuk database, autentikasi, dan integrasi layanan.
- `src/generated/` — Kode hasil generate Prisma yang digunakan aplikasi.
- `scripts/` — Skrip pendukung, termasuk eksekusi pengujian.

Struktur di atas merupakan gambaran konseptual. Untuk detail file dan direktori terbaru, lihat isi repository secara langsung.

## Prasyarat

Sebelum menjalankan aplikasi secara lokal, siapkan:

- Node.js versi `22.12+` atau versi lain yang didukung oleh konfigurasi project.
- npm.
- MySQL 8.0+ atau MariaDB 11+.
- Environment variables yang diperlukan aplikasi.
- Git untuk mengambil repository.

## Menjalankan Aplikasi Secara Lokal

### 1. Clone repository

```bash
git clone https://github.com/brmpsdlp-code/smartsdlp.git
cd smartsdlp
```

### 2. Instal dependensi

```bash
npm ci
```

### 3. Konfigurasi environment

Buat file `.env` pada root project dan isi variabel sesuai kebutuhan aplikasi serta lingkungan pengembangan.

Variabel yang perlu diperiksa meliputi:

- `DATABASE_URL` — Koneksi ke database MySQL atau MariaDB.
- `BETTER_AUTH_SECRET` — Secret untuk konfigurasi autentikasi.
- `BETTER_AUTH_URL` — URL aplikasi untuk autentikasi.
- `NEXT_PUBLIC_AUTH_URL` — URL autentikasi yang digunakan pada sisi klien.
- Konfigurasi SMTP untuk fitur email.
- Kredensial dan konfigurasi Google Drive sesuai integrasi yang digunakan.

Gunakan nilai yang berbeda untuk lingkungan development dan production. Jangan commit file `.env`, password, API key, atau secret ke repository.

### 4. Generate Prisma Client

```bash
npm run db:generate
```

Perhatikan konfigurasi dan instruksi terkait berkas hasil generate Prisma pada repository sebelum menjalankan perintah ini.

### 5. Siapkan database

Untuk membuat dan menerapkan migrasi pada lingkungan pengembangan:

```bash
npm run db:migrate:dev
```

Untuk menerapkan migrasi yang sudah tersedia pada database target:

```bash
npm run db:migrate
```

Pastikan `DATABASE_URL` mengarah ke database yang benar sebelum menjalankan migrasi.

### 6. Buat akun admin pertama

Project menyediakan skrip `prisma/bootstrap-admin.ts` untuk inisialisasi akun admin.

Jalankan dari root repository menggunakan environment variables `BOOTSTRAP_ADMIN_EMAIL` dan `BOOTSTRAP_ADMIN_PASSWORD` sesuai kebutuhan skrip.

Contoh di PowerShell:

```powershell
$env:BOOTSTRAP_ADMIN_EMAIL="admin@instansi.go.id"
$env:BOOTSTRAP_ADMIN_PASSWORD="GantiDenganPasswordYangKuat!"
npx tsx prisma/bootstrap-admin.ts
```

Gunakan password yang kuat, dan jangan menggunakan kredensial contoh ini sebagai password produksi.

### 7. Jalankan server development

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) pada browser.

## Perintah yang Tersedia

| Perintah                 | Kegunaan                                   |
| ------------------------ | ------------------------------------------ |
| `npm run dev`            | Menjalankan server development             |
| `npm run build`          | Membuat build aplikasi untuk produksi      |
| `npm start`              | Menjalankan aplikasi hasil build produksi  |
| `npm run db:generate`    | Generate Prisma Client                     |
| `npm run db:migrate:dev` | Membuat dan menerapkan migrasi development |
| `npm run db:migrate`     | Menerapkan migrasi database yang tersedia  |
| `npm run db:studio`      | Membuka Prisma Studio                      |
| `npm test`               | Menjalankan skrip pengujian project        |
| `npx tsc --noEmit`       | Memeriksa tipe TypeScript                  |
| `npx eslint src`         | Memeriksa kode menggunakan ESLint          |

Perintah-perintah tersebut mengikuti skrip yang didokumentasikan pada konfigurasi project; detail pelaksanaannya dapat diperiksa di `package.json`.

## Pemeriksaan Sebelum Rilis

Sebelum aplikasi dipublikasikan ke lingkungan produksi, jalankan pemeriksaan berikut:

```bash
npx tsc --noEmit
npx eslint src
npm test
npm run build
```

Pastikan setiap perintah selesai tanpa error. Jika ada kegagalan, periksa pesan yang muncul dan perbaiki penyebabnya sebelum melanjutkan deployment.

Setelah aplikasi berhasil dijalankan di server, lakukan pengujian kembali terhadap login, otorisasi Admin dan PJ, akses database, pelaporan, serta pengelolaan dokumen.

## Deployment

SMART-SDLP menggunakan Next.js dan dapat dipersiapkan untuk deployment pada lingkungan hosting yang mendukung aplikasi Node.js.

Untuk deployment produksi, pastikan:

- Versi Node.js sesuai dengan kebutuhan project dan dukungan penyedia hosting.
- Environment variables telah dikonfigurasi pada lingkungan produksi.
- Database produksi telah disiapkan dan skemanya sesuai dengan migrasi.
- Perintah build dan start berjalan dengan benar.
- Integrasi Google Drive dan SMTP telah dikonfigurasi menggunakan kredensial yang sesuai.

Panduan deployment yang lebih spesifik sebaiknya ditempatkan pada dokumentasi terpisah agar README utama tetap berfokus pada pengenalan dan penggunaan project.

## Catatan

SMART-SDLP dikembangkan untuk mendukung proses administrasi, pemantauan, dan pelaporan kegiatan di BRMP SDLP. Fitur yang dapat digunakan setiap akun bergantung pada peran, hak akses, serta konfigurasi aplikasi.

---

**SMART-SDLP — Sistem Informasi Manajemen Anggaran, Evaluasi, dan Pelaporan Kegiatan BRMP SDLP.**
