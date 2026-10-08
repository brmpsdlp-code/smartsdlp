-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "JenisAnggaran" AS ENUM ('APBN', 'NON_APBN');

-- CreateEnum
CREATE TYPE "status_anggaran" AS ENUM ('DIBUKA', 'DIBLOKIR');

-- CreateEnum
CREATE TYPE "kategori_dokumen" AS ENUM ('SK', 'DIPA', 'KONTRAK', 'LAPORAN', 'ESURAT', 'LAINNYA');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'USER',
    "nip" TEXT,
    "jabatan" TEXT,
    "unitKerja" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_attempt" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "issuer" TEXT NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_settings" (
    "id" TEXT NOT NULL,
    "reportDeadlineDay" INTEGER NOT NULL DEFAULT 25,
    "reportDeadlineTime" TEXT NOT NULL DEFAULT '23:59',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "colorKey" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kegiatan" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jenis" "JenisAnggaran",
    "programCategory" TEXT,
    "programCategoryId" TEXT,
    "pagu" BIGINT NOT NULL,
    "realisasi" BIGINT NOT NULL DEFAULT 0,
    "fisik" INTEGER DEFAULT 0,
    "uraian" TEXT,
    "statusAnggaran" "status_anggaran" NOT NULL DEFAULT 'DIBUKA',
    "realLalu" BIGINT DEFAULT 0,
    "realIni" BIGINT DEFAULT 0,
    "wajib" BOOLEAN NOT NULL DEFAULT false,
    "sudahLapor" BOOLEAN NOT NULL DEFAULT false,
    "pjId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kegiatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "laporan" (
    "id" TEXT NOT NULL,
    "kegiatanId" TEXT NOT NULL,
    "periodeBulan" INTEGER NOT NULL,
    "periodeTahun" INTEGER NOT NULL,
    "uraian" TEXT NOT NULL,
    "fisik" DOUBLE PRECISION NOT NULL,
    "statusAnggaran" "status_anggaran" NOT NULL DEFAULT 'DIBUKA',
    "realLalu" BIGINT NOT NULL,
    "realIni" BIGINT NOT NULL,
    "realisasi" BIGINT NOT NULL,
    "submittedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "laporan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL DEFAULT 'DELETE_LAPORAN',
    "namaFile" TEXT NOT NULL,
    "kodeKegiatan" TEXT NOT NULL,
    "namaKegiatan" TEXT NOT NULL,
    "pemilikNama" TEXT NOT NULL,
    "pemilikEmail" TEXT NOT NULL,
    "adminNama" TEXT NOT NULL,
    "adminEmail" TEXT NOT NULL,
    "alasan" TEXT NOT NULL,
    "notifStatus" TEXT NOT NULL DEFAULT 'Terkirim ke Email',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dokumen" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kategori" "kategori_dokumen" NOT NULL DEFAULT 'SK',
    "fileUrl" TEXT,
    "fileType" TEXT DEFAULT 'pdf',
    "ukuran" TEXT DEFAULT '1.2 MB',
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kegiatanId" TEXT,
    "uploaderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dokumen_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_nip_key" ON "user"("nip");

-- CreateIndex
CREATE INDEX "auth_attempt_identifier_kind_attemptedAt_idx" ON "auth_attempt"("identifier", "kind", "attemptedAt");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "account_issuer_accountId_uidx" ON "account"("issuer", "accountId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "program_category_name_key" ON "program_category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "kegiatan_kode_key" ON "kegiatan"("kode");

-- CreateIndex
CREATE INDEX "kegiatan_pjId_idx" ON "kegiatan"("pjId");

-- CreateIndex
CREATE INDEX "kegiatan_kode_idx" ON "kegiatan"("kode");

-- CreateIndex
CREATE INDEX "laporan_kegiatanId_idx" ON "laporan"("kegiatanId");

-- CreateIndex
CREATE UNIQUE INDEX "laporan_kegiatanId_periodeBulan_periodeTahun_key" ON "laporan"("kegiatanId", "periodeBulan", "periodeTahun");

-- CreateIndex
CREATE INDEX "dokumen_kegiatanId_idx" ON "dokumen"("kegiatanId");

-- CreateIndex
CREATE INDEX "dokumen_uploaderId_idx" ON "dokumen"("uploaderId");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kegiatan" ADD CONSTRAINT "kegiatan_programCategoryId_fkey" FOREIGN KEY ("programCategoryId") REFERENCES "program_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kegiatan" ADD CONSTRAINT "kegiatan_pjId_fkey" FOREIGN KEY ("pjId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laporan" ADD CONSTRAINT "laporan_kegiatanId_fkey" FOREIGN KEY ("kegiatanId") REFERENCES "kegiatan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laporan" ADD CONSTRAINT "laporan_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laporan" ADD CONSTRAINT "laporan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dokumen" ADD CONSTRAINT "dokumen_kegiatanId_fkey" FOREIGN KEY ("kegiatanId") REFERENCES "kegiatan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dokumen" ADD CONSTRAINT "dokumen_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

