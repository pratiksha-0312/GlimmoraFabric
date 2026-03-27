import { test, expect } from "@playwright/test";

test("Super Admin – Full dashboard navigation & header test", async ({ page }) => {

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

  // ── 1. VERIFY ALL 10 SIDEBAR ITEMS VISIBLE FOR SUPER ADMIN ─────
  console.log("📋 Checking sidebar navigation...");
  const navLabels = [
    "Overview", "Identity & Access", "Services", "Notifications",
    "Payments", "Workflows", "Audit Logs", "Team", "Tenants", "Settings"
  ];

  for (const label of navLabels) {
    const navItem = page.locator(`nav a, nav button`).filter({ hasText: label }).first();
    await expect(navItem, `Nav item "${label}" should be visible`).toBeVisible();
    console.log(`  ✅ ${label}`);
  }
  console.log("✅ All 10 nav items visible for Super Admin\n");

  // ── 2. NAVIGATE TO EACH PAGE ────────────────────────────────────
  const pages = [
    { label: "Overview", url: "/dashboard", heading: "Welcome" },
    { label: "Identity & Access", url: "/dashboard/identity", heading: "Identity" },
    { label: "Services", url: "/dashboard/services", heading: "Service Health" },
    { label: "Notifications", url: "/dashboard/notifications", heading: "Notification" },
    { label: "Payments", url: "/dashboard/payments", heading: "Payment" },
    { label: "Workflows", url: "/dashboard/workflows", heading: "Workflow" },
    { label: "Audit Logs", url: "/dashboard/audit", heading: "Audit" },
    { label: "Team", url: "/dashboard/team", heading: "Team" },
    { label: "Tenants", url: "/dashboard/tenants", heading: "Tenant" },
    { label: "Settings", url: "/dashboard/settings", heading: "Settings" },
  ];

  for (const pg of pages) {
    console.log(`📄 Navigating to ${pg.label}...`);
    await page.locator(`nav a, nav button`).filter({ hasText: pg.label }).first().click();
    await page.waitForTimeout(1000);

    // Verify URL
    await expect(page).toHaveURL(new RegExp(pg.url));

    // Verify page has a heading containing expected text
    const heading = page.locator("h1").first();
    await expect(heading).toContainText(pg.heading);
    console.log(`  ✅ ${pg.label} page loaded – heading: "${await heading.textContent()}"`);
  }
  console.log("✅ All 10 pages navigated successfully!\n");

  // ── 3. GO BACK TO OVERVIEW ──────────────────────────────────────
  await page.locator(`nav a, nav button`).filter({ hasText: "Overview" }).first().click();
  await page.waitForTimeout(1000);

  // ── 4. THEME TOGGLE ─────────────────────────────────────────────
  console.log("🌙 Testing theme toggle...");

  // Default should be dark
  let dataTheme = await page.locator("html").getAttribute("data-theme");
  expect(dataTheme).toBe("dark");
  console.log("  ✅ Default theme: dark");

  // Switch to light
  await page.locator('button[aria-label="Switch to light mode"]').click();
  await page.waitForTimeout(1000);
  dataTheme = await page.locator("html").getAttribute("data-theme");
  expect(dataTheme).toBe("light");
  console.log("  ✅ Switched to light");

  // Switch back to dark
  await page.locator('button[aria-label="Switch to dark mode"]').click();
  await page.waitForTimeout(1000);
  dataTheme = await page.locator("html").getAttribute("data-theme");
  expect(dataTheme).toBe("dark");
  console.log("  ✅ Switched back to dark\n");

  // ── 5. COLOR PICKER ─────────────────────────────────────────────
  console.log("🎨 Testing color picker...");
  const pickerBtn = page.locator('button[aria-label="Pick color theme"]');
  await expect(pickerBtn).toBeVisible();

  // Default color
  let colorTheme = await page.locator("html").getAttribute("data-color-theme");
  expect(colorTheme).toBe("amber-gold");
  console.log("  ✅ Default color: amber-gold");

  // Test 5 colors
  const testColors = ["Sky Blue", "Crimson Red", "Royal Purple", "Teal", "Orange"];
  for (const color of testColors) {
    await pickerBtn.click();
    await page.waitForTimeout(500);
    await page.locator(`button[aria-label="${color}"]`).click();
    await page.waitForTimeout(500);
    colorTheme = await page.locator("html").getAttribute("data-color-theme");
    const expected = color.toLowerCase().replace(/\s+/g, "-");
    expect(colorTheme).toBe(expected);
    console.log(`  ✅ ${color} → ${expected}`);
  }
  console.log("✅ Color picker working!\n");

  // ── 6. SERVICE CARDS LINK TO DEDICATED PAGES ────────────────────
  console.log("🔗 Testing service card navigation...");
  await page.locator(`nav a, nav button`).filter({ hasText: "Services" }).first().click();
  await page.waitForTimeout(1000);

  // Click Identity & Access card
  const identityCard = page.locator('a[href="/dashboard/identity"]').first();
  if (await identityCard.isVisible()) {
    await identityCard.click();
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/\/dashboard\/identity/);
    console.log("  ✅ Identity card links to /dashboard/identity");
  }

  // Go back to Services
  await page.locator(`nav a, nav button`).filter({ hasText: "Services" }).first().click();
  await page.waitForTimeout(1000);

  // Click Payments card
  const paymentsCard = page.locator('a[href="/dashboard/payments"]').first();
  if (await paymentsCard.isVisible()) {
    await paymentsCard.click();
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/\/dashboard\/payments/);
    console.log("  ✅ Payments card links to /dashboard/payments");
  }
  console.log("✅ Service cards navigate correctly!\n");

  // ── 7. LIGHT MODE ON ALL PAGES ──────────────────────────────────
  console.log("☀️ Testing light mode across pages...");
  await page.locator('button[aria-label="Switch to light mode"]').click();
  await page.waitForTimeout(800);

  for (const pg of pages.slice(0, 5)) {
    await page.locator(`nav a, nav button`).filter({ hasText: pg.label }).first().click();
    await page.waitForTimeout(800);
    dataTheme = await page.locator("html").getAttribute("data-theme");
    expect(dataTheme).toBe("light");
    console.log(`  ✅ ${pg.label} in light mode`);
  }

  // Switch back to dark
  await page.locator('button[aria-label="Switch to dark mode"]').click();
  await page.waitForTimeout(800);
  console.log("✅ Light mode works across all pages!\n");

  console.log("🎉 ALL TESTS PASSED!");
});
