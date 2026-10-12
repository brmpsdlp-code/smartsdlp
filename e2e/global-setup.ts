import { request } from "@playwright/test";
import { clearAllAuthAttempts } from "./helpers";

export default async function globalSetup() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("E2E global setup cannot clear auth attempts in production.");
  }
  await clearAllAuthAttempts();

  const context = await request.newContext({ baseURL: "http://localhost:3000" });
  try {
    await context.get("/admin/dashboard");
  } finally {
    await context.dispose();
  }
}
