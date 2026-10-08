import { Suspense } from "react";
import ResetPasswordForm from "./reset-password-form";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="min-h-screen flex items-center justify-center bg-slate-50 p-6">Memuat...</main>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
