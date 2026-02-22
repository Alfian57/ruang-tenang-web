import { expect, test } from "@playwright/test";

test("login page can navigate to register", async ({ page }) => {
  await page.goto("/login");

  const registerLink = page.getByRole("link", { name: /Daftar/i }).first();
  await expect(registerLink).toBeVisible();

  await Promise.all([page.waitForURL(/\/register$/, { timeout: 15000 }), registerLink.click()]);
  await expect(page).toHaveURL(/\/register$/);
});
