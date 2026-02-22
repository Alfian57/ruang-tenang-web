import { expect, test } from "@playwright/test";

test("forgot password can navigate back to login", async ({ page }) => {
  await page.goto("/forgot-password");

  await Promise.all([
    page.waitForURL(/\/login$/, { timeout: 15000 }),
    page.getByRole("link", { name: "Kembali ke Login" }).first().click(),
  ]);

  await expect(page).toHaveURL(/\/login$/);
});
