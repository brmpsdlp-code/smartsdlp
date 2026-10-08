import { Suspense } from "react";
import { LoginPage } from "@/features/auth/components/login-page";

export default function Page() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-slate-50" />}>
      <LoginPage />
    </Suspense>
  );
}
