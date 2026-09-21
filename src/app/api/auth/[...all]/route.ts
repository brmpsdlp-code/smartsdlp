import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextResponse } from "next/server";

const handler = toNextJsHandler(auth.handler);

export const GET = handler.GET;

export async function POST(request: Request) {
  const url = new URL(request.url);
  if (url.pathname.endsWith("/sign-up/email")) {
    return NextResponse.json(
      { message: "Pendaftaran publik dinonaktifkan. Hubungi administrator." },
      { status: 403 },
    );
  }
  return handler.POST(request);
}
