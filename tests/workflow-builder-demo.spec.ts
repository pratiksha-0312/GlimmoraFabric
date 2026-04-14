import { test, expect, Page } from "@playwright/test";

// Drag a palette item onto the React Flow canvas using dispatched HTML5 DnD events.
async function dragPaletteToCanvas(page: Page, paletteLabel: string, dropX: number, dropY: number) {
  const palette = page.locator(`div[draggable="true"]:has-text("${paletteLabel}")`).first();
  const canvas = page.locator(".react-flow__pane").first();

  const canvasBox = await canvas.boundingBox();
  if (!canvasBox) throw new Error("canvas not found");

  // Use evaluate to dispatch DnD events with a shared DataTransfer
  await page.evaluate(
    ({ paletteSel, canvasSel, label, x, y }) => {
      const paletteEls = document.querySelectorAll<HTMLElement>(paletteSel);
      let paletteEl: HTMLElement | null = null;
      paletteEls.forEach((el) => {
        if (el.textContent?.includes(label)) paletteEl = el;
      });
      const canvasEl = document.querySelector<HTMLElement>(canvasSel);
      if (!paletteEl || !canvasEl) throw new Error("elements not found");

      const dt = new DataTransfer();
      paletteEl.dispatchEvent(new DragEvent("dragstart", { bubbles: true, dataTransfer: dt }));
      canvasEl.dispatchEvent(new DragEvent("dragenter", { bubbles: true, dataTransfer: dt, clientX: x, clientY: y }));
      canvasEl.dispatchEvent(new DragEvent("dragover", { bubbles: true, dataTransfer: dt, clientX: x, clientY: y }));
      canvasEl.dispatchEvent(new DragEvent("drop", { bubbles: true, dataTransfer: dt, clientX: x, clientY: y }));
      paletteEl.dispatchEvent(new DragEvent("dragend", { bubbles: true, dataTransfer: dt }));
    },
    {
      paletteSel: 'div[draggable="true"]',
      canvasSel: ".react-flow__pane",
      label: paletteLabel,
      x: canvasBox.x + dropX,
      y: canvasBox.y + dropY,
    }
  );
  await page.waitForTimeout(600);
}

test("Workflow Builder — demo (add Task + End, connect, validate)", async ({ page }) => {
  console.log("🔐 Login");
  await page.goto("/login");
  await page.waitForTimeout(800);
  await page.locator('input[type="text"]').fill("wm@gm.com");
  await page.locator('input[type="password"]').fill("1");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.locator('header[role="banner"]').waitFor({ state: "visible", timeout: 15000 });

  console.log("➡️  Open Builder");
  await page.goto("/workflow/builder");
  await page.waitForTimeout(1500);

  // Count initial nodes (should be 1 Start)
  let count = await page.locator(".react-flow__node").count();
  console.log(`  initial nodes: ${count}`);
  expect(count).toBe(1);

  console.log("➕ Drop a Task node");
  await dragPaletteToCanvas(page, "Task", 300, 200);
  count = await page.locator(".react-flow__node").count();
  console.log(`  nodes after Task drop: ${count}`);
  expect(count).toBe(2);

  console.log("➕ Drop an End node");
  await dragPaletteToCanvas(page, "End", 520, 200);
  count = await page.locator(".react-flow__node").count();
  console.log(`  nodes after End drop: ${count}`);
  expect(count).toBe(3);

  // Click the new Task node and rename it
  console.log("✏️  Rename the Task node");
  const taskNode = page.locator(".react-flow__node").nth(1);
  await taskNode.click();
  await page.waitForTimeout(500);
  await expect(page.getByText(/Task Properties/i)).toBeVisible();
  const labelInput = page.locator('label:has-text("Label")').locator("xpath=following-sibling::input").first();
  await labelInput.fill("Review Request");
  console.log("  ✅ renamed to 'Review Request'");

  // Set assignee
  const assigneeInput = page.locator('label:has-text("Assignee")').locator("xpath=following-sibling::input").first();
  await assigneeInput.fill("QA Team");
  console.log("  ✅ assignee = 'QA Team'");

  // Validate (still missing edges, but structure now has Start+Task+End)
  console.log("✅ Click Validate");
  await page.getByRole("button", { name: /Validate/i }).click();
  await page.waitForTimeout(600);

  // Save Draft
  console.log("💾 Save Draft");
  await page.getByRole("button", { name: /Save Draft/i }).click();
  await page.waitForTimeout(1200);
  const savedVisible = await page.getByText(/Workflow saved successfully/i).isVisible().catch(() => false);
  console.log(`  saved banner visible: ${savedVisible}`);

  console.log("🎉 Demo complete — leaving browser open for 8s");
  await page.waitForTimeout(8000);
});
