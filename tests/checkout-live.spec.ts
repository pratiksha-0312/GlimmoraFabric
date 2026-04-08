import { test, expect } from "@playwright/test";

test("checkout flow - visible browser test", async ({ page }) => {
  // 1. Login
  await page.goto("http://localhost:3000/login");
  await page.waitForTimeout(2000);

  const usernameInput = page.locator('input[type="text"], input[placeholder*="username" i], input[placeholder*="email" i]').first();
  await usernameInput.fill("tm");
  const passwordInput = page.locator('input[type="password"]').first();
  await passwordInput.fill("1");
  const loginBtn = page.locator('button[type="submit"]').first();
  await loginBtn.click();
  await page.waitForURL("**/dashboard**", { timeout: 10000 });

  // 2. Go to checkout
  await page.goto("http://localhost:3000/checkout");
  await page.waitForTimeout(3000);

  // 3. Select Starter plan
  await page.locator("button:has-text('Starter')").first().click();
  await page.waitForTimeout(500);
  await page.locator("button:has-text('Continue')").first().click();
  await page.waitForTimeout(500);

  // 4. Fill billing
  await page.locator('input[placeholder="John Doe"]').first().fill("Test User");
  await page.locator('input[placeholder="john@company.com"]').first().fill("test@test.com");
  await page.locator('input[placeholder="123 Main Street"]').first().fill("123 Test St");
  await page.locator('input[placeholder="New York"]').first().fill("NYC");
  await page.locator('input[placeholder="10001"]').first().fill("10001");
  await page.locator("button:has-text('Continue')").first().click();
  await page.waitForTimeout(3000);

  // 5. Fill card via Stripe iframe
  const stripeFrame = page.frameLocator("iframe").first();
  const cardInput = stripeFrame.locator('input[name="cardnumber"]');
  await cardInput.waitFor({ timeout: 10000 });
  await cardInput.click();
  await cardInput.fill("4242424242424242");
  await page.waitForTimeout(500);

  const expInput = stripeFrame.locator('input[name="exp-date"]');
  await expInput.fill("1228");
  await page.waitForTimeout(500);

  const cvcInput = stripeFrame.locator('input[name="cvc"]');
  await cvcInput.fill("123");
  await page.waitForTimeout(500);

  const zipInput = stripeFrame.locator('input[name="postal"]');
  if (await zipInput.isVisible()) {
    await zipInput.fill("10001");
  }

  await page.screenshot({ path: "tests/checkout-filled.png", fullPage: true });

  // 6. Click Pay
  await page.locator("button:has-text('Pay')").first().click();

  // Wait for result
  await page.waitForTimeout(10000);
  await page.screenshot({ path: "tests/checkout-result.png", fullPage: true });

  const url = page.url();
  console.log("Final URL:", url);
  console.log("Page title:", await page.title());
  const bodyText = await page.textContent("body");
  console.log("Contains 'success':", bodyText?.toLowerCase().includes("success"));
  console.log("Contains 'error':", bodyText?.toLowerCase().includes("error") || bodyText?.toLowerCase().includes("failed"));
});
