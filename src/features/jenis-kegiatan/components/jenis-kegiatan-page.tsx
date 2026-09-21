"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createJenisKegiatan, deleteJenisKegiatan, updateJenisKegiatan } from "@/features/jenis-kegiatan/actions";

type JenisItem = { id: string; nama: string; _count: { kegiatan: number } };

export function JenisKegiatanPage({ data }: { data: JenisItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [nama, setNama] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const save = () => {
    startTransition(async () => {
      const result = editId
        ? await updateJenisKegiatan({ id: editId, nama })
        : await createJenisKegiatan({ nama });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(editId ? "Jenis kegiatan diperbarui." : "Jenis kegiatan ditambahkan.");
      setNama("");
      setEditId(null);
      router.refresh();
    });
  };

  const remove = (item: JenisItem) => {
    if (!window.confirm(`Hapus jenis kegiatan "${item.nama}"?`)) return;
    startTransition(async () => {
      const result = await deleteJenisKegiatan(item.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Jenis kegiatan dihapus.");
      router.refresh();
    });
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5">
        <h2 className="text-lg sm:text-xl font-bold text-slate-800">Jenis Kegiatan</h2>
        <p className="text-xs text-slate-500 mt-1">Kelola pilihan jenis kegiatan untuk kegiatan baru.</p>
      </div>
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <input value={nama} onChange={(event) => setNama(event.target.value)} placeholder="Nama jenis kegiatan" className="h-9 flex-1 px-3 text-xs border border-slate-300 rounded-md" />
          <button disabled={isPending} onClick={save} className="h-9 px-4 text-xs font-semibold text-white bg-emerald-800 rounded-md disabled:opacity-50">
            {editId ? "Simpan Perubahan" : "Tambah Jenis"}
          </button>
          {editId && <button onClick={() => { setEditId(null); setNama(""); }} className="h-9 px-4 text-xs border border-slate-300 rounded-md">Batal</button>}
        </div>
      </div>
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead><tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase"><th className="p-3">Nama</th><th className="p-3">Dipakai</th><th className="p-3 text-right">Aksi</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item) => {
              const builtIn = item.nama === "APBN" || item.nama === "NON_APBN";
              return <tr key={item.id}>
                <td className="p-3 font-semibold text-slate-800">{item.nama}{builtIn && <span className="ml-2 text-[10px] text-slate-400">Bawaan</span>}</td>
                <td className="p-3 text-slate-600">{item._count.kegiatan} kegiatan</td>
                <td className="p-3 text-right space-x-2">
                  <button disabled={builtIn || isPending} onClick={() => { setEditId(item.id); setNama(item.nama); }} className="text-emerald-800 disabled:text-slate-300">Ubah</button>
                  <button disabled={builtIn || item._count.kegiatan > 0 || isPending} onClick={() => remove(item)} className="text-rose-700 disabled:text-slate-300">Hapus</button>
                </td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
