"use client";
import { useState } from "react";
import { createProgramCategory, deleteProgramCategory, updateProgramCategory } from "@/features/program-category/actions";

type Category = { id: string; name: string; sortOrder: number; colorKey: string; isActive: boolean; _count: { kegiatan: number } };
export function ProgramCategoryManager({ categories }: { categories: Category[] }) {
  const [name, setName] = useState(""); const [sortOrder, setSortOrder] = useState("1"); const [colorKey, setColorKey] = useState("muted");
  async function add() { const result = await createProgramCategory({ name, sortOrder: Number(sortOrder), colorKey }); if (!result.success) alert(result.error); else location.reload(); }
  async function remove(id: string) { const result = await deleteProgramCategory(id); if (!result.success) alert(result.error); else location.reload(); }
  async function rename(category: Category) { const nextName = prompt("Nama kategori", category.name)?.trim(); if (!nextName || nextName === category.name) return; const result = await updateProgramCategory(category.id, { name: nextName, sortOrder: category.sortOrder, colorKey: category.colorKey, isActive: category.isActive }); if (!result.success) alert(result.error); else location.reload(); }
  return <main className="p-6 space-y-6"><h1 className="text-2xl font-bold">Kategori Program</h1><div className="flex gap-2"><input className="border p-2" placeholder="Nama" value={name} onChange={e => setName(e.target.value)} /><input className="border p-2 w-20" type="number" value={sortOrder} onChange={e => setSortOrder(e.target.value)} /><input className="border p-2" placeholder="Warna" value={colorKey} onChange={e => setColorKey(e.target.value)} /><button className="bg-emerald-700 text-white px-3" onClick={add}>Tambah</button></div><table className="w-full text-sm"><tbody>{categories.map(c => <tr key={c.id} className="border-b"><td className="p-2">{c.sortOrder}</td><td>{c.name}</td><td>{c.isActive ? "Aktif" : "Nonaktif"}</td><td>{c._count.kegiatan}</td><td><button className="text-blue-600 mr-2" onClick={() => rename(c)}>Ubah</button><button className="text-red-600" onClick={() => remove(c.id)}>Hapus</button></td></tr>)}</tbody></table></main>;
}
