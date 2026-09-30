import React, { useState } from "react";
import { UserProfile } from "@/types";
import { changePassword } from "@/lib/auth-client";
import { markPasswordChanged } from "@/features/users/actions";
import { toast } from "sonner";
import { X, Mail, Lock } from "lucide-react";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSave: (updatedProfile: UserProfile) => void;
}

export function EditProfileModal({ isOpen, onClose, userProfile, onSave }: EditProfileModalProps) {
  const [formData, setFormData] = useState({ ...userProfile });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  if (!isOpen) return null;

  const initials = userProfile.nama.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "U";
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError("");
    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) return setPasswordError("Kata sandi lama wajib diisi.");
      if (newPassword.length < 6) return setPasswordError("Kata sandi baru minimal 6 karakter.");
      if (newPassword !== confirmPassword) return setPasswordError("Konfirmasi kata sandi tidak cocok.");
      const result = await changePassword({ currentPassword, newPassword, revokeOtherSessions: false });
      if (result.error) return setPasswordError(result.error.message || "Gagal mengubah kata sandi.");
      await markPasswordChanged();
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      toast.success("Kata sandi berhasil diubah.");
    }
    onSave(formData);
    onClose();
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <button aria-label="Tutup dialog" className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />
    <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
      <div className="bg-[#143D32] px-6 py-5 text-white">
        <div className="flex items-start justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-200">Profil akun</p><h2 className="mt-1 text-lg font-bold">Profil Saya</h2></div><button onClick={onClose} aria-label="Tutup" className="rounded-lg p-1.5 text-emerald-200 hover:bg-emerald-800 hover:text-white"><X className="h-5 w-5" /></button></div>
        <div className="mt-5 flex items-center gap-3"><div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-300 bg-emerald-800 text-xl font-bold">{initials}</div><div><p className="text-base font-bold">{userProfile.nama}</p><p className="mt-0.5 flex items-center gap-1 text-xs text-emerald-200"><Mail className="h-3.5 w-3.5" />{userProfile.email}</p></div></div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 p-6 text-xs">
        <div className="grid gap-3 sm:grid-cols-2"><label className="font-semibold text-slate-700">Nama<input value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} required className="mt-1 h-9 w-full rounded-lg border border-slate-300 px-3 font-normal" /></label><label className="font-semibold text-slate-700">NIP<span className="mt-1 block h-9 rounded-lg bg-slate-100 px-3 py-2 font-mono font-normal text-slate-600">{userProfile.nip || "Belum diisi"}</span><small className="mt-1 block font-normal text-slate-500">Hubungi admin untuk mengubah NIP.</small></label></div>
        <div className="grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-2"><label className="font-semibold text-slate-700 sm:col-span-2"><span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-emerald-700" />Kata Sandi Lama</span><input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required={Boolean(newPassword || confirmPassword)} className="mt-1 h-9 w-full rounded-lg border border-slate-300 px-3 font-normal" /></label><label className="font-semibold text-slate-700">Kata Sandi Baru<input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1 h-9 w-full rounded-lg border border-slate-300 px-3 font-normal" /></label><label className="font-semibold text-slate-700">Konfirmasi<input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 h-9 w-full rounded-lg border border-slate-300 px-3 font-normal" /></label></div>
        {passwordError && <p className="rounded-lg bg-rose-50 p-2 text-rose-700">{passwordError}</p>}
        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4"><button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-600">Batal</button><button type="submit" className="rounded-lg bg-[#143D32] px-4 py-2 font-bold text-white hover:bg-[#0e2c24]">Simpan</button></div>
      </form>
    </div>
  </div>;
}
