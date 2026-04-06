import { test, expect } from "@playwright/test";

test("Create tenant via modal and verify it appears in list", async ({ page }) => {
  // ── LOGIN ──
  await page.goto("/login");
  await page.waitForTimeout(1000);
  await page.locator('input[type="text"]').fill("superadmin");
  await page.locator('input[type="password"]').fill("1");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.locator('header[role="banner"]').waitFor({ state: "visible", timeout: 15000 });
  await page.waitForTimeout(1000);
  console.log("✅ Logged in");

  // ── NAVIGATE TO TENANTS ──
  await page.locator("nav a, nav button").filter({ hasText: /tenant/i }).first().click();
  await page.waitForTimeout(1000);
  await expect(page).toHaveURL(/\/dashboard\/tenants/);
  console.log("✅ Tenants page loaded");

  // ── VERIFY EMPTY STATE ──
  await expect(page.getByText("No tenants found")).toBeVisible();
  console.log("✅ Empty state shown");

  // ── CLICK CREATE TENANT ──
  await page.getByRole("button", { name: /create tenant/i }).click();
  await page.waitForTimeout(500);
  await expect(page.getByText("Create New Tenant")).toBeVisible();
  console.log("✅ Create modal opened");

  // ── TRY SAVE WITHOUT FILLING (validation test) ──
  await page.getByRole("button", { name: /save/i }).click();
  await page.waitForTimeout(300);
  await expect(page.getByText("Please fix the following errors")).toBeVisible();
  console.log("✅ Validation errors shown");

  // ── FILL FORM ──
  await page.locator('input[placeholder="Enter tenant name"]').fill("Acme Corp");
  await page.locator('input[placeholder="Enter email address"]').fill("admin@acme.com");
  console.log("✅ Form filled");

  // ── SAVE ──
  await page.getByRole("button", { name: /save/i }).click();
  await page.waitForTimeout(500);

  // ── VERIFY MODAL CLOSED ──
  await expect(page.getByText("Create New Tenant")).not.toBeVisible();
  console.log("✅ Modal closed");

  // ── VERIFY TENANT IN LIST ──
  await expect(page.getByText("Acme Corp")).toBeVisible();
  console.log("✅ Tenant 'Acme Corp' appears in list");

  // ── CREATE SECOND TENANT ──
  await page.getByRole("button", { name: /create tenant/i }).click();
  await page.waitForTimeout(500);
  await page.locator('input[placeholder="Enter tenant name"]').fill("Beta Inc");
  await page.locator('input[placeholder="Enter email address"]').fill("admin@beta.com");
  await page.getByRole("button", { name: /save/i }).click();
  await page.waitForTimeout(500);

  // ── VERIFY BOTH IN LIST ──
  await expect(page.getByText("Acme Corp")).toBeVisible();
  await expect(page.getByText("Beta Inc")).toBeVisible();
  console.log("✅ Both tenants visible in list");

  // ── NAVIGATE AWAY AND COME BACK ──
  await page.locator("nav a, nav button").filter({ hasText: /tenant/i }).first().click();
  await page.waitForTimeout(500);
  // Navigate to another page first (e.g., dashboard home)
  await page.goto("/dashboard");
  await page.waitForTimeout(1000);
  // Navigate back to tenants
  await page.locator("nav a, nav button").filter({ hasText: /tenant/i }).first().click();
  await page.waitForTimeout(1000);
  await expect(page).toHaveURL(/\/dashboard\/tenants/);

  // ── VERIFY TENANTS PERSIST AFTER NAVIGATION ──
  await expect(page.getByText("Acme Corp")).toBeVisible();
  await expect(page.getByText("Beta Inc")).toBeVisible();
  console.log("✅ Tenants persist after navigating away and back");

  console.log("\n🎉 ALL TESTS PASSED!");
});
