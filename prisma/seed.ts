import { auth } from "@/lib/auth";
import { PrismaClient } from "@/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const ACCOUNTS = [
  {
    name: "Admin Pusdatin",
    email: "admin.pusdatin@pertanian.go.id",
    password: "Admin@SMART2026",
    role: "ADMIN" as const,
    nip: "19820514 200604 1 002",
    jabatan: "Pranata Komputer Ahli Muda",
    unitKerja: "Pusat Data dan Sistem Informasi Pertanian",
  },
  {
    name: "Ir. Budi Santoso, M.Si.",
    email: "budi.santoso@pertanian.go.id",
    password: "PJ@SMART2026",
    role: "USER" as const,
    nip: "19780412 200312 1 001",
    jabatan: "Penanggung Jawab (PJ) Kegiatan",
    unitKerja: "Balai Besar Perakitan dan Modernisasi Sumber Daya Lahan Pertanian",
  },
];

async function main() {
  console.log("🌱 Reseeding database SMART BRMP SDLP...\n");

  for (const acc of ACCOUNTS) {
    // 1. Hapus akun lama jika ada agar tidak bentrok
    await prisma.user.deleteMany({ where: { email: acc.email } });

    // 2. Buat user via API Better Auth
    const res = await auth.api.signUpEmail({
      body: {
        email: acc.email,
        password: acc.password,
        name: acc.name,
      },
    });

    // 3. Update data kustom (role, nip, jabatan, unitKerja) ke tabel User Prisma
    if (res?.user?.id) {
      await prisma.user.update({
        where: { id: res.user.id },
        data: {
          role: acc.role,
          nip: acc.nip,
          jabatan: acc.jabatan,
          unitKerja: acc.unitKerja,
        },
      });
    }

    console.log(`✅ Berhasil membuat akun [${acc.role}]: ${acc.email}`);
  }

  console.log("\n✅ Seeding selesai!");
}

main()
  .catch((e) => {
    console.error("❌ Error saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
