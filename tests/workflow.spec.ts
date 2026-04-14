import { test, expect } from "@playwright/test";

// Single end-to-end flow: one login, walks the full Workflow & Orchestration feature.
test("Workflow & Orchestration — full flow (workflow_manager)", async ({ page, request }) => {
  // ── 1. LOGIN (once) ───────────────────────────────────────
  console.log("🔐 Login as workflow manager");
  await page.goto("/login");
  await page.waitForTimeout(1000);
  await page.locator('input[type="text"]').fill("wm@gm.com");
  await page.locator('input[type="password"]').fill("1");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.locator('header[role="banner"]').waitFor({ state: "visible", timeout: 15000 });
  console.log("  ✅ Logged in");

  // ── 2. SIDEBAR — Workflow menu children visible ──────────
  console.log("📋 Sidebar workflow menu");
  const workflowToggle = page.locator("nav button").filter({ hasText: /^Workflow$/ }).first();
  if (await workflowToggle.isVisible()) {
    await workflowToggle.click();
    await page.waitForTimeout(400);
  }
  for (const label of ["Workflow Builder", "Active Instances", "SLA Status"]) {
    await expect(page.locator("nav a, nav button").filter({ hasText: label }).first()).toBeVisible();
    console.log(`  ✅ ${label}`);
  }

  // ── 3. WORKFLOW OVERVIEW ─────────────────────────────────
  console.log("📄 Workflow Overview");
  await page.goto("/workflow");
  await page.waitForTimeout(1200);
  await expect(page.locator("h1").first()).toContainText(/Workflow/i);
  console.log("  ✅ Overview loaded");

  // ── 4. SLA STATUS ─────────────────────────────────────────
  console.log("📄 SLA Status");
  await page.goto("/workflow/sla");
  await page.waitForTimeout(1200);
  await expect(page.locator("h1").first()).toContainText(/SLA/i);
  console.log("  ✅ SLA page loaded");

  // ── 5. ACTIVE INSTANCES ───────────────────────────────────
  console.log("📄 Active Instances");
  await page.goto("/workflow/instances");
  await page.waitForTimeout(1200);
  await expect(page.locator("h1").first()).toContainText(/Active Instances/i);
  console.log("  ✅ Instances page loaded");

  // ── 6. OPEN BUILDER ───────────────────────────────────────
  console.log("➕ Open Builder");
  await page.goto("/workflow/builder");
  await page.waitForTimeout(1200);

  await expect(page.getByRole("button", { name: /Validate/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Save Draft/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Publish/i })).toBeVisible();
  console.log("  ✅ Builder toolbar visible");

  // Node palette
  for (const label of ["Start", "Task", "Decision", "End"]) {
    await expect(page.locator(".space-y-2 >> text=" + label).first()).toBeVisible();
  }
  console.log("  ✅ Node palette visible");

  // Default Start node on canvas
  await expect(page.locator(".react-flow__node").first()).toBeVisible();
  console.log("  ✅ Default Start node on canvas");

  // Property panel placeholder
  await expect(page.getByText(/Select a node to edit/i)).toBeVisible();

  // Rename
  await page.locator('input[value="Untitled Workflow"]').fill("PW Test Workflow");
  console.log("  ✅ Renamed");

  // ── 8. VALIDATION (empty workflow fails) ──────────────────
  console.log("✅ Validate (expect errors)");
  await page.getByRole("button", { name: /Validate/i }).click();
  await page.waitForTimeout(500);
  await expect(page.getByText(/Workflow must have an End node/i)).toBeVisible();
  await expect(page.getByText(/needs at least Start, one Task, and End/i)).toBeVisible();
  console.log("  ✅ Validation errors shown");

  // Save Draft blocked
  console.log("💾 Save Draft (should be blocked)");
  await page.getByRole("button", { name: /Save Draft/i }).click();
  await page.waitForTimeout(600);
  await expect(page.getByText(/Workflow saved successfully/i)).not.toBeVisible();
  console.log("  ✅ Save blocked by validation");

  // Select Start node → property editor
  console.log("🖱️  Select Start node");
  await page.locator(".react-flow__node").first().click();
  await page.waitForTimeout(400);
  await expect(page.getByText(/Start Properties/i)).toBeVisible();
  console.log("  ✅ Property editor opens");

  // ── 9. API CRUD (what Save ultimately calls) ──────────────
  console.log("🌐 POST /api/workflows");
  const createRes = await request.post("/api/workflows", {
    data: {
      name: "PW API Workflow",
      status: "Draft",
      nodes: [
        { id: "n1", type: "start", label: "Start", x: 50, y: 200, config: {} },
        { id: "n2", type: "task", label: "Review", x: 250, y: 200, config: { assignee: "QA" } },
        { id: "n3", type: "end", label: "End", x: 450, y: 200, config: {} },
      ],
      edges: [
        { id: "e1", from: "n1", to: "n2" },
        { id: "e2", from: "n2", to: "n3" },
      ],
    },
  });
  expect(createRes.status()).toBe(201);
  const created = await createRes.json();
  expect(created.steps).toBe(3);
  expect(created.status).toBe("Draft");
  console.log(`  ✅ Created ${created.id} (steps=${created.steps})`);

  console.log("🌐 GET /api/workflows");
  const listRes = await request.get("/api/workflows");
  expect(listRes.status()).toBe(200);
  const list = await listRes.json();
  expect(Array.isArray(list)).toBe(true);
  console.log(`  ✅ ${list.length} workflows returned`);

  console.log("🎉 Full workflow flow complete");
});
