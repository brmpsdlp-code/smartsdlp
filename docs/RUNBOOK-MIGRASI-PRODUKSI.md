# Runbook Migrasi Produksi

Jalankan sebagai user deployment dari root repository. Simpan backup dan output command sebelum lanjut.

## 1. Cadangkan database

Buat backup PostgreSQL sebelum menyentuh schema:

```bash
pg_dump --format=custom --file="smart-sdlp-before-migration-$(date +%Y%m%d-%H%M%S).dump" "$DATABASE_URL"
```

Pastikan file backup dapat dibaca dan disimpan di lokasi terpisah.

## 2. Periksa laporan lintas tahun

Hasil query harus kosong, atau setiap hasil harus ditangani manual sebelum migrasi:

```sql
SELECT k.kode, array_agg(DISTINCT l."periodeTahun") AS tahun_laporan
FROM kegiatan k JOIN laporan l ON l."kegiatanId" = k.id
GROUP BY k.id, k.kode
HAVING count(DISTINCT l."periodeTahun") > 1;
```

Kegiatan dengan laporan pada lebih dari satu tahun tidak kompatibel dengan aturan satu TA per kegiatan. Jangan lanjut tanpa keputusan dan penanganan manual.

## 3. Jalankan migration

Gunakan connection string PostgreSQL langsung, tanpa suffix `-pooler`:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require" bunx prisma migrate deploy
```

Jangan memakai `prisma db push --force-reset`.

## 4. Verifikasi pengisian tahun anggaran

Migration `20261028090000_add_tahun_anggaran` mengisi `tahunAnggaran` dari tahun laporan terbaru. Kegiatan tanpa laporan mendapat nilai `2026`.

Periksa hasil:

```sql
SELECT "tahunAnggaran", count(*)
FROM kegiatan
GROUP BY "tahunAnggaran"
ORDER BY "tahunAnggaran";

SELECT k.kode, k."tahunAnggaran", max(l."periodeTahun") AS tahun_laporan_terbaru
FROM kegiatan k
LEFT JOIN laporan l ON l."kegiatanId" = k.id
GROUP BY k.id, k.kode, k."tahunAnggaran"
ORDER BY k.kode;
```

Bila hasil tidak sesuai data bisnis, pulihkan backup atau lakukan koreksi manual dengan persetujuan pemilik data.

## 5. Generate dan restart aplikasi

```bash
bunx prisma generate
bun run build
sudo systemctl restart smart-sdlp
sudo systemctl status smart-sdlp --no-pager
```

Periksa login, dashboard admin, dashboard PJ, input laporan, dan halaman arsip setelah restart.
