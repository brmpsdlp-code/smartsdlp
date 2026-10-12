# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Auth >> user with mustChangePassword is forced to change password
- Location: e2e\auth.spec.ts:40:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/account\/change-password/
Received string:  "http://localhost:3000/login"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    14 × locator resolved to <html lang="id" class="plus_jakarta_sans_9aad3b22-module__T8hHUW__variable h-full antialiased">…</html>
       - unexpected value "http://localhost:3000/login"

```

```yaml
- img "Logo Kementerian Pertanian"
- heading "SMART" [level=1]
- paragraph: Sistem Monitoring, Analisis, Reporting & Tracking
- paragraph: BRMP SDLP · Kementerian Pertanian RI · TA 2026
- text: BRMP SDLP · Kementerian Pertanian RI
- heading "Selamat Datang" [level=2]
- paragraph: Masukkan email dan kata sandi Anda untuk mengakses sistem.
- text: Too many requests. Please try again later. Email Instansi
- textbox "Email Instansi":
  - /placeholder: nama@pertanian.go.id
  - text: e2e-must-change-1791764514221@example.test
- text: Kata Sandi
- textbox "Kata Sandi":
  - /placeholder: ••••••••
  - text: internubsi2026
- button:
  - img
- checkbox "Ingat Saya di perangkat ini" [checked]
- text: Ingat Saya di perangkat ini
- button "Lupa Kata Sandi?"
- button "Masuk ke Sistem"
- text: Tim Pengembang Universitas Bina Sarana Informatika
- region "Notifications alt+T"
- alert
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import { db } from "./db";
  3  | import {
  4  |   clearPjAuthAttempts,
  5  |   cleanupE2EData,
  6  |   getAdminUser,
  7  |   getPjUser,
  8  |   login,
  9  |   loginAdmin,
  10 |   testPj,
  11 |   waitBetweenAuthOperations,
  12 | } from "./helpers";
  13 | 
  14 | const uniqueEmail = () => `e2e-must-change-${Date.now()}@example.test`;
  15 | 
  16 |  test.describe.serial("Auth", () => {
  17 |   test.beforeAll(async () => {
  18 |     await clearPjAuthAttempts();
  19 |   });
  20 | 
  21 |   test.afterEach(async () => {
  22 |     await clearPjAuthAttempts();
  23 |     await cleanupE2EData();
  24 |     await waitBetweenAuthOperations();
  25 |   });
  26 | 
  27 |   test("login valid admin succeeds", async ({ page }) => {
  28 |     await loginAdmin(page);
  29 |     await waitBetweenAuthOperations();
  30 |     await expect(page.getByText("Dashboard", { exact: true }).first()).toBeVisible();
  31 |   });
  32 | 
  33 |   test("login invalid password shows error without locking admin", async ({ page }) => {
  34 |     const account = testPj();
  35 |     await login(page, account.email, `${account.password}-wrong`);
  36 |     await expect(page.getByText(/Email atau kata sandi tidak valid|Invalid email or password/i)).toBeVisible();
  37 |     await clearPjAuthAttempts();
  38 |   });
  39 | 
  40 |   test("user with mustChangePassword is forced to change password", async ({ page }) => {
  41 |     await loginAdmin(page);
  42 |     await waitBetweenAuthOperations();
  43 |     const email = uniqueEmail();
  44 |     const name = "[E2E] Must Change Password";
  45 | 
  46 |     await page.goto("/admin/users");
  47 |     await page.getByRole("button", { name: "Tambah User", exact: true }).click();
  48 |     await page.getByPlaceholder("Nama").fill(name);
  49 |     await page.getByPlaceholder("NIP").fill(`E2E-${Date.now()}`);
  50 |     await page.getByPlaceholder("Email").fill(email);
  51 |     page.once("dialog", (dialog) => dialog.accept());
  52 |     await page.getByRole("button", { name: "Buat User", exact: true }).click();
  53 |     await expect.poll(async () => db<{ mustChangePassword: boolean } | null>("getUserPasswordState", { email })).toMatchObject({ mustChangePassword: true });
  54 | 
  55 |     await page.getByRole("button", { name: "Keluar Sistem", exact: true }).click();
  56 |     await waitBetweenAuthOperations();
  57 |     await expect(page).toHaveURL(/\/login/);
  58 |     await login(page, email, "internubsi2026");
> 59 |     await expect(page).toHaveURL(/\/account\/change-password/);
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  60 | 
  61 |     await page.goto("/dashboard");
  62 |     await expect(page).toHaveURL(/\/account\/change-password/);
  63 |   });
  64 | 
  65 |   test("sixth failed PJ login is rate-limited, never admin", async ({ page }) => {
  66 |     // Deliberately use dedicated TEST_PJ account. Never lock TEST_ADMIN_EMAIL.
  67 |     const account = testPj();
  68 |     await clearPjAuthAttempts();
  69 | 
  70 |     for (let attempt = 1; attempt <= 5; attempt += 1) {
  71 |       await login(page, account.email, `${account.password}-wrong-${attempt}`);
  72 |       await expect(page.getByText(/Email atau kata sandi tidak valid|Invalid email or password/i)).toBeVisible();
  73 |     }
  74 | 
  75 |     await login(page, account.email, `${account.password}-wrong-sixth`);
  76 |     await expect(page.getByText(/Terlalu banyak percobaan|coba lagi/i)).toBeVisible();
  77 |     await expect(page.getByText(/Coba lagi dalam \d+:\d{2}/i)).toBeVisible();
  78 |     await clearPjAuthAttempts();
  79 |   });
  80 | 
  81 |   test("PJ appears in assignment dropdown while admin does not", async ({ page }) => {
  82 |     await loginAdmin(page);
  83 |     await waitBetweenAuthOperations();
  84 |     const pj = await getPjUser();
  85 |     const admin = await getAdminUser();
  86 | 
  87 |     await page.goto("/admin/master");
  88 |     await page.getByRole("button", { name: "Tambah Kegiatan Baru", exact: true }).click();
  89 |     const pjSelect = page.getByLabel("PJ Kegiatan");
  90 |     await expect(pjSelect.locator("option", { hasText: pj.name })).toHaveCount(1);
  91 |     await expect(pjSelect.locator("option", { hasText: admin.name })).toHaveCount(0);
  92 |   });
  93 | });
  94 | 
  95 | 
  96 | 
```