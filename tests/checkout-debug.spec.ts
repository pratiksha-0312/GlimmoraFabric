import { test, expect } from "@playwright/test";

test("checkout flow - login as tm and test card input", async ({ page }) => {
  // 1. Login
  await page.goto("http://localhost:3000/login");
  await page.waitForLoadState("networkidle");

  // Fill login form
  const usernameInput = page.locator('input[type="text"], input[name="email"], input[placeholder*="username" i], input[placeholder*="email" i]').first();
  await usernameInput.fill("tm");

  const passwordInput = page.locator('input[type="password"]').first();
  await passwordInput.fill("1");

  // Click login button
  const loginBtn = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login"), button:has-text("Log in")').first();
  await loginBtn.click();

  // Wait for redirect to dashboard
  await page.waitForURL("**/dashboard**", { timeout: 10000 });
  console.log("✓ Logged in successfully, redirected to:", page.url());

  // 2. Navigate to checkout
  await page.goto("http://localhost:3000/checkout");
  await page.waitForLoadState("networkidle");
  console.log("✓ Checkout page loaded");

  // 3. Check what's on the page
  const pageContent = await page.textContent("body");
  console.log("Page contains 'Choose Your Plan':", pageContent?.includes("Choose Your Plan"));
  console.log("Page contains 'Stripe':", pageContent?.includes("Stripe"));
  console.log("Page contains 'not configured':", pageContent?.includes("not configured"));

  // 4. Select a plan (Starter - $29)
  const starterPlan = page.locator("button:has-text('Starter')").first();
  if (await starterPlan.isVisible()) {
    await starterPlan.click();
    console.log("✓ Selected Starter plan");
  } else {
    console.log("✗ No plan buttons found");
    // Screenshot for debugging
    await page.screenshot({ path: "tests/checkout-step1.png", fullPage: true });
    return;
  }

  // Click Continue
  const continueBtn = page.locator("button:has-text('Continue')").first();
  await continueBtn.click();
  console.log("✓ Clicked Continue to billing step");

  // 5. Fill billing details
  await page.waitForTimeout(500);

  const fullName = page.locator('input[placeholder="John Doe"]').first();
  if (await fullName.isVisible()) {
    await fullName.fill("Test User");
    await page.locator('input[placeholder="john@company.com"]').first().fill("test@example.com");
    await page.locator('input[placeholder="123 Main Street"]').first().fill("123 Test St");
    await page.locator('input[placeholder="New York"]').first().fill("New York");
    await page.locator('input[placeholder="10001"]').first().fill("10001");
    console.log("✓ Filled billing details");
  } else {
    console.log("✗ Billing form not found");
    await page.screenshot({ path: "tests/checkout-step2.png", fullPage: true });
    return;
  }

  // Click Continue to payment
  const continueBtn2 = page.locator("button:has-text('Continue')").first();
  await continueBtn2.click();
  console.log("✓ Clicked Continue to payment step");

  // 6. Wait for payment step to load
  await page.waitForTimeout(2000);

  // Take screenshot of payment step
  await page.screenshot({ path: "tests/checkout-step3-payment.png", fullPage: true });

  // Check for Stripe iframe
  const stripeIframe = page.frameLocator("iframe[name*='__privateStripeFrame'], iframe[src*='stripe']").first();
  const cardInput = stripeIframe.locator('input[name="cardnumber"], input[placeholder*="card"], input[aria-label*="Card"]').first();

  // Check if stripe iframe exists
  const iframes = await page.locator("iframe").all();
  console.log(`Found ${iframes.length} iframes on page`);

  for (let i = 0; i < iframes.length; i++) {
    const name = await iframes[i].getAttribute("name");
    const src = await iframes[i].getAttribute("src");
    const visible = await iframes[i].isVisible();
    const box = await iframes[i].boundingBox();
    console.log(`  iframe[${i}]: name="${name}", src="${src?.slice(0, 80)}...", visible=${visible}, size=${box?.width}x${box?.height}`);
  }

  // Check if CardElement container exists
  const cardContainer = page.locator(".StripeElement, [class*='StripeElement']").first();
  const containerExists = await cardContainer.count();
  console.log(`StripeElement container found: ${containerExists > 0}`);

  if (containerExists > 0) {
    const box = await cardContainer.boundingBox();
    console.log(`  Container size: ${box?.width}x${box?.height}, position: ${box?.x},${box?.y}`);

    // Check computed styles
    const styles = await cardContainer.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        pointerEvents: cs.pointerEvents,
        opacity: cs.opacity,
        visibility: cs.visibility,
        display: cs.display,
        overflow: cs.overflow,
        zIndex: cs.zIndex,
      };
    });
    console.log("  Container styles:", JSON.stringify(styles));
  }

  // Try to interact with card input in iframe
  try {
    const cardNumberInput = stripeIframe.locator('input[name="cardnumber"]').first();
    await cardNumberInput.waitFor({ timeout: 5000 });
    await cardNumberInput.fill("4242424242424242");
    console.log("✓ Filled card number via Stripe iframe");
  } catch (e) {
    console.log("✗ Could not fill card number:", (e as Error).message?.slice(0, 200));
  }

  // Final screenshot
  await page.screenshot({ path: "tests/checkout-final.png", fullPage: true });
  console.log("✓ Screenshots saved to tests/");
});
