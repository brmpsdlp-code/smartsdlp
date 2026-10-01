import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextResponse } from "next/server";
import { checkAuthRateLimit, recordAuthAttempt } from "@/lib/auth-rate-limit";

const handler = toNextJsHandler(auth.handler);

export const GET = handler.GET;

export async function POST(request: Request) {
  const url = new URL(request.url);
  const normalizedPath = url.pathname.replace(/\/+/g, "/").toLowerCase().replace(/\/$/, "");
  if (normalizedPath.startsWith("/api/auth/sign-up")) {
    return NextResponse.json(
      { message: "Pendaftaran publik dinonaktifkan. Hubungi administrator." },
      { status: 403 },
    );
  }
  const body = ["/api/auth/sign-in/email", "/api/auth/request-password-reset"].includes(normalizedPath)
    ? await request.clone().json().catch(() => ({}))
    : null;
  if (body?.email) {
    const kind = normalizedPath.endsWith("sign-in/email") ? "LOGIN" : "RESET_PASSWORD";
    const limit = await checkAuthRateLimit(body.email, kind);
    if (!limit.allowed) return NextResponse.json({ message: "Terlalu banyak percobaan, coba lagi nanti.", retryAfterSeconds: limit.retryAfterSeconds }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });
    const response = await handler.POST(request);
    if (!response.ok && kind === "LOGIN") await recordAuthAttempt(body.email, kind);
    if (kind === "RESET_PASSWORD" && response.ok) await recordAuthAttempt(body.email, kind);
    return response;
  }
  return handler.POST(request);
}
