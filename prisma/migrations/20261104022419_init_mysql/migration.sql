-- CreateTable
CREATE TABLE `user` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `emailVerified` BOOLEAN NOT NULL DEFAULT false,
    `image` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `role` ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER',
    `nip` VARCHAR(191) NULL,
    `jabatan` VARCHAR(191) NULL,
    `unitKerja` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `mustChangePassword` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `user_email_key`(`email`),
    UNIQUE INDEX `user_nip_key`(`nip`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auth_attempt` (
    `id` VARCHAR(191) NOT NULL,
    `identifier` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(191) NOT NULL,
    `attemptedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `auth_attempt_identifier_kind_attemptedAt_idx`(`identifier`, `kind`, `attemptedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `session` (
    `id` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `session_token_key`(`token`),
    INDEX `session_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `account` (
    `id` VARCHAR(191) NOT NULL,
    `accountId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `accessToken` TEXT NULL,
    `refreshToken` TEXT NULL,
    `idToken` TEXT NULL,
    `accessTokenExpiresAt` DATETIME(3) NULL,
    `refreshTokenExpiresAt` DATETIME(3) NULL,
    `scope` TEXT NULL,
    `password` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `issuer` VARCHAR(191) NOT NULL,

    INDEX `account_userId_idx`(`userId`),
    UNIQUE INDEX `account_issuer_accountId_uidx`(`issuer`, `accountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `verification` (
    `id` VARCHAR(191) NOT NULL,
    `identifier` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    INDEX `verification_identifier_idx`(`identifier`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `app_settings` (
    `id` VARCHAR(191) NOT NULL,
    `reportDeadlineDay` INTEGER NOT NULL DEFAULT 25,
    `reportDeadlineTime` VARCHAR(191) NOT NULL DEFAULT '23:59',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `program_category` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL,
    `colorKey` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `program_category_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kegiatan` (
    `id` VARCHAR(191) NOT NULL,
    `kode` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `jenis` ENUM('APBN', 'NON_APBN') NULL,
    `programCategory` VARCHAR(191) NULL,
    `programCategoryId` VARCHAR(191) NULL,
    `pagu` BIGINT NOT NULL,
    `realisasi` BIGINT NOT NULL DEFAULT 0,
    `fisik` INTEGER NULL DEFAULT 0,
    `uraian` TEXT NULL,
    `statusAnggaran` ENUM('DIBUKA', 'DIBLOKIR') NOT NULL DEFAULT 'DIBUKA',
    `tahunAnggaran` INTEGER NOT NULL,
    `realLalu` BIGINT NULL DEFAULT 0,
    `realIni` BIGINT NULL DEFAULT 0,
    `wajib` BOOLEAN NOT NULL DEFAULT false,
    `sudahLapor` BOOLEAN NOT NULL DEFAULT false,
    `pjId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `kegiatan_kode_key`(`kode`),
    INDEX `kegiatan_pjId_idx`(`pjId`),
    INDEX `kegiatan_kode_idx`(`kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `laporan` (
    `id` VARCHAR(191) NOT NULL,
    `kegiatanId` VARCHAR(191) NOT NULL,
    `periodeBulan` INTEGER NOT NULL,
    `periodeTahun` INTEGER NOT NULL,
    `uraian` TEXT NOT NULL,
    `fisik` DOUBLE NOT NULL,
    `statusAnggaran` ENUM('DIBUKA', 'DIBLOKIR') NOT NULL DEFAULT 'DIBUKA',
    `realLalu` BIGINT NOT NULL,
    `realIni` BIGINT NOT NULL,
    `realisasi` BIGINT NOT NULL,
    `submittedById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NULL,

    INDEX `laporan_kegiatanId_idx`(`kegiatanId`),
    UNIQUE INDEX `laporan_kegiatanId_periodeBulan_periodeTahun_key`(`kegiatanId`, `periodeBulan`, `periodeTahun`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `href` TEXT NULL,
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notification_userId_readAt_createdAt_idx`(`userId`, `readAt`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_log` (
    `id` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL DEFAULT 'DELETE_LAPORAN',
    `namaFile` TEXT NOT NULL,
    `kodeKegiatan` VARCHAR(191) NOT NULL,
    `namaKegiatan` VARCHAR(191) NOT NULL,
    `pemilikNama` VARCHAR(191) NOT NULL,
    `pemilikEmail` VARCHAR(191) NOT NULL,
    `adminNama` VARCHAR(191) NOT NULL,
    `adminEmail` VARCHAR(191) NOT NULL,
    `alasan` TEXT NOT NULL,
    `notifStatus` VARCHAR(191) NOT NULL DEFAULT 'Terkirim ke Email',
    `dataSnapshot` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dokumen` (
    `id` VARCHAR(191) NOT NULL,
    `nama` TEXT NOT NULL,
    `kategori` ENUM('SK', 'DIPA', 'KONTRAK', 'LAPORAN', 'ESURAT', 'LAINNYA') NOT NULL DEFAULT 'SK',
    `fileUrl` TEXT NULL,
    `fileType` VARCHAR(191) NULL DEFAULT 'pdf',
    `ukuran` VARCHAR(191) NULL DEFAULT '1.2 MB',
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `kegiatanId` VARCHAR(191) NULL,
    `uploaderId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `dokumen_kegiatanId_idx`(`kegiatanId`),
    INDEX `dokumen_uploaderId_idx`(`uploaderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `report_access_override` (
    `id` VARCHAR(191) NOT NULL,
    `kegiatanId` VARCHAR(191) NOT NULL,
    `periodeBulan` INTEGER NOT NULL,
    `periodeTahun` INTEGER NOT NULL,
    `openedUntil` DATETIME(3) NOT NULL,
    `reason` TEXT NOT NULL,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `revokedAt` DATETIME(3) NULL,

    INDEX `report_access_override_kegiatanId_idx`(`kegiatanId`),
    UNIQUE INDEX `report_access_override_kegiatan_periode_key`(`kegiatanId`, `periodeBulan`, `periodeTahun`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `report_access_request` (
    `id` VARCHAR(191) NOT NULL,
    `kegiatanId` VARCHAR(191) NOT NULL,
    `periodeBulan` INTEGER NOT NULL,
    `periodeTahun` INTEGER NOT NULL,
    `reason` TEXT NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `requestedById` VARCHAR(191) NOT NULL,
    `decidedById` VARCHAR(191) NULL,
    `decidedAt` DATETIME(3) NULL,
    `decisionNote` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `report_access_request_status_idx`(`status`),
    INDEX `report_access_request_periode_idx`(`kegiatanId`, `periodeBulan`, `periodeTahun`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `session` ADD CONSTRAINT `session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `account` ADD CONSTRAINT `account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kegiatan` ADD CONSTRAINT `kegiatan_programCategoryId_fkey` FOREIGN KEY (`programCategoryId`) REFERENCES `program_category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kegiatan` ADD CONSTRAINT `kegiatan_pjId_fkey` FOREIGN KEY (`pjId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `laporan` ADD CONSTRAINT `laporan_kegiatanId_fkey` FOREIGN KEY (`kegiatanId`) REFERENCES `kegiatan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `laporan` ADD CONSTRAINT `laporan_submittedById_fkey` FOREIGN KEY (`submittedById`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `laporan` ADD CONSTRAINT `laporan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dokumen` ADD CONSTRAINT `dokumen_kegiatanId_fkey` FOREIGN KEY (`kegiatanId`) REFERENCES `kegiatan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dokumen` ADD CONSTRAINT `dokumen_uploaderId_fkey` FOREIGN KEY (`uploaderId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_access_override` ADD CONSTRAINT `report_access_override_kegiatanId_fkey` FOREIGN KEY (`kegiatanId`) REFERENCES `kegiatan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_access_override` ADD CONSTRAINT `report_access_override_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_access_request` ADD CONSTRAINT `report_access_request_kegiatanId_fkey` FOREIGN KEY (`kegiatanId`) REFERENCES `kegiatan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_access_request` ADD CONSTRAINT `report_access_request_requestedById_fkey` FOREIGN KEY (`requestedById`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_access_request` ADD CONSTRAINT `report_access_request_decidedById_fkey` FOREIGN KEY (`decidedById`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
