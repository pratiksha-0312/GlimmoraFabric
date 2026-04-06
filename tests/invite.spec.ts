import { test, expect } from "@playwright/test";

test("Users & Access – Invite New User modal", async ({ page }) => {

  // ── LOGIN ────────────────────────────────────────────────────────
  console.log("🔐 Logging in as superadmin...");
  await page.goto("/login");
  await page.waitForTimeout(1500);
  await page.locator('input[type="text"]').fill("superadmin");
  await page.locator('input[type="password"]').fill("1");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.locator('header[role="banner"]').waitFor({ state: "visible", timeout: 15000 });
  await page.waitForTimeout(1500);
  console.log("✅ Dashboard loaded\n");

  // ── NAVIGATE TO USERS & ACCESS ──────────────────────────────────
  console.log("📄 Navigating to Users & Access...");
  await page.locator("nav a, nav button").filter({ hasText: "Users & Access" }).first().click();
  await page.waitForTimeout(1500);
  await expect(page).toHaveURL(/\/dashboard\/identity/);
  console.log("✅ Users & Access page loaded\n");

  // ── 1. OPEN INVITE MODAL ────────────────────────────────────────
  console.log("📨 Opening Invite User modal...");
  await page.getByRole("button", { name: /invite user/i }).click();
  await page.waitForTimeout(500);

  const modal = page.locator(".fixed.inset-0");
  await expect(modal).toBeVisible();
  await expect(modal.getByText("Invite New User")).toBeVisible();
  console.log("  ✅ Modal opened with title 'Invite New User'");

  // ── 2. VALIDATION – empty fields ────────────────────────────────
  console.log("\n⚠️ Testing validation...");
  await modal.getByRole("button", { name: /send invite/i }).click();
  await page.waitForTimeout(300);
  await expect(modal.getByText("Full name is required")).toBeVisible();
  await expect(modal.getByText("Email is required")).toBeVisible();
  console.log("  ✅ Empty name & email errors shown");

  // ── 3. FILL VALID DATA ──────────────────────────────────────────
  console.log("\n✏️ Filling valid invite form...");
  await modal.locator('input[placeholder="e.g. John Doe"]').fill("Jane Smith");
  await modal.locator('input[placeholder="user@company.com"]').fill("jane@glimmora.com");
  console.log("  ✅ Name and email filled");

  // ── 4. SELECT ROLE ──────────────────────────────────────────────
  const roleSelect = modal.locator("select").first();
  await roleSelect.selectOption("auditor");
  console.log("  ✅ Role set to Auditor");

  // ── 5. TOGGLE MFA ───────────────────────────────────────────────
  const mfaButton = modal.getByText("Disabled").first();
  await mfaButton.click();
  await page.waitForTimeout(300);
  await expect(modal.getByText("Enabled")).toBeVisible();
  console.log("  ✅ MFA toggled to Enabled");

  // ── 6. SUBMIT INVITE ────────────────────────────────────────────
  console.log("\n📤 Submitting invite...");
  await modal.getByRole("button", { name: /send invite/i }).click();
  await page.waitForTimeout(500);

  // Modal should close
  await expect(modal.getByText("Invite New User")).not.toBeVisible();
  console.log("  ✅ Modal closed after submit");

  // ── 7. VERIFY USER ADDED TO TABLE ──────────────────────────────
  console.log("\n🔍 Verifying new user in table...");
  await expect(page.getByText("Jane Smith")).toBeVisible();
  await expect(page.getByText("jane@glimmora.com")).toBeVisible();
  console.log("  ✅ Jane Smith appears in user table");
  console.log("  ✅ Email jane@glimmora.com visible");

  // ── 8. CANCEL BUTTON TEST ──────────────────────────────────────
  console.log("\n❌ Testing cancel button...");
  await page.getByRole("button", { name: /invite user/i }).click();
  await page.waitForTimeout(500);
  await expect(modal.getByText("Invite New User")).toBeVisible();
  await modal.getByRole("button", { name: /cancel/i }).click();
  await page.waitForTimeout(300);
  await expect(modal.getByText("Invite New User")).not.toBeVisible();
  console.log("  ✅ Cancel closes the modal");

  console.log("\n🎉 INVITE NEW USER – ALL TESTS PASSED!");
});
