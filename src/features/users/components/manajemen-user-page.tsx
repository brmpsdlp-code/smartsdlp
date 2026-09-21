"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createAdminUser, setUserActive } from "@/features/users/actions";

type UserItem = { id: string; name: string; email: string; role: string; isActive: boolean };

export function ManajemenUserPage({ users, currentUserId }: { users: UserItem[]; currentUserId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const activeAdmins = users.filter((user) => user.role === "ADMIN" && user.isActive).length;

  const add = () => {
    startTransition(async () => {
      const result = await createAdminUser({ name, email });
      if (!result.success) { toast.error(result.error); return; }
      toast.success("User berhasil dibuat. Password sementara tampil sekali.");
      window.alert(`Password sementara: ${result.temporaryPassword}`);
      setName(""); setEmail(""); setOpen(false); router.refresh();
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
    <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 flex items-center justify-between gap-3">
      <div><h2 className="text-lg sm:text-xl font-bold text-slate-800">Pengguna</h2><p className="text-xs text-slate-500 mt-1">Kelola akses pengguna sistem.</p></div>
      <button onClick={() => setOpen(true)} className="px-3 py-2 text-xs font-semibold text-white bg-emerald-800 rounded-md">Tambah User</button>
    </div>
    {open && <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3"><h3 className="font-bold text-sm">Tambah User</h3><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama" className="w-full h-9 px-3 text-xs border rounded-md" /><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className="w-full h-9 px-3 text-xs border rounded-md" /><p className="text-[11px] text-slate-500">Password sementara dibuat server dan ditampilkan satu kali setelah user dibuat.</p><div className="flex gap-2"><button disabled={pending} onClick={add} className="px-3 py-2 text-xs text-white bg-emerald-800 rounded-md">Buat User</button><button onClick={() => setOpen(false)} className="px-3 py-2 text-xs border rounded-md">Batal</button></div></div>}
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden"><table className="w-full text-left text-xs"><thead><tr className="bg-slate-50 border-b text-[11px] font-bold text-slate-500 uppercase"><th className="p-3">Nama</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Status</th><th className="p-3 text-right">Aksi</th></tr></thead><tbody className="divide-y">{users.map((user) => { const self = user.id === currentUserId; const lastAdmin = user.role === "ADMIN" && user.isActive && activeAdmins <= 1; return <tr key={user.id}><td className="p-3 font-semibold">{user.name}</td><td className="p-3">{user.email}</td><td className="p-3">{user.role}</td><td className="p-3"><span className={user.isActive ? "text-emerald-700" : "text-slate-500"}>{user.isActive ? "Aktif" : "Nonaktif"}</span></td><td className="p-3 text-right"><button disabled={self || lastAdmin || pending} onClick={() => toggle(user)} className="text-emerald-800 disabled:text-slate-300">{user.isActive ? "Nonaktifkan" : "Aktifkan kembali"}</button></td></tr>; })}</tbody></table></div>
  </div>;
}
