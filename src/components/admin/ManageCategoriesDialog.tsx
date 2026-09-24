"use client";

import { useState, useTransition } from "react";
import { createProgramCategory, deleteProgramCategory, updateProgramCategory } from "@/features/program-category/actions";
import { CATEGORY_COLORS, getCategoryColor } from "@/lib/category-colors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type Category = { id: string; name: string; sortOrder: number; colorKey: string; isActive: boolean };

export function ManageCategoriesDialog({ initialCategories, onChange }: { initialCategories: Category[]; onChange: (categories: Category[]) => void }) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState(initialCategories);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fallback = "Program Lainnya/Unassigned";
  const commit = (next: Category[]) => { setCategories(next); onChange(next); };

  const add = () => startTransition(async () => {
    const result = await createProgramCategory({ name });
    if (!result.success || !result.category) return setError(result.error ?? "Kategori gagal dibuat.");
    commit([...categories, result.category].sort((a, b) => a.sortOrder - b.sortOrder)); setName(""); setError(null);
  });
  const rename = (category: Category, value: string) => startTransition(async () => {
    const result = await updateProgramCategory(category.id, { name: value, sortOrder: category.sortOrder, colorKey: category.colorKey, isActive: category.isActive });
    if (!result.success) return setError(result.error ?? "Kategori gagal diubah.");
    commit(categories.map((item) => item.id === category.id ? { ...item, name: value } : item)); setEditing(null); setError(null);
  });
  const remove = (id: string) => startTransition(async () => {
    const result = await deleteProgramCategory(id);
    if (!result.success) return setError(result.error ?? "Kategori gagal dihapus.");
    commit(categories.filter((item) => item.id !== id)); setError(null);
  });

  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger render={<Button type="button" variant="outline" size="sm">Kelola Kategori</Button>} />
    <DialogContent className="max-w-lg">
      <DialogHeader><DialogTitle>Kelola Kategori</DialogTitle></DialogHeader>
      <div className="space-y-2">
        {categories.filter((category) => category.isActive).map((category) => <div key={category.id} className="flex items-center gap-2 rounded border p-2">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: getCategoryColor(category.colorKey) }} />
          {editing === category.id ? <Input defaultValue={category.name} autoFocus onKeyDown={(event) => { if (event.key === "Enter") rename(category, event.currentTarget.value); }} /> : <span className="min-w-0 flex-1 text-sm">{category.name}</span>}
          {category.name !== fallback && <><Button type="button" variant="ghost" size="xs" onClick={() => setEditing(editing === category.id ? null : category.id)}>Ubah</Button><Button type="button" variant="ghost" size="xs" disabled={pending} onClick={() => remove(category.id)}>Hapus</Button></>}
        </div>)}
      </div>
      <div className="flex gap-2 border-t pt-3"><Input placeholder="Nama kategori baru" value={name} onChange={(event) => setName(event.target.value)} /><Button type="button" size="sm" disabled={pending || !name.trim()} onClick={add}>Tambah</Button></div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex flex-wrap gap-1 pt-2">{CATEGORY_COLORS.map((color) => <span key={color.key} title={color.key} className="h-3 w-3 rounded-full" style={{ backgroundColor: color.hex }} />)}</div>
    </DialogContent>
  </Dialog>;
}
