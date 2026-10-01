"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [retryAfterSeconds, setRetryAfterSeconds] = useState(0);
  useEffect(() => { if (retryAfterSeconds <= 0) return; const timer = window.setInterval(() => setRetryAfterSeconds((value) => Math.max(0, value - 1)), 1000); return () => window.clearInterval(timer); }, [retryAfterSeconds]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 429 && data.retryAfterSeconds) setRetryAfterSeconds(data.retryAfterSeconds);
      setMessage(response.ok ? "Password berhasil diubah. Silakan login." : data.message ?? "Link reset tidak valid atau sudah kedaluwarsa.");
    } catch {
      setMessage("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="min-h-screen flex items-center justify-center bg-slate-50 p-6"><form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-lg bg-white p-6 shadow"><h1 className="text-xl font-bold">Reset Kata Sandi</h1><input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Kata sandi baru" className="w-full rounded border p-2" /><button disabled={loading || !token} className="w-full rounded bg-gov-green p-2 text-white disabled:opacity-50">{loading ? "Menyimpan..." : "Simpan Kata Sandi"}</button>{message && <p className="text-sm">{message}</p>}</form></main>;
}
