# HANDOFF: SMART BRMP SDLP

Dokumen serah terima untuk melanjutkan proyek selama sekitar 2 hari kerja. Ditulis agar bisa dibaca
manusia maupun AI agent. Letakkan di root repo. Perbarui bagian "Status" setiap selesai satu tugas.

## 0. Cara memakai dokumen ini

1. Baca bagian 1 sampai 5 sebelum mengubah apa pun.
2. Kerjakan tugas di bagian 6 **berurutan menurut prioritas**. Satu tugas = satu branch = satu commit
   atau lebih, jangan digabung.
3. Sebelum mengubah sebuah halaman, **baca kode saat ini**. Bagian "Kondisi sekarang" pada tiap tugas
   adalah ringkasan; isi aslinya yang berlaku.
4. Untuk setiap logika baru yang murni (hitungan, aturan, parsing), tulis sebagai fungsi di `src/utils/`
   dengan file `*.test.ts` di sampingnya. Halaman dan komponen hanya memanggilnya.
5. Bagian 7 berisi keputusan yang **hanya boleh diambil manusia**. Jangan putuskan sendiri; tanyakan.
6. Label status: `[TERUJI]` = sudah dijalankan dan terbukti. `[DARI KODE]` = hanya dibaca dari kode, belum
   dijalankan, jadi verifikasi dulu sebelum mengandalkannya.

## 1. Ringkasan proyek

Aplikasi monitoring realisasi anggaran dan kepatuhan laporan bulanan untuk BRMP SDLP (Kementan).

- **Peran**: `ADMIN` (kelola kegiatan, pengguna, arsip, dashboard, cetak) dan `USER` = PJ (penanggung jawab
  kegiatan, mengirim laporan bulanan).
- **Stack**: Next.js 16.3.3 (App Router, React Compiler), React 19, TypeScript, Tailwind 4 + shadcn,
  Prisma 7.10 + PostgreSQL, Better Auth 1.7.2, Nodemailer, ExcelJS, Google Drive API, Playwright (e2e).
  Package manager: **Bun 1.3.6**.
- **Arsitektur**: hampir semua logika bisnis ada di **server actions** (`src/features/*/actions.ts`).
  Satu-satunya API route adalah `/api/auth/*`. Halaman ada di `src/app/**`, komponen di `src/components`
  dan `src/features/*/components`. Logika murni yang bisa diuji ada di `src/utils`.
- **Pelindung akses**: layout `src/app/admin/layout.tsx` dan `src/app/(user)/layout.tsx` mengecek sesi dan
  peran. Setiap server action juga mengecek sendiri. `src/proxy.ts` hanya melindungi `/` dan `/login`.

### Model data penting (`prisma/schema.prisma`)

- `Kegiatan`: `kode` (unik global), `pagu` (BigInt), `tahunAnggaran` (Int, wajib), `statusAnggaran`
  (`DIBUKA`/`DIBLOKIR`), `wajib` (Boolean, ditetapkan admin), `pjId`, `programCategoryId`.
- `Laporan`: unik per `(kegiatanId, periodeBulan, periodeTahun)`.
- `ReportAccessOverride` dan `ReportAccessRequest`: admin membuka akses lapor setelah batas waktu.
- `AppSettings` (satu baris, `id = "global"`): `reportDeadlineDay`, `reportDeadlineTime`.
- `AuditLog`, `Dokumen`, `Notification`, `ProgramCategory` (wajib `sortOrder` dan `colorKey`).

## 2. Setup lokal (PowerShell atau bash)

```bash
bun install
# buat .env (lihat README / src/lib/auth.ts, mailer.ts, gdrive.ts untuk nama variabelnya).
# Minimal: DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL
bunx prisma generate
git checkout -- src/generated/prisma/index.ts     # generate menghapus file ini; pulihkan
bunx prisma migrate reset --force --skip-seed      # database DEV kosong + semua migration
# admin pertama (lihat README): set BOOTSTRAP_ADMIN_EMAIL dan BOOTSTRAP_ADMIN_PASSWORD, lalu
bun run prisma/bootstrap-admin.ts
bun dev
```

Setelah login admin, **buat kategori program dulu** (form kegiatan mewajibkannya).

**Jangan** memakai `prisma db push --force-reset`: menghapus seluruh data dan membuat `migrate deploy`
gagal dengan `P3005`. Untuk Neon, jalankan perintah migrasi dengan connection string **tanpa** `-pooler`.

## 3. Aturan bisnis yang SUDAH FINAL (jangan diubah tanpa izin)

1. **Tahun anggaran (TA).** Tiap kegiatan punya satu TA. Laporan hanya sah untuk periode di dalam TA
   kegiatannya **dan** periode yang sudah berjalan (WIB). Ditegakkan di server pada `submitLaporan`,
   `bukaAksesLapor`, `mintaAksesLapor`, dan `ingatkanPJ`. TA tidak boleh diubah bila kegiatan sudah punya
   laporan di tahun lain. `[TERUJI]`
2. **Kegiatan diblokir (`DIBLOKIR`).** PJ tidak boleh mengisi atau merevisi apa pun. Saat diblokir (lewat
   toggle atau form edit), akses lapor aktif dicabut otomatis dan permintaan akses `PENDING` ditolak
   (`src/lib/report-access-cleanup.ts`). Admin tidak bisa membuka akses atau mengirim pengingat untuk
   kegiatan diblokir. `[TERUJI]`
3. **Kewajiban lapor** = kegiatan `wajib` x bulan yang sudah berjalan. Bulan tanpa laporan pada kegiatan
   diblokir **tidak dihitung**. Bulan yang sudah ada laporannya tetap dihitung "sudah", walau kegiatan kini
   diblokir. Sistem **tidak menyimpan tanggal blokir**, hanya status saat ini. `[TERUJI]`
4. **Zona waktu WIB (UTC+7)** untuk setiap "sekarang", bulan, dan tahun. Jangan memakai
   `getMonth()`/`getFullYear()` zona server. Pakai `getWibYearMonth(nowMs)`.
5. **Arsip SP2D.** Tampilan bawaan "Per kegiatan" (satu baris per kegiatan, klik untuk riwayat bulan);
   "Daftar" = tabel kegiatan x periode. Filter Tahun (bawaan tahun berjalan, ada "Semua Tahun") dan Bulan
   (daftar tetap, nonaktif pada "Semua Tahun"). Pada "Semua Bulan", setiap bulan yang sudah berjalan pada
   TA kegiatan dan belum ada laporan tampil sebagai "Belum Upload". Tabel kosong menampilkan petunjuk
   tahun lain yang punya kegiatan. `[TERUJI]`
6. **Dashboard admin.** Semua angka dihitung hanya untuk kegiatan pada TA terpilih (bawaan tahun berjalan
   WIB) dan "posisi per bulan". Ada tab "Rekap Tahunan" (matriks kegiatan x 12 bulan). Target Kurva-S
   **linear** (asumsi, belum ada data rencana pencairan). `[TERUJI]`
7. `Kegiatan.kode` masih **unik global**. Memakai kode sama di tahun berbeda belum didukung (lihat 7).

## 4. Util yang sudah ada: PAKAI ULANG, jangan tulis ulang

| File | Fungsi utama |
|---|---|
| `src/utils/tahunAnggaran.ts` | `getWibYearMonth(nowMs)`, `buatOpsiPeriode(nowMs, ta)`, `isPeriodeSudahBerjalan(nowMs, bulan, tahun)`, `isPeriodeDalamTahunAnggaran`, `isTahunAnggaranValid`, `daftarTahunAnggaran`, `bisaUbahTahunAnggaran`, pesan-pesan galat |
| `src/utils/dashboardAdmin.ts` | `tentukanPeriodeDashboard(tahunParam, bulanParam, nowMs)` -> `{tahun, bulan, bulanTerbaru, belumDimulai}`, `opsiBulanDashboard`, `statusKepatuhan({diblokir, sudahLapor, periode, nowMs})`, `hitungKepatuhan`, `bangunBarData`, `bangunLineData` |
| `src/utils/rekapTahunan.ts` | `bangunRekapTahunan({kegiatan, laporan, tahun, bulanAcuan, nowMs, deadlineLewat})`, `formatJuta` |
| `src/utils/arsipFilter.ts` | `parseTahunScope`, `parseBulanParam`, `daftarTahunFilter`, `opsiBulanFilter`, `cocokPencarian`, `hitungPetunjukTahun`, `periodeVirtualUntukScope`, `kegiatanWajibLaporPada` |
| `src/utils/arsipGrup.ts` | `kelompokkanPerKegiatan`, `hitungRingkasan` |
| `src/utils/reportAggregation.ts` | `aggregateActivityReports(kegiatan, laporan, {month, year})` -> peta per kegiatan (`realLalu`, `realIni`, `sdPeriode`, `sudahLaporPeriode`) |
| `src/utils/reportAccess.ts` | `NAMA_BULAN`, `PESAN_KEGIATAN_DIBLOKIR`, `formatPeriodeLabel`, `getReminderMode`, `getAccessRequestState` |
| `src/utils/reportDeadline.ts` | `isReportDeadlinePassed(tahun, bulan, settings, now)`; pengaturan dari `getReportDeadline()` di `src/features/app-settings/actions.ts` |

Pola halaman server yang benar (contoh nyata: `src/app/admin/dashboard/page.tsx`): ambil data, hitung
`nowMs` dari `new Date()`, tentukan periode lewat util, filter kegiatan menurut TA, hitung lewat util,
kirim hasil sebagai props.

## 5. Status saat ini

- `main` memuat: tahun anggaran, aturan blokir, arsip (filter, Per kegiatan), dashboard admin per tahun, dan
  tab Rekap Tahunan.
- **Belum pernah dilihat di browser** oleh pembuat sebelumnya. Seluruh uji berupa data dan HTML hasil render.
  Verifikasi visual adalah pekerjaan nyata (tugas T5).
- **Uji integrasi database** (skrip `bun` dengan adapter `pg`) pernah dijalankan di luar repo dan **tidak ada
  di repo**. Yang ada di repo hanya unit test murni.
- Lint: baseline **11 masalah lama** (4 error, 7 warning) di file yang tidak berkaitan. Jangan menambah
  masalah baru di file yang Anda sentuh.

## 6. Tugas

Perkiraan waktu hanya taksiran, belum terukur.

### T1. Halaman Cetak per tahun anggaran (prioritas 1, sekitar 4-6 jam)
- **Berkas**: `src/app/admin/cetak/page.tsx` dan komponen cetaknya.
- **Peringatan**: berkas ini berisi byte **non-UTF-8**. Baca dengan dekode toleran (mis. Python
  `errors="replace"`) dan pastikan editor tidak merusak karakter saat menyimpan.
- **Kondisi sekarang** `[DARI KODE]`: tidak ada filter TA (nol kemunculan `tahunAnggaran`); semua kegiatan
  semua tahun ikut di setiap laporan; hanya opsi bulan dan semester; memakai `now.getMonth()` dan
  `now.getFullYear()` zona server.
- **Yang harus dilakukan**:
  1. Hanya kegiatan dengan `tahunAnggaran` = tahun terpilih yang ikut. Tambahkan pemilih tahun (daftar dari
     `daftarTahunFilter`).
  2. Tambahkan opsi **"Tahun penuh"**: Januari sampai bulan terakhir yang sudah berjalan (tahun berjalan)
     atau Januari sampai Desember (tahun lampau).
  3. Ganti waktu server dengan WIB (`getWibYearMonth`). Opsi bulan dan semester hanya untuk periode yang
     sudah berjalan.
  4. Kegiatan diblokir tanpa laporan tidak dihitung sebagai belum lapor (gunakan `statusKepatuhan`).
- **Kriteria selesai**: dengan kegiatan A (TA 2026, pagu 1 juta, laporan Okt 250 ribu) dan B (TA 2024,
  pagu 5 juta, laporan Mei 500 ribu), cetak Oktober 2026 hanya memuat A dengan total pagu 1 juta dan
  realisasi 250 ribu; cetak tahun 2024 hanya B. Total tahun penuh = jumlah realisasi seluruh bulan.
  Logika baru murni ada di `src/utils` dengan test.

### T2. Dashboard PJ per tahun anggaran (prioritas 2, sekitar 2-3 jam)
- **Berkas**: `src/app/(user)/dashboard/page.tsx` (baris 15-16 memakai `now.getMonth()` dan
  `now.getFullYear()`) dan komponen dashboard PJ.
- **Kondisi sekarang** `[DARI KODE]`: zona waktu server; `aggregateActivityReports` dijalankan atas semua
  kegiatan PJ lintas TA.
- **Yang harus dilakukan**: WIB; hitung hanya kegiatan TA terpilih (bawaan tahun berjalan); sediakan cara
  berpindah tahun bila PJ punya kegiatan di lebih dari satu TA; perlakuan kegiatan diblokir mengikuti
  bagian 3.
- **Kriteria selesai**: PJ dengan kegiatan di TA 2024 dan TA 2026 melihat angka tiap tahun terpisah;
  tidak ada angka tercampur; kegiatan diblokir ditandai dan tidak dihitung terlambat.

### T3. Manajemen Kegiatan: kepatuhan per tahun (prioritas 3, sekitar 2 jam)
- **Berkas**: `src/app/admin/master/page.tsx` (sekitar baris 121-123: `now = new Date()` dan
  `aggregateActivityReports` untuk bulan dan tahun server).
- **Kondisi sekarang** `[DARI KODE]`: hitungan `sudahLapor`/`belumLapor`/total wajib atas semua kegiatan
  semua tahun, memakai `wajib && sudahLapor`, tanpa pengecualian diblokir.
- **Yang harus dilakukan**: WIB; hitung kepatuhan hanya untuk kegiatan dengan TA = tahun berjalan; pakai
  `statusKepatuhan` dan `hitungKepatuhan` agar sama dengan dashboard admin. Tabel tetap menampilkan semua
  kegiatan (kolom TA sudah ada).
- **Kriteria selesai**: angka kepatuhan di halaman ini sama dengan kartu Kepatuhan di dashboard admin
  untuk tahun dan bulan yang sama.

### T4. Label tahun pada DistribusiPaguWidget (sekitar 15 menit)
- **Berkas**: `src/components/DistribusiPaguWidget.tsx` baris 73: `TA {new Date().getFullYear()}`.
- Label salah saat admin melihat tahun lain. Terima `tahun` lewat props dari `admin-dashboard.tsx`
  (`reportPeriod.year`).

### T5. Uji visual dan build (sekitar 2 jam)
Jalankan aplikasi dan periksa dengan mata, lalu catat temuan:
- Dashboard admin: ganti tahun dan bulan, buka keempat tab, klik sel di Rekap Tahunan, tombol alih isi
  sel, banner tahun kosong dan belum dimulai.
- Arsip: tombol Per kegiatan/Daftar, dropdown Bulan nonaktif pada Semua Tahun, petunjuk tahun pada tabel
  kosong, buka-tutup kegiatan, tombol Unduh/Hapus/Buka Akses/Ingatkan PJ/Cabut.
- Form PJ: pilih kegiatan beda tahun, kegiatan diblokir (terkunci), tahun yang belum dimulai.
- Manajemen Kegiatan: dropdown Tahun Anggaran; mengubah tahun pada kegiatan yang sudah punya laporan
  harus ditolak dengan pesan jelas.
- Layar sempit: header dashboard (dua dropdown) dan matriks 12 kolom.
- `bun run build` sampai selesai. Catatan: foto di `src/imports/nft/*.jpg` adalah pointer Git LFS bila repo
  di-clone tanpa LFS; jalankan `git lfs pull`.

### T6. Dokumentasi dan lingkungan (sekitar 2 jam)
- README menyebut `deploy/`, `docs/`, `.env.example`, `.env.production.example` yang **tidak ada** di repo.
- Penyebab `.env.example` hilang: baris `.env*` di akhir `.gitignore` mengalahkan `!.env.example`.
  Perbaiki urutannya, lalu buat kedua berkas contoh (tanpa nilai rahasia).
- README menulis "2 migration"; sebenarnya ada 6. README memakai `cd smart-sdlp-main`; nama repo `smart-sdlp`.
- Tulis ulang bagian instalasi sesuai bagian 2 dokumen ini. Dokumentasikan bahwa test dijalankan dengan
  `bun run <file>`.

### T7. Script `test` (sekitar 30 menit)
- `package.json` belum punya script `test`. Test unit **hanya jalan dengan `bun run <file>`** (memakai
  top-level await; `tsx` gagal). Buat satu script yang menjalankan semua `src/**/*.test.ts`.
- Beberapa test mengimpor modul yang membuat klien Prisma; set `DATABASE_URL` apa saja (tidak ada koneksi
  dibuat saat test).

### T8. Adapter database untuk produksi (sekitar 1-2 jam) **[butuh keputusan manusia, lihat 7]**
- `src/lib/prisma.ts` memakai `PrismaNeon`. README menyebut PostgreSQL lokal di VPS. `PrismaNeon`
  **belum terbukti** jalan di Postgres biasa. Adapter `@prisma/adapter-pg` terbukti jalan di uji lokal.
- Setelah keputusan: sesuaikan `prisma.ts` dan dependensi, dan dokumentasikan.

### T9. Runbook migrasi produksi (sekitar 1 jam)
Tulis di `docs/` (buat foldernya) langkah berurutan:
1. Cadangkan database.
2. Jalankan pengecek ini; hasil harus kosong (atau ditangani manual):
   ```sql
   SELECT k.kode, array_agg(DISTINCT l."periodeTahun") AS tahun_laporan
   FROM kegiatan k JOIN laporan l ON l."kegiatanId" = k.id
   GROUP BY k.id, k.kode
   HAVING count(DISTINCT l."periodeTahun") > 1;
   ```
3. `bunx prisma migrate deploy` dengan connection string langsung (tanpa `-pooler`).
4. Migration tahun anggaran mengisi `tahunAnggaran` dari tahun laporan terbaru, selain itu 2026.

### T10. Tiga hal keamanan **[butuh keputusan manusia, lihat 7]** `[DARI KODE]`
- `src/lib/auth.ts`: `trustedOrigins` memasukkan header `Origin` dari request itu sendiri, sehingga
  pengecekan origin praktis menerima apa pun.
- Unggahan Google Drive diberi izin "anyone with the link" (`src/lib/gdrive.ts` / `features/repositori`).
- Tidak ada batas ukuran atau jenis file pada upload, dan `kategori` tidak divalidasi.

### T11. Pembersihan kecil (sekitar 30 menit)
- Hapus `src/data/mockData.ts` (763 baris; tidak diimpor di mana pun, sudah dicek).
- Jalankan e2e Playwright (`e2e/`) dan catat mana yang gagal; jangan memperbaiki besar-besaran.

## 7. Keputusan yang hanya boleh diambil manusia (TANYAKAN)

1. **Target deploy produksi**: Neon atau PostgreSQL lokal di VPS? (menentukan T8)
2. **Keamanan (T10)**: perketat `trustedOrigins`? Apakah izin "anyone with the link" di Drive disengaja?
   Berapa batas ukuran dan jenis file yang diizinkan?
3. **`kode` kegiatan unik per tahun?** Bila ya, ubah unik global menjadi unik per `(kode, tahunAnggaran)`;
   ini perubahan schema dan perlu migration terpisah.
4. **Perlu menyimpan tanggal blokir?** Tanpanya, rekap tahun lampau tidak bisa membedakan "diblokir sejak
   Juli" dari "sejak Januari".
5. **Rencana pencairan bulanan (RKAKL)** untuk target Kurva-S yang bukan linear.

## 8. Di luar cakupan (jangan dikerjakan dalam 2 hari)

- Mengganti nama folder `src/features/laproran` (typo dari `laporan`).
- Menghapus kolom lama `programCategory` (string) yang berdampingan dengan `programCategoryId`.
- Menulis ulang UI besar atau mengganti library.
- Mengubah aturan bisnis di bagian 3.

## 9. Jebakan dan konvensi

- `bunx prisma generate` menghapus `src/generated/prisma/index.ts` (berkas manual `export * from "./client"`,
  tidak diimpor siapa pun). Pulihkan dengan `git checkout`. Direktori `src/generated/prisma` **dilacak git**:
  commit hasil generate bila schema berubah.
- Aturan lint `react-hooks/purity` menolak `Date.now()` di tubuh komponen, termasuk server component. Pakai
  `const now = new Date(); const nowMs = now.getTime();` seperti pada halaman yang sudah ada.
- Aturan lint `react-hooks/set-state-in-effect` menolak `setState` langsung di `useEffect`.
- Pencarian yang diketik memakai `router.replace` (bukan `push`) agar riwayat browser tidak penuh.
- Parameter URL: arsip memakai `tahun`, `bulan`, `q`, `status`, `tampilan`, `page`; dashboard admin memakai
  `tahun` dan `bulan`.
- `next-env.d.ts` adalah berkas hasil generate dan diabaikan git; bila `tsc` mengeluh soal impor gambar,
  jalankan `bun dev` atau `bun run build` sekali.
- Pesan galat dan teks UI memakai bahasa Indonesia; nama fungsi util memakai bahasa Indonesia; ikuti itu.

## 10. Verifikasi akhir (wajib sebelum menyatakan selesai)

```bash
bunx tsc --noEmit                      # harus bersih
bunx eslint src                        # tidak boleh melebihi 11 masalah lama; tidak ada di file yang disentuh
# semua unit test (set DATABASE_URL apa saja):
DATABASE_URL=postgresql://u:p@127.0.0.1:1/x bun run src/utils/tahunAnggaran.test.ts   # ulangi untuk tiap *.test.ts
bun run build
```

Untuk tiap tugas: tulis test untuk logika baru, jalankan semuanya, dan sertakan di pesan commit apa yang
terverifikasi dan apa yang tidak.

## 11. Alur git

- Mulai dari `main` terbaru: `git checkout main && git pull && git checkout -b <jenis>/<nama-singkat>`.
- Satu tugas satu branch (`fix/`, `feat/`, `docs/`). Pesan commit memakai awalan `feat:`, `fix:`, `docs:`,
  `chore:` dan menjelaskan alasan, bukan hanya isi.
- Buka Pull Request ke `main`; jangan push langsung ke `main`.
