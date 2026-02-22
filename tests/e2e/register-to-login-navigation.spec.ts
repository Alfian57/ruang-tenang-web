import { expect, test } from "@playwright/test";

test("register page can navigate back to login", async ({ page }) => {
  await page.goto("/register");

  const loginLink = page.getByRole("link", { name: /Login/i }).first();
  await expect(loginLink).toBeVisible();

  await Promise.all([page.waitForURL(/\/login$/, { timeout: 15000 }), loginLink.click()]);
  await expect(page).toHaveURL(/\/login$/);
});
