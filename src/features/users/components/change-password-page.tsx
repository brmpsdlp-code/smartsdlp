"use client";

import { useState } from "react";
import { changePassword } from "@/lib/auth-client";
import { markPasswordChanged } from "@/features/users/actions";
import { useRouter } from "next/navigation";

export function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (newPassword.length < 6) return setError("Kata sandi baru minimal 6 karakter.");
    if (newPassword !== confirmPassword) return setError("Konfirmasi kata sandi tidak cocok.");
    setSaving(true);
    const result = await changePassword({ currentPassword, newPassword, revokeOtherSessions: false });
    if (result.error) { setError(result.error.message || "Gagal mengubah kata sandi."); setSaving(false); return; }
    await markPasswordChanged();
    router.push("/dashboard");
    router.refresh();
  }

  return <main className="max-w-md mx-auto mt-16 bg-white border border-slate-200 rounded-xl p-6 shadow-sm"><h1 className="text-lg font-bold text-slate-900">Ganti Kata Sandi</h1><p className="text-sm text-slate-500 mt-1 mb-5">Ganti kata sandi sebelum melanjutkan.</p><form onSubmit={submit} className="space-y-3"><input required type="password" placeholder="Kata sandi lama" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" /><input required type="password" placeholder="Kata sandi baru" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" /><input required type="password" placeholder="Konfirmasi kata sandi baru" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" />{error && <p className="text-sm text-rose-600">{error}</p>}<button disabled={saving} className="w-full bg-[#143D32] text-white rounded-md py-2 text-sm font-semibold disabled:opacity-50">{saving ? "Menyimpan..." : "Simpan Kata Sandi"}</button></form></main>;
}
