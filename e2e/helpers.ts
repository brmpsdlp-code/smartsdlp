import { expect, type Page } from "@playwright/test";
import { db } from "./db";

export const E2E_PREFIX = "[E2E]";

export function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name} in .env.test`);
  return value;
}

export const testAdmin = () => ({
  email: requiredEnv("TEST_ADMIN_EMAIL"),
  password: requiredEnv("TEST_ADMIN_PASSWORD"),
});

export const testPj = () => ({
  email: requiredEnv("TEST_PJ_EMAIL"),
  password: requiredEnv("TEST_PJ_PASSWORD"),
});

export async function waitBetweenAuthOperations() {
  await new Promise((resolve) => setTimeout(resolve, 1_000));
}

export async function login(page: Page, email: string, password: string) {
  await page.context().clearCookies();
  await page.goto("/login");
  await page.getByLabel("Email Instansi").fill(email);
  await page.getByLabel("Kata Sandi").fill(password);
  await page.getByRole("button", { name: "Masuk ke Sistem" }).click();
  await waitBetweenAuthOperations();
}

export async function loginAdmin(page: Page) {
  const account = testAdmin();
  await login(page, account.email, account.password);
  await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15_000 });
}

export async function loginPj(page: Page) {
  const account = testPj();
  await login(page, account.email, account.password);
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
}

export async function clearAllAuthAttempts() {
  await db("clearAllAuthAttempts");
}

export async function clearPjAuthAttempts() {
  await db("clearPjAuthAttempts", { email: testPj().email });
}

export async function cleanupE2EData() {
  await db("cleanupE2EData", { pjEmail: process.env.TEST_PJ_EMAIL ?? "" });
}

export async function getPjUser() {
  const user = await db<{ id: string; name: string; email: string }>("getPjUser", { email: testPj().email });
  if (!user) throw new Error(`TEST_PJ_EMAIL not found in database: ${testPj().email}`);
  return user;
}

export async function getAdminUser() {
  const user = await db<{ id: string; name: string; email: string; role: string }>("getAdminUser", { email: testAdmin().email });
  if (!user) throw new Error(`TEST_ADMIN_EMAIL not found in database: ${testAdmin().email}`);
  return user;
}

export async function readDeadline() {
  return db<{ reportDeadlineDay: number; reportDeadlineTime: string }>("readDeadline");
}

export async function setDeadline(day: number, time: string) {
  return db<{ reportDeadlineDay: number; reportDeadlineTime: string }>("setDeadline", { day, time });
}

export async function restoreDeadline(settings: { reportDeadlineDay: number; reportDeadlineTime: string }) {
  await db("restoreDeadline", { day: settings.reportDeadlineDay, time: settings.reportDeadlineTime });
}
