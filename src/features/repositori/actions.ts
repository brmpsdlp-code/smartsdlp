"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getActionSession } from "@/lib/active-session";
import { isValidGoogleDriveUrl } from "@/lib/gdrive-url";
import { KategoriDokumen } from "@/generated/prisma";

export async function createDokumenWithFormData(formData: FormData) {
  let session;

  try {
    session = await getActionSession();
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Wajib ganti kata sandi terlebih dahulu.",
    };
  }

  if (!session || session.user.role?.toLowerCase() !== "admin") {
    return {
      success: false,
      error: "Hanya Admin yang berhak mencatat dokumen repositori.",
    };
  }

  const namaValue = formData.get("nama");
  const kategoriValue = formData.get("kategori");
  const tanggalValue = formData.get("tanggal");
  const kegiatanIdValue = formData.get("kegiatanId");
  const customLinkValue = formData.get("customLink");

  const nama = typeof namaValue === "string" ? namaValue.trim() : "";
  const kategori = typeof kategoriValue === "string" ? kategoriValue : "";
  const tanggal = typeof tanggalValue === "string" ? tanggalValue : "";
  const kegiatanId = typeof kegiatanIdValue === "string" ? kegiatanIdValue : "";
  const customLink =
    typeof customLinkValue === "string" ? customLinkValue.trim() : "";

  if (!nama) {
    return {
      success: false,
      error: "Judul dokumen wajib diisi.",
    };
  }

  const allowedCategories = [
    "SK",
    "DIPA",
    "KONTRAK",
    "LAPORAN",
    "ESURAT",
    "LAINNYA",
  ] as const;

  if (
    !allowedCategories.includes(kategori as (typeof allowedCategories)[number])
  ) {
    return {
      success: false,
      error: "Kategori dokumen tidak valid.",
    };
  }

  if (!tanggal) {
    return {
      success: false,
      error: "Tanggal dokumen wajib diisi.",
    };
  }

  const parsedDate = new Date(tanggal);

  if (Number.isNaN(parsedDate.getTime())) {
    return {
      success: false,
      error: "Format tanggal dokumen tidak valid.",
    };
  }

  if (!customLink) {
    return {
      success: false,
      error: "Tautan Google Drive wajib diisi.",
    };
  }

  if (!isValidGoogleDriveUrl(customLink)) {
    return {
      success: false,
      error:
        "Tautan tidak valid. Gunakan tautan dokumen atau folder Google Drive yang didukung.",
    };
  }

  try {
    const doc = await prisma.dokumen.create({
      data: {
        nama,
        kategori: kategori as KategoriDokumen,
        tanggal: parsedDate,
        kegiatanId: kegiatanId && kegiatanId !== "NONE" ? kegiatanId : null,
        fileUrl: customLink,
        fileType: "link",
        ukuran: "Tautan GDrive",
        uploaderId: session.user.id,
      },
    });

    revalidatePath("/admin/repositori");

    return {
      success: true,
      id: doc.id,
    };
  } catch (error) {
    console.error("Gagal menyimpan dokumen:", error);

    return {
      success: false,
      error: "Gagal menyimpan dokumen. Periksa data dan coba lagi.",
    };
  }
}

export async function deleteDokumen(id: string) {
  let session;
  try {
    session = await getActionSession();
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Wajib ganti kata sandi terlebih dahulu.",
    };
  }
  if (!session || session.user.role?.toLowerCase() !== "admin") {
    return {
      success: false,
      error: "Hanya Admin yang berhak menghapus dokumen.",
    };
  }

  try {
    await prisma.dokumen.delete({ where: { id } });
    revalidatePath("/admin/repositori");
    return { success: true };
  } catch (error) {
    console.error("Gagal menghapus dokumen:", error);
    return {
      success: false,
      error:
        "Gagal menghapus dokumen. Dokumen mungkin sudah dihapus atau tidak ditemukan.",
    };
  }
}
