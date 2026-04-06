import { test, expect } from "@playwright/test";

test("Create New Tenant – full form test", async ({ page }) => {

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

  // ── NAVIGATE TO TENANTS ─────────────────────────────────────────
  console.log("📄 Navigating to Tenants...");
  await page.locator("nav a, nav button").filter({ hasText: "Tenants" }).first().click();
  await page.waitForTimeout(1500);
  await expect(page).toHaveURL(/\/dashboard\/tenants/);
  console.log("✅ Tenants page loaded\n");

  // ── NAVIGATE TO CREATE TENANT PAGE ──────────────────────────────
  console.log("➕ Opening Create New Tenant page...");
  await page.goto("/dashboard/tenants/create");
  await page.waitForTimeout(1500);
  await expect(page).toHaveURL(/\/dashboard\/tenants\/create/);
  console.log("✅ Create Tenant page loaded\n");

  // ── 1. PAGE STRUCTURE ───────────────────────────────────────────
  console.log("🏗️ Checking page structure...");
  await expect(page.getByRole("heading", { name: /create new tenant/i })).toBeVisible();
  console.log("  ✅ Page heading visible");

  // Section headings
  await expect(page.getByText("Account Information")).toBeVisible();
  await expect(page.getByText("Settings")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Password" })).toBeVisible();
  console.log("  ✅ All section headings visible");

  // ── 2. CUSTOMER CODE (auto-generated, read-only) ───────────────
  console.log("\n🔢 Checking Customer Code...");
  const codeInput = page.locator('input[readonly]').first();
  const codeValue = await codeInput.inputValue();
  expect(codeValue).toMatch(/^GRC_\d{3}$/);
  console.log(`  ✅ Customer Code auto-generated: ${codeValue}`);

  // ── 3. USER ROLE DROPDOWN ───────────────────────────────────────
  console.log("\n👤 Testing User Role dropdown...");
  const roleSelect = page.locator("select").filter({ has: page.locator('option[value="CustomerAdministrator"]') });
  await expect(roleSelect).toBeVisible();
  await roleSelect.selectOption("TenantAdmin");
  console.log("  ✅ User Role changed to TenantAdmin");

  // ── 4. VALIDATION – empty submit ────────────────────────────────
  console.log("\n⚠️ Testing validation...");
  await page.getByRole("button", { name: /create tenant/i }).click();
  await page.waitForTimeout(500);
  await expect(page.getByText("Customer name is required")).toBeVisible();
  await expect(page.getByText("Username is required")).toBeVisible();
  await expect(page.getByText("Email is required")).toBeVisible();
  await expect(page.getByText("Password is required")).toBeVisible();
  console.log("  ✅ All required field errors shown");

  // ── 5. FILL ACCOUNT INFORMATION ─────────────────────────────────
  console.log("\n✏️ Filling account information...");
  await page.locator('input[placeholder="Enter customer name"]').fill("Acme Corporation");
  await page.locator('input[placeholder="Enter username"]').fill("acme_admin");
  await page.locator('input[placeholder="Enter email address"]').fill("admin@acme.com");
  console.log("  ✅ Customer name, username, email filled");

  // ── 6. LANGUAGE & TIMEZONE ──────────────────────────────────────
  console.log("\n🌐 Testing Language & Timezone...");
  const langSelect = page.locator("select").filter({ has: page.locator('option[value="English, United States"]') });
  await langSelect.selectOption("Spanish");
  console.log("  ✅ Language changed to Spanish");

  const tzSelect = page.locator("select").filter({ has: page.locator('option[value="Asia/Kolkata"]') });
  await tzSelect.selectOption("America/New_York");
  console.log("  ✅ Timezone changed to America/New_York");

  // ── 7. RADIO TOGGLES ───────────────────────────────────────────
  console.log("\n🔘 Testing radio toggles...");

  // Blocked – default should be No (false), switch to Yes
  const blockedYes = page.locator('input[name="blocked"][type="radio"]').first();
  await blockedYes.check();
  console.log("  ✅ Blocked set to Yes");

  // Active – default should be Yes (true), verify
  const activeYes = page.locator('input[name="active"][type="radio"]').first();
  await expect(activeYes).toBeChecked();
  console.log("  ✅ Active defaults to Yes");

  // ── 8. PASSWORD ─────────────────────────────────────────────────
  console.log("\n🔒 Testing password fields...");
  await page.locator('input[placeholder="Enter password"]').fill("short");
  await page.locator('input[placeholder="Confirm password"]').fill("short");
  await page.locator('input[placeholder="company.glimmora.io"]').fill("acme.glimmora.io");
  await page.getByRole("button", { name: /create tenant/i }).click();
  await page.waitForTimeout(500);
  await expect(page.getByText("Password must be at least 8 characters")).toBeVisible();
  console.log("  ✅ Short password error shown");

  // Fix password but mismatch
  await page.locator('input[placeholder="Enter password"]').clear();
  await page.locator('input[placeholder="Enter password"]').fill("SecurePass123!");
  await page.getByRole("button", { name: /create tenant/i }).click();
  await page.waitForTimeout(500);
  await expect(page.getByText("Passwords do not match")).toBeVisible();
  console.log("  ✅ Password mismatch error shown");

  // Fix confirm password
  await page.locator('input[placeholder="Confirm password"]').clear();
  await page.locator('input[placeholder="Confirm password"]').fill("SecurePass123!");
  console.log("  ✅ Passwords match");

  // ── 9. PLAN SELECTION ───────────────────────────────────────────
  console.log("\n💳 Testing plan selection...");
  await page.getByRole("button", { name: "Pro" }).click();
  await page.waitForTimeout(300);
  await expect(page.getByText("Up to 200 users")).toBeVisible();
  console.log("  ✅ Pro plan selected");

  await page.getByRole("button", { name: "Enterprise" }).click();
  await page.waitForTimeout(300);
  await expect(page.getByText("Up to 500 users")).toBeVisible();
  console.log("  ✅ Enterprise plan selected");

  // ── 10. SUCCESSFUL SUBMIT ───────────────────────────────────────
  console.log("\n📤 Submitting form...");
  await page.getByRole("button", { name: /create tenant/i }).click();

  // Should show success then redirect back to tenants
  await expect(page.getByText("Tenant Created!").or(page.locator("text=Tenant Management"))).toBeVisible({ timeout: 10000 });
  console.log("  ✅ Form submitted successfully");

  await expect(page).toHaveURL(/\/dashboard\/tenants/, { timeout: 10000 });
  console.log("  ✅ Redirected to Tenants page");

  console.log("\n🎉 CREATE NEW TENANT – ALL TESTS PASSED!");
});
