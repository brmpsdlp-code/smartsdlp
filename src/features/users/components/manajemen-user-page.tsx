"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createAdminUser, setUserActive, updateUserProfile } from "@/features/users/actions";

type UserItem = { id: string; name: string; email: string; nip: string | null; role: string; isActive: boolean };

export function ManajemenUserPage({ users, currentUserId }: { users: UserItem[]; currentUserId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserItem | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nip, setNip] = useState("");
  const activeAdmins = users.filter((user) => user.role === "ADMIN" && user.isActive).length;

  const add = () => {
    startTransition(async () => {
      const result = await createAdminUser({ name, email, nip });
      if (!result.success) { toast.error(result.error); return; }
      toast.success("User berhasil dibuat. Password sementara tampil sekali.");
      window.alert(`Password sementara: ${result.temporaryPassword}`);
      setName(""); setEmail(""); setNip(""); setOpen(false); router.refresh();
    });
  };

  const openEdit = (user: UserItem) => {
    setEditTarget(user);
    setName(user.name);
    setNip(user.nip ?? "");
  };

  const saveEdit = () => {
    if (!editTarget) return;
    startTransition(async () => {
      const result = await updateUserProfile({ userId: editTarget.id, name, nip });
      if (!result.success) { toast.error(result.error); return; }
      toast.success("Nama dan NIP user berhasil diperbarui.");
      setEditTarget(null);
      router.refresh();
    });
  };

  const toggle = (user: UserItem) => {
    const action = user.isActive ? "Nonaktifkan" : "Aktifkan kembali";
    if (!window.confirm(`${action} ${user.name}? Data tetap tersimpan; user hanya kehilangan akses.`)) return;
    startTransition(async () => {
      const result = await setUserActive(user.id, !user.isActive);
      if (!result.success) { toast.error(result.error); return; }
      toast.success(`${action} berhasil.`); router.refresh();
    });
  };

  return <div className="space-y-5">
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
      <div><h2 className="text-lg font-bold text-slate-800 sm:text-xl">Pengguna</h2><p className="mt-1 text-xs text-slate-500">Kelola akses pengguna sistem.</p></div>
      <button onClick={() => setOpen(true)} className="rounded-md bg-emerald-800 px-3 py-2 text-xs font-semibold text-white">Tambah User</button>
    </div>
    {open && <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4"><h3 className="text-sm font-bold">Tambah User</h3><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama" className="h-9 w-full rounded-md border px-3 text-xs" /><input value={nip} onChange={(e) => setNip(e.target.value)} placeholder="NIP" className="h-9 w-full rounded-md border px-3 text-xs" /><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className="h-9 w-full rounded-md border px-3 text-xs" /><p className="text-[11px] text-slate-500">Password sementara dibuat server dan ditampilkan satu kali setelah user dibuat.</p><div className="flex gap-2"><button disabled={pending} onClick={add} className="rounded-md bg-emerald-800 px-3 py-2 text-xs text-white">Buat User</button><button onClick={() => setOpen(false)} className="rounded-md border px-3 py-2 text-xs">Batal</button></div></div>}
    {editTarget && <div className="space-y-3 rounded-lg border border-emerald-200 bg-emerald-50/40 p-4"><div><h3 className="text-sm font-bold text-slate-800">Edit Profil User</h3><p className="mt-1 text-[11px] text-slate-500">Hanya nama dan NIP dapat diubah. Email, password, dan role tetap.</p></div><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama" className="h-9 w-full rounded-md border bg-white px-3 text-xs" /><input value={nip} onChange={(e) => setNip(e.target.value)} placeholder="NIP" className="h-9 w-full rounded-md border bg-white px-3 text-xs" /><div className="flex gap-2"><button disabled={pending} onClick={saveEdit} className="rounded-md bg-emerald-800 px-3 py-2 text-xs text-white">Simpan Perubahan</button><button onClick={() => setEditTarget(null)} className="rounded-md border bg-white px-3 py-2 text-xs">Batal</button></div></div>}
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white"><table className="w-full text-left text-xs"><thead><tr className="border-b bg-slate-50 text-[11px] font-bold uppercase text-slate-500"><th className="p-3">Nama</th><th className="p-3">NIP</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Status</th><th className="p-3 text-right">Aksi</th></tr></thead><tbody className="divide-y">{users.map((user) => { const self = user.id === currentUserId; const lastAdmin = user.role === "ADMIN" && user.isActive && activeAdmins <= 1; return <tr key={user.id}><td className="p-3 font-semibold">{user.name}</td><td className="p-3">{user.nip ?? "-"}</td><td className="p-3">{user.email}</td><td className="p-3">{user.role}</td><td className="p-3"><span className={user.isActive ? "text-emerald-700" : "text-slate-500"}>{user.isActive ? "Aktif" : "Nonaktif"}</span></td><td className="space-x-3 p-3 text-right"><button disabled={pending} onClick={() => openEdit(user)} className="font-semibold text-sky-700 disabled:text-slate-300">Edit</button><button disabled={self || lastAdmin || pending} onClick={() => toggle(user)} className="text-emerald-800 disabled:text-slate-300">{user.isActive ? "Nonaktifkan" : "Aktifkan kembali"}</button></td></tr>; })}</tbody></table></div>
  </div>;
}
