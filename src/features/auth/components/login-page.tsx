"use client";

import kemEntanLogo from "@/imports/Kementerian_Pertanian_Kementan_Logo.svg";
import { requestPasswordReset, signIn } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const [retryAfterSeconds, setRetryAfterSeconds] = useState(0);
  const [forgotRetryAfterSeconds, setForgotRetryAfterSeconds] = useState(0);
  const [error, setError] = useState(
    searchParams.get("error") === "inactive"
      ? "Akun tidak aktif. Hubungi administrator."
      : "",
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const logoSrc = (kemEntanLogo as any)?.src || kemEntanLogo;

  useEffect(() => {
    if (retryAfterSeconds <= 0 && forgotRetryAfterSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setRetryAfterSeconds((value) => Math.max(0, value - 1));
      setForgotRetryAfterSeconds((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [retryAfterSeconds, forgotRetryAfterSeconds]);

  const formatCountdown = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  const handleForgotPassword = async () => {
    if (!email.trim()) { setForgotMessage("Masukkan email terlebih dahulu."); return; }
    setForgotLoading(true); setForgotMessage("");
    try {
      const result = await requestPasswordReset({ email: email.trim(), redirectTo: `${window.location.origin}/reset-password` });
      if (result.error) setForgotMessage(result.error.message || "Permintaan reset gagal.");
      else setForgotMessage("Jika email terdaftar, link reset sudah dikirim.");
    } catch (error) {
      const response = error as { retryAfterSeconds?: number };
      if (response.retryAfterSeconds) setForgotRetryAfterSeconds(response.retryAfterSeconds);
      setForgotMessage("Permintaan reset gagal. Coba lagi nanti.");
    } finally { setForgotLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Email instansi dan kata sandi wajib diisi.");
      return;
    }
    setLoading(true);
    try {
      const result = await signIn.email({
        email: email.trim(),
        password: password.trim(),
        rememberMe,
      });

      if (result.error) {
        const details = result.error as typeof result.error & { retryAfterSeconds?: number };
        if (details.retryAfterSeconds) setRetryAfterSeconds(details.retryAfterSeconds);
        setError(result.error.message || "Email atau kata sandi tidak valid.");
        return;
      }
      // Full page reload, bukan client-side navigation — memastikan middleware
      // dan seluruh state (termasuk Router Cache) benar-benar fresh, tidak ada
      // kemungkinan nyangkut di cache navigasi lama dari sebelum login.
      window.location.href = "/";
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 font-sans">
      {/* LEFT: Branding panel */}
      <div className="w-full lg:w-1/2 bg-gov-green flex flex-col items-center justify-center p-6 sm:p-10 relative overflow-hidden text-white min-h-70 lg:min-h-screen">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] bg-size-[20px_20px]" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
          <img
            src={logoSrc}
            alt="Logo Kementerian Pertanian"
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-md brightness-110"
          />

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-[0.2em] text-white uppercase mt-4 mb-2">
            SMART
          </h1>
          <p className="text-xs md:text-sm font-medium text-emerald-100/90 tracking-wide max-w-sm mx-auto">
            Sistem Monitoring, Analisis, Reporting &amp; Tracking
          </p>
          <p className="text-[11px] text-emerald-200/60 tracking-wider uppercase mt-2">
            BRMP SDLP · Kementerian Pertanian RI · TA 2026
          </p>
        </div>

        <div className="relative z-10 mt-6 lg:mt-0 lg:absolute lg:bottom-6 text-center text-xs text-emerald-200/70 tracking-wide font-medium">
          BRMP SDLP · Kementerian Pertanian RI
        </div>
      </div>

      {/* RIGHT: Form login panel */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-10 bg-white relative min-h-120 lg:min-h-screen">
        <div className="w-full max-w-sm space-y-4 my-auto">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              Selamat Datang
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Masukkan email dan kata sandi Anda untuk mengakses sistem.
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md p-2.5">
              {error}
            </div>
          )}

          {retryAfterSeconds > 0 && <p className="text-xs text-rose-700">Coba lagi dalam {formatCountdown(retryAfterSeconds)}</p>}
          {forgotOpen && <div className="rounded-md border border-slate-200 bg-slate-50 p-3 space-y-2"><p className="text-xs text-slate-600">Masukkan email untuk menerima link reset.</p><button type="button" onClick={handleForgotPassword} disabled={forgotLoading || forgotRetryAfterSeconds > 0} className="w-full rounded bg-slate-700 p-2 text-xs text-white disabled:opacity-50">{forgotRetryAfterSeconds > 0 ? `Coba lagi dalam ${formatCountdown(forgotRetryAfterSeconds)}` : forgotLoading ? "Mengirim..." : "Kirim Link Reset"}</button>{forgotMessage && <p className="text-xs text-slate-600">{forgotMessage}</p>}</div>}
          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email Instansi
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@pertanian.go.id"
                autoComplete="email"
                className="w-full h-9 px-3 text-xs sm:text-sm text-slate-800 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gov-green focus:border-gov-green transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full h-9 px-3 pr-10 text-xs sm:text-sm text-slate-800 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gov-green focus:border-gov-green transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  tabIndex={-1}
                >
                  {showPass ? (
                    <svg
                      width={15}
                      height={15}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
                    </svg>
                  ) : (
                    <svg
                      width={15}
                      height={15}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 select-none text-[11px]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-gov-green focus:ring-gov-green cursor-pointer"
                />
                Ingat Saya di perangkat ini
              </label>
              <button
                type="button"
                 onClick={() => { setForgotOpen((value) => !value); setForgotMessage(""); }}
                 className="text-[#143D32] text-[11px] font-semibold hover:underline bg-transparent border-none cursor-pointer p-0"
              >
                Lupa Kata Sandi?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || retryAfterSeconds > 0}
              className="w-full h-9 sm:h-10 bg-[#143D32] hover:bg-[#0F3128] text-white font-semibold rounded-md text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-70 mt-1"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Memproses...
                </span>
              ) : (
                "Masuk ke Sistem"
              )}
            </button>
          </form>
        </div>

        <div className="relative z-10 mt-6 lg:mt-0 lg:absolute lg:bottom-6 text-center text-xs text-slate-400">
          Tim Pengembang Universitas Bina Sarana Informatika
        </div>
      </div>
    </div>
  );
}



